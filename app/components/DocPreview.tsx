"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/**
 * DocPreview
 *
 * Renders the parsed DocxTemplateData as a simulated Microsoft Word document:
 *   ┌─────────────────────────────────────┐
 *   │  [Header band]                      │
 *   ├─────────────────────────────────────┤
 *   │                                     │
 *   │  [Body content]                     │
 *   │                                     │
 *   ├─────────────────────────────────────┤
 *   │  [Footer band]                      │
 *   └─────────────────────────────────────┘
 *
 * Typography and spacing intentionally mimic Word's default styles:
 *   - A4 page width (595pt) at 96dpi scale
 *   - 1-inch (72pt) margins
 *   - Default body font: Calibri 11pt, line-height 1.5
 *   - Heading styles map to h1–h6 sizes
 */

import type {
  DocxTemplateData,
  DocumentSection,
  DocumentBlock,
  Paragraph,
  Table,
  Image,
  EmbeddedObject,
} from "@/lib/docxTemplateReader/types";

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

/** Maps Word paragraph style names to Tailwind typography classes. */
function paragraphStyleClasses(style?: string): string {
  if (!style) return "text-[11pt] leading-relaxed text-zinc-900";
  const s = style.toLowerCase();
  if (s === "title")        return "text-[26pt] font-bold leading-tight text-zinc-900 mt-4 mb-2";
  if (s === "subtitle")     return "text-[15pt] text-zinc-500 mb-4";
  if (s === "heading1")     return "text-[16pt] font-bold leading-snug text-zinc-900 mt-6 mb-1";
  if (s === "heading2")     return "text-[13pt] font-bold leading-snug text-zinc-900 mt-5 mb-1";
  if (s === "heading3")     return "text-[11pt] font-bold leading-snug text-zinc-900 mt-4 mb-1";
  if (s === "heading4")     return "text-[11pt] font-bold italic leading-snug text-zinc-900 mt-3 mb-0.5";
  if (s.startsWith("heading")) return "text-[11pt] font-semibold leading-snug text-zinc-800 mt-3 mb-0.5";
  if (s === "listparagraph") return "text-[11pt] leading-relaxed text-zinc-900 pl-6";
  if (s === "caption")      return "text-[9pt] italic text-zinc-500 text-center mt-1 mb-2";
  if (s === "footnotetext" || s === "endnotetext") return "text-[9pt] leading-snug text-zinc-600";
  return "text-[11pt] leading-relaxed text-zinc-900";
}

function alignClass(alignment?: string): string {
  if (alignment === "center") return "text-center";
  if (alignment === "right")  return "text-right";
  if (alignment === "both")   return "text-justify";
  return "text-left";
}

// ---------------------------------------------------------------------------
// Image
// ---------------------------------------------------------------------------

function DocImage({ image }: { image: Image }) {
  const isDisplayable =
    image.dataUrl !== "" &&
    !image.mimeType.includes("emf") &&
    !image.mimeType.includes("wmf");

  if (!isDisplayable) {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-dashed border-zinc-300 bg-zinc-50 px-2 py-0.5 text-[9pt] text-zinc-400">
        [{image.mimeType} image{image.altText ? `: ${image.altText}` : ""}]
      </span>
    );
  }

  const style: React.CSSProperties = image.widthPt
    ? { width: `${image.widthPt}pt`, maxWidth: "100%" }
    : { maxWidth: "100%" };

  return (
    <span className="inline-block align-middle">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.dataUrl} alt={image.altText ?? ""} style={style} />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Embedded OLE object
// ---------------------------------------------------------------------------

function DocEmbeddedObject({ obj }: { obj: EmbeddedObject }) {
  if (obj.thumbnail) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={obj.thumbnail.dataUrl}
        alt={obj.progId ?? "Embedded object"}
        className="my-1 border border-zinc-200"
        style={{ maxWidth: "100%" }}
      />
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded border border-dashed border-amber-300 bg-amber-50 px-2 py-0.5 text-[9pt] text-amber-700">
      [{obj.progId ?? "Embedded Object"}]
    </span>
  );
}

// ---------------------------------------------------------------------------
// Paragraph
// ---------------------------------------------------------------------------

function DocParagraph({ block }: { block: Paragraph }) {
  const isEmpty = block.runs.length === 0 || block.runs.every((r) => r.text === "" && !r.image);

  // Apply spacing and indentation from paragraph properties
  const pStyle: React.CSSProperties = {};
  if (block.indentation?.leftPt)      pStyle.paddingLeft  = `${block.indentation.leftPt}pt`;
  if (block.indentation?.rightPt)     pStyle.paddingRight = `${block.indentation.rightPt}pt`;
  if (block.indentation?.firstLinePt) pStyle.textIndent   = `${block.indentation.firstLinePt}pt`;
  if (block.spacing?.beforePt)        pStyle.marginTop    = `${block.spacing.beforePt}pt`;
  if (block.spacing?.afterPt)         pStyle.marginBottom = `${block.spacing.afterPt}pt`;
  if (block.spacing?.lineValue) {
    const lv = block.spacing.lineValue;
    const lr = block.spacing.lineRule ?? "auto";
    // "auto": lv/240 is a CSS line-height multiplier (e.g. 276/240 ≈ 1.15)
    // "exact" / "atLeast": lv/20 converts twips to points
    pStyle.lineHeight = lr === "auto" ? `${lv / 240}` : `${lv / 20}pt`;
  }

  return (
    <p
      className={[
        paragraphStyleClasses(block.style),
        alignClass(block.alignment),
        "min-h-[1.4em]",
      ].join(" ")}
      style={pStyle}
    >
      {isEmpty ? (
        // Preserve empty paragraph spacing
        <span>&nbsp;</span>
      ) : (
        block.runs.map((run, i) => {
          if (run.image) return <DocImage key={i} image={run.image} />;

          const style: React.CSSProperties = {};
          if (run.color) style.color = `#${run.color}`;
          if (run.fontSize) style.fontSize = `${run.fontSize}pt`;

          return (
            <span
              key={i}
              style={style}
              className={[
                run.bold ? "font-bold" : "",
                run.italic ? "italic" : "",
                run.underline ? "underline" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {run.text}
            </span>
          );
        })
      )}

      {/* Anchored images follow the paragraph */}
      {block.images
        .filter((img) => img.positioning === "anchor")
        .map((img, i) => (
          <span key={`a${i}`} className="block">
            <DocImage image={img} />
          </span>
        ))}

      {/* OLE objects */}
      {block.embeddedObjects?.map((obj, i) => (
        <span key={`o${i}`} className="block">
          <DocEmbeddedObject obj={obj} />
        </span>
      ))}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

function DocTable({ block }: { block: Table }) {
  return (
    <table
      className="my-2 border-collapse text-[11pt]"
      style={{
        width: block.widthPt ? `${block.widthPt}pt` : "100%",
        ...(block.alignment === "center" ? { marginLeft: "auto", marginRight: "auto" } : {}),
        ...(block.alignment === "right"  ? { marginLeft: "auto" }                      : {}),
      }}
    >
      <tbody>
        {block.rows.map((row, ri) => (
          <tr key={ri}>
            {row.cells.map((cell, ci) => {
              // vMerge "continue" cells are spanned from above — hide them
              if (cell.vMerge === "continue") return null;
              return (
                <td
                  key={ci}
                  colSpan={cell.gridSpan ?? 1}
                  className="border border-zinc-400 px-2 py-1 align-top leading-relaxed text-zinc-900"
                  style={cell.widthPt ? { width: `${cell.widthPt}pt` } : undefined}
                >
                  {cell.paragraphs.map((para, pi) => (
                    <DocParagraph key={pi} block={para} />
                  ))}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// Block dispatcher
// ---------------------------------------------------------------------------

function DocBlock({ block }: { block: DocumentBlock }) {
  if (block.type === "paragraph") return <DocParagraph block={block} />;
  return <DocTable block={block} />;
}

// ---------------------------------------------------------------------------
// Section (header / body / footer)
// ---------------------------------------------------------------------------

function DocSection({ section }: { section: DocumentSection }) {
  return (
    <>
      {section.blocks.map((block, i) => (
        <DocBlock key={i} block={block} />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Pagination helper
// ---------------------------------------------------------------------------

/** CSS pt → px conversion at 96 dpi: 1 pt = 96/72 px */
const PT_TO_PX = 96 / 72;

/**
 * Greedily packs block heights into pages so no page exceeds `maxHeightPt`.
 * A single block taller than the page always gets its own page.
 */
function buildPageSlices(
  heightsPt: number[],
  maxHeightPt: number
): Array<{ start: number; end: number }> {
  if (heightsPt.length === 0) return [{ start: 0, end: 0 }];
  const pages: Array<{ start: number; end: number }> = [];
  let start = 0;
  let used  = 0;
  for (let i = 0; i < heightsPt.length; i++) {
    const h = heightsPt[i];
    if (used + h > maxHeightPt && i > start) {
      pages.push({ start, end: i });
      start = i;
      used  = h;
    } else {
      used += h;
    }
  }
  pages.push({ start, end: heightsPt.length });
  return pages;
}

// ---------------------------------------------------------------------------
// Public: full document preview
// ---------------------------------------------------------------------------

interface DocPreviewProps {
  data: DocxTemplateData;
}

export default function DocPreview({ data }: DocPreviewProps) {
  const [slices, setSlices]           = useState<Array<{ start: number; end: number }> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const measureRef = useRef<HTMLDivElement>(null);

  // ─ Page layout constants from document settings ────────────────────────────
  const ps             = data.pageSettings;
  const widthPt        = ps?.size.widthPt     ?? 612;   // 8.5 in letter
  const heightPt       = ps?.size.heightPt    ?? 792;   // 11 in letter
  const marginLeftPt   = ps?.margins.leftPt   ?? 90;    // Word default 1.25 in
  const marginRightPt  = ps?.margins.rightPt  ?? 90;
  const marginTopPt    = ps?.margins.topPt    ?? 72;    // 1 in
  const marginBottomPt = ps?.margins.bottomPt ?? 72;
  const headerDistPt   = ps?.margins.headerPt ?? 35.4;  // 708 twips
  const footerDistPt   = ps?.margins.footerPt ?? 35.4;

  const hasHeader = !!(data.header ?? data.firstPageHeader);
  const hasFooter = !!(data.footer ?? data.firstPageFooter);

  // Usable body height (between the two margin bands)
  const bodyHeightPt   = heightPt - marginTopPt - marginBottomPt;
  // Content column width used for the hidden measurement container
  const contentWidthPt = widthPt  - marginLeftPt - marginRightPt;

  const blocks = data.content.blocks;

  // ─ Measure block heights after render + font load ─────────────────────────
  const doMeasure = useCallback(() => {
    const container = measureRef.current;
    if (!container) return;
    const children = Array.from(container.children) as HTMLElement[];
    if (children.length !== blocks.length) return;
    const heightsPt = children.map(
      (el) => el.getBoundingClientRect().height / PT_TO_PX
    );
    setSlices(buildPageSlices(heightsPt, bodyHeightPt));
    setCurrentPage(0);
  }, [blocks, bodyHeightPt]);

  useEffect(() => {
    setSlices(null);
    setCurrentPage(0);
    // Wait for fonts so measurements are accurate
    document.fonts.ready.then(doMeasure);
  }, [doMeasure]);

  const totalPages   = slices?.length ?? 1;
  const currentSlice = slices?.[currentPage];
  const pageBlocks   = currentSlice
    ? blocks.slice(currentSlice.start, currentSlice.end)
    : blocks;

  return (
    <div
      style={{ fontFamily: "'Calibri', 'Carlito', 'Liberation Sans', Arial, sans-serif" }}
    >
      {/* ── Hidden block measurement container ────────────────────────────────── */}
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position:      "fixed",
          top:           0,
          left:          "-99999px",
          width:         `${contentWidthPt}pt`,
          visibility:    "hidden",
          pointerEvents: "none",
        }}
      >
        {blocks.map((block, i) => (
          <div key={i}><DocBlock block={block} /></div>
        ))}
      </div>

      {/* ── Page navigation bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-6 py-2 dark:border-zinc-700 dark:bg-zinc-900">
        <button
          type="button"
          disabled={currentPage === 0}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="rounded px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          ← Previous
        </button>

        <span className="text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
          {slices === null
            ? "Calculating pages…"
            : `Page ${currentPage + 1}\u202fof\u202f${totalPages}`}
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages - 1}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="rounded px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Next →
        </button>
      </div>

      {/* ── Page sheet ────────────────────────────────────────────────────────── */}
      <div className="flex justify-center overflow-x-auto py-8">
        <div
          className="shrink-0 bg-white shadow-[0_4px_32px_rgba(0,0,0,0.18)]"
          style={{
            width:         `${widthPt}pt`,
            height:        `${heightPt}pt`,
            display:       "flex",
            flexDirection: "column",
            overflow:      "hidden",
          }}
        >
          {/* ─ Header area (fixed to top-margin height) ──────────────────────── */}
          {hasHeader ? (
            <div
              className="border-b border-zinc-300"
              style={{
                height:        `${marginTopPt}pt`,
                flexShrink:    0,
                paddingLeft:   `${marginLeftPt}pt`,
                paddingRight:  `${marginRightPt}pt`,
                paddingTop:    `${headerDistPt}pt`,
                overflow:      "hidden",
              }}
            >
              <DocSection section={(data.firstPageHeader ?? data.header)!} />
            </div>
          ) : (
            <div style={{ height: `${marginTopPt}pt`, flexShrink: 0 }} />
          )}

          {/* ─ Body content area (grows to fill space between margins) ──── */}
          <div
            style={{
              flex:         1,
              paddingLeft:  `${marginLeftPt}pt`,
              paddingRight: `${marginRightPt}pt`,
              overflow:     "hidden",
            }}
          >
            {pageBlocks.map((block, i) => (
              <DocBlock key={i} block={block} />
            ))}
          </div>

          {/* ─ Footer area (fixed to bottom-margin height) ───────────────── */}
          {hasFooter ? (
            <div
              className="border-t border-zinc-300"
              style={{
                height:        `${marginBottomPt}pt`,
                flexShrink:    0,
                paddingLeft:   `${marginLeftPt}pt`,
                paddingRight:  `${marginRightPt}pt`,
                paddingBottom: `${footerDistPt}pt`,
                overflow:      "hidden",
                display:       "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <DocSection section={(data.firstPageFooter ?? data.footer)!} />
            </div>
          ) : (
            <div style={{ height: `${marginBottomPt}pt`, flexShrink: 0 }} />
          )}
        </div>
      </div>
    </div>
  );
}
