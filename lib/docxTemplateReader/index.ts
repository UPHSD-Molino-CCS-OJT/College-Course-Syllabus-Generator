/**
 * docxTemplateReader — index.ts
 *
 * Reads a Microsoft Word (.docx) file and extracts three logical sections:
 *
 *  • header  — the repeating page header (or null when absent)
 *  • content — the main body of the document
 *  • footer  — the repeating page footer (or null when absent)
 *
 * A .docx file is a ZIP archive (Open Packaging Convention).  The entry
 * points relevant to us are:
 *
 *   word/document.xml             — body content + section properties
 *   word/_rels/document.xml.rels  — relationship map (rId → filename)
 *   word/header{n}.xml            — header part(s)
 *   word/footer{n}.xml            — footer part(s)
 *
 * Usage
 * -----
 *   import { readDocxTemplate } from "@/lib/docxTemplateReader";
 *
 *   const data = await readDocxTemplate(buffer);
 *   console.log(data.header?.text);
 *   console.log(data.content.text);
 *   console.log(data.footer?.text);
 */

import PizZip from "pizzip";
import { parseXml, extractSection, tagOf, childrenOf, attrsOf, firstChild, findChildren, MIME_TYPES } from "./xmlUtils";
import type { DocxTemplateData, DocumentSection, PageSettings, PageSize, PageMargins, PageColumns, PageNumbering } from "./types";
import type { XNode, ImageMap } from "./xmlUtils";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Normalises a path string, resolving ".." segments.
 * e.g. "word/../media/image1.png" → "word/media/image1.png"
 */
function normalizePath(path: string): string {
  const parts = path.split("/");
  const out: string[] = [];
  for (const p of parts) {
    if (p === "..") out.pop();
    else if (p !== "." && p !== "") out.push(p);
  }
  return out.join("/");
}

/**
 * Builds an ImageMap for a specific .docx part by reading its .rels file
 * and loading each referenced media file from the ZIP as a base64 data URL.
 *
 * @param partFilename - e.g. "word/document.xml" or "word/header1.xml"
 * @param zip          - The open PizZip instance for the .docx
 */
function buildImageMapForPart(partFilename: string, zip: PizZip): ImageMap {
  const lastSlash = partFilename.lastIndexOf("/");
  const dir = lastSlash >= 0 ? partFilename.slice(0, lastSlash) : "";
  const file = partFilename.slice(lastSlash + 1);
  const relsFilename = dir ? `${dir}/_rels/${file}.rels` : `_rels/${file}.rels`;

  const relsXml = zip.files[relsFilename]?.asText();
  if (!relsXml) return {};

  const imageMap: ImageMap = {};
  const parsed = parseXml(relsXml);
  const relsRoot = parsed.find((n) => tagOf(n) === "Relationships");
  if (!relsRoot) return imageMap;

  for (const child of childrenOf(relsRoot)) {
    if (tagOf(child) !== "Relationship") continue;
    const attrs = attrsOf(child);
    const rId = attrs["@_Id"] ?? "";
    const type = attrs["@_Type"] ?? "";
    const target = attrs["@_Target"] ?? "";

    if (!rId || !type.toLowerCase().includes("image")) continue;

    // Resolve the target path relative to the part's directory
    const filename = normalizePath(dir ? `${dir}/${target}` : target);
    const zipEntry = zip.files[filename];
    if (!zipEntry) continue;

    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const mimeType = MIME_TYPES[ext] ?? "application/octet-stream";
    // asBinary() returns a binary string; convert via Buffer for base64 encoding
    const base64 = Buffer.from(zipEntry.asBinary(), "binary").toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;
    imageMap[rId] = { filename, mimeType, dataUrl };
  }

  return imageMap;
}

/**
 * Finds the direct-child nodes of the "body" element for
 * word/document.xml (rootTag = "w:document"), or the direct children
 * of a header/footer root (rootTag = "w:hdr" | "w:ftr").
 */
function getPartNodes(xmlContent: string, rootTag: string): XNode[] {
  const parsed = parseXml(xmlContent);

  // Top-level nodes include the XML declaration; find the root element.
  const rootNode = parsed.find((n) => tagOf(n) === rootTag);
  if (!rootNode) return [];

  const rootChildren = childrenOf(rootNode);

  // Document body is wrapped in an additional <w:body> element.
  if (rootTag === "w:document") {
    const bodyNode = firstChild(rootChildren, "w:body");
    if (!bodyNode) return [];
    return childrenOf(bodyNode);
  }

  return rootChildren;
}

/** Parses a single XML part and returns a DocumentSection. */
function parseSection(
  xmlContent: string,
  rootTag: string,
  imageMap: ImageMap = {}
): DocumentSection {
  const nodes = getPartNodes(xmlContent, rootTag);
  return extractSection(nodes, imageMap);
}

// ---------------------------------------------------------------------------
// Relationship map
// ---------------------------------------------------------------------------

interface RelationshipMap {
  /** rId → { type, filename } */
  [rId: string]: { type: string; filename: string };
}

/**
 * Parses word/_rels/document.xml.rels and builds a map from
 * relationship ID to { type, filename }.
 */
function parseRelationships(relsXml: string): RelationshipMap {
  const map: RelationshipMap = {};
  const parsed = parseXml(relsXml);

  const relsRoot = parsed.find((n) => tagOf(n) === "Relationships");
  if (!relsRoot) return map;

  for (const child of childrenOf(relsRoot)) {
    if (tagOf(child) !== "Relationship") continue;
    const attrs = attrsOf(child);
    const id = attrs["@_Id"] ?? "";
    const type = attrs["@_Type"] ?? "";
    const target = attrs["@_Target"] ?? "";
    if (id) map[id] = { type, filename: `word/${target}` };
  }

  return map;
}

// ---------------------------------------------------------------------------
// Section-property (sectPr) parsing — determines header/footer types
// ---------------------------------------------------------------------------

type HeaderFooterType = "default" | "odd" | "first" | "even";

interface SectPrRefs {
  headers: { type: HeaderFooterType; rId: string }[];
  footers: { type: HeaderFooterType; rId: string }[];
}

/**
 * Reads the <w:sectPr> element from the document body nodes and extracts
 * all header/footer relationship references with their declared types.
 */
function parseSectPrRefs(bodyNodes: XNode[]): SectPrRefs {
  const result: SectPrRefs = { headers: [], footers: [] };

  const sectPrNode = bodyNodes.find((n) => tagOf(n) === "w:sectPr");
  if (!sectPrNode) return result;

  for (const child of childrenOf(sectPrNode)) {
    const tag = tagOf(child);
    const attrs = attrsOf(child);
    const rawType = (attrs["@_w:type"] ?? "default") as HeaderFooterType;
    const rId = attrs["@_r:id"] ?? "";

    if (!rId) continue;

    if (tag === "w:headerReference") {
      result.headers.push({ type: rawType, rId });
    } else if (tag === "w:footerReference") {
      result.footers.push({ type: rawType, rId });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Page settings (from w:sectPr)
// ---------------------------------------------------------------------------

/**
 * Parses the <w:sectPr> element from the document body nodes and extracts
 * page layout settings: page size, margins, column layout, and page numbering.
 * Returns undefined when sectPr or its required w:pgSz child is absent.
 */
function parsePageSettings(bodyNodes: XNode[]): PageSettings | undefined {
  const sectPrNode = bodyNodes.find((n) => tagOf(n) === "w:sectPr");
  if (!sectPrNode) return undefined;

  const children = childrenOf(sectPrNode);

  // ── Page size (w:pgSz) — required ────────────────────────────────────────
  const pgSzNode = firstChild(children, "w:pgSz");
  if (!pgSzNode) return undefined;

  const pgSz = attrsOf(pgSzNode);
  const wTwips = Number(pgSz["@_w:w"] ?? 12240);
  const hTwips = Number(pgSz["@_w:h"] ?? 15840);
  const orientation: PageSize["orientation"] = pgSz["@_w:orient"]
    ? (pgSz["@_w:orient"] as PageSize["orientation"])
    : wTwips > hTwips ? "landscape" : "portrait";

  const size: PageSize = {
    widthPt:  wTwips / 20,
    heightPt: hTwips / 20,
    orientation,
  };

  // ── Page margins (w:pgMar) ───────────────────────────────────────
  const pgMarNode = firstChild(children, "w:pgMar");
  const pgMar = pgMarNode ? attrsOf(pgMarNode) : {};
  const margins: PageMargins = {
    topPt:    Number(pgMar["@_w:top"]    ?? 1440) / 20,
    bottomPt: Number(pgMar["@_w:bottom"] ?? 1440) / 20,
    leftPt:   Number(pgMar["@_w:left"]   ?? 1800) / 20,
    rightPt:  Number(pgMar["@_w:right"]  ?? 1800) / 20,
    headerPt: Number(pgMar["@_w:header"] ??  708) / 20,
    footerPt: Number(pgMar["@_w:footer"] ??  708) / 20,
    gutterPt: Number(pgMar["@_w:gutter"] ??    0) / 20,
  };

  // ── Columns (w:cols) ─────────────────────────────────────────────
  const colsNode = firstChild(children, "w:cols");
  let columns: PageColumns | undefined;
  if (colsNode) {
    const ca = attrsOf(colsNode);
    const count = Number(ca["@_w:num"] ?? 1);
    const spaceTwips = ca["@_w:space"] !== undefined ? Number(ca["@_w:space"]) : undefined;
    columns = {
      count,
      ...(spaceTwips !== undefined ? { spacingPt: spaceTwips / 20 } : {}),
    };
  }

  // ── Page numbering (w:pgNumType) ──────────────────────────────────
  const pgNumNode = firstChild(children, "w:pgNumType");
  let pageNumbering: PageNumbering | undefined;
  if (pgNumNode) {
    const pa = attrsOf(pgNumNode);
    pageNumbering = {
      ...(pa["@_w:start"] !== undefined ? { start: Number(pa["@_w:start"]) } : {}),
      ...(pa["@_w:fmt"]                 ? { format: pa["@_w:fmt"] }           : {}),
    };
  }

  return {
    size,
    margins,
    ...(columns       ? { columns }       : {}),
    ...(pageNumbering ? { pageNumbering } : {}),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Reads a .docx file from the given Buffer and extracts:
 *   - header  : default (odd-page) repeating header section
 *   - content : main document body
 *   - footer  : default (odd-page) repeating footer section
 *
 * Additionally populates `firstPageHeader`, `firstPageFooter`,
 * `evenPageHeader`, and `evenPageFooter` when those parts exist.
 *
 * @param buffer - Raw binary content of the .docx file.
 * @throws {Error} if the buffer is not a valid .docx file.
 */
export async function readDocxTemplate(
  buffer: Buffer
): Promise<DocxTemplateData> {
  // ── 1. Open the ZIP archive ─────────────────────────────────────────────
  let zip: PizZip;
  try {
    zip = new PizZip(buffer);
  } catch {
    throw new Error(
      "Could not open file as a ZIP archive. Make sure the file is a valid .docx."
    );
  }

  // ── 2. Read the main document XML ───────────────────────────────────────
  const documentXml = zip.files["word/document.xml"]?.asText();
  if (!documentXml) {
    throw new Error("Invalid .docx file: missing word/document.xml");
  }

  // ── 3. Build image map for the document body part ───────────────────────
  const documentImageMap = buildImageMapForPart("word/document.xml", zip);

  const content = parseSection(documentXml, "w:document", documentImageMap);

  // ── 4. Build the relationship map (for header/footer part resolution) ───
  const relsXml = zip.files["word/_rels/document.xml.rels"]?.asText();
  const relMap = relsXml ? parseRelationships(relsXml) : {};

  // ── 5. Determine header/footer part files via sectPr ────────────────────
  const bodyNodes = getPartNodes(documentXml, "w:document");
  const sectRefs = parseSectPrRefs(bodyNodes);  const pageSettings = parsePageSettings(bodyNodes);
  /**
   * Reads, parses, and returns a ZIP part as a DocumentSection.
   * Automatically builds the per-part image map.
   */
  const readPart = (
    filename: string,
    rootTag: string
  ): DocumentSection | null => {
    const xml = zip.files[filename]?.asText();
    if (!xml) return null;
    const imageMap = buildImageMapForPart(filename, zip);
    return parseSection(xml, rootTag, imageMap);
  };

  // ── 5. Resolve each header/footer reference ──────────────────────────────
  let header: DocumentSection | null = null;
  let firstPageHeader: DocumentSection | undefined;
  let evenPageHeader: DocumentSection | undefined;

  for (const { type, rId } of sectRefs.headers) {
    const rel = relMap[rId];
    if (!rel) continue;
    const section = readPart(rel.filename, "w:hdr");
    if (!section) continue;

    if (type === "default" || type === "odd") header = section;
    else if (type === "first") firstPageHeader = section;
    else if (type === "even") evenPageHeader = section;
  }

  let footer: DocumentSection | null = null;
  let firstPageFooter: DocumentSection | undefined;
  let evenPageFooter: DocumentSection | undefined;

  for (const { type, rId } of sectRefs.footers) {
    const rel = relMap[rId];
    if (!rel) continue;
    const section = readPart(rel.filename, "w:ftr");
    if (!section) continue;

    if (type === "default" || type === "odd") footer = section;
    else if (type === "first") firstPageFooter = section;
    else if (type === "even") evenPageFooter = section;
  }

  // ── 6. Fallback: scan ZIP entries when sectPr references are missing ─────
  if (!header) {
    const fallbackFile = Object.keys(zip.files).find((f) =>
      /^word\/header\d+\.xml$/.test(f)
    );
    if (fallbackFile) header = readPart(fallbackFile, "w:hdr");
  }

  if (!footer) {
    const fallbackFile = Object.keys(zip.files).find((f) =>
      /^word\/footer\d+\.xml$/.test(f)
    );
    if (fallbackFile) footer = readPart(fallbackFile, "w:ftr");
  }

  // ── 7. Assemble result ───────────────────────────────────────────────────
  return {
    header,
    content,
    footer,
    ...(firstPageHeader ? { firstPageHeader } : {}),
    ...(firstPageFooter ? { firstPageFooter } : {}),
    ...(evenPageHeader ? { evenPageHeader } : {}),
    ...(evenPageFooter ? { evenPageFooter } : {}),    ...(pageSettings   ? { pageSettings }   : {}),  };
}

// Re-export types so consumers only need one import path.
export type { DocxTemplateData, DocumentSection, DocumentBlock, Paragraph, Table, TextRun, Image, EmbeddedObject } from "./types";
export type { ImageMap, ImageMapEntry } from "./xmlUtils";
