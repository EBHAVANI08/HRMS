import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/recruitment/candidates/[id] — Get a single candidate
 * PUT /api/recruitment/candidates/[id] — Update a candidate
 * DELETE /api/recruitment/candidates/[id] — Delete a candidate
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const candidate = await db.candidate.findUnique({
      where: { id },
      include: {
        job: true,
        aiAnalyses: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: "Candidate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...candidate,
        scoreBreakdown: JSON.parse(candidate.scoreBreakdown),
        timeline: JSON.parse(candidate.timeline),
        aiAnalyses: candidate.aiAnalyses.map((a) => ({
          ...a,
          parsedResume: JSON.parse(a.parsedResume),
          domainDetection: JSON.parse(a.domainDetection),
          seniorityLevel: JSON.parse(a.seniorityLevel),
          skillExpansion: JSON.parse(a.skillExpansion),
          jdParsing: JSON.parse(a.jdParsing),
          jobMatch: JSON.parse(a.jobMatch),
          achievements: JSON.parse(a.achievements),
          atsScore: JSON.parse(a.atsScore),
          gapAnalysis: JSON.parse(a.gapAnalysis),
          improvements: JSON.parse(a.improvements),
          interviewPrediction: JSON.parse(a.interviewPrediction),
          recruiterInsights: JSON.parse(a.recruiterInsights),
          masterResult: JSON.parse(a.masterResult),
        })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching candidate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch candidate" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: any = {};
    const allowedFields = [
      "name", "email", "phone", "stage", "source", "matchScore",
      "daysInStage", "appliedDate", "lastActivity", "location",
      "experience", "salary", "resumeText", "resumeFileName", "avatar", "role",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    // Handle JSON fields
    if (body.scoreBreakdown !== undefined) updateData.scoreBreakdown = JSON.stringify(body.scoreBreakdown);
    if (body.timeline !== undefined) updateData.timeline = JSON.stringify(body.timeline);

    const candidate = await db.candidate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...candidate,
        scoreBreakdown: JSON.parse(candidate.scoreBreakdown),
        timeline: JSON.parse(candidate.timeline),
      },
    });
  } catch (error: any) {
    console.error("Error updating candidate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update candidate" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.aIAnalysis.deleteMany({ where: { candidateId: id } });
    const candidate = await db.candidate.delete({ where: { id } });

    // Update job applicant count
    const applicantCount = await db.candidate.count({ where: { jobId: candidate.jobId } });
    await db.job.update({
      where: { id: candidate.jobId },
      data: { applicants: applicantCount },
    });

    return NextResponse.json({ success: true, message: "Candidate deleted" });
  } catch (error: any) {
    console.error("Error deleting candidate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete candidate" },
      { status: 500 }
    );
  }
}
