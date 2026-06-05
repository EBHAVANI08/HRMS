import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/recruitment/jobs/[id] — Get a single job
 * PUT /api/recruitment/jobs/[id] — Update a job
 * DELETE /api/recruitment/jobs/[id] — Delete a job
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await db.job.findUnique({
      where: { id },
      include: {
        candidates: true,
        aiAnalyses: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...job,
        requirements: JSON.parse(job.requirements),
        responsibilities: JSON.parse(job.responsibilities),
        skills: JSON.parse(job.skills),
        benefits: JSON.parse(job.benefits),
        candidates: job.candidates.map((c) => ({
          ...c,
          scoreBreakdown: JSON.parse(c.scoreBreakdown),
          timeline: JSON.parse(c.timeline),
        })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch job" },
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
      "title", "department", "location", "type", "status", "openings",
      "applicants", "daysOpen", "salary", "postedDate", "urgent",
      "hiringManager", "description", "experienceLevel",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    // Handle JSON array fields
    if (body.requirements !== undefined) updateData.requirements = JSON.stringify(body.requirements);
    if (body.responsibilities !== undefined) updateData.responsibilities = JSON.stringify(body.responsibilities);
    if (body.skills !== undefined) updateData.skills = JSON.stringify(body.skills);
    if (body.benefits !== undefined) updateData.benefits = JSON.stringify(body.benefits);

    const job = await db.job.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...job,
        requirements: JSON.parse(job.requirements),
        responsibilities: JSON.parse(job.responsibilities),
        skills: JSON.parse(job.skills),
        benefits: JSON.parse(job.benefits),
      },
    });
  } catch (error: any) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update job" },
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

    // Delete related records first
    await db.aIAnalysis.deleteMany({ where: { jobId: id } });
    await db.candidate.deleteMany({ where: { jobId: id } });
    await db.job.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Job deleted" });
  } catch (error: any) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete job" },
      { status: 500 }
    );
  }
}
