import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/recruitment/skill-ontology/seed
 *
 * Seed the database with initial skill ontology data.
 * Body: { reset?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const reset = body.reset || false;

    if (reset) {
      await db.careerPath.deleteMany({});
      await db.roleSkill.deleteMany({});
      await db.skillRelation.deleteMany({});
      await db.jobRole.deleteMany({});
      await db.skill.deleteMany({});
    }

    const existingSkills = await db.skill.count();
    if (existingSkills > 50 && !reset) {
      return NextResponse.json({
        success: true,
        message: `Already seeded with ${existingSkills} skills. Use reset=true to re-seed.`,
        stats: await getStats(),
      });
    }

    const stats = await seedOntology();

    return NextResponse.json({
      success: true,
      message: "Skill ontology seeded successfully",
      stats,
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Seeding failed" },
      { status: 500 }
    );
  }
}

async function getStats() {
  const [skills, relations, roles, roleSkills, careerPaths] = await Promise.all([
    db.skill.count(), db.skillRelation.count(), db.jobRole.count(),
    db.roleSkill.count(), db.careerPath.count(),
  ]);
  return { skills, relations, roles, roleSkills, careerPaths };
}

async function seedOntology() {
  let skillsCreated = 0;
  let relationsCreated = 0;
  let rolesCreated = 0;
  let roleSkillsCreated = 0;
  let careerPathsCreated = 0;

  async function ensureSkill(name: string, opts: {
    skillType?: string; subDomain?: string; domain?: string;
    industry?: string; seniorityIndicator?: string; aliases?: string[];
  } = {}) {
    const normalizedName = name.trim().toLowerCase();
    const skill = await db.skill.upsert({
      where: { normalizedName },
      create: {
        name: name.trim(), normalizedName,
        skillType: opts.skillType || "concrete",
        subDomain: opts.subDomain || null, domain: opts.domain || null,
        industry: opts.industry || null,
        seniorityIndicator: opts.seniorityIndicator || null,
        source: "seed",
        metadata: JSON.stringify({ aliases: opts.aliases || [] }),
      },
      update: {},
    });
    skillsCreated++;
    return skill;
  }

  async function ensureRelation(parentId: string, childId: string, type: string, strength = 1.0) {
    try {
      await db.skillRelation.upsert({
        where: { parentSkillId_childSkillId_relationType: { parentSkillId: parentId, childSkillId: childId, relationType: type } },
        create: { parentSkillId: parentId, childSkillId: childId, relationType: type, strength },
        update: {},
      });
      relationsCreated++;
    } catch { /* ignore */ }
  }

  async function ensureRole(name: string, opts: {
    department?: string; domain?: string; industry?: string;
    seniority?: string; salaryRange?: string; description?: string;
  } = {}) {
    const normalizedName = name.trim().toLowerCase();
    const role = await db.jobRole.upsert({
      where: { normalizedName },
      create: {
        name: name.trim(), normalizedName,
        department: opts.department || null, domain: opts.domain || null,
        industry: opts.industry || null, seniority: opts.seniority || "mid",
        salaryRange: opts.salaryRange || null, description: opts.description || null,
        source: "seed",
      },
      update: {},
    });
    rolesCreated++;
    return role;
  }

  async function ensureRoleSkill(roleId: string, skillId: string, importance: string) {
    try {
      await db.roleSkill.upsert({
        where: { roleId_skillId: { roleId, skillId } },
        create: { roleId, skillId, importance, source: "seed" },
        update: {},
      });
      roleSkillsCreated++;
    } catch { /* ignore */ }
  }

  async function ensureCareerPath(fromRoleId: string, toRoleId: string, typicalYears: string, description: string) {
    try {
      await db.careerPath.upsert({
        where: { fromRoleId_toRoleId: { fromRoleId, toRoleId } },
        create: { fromRoleId, toRoleId, typicalYears, description },
        update: {},
      });
      careerPathsCreated++;
    } catch { /* ignore */ }
  }

  console.log("[Seed] Starting skill ontology seeding...");

  // ═══════════════════════════════════════
  // CROSS-DOMAIN SKILLS (shared across domains)
  // ═══════════════════════════════════════

  const techIndustry = "Technology";

  const sPython = await ensureSkill("Python", { domain: "Software Engineering", industry: techIndustry });
  const sSQL = await ensureSkill("SQL", { domain: "Data Engineering", industry: techIndustry, aliases: ["Structured Query Language"] });
  const sGit = await ensureSkill("Git", { subDomain: "Version Control", domain: "Software Engineering", industry: techIndustry });
  const sDocker = await ensureSkill("Docker", { subDomain: "DevOps", domain: "Software Engineering", industry: techIndustry, aliases: ["Containerization"] });
  const sK8s = await ensureSkill("Kubernetes", { subDomain: "DevOps", domain: "Software Engineering", industry: techIndustry, aliases: ["K8s"] });
  const sAWS = await ensureSkill("AWS", { subDomain: "Cloud Computing", domain: "Software Engineering", industry: techIndustry, aliases: ["Amazon Web Services"] });
  const sGCP = await ensureSkill("GCP", { subDomain: "Cloud Computing", domain: "Software Engineering", industry: techIndustry, aliases: ["Google Cloud Platform"] });
  const sCI_CD = await ensureSkill("CI/CD", { subDomain: "DevOps", domain: "Software Engineering", industry: techIndustry, aliases: ["CICD", "Continuous Integration/Continuous Deployment"] });
  const sTerraform = await ensureSkill("Terraform", { subDomain: "Infrastructure as Code", domain: "Software Engineering", industry: techIndustry });
  const sSystemDesign = await ensureSkill("System Design", { subDomain: "Architecture", domain: "Software Engineering", industry: techIndustry });
  const sMicroservices = await ensureSkill("Microservices", { subDomain: "Architecture", domain: "Software Engineering", industry: techIndustry });
  const sREST = await ensureSkill("REST API", { subDomain: "API Design", domain: "Software Engineering", industry: techIndustry, aliases: ["REST", "RESTful API"] });
  const sGraphQL = await ensureSkill("GraphQL", { subDomain: "API Design", domain: "Software Engineering", industry: techIndustry });
  const sPostgreSQL = await ensureSkill("PostgreSQL", { subDomain: "Databases", domain: "Software Engineering", industry: techIndustry });
  const sMongoDB = await ensureSkill("MongoDB", { subDomain: "Databases", domain: "Software Engineering", industry: techIndustry });
  const sRedis = await ensureSkill("Redis", { subDomain: "Databases", domain: "Software Engineering", industry: techIndustry });

  // ═══════════════════════════════════════
  // AI / MACHINE LEARNING DOMAIN
  // ═══════════════════════════════════════

  const aiDomain = "Artificial Intelligence";

  const sAI = await ensureSkill("Artificial Intelligence", { skillType: "industry", domain: aiDomain, industry: techIndustry, aliases: ["AI"] });
  const sML = await ensureSkill("Machine Learning", { skillType: "domain", subDomain: "Machine Learning", domain: aiDomain, industry: techIndustry, aliases: ["ML"] });
  const sDL = await ensureSkill("Deep Learning", { skillType: "domain", subDomain: "Deep Learning", domain: aiDomain, industry: techIndustry, aliases: ["DL"] });
  const sNLP = await ensureSkill("Natural Language Processing", { skillType: "domain", subDomain: "NLP", domain: aiDomain, industry: techIndustry, aliases: ["NLP"] });
  const sCV = await ensureSkill("Computer Vision", { skillType: "domain", subDomain: "Computer Vision", domain: aiDomain, industry: techIndustry, aliases: ["CV"] });
  const sGenAI = await ensureSkill("Generative AI", { skillType: "domain", subDomain: "Generative AI", domain: aiDomain, industry: techIndustry, aliases: ["GenAI"] });
  const sLLMs = await ensureSkill("Large Language Models", { subDomain: "Generative AI", domain: aiDomain, industry: techIndustry, aliases: ["LLM", "LLMs"] });
  const sRAG = await ensureSkill("Retrieval-Augmented Generation", { subDomain: "Generative AI", domain: aiDomain, industry: techIndustry, aliases: ["RAG"] });
  const sMLOps = await ensureSkill("MLOps", { subDomain: "Machine Learning Operations", domain: aiDomain, industry: techIndustry, aliases: ["ML Ops"] });
  const sRL = await ensureSkill("Reinforcement Learning", { subDomain: "Machine Learning", domain: aiDomain, industry: techIndustry, aliases: ["RL"] });
  const sTF = await ensureSkill("TensorFlow", { subDomain: "Deep Learning", domain: aiDomain, industry: techIndustry });
  const sPT = await ensureSkill("PyTorch", { subDomain: "Deep Learning", domain: aiDomain, industry: techIndustry });
  const sSKLearn = await ensureSkill("scikit-learn", { subDomain: "Machine Learning", domain: aiDomain, industry: techIndustry });
  const sXGBoost = await ensureSkill("XGBoost", { subDomain: "Machine Learning", domain: aiDomain, industry: techIndustry });
  const sHF = await ensureSkill("Hugging Face", { subDomain: "NLP", domain: aiDomain, industry: techIndustry, aliases: ["HuggingFace"] });
  const sTransformers = await ensureSkill("Transformers", { subDomain: "NLP", domain: aiDomain, industry: techIndustry, aliases: ["Transformer Architecture"] });
  const sLangChain = await ensureSkill("LangChain", { subDomain: "Generative AI", domain: aiDomain, industry: techIndustry });
  const sLlamaIndex = await ensureSkill("LlamaIndex", { subDomain: "Generative AI", domain: aiDomain, industry: techIndustry });
  const sPEFT = await ensureSkill("PEFT", { subDomain: "Deep Learning", domain: aiDomain, industry: techIndustry, aliases: ["Parameter-Efficient Fine-Tuning"] });
  const sLoRA = await ensureSkill("LoRA", { subDomain: "Deep Learning", domain: aiDomain, industry: techIndustry, aliases: ["Low-Rank Adaptation"] });
  const sFineTuning = await ensureSkill("Fine-Tuning", { subDomain: "Deep Learning", domain: aiDomain, industry: techIndustry });
  const sPromptEng = await ensureSkill("Prompt Engineering", { subDomain: "Generative AI", domain: aiDomain, industry: techIndustry });
  const sPandas = await ensureSkill("Pandas", { subDomain: "Data Analysis", domain: aiDomain, industry: techIndustry });
  const sNumPy = await ensureSkill("NumPy", { subDomain: "Data Analysis", domain: aiDomain, industry: techIndustry });
  const sEDA = await ensureSkill("Exploratory Data Analysis", { subDomain: "Data Analysis", domain: aiDomain, industry: techIndustry, aliases: ["EDA"] });
  const sFeatureEng = await ensureSkill("Feature Engineering", { subDomain: "Machine Learning", domain: aiDomain, industry: techIndustry });

  // AI Relations
  await ensureRelation(sAI.id, sML.id, "is_subskill_of");
  await ensureRelation(sAI.id, sDL.id, "is_subskill_of");
  await ensureRelation(sAI.id, sNLP.id, "is_subskill_of");
  await ensureRelation(sAI.id, sCV.id, "is_subskill_of");
  await ensureRelation(sAI.id, sGenAI.id, "is_subskill_of");
  await ensureRelation(sML.id, sDL.id, "is_subskill_of");
  await ensureRelation(sML.id, sRL.id, "is_subskill_of");
  await ensureRelation(sML.id, sFeatureEng.id, "is_subskill_of");
  await ensureRelation(sDL.id, sTF.id, "is_subskill_of");
  await ensureRelation(sDL.id, sPT.id, "is_subskill_of");
  await ensureRelation(sDL.id, sLLMs.id, "is_subskill_of");
  await ensureRelation(sNLP.id, sTransformers.id, "is_subskill_of");
  await ensureRelation(sNLP.id, sHF.id, "is_subskill_of");
  await ensureRelation(sGenAI.id, sLLMs.id, "is_subskill_of");
  await ensureRelation(sGenAI.id, sRAG.id, "is_subskill_of");
  await ensureRelation(sGenAI.id, sPromptEng.id, "is_subskill_of");
  await ensureRelation(sLLMs.id, sFineTuning.id, "is_subskill_of");
  await ensureRelation(sLLMs.id, sPEFT.id, "is_subskill_of");
  await ensureRelation(sPEFT.id, sLoRA.id, "is_subskill_of");
  await ensureRelation(sRAG.id, sLangChain.id, "is_subskill_of");
  await ensureRelation(sRAG.id, sLlamaIndex.id, "is_subskill_of");
  await ensureRelation(sML.id, sMLOps.id, "is_subskill_of");
  await ensureRelation(sML.id, sSKLearn.id, "is_subskill_of");
  await ensureRelation(sML.id, sXGBoost.id, "is_subskill_of");
  await ensureRelation(sPython.id, sPandas.id, "is_subskill_of");
  await ensureRelation(sPython.id, sNumPy.id, "is_subskill_of");
  await ensureRelation(sPython.id, sTF.id, "is_subskill_of");
  await ensureRelation(sPython.id, sPT.id, "is_subskill_of");
  await ensureRelation(sTF.id, sPT.id, "is_related_to", 0.9);
  await ensureRelation(sLangChain.id, sLlamaIndex.id, "is_related_to", 0.85);
  await ensureRelation(sPandas.id, sNumPy.id, "is_related_to", 0.9);
  await ensureRelation(sSKLearn.id, sXGBoost.id, "is_related_to", 0.8);
  await ensureRelation(sNLP.id, sCV.id, "is_related_to", 0.6);
  await ensureRelation(sML.id, sMLOps.id, "is_related_to", 0.85);

  // ═══════════════════════════════════════
  // FRONTEND / BACKEND DOMAIN
  // ═══════════════════════════════════════

  const seDomain = "Software Engineering";

  const sJavaScript = await ensureSkill("JavaScript", { subDomain: "Programming Languages", domain: seDomain, industry: techIndustry, aliases: ["JS"] });
  const sTypeScript = await ensureSkill("TypeScript", { subDomain: "Programming Languages", domain: seDomain, industry: techIndustry });
  const sReact = await ensureSkill("React", { subDomain: "Frontend Framework", domain: seDomain, industry: techIndustry });
  const sNextJS = await ensureSkill("Next.js", { subDomain: "Frontend Framework", domain: seDomain, industry: techIndustry });
  const sNodeJS = await ensureSkill("Node.js", { subDomain: "Backend Framework", domain: seDomain, industry: techIndustry });
  const sExpress = await ensureSkill("Express", { subDomain: "Backend Framework", domain: seDomain, industry: techIndustry });
  const sFastAPI = await ensureSkill("FastAPI", { subDomain: "Backend Framework", domain: seDomain, industry: techIndustry });
  const sFlask = await ensureSkill("Flask", { subDomain: "Backend Framework", domain: seDomain, industry: techIndustry });
  const sTailwind = await ensureSkill("Tailwind CSS", { subDomain: "Frontend Framework", domain: seDomain, industry: techIndustry });
  const sRedux = await ensureSkill("Redux", { subDomain: "State Management", domain: seDomain, industry: techIndustry });
  const sZustand = await ensureSkill("Zustand", { subDomain: "State Management", domain: seDomain, industry: techIndustry });
  const sHTML_CSS = await ensureSkill("HTML/CSS", { subDomain: "Frontend Basics", domain: seDomain, industry: techIndustry, aliases: ["HTML", "CSS", "HTML5", "CSS3"] });

  // SE Relations
  await ensureRelation(sJavaScript.id, sTypeScript.id, "is_subskill_of");
  await ensureRelation(sJavaScript.id, sReact.id, "is_subskill_of");
  await ensureRelation(sReact.id, sNextJS.id, "is_subskill_of");
  await ensureRelation(sPython.id, sFastAPI.id, "is_subskill_of");
  await ensureRelation(sPython.id, sFlask.id, "is_subskill_of");
  await ensureRelation(sNodeJS.id, sExpress.id, "is_subskill_of");
  await ensureRelation(sReact.id, sRedux.id, "is_subskill_of");
  await ensureRelation(sReact.id, sZustand.id, "is_subskill_of");
  await ensureRelation(sAWS.id, sTerraform.id, "is_subskill_of");
  await ensureRelation(sDocker.id, sK8s.id, "is_subskill_of");
  await ensureRelation(sCI_CD.id, sDocker.id, "is_related_to", 0.8);
  await ensureRelation(sReact.id, sTailwind.id, "is_related_to", 0.8);
  await ensureRelation(sNodeJS.id, sExpress.id, "is_related_to", 0.9);
  await ensureRelation(sPostgreSQL.id, sMongoDB.id, "is_related_to", 0.6);
  await ensureRelation(sREST.id, sGraphQL.id, "is_related_to", 0.7);
  await ensureRelation(sAWS.id, sGCP.id, "is_related_to", 0.85);

  // ═══════════════════════════════════════
  // HR DOMAIN
  // ═══════════════════════════════════════

  const hrDomain = "Human Resources";
  const hrIndustry = "Business Operations";

  const sRecruitment = await ensureSkill("Recruitment", { subDomain: "Talent Acquisition", domain: hrDomain, industry: hrIndustry });
  const sTalentAcq = await ensureSkill("Talent Acquisition", { subDomain: "Talent Acquisition", domain: hrDomain, industry: hrIndustry });
  const sOnboarding = await ensureSkill("Onboarding", { subDomain: "Employee Lifecycle", domain: hrDomain, industry: hrIndustry });
  const sPayroll = await ensureSkill("Payroll", { subDomain: "Compensation", domain: hrDomain, industry: hrIndustry });
  const sPerfMgmt = await ensureSkill("Performance Management", { subDomain: "Employee Development", domain: hrDomain, industry: hrIndustry });
  const sEmployeeRel = await ensureSkill("Employee Relations", { subDomain: "Employee Relations", domain: hrDomain, industry: hrIndustry });
  const sHRAnalytics = await ensureSkill("HR Analytics", { subDomain: "HR Technology", domain: hrDomain, industry: hrIndustry });
  const sLaborLaw = await ensureSkill("Labor Law", { subDomain: "Compliance", domain: hrDomain, industry: hrIndustry });
  const sCompBen = await ensureSkill("Compensation & Benefits", { subDomain: "Compensation", domain: hrDomain, industry: hrIndustry });

  // HR Relations
  await ensureRelation(sTalentAcq.id, sRecruitment.id, "is_subskill_of");
  await ensureRelation(sRecruitment.id, sOnboarding.id, "is_related_to", 0.7);
  await ensureRelation(sPayroll.id, sCompBen.id, "is_related_to", 0.8);

  // ═══════════════════════════════════════
  // ROLES & ROLE-SKILL CONNECTIONS
  // ═══════════════════════════════════════

  // AI Roles
  const rAIFresher = await ensureRole("AI Developer - Fresher", { department: "AI & Machine Learning", domain: aiDomain, industry: techIndustry, seniority: "fresher", salaryRange: "₹6-10 LPA", description: "Entry-level AI developer" });
  const rMLEngineer = await ensureRole("ML Engineer", { department: "AI & Machine Learning", domain: aiDomain, industry: techIndustry, seniority: "mid", salaryRange: "₹15-25 LPA", description: "Builds and deploys ML models" });
  const rAIEngineer = await ensureRole("AI Engineer", { department: "AI & Machine Learning", domain: aiDomain, industry: techIndustry, seniority: "mid", salaryRange: "₹15-28 LPA", description: "Develops AI systems" });
  const rDataScientist = await ensureRole("Data Scientist", { department: "Analytics", domain: "Data Science", industry: techIndustry, seniority: "mid", salaryRange: "₹18-30 LPA", description: "Analyzes data and builds predictive models" });
  const rMLEad = await ensureRole("Senior ML Engineer", { department: "AI & Machine Learning", domain: aiDomain, industry: techIndustry, seniority: "senior", salaryRange: "₹30-50 LPA", description: "Leads ML architecture" });
  const rMLOpsEng = await ensureRole("MLOps Engineer", { department: "AI & Machine Learning", domain: aiDomain, industry: techIndustry, seniority: "mid", salaryRange: "₹20-35 LPA", description: "Manages ML infrastructure" });
  const rNLP_Engineer = await ensureRole("NLP Engineer", { department: "AI & Machine Learning", domain: aiDomain, industry: techIndustry, seniority: "mid", salaryRange: "₹18-30 LPA", description: "Builds NLP systems" });

  // SE Roles
  const rFrontendDev = await ensureRole("Frontend Developer", { department: "Engineering", domain: seDomain, industry: techIndustry, seniority: "mid", salaryRange: "₹12-22 LPA" });
  const rSeniorFE = await ensureRole("Senior Frontend Developer", { department: "Engineering", domain: seDomain, industry: techIndustry, seniority: "senior", salaryRange: "₹25-35 LPA" });
  const rBackendDev = await ensureRole("Backend Developer", { department: "Engineering", domain: seDomain, industry: techIndustry, seniority: "mid", salaryRange: "₹15-25 LPA" });
  const rFullStack = await ensureRole("Full Stack Developer", { department: "Engineering", domain: seDomain, industry: techIndustry, seniority: "mid", salaryRange: "₹18-30 LPA" });
  const rDevOps = await ensureRole("DevOps Engineer", { department: "Engineering", domain: seDomain, industry: techIndustry, seniority: "mid", salaryRange: "₹20-35 LPA" });
  const rQA = await ensureRole("QA Engineer", { department: "Engineering", domain: seDomain, industry: techIndustry, seniority: "mid", salaryRange: "₹10-18 LPA" });

  // HR Roles
  const rRecruiter = await ensureRole("Recruiter", { department: "HR & Admin", domain: hrDomain, industry: hrIndustry, seniority: "mid", salaryRange: "₹6-12 LPA" });
  const rHRManager = await ensureRole("HR Manager", { department: "HR & Admin", domain: hrDomain, industry: hrIndustry, seniority: "senior", salaryRange: "₹15-25 LPA" });
  const rHRBP = await ensureRole("HR Business Partner", { department: "HR & Admin", domain: hrDomain, industry: hrIndustry, seniority: "senior", salaryRange: "₹18-28 LPA" });
  const rHRDirector = await ensureRole("HR Director", { department: "HR & Admin", domain: hrDomain, industry: hrIndustry, seniority: "director", salaryRange: "₹35-50 LPA" });
  const rCHRO = await ensureRole("CHRO", { department: "HR & Admin", domain: hrDomain, industry: hrIndustry, seniority: "director", salaryRange: "₹60-100 LPA" });

  // ═══════════════════════════════════════
  // ROLE-SKILL CONNECTIONS
  // ═══════════════════════════════════════

  // AI role skills
  const allRoleSkills: [string, string, string][] = [
    // ML Engineer
    [rMLEngineer.id, sPython.id, "critical"], [rMLEngineer.id, sML.id, "critical"],
    [rMLEngineer.id, sSKLearn.id, "important"], [rMLEngineer.id, sPandas.id, "important"],
    [rMLEngineer.id, sNumPy.id, "important"], [rMLEngineer.id, sSQL.id, "important"],
    [rMLEngineer.id, sTF.id, "nice-to-have"], [rMLEngineer.id, sPT.id, "nice-to-have"],
    [rMLEngineer.id, sFeatureEng.id, "important"], [rMLEngineer.id, sXGBoost.id, "nice-to-have"],
    [rMLEngineer.id, sMLOps.id, "nice-to-have"], [rMLEngineer.id, sGit.id, "important"],
    // AI Engineer
    [rAIEngineer.id, sPython.id, "critical"], [rAIEngineer.id, sML.id, "critical"],
    [rAIEngineer.id, sDL.id, "critical"], [rAIEngineer.id, sTF.id, "important"],
    [rAIEngineer.id, sPT.id, "important"], [rAIEngineer.id, sNLP.id, "important"],
    [rAIEngineer.id, sLLMs.id, "important"], [rAIEngineer.id, sMLOps.id, "important"],
    [rAIEngineer.id, sRAG.id, "nice-to-have"], [rAIEngineer.id, sSQL.id, "nice-to-have"],
    // Data Scientist
    [rDataScientist.id, sPython.id, "critical"], [rDataScientist.id, sML.id, "critical"],
    [rDataScientist.id, sSQL.id, "critical"], [rDataScientist.id, sPandas.id, "critical"],
    [rDataScientist.id, sNumPy.id, "critical"], [rDataScientist.id, sEDA.id, "important"],
    [rDataScientist.id, sSKLearn.id, "important"], [rDataScientist.id, sFeatureEng.id, "important"],
    // Senior ML Engineer
    [rMLEad.id, sPython.id, "critical"], [rMLEad.id, sML.id, "critical"],
    [rMLEad.id, sDL.id, "critical"], [rMLEad.id, sMLOps.id, "critical"],
    [rMLEad.id, sLLMs.id, "important"], [rMLEad.id, sRAG.id, "important"],
    [rMLEad.id, sSystemDesign.id, "critical"],
    // MLOps Engineer
    [rMLOpsEng.id, sPython.id, "critical"], [rMLOpsEng.id, sMLOps.id, "critical"],
    [rMLOpsEng.id, sDocker.id, "critical"], [rMLOpsEng.id, sK8s.id, "important"],
    [rMLOpsEng.id, sAWS.id, "important"], [rMLOpsEng.id, sML.id, "important"],
    // NLP Engineer
    [rNLP_Engineer.id, sPython.id, "critical"], [rNLP_Engineer.id, sNLP.id, "critical"],
    [rNLP_Engineer.id, sTransformers.id, "critical"], [rNLP_Engineer.id, sHF.id, "important"],
    [rNLP_Engineer.id, sLLMs.id, "important"], [rNLP_Engineer.id, sPT.id, "important"],
    // AI Fresher
    [rAIFresher.id, sPython.id, "critical"], [rAIFresher.id, sML.id, "important"],
    [rAIFresher.id, sNumPy.id, "important"], [rAIFresher.id, sPandas.id, "important"],
    [rAIFresher.id, sSQL.id, "nice-to-have"], [rAIFresher.id, sSKLearn.id, "nice-to-have"],
    // Frontend Developer
    [rFrontendDev.id, sReact.id, "critical"], [rFrontendDev.id, sJavaScript.id, "critical"],
    [rFrontendDev.id, sTypeScript.id, "important"], [rFrontendDev.id, sHTML_CSS.id, "critical"],
    [rFrontendDev.id, sTailwind.id, "nice-to-have"], [rFrontendDev.id, sGit.id, "important"],
    // Senior Frontend Developer
    [rSeniorFE.id, sReact.id, "critical"], [rSeniorFE.id, sTypeScript.id, "critical"],
    [rSeniorFE.id, sNextJS.id, "important"], [rSeniorFE.id, sSystemDesign.id, "important"],
    [rSeniorFE.id, sRedux.id, "nice-to-have"], [rSeniorFE.id, sZustand.id, "nice-to-have"],
    // Backend Developer
    [rBackendDev.id, sNodeJS.id, "critical"], [rBackendDev.id, sPython.id, "important"],
    [rBackendDev.id, sSQL.id, "critical"], [rBackendDev.id, sREST.id, "important"],
    [rBackendDev.id, sPostgreSQL.id, "important"], [rBackendDev.id, sDocker.id, "nice-to-have"],
    // Full Stack Developer
    [rFullStack.id, sReact.id, "critical"], [rFullStack.id, sNodeJS.id, "critical"],
    [rFullStack.id, sTypeScript.id, "important"], [rFullStack.id, sSQL.id, "important"],
    [rFullStack.id, sREST.id, "important"], [rFullStack.id, sDocker.id, "nice-to-have"],
    // DevOps Engineer
    [rDevOps.id, sDocker.id, "critical"], [rDevOps.id, sK8s.id, "critical"],
    [rDevOps.id, sAWS.id, "critical"], [rDevOps.id, sCI_CD.id, "critical"],
    [rDevOps.id, sTerraform.id, "important"], [rDevOps.id, sPython.id, "nice-to-have"],
    // Recruiter
    [rRecruiter.id, sRecruitment.id, "critical"], [rRecruiter.id, sTalentAcq.id, "critical"],
    // HR Manager
    [rHRManager.id, sRecruitment.id, "important"], [rHRManager.id, sPerfMgmt.id, "critical"],
    [rHRManager.id, sEmployeeRel.id, "critical"], [rHRManager.id, sLaborLaw.id, "important"],
    // HR Business Partner
    [rHRBP.id, sPerfMgmt.id, "critical"], [rHRBP.id, sEmployeeRel.id, "critical"],
    [rHRBP.id, sHRAnalytics.id, "important"], [rHRBP.id, sLaborLaw.id, "important"],
    // HR Director
    [rHRDirector.id, sPerfMgmt.id, "critical"], [rHRDirector.id, sCompBen.id, "critical"],
    [rHRDirector.id, sHRAnalytics.id, "critical"], [rHRDirector.id, sLaborLaw.id, "important"],
  ];

  for (const [roleId, skillId, importance] of allRoleSkills) {
    await ensureRoleSkill(roleId, skillId, importance);
  }

  // ═══════════════════════════════════════
  // CAREER PATHS
  // ═══════════════════════════════════════

  await ensureCareerPath(rAIFresher.id, rMLEngineer.id, "1-2 years", "Gain production ML experience");
  await ensureCareerPath(rMLEngineer.id, rAIEngineer.id, "1-2 years", "Expand to broader AI systems");
  await ensureCareerPath(rMLEngineer.id, rMLEad.id, "3-5 years", "Lead ML architecture and mentor team");
  await ensureCareerPath(rAIEngineer.id, rMLEad.id, "3-5 years", "Deepen expertise and take on leadership");
  await ensureCareerPath(rFrontendDev.id, rSeniorFE.id, "2-4 years", "Master React ecosystem and system design");
  await ensureCareerPath(rRecruiter.id, rHRManager.id, "3-5 years", "Expand beyond recruitment to full HR");
  await ensureCareerPath(rHRManager.id, rHRBP.id, "2-3 years", "Develop strategic business partnering");
  await ensureCareerPath(rHRBP.id, rHRDirector.id, "4-6 years", "Lead HR strategy");
  await ensureCareerPath(rHRDirector.id, rCHRO.id, "5-8 years", "Become chief people officer");

  console.log("[Seed] Skill ontology seeding complete!");

  return { skillsCreated, relationsCreated, rolesCreated, roleSkillsCreated, careerPathsCreated };
}
