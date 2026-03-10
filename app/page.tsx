"use client";

import { useState, useCallback } from "react";
import type { DocxTemplateData } from "@/lib/docxTemplateReader/types";
import DropZone from "./components/DropZone";
import SectionPanel from "./components/SectionPanel";
import DocPreview from "./components/DocPreview";

interface ApiResponse {
  success?: boolean;
  data?: DocxTemplateData;
  error?: string;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DocxTemplateData | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"document" | "inspector">("document");

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setFileName(file.name);

    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/template", { method: "POST", body });
      const json: ApiResponse = await res.json();

      if (!res.ok || json.error) {
        setError(json.error ?? `Server error (${res.status})`);
        return;
      }

      setResult(json.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = () => {
    setResult(null);
    setFileName(null);
    setError(null);
    setView("document");
  };

  const hasOptionalSections =
    result &&
    (result.firstPageHeader ||
      result.firstPageFooter ||
      result.evenPageHeader ||
      result.evenPageFooter);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto px-4 py-12">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="mb-10 text-center">
          <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
            Template Reader
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Course Syllabus Template
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Upload a <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs dark:bg-zinc-800">.docx</code> file to inspect its header, content, and footer sections.
          </p>
        </div>

        {/* ── Upload zone ─────────────────────────────────────────── */}
        <DropZone onFile={handleFile} loading={loading} />

        {/* ── Error banner ────────────────────────────────────────── */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                Failed to parse template
              </p>
              <p className="mt-0.5 text-xs text-red-600 dark:text-red-500">{error}</p>
            </div>
          </div>
        )}

        {/* ── Results ─────────────────────────────────────────────── */}
        {result && (
          <div className="mt-8 space-y-4">
            {/* Result toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5 text-emerald-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Parsed{" "}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {fileName}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* View toggle */}
                <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setView("document")}
                    className={[
                      "px-3 py-1.5 transition-colors",
                      view === "document"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800",
                    ].join(" ")}
                  >
                    Document
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("inspector")}
                    className={[
                      "px-3 py-1.5 transition-colors border-l border-zinc-200 dark:border-zinc-700",
                      view === "inspector"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800",
                    ].join(" ")}
                  >
                    Inspector
                  </button>
                </div>

                <button
                  type="button"
                  onClick={reset}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Upload another
                </button>
              </div>
            </div>

            {/* ── Document preview ──────────────────────────────── */}
            {view === "document" && (
              <div className="rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
                <DocPreview data={result} />
              </div>
            )}

            {/* ── Inspector panels ─────────────────────────────────── */}
            {view === "inspector" && (
              <div className="space-y-4">
            <SectionPanel
              title="Header"
              section={result.header}
              accent="blue"
              defaultOpen
            />
            <SectionPanel
              title="Body Content"
              section={result.content}
              accent="green"
              defaultOpen
            />
            <SectionPanel
              title="Footer"
              section={result.footer}
              accent="orange"
              defaultOpen
            />

            {/* Optional sections */}
            {hasOptionalSections && (
              <>
                <p className="pt-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                  Additional sections
                </p>
                {result.firstPageHeader && (
                  <SectionPanel
                    title="First Page Header"
                    section={result.firstPageHeader}
                    accent="purple"
                  />
                )}
                {result.firstPageFooter && (
                  <SectionPanel
                    title="First Page Footer"
                    section={result.firstPageFooter}
                    accent="purple"
                  />
                )}
                {result.evenPageHeader && (
                  <SectionPanel
                    title="Even Page Header"
                    section={result.evenPageHeader}
                    accent="purple"
                  />
                )}
                {result.evenPageFooter && (
                  <SectionPanel
                    title="Even Page Footer"
                    section={result.evenPageFooter}
                    accent="purple"
                  />
                )}
              </>
            )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
