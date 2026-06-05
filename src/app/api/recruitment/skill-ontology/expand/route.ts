import { NextRequest, NextResponse } from "next/server";
import { getSkillOntologyEngine } from "@/lib/ai/skill-ontology-engine";

/**
 * POST /api/recruitment/skill-ontology/expand
 *
 * Expand a list of skills using the Skill Ontology Engine.
 * Uses DB-backed hierarchy + Ollama for unknowns.
 *
 * Body: {
 *   skills: string[],
 *   expandForJD?: boolean  (if true, expands JD skills to include sub-skills)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.skills || !Array.isArray(body.skills) || body.skills.length === 0) {
      return NextResponse.json(
        { success: false, error: "skills array is required" },
        { status: 400 }
      );
    }

    const engine = getSkillOntologyEngine();

    if (body.expandForJD) {
      // Expand JD skills — when JD says "Machine Learning", engine checks TensorFlow, PyTorch, etc.
      const result = await engine.expandJDSkills(body.skills);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // Expand resume skills — full expansion with role detection
    const result = await engine.expandSkills(body.skills);
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Skill ontology expand error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Expansion failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/recruitment/skill-ontology/expand?skill=Python
 *
 * Expand a single skill.
 */
export async function GET(request: NextRequest) {
  try {
    const skill = request.nextUrl.searchParams.get("skill");
    if (!skill) {
      return NextResponse.json(
        { success: false, error: "skill query parameter is required" },
        { status: 400 }
      );
    }

    const engine = getSkillOntologyEngine();
    const result = await engine.expandSingleSkill(skill);
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Skill ontology expand error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Expansion failed" },
      { status: 500 }
    );
  }
}
