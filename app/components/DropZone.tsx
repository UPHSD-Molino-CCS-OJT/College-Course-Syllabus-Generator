"use client";

import { useRef, useState, useCallback, DragEvent, ChangeEvent } from "react";

interface DropZoneProps {
  onFile: (file: File) => void;
  loading: boolean;
}

export default function DropZone({ onFile, loading }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".docx")) {
        alert("Only .docx files are accepted.");
        return;
      }
      onFile(file);
    },
    [onFile]
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0] ?? null);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] ?? null);
    // reset so the same file can be re-uploaded
    e.target.value = "";
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload a .docx template file"
      onClick={() => !loading && inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && !loading && inputRef.current?.click()}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={[
        "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-8 py-16 transition-colors select-none",
        loading
          ? "cursor-not-allowed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"
          : dragging
          ? "cursor-copy border-blue-500 bg-blue-50 dark:bg-blue-950"
          : "cursor-pointer border-zinc-300 bg-white hover:border-blue-400 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-500 dark:hover:bg-blue-950",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".docx"
        className="hidden"
        onChange={onChange}
        disabled={loading}
      />

      {loading ? (
        <>
          <svg
            className="h-10 w-10 animate-spin text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Parsing template…
          </p>
        </>
      ) : (
        <>
          <svg
            className={`h-10 w-10 transition-colors ${
              dragging ? "text-blue-500" : "text-zinc-400 dark:text-zinc-600"
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {dragging ? "Drop your .docx file here" : "Drag & drop a .docx file"}
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              or click to browse — max 10 MB
            </p>
          </div>
        </>
      )}
    </div>
  );
}
