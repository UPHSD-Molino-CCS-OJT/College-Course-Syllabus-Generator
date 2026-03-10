"use client";

import type { DocumentBlock, EmbeddedObject, Image, Paragraph, Table } from "@/lib/docxTemplateReader/types";

// ---------------------------------------------------------------------------
// Image renderer (DrawingML / VML)
// ---------------------------------------------------------------------------

function ImageView({ image, inline = false }: { image: Image; inline?: boolean }) {
  const dims =
    image.widthPt && image.heightPt
      ? { width: `${image.widthPt}pt`, maxWidth: "100%" }
      : { maxWidth: "100%" };

  const isDisplayable = image.dataUrl !== "" &&
    !image.mimeType.includes("emf") &&
    !image.mimeType.includes("wmf");

  if (!isDisplayable) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded border border-dashed border-zinc-300 bg-zinc-50 px-2 py-1 text-[11px] text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 ${inline ? "" : "my-1"}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
          <path fillRule="evenodd" d="M2 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm2 0v8h8V4H4z" clipRule="evenodd" />
        </svg>
        {image.mimeType.toUpperCase()} image
        {image.altText ? ` — ${image.altText}` : ""}
        {image.widthPt ? ` (${image.widthPt}×${image.heightPt}pt)` : ""}
      </span>
    );
  }

  return (
    <span className={`${inline ? "inline-block align-middle" : "block my-2"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.dataUrl}
        alt={image.altText ?? ""}
        style={dims}
        className="rounded border border-zinc-200 dark:border-zinc-700"
      />
      {image.altText && (
        <span className="mt-0.5 block text-[10px] italic text-zinc-400 dark:text-zinc-500">
          {image.altText}
        </span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Embedded object renderer (OLE)
// ---------------------------------------------------------------------------

function EmbeddedObjectView({ obj }: { obj: EmbeddedObject }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-700 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
        <path d="M3 2a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1H3zm4.5 7.5v-5l3.5 2.5-3.5 2.5z" />
      </svg>
      {obj.progId ? <span className="font-medium">{obj.progId}</span> : "Embedded Object"}
      {obj.thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={obj.thumbnail.dataUrl}
          alt="thumbnail"
          className="ml-1 h-6 w-auto rounded border border-amber-300 dark:border-amber-600"
        />
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Paragraph renderer
// ---------------------------------------------------------------------------

function ParagraphView({ block }: { block: Paragraph }) {
  const isHeading = block.style?.toLowerCase().startsWith("heading");
  const hasImages = block.images.length > 0;
  const hasObjects = (block.embeddedObjects?.length ?? 0) > 0;

  return (
    <div className="group relative rounded-lg border border-transparent px-3 py-2 hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50">
      {/* Metadata badges */}
      <div className="mb-1 flex flex-wrap gap-1">
        {block.style && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            {block.style}
          </span>
        )}
        {block.alignment && block.alignment !== "left" && (
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
            {block.alignment}
          </span>
        )}
        {hasImages && (
          <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
            {block.images.length} image{block.images.length !== 1 ? "s" : ""}
          </span>
        )}
        {hasObjects && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            {block.embeddedObjects!.length} object{block.embeddedObjects!.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Text content with inline run formatting (including inline images) */}
      {block.runs.length > 0 ? (
        <p
          className={[
            "leading-relaxed",
            isHeading
              ? "font-semibold text-zinc-900 dark:text-zinc-100"
              : "text-zinc-700 dark:text-zinc-300",
            block.alignment === "center"
              ? "text-center"
              : block.alignment === "right"
              ? "text-right"
              : block.alignment === "both"
              ? "text-justify"
              : "text-left",
          ].join(" ")}
        >
          {block.runs.map((run, i) =>
            run.image ? (
              <ImageView key={i} image={run.image} inline />
            ) : run.text === "" ? null : (
              <span
                key={i}
                style={{ color: run.color ? `#${run.color}` : undefined }}
                className={[
                  run.bold ? "font-bold" : "",
                  run.italic ? "italic" : "",
                  run.underline ? "underline" : "",
                ].join(" ")}
              >
                {run.text}
              </span>
            )
          )}
        </p>
      ) : (
        !hasImages && !hasObjects && (
          <p className="text-xs italic text-zinc-400 dark:text-zinc-600">
            (empty paragraph)
          </p>
        )
      )}

      {/* Standalone images not already rendered inline (anchored drawings) */}
      {block.images
        .filter((img) => img.positioning === "anchor")
        .map((img, i) => (
          <ImageView key={`anchor-${i}`} image={img} />
        ))}

      {/* Embedded objects */}
      {block.embeddedObjects?.map((obj, i) => (
        <div key={i} className="mt-1">
          <EmbeddedObjectView obj={obj} />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table renderer
// ---------------------------------------------------------------------------

function TableView({ block }: { block: Table }) {
  if (block.rows.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 px-3 py-2 text-xs italic text-zinc-400 dark:border-zinc-700">
        (empty table)
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
      <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-700">
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {block.rows.map((row, ri) => (
            <tr
              key={ri}
              className={
                ri === 0
                  ? "bg-zinc-50 dark:bg-zinc-800"
                  : "bg-white dark:bg-zinc-900"
              }
            >
              {row.cells.map((cell, ci) => (
                <td
                  key={ci}
                  className="align-top px-3 py-2 text-zinc-700 dark:text-zinc-300"
                >
                  {/* Render cell paragraphs with their images */}
                  {cell.paragraphs.map((para, pi) => (
                    <div key={pi}>
                      {para.runs.map((run, ri2) =>
                        run.image ? (
                          <ImageView key={ri2} image={run.image} inline />
                        ) : (
                          <span key={ri2}>{run.text}</span>
                        )
                      )}
                    </div>
                  ))}
                  {!cell.text && cell.paragraphs.every((p) => p.images.length === 0) && (
                    <span className="italic text-zinc-400">&nbsp;</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export default function BlockView({ block }: { block: DocumentBlock }) {
  if (block.type === "paragraph") return <ParagraphView block={block} />;
  return <TableView block={block} />;
}
