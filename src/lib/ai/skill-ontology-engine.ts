/**
 * Skill Ontology Engine — Database-backed + Ollama-powered
 *
 * Architecture:
 * - Database tables: Skill, SkillRelation, JobRole, RoleSkill, CareerPath
 * - Ollama LLM for expanding unknown skills (no hardcoded system prompts in frontend)
 * - RAG-style matching: uses skill hierarchy to find related skills
 * - Career path mapping: progression from role to role
 *
 * Flow:
 * 1. Resume Skills → Look up in DB → Expand with hierarchy (parents, children, related)
 * 2. Unknown skills → Ask Ollama to identify domain/parents/related → Save to DB
 * 3. Expanded skills → Match against JobRole requirements
 * 4. JD Skills → Expand using same ontology → Better matching coverage
 */

import { db } from "@/lib/db";

/* ──────────────── Types ──────────────── */

export interface SkillExpansionResult {
  original: string;
  fullForms: string[];
  parentSkills: string[];
  childSkills: string[];
  relatedSkills: string[];
  domain: string | null;
  subDomain: string | null;
  industry: string | null;
  applicableRoles: string[];
  seniorityIndicator: string | null;
}

export interface BulkExpansionResult {
  expansions: SkillExpansionResult[];
  allExpandedSkills: string[];
  detectedRoles: DetectedRole[];
}

export interface DetectedRole {
  role: string;
  matchScore: number; // 0-1
  isPrimary: boolean;
  matchedSkills: string[];
  missingCriticalSkills: string[];
}

export interface OllamaSkillResponse {
  skill: string;
  parent_skills: string[];
  sub_domain: string;
  domain: string;
  industry: string;
  related_skills: string[];
  job_roles: string[];
  seniority_indicator: string | null;
}

/* ──────────────── Ollama Provider ──────────────── */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:0.5b";

async function callOllama(prompt: string, systemPrompt: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        stream: false,
        options: { temperature: 0.2, num_predict: 1024 },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Ollama error: ${res.status}`);
    }

    const data = await res.json();
    return data.message?.content || "";
  } catch (error: any) {
    console.warn("[SkillOntology] Ollama unavailable:", error.message);
    return "";
  }
}

function safeParseJSON<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[1]); } catch { /* fall through */ }
    }
    const braceMatch = text.match(/(\{[\s\S]*\})/);
    if (braceMatch) {
      try { return JSON.parse(braceMatch[1]); } catch { /* fall through */ }
    }
    return fallback;
  }
}

/* ──────────────── Skill Ontology Engine ──────────────── */

export class SkillOntologyEngine {
  private cache: Map<string, SkillExpansionResult> = new Map();

  /**
   * Expand a list of skills using database hierarchy + Ollama for unknowns
   * This is the main entry point for the Skill Expansion Agent (Agent 4)
   */
  async expandSkills(skills: string[]): Promise<BulkExpansionResult> {
    const expansions: SkillExpansionResult[] = [];
    const allExpandedSkillsSet = new Set<string>();

    for (const skill of skills) {
      const expanded = await this.expandSingleSkill(skill);
      expansions.push(expanded);

      // Collect all expanded skills
      allExpandedSkillsSet.add(skill);
      expanded.fullForms.forEach(f => allExpandedSkillsSet.add(f));
      expanded.parentSkills.forEach(p => allExpandedSkillsSet.add(p));
      expanded.childSkills.forEach(c => allExpandedSkillsSet.add(c));
      expanded.relatedSkills.forEach(r => allExpandedSkillsSet.add(r));
    }

    // Detect roles from the expanded skill set
    const detectedRoles = await this.detectRoles(Array.from(allExpandedSkillsSet));

    return {
      expansions,
      allExpandedSkills: Array.from(allExpandedSkillsSet),
      detectedRoles,
    };
  }

  /**
   * Expand a single skill: DB lookup first, then Ollama if not found
   */
  async expandSingleSkill(skill: string): Promise<SkillExpansionResult> {
    const normalized = skill.trim().toLowerCase();

    // Check cache
    if (this.cache.has(normalized)) {
      return this.cache.get(normalized)!;
    }

    // Step 1: Look up in database — first by name, then by alias in metadata
    let dbSkill = await db.skill.findFirst({
      where: {
        OR: [
          { normalizedName: normalized },
          { name: skill.trim() },
        ],
      },
      include: {
        parentRelations: {
          include: { parentSkill: true },
          where: { relationType: { in: ["is_subskill_of", "is_alias_of"] } },
        },
        childRelations: {
          include: { childSkill: true },
          where: { relationType: "is_subskill_of" },
        },
        roleSkills: {
          include: { role: true },
        },
      },
    });

    // If not found by name, search by alias in metadata JSON
    if (!dbSkill) {
      const aliasMatch = await db.skill.findFirst({
        where: {
          metadata: { contains: `"${normalized}"` },
        },
        include: {
          parentRelations: {
            include: { parentSkill: true },
            where: { relationType: { in: ["is_subskill_of", "is_alias_of"] } },
          },
          childRelations: {
            include: { childSkill: true },
            where: { relationType: "is_subskill_of" },
          },
          roleSkills: {
            include: { role: true },
          },
        },
      });
      if (aliasMatch) {
        dbSkill = aliasMatch;
        // Add the original skill as a fullForm since we matched by alias
      }
    }

    if (dbSkill) {
      const result: SkillExpansionResult = {
        original: skill,
        fullForms: dbSkill.name !== skill.trim() ? [dbSkill.name] : [],
        parentSkills: dbSkill.parentRelations.map(r => r.parentSkill.name),
        childSkills: dbSkill.childRelations.map(r => r.childSkill.name),
        relatedSkills: [], // Will fetch related separately
        domain: dbSkill.domain,
        subDomain: dbSkill.subDomain,
        industry: dbSkill.industry,
        applicableRoles: dbSkill.roleSkills.map(rs => rs.role.name),
        seniorityIndicator: dbSkill.seniorityIndicator,
      };

      // Fetch related skills (is_related_to)
      const relatedRelations = await db.skillRelation.findMany({
        where: {
          OR: [
            { parentSkillId: dbSkill.id, relationType: "is_related_to" },
            { childSkillId: dbSkill.id, relationType: "is_related_to" },
          ],
        },
        include: {
          parentSkill: true,
          childSkill: true,
        },
      });

      result.relatedSkills = relatedRelations.map(r =>
        r.parentSkillId === dbSkill.id ? r.childSkill.name : r.parentSkill.name
      );

      // Also check for alias matches (metadata.aliases)
      try {
        const metadata = JSON.parse(dbSkill.metadata || "{}");
        if (metadata.aliases) {
          result.fullForms.push(...metadata.aliases.filter((a: string) => a.toLowerCase() !== normalized));
        }
      } catch { /* ignore */ }

      this.cache.set(normalized, result);
      return result;
    }

    // Step 2: Not in DB — use Ollama to expand
    console.log(`[SkillOntology] Skill "${skill}" not in DB, querying Ollama...`);
    const ollamaResult = await this.expandViaOllama(skill);

    if (ollamaResult) {
      // Save to database for future use
      await this.saveOllamaExpansion(skill, ollamaResult);

      const result: SkillExpansionResult = {
        original: skill,
        fullForms: ollamaResult.parent_skills,
        parentSkills: ollamaResult.parent_skills,
        childSkills: [],
        relatedSkills: ollamaResult.related_skills,
        domain: ollamaResult.domain,
        subDomain: ollamaResult.sub_domain,
        industry: ollamaResult.industry,
        applicableRoles: ollamaResult.job_roles,
        seniorityIndicator: ollamaResult.seniority_indicator,
      };

      this.cache.set(normalized, result);
      return result;
    }

    // Step 3: Fallback — return minimal expansion
    const fallback: SkillExpansionResult = {
      original: skill,
      fullForms: [],
      parentSkills: [],
      childSkills: [],
      relatedSkills: [],
      domain: null,
      subDomain: null,
      industry: null,
      applicableRoles: [],
      seniorityIndicator: null,
    };

    this.cache.set(normalized, fallback);
    return fallback;
  }

  /**
   * Ask Ollama to expand a skill using the Skill Ontology Agent prompt
   */
  private async expandViaOllama(skill: string): Promise<OllamaSkillResponse | null> {
    const systemPrompt = `You are a Universal Career Intelligence Engine.

For every skill identify:
1. Parent Skill (broader skill that encompasses this one)
2. Sub Domain
3. Domain
4. Industry
5. Related Skills (skills that frequently appear alongside this one)
6. Applicable Job Roles
7. Seniority Indicators (if this skill implies a certain experience level)

Return ONLY valid JSON matching this exact schema:
{
  "skill": "SkillName",
  "parent_skills": ["ParentSkill1", "ParentSkill2"],
  "sub_domain": "SubDomainName",
  "domain": "DomainName",
  "industry": "IndustryName",
  "related_skills": ["RelatedSkill1", "RelatedSkill2"],
  "job_roles": ["Role1", "Role2"],
  "seniority_indicator": null
}

Be accurate and specific. Use standard industry terminology.`;

    const prompt = `Identify the following skill in the universal career hierarchy:

Skill: ${skill}`;

    const response = await callOllama(prompt, systemPrompt);
    if (!response) return null;

    return safeParseJSON<OllamaSkillResponse>(response, null as any);
  }

  /**
   * Save Ollama-expanded skill data to the database
   */
  private async saveOllamaExpansion(skill: string, data: OllamaSkillResponse): Promise<void> {
    try {
      const normalizedName = skill.trim().toLowerCase();

      // Create or find the main skill
      const mainSkill = await db.skill.upsert({
        where: { normalizedName },
        create: {
          name: skill.trim(),
          normalizedName,
          skillType: "concrete",
          subDomain: data.sub_domain,
          domain: data.domain,
          industry: data.industry,
          source: "ollama",
        },
        update: {
          subDomain: data.sub_domain,
          domain: data.domain,
          industry: data.industry,
        },
      });

      // Create parent skills and relations
      for (const parentName of data.parent_skills) {
        const parentNormalized = parentName.trim().toLowerCase();
        const parentSkill = await db.skill.upsert({
          where: { normalizedName: parentNormalized },
          create: {
            name: parentName.trim(),
            normalizedName: parentNormalized,
            skillType: parentName === data.domain ? "domain" : "concrete",
            domain: data.domain,
            industry: data.industry,
            source: "ollama",
          },
          update: {},
        });

        await db.skillRelation.upsert({
          where: {
            parentSkillId_childSkillId_relationType: {
              parentSkillId: parentSkill.id,
              childSkillId: mainSkill.id,
              relationType: "is_subskill_of",
            },
          },
          create: {
            parentSkillId: parentSkill.id,
            childSkillId: mainSkill.id,
            relationType: "is_subskill_of",
            strength: 1.0,
          },
          update: {},
        });
      }

      // Create related skills and relations
      for (const relatedName of data.related_skills) {
        const relatedNormalized = relatedName.trim().toLowerCase();
        const relatedSkill = await db.skill.upsert({
          where: { normalizedName: relatedNormalized },
          create: {
            name: relatedName.trim(),
            normalizedName: relatedNormalized,
            skillType: "concrete",
            domain: data.domain,
            industry: data.industry,
            source: "ollama",
          },
          update: {},
        });

        await db.skillRelation.upsert({
          where: {
            parentSkillId_childSkillId_relationType: {
              parentSkillId: mainSkill.id,
              childSkillId: relatedSkill.id,
              relationType: "is_related_to",
            },
          },
          create: {
            parentSkillId: mainSkill.id,
            childSkillId: relatedSkill.id,
            relationType: "is_related_to",
            strength: 0.7,
          },
          update: {},
        });
      }

      // Create job roles and connect skills
      for (const roleName of data.job_roles) {
        const roleNormalized = roleName.trim().toLowerCase();
        const role = await db.jobRole.upsert({
          where: { normalizedName: roleNormalized },
          create: {
            name: roleName.trim(),
            normalizedName: roleNormalized,
            domain: data.domain,
            industry: data.industry,
            source: "ollama",
          },
          update: {},
        });

        await db.roleSkill.upsert({
          where: {
            roleId_skillId: {
              roleId: role.id,
              skillId: mainSkill.id,
            },
          },
          create: {
            roleId: role.id,
            skillId: mainSkill.id,
            importance: "important",
            source: "ollama",
          },
          update: {},
        });
      }

      console.log(`[SkillOntology] Saved Ollama expansion for "${skill}" to DB`);
    } catch (error: any) {
      console.error(`[SkillOntology] Failed to save expansion for "${skill}":`, error.message);
    }
  }

  /**
   * Detect roles from a list of skills — the Role Intelligence Agent
   */
  async detectRoles(skills: string[]): Promise<DetectedRole[]> {
    const normalizedSkills = skills.map(s => s.trim().toLowerCase());

    // Find all skills in DB that match
    const dbSkills = await db.skill.findMany({
      where: {
        normalizedName: { in: normalizedSkills },
      },
      include: {
        roleSkills: {
          include: { role: true },
        },
      },
    });

    // Aggregate role scores
    const roleScoreMap = new Map<string, {
      role: any;
      matchedSkillNames: string[];
      totalImportance: number;
    }>();

    for (const skill of dbSkills) {
      for (const rs of skill.roleSkills) {
        const existing = roleScoreMap.get(rs.roleId) || {
          role: rs.role,
          matchedSkillNames: [],
          totalImportance: 0,
        };

        if (!existing.matchedSkillNames.includes(skill.name)) {
          existing.matchedSkillNames.push(skill.name);
          const importanceWeight = rs.importance === "critical" ? 3 : rs.importance === "important" ? 2 : 1;
          existing.totalImportance += importanceWeight;
        }

        roleScoreMap.set(rs.roleId, existing);
      }
    }

    // Also check roles that have skills matching our expanded set
    // Find roles where many of their required skills are in our skill set
    const allRoles = await db.jobRole.findMany({
      include: {
        roleSkills: {
          include: { skill: true },
        },
      },
    });

    for (const role of allRoles) {
      if (roleScoreMap.has(role.id)) continue; // Already scored

      let matchedCount = 0;
      const matchedSkills: string[] = [];
      const criticalSkills = role.roleSkills.filter(rs => rs.importance === "critical");

      for (const rs of role.roleSkills) {
        if (normalizedSkills.includes(rs.skill.normalizedName)) {
          matchedCount++;
          matchedSkills.push(rs.skill.name);
        }
      }

      // Only include if at least 2 skills match or 1 critical skill matches
      if (matchedCount >= 2 || (criticalSkills.length > 0 && matchedSkills.length >= 1)) {
        const matchScore = role.roleSkills.length > 0
          ? matchedCount / role.roleSkills.length
          : 0;

        roleScoreMap.set(role.id, {
          role,
          matchedSkillNames: matchedSkills,
          totalImportance: matchedCount * 2,
        });
      }
    }

    // Sort by score and return top roles
    const results = Array.from(roleScoreMap.entries())
      .map(([roleId, data]) => {
        const totalSkills = data.role.roleSkills?.length || 1;
        const matchScore = Math.min(data.matchedSkillNames.length / totalSkills, 1);

        return {
          role: data.role.name,
          matchScore,
          isPrimary: false,
          matchedSkills: data.matchedSkillNames,
          missingCriticalSkills: this.getMissingCriticalSkills(data.role, normalizedSkills),
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    // Mark the top role as primary
    if (results.length > 0) {
      results[0].isPrimary = true;
    }

    // If no roles detected from DB, try Ollama
    if (results.length === 0 && normalizedSkills.length > 0) {
      console.log("[SkillOntology] No roles detected from DB, querying Ollama...");
      const ollamaRoles = await this.detectRolesViaOllama(skills);
      return ollamaRoles;
    }

    return results;
  }

  /**
   * Use Ollama for role detection when DB doesn't have enough data
   */
  private async detectRolesViaOllama(skills: string[]): Promise<DetectedRole[]> {
    const systemPrompt = `You are a Role Intelligence Agent.

Given a list of skills, identify the most suitable job roles.

Return ONLY valid JSON:
{
  "primary_role": "Role Name",
  "secondary_roles": ["Role 2", "Role 3"],
  "industry": "Industry",
  "domain": "Domain",
  "role_details": [
    {
      "role": "Role Name",
      "match_score": 0.9,
      "matched_skills": ["skill1"],
      "missing_critical_skills": ["skill2"]
    }
  ]
}

Return up to 10 matching roles. Be specific with role names.`;

    const prompt = `Given these skills:\n${skills.join("\n")}\n\nIdentify the primary and secondary roles.`;

    const response = await callOllama(prompt, systemPrompt);
    if (!response) return [];

    const parsed = safeParseJSON<{
      primary_role: string;
      secondary_roles: string[];
      role_details: { role: string; match_score: number; matched_skills: string[]; missing_critical_skills: string[] }[];
    }>(response, { primary_role: "", secondary_roles: [], role_details: [] });

    if (parsed.role_details && parsed.role_details.length > 0) {
      return parsed.role_details.map((rd, i) => ({
        role: rd.role,
        matchScore: rd.match_score || 0.5,
        isPrimary: i === 0,
        matchedSkills: rd.matched_skills || [],
        missingCriticalSkills: rd.missing_critical_skills || [],
      }));
    }

    // Fallback: construct from primary/secondary roles
    const roles: DetectedRole[] = [];
    if (parsed.primary_role) {
      roles.push({
        role: parsed.primary_role,
        matchScore: 0.85,
        isPrimary: true,
        matchedSkills: skills,
        missingCriticalSkills: [],
      });
    }
    for (const sr of parsed.secondary_roles || []) {
      roles.push({
        role: sr,
        matchScore: 0.5,
        isPrimary: false,
        matchedSkills: skills,
        missingCriticalSkills: [],
      });
    }

    return roles;
  }

  /**
   * Get missing critical skills for a role
   */
  private getMissingCriticalSkills(role: any, normalizedSkills: string[]): string[] {
    if (!role.roleSkills) return [];
    return role.roleSkills
      .filter((rs: any) =>
        rs.importance === "critical" &&
        !normalizedSkills.includes(rs.skill.normalizedName)
      )
      .map((rs: any) => rs.skill.name);
  }

  /**
   * Expand JD skills using the same ontology — enables dynamic matching
   * When JD says "Machine Learning", engine checks: TensorFlow, PyTorch, Scikit-Learn, etc.
   */
  async expandJDSkills(jdSkills: string[]): Promise<{
    originalSkills: string[];
    expandedSkills: string[];
    expansions: SkillExpansionResult[];
  }> {
    const expansions: SkillExpansionResult[] = [];
    const allSkills = new Set<string>(jdSkills);

    for (const skill of jdSkills) {
      const expanded = await this.expandSingleSkill(skill);
      expansions.push(expanded);

      // Add child skills (when JD says "Machine Learning", candidate with TensorFlow gets credit)
      expanded.childSkills.forEach(c => allSkills.add(c));
      expanded.relatedSkills.forEach(r => allSkills.add(r));
      expanded.fullForms.forEach(f => allSkills.add(f));
    }

    return {
      originalSkills: jdSkills,
      expandedSkills: Array.from(allSkills),
      expansions,
    };
  }

  /**
   * Get career path for a given role
   */
  async getCareerPath(roleName: string): Promise<{
    current: string;
    nextRoles: { role: string; typicalYears: string; description: string }[];
  }> {
    const normalized = roleName.trim().toLowerCase();
    const role = await db.jobRole.findFirst({
      where: { normalizedName: normalized },
      include: {
        careerPathFrom: {
          include: { toRole: true },
        },
      },
    });

    if (!role) {
      return { current: roleName, nextRoles: [] };
    }

    return {
      current: role.name,
      nextRoles: role.careerPathFrom.map(cp => ({
        role: cp.toRole.name,
        typicalYears: cp.typicalYears || "Unknown",
        description: cp.description || "",
      })),
    };
  }

  /**
   * Check Ollama availability
   */
  async isOllamaAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: controller.signal });
      clearTimeout(timeout);
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/* ──────────────── Singleton ──────────────── */

let engineInstance: SkillOntologyEngine | null = null;

export function getSkillOntologyEngine(): SkillOntologyEngine {
  if (!engineInstance) {
    engineInstance = new SkillOntologyEngine();
  }
  return engineInstance;
}
