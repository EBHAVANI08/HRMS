import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/recruitment/candidates — List candidates (with optional filters)
 * POST /api/recruitment/candidates — Create a new candidate
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const stage = searchParams.get("stage");
    const source = searchParams.get("source");

    const where: any = {};
    if (jobId) where.jobId = jobId;
    if (stage) where.stage = stage;
    if (source) where.source = source;

    const candidates = await db.candidate.findMany({
      where,
      include: { job: true },
      orderBy: { createdAt: "desc" },
    });

    const result = candidates.map((c) => ({
      ...c,
      scoreBreakdown: JSON.parse(c.scoreBreakdown),
      timeline: JSON.parse(c.timeline),
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error listing candidates:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Candidate name is required" },
        { status: 400 }
      );
    }

    if (!body.jobId) {
      return NextResponse.json(
        { success: false, error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Verify job exists
    const job = await db.job.findUnique({ where: { id: body.jobId } });
    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    const candidate = await db.candidate.create({
      data: {
        name: body.name.trim(),
        email: body.email || null,
        phone: body.phone || null,
        jobId: body.jobId,
        stage: body.stage || "sourced",
        source: body.source || "Website",
        matchScore: body.matchScore || 0,
        scoreBreakdown: JSON.stringify(body.scoreBreakdown || {}),
        daysInStage: body.daysInStage || 0,
        appliedDate: body.appliedDate || new Date().toISOString().split("T")[0],
        lastActivity: body.lastActivity || "Just now",
        location: body.location || "",
        experience: body.experience || "",
        salary: body.salary || "",
        timeline: JSON.stringify(body.timeline || []),
        resumeText: body.resumeText || null,
        resumeFileName: body.resumeFileName || null,
        avatar: body.avatar || "",
        role: body.role || "",
      },
    });

    // Update job applicant count
    const applicantCount = await db.candidate.count({ where: { jobId: body.jobId } });
    await db.job.update({
      where: { id: body.jobId },
      data: { applicants: applicantCount },
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
    console.error("Error creating candidate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create candidate" },
      { status: 500 }
    );
  }
}
