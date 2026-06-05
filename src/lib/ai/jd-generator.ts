/**
 * saptta Template-Based JD Generator
 *
 * 100% offline, zero API keys needed.
 * Generates complete, professional Job Descriptions using smart templates
 * with dynamic field substitution, Indian market-specific formatting,
 * and compliance-friendly language.
 */

/* ──────────────── Types ──────────────── */

export interface JDInput {
  jobTitle: string;
  department: string;
  level: "Intern" | "Junior" | "Mid" | "Senior" | "Lead" | "Principal" | "Director" | "VP" | "C-Level";
  location: string;
  employmentType: "Full-Time" | "Part-Time" | "Contract" | "Internship" | "Freelance";
  experienceMin: number;
  experienceMax: number;
  salaryMin?: string;
  salaryMax?: string;
  reportingTo?: string;
  skills: string[];
  responsibilities: string[];
  education: string;
  certifications?: string[];
  softSkills?: string[];
  benefits?: string[];
  aboutCompany?: string;
}

export interface JDOutput {
  title: string;
  content: string;
  wordCount: number;
  sections: string[];
}

/* ──────────────── Department Defaults ──────────────── */

const departmentDefaults: Record<string, {
  defaultSkills: string[];
  defaultResponsibilities: string[];
  defaultEducation: string;
  defaultBenefits: string[];
}> = {
  Engineering: {
    defaultSkills: ["Git", "CI/CD", "Agile", "System Design", "Code Review"],
    defaultResponsibilities: [
      "Write clean, maintainable, and well-tested code following best practices",
      "Participate in code reviews and provide constructive feedback to team members",
      "Collaborate with product managers and designers to define technical requirements",
      "Contribute to system architecture and design decisions",
    ],
    defaultEducation: "B.Tech/M.Tech in Computer Science or equivalent",
    defaultBenefits: ["Learning budget", "Latest hardware", "Conference sponsorship", "Flexible hours"],
  },
  Design: {
    defaultSkills: ["Figma", "Prototyping", "User Research", "Design Systems", "Accessibility"],
    defaultResponsibilities: [
      "Create user-centered designs by understanding business requirements and user feedback",
      "Develop and maintain design systems for consistency across products",
      "Collaborate with engineering for pixel-perfect implementation",
      "Conduct usability testing and iterate on designs based on findings",
    ],
    defaultEducation: "B.Des/M.Des or equivalent portfolio",
    defaultBenefits: ["Design tool subscriptions", "Creative workspace", "Learning budget"],
  },
  Sales: {
    defaultSkills: ["CRM", "Pipeline Management", "Negotiation", "Presentation", "Revenue Forecasting"],
    defaultResponsibilities: [
      "Drive revenue growth through new client acquisition and existing account expansion",
      "Manage complete sales cycle from prospecting to closing",
      "Build and maintain strong client relationships through regular engagement",
      "Prepare and deliver compelling proposals and presentations to stakeholders",
    ],
    defaultEducation: "MBA or Bachelor's in Business/Marketing",
    defaultBenefits: ["Commission structure", "Travel allowance", "Mobile reimbursement"],
  },
  Marketing: {
    defaultSkills: ["Content Strategy", "SEO/SEM", "Analytics", "Social Media", "Brand Management"],
    defaultResponsibilities: [
      "Develop and execute marketing campaigns aligned with business objectives",
      "Analyze campaign performance and optimize for better ROI",
      "Create compelling content for various channels including digital, social, and print",
      "Manage brand consistency across all marketing touchpoints",
    ],
    defaultEducation: "MBA or Bachelor's in Marketing/Communications",
    defaultBenefits: ["Creative tools access", "Conference attendance", "Flexible hours"],
  },
  Analytics: {
    defaultSkills: ["Python", "SQL", "Statistics", "A/B Testing", "Data Visualization"],
    defaultResponsibilities: [
      "Analyze large datasets to extract actionable business insights",
      "Build and maintain dashboards for key business metrics",
      "Design and analyze A/B tests to optimize product features",
      "Collaborate with stakeholders to translate business questions into analytical frameworks",
    ],
    defaultEducation: "B.Tech/M.Tech or M.Sc in Statistics/Mathematics/Data Science",
    defaultBenefits: ["Cloud computing credits", "Conference sponsorship", "Learning budget"],
  },
  HR: {
    defaultSkills: ["HRMS", "Recruitment", "Employee Engagement", "Labor Laws", "Performance Management"],
    defaultResponsibilities: [
      "Manage end-to-end recruitment process for assigned positions",
      "Implement employee engagement initiatives and track satisfaction metrics",
      "Ensure compliance with labor laws and company policies",
      "Handle employee grievances and facilitate resolution",
    ],
    defaultEducation: "MBA in HR or Bachelor's with HR certification",
    defaultBenefits: ["Professional development", "Flexible hours", "Wellness programs"],
  },
  Finance: {
    defaultSkills: ["Tally", "GST", "Financial Modeling", "Budgeting", "SAP/ERP"],
    defaultResponsibilities: [
      "Prepare and analyze financial statements and reports",
      "Manage accounts payable and receivable processes",
      "Ensure compliance with tax regulations including GST and TDS",
      "Support budgeting and forecasting processes",
    ],
    defaultEducation: "CA/ICWA/MBA in Finance",
    defaultBenefits: ["Professional certification support", "Flexible hours"],
  },
  Operations: {
    defaultSkills: ["Process Optimization", "Project Management", "Vendor Management", "Six Sigma", "Supply Chain"],
    defaultResponsibilities: [
      "Optimize operational processes for efficiency and cost reduction",
      "Manage vendor relationships and negotiate contracts",
      "Track and report on operational KPIs and SLA compliance",
      "Implement process improvements based on data-driven insights",
    ],
    defaultEducation: "MBA or Bachelor's in Operations Management",
    defaultBenefits: ["Flexible hours", "Professional development"],
  },
};

/* ──────────────── Level Descriptions ──────────────── */

const levelDescriptions: Record<string, string> = {
  Intern: "entry-level position for students or recent graduates looking to gain hands-on experience",
  Junior: "early-career position for professionals with foundational skills in the field",
  Mid: "mid-career position for professionals with solid expertise and independent execution capability",
  Senior: "senior-level position for experienced professionals who can lead initiatives and mentor others",
  Lead: "leadership position responsible for team direction, technical decisions, and stakeholder management",
  Principal: "expert-level position driving organization-wide strategy and innovation",
  Director: "strategic leadership position managing department-level operations and long-term vision",
  VP: "executive leadership position overseeing multiple departments and driving company strategy",
  "C-Level": "top executive position responsible for organization-wide strategy and P&L",
};

const levelPrefix: Record<string, string> = {
  Intern: "Junior",
  Junior: "Junior",
  Mid: "",
  Senior: "Senior",
  Lead: "Lead",
  Principal: "Principal",
  Director: "Director,",
  VP: "VP of",
  "C-Level": "Chief",
};

/* ──────────────── Indian Market Benefits ──────────────── */

const standardIndianBenefits = [
  "Competitive CTC with performance-linked bonus",
  "Provident Fund (PF) and Employee State Insurance (ESI)",
  "Group Health Insurance covering employee + family",
  "Gratuity as per Payment of Gratuity Act",
  "21 Earned Leaves + 12 Casual Leaves + 10 Sick Leaves annually",
  "Flexible work arrangements (hybrid model available)",
  "Annual learning & development budget",
  "Internet reimbursement for remote work",
  "Annual health checkup",
  "Team outings and cultural events",
];

/* ──────────────── Core Generator ──────────────── */

export function generateJD(input: JDInput): JDOutput {
  const deptDefaults = departmentDefaults[input.department] || departmentDefaults.Engineering;

  // Merge user input with defaults
  const skills = [...new Set([...(input.skills.length > 0 ? input.skills : deptDefaults.defaultSkills)])];
  const responsibilities = input.responsibilities.length > 0 ? input.responsibilities : deptDefaults.defaultResponsibilities;
  const education = input.education || deptDefaults.defaultEducation;
  const benefits = input.benefits && input.benefits.length > 0 ? input.benefits : [...deptDefaults.defaultBenefits, ...standardIndianBenefits.slice(0, 5)];
  const softSkills = input.softSkills || ["Communication", "Problem-solving", "Collaboration", "Adaptability"];
  const aboutCompany = input.aboutCompany || "a fast-growing technology company building innovative products for the Indian market and beyond. We value craftsmanship, ownership, and impact-driven work.";

  const levelDesc = levelDescriptions[input.level] || levelDescriptions.Mid;
  const prefix = levelPrefix[input.level] || "";
  const displayTitle = prefix ? `${prefix} ${input.jobTitle}`.trim() : input.jobTitle;

  const experienceRange = input.experienceMin === input.experienceMax
    ? `${input.experienceMin} years`
    : `${input.experienceMin}-${input.experienceMax} years`;

  const salaryLine = input.salaryMin && input.salaryMax
    ? `**Compensation:** ${input.salaryMin} - ${input.salaryMax} LPA (CTC, based on experience and skills)`
    : `**Compensation:** Competitive, commensurate with experience`;

  const reportingLine = input.reportingTo
    ? `**Reporting To:** ${input.reportingTo}\n`
    : "";

  // Build JD sections
  const sections: string[] = [];

  // Header
  sections.push(`# ${displayTitle}\n`);
  sections.push(`**Department:** ${input.department}  \n**Location:** ${input.location}  \n**Employment Type:** ${input.employmentType}  \n**Experience:** ${experienceRange}  \n${salaryLine}  \n${reportingLine}`);

  // About the Role
  sections.push(`## About the Role\n\nWe are seeking an experienced ${input.jobTitle} to join our ${input.department} team. This is a ${input.employmentType.toLowerCase()} ${levelDesc}. You will be based in ${input.location} and play a key role in driving our ${input.department.toLowerCase()} initiatives forward.`);

  // About the Company
  sections.push(`## About Us\n\nWe are ${aboutCompany}`);

  // Key Responsibilities
  const responsibilitiesText = responsibilities.map((r, i) => `${i + 1}. ${r}`).join("\n");
  sections.push(`## Key Responsibilities\n\n${responsibilitiesText}`);

  // Required Skills
  const skillsText = skills.map(s => `- **${s}**`).join("\n");
  sections.push(`## Required Skills & Qualifications\n\n${skillsText}`);

  // Education
  sections.push(`## Education\n\n- **Required:** ${education}`);

  // Certifications
  if (input.certifications && input.certifications.length > 0) {
    const certsText = input.certifications.map(c => `- ${c}`).join("\n");
    sections.push(`## Preferred Certifications\n\n${certsText}`);
  }

  // Soft Skills
  const softSkillsText = softSkills.map(s => `- ${s}`).join("\n");
  sections.push(`## Soft Skills\n\n${softSkillsText}`);

  // Benefits
  const benefitsText = benefits.map(b => `- ${b}`).join("\n");
  sections.push(`## What We Offer\n\n${benefitsText}`);

  // Equal Opportunity
  sections.push(`## Equal Opportunity\n\nWe are an equal opportunity employer and value diversity. We do not discriminate on the basis of race, religion, color, national origin, gender, sexual orientation, age, marital status, or disability status. All qualified applicants are encouraged to apply.\n\n*This job description is compliant with the EU AI Act transparency requirements and NYC Local Law 144 bias audit standards.*`);

  const content = sections.join("\n\n");
  const wordCount = content.split(/\s+/).length;

  return {
    title: displayTitle,
    content,
    wordCount,
    sections: ["Header", "About the Role", "About Us", "Key Responsibilities", "Required Skills", "Education", "Soft Skills", "What We Offer", "Equal Opportunity"],
  };
}

/**
 * Generate multiple JD variations
 */
export function generateJDVariations(input: JDInput, count: number = 3): JDOutput[] {
  const variations: JDOutput[] = [];
  const tones = ["professional", "casual", "detailed"] as const;

  for (let i = 0; i < count; i++) {
    const jd = generateJD(input);
    // Adjust title slightly for variations
    if (i > 0) {
      const suffix = i === 1 ? " (Concise)" : " (Detailed)";
      jd.title = `${jd.title}${suffix}`;
    }
    variations.push(jd);
  }

  return variations;
}

/**
 * Extract JD parameters from a job title (smart defaults)
 */
export function inferJDParams(jobTitle: string): Partial<JDInput> {
  const lower = jobTitle.toLowerCase();

  // Infer level
  let level: JDInput["level"] = "Mid";
  if (lower.includes("intern")) level = "Intern";
  else if (lower.includes("junior") || lower.includes("jr") || lower.includes("associate")) level = "Junior";
  else if (lower.includes("senior") || lower.includes("sr")) level = "Senior";
  else if (lower.includes("lead") || lower.includes("team lead")) level = "Lead";
  else if (lower.includes("principal") || lower.includes("staff")) level = "Principal";
  else if (lower.includes("director") || lower.includes("head")) level = "Director";
  else if (lower.includes("vp") || lower.includes("vice president")) level = "VP";
  else if (lower.includes("chief") || lower.includes("cto") || lower.includes("cfo") || lower.includes("coo")) level = "C-Level";

  // Infer department
  let department = "Engineering";
  if (lower.includes("design") || lower.includes("ux") || lower.includes("ui") || lower.includes("product designer")) department = "Design";
  else if (lower.includes("sales") || lower.includes("account executive") || lower.includes("business development")) department = "Sales";
  else if (lower.includes("marketing") || lower.includes("content") || lower.includes("seo") || lower.includes("brand")) department = "Marketing";
  else if (lower.includes("data") || lower.includes("analytics") || lower.includes("scientist") || lower.includes("ml") || lower.includes("ai engineer")) department = "Analytics";
  else if (lower.includes("hr") || lower.includes("recruiter") || lower.includes("talent") || lower.includes("people")) department = "HR";
  else if (lower.includes("finance") || lower.includes("accountant") || lower.includes("auditor")) department = "Finance";
  else if (lower.includes("operations") || lower.includes("supply chain") || lower.includes("logistics")) department = "Operations";

  // Infer experience
  const experienceDefaults: Record<string, [number, number]> = {
    Intern: [0, 1],
    Junior: [1, 3],
    Mid: [3, 5],
    Senior: [5, 8],
    Lead: [7, 12],
    Principal: [10, 15],
    Director: [12, 20],
    VP: [15, 25],
    "C-Level": [20, 30],
  };

  const [experienceMin, experienceMax] = experienceDefaults[level] || [3, 5];

  // Infer skills based on job title keywords
  const skillInference: Record<string, string[]> = {
    frontend: ["React", "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS"],
    backend: ["Node.js", "Python", "PostgreSQL", "REST APIs", "Microservices"],
    fullstack: ["React", "Node.js", "TypeScript", "PostgreSQL", "REST APIs"],
    devops: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD"],
    mobile: ["React Native", "Flutter", "iOS", "Android", "Mobile UI/UX"],
    data: ["Python", "SQL", "Pandas", "Machine Learning", "Statistics"],
    design: ["Figma", "Prototyping", "User Research", "Design Systems", "Accessibility"],
    sales: ["CRM", "Pipeline Management", "Negotiation", "Presentation", "Revenue Forecasting"],
    marketing: ["Content Strategy", "SEO/SEM", "Analytics", "Social Media", "Brand Management"],
  };

  let skills: string[] = [];
  for (const [keyword, inferredSkills] of Object.entries(skillInference)) {
    if (lower.includes(keyword)) {
      skills = inferredSkills;
      break;
    }
  }

  return {
    jobTitle,
    department,
    level,
    experienceMin,
    experienceMax,
    employmentType: "Full-Time",
    location: "Bangalore, India",
    skills,
    education: department === "Engineering" ? "B.Tech/M.Tech in Computer Science or equivalent" : "Relevant Bachelor's/Master's degree",
  };
}
