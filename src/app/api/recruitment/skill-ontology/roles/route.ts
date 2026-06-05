import { NextRequest, NextResponse } from "next/server";
import { getSkillOntologyEngine } from "@/lib/ai/skill-ontology-engine";
import { db } from "@/lib/db";

/**
 * POST /api/recruitment/skill-ontology/roles
 *
 * Detect job roles from a list of skills.
 *
 * Body: {
 *   skills: string[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.skills || !Array.isArray(body.skills)) {
      return NextResponse.json(
        { success: false, error: "skills array is required" },
        { status: 400 }
      );
    }

    const engine = getSkillOntologyEngine();
    const roles = await engine.detectRoles(body.skills);
    return NextResponse.json({
      success: true,
      data: roles,
    });
  } catch (error: any) {
    console.error("Role detection error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Role detection failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/recruitment/skill-ontology/roles
 *
 * List all job roles in the ontology, or get career path for a specific role.
 * Query params: ?role=ML Engineer (for career path) or ?all=true (list all)
 */
export async function GET(request: NextRequest) {
  try {
    const roleName = request.nextUrl.searchParams.get("role");

    if (roleName) {
      // Get career path for a specific role
      const engine = getSkillOntologyEngine();
      const careerPath = await engine.getCareerPath(roleName);
      return NextResponse.json({
        success: true,
        data: careerPath,
      });
    }

    // List all roles
    const roles = await db.jobRole.findMany({
      include: {
        roleSkills: {
          include: { skill: true },
          orderBy: { importance: "desc" },
        },
        careerPathFrom: {
          include: { toRole: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: roles,
      count: roles.length,
    });
  } catch (error: any) {
    console.error("Role list error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list roles" },
      { status: 500 }
    );
  }
}
