/**
 * POST /api/template
 *
 * Accepts a multipart/form-data upload with a .docx file under the
 * field name "file".  Returns the extracted header, content, and footer
 * sections as JSON so that the syllabus-generation module can consume them.
 *
 * Example (curl):
 *   curl -X POST http://localhost:3000/api/template \
 *        -F "file=@syllabus-template.docx"
 */

import { NextRequest, NextResponse } from "next/server";
import { readDocxTemplate } from "@/lib/docxTemplateReader";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  // ── 1. Parse multipart form data ─────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Request must be multipart/form-data." },
      { status: 400 }
    );
  }

  const file = formData.get("file");

  // ── 2. Validate the uploaded file ────────────────────────────────────────
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: 'No file provided. Send a .docx file with the field name "file".' },
      { status: 400 }
    );
  }

  if (!file.name.toLowerCase().endsWith(".docx")) {
    return NextResponse.json(
      { error: "Invalid file type. Only .docx files are accepted." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum allowed size is 10 MB." },
      { status: 413 }
    );
  }

  // ── 3. Parse the .docx template ──────────────────────────────────────────
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const templateData = await readDocxTemplate(buffer);

    return NextResponse.json({ success: true, data: templateData });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to parse .docx file: ${message}` },
      { status: 500 }
    );
  }
}
