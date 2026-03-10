"use client";

import { useState } from "react";
import type { DocumentSection } from "@/lib/docxTemplateReader/types";
import BlockView from "./BlockView";

interface SectionPanelProps {
  title: string;
  section: DocumentSection | null | undefined;
  /** Accent colour token applied to the header strip */
  accent?: "blue" | "green" | "orange" | "purple";
  /** Start open by default */
  defaultOpen?: boolean;
}

const accentClasses: Record<
  NonNullable<SectionPanelProps["accent"]>,
  { strip: string; badge: string; count: string }
> = {
  blue: {
    strip: "bg-blue-600",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    count: "text-blue-600 dark:text-blue-400",
  },
  green: {
    strip: "bg-emerald-600",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    count: "text-emerald-600 dark:text-emerald-400",
  },
  orange: {
    strip: "bg-orange-500",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    count: "text-orange-600 dark:text-orange-400",
  },
  purple: {
    strip: "bg-purple-600",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    count: "text-purple-600 dark:text-purple-400",
  },
};

export default function SectionPanel({
  title,
  section,
  accent = "blue",
  defaultOpen = false,
}: SectionPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [view, setView] = useState<"blocks" | "raw">("blocks");

  const colors = accentClasses[accent];
  const blockCount = section?.blocks.length ?? 0;
  const paragraphs = section?.blocks.filter((b) => b.type === "paragraph").length ?? 0;
  const tables = section?.blocks.filter((b) => b.type === "table").length ?? 0;
  const images = section?.images.length ?? 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      {/* Coloured accent strip */}
      <div className={`h-1 w-full ${colors.strip}`} />

      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      >
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
            {title}
          </span>
          {section ? (
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors.badge}`}>
              {blockCount} block{blockCount !== 1 ? "s" : ""}
            </span>
          ) : (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              not present
            </span>
          )}
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Collapsible body */}
      {open && (
        <div className="border-t border-zinc-100 dark:border-zinc-800">
          {!section ? (
            <p className="px-5 py-6 text-sm italic text-zinc-400 dark:text-zinc-500">
              This document does not contain a {title.toLowerCase()} section.
            </p>
          ) : (
            <>
              {/* Stats bar */}
              <div className="flex items-center gap-4 border-b border-zinc-100 bg-zinc-50 px-5 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
                <span>
                  <span className={`font-semibold ${colors.count}`}>{paragraphs}</span>{" "}
                  paragraph{paragraphs !== 1 ? "s" : ""}
                </span>
                <span>
                  <span className={`font-semibold ${colors.count}`}>{tables}</span>{" "}
                  table{tables !== 1 ? "s" : ""}
                </span>
                {images > 0 && (
                  <span>
                    <span className="font-semibold text-teal-600 dark:text-teal-400">
                      {images}
                    </span>{" "}
                    image{images !== 1 ? "s" : ""}
                  </span>
                )}

                {/* View toggle */}
                <div className="ml-auto flex rounded-lg border border-zinc-200 text-xs dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setView("blocks")}
                    className={`rounded-l-lg px-3 py-1 transition-colors ${
                      view === "blocks"
                        ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                        : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    }`}
                  >
                    Blocks
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("raw")}
                    className={`rounded-r-lg px-3 py-1 transition-colors ${
                      view === "raw"
                        ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                        : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    }`}
                  >
                    Raw JSON
                  </button>
                </div>
              </div>

              {/* Content */}
              {view === "blocks" ? (
                <div className="flex max-h-130 flex-col gap-1 overflow-y-auto px-4 py-3">
                  {section.blocks.length === 0 ? (
                    <p className="py-4 text-center text-sm italic text-zinc-400 dark:text-zinc-500">
                      Section is empty.
                    </p>
                  ) : (
                    section.blocks.map((block, i) => (
                      <BlockView key={i} block={block} />
                    ))
                  )}
                </div>
              ) : (
                <pre className="max-h-130 overflow-auto bg-zinc-950 px-5 py-4 text-xs leading-relaxed text-green-400">
                  {JSON.stringify(section, null, 2)}
                </pre>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
