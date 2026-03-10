/**
 * Text-wrapping style and side for a floating (anchor) image.
 * Maps directly to the `wp:wrap*` child element of `wp:anchor`.
 */
export interface TextWrap {
  /**
   * The Word wrapping mode:
   *   "none"         — no wrap; image floats in front of or behind text (see `behindDoc`)
   *   "square"       — square bounding-box wrap
   *   "tight"        — tight contour wrap following the image shape
   *   "through"      — like tight but text can flow through transparent areas
   *   "topAndBottom" — text appears only above and below the image
   */
  type: "none" | "square" | "tight" | "through" | "topAndBottom";
  /**
   * Which side(s) of the image text wraps around.
   * Present for "square", "tight", and "through" wrap types.
   *   "bothSides" | "left" | "right" | "largest"
   */
  wrapText?: "bothSides" | "left" | "right" | "largest";
  /**
   * Extra space (in points) between the image bounding box and the text for
   * "square", "tight", and "through" wrap.  Converted from EMU ÷ 12700.
   */
  distancePt?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  /**
   * Normalised contour polygon for "tight" and "through" wrap types.
   * Each point is in points relative to the image's top-left corner.
   * Converted from EMU ÷ 12700.
   */
  wrapPolygon?: Array<{ xPt: number; yPt: number }>;
}

/**
 * Anchor position for a floating image on a single axis (horizontal or vertical).
 * Present only on images whose `positioning` is "anchor".
 */
export interface AnchorPositionAxis {
  /**
   * What the position is measured relative to.
   * Horizontal values: "margin" | "page" | "column" | "character" | "insideMargin" | "outsideMargin"
   * Vertical values:   "margin" | "page" | "paragraph" | "line" | "topMargin" | "bottomMargin"
   */
  relativeTo: string;
  /** Absolute offset in points from the reference edge (converted from EMU ÷ 12700). */
  offsetPt?: number;
  /** Keyword alignment used instead of a numeric offset, e.g. "left" | "center" | "right" | "top" | "bottom" | "inside" | "outside". */
  align?: string;
}

/**
 * An image extracted from a w:drawing (DrawingML) or w:pict (VML) element.
 * `dataUrl` is a base64 data URL ready for use in an <img> src attribute.
 * It is an empty string when the media file could not be located in the ZIP.
 */
export interface Image {
  type: "image";
  /** Relationship ID that referenced this image within its part */
  rId: string;
  /** ZIP entry path, e.g. "word/media/image1.png" */
  filename: string;
  /** MIME type derived from the file extension, e.g. "image/png" */
  mimeType: string;
  /** Base64 data URL: "data:image/png;base64,..." — empty string when unavailable */
  dataUrl: string;
  /** Rendered width in points (1 pt = 12700 EMU), if known */
  widthPt?: number;
  /** Rendered height in points, if known */
  heightPt?: number;
  /** Alt text / title from the drawing properties */
  altText?: string;
  /** "inline" = flows with text; "anchor" = floating/wrapped */
  positioning: "inline" | "anchor";
  /** Horizontal anchor position — present only when `positioning` is "anchor". */
  anchorPositionH?: AnchorPositionAxis;
  /** Vertical anchor position — present only when `positioning` is "anchor". */
  anchorPositionV?: AnchorPositionAxis;
  /** Text-wrap settings — present only when `positioning` is "anchor". */
  textWrap?: TextWrap;
  /**
   * Whether the image is rendered behind the text layer.
   * Derived from the `behindDoc` attribute on `wp:anchor`.
   * Only meaningful when `positioning` is "anchor".
   */
  behindDoc?: boolean;
  /**
   * Whether the image is locked to its anchor paragraph.
   * Derived from the `locked` attribute on `wp:anchor`.
   */
  locked?: boolean;
  /**
   * Whether the layout in cells attribute is set on `wp:anchor`.
   * When true the image is allowed to overlap table cells.
   */
  layoutInCell?: boolean;
}

/**
 * An embedded non-image object: OLE (e.g. Excel sheet, Equation),
 * or a legacy VML shape that could not be decoded as a plain image.
 */
export interface EmbeddedObject {
  type: "object";
  /** Relationship ID for the OLE data stream */
  rId?: string;
  /** ProgID identifier, e.g. "Excel.Sheet.12" or "Equation.3" */
  progId?: string;
  /** VML shape ID from the surrounding v:shape element */
  shapeId?: string;
  /** Preview thumbnail extracted from an embedded v:imagedata, if present */
  thumbnail?: {
    rId: string;
    filename: string;
    mimeType: string;
    dataUrl: string;
  };
}

/** A single styled run of text within a paragraph */
export interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  /** Font size in points */
  fontSize?: number;
  /** Hex color string, e.g. "FF0000" */
  color?: string;
  /** Present when this run contains a DrawingML/VML image instead of (or alongside) text */
  image?: Image;
}

/** Paragraph indentation settings — all values in points (converted from twips ÷ 20). */
export interface ParagraphIndentation {
  /** Left indent in points */
  leftPt?: number;
  /** Right indent in points */
  rightPt?: number;
  /**
   * First-line indent in points.
   * Positive = first-line indent (w:firstLine); negative = hanging indent (−w:hanging).
   */
  firstLinePt?: number;
}

/**
 * Paragraph spacing settings.
 * `beforePt` / `afterPt` are in points (twips ÷ 20).
 * `lineValue` interpretation depends on `lineRule`:
 *   "auto"    — lineValue ÷ 240 gives the line-height multiplier (e.g. 276 → 1.15×)
 *   "exact"   — lineValue ÷ 20 gives the exact line height in points
 *   "atLeast" — lineValue ÷ 20 gives the minimum line height in points
 */
export interface ParagraphSpacing {
  beforePt?: number;
  afterPt?: number;
  lineValue?: number;
  lineRule?: "auto" | "exact" | "atLeast";
}

/**
 * List / numbering information resolved from the document's numbering.xml.
 * Present on paragraphs that belong to a bulleted or numbered list.
 */
export interface ListInfo {
  /** Numbering definition ID from w:numId in w:numPr */
  numId: number;
  /** 0-based indent level from w:ilvl in w:numPr */
  level: number;
  /** "bullet" for unordered lists, "ordered" for numbered lists, "none" for suppressed numbering */
  listType: "bullet" | "ordered" | "none";
  /** Raw number format string, e.g. "bullet", "decimal", "lowerLetter", "lowerRoman" */
  numFmt?: string;
  /** Level text template, e.g. "\u2022", "%1." */
  levelText?: string;
}

/** A paragraph block extracted from the document */
export interface Paragraph {
  type: "paragraph";
  runs: TextRun[];
  /** Full concatenated text of all runs */
  text: string;
  /** Paragraph style name, e.g. "Heading1", "Normal" */
  style?: string;
  /** Text alignment: left | center | right | both (justify) */
  alignment?: string;
  /** All images found in this paragraph's runs (empty array when none) */
  images: Image[];
  /** OLE objects / embedded non-image elements found in this paragraph */
  embeddedObjects?: EmbeddedObject[];
  /** Paragraph indentation (from w:ind) */
  indentation?: ParagraphIndentation;
  /** Paragraph spacing (from w:spacing) */
  spacing?: ParagraphSpacing;
  /** List / bullet information when this paragraph is part of a numbered or bulleted list */
  listInfo?: ListInfo;
}

/** A single cell in a table row */
export interface TableCell {
  paragraphs: Paragraph[];
  /** All paragraph text joined by newlines */
  text: string;
  /** Cell width in points (from w:tcW, type dxa) */
  widthPt?: number;
  /** Number of grid columns spanned (from w:gridSpan; absent or 1 means no span) */
  gridSpan?: number;
  /** Vertical merge: "restart" begins the merged group; "continue" is a spanned continuation */
  vMerge?: "restart" | "continue";
  /**
   * Number of rows this cell spans.
   * Computed from vMerge markers; only present on "restart" cells that span > 1 row.
   * Equivalent to the HTML `rowspan` attribute.
   */
  rowSpan?: number;
  /**
   * Cell background fill color as a 6-digit hex string, e.g. "FF0000" for red.
   * Derived from the w:fill attribute of w:shd in w:tcPr.
   * Absent when the fill is "auto" or unset.
   */
  backgroundColor?: string;
}

/** A row of cells in a table */
export interface TableRow {
  cells: TableCell[];
}

/** A table block extracted from the document */
export interface Table {
  type: "table";
  rows: TableRow[];
  /** All cell text joined by tabs (columns) and newlines (rows) */
  text: string;
  /** Table total width in points (from w:tblW, type dxa) */
  widthPt?: number;
  /** Table horizontal alignment on the page: "left" | "center" | "right" */
  alignment?: string;
  /** Applied table style name, e.g. "TableGrid" */
  style?: string;
}

/** A document block is either a paragraph or a table */
export type DocumentBlock = Paragraph | Table;

/**
 * A logical section (header, body content, or footer) represented
 * as an ordered list of blocks with a convenience full-text property.
 */
export interface DocumentSection {
  blocks: DocumentBlock[];
  /** All block text concatenated with newlines */
  text: string;
  /** All images flattened from every block in this section (easy access for consumers) */
  images: Image[];
}

// ─── Page layout settings ────────────────────────────────────────────────────

/** Physical page dimensions extracted from w:pgSz (converted from twips ÷ 20). */
export interface PageSize {
  /** Page width in points */
  widthPt: number;
  /** Page height in points */
  heightPt: number;
  orientation: "portrait" | "landscape";
}

/** Page margin distances, all in points (twips ÷ 20), from w:pgMar. */
export interface PageMargins {
  topPt: number;
  bottomPt: number;
  leftPt: number;
  rightPt: number;
  /** Distance from top of page to header content */
  headerPt: number;
  /** Distance from bottom of page to footer content */
  footerPt: number;
  gutterPt: number;
}

/** Multi-column layout from w:cols. */
export interface PageColumns {
  /** Number of text columns (1 = single-column layout) */
  count: number;
  /** Space between columns in points */
  spacingPt?: number;
}

/** Page numbering settings from w:pgNumType. */
export interface PageNumbering {
  /** Starting page number */
  start?: number;
  /** Format string, e.g. "decimal", "upperRoman", "lowerAlpha" */
  format?: string;
}

/** All page layout settings extracted from the document's w:sectPr element. */
export interface PageSettings {
  size: PageSize;
  margins: PageMargins;
  /** Column layout — present only when the document has an explicit w:cols element */
  columns?: PageColumns;
  /** Page numbering — present only when the document has an explicit w:pgNumType element */
  pageNumbering?: PageNumbering;
}

/**
 * The complete structured data extracted from a .docx template file.
 *
 * - `header`  — default (odd-page) repeating header
 * - `content` — main body content
 * - `footer`  — default (odd-page) repeating footer
 *
 * Optional sections are present only when the document defines them.
 */
export interface DocxTemplateData {
  header: DocumentSection | null;
  content: DocumentSection;
  footer: DocumentSection | null;
  firstPageHeader?: DocumentSection;
  firstPageFooter?: DocumentSection;
  evenPageHeader?: DocumentSection;
  evenPageFooter?: DocumentSection;
  /** Page layout settings derived from the document's w:sectPr element */
  pageSettings?: PageSettings;
}
