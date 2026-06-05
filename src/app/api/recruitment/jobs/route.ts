import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/recruitment/jobs — List all jobs (with optional filters)
 * POST /api/recruitment/jobs — Create a new job
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const department = searchParams.get("department");

    const where: any = {};
    if (status) where.status = status;
    if (department) where.department = department;

    const jobs = await db.job.findMany({
      where,
      include: {
        _count: { select: { candidates: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform to include applicant count from candidates relation
    const result = jobs.map((j) => ({
      ...j,
      applicants: j._count.candidates,
      requirements: JSON.parse(j.requirements),
      responsibilities: JSON.parse(j.responsibilities),
      skills: JSON.parse(j.skills),
      benefits: JSON.parse(j.benefits),
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error listing jobs:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title?.trim() || !body.department?.trim()) {
      return NextResponse.json(
        { success: false, error: "Title and department are required" },
        { status: 400 }
      );
    }

    const job = await db.job.create({
      data: {
        title: body.title.trim(),
        department: body.department.trim(),
        location: body.location || "Bangalore, IN",
        type: body.type || "Full-time",
        status: body.status || "draft",
        openings: body.openings || 1,
        salary: body.salary || "Competitive",
        urgent: body.urgent || false,
        hiringManager: body.hiringManager || "",
        description: body.description || "",
        requirements: JSON.stringify(body.requirements || []),
        responsibilities: JSON.stringify(body.responsibilities || []),
        experienceLevel: body.experienceLevel || "mid",
        skills: JSON.stringify(body.skills || []),
        benefits: JSON.stringify(body.benefits || []),
        postedDate: body.postedDate || new Date().toISOString().split("T")[0],
      },
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
    console.error("Error creating job:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create job" },
      { status: 500 }
    );
  }
}
