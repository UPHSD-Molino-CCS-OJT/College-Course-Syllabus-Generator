/**
 * xmlUtils.ts
 *
 * Low-level helpers for parsing Word Open XML (OOXML) content.
 *
 * A .docx file is a ZIP archive. The relevant XML files are:
 *   word/document.xml  — main body content
 *   word/header*.xml   — repeated page headers
 *   word/footer*.xml   — repeated page footers
 *
 * fast-xml-parser is configured with `preserveOrder: true` so that
 * paragraphs and tables appear in their original document order.
 * Each parsed node has the shape:
 *   { "tagName": XNode[], ":@"?: { "@_attrName": "value" } }
 * Text nodes use the special tag name "#text".
 */

import { XMLParser } from "fast-xml-parser";
import type {
  AnchorPositionAxis,
  DocumentBlock,
  DocumentSection,
  EmbeddedObject,
  Image,
  Paragraph,
  ParagraphIndentation,
  ParagraphSpacing,
  Table,
  TableCell,
  TableRow,
  TextRun,
  TextWrap,
} from "./types";

// ---------------------------------------------------------------------------
// Parser setup
// ---------------------------------------------------------------------------

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // Preserves the original element order so paragraphs and tables interleave
  // correctly (important for content that mixes text and tables).
  preserveOrder: true,
  textNodeName: "#text",
});

// ---------------------------------------------------------------------------
// ImageMap — built from ZIP media files and passed down through extraction
// ---------------------------------------------------------------------------

export interface ImageMapEntry {
  /** ZIP entry path, e.g. "word/media/image1.png" */
  filename: string;
  /** MIME type derived from file extension */
  mimeType: string;
  /** Base64 data URL ready for use in an <img> src */
  dataUrl: string;
}

/** Maps a relationship ID (per-part) to its resolved image data. */
export type ImageMap = Record<string, ImageMapEntry>;

/** Maps common image file extensions to MIME types. */
export const MIME_TYPES: Record<string, string> = {
  png:  "image/png",
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  gif:  "image/gif",
  bmp:  "image/bmp",
  svg:  "image/svg+xml",
  webp: "image/webp",
  tiff: "image/tiff",
  tif:  "image/tiff",
  emf:  "image/emf",
  wmf:  "image/wmf",
};

/** Converts English Metric Units (EMU) to points (1 pt = 12700 EMU). */
function emuToPt(emu: number): number {
  return Math.round((emu / 12700) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Generic node helpers (namespace-prefix-aware)
// ---------------------------------------------------------------------------

/** An OOXML node as produced by fast-xml-parser with preserveOrder:true */
export type XNode = Record<string, unknown> & { ":@"?: Record<string, string> };

/** Returns the tag name of a node (the first key that is not ":@"). */
export function tagOf(node: XNode): string {
  for (const key of Object.keys(node)) {
    if (key !== ":@") return key;
  }
  return "";
}

/**
 * Returns the children array of a node.
 * For #text nodes the "children" value is a plain string, not an array,
 * so we guard against that here.
 */
export function childrenOf(node: XNode): XNode[] {
  const tag = tagOf(node);
  if (!tag) return [];
  const value = node[tag];
  return Array.isArray(value) ? (value as XNode[]) : [];
}

/** Returns the attribute map of a node (empty object when absent). */
export function attrsOf(node: XNode): Record<string, string> {
  return node[":@"] ?? {};
}

/** Filters children by tag name. */
export function findChildren(nodes: XNode[], tagName: string): XNode[] {
  return nodes.filter((n) => tagOf(n) === tagName);
}

/** Returns the first child matching a tag name. */
export function firstChild(
  nodes: XNode[],
  tagName: string
): XNode | undefined {
  return nodes.find((n) => tagOf(n) === tagName);
}

/** Reads the text content of a node (only immediate #text children). */
export function textOf(node: XNode): string {
  return childrenOf(node)
    .filter((c) => tagOf(c) === "#text")
    .map((c) => String(c["#text"] ?? ""))
    .join("");
}

/**
 * Recursively searches a node tree for the first node with the given tag name.
 * Useful for locating deeply-nested elements like <a:blip> inside <w:drawing>.
 */
function deepFind(nodes: XNode[], tagName: string): XNode | undefined {
  for (const node of nodes) {
    if (tagOf(node) === tagName) return node;
    const children = childrenOf(node);
    if (children.length > 0) {
      const found = deepFind(children, tagName);
      if (found) return found;
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Image / embedded-object extraction
// ---------------------------------------------------------------------------

/**
 * Extracts image data from a <w:drawing> element.
 *
 * DrawingML structure:
 *   w:drawing
 *     wp:inline | wp:anchor         ← positioning container
 *       wp:extent cx="…" cy="…"    ← dimensions in EMU
 *       wp:docPr descr="alt text"
 *       a:graphic
 *         a:graphicData
 *           pic:pic
 *             pic:blipFill
 *               a:blip r:embed="rId5"   ← image relationship ID
 */
function extractImageFromDrawing(
  drawingNode: XNode,
  imageMap: ImageMap
): Image | null {
  const children = childrenOf(drawingNode);

  const container =
    firstChild(children, "wp:inline") ?? firstChild(children, "wp:anchor");
  if (!container) return null;

  const containerChildren = childrenOf(container);
  const positioning: Image["positioning"] =
    tagOf(container) === "wp:anchor" ? "anchor" : "inline";

  // Dimensions from wp:extent (in EMU)
  const extentNode = firstChild(containerChildren, "wp:extent");
  const cx = extentNode ? Number(attrsOf(extentNode)["@_cx"] ?? 0) : 0;
  const cy = extentNode ? Number(attrsOf(extentNode)["@_cy"] ?? 0) : 0;

  // Alt text from wp:docPr
  const docPrNode = firstChild(containerChildren, "wp:docPr");
  const altText = docPrNode
    ? (attrsOf(docPrNode)["@_descr"] ?? attrsOf(docPrNode)["@_name"] ?? "")
    : "";

  // Deep-find a:blip which carries the r:embed relationship ID
  const blipNode = deepFind(containerChildren, "a:blip");
  if (!blipNode) return null;

  const rId =
    attrsOf(blipNode)["@_r:embed"] ?? attrsOf(blipNode)["@_r:link"] ?? "";
  if (!rId) return null;

  const entry = imageMap[rId];

  // ── Anchor position (wp:anchor only) ────────────────────────────────────
  let anchorPositionH: AnchorPositionAxis | undefined;
  let anchorPositionV: AnchorPositionAxis | undefined;
  let textWrap:        TextWrap           | undefined;
  let behindDoc:       boolean            | undefined;
  let locked:          boolean            | undefined;
  let layoutInCell:    boolean            | undefined;

  if (positioning === "anchor") {
    // ─ wp:anchor attributes ─────────────────────────────────────────────
    const anchorAttrs = attrsOf(container);
    behindDoc    = anchorAttrs["@_behindDoc"]    === "1" || anchorAttrs["@_behindDoc"]    === "true"  || undefined;
    locked       = anchorAttrs["@_locked"]       === "1" || anchorAttrs["@_locked"]       === "true"  || undefined;
    layoutInCell = anchorAttrs["@_layoutInCell"] === "1" || anchorAttrs["@_layoutInCell"] === "true"  || undefined;

    // Per-wrap-type distance attributes live on wp:anchor itself (distT/distB/distL/distR)
    const dT = anchorAttrs["@_distT"] !== undefined ? emuToPt(Number(anchorAttrs["@_distT"])) : undefined;
    const dB = anchorAttrs["@_distB"] !== undefined ? emuToPt(Number(anchorAttrs["@_distB"])) : undefined;
    const dL = anchorAttrs["@_distL"] !== undefined ? emuToPt(Number(anchorAttrs["@_distL"])) : undefined;
    const dR = anchorAttrs["@_distR"] !== undefined ? emuToPt(Number(anchorAttrs["@_distR"])) : undefined;
    const hasDist = dT !== undefined || dB !== undefined || dL !== undefined || dR !== undefined;
    const distancePt = hasDist
      ? {
          ...(dT !== undefined ? { top:    dT } : {}),
          ...(dB !== undefined ? { bottom: dB } : {}),
          ...(dL !== undefined ? { left:   dL } : {}),
          ...(dR !== undefined ? { right:  dR } : {}),
        }
      : undefined;

    // ─ Horizontal position ────────────────────────────────────────────
    const posHNode = firstChild(containerChildren, "wp:positionH");
    if (posHNode) {
      const phChildren = childrenOf(posHNode);
      const alignNode  = firstChild(phChildren, "wp:align");
      const offsetNode = firstChild(phChildren, "wp:posOffset");
      anchorPositionH = {
        relativeTo: attrsOf(posHNode)["@_relativeFrom"] ?? "margin",
        ...(offsetNode ? { offsetPt: emuToPt(Number(textOf(offsetNode))) } : {}),
        ...(alignNode  ? { align: textOf(alignNode) }                      : {}),
      };
    }

    // ─ Vertical position ─────────────────────────────────────────────
    const posVNode = firstChild(containerChildren, "wp:positionV");
    if (posVNode) {
      const pvChildren = childrenOf(posVNode);
      const alignNode  = firstChild(pvChildren, "wp:align");
      const offsetNode = firstChild(pvChildren, "wp:posOffset");
      anchorPositionV = {
        relativeTo: attrsOf(posVNode)["@_relativeFrom"] ?? "margin",
        ...(offsetNode ? { offsetPt: emuToPt(Number(textOf(offsetNode))) } : {}),
        ...(alignNode  ? { align: textOf(alignNode) }                      : {}),
      };
    }

    // ─ Text wrap ───────────────────────────────────────────────────
    const wrapNoneNode    = firstChild(containerChildren, "wp:wrapNone");
    const wrapSquareNode  = firstChild(containerChildren, "wp:wrapSquare");
    const wrapTightNode   = firstChild(containerChildren, "wp:wrapTight");
    const wrapThroughNode = firstChild(containerChildren, "wp:wrapThrough");
    const wrapTABNode     = firstChild(containerChildren, "wp:wrapTopAndBottom");

    /** Helper: extract wrapText side from a wrap element's attrs. */
    const wrapSide = (node: XNode): TextWrap["wrapText"] => {
      const v = attrsOf(node)["@_wrapText"];
      if (v === "left" || v === "right" || v === "largest") return v;
      return "bothSides";
    };

    /** Helper: extract the wp:wrapPolygon points from a tight/through node. */
    const extractPolygon = (node: XNode): TextWrap["wrapPolygon"] => {
      const polyNode = firstChild(childrenOf(node), "wp:wrapPolygon");
      if (!polyNode) return undefined;
      return findChildren(childrenOf(polyNode), "wp:lineTo")
        .map((pt) => ({
          xPt: emuToPt(Number(attrsOf(pt)["@_x"] ?? 0)),
          yPt: emuToPt(Number(attrsOf(pt)["@_y"] ?? 0)),
        }));
    };

    if (wrapNoneNode) {
      textWrap = { type: "none" };
    } else if (wrapSquareNode) {
      textWrap = {
        type: "square",
        wrapText: wrapSide(wrapSquareNode),
        ...(distancePt ? { distancePt } : {}),
      };
    } else if (wrapTightNode) {
      textWrap = {
        type: "tight",
        wrapText: wrapSide(wrapTightNode),
        ...(distancePt ? { distancePt } : {}),
        wrapPolygon: extractPolygon(wrapTightNode),
      };
    } else if (wrapThroughNode) {
      textWrap = {
        type: "through",
        wrapText: wrapSide(wrapThroughNode),
        ...(distancePt ? { distancePt } : {}),
        wrapPolygon: extractPolygon(wrapThroughNode),
      };
    } else if (wrapTABNode) {
      textWrap = {
        type: "topAndBottom",
        ...(distancePt ? { distancePt } : {}),
      };
    } else if (behindDoc !== undefined) {
      // wp:anchor without any explicit wrap child but with behindDoc
      textWrap = { type: "none" };
    }
  }

  return {
    type: "image",
    rId,
    filename: entry?.filename ?? "",
    mimeType: entry?.mimeType ?? "application/octet-stream",
    dataUrl: entry?.dataUrl ?? "",
    widthPt: cx ? emuToPt(cx) : undefined,
    heightPt: cy ? emuToPt(cy) : undefined,
    altText: altText || undefined,
    positioning,
    ...(anchorPositionH !== undefined ? { anchorPositionH }  : {}),
    ...(anchorPositionV !== undefined ? { anchorPositionV }  : {}),
    ...(textWrap        !== undefined ? { textWrap }         : {}),
    ...(behindDoc       !== undefined ? { behindDoc }        : {}),
    ...(locked          !== undefined ? { locked }           : {}),
    ...(layoutInCell    !== undefined ? { layoutInCell }     : {}),
  };
}

/**
 * Extracts image data from a <w:pict> element (legacy VML format).
 *
 * VML structure:
 *   w:pict
 *     v:shape style="width:100pt;height:50pt"
 *       v:imagedata r:id="rId3" o:title="alt text"
 */
function extractVmlImage(
  pictNode: XNode,
  imageMap: ImageMap
): Image | null {
  const imageDataNode = deepFind(childrenOf(pictNode), "v:imagedata");
  if (!imageDataNode) return null;

  const attrs = attrsOf(imageDataNode);
  const rId = attrs["@_r:id"] ?? "";
  if (!rId) return null;

  const entry = imageMap[rId];

  // Attempt to read dimensions from the parent v:shape style attribute
  const shapeNode = firstChild(childrenOf(pictNode), "v:shape");
  let widthPt: number | undefined;
  let heightPt: number | undefined;
  if (shapeNode) {
    const style = attrsOf(shapeNode)["@_style"] ?? "";
    const wMatch = style.match(/width:([\d.]+)pt/);
    const hMatch = style.match(/height:([\d.]+)pt/);
    if (wMatch) widthPt = parseFloat(wMatch[1]);
    if (hMatch) heightPt = parseFloat(hMatch[1]);
  }

  return {
    type: "image",
    rId,
    filename: entry?.filename ?? "",
    mimeType: entry?.mimeType ?? "application/octet-stream",
    dataUrl: entry?.dataUrl ?? "",
    widthPt,
    heightPt,
    altText: attrs["@_o:title"] || undefined,
    positioning: "inline",
  };
}

/**
 * Extracts metadata from a <w:object> element (OLE / embedded object).
 *
 * OLE structure:
 *   w:object
 *     v:shape
 *       v:imagedata r:id="rId2" o:title="thumbnail"
 *     o:OLEObject Type="Embed" ProgID="Excel.Sheet.12" r:id="rId3" ShapeID="…"
 */
function extractOleObject(
  objectNode: XNode,
  imageMap: ImageMap
): EmbeddedObject {
  const children = childrenOf(objectNode);

  const oleNode = deepFind(children, "o:OLEObject");
  const oleAttrs = oleNode ? attrsOf(oleNode) : {};

  // Thumbnail from embedded VML image
  const imageDataNode = deepFind(children, "v:imagedata");
  let thumbnail: EmbeddedObject["thumbnail"];
  if (imageDataNode) {
    const imgRId = attrsOf(imageDataNode)["@_r:id"] ?? "";
    const entry = imgRId ? imageMap[imgRId] : undefined;
    if (entry) {
      thumbnail = {
        rId: imgRId,
        filename: entry.filename,
        mimeType: entry.mimeType,
        dataUrl: entry.dataUrl,
      };
    }
  }

  return {
    type: "object",
    rId: oleAttrs["@_r:id"] || undefined,
    progId: oleAttrs["@_ProgID"] || undefined,
    shapeId: oleAttrs["@_ShapeID"] || undefined,
    thumbnail,
  };
}

// ---------------------------------------------------------------------------
// Run / Paragraph / Table extraction
// ---------------------------------------------------------------------------

/**
 * Checks whether a Run Properties boolean toggle (e.g. w:b, w:i) is
 * genuinely ON.  Word sets w:val="false"|"0" to explicitly turn it OFF.
 */
function isBoolPropOn(rPrChildren: XNode[], tagName: string): boolean {
  const node = findChildren(rPrChildren, tagName)[0];
  if (!node) return false;
  const val = attrsOf(node)["@_w:val"];
  return val !== "false" && val !== "0";
}

function extractRun(runNode: XNode, imageMap: ImageMap = {}): TextRun {
  const children = childrenOf(runNode);
  const rPrNode = firstChild(children, "w:rPr");
  const rPrChildren = rPrNode ? childrenOf(rPrNode) : [];

  // w:t elements hold the visible text
  const text = findChildren(children, "w:t")
    .map((t) => textOf(t))
    .join("");

  const szNode = firstChild(rPrChildren, "w:sz");
  const colorNode = firstChild(rPrChildren, "w:color");

  // ── Image extraction ────────────────────────────────────────────────────
  let image: Image | undefined;

  // 1. DrawingML image (modern, most common)
  const drawingNode = firstChild(children, "w:drawing");
  if (drawingNode) {
    image = extractImageFromDrawing(drawingNode, imageMap) ?? undefined;
  }

  // 2. AlternateContent — modern charts / 3D models with a DrawingML fallback
  if (!image) {
    const altContentNode = firstChild(children, "mc:AlternateContent");
    if (altContentNode) {
      // Prefer mc:Choice (highest fidelity), then mc:Fallback
      const choice = firstChild(childrenOf(altContentNode), "mc:Choice");
      const fallback = firstChild(childrenOf(altContentNode), "mc:Fallback");
      const target = choice ?? fallback;
      if (target) {
        const nestedDrawing = deepFind(childrenOf(target), "w:drawing");
        if (nestedDrawing) {
          image = extractImageFromDrawing(nestedDrawing, imageMap) ?? undefined;
        }
      }
    }
  }

  // 3. Legacy VML picture via w:pict
  if (!image) {
    const pictNode = firstChild(children, "w:pict");
    if (pictNode) {
      image = extractVmlImage(pictNode, imageMap) ?? undefined;
    }
  }

  return {
    text,
    bold: isBoolPropOn(rPrChildren, "w:b"),
    italic: isBoolPropOn(rPrChildren, "w:i"),
    underline: findChildren(rPrChildren, "w:u").length > 0,
    fontSize: szNode
      ? Number(attrsOf(szNode)["@_w:val"]) / 2
      : undefined,
    color: colorNode ? attrsOf(colorNode)["@_w:val"] : undefined,
    image,
  };
}

function extractParagraph(
  paraNode: XNode,
  imageMap: ImageMap = {}
): Paragraph {
  const children = childrenOf(paraNode);
  const pPrNode = firstChild(children, "w:pPr");
  const pPrChildren = pPrNode ? childrenOf(pPrNode) : [];

  const runs: TextRun[] = [];
  const embeddedObjects: EmbeddedObject[] = [];

  for (const child of children) {
    const tag = tagOf(child);

    if (tag === "w:r") {
      runs.push(extractRun(child, imageMap));

      // OLE objects sit as w:object inside w:r
      const objectNode = firstChild(childrenOf(child), "w:object");
      if (objectNode) embeddedObjects.push(extractOleObject(objectNode, imageMap));

    } else if (tag === "w:hyperlink" || tag === "w:ins") {
      // Hyperlinks and tracked insertions wrap w:r elements
      for (const inner of childrenOf(child)) {
        if (tagOf(inner) === "w:r") runs.push(extractRun(inner, imageMap));
      }
    } else if (tag === "w:sdt") {
      // Inline structured document tag (content control) — extract its runs
      const content = firstChild(childrenOf(child), "w:sdtContent");
      if (content) {
        for (const sdtChild of childrenOf(content)) {
          if (tagOf(sdtChild) === "w:r") runs.push(extractRun(sdtChild, imageMap));
        }
      }
    }
  }

  const images = runs.filter((r) => r.image).map((r) => r.image!);
  const styleNode = firstChild(pPrChildren, "w:pStyle");
  const jcNode = firstChild(pPrChildren, "w:jc");

  // ── Indentation (w:ind) ──────────────────────────────────────────────────
  const indNode = firstChild(pPrChildren, "w:ind");
  let indentation: ParagraphIndentation | undefined;
  if (indNode) {
    const ia = attrsOf(indNode);
    const leftPt      = ia["@_w:left"]      ? Number(ia["@_w:left"])      / 20 : undefined;
    const rightPt     = ia["@_w:right"]     ? Number(ia["@_w:right"])     / 20 : undefined;
    const firstLine   = ia["@_w:firstLine"] ? Number(ia["@_w:firstLine"]) / 20 : undefined;
    const hanging     = ia["@_w:hanging"]   ? Number(ia["@_w:hanging"])   / 20 : undefined;
    const firstLinePt = firstLine ?? (hanging !== undefined ? -hanging : undefined);
    if (leftPt !== undefined || rightPt !== undefined || firstLinePt !== undefined) {
      indentation = {
        ...(leftPt      !== undefined ? { leftPt }      : {}),
        ...(rightPt     !== undefined ? { rightPt }     : {}),
        ...(firstLinePt !== undefined ? { firstLinePt } : {}),
      };
    }
  }

  // ── Spacing (w:spacing) ──────────────────────────────────────────────────
  const spacingNode = firstChild(pPrChildren, "w:spacing");
  let spacing: ParagraphSpacing | undefined;
  if (spacingNode) {
    const sa = attrsOf(spacingNode);
    const beforePt  = sa["@_w:before"] !== undefined ? Number(sa["@_w:before"]) / 20 : undefined;
    const afterPt   = sa["@_w:after"]  !== undefined ? Number(sa["@_w:after"])  / 20 : undefined;
    const lineValue = sa["@_w:line"]   !== undefined ? Number(sa["@_w:line"])        : undefined;
    const lineRule  = (sa["@_w:lineRule"] as ParagraphSpacing["lineRule"]) ?? (lineValue !== undefined ? "auto" : undefined);
    if (beforePt !== undefined || afterPt !== undefined || lineValue !== undefined) {
      spacing = {
        ...(beforePt  !== undefined ? { beforePt }  : {}),
        ...(afterPt   !== undefined ? { afterPt }   : {}),
        ...(lineValue !== undefined ? { lineValue } : {}),
        ...(lineRule  !== undefined ? { lineRule }  : {}),
      };
    }
  }

  return {
    type: "paragraph",
    runs,
    text: runs.map((r) => r.text).join(""),
    style: styleNode ? attrsOf(styleNode)["@_w:val"] : undefined,
    alignment: jcNode ? attrsOf(jcNode)["@_w:val"] : undefined,
    images,
    ...(embeddedObjects.length > 0 ? { embeddedObjects } : {}),
    ...(indentation ? { indentation } : {}),
    ...(spacing     ? { spacing }     : {}),
  };
}

function extractTable(tblNode: XNode, imageMap: ImageMap = {}): Table {
  // ── Table-level properties (w:tblPr) ────────────────────────────────────
  const tblChildren = childrenOf(tblNode);
  const tblPrNode = firstChild(tblChildren, "w:tblPr");
  const tblPrChildren = tblPrNode ? childrenOf(tblPrNode) : [];
  const tblWNode     = firstChild(tblPrChildren, "w:tblW");
  const tblJcNode    = firstChild(tblPrChildren, "w:jc");
  const tblStyleNode = firstChild(tblPrChildren, "w:tblStyle");

  let tableWidthPt: number | undefined;
  if (tblWNode) {
    const wa = attrsOf(tblWNode);
    const w  = Number(wa["@_w:w"] ?? 0);
    if ((wa["@_w:type"] ?? "dxa") === "dxa" && w > 0) tableWidthPt = w / 20;
  }
  const tableAlignment = tblJcNode    ? attrsOf(tblJcNode)["@_w:val"]    : undefined;
  const tableStyle     = tblStyleNode ? attrsOf(tblStyleNode)["@_w:val"] : undefined;

  const rows: TableRow[] = [];

  for (const child of tblChildren) {
    if (tagOf(child) !== "w:tr") continue;

    const cells: TableCell[] = [];
    for (const trChild of childrenOf(child)) {
      if (tagOf(trChild) !== "w:tc") continue;

      // ── Cell-level properties (w:tcPr) ──────────────────────────────────
      const trChildren  = childrenOf(trChild);
      const tcPrNode    = firstChild(trChildren, "w:tcPr");
      const tcPrChildren = tcPrNode ? childrenOf(tcPrNode) : [];
      const tcWNode      = firstChild(tcPrChildren, "w:tcW");
      const gridSpanNode = firstChild(tcPrChildren, "w:gridSpan");
      const vMergeNode   = firstChild(tcPrChildren, "w:vMerge");

      let cellWidthPt: number | undefined;
      if (tcWNode) {
        const wa = attrsOf(tcWNode);
        const w  = Number(wa["@_w:w"] ?? 0);
        if ((wa["@_w:type"] ?? "dxa") === "dxa" && w > 0) cellWidthPt = w / 20;
      }
      const gridSpan = gridSpanNode ? Number(attrsOf(gridSpanNode)["@_w:val"]) : undefined;
      let vMerge: TableCell["vMerge"];
      if (vMergeNode) {
        const val = attrsOf(vMergeNode)["@_w:val"];
        vMerge = val === "restart" ? "restart" : "continue";
      }

      const paragraphs: Paragraph[] = [];
      for (const tcChild of trChildren) {
        if (tagOf(tcChild) === "w:p")
          paragraphs.push(extractParagraph(tcChild, imageMap));
      }

      cells.push({
        paragraphs,
        text: paragraphs.map((p) => p.text).join("\n"),
        ...(cellWidthPt !== undefined                  ? { widthPt: cellWidthPt } : {}),
        ...(gridSpan   !== undefined && gridSpan > 1   ? { gridSpan }             : {}),
        ...(vMerge     !== undefined                   ? { vMerge }               : {}),
      });
    }
    rows.push({ cells });
  }

  return {
    type: "table",
    rows,
    text: rows
      .map((r) => r.cells.map((c) => c.text).join("\t"))
      .join("\n"),
    ...(tableWidthPt  !== undefined ? { widthPt: tableWidthPt }    : {}),
    ...(tableAlignment              ? { alignment: tableAlignment } : {}),
    ...(tableStyle                  ? { style: tableStyle }         : {}),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Parses an XML string and returns the top-level node array. */
export function parseXml(xml: string): XNode[] {
  return parser.parse(xml) as XNode[];
}

/**
 * Walks an array of sibling XNodes and converts each w:p, w:tbl, and w:sdt
 * into DocumentBlocks, preserving their original order.
 *
 * @param nodes    - Sibling body/header/footer nodes from parsed XML.
 * @param imageMap - Per-part map of rId → image data (built from .rels files).
 */
export function extractSection(
  nodes: XNode[],
  imageMap: ImageMap = {}
): DocumentSection {
  const blocks: DocumentBlock[] = [];

  function processNodes(list: XNode[]) {
    for (const node of list) {
      const tag = tagOf(node);

      if (tag === "w:p") {
        blocks.push(extractParagraph(node, imageMap));

      } else if (tag === "w:tbl") {
        blocks.push(extractTable(node, imageMap));

      } else if (tag === "w:sdt") {
        // Block-level structured document tags — unwrap and recurse
        const content = firstChild(childrenOf(node), "w:sdtContent");
        if (content) processNodes(childrenOf(content));
      }
    }
  }

  processNodes(nodes);

  // Flatten all images from every block for convenient section-level access
  const images: Image[] = [];
  for (const block of blocks) {
    if (block.type === "paragraph") {
      images.push(...block.images);
    } else if (block.type === "table") {
      for (const row of block.rows) {
        for (const cell of row.cells) {
          for (const para of cell.paragraphs) {
            images.push(...para.images);
          }
        }
      }
    }
  }

  return {
    blocks,
    text: blocks.map((b) => b.text).join("\n"),
    images,
  };
}
