import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getHireMindEngine } from "@/lib/ai/hiremind-engine";

/**
 * POST /api/recruitment/hiremind-analyze
 *
 * Run HireMind AI analysis on a resume + JD combination.
 * Saves results to AIAnalysis table and returns the full analysis.
 *
 * Body: {
 *   resumeText: string,
 *   jobId: string,
 *   candidateId?: string,  (if candidate already exists)
 *   candidateName?: string,
 *   candidateEmail?: string,
 *   analysisType?: "full" | "quick"  (default: "full")
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.resumeText?.trim()) {
      return NextResponse.json(
        { success: false, error: "Resume text is required" },
        { status: 400 }
      );
    }

    if (!body.jobId) {
      return NextResponse.json(
        { success: false, error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Get job for JD text
    const job = await db.job.findUnique({ where: { id: body.jobId } });
    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    // Build JD text from job record
    const jdText = buildJDText(job);

    // Find or create candidate
    let candidateId = body.candidateId;
    if (!candidateId) {
      // Create a new candidate
      const candidate = await db.candidate.create({
        data: {
          name: body.candidateName || "Unknown Candidate",
          email: body.candidateEmail || null,
          jobId: body.jobId,
          stage: "screening",
          source: "Upload",
          resumeText: body.resumeText,
          resumeFileName: body.resumeFileName || null,
          appliedDate: new Date().toISOString().split("T")[0],
          lastActivity: "Just now",
        },
      });
      candidateId = candidate.id;

      // Update job applicant count
      const applicantCount = await db.candidate.count({ where: { jobId: body.jobId } });
      await db.job.update({
        where: { id: body.jobId },
        data: { applicants: applicantCount },
      });
    } else {
      // Update existing candidate with resume text if provided
      if (body.resumeText) {
        await db.candidate.update({
          where: { id: candidateId },
          data: { resumeText: body.resumeText },
        });
      }
    }

    // Run HireMind analysis
    const analysisType = body.analysisType || "full";
    const engine = getHireMindEngine();
    const result = await engine.fullAnalysis(
      body.resumeText,
      jdText,
      body.jobId,
      candidateId,
      analysisType as "full" | "quick"
    );

    // Save results to AIAnalysis table
    const analysis = await db.aIAnalysis.create({
      data: {
        candidateId,
        jobId: body.jobId,
        analysisType,
        provider: result.provider,
        model: result.model,
        parsedResume: JSON.stringify(result.parsedResume),
        domainDetection: JSON.stringify(result.domainDetection),
        seniorityLevel: JSON.stringify(result.seniorityLevel),
        skillExpansion: JSON.stringify(result.skillExpansion),
        jdParsing: JSON.stringify(result.jdParsing),
        jobMatch: JSON.stringify(result.jobMatch),
        achievements: JSON.stringify(result.achievements),
        atsScore: JSON.stringify(result.atsScore),
        gapAnalysis: JSON.stringify(result.gapAnalysis),
        improvements: JSON.stringify(result.improvements),
        interviewPrediction: JSON.stringify(result.interviewPrediction),
        recruiterInsights: JSON.stringify(result.recruiterInsights),
        masterResult: JSON.stringify(result),
        overallScore: result.overallScore,
        shortlistDecision: result.shortlistDecision,
        confidence: result.confidence,
      },
    });

    // Update candidate match score
    await db.candidate.update({
      where: { id: candidateId },
      data: {
        matchScore: result.overallScore,
        scoreBreakdown: JSON.stringify({
          skills: result.jobMatch.skillsMatch,
          experience: result.jobMatch.experienceMatch,
          education: result.jobMatch.educationMatch,
          culture: result.jobMatch.domainMatch,
          overall: result.overallScore,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        analysisId: analysis.id,
        candidateId,
        result,
      },
    });
  } catch (error: any) {
    console.error("HireMind analysis error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Analysis failed" },
      { status: 500 }
    );
  }
}

/**
 * Build a JD text string from a job record for analysis.
 */
function buildJDText(job: any): string {
  const requirements: string[] = JSON.parse(job.requirements || "[]");
  const responsibilities: string[] = JSON.parse(job.responsibilities || "[]");
  const skills: string[] = JSON.parse(job.skills || "[]");
  const benefits: string[] = JSON.parse(job.benefits || "[]");

  return [
    `# ${job.title}`,
    `Department: ${job.department}`,
    `Location: ${job.location}`,
    `Type: ${job.type}`,
    `Experience Level: ${job.experienceLevel}`,
    `Salary: ${job.salary}`,
    ``,
    `## Description`,
    job.description,
    ``,
    `## Requirements`,
    ...requirements.map((r: string, i: number) => `${i + 1}. ${r}`),
    ``,
    `## Responsibilities`,
    ...responsibilities.map((r: string, i: number) => `${i + 1}. ${r}`),
    ``,
    `## Skills`,
    ...skills.map((s: string) => `- ${s}`),
    ``,
    `## Benefits`,
    ...benefits.map((b: string) => `- ${b}`),
  ].join("\n");
}
