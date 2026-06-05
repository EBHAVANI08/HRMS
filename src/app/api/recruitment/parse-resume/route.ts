import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/recruitment/parse-resume
 * Accepts a file upload (PDF, DOCX, TXT) and returns extracted text.
 * Uses mammoth for DOCX, pdf-parse for PDF, and plain text for TXT.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // File size validation (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    if (fileName.endsWith(".txt")) {
      // Plain text — read directly
      extractedText = buffer.toString("utf-8");

    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      // DOCX — use mammoth
      try {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } catch (mammothError: any) {
        console.error("Mammoth parsing error:", mammothError);
        return NextResponse.json(
          {
            success: false,
            error: `Failed to parse DOCX file: ${mammothError.message || "Unknown error"}. Please try uploading a .txt file instead.`,
          },
          { status: 422 }
        );
      }

    } else if (fileName.endsWith(".pdf")) {
      // PDF — use pdf-parse
      try {
        const pdfParse = (await import("pdf-parse")).default;
        const result = await pdfParse(buffer);
        extractedText = result.text;
      } catch (pdfError: any) {
        console.error("PDF parsing error:", pdfError);
        return NextResponse.json(
          {
            success: false,
            error: `Failed to parse PDF file: ${pdfError.message || "Unknown error"}. Please try uploading a .txt or .docx file instead.`,
          },
          { status: 422 }
        );
      }

    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file format: ${fileName.split(".").pop()}. Please upload a .pdf, .docx, or .txt file.`,
        },
        { status: 400 }
      );
    }

    // Clean up extracted text
    extractedText = extractedText
      .replace(/\r\n/g, "\n")           // Normalize line endings
      .replace(/\t/g, "  ")             // Tabs to spaces
      .replace(/ +/g, " ")              // Multiple spaces to single
      .replace(/\n{3,}/g, "\n\n")       // Multiple blank lines to double
      .trim();

    if (!extractedText || extractedText.length < 20) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not extract meaningful text from the file. The file may be empty, image-based, or corrupted. Please try a text-based PDF, DOCX, or TXT file.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        charCount: extractedText.length,
        wordCount: extractedText.split(/\s+/).filter(Boolean).length,
      },
    });
  } catch (error: any) {
    console.error("Resume parse error:", error);
    return NextResponse.json(
      { success: false, error: `Server error: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
