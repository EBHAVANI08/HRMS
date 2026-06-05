import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/recruitment/parse-resume
 * Accepts a file upload (PDF, DOCX, TXT) and returns extracted text.
 * Uses mammoth for DOCX, pdf-parse for PDF, and plain text for TXT.
 *
 * IMPORTANT: .doc (legacy Word format) is NOT the same as .docx (ZIP-based XML).
 * mammoth only supports .docx. For .doc files, we attempt a basic text extraction
 * but recommend users convert to .docx or .pdf for best results.
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

    } else if (fileName.endsWith(".docx")) {
      // DOCX — use mammoth (supports .docx only, not legacy .doc)
      try {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } catch (mammothError: any) {
        console.error("Mammoth parsing error:", mammothError);

        // If mammoth fails, try JSZip-based XML text extraction from the DOCX ZIP
        try {
          extractedText = await extractTextFromDocxFallback(buffer);
        } catch (fallbackError: any) {
          console.error("DOCX fallback extraction error:", fallbackError);
          return NextResponse.json(
            {
              success: false,
              error: `Failed to parse DOCX file. The file may be corrupted or image-based. Please try uploading a .txt file or paste the resume text directly.`,
            },
            { status: 422 }
          );
        }
      }

    } else if (fileName.endsWith(".doc")) {
      // Legacy .doc format — mammoth does NOT support .doc
      // Try to extract text as best we can, but warn the user
      try {
        // Attempt to read as .docx in case the file is actually .docx with wrong extension
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } catch {
        // If that fails, try JSZip fallback (in case it's actually .docx)
        try {
          extractedText = await extractTextFromDocxFallback(buffer);
        } catch {
          // Last resort: basic binary text extraction
          try {
            extractedText = extractTextFromBinary(buffer);
          } catch {
            return NextResponse.json(
              {
                success: false,
                error: "Legacy .doc format is not fully supported. Please convert your file to .docx, .pdf, or .txt format and upload again.",
              },
              { status: 422 }
            );
          }
        }
      }

    } else if (fileName.endsWith(".pdf")) {
      // PDF — use pdf-parse
      try {
        const pdfParseModule: any = await import("pdf-parse");
        const pdfParse = pdfParseModule.default || pdfParseModule;
        const result = await pdfParse(buffer);
        extractedText = result.text;
      } catch (pdfError: any) {
        console.error("PDF parsing error:", pdfError);
        return NextResponse.json(
          {
            success: false,
            error: `Failed to parse PDF file. The file may be image-based or encrypted. Please try uploading a .docx or .txt file instead.`,
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

/**
 * Fallback: Extract text from a DOCX file by parsing the XML inside the ZIP.
 * DOCX is a ZIP archive containing XML files. The main text is in word/document.xml.
 * Uses JSZip to properly parse the ZIP structure, then extracts text from <w:t> tags.
 * This is a reliable fallback when mammoth fails.
 */
async function extractTextFromDocxFallback(buffer: Buffer): Promise<string> {
  try {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(buffer);

    // The main document content is in word/document.xml
    const documentXml = zip.file("word/document.xml");
    if (!documentXml) {
      throw new Error("word/document.xml not found in DOCX archive");
    }

    const xmlContent = await documentXml.async("string");

    // Extract text from <w:t> tags in the XML
    // In OOXML, each piece of text is wrapped in <w:t> elements inside <w:r> (run) elements
    // Paragraphs are delimited by </w:p> tags
    const textParts: string[] = [];
    const wptRegex = /<w:p[ >]/g;
    let lastIdx = 0;
    const paragraphs: string[] = [];

    // Split by paragraphs first
    const paragraphSplit = xmlContent.split(/<\/w:p>/);

    for (const para of paragraphSplit) {
      const textMatches = para.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
      if (textMatches && textMatches.length > 0) {
        const paraText = textMatches
          .map((m) => {
            const content = m.match(/<w:t[^>]*>([^<]*)<\/w:t>/);
            return content ? content[1] : "";
          })
          .join("");
        if (paraText.trim()) {
          paragraphs.push(paraText);
        }
      }
    }

    const result = paragraphs.join("\n");

    if (result.length < 20) {
      throw new Error("Extracted text too short from DOCX XML");
    }

    return result;
  } catch (jszipError: any) {
    console.error("JSZip DOCX fallback error:", jszipError);
    throw jszipError;
  }
}

/**
 * Basic text extraction from binary content.
 * Filters out non-printable characters and attempts to find readable text blocks.
 * This is a last-resort method and may produce noisy output.
 */
function extractTextFromBinary(buffer: Buffer): string {
  // Convert to string, keeping only printable characters
  const text = buffer.toString("utf-8");

  // Remove common binary/XML artifacts
  const cleaned = text
    // Remove XML tags
    .replace(/<[^>]+>/g, " ")
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    // Remove common DOCX internal strings
    .replace(/Content_Types\.xml/gi, "")
    .replace(/_rels\/\.rels/gi, "")
    .replace(/word\/document\.xml/gi, "")
    .replace(/word\/_rels/gi, "")
    .replace(/PK!/g, "")
    // Clean up whitespace
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}
