import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/recruitment/hiremind-analyze/[id] — Retrieve saved analysis results
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const analysis = await db.aIAnalysis.findUnique({
      where: { id },
      include: {
        candidate: true,
        job: true,
      },
    });

    if (!analysis) {
      return NextResponse.json(
        { success: false, error: "Analysis not found" },
        { status: 404 }
      );
    }

    // Parse all JSON fields
    return NextResponse.json({
      success: true,
      data: {
        ...analysis,
        parsedResume: JSON.parse(analysis.parsedResume),
        domainDetection: JSON.parse(analysis.domainDetection),
        seniorityLevel: JSON.parse(analysis.seniorityLevel),
        skillExpansion: JSON.parse(analysis.skillExpansion),
        jdParsing: JSON.parse(analysis.jdParsing),
        jobMatch: JSON.parse(analysis.jobMatch),
        achievements: JSON.parse(analysis.achievements),
        atsScore: JSON.parse(analysis.atsScore),
        gapAnalysis: JSON.parse(analysis.gapAnalysis),
        improvements: JSON.parse(analysis.improvements),
        interviewPrediction: JSON.parse(analysis.interviewPrediction),
        recruiterInsights: JSON.parse(analysis.recruiterInsights),
        masterResult: JSON.parse(analysis.masterResult),
        candidate: {
          ...analysis.candidate,
          scoreBreakdown: JSON.parse(analysis.candidate.scoreBreakdown),
          timeline: JSON.parse(analysis.candidate.timeline),
        },
        job: {
          ...analysis.job,
          requirements: JSON.parse(analysis.job.requirements),
          responsibilities: JSON.parse(analysis.job.responsibilities),
          skills: JSON.parse(analysis.job.skills),
          benefits: JSON.parse(analysis.job.benefits),
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching analysis:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}
