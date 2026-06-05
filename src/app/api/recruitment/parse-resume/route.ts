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
    let parseMethod = "";

    if (fileName.endsWith(".txt")) {
      // Plain text — read directly
      extractedText = buffer.toString("utf-8");
      parseMethod = "text-direct";

    } else if (fileName.endsWith(".docx")) {
      // DOCX — try mammoth first (multiple strategies), then JSZip fallback
      extractedText = await parseDocx(buffer);
      parseMethod = "docx-mammoth-jszip";

    } else if (fileName.endsWith(".doc")) {
      // Legacy .doc format — mammoth does NOT support .doc
      // Try to extract text as best we can, but warn the user
      try {
        extractedText = await parseDocx(buffer);
        parseMethod = "doc-as-docx";
      } catch {
        // Last resort: basic binary text extraction
        try {
          extractedText = extractTextFromBinary(buffer);
          parseMethod = "doc-binary";
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

    } else if (fileName.endsWith(".pdf")) {
      // PDF — use pdf-parse
      try {
        const pdfParseModule: any = await import("pdf-parse");
        const pdfParse = pdfParseModule.default || pdfParseModule;
        const result = await pdfParse(buffer);
        extractedText = result.text;
        parseMethod = "pdf-parse";
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
        parseMethod,
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
 * Parse DOCX file using a multi-strategy approach:
 * 1. mammoth.extractRawText() — always works for valid .docx
 * 2. mammoth.convertToHtml() — extracts richer content if extractRawText is empty
 * 3. JSZip XML fallback — parses word/document.xml directly
 */
async function parseDocx(buffer: Buffer): Promise<string> {
  let extractedText = "";

  // Strategy 1: mammoth.extractRawText() — the most reliable method
  try {
    const mammothModule = await import("mammoth");
    const mammoth = mammothModule.default || mammothModule;

    if (typeof mammoth.extractRawText === "function") {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || "";
    } else if (typeof mammoth === "function") {
      // Some bundlers export the function directly
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || "";
    }

    if (extractedText.trim().length >= 20) {
      return extractedText;
    }
  } catch (err: any) {
    console.warn("[parse-resume] mammoth.extractRawText failed:", err.message);
  }

  // Strategy 2: mammoth.convertToHtml() then strip HTML — sometimes gets content that extractRawText misses
  try {
    const mammothModule = await import("mammoth");
    const mammoth = mammothModule.default || mammothModule;

    if (typeof mammoth.convertToHtml === "function") {
      const result = await mammoth.convertToHtml({ buffer });
      const html = result.value || "";
      if (html.trim().length > 0) {
        // Strip HTML tags to get plain text
        extractedText = html
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<\/p>/gi, "\n\n")
          .replace(/<\/li>/gi, "\n")
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, " ");

        if (extractedText.trim().length >= 20) {
          return extractedText;
        }
      }
    }
  } catch (err: any) {
    console.warn("[parse-resume] mammoth.convertToHtml failed:", err.message);
  }

  // Strategy 3: JSZip-based XML text extraction from the DOCX ZIP
  try {
    extractedText = await extractTextFromDocxFallback(buffer);
    if (extractedText.trim().length >= 20) {
      return extractedText;
    }
  } catch (err: any) {
    console.warn("[parse-resume] JSZip fallback failed:", err.message);
  }

  // Strategy 4: Basic binary text extraction (last resort)
  try {
    extractedText = extractTextFromBinary(buffer);
    if (extractedText.trim().length >= 20) {
      return extractedText;
    }
  } catch (err: any) {
    console.warn("[parse-resume] Binary extraction failed:", err.message);
  }

  throw new Error("Failed to extract text from DOCX file using all available methods. The file may be corrupted or image-based.");
}

/**
 * Fallback: Extract text from a DOCX file by parsing the XML inside the ZIP.
 * DOCX is a ZIP archive containing XML files. The main text is in word/document.xml.
 * Uses JSZip to properly parse the ZIP structure, then extracts text from <w:t> tags.
 * This is a reliable fallback when mammoth fails.
 */
async function extractTextFromDocxFallback(buffer: Buffer): Promise<string> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);

  // Collect text from all XML files in the DOCX archive
  const xmlFiles = [
    "word/document.xml",
    "word/header1.xml",
    "word/header2.xml",
    "word/footer1.xml",
    "word/footer2.xml",
  ];

  const paragraphs: string[] = [];

  for (const xmlPath of xmlFiles) {
    const xmlFile = zip.file(xmlPath);
    if (!xmlFile) continue;

    const xmlContent = await xmlFile.async("string");

    // Split by paragraphs (</w:p> tags)
    const paragraphSplit = xmlContent.split(/<\/w:p>/);

    for (const para of paragraphSplit) {
      // Extract text from <w:t> tags, handling both self-closing and content variants
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
  }

  // Also check for text in other XML files (footnotes, endnotes, comments)
  const additionalXmlPaths = [
    "word/footnotes.xml",
    "word/endnotes.xml",
    "word/comments.xml",
  ];

  for (const xmlPath of additionalXmlPaths) {
    const xmlFile = zip.file(xmlPath);
    if (!xmlFile) continue;

    try {
      const xmlContent = await xmlFile.async("string");
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
    } catch {
      // Skip additional XML files that fail to parse
    }
  }

  const result = paragraphs.join("\n");

  if (result.length < 20) {
    throw new Error("Extracted text too short from DOCX XML");
  }

  return result;
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
