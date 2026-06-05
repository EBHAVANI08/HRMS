import { NextRequest, NextResponse } from 'next/server';
import {
  analyzeResume,
  batchAnalyzeResumes,
  extractJDKeywords,
  parseResume,
  computeCosineSimilarity,
  computeKeywordMatch,
  generateAntiHallucinationReport,
  type MatchResult,
} from '@/lib/recruitment/resume-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jdText, jdRequirements, shortlistThreshold, resumes, mode } = body;

    if (mode === 'batch' && resumes) {
      // Batch analysis
      const results = batchAnalyzeResumes(
        resumes.map((r: { id: string; name: string; text: string }) => ({
          id: r.id,
          name: r.name,
          text: r.text,
        })),
        jdText,
        jdRequirements || [],
        shortlistThreshold || 75
      );
      return NextResponse.json({ success: true, results });
    }

    // Single resume analysis
    if (!resumeText || !jdText) {
      return NextResponse.json(
        { success: false, error: 'Missing resumeText or jdText' },
        { status: 400 }
      );
    }

    const result = analyzeResume(
      resumeText,
      jdText,
      jdRequirements || [],
      shortlistThreshold || 75
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Resume analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');

    if (mode === 'keywords') {
      // Extract keywords from a JD
      const jdText = searchParams.get('jdText') || '';
      const requirements = searchParams.get('requirements')?.split(',') || [];
      const keywords = extractJDKeywords(jdText, requirements);
      return NextResponse.json({ success: true, keywords });
    }

    if (mode === 'parse') {
      // Parse a resume without matching
      const resumeText = searchParams.get('resumeText') || '';
      const parsed = parseResume(resumeText);
      const antiHallucination = generateAntiHallucinationReport(parsed, resumeText);
      return NextResponse.json({ success: true, parsed, antiHallucination });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid mode. Use "keywords" or "parse"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Resume GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
