/**
 * Kam Resume Analysis Engine
 *
 * Provides JD-to-Resume matching with:
 *  - Keyword extraction (TF-IDF inspired)
 *  - Cosine similarity scoring
 *  - Multi-dimensional scoring (skills, experience, education, culture)
 *  - Anti-hallucination verification & confidence levels
 *  - Source tracing for every extracted fact
 */

/* ──────────────── Types ──────────────── */

export interface JDKeywords {
  skills: string[];
  experience: string[];
  education: string[];
  certifications: string[];
  softSkills: string[];
  domain: string[];
}

export interface ResumeExtracted {
  skills: ExtractedItem[];
  experience: ExtractedItem[];
  education: ExtractedItem[];
  certifications: ExtractedItem[];
  softSkills: ExtractedItem[];
  summary: string;
  yearsOfExperience: number;
  currentRole: string;
  location: string;
}

export interface ExtractedItem {
  value: string;
  confidence: number; // 0-1
  source: string;     // which section of resume this came from
  verified: boolean;  // cross-verified in resume
}

export interface MatchResult {
  overall: number;
  keywordMatch: KeywordMatchResult;
  cosineSimilarity: CosineResult;
  dimensionScores: DimensionScore[];
  shortlisted: boolean;
  shortlistReason: string;
  antiHallucinationReport: AntiHallucinationReport;
  recommendations: string[];
}

export interface KeywordMatchResult {
  totalKeywords: number;
  matchedKeywords: string[];
  unmatchedKeywords: string[];
  matchPercentage: number;
  categoryBreakdown: {
    category: string;
    total: number;
    matched: number;
    percentage: number;
    matchedItems: string[];
    missedItems: string[];
  }[];
}

export interface CosineResult {
  score: number;           // 0-1
  jdVectorMagnitude: number;
  resumeVectorMagnitude: number;
  dotProduct: number;
  topContributingTerms: { term: string; weight: number }[];
}

export interface DimensionScore {
  dimension: string;
  score: number;           // 0-100
  weight: number;          // relative weight
  weightedScore: number;
  details: string;
}

export interface AntiHallucinationReport {
  overallConfidence: number;  // 0-1
  verifiedFacts: number;
  unverifiedFacts: number;
  flaggedItems: FlaggedItem[];
  verificationMethod: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface FlaggedItem {
  item: string;
  category: string;
  reason: string;
  severity: 'info' | 'warning' | 'critical';
}

/* ──────────────── Stop Words ──────────────── */

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'can', 'shall', 'not', 'no', 'nor',
  'as', 'if', 'then', 'than', 'that', 'this', 'these', 'those', 'it',
  'its', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she',
  'they', 'them', 'their', 'what', 'which', 'who', 'whom', 'how',
  'when', 'where', 'why', 'all', 'each', 'every', 'both', 'few',
  'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same',
  'so', 'too', 'very', 'just', 'also', 'about', 'above', 'after',
  'again', 'against', 'between', 'through', 'during', 'before',
  'up', 'down', 'out', 'off', 'over', 'under', 'further',
  'must', 'need', 'well', 'able', 'etc', 'including', 'along',
  'across', 'among', 'around', 'behind', 'beside', 'beyond',
  'within', 'without', 'towards', 'upon', 'into', 'per',
]);

/* ──────────────── Skill Synonyms Map ──────────────── */

const SKILL_SYNONYMS: Record<string, string[]> = {
  'javascript': ['js', 'es6', 'es2015', 'ecmascript'],
  'typescript': ['ts'],
  'react': ['reactjs', 'react.js'],
  'nextjs': ['next.js', 'next'],
  'nodejs': ['node', 'node.js'],
  'python': ['py'],
  'postgresql': ['postgres', 'pg'],
  'mongodb': ['mongo'],
  'kubernetes': ['k8s'],
  'docker': ['containerization'],
  'aws': ['amazon web services'],
  'gcp': ['google cloud', 'google cloud platform'],
  'ci/cd': ['cicd', 'continuous integration', 'continuous delivery', 'continuous deployment'],
  'machine learning': ['ml'],
  'artificial intelligence': ['ai'],
  'natural language processing': ['nlp'],
  'devops': ['sre', 'site reliability'],
  'ui/ux': ['user interface', 'user experience', 'ux/ui'],
  'figma': ['figma design'],
  'sql': ['structured query language'],
  'rest api': ['restful', 'rest apis'],
  'graphql': ['gql'],
  'redux': ['redux toolkit', 'rtk'],
  'tailwind': ['tailwindcss', 'tailwind css'],
  'css': ['cascading style sheets'],
  'html': ['html5'],
  'java': ['j2ee', 'jee'],
  'c#': ['csharp', 'c sharp'],
  '.net': ['dotnet', 'dot net'],
  'angular': ['angularjs', 'angular.js'],
  'vue': ['vuejs', 'vue.js'],
  'svelte': ['sveltejs'],
  'express': ['expressjs', 'express.js'],
  'django': ['django framework'],
  'flask': ['flask framework'],
  'spring': ['spring boot', 'springboot'],
  'react native': ['reactnative'],
  'flutter': ['flutter sdk'],
  'swift': ['swift ios'],
  'kotlin': ['kotlin android'],
  'terraform': ['iac', 'infrastructure as code'],
  'jenkins': ['ci server'],
  'git': ['github', 'gitlab'],
  'jira': ['atlassian jira'],
  'agile': ['scrum', 'kanban'],
  'saas': ['software as a service'],
  'b2b': ['business to business'],
  'hrms': ['human resource management', 'hr management'],
  'ats': ['applicant tracking', 'recruitment software'],
};

/* ──────────────── Technical Skills Master List ──────────────── */

const TECH_SKILLS_MASTER: Record<string, string[]> = {
  'engineering': ['react', 'nextjs', 'typescript', 'javascript', 'python', 'java', 'nodejs', 'go', 'rust', 'c++', 'ruby', 'php', 'swift', 'kotlin', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'terraform', 'ci/cd', 'git', 'sql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'graphql', 'rest api', 'microservices', 'system design', 'algorithms', 'data structures', 'redux', 'tailwind', 'css', 'html', 'angular', 'vue', 'svelte', 'express', 'django', 'flask', 'spring', 'react native', 'flutter', 'devops', 'sre'],
  'design': ['figma', 'sketch', 'adobe xd', 'invision', 'photoshop', 'illustrator', 'after effects', 'prototyping', 'wireframing', 'user research', 'usability testing', 'design systems', 'accessibility', 'responsive design', 'interaction design', 'information architecture'],
  'data': ['python', 'sql', 'spark', 'airflow', 'kafka', 'hadoop', 'tableau', 'power bi', 'looker', 'snowflake', 'databricks', 'dbt', 'etl', 'data warehousing', 'machine learning', 'deep learning', 'nlp', 'computer vision', 'statistics', 'a/b testing', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch'],
  'sales': ['salesforce', 'hubspot', 'crm', 'b2b', 'enterprise sales', 'saaas', 'pipeline management', 'negotiation', 'revenue forecasting', 'cold calling', 'lead generation', 'account management', 'proposal writing'],
  'hr': ['hrms', 'ats', 'recruitment', 'onboarding', 'performance management', 'compensation', 'labor laws', 'pf', 'esi', 'tds', 'gratuity', 'payroll', 'employee engagement', 'talent management', 'succession planning'],
  'marketing': ['google analytics', 'seo', 'sem', 'content marketing', 'social media', 'email marketing', 'marketing automation', 'hubspot', 'marketo', 'google ads', 'facebook ads', 'copywriting', 'brand strategy'],
  'finance': ['tally', 'gst', 'taxation', 'auditing', 'financial modeling', 'budgeting', 'forecasting', 'sap', 'erp', 'accounts payable', 'accounts receivable', 'reconciliation'],
};

/* ──────────────── Core Engine Functions ──────────────── */

/**
 * Extract keywords from a Job Description text
 * Uses TF-IDF inspired approach with domain-aware parsing
 */
export function extractJDKeywords(jdText: string, requirements: string[]): JDKeywords {
  const fullText = `${jdText} ${requirements.join(' ')}`.toLowerCase();
  const tokens = tokenize(fullText);

  const skills = extractSkillsFromText(tokens, fullText);
  const experience = extractExperienceRequirements(fullText);
  const education = extractEducationRequirements(fullText);
  const certifications = extractCertifications(fullText);
  const softSkills = extractSoftSkills(fullText);
  const domain = extractDomain(fullText);

  return { skills, experience, education, certifications, softSkills, domain };
}

/**
 * Parse resume text and extract structured data with confidence scores
 * Each extracted item includes source tracing for anti-hallucination
 */
export function parseResume(resumeText: string): ResumeExtracted {
  const sections = splitResumeSections(resumeText);
  const allText = resumeText.toLowerCase();

  const skills = extractSkillsFromResume(allText, sections);
  const experience = extractExperienceFromResume(allText, sections);
  const education = extractEducationFromResume(allText, sections);
  const certifications = extractCertificationsFromResume(allText, sections);
  const softSkills = extractSoftSkillsFromResume(allText, sections);
  const yearsOfExperience = calculateYearsOfExperience(allText, sections);
  const currentRole = extractCurrentRole(sections);
  const location = extractLocation(sections);
  const summary = sections.summary || '';

  return {
    skills,
    experience,
    education,
    certifications,
    softSkills,
    summary,
    yearsOfExperience,
    currentRole,
    location,
  };
}

/**
 * Compute cosine similarity between JD keywords and resume content
 * Returns detailed vector analysis
 */
export function computeCosineSimilarity(jdKeywords: JDKeywords, resume: ResumeExtracted): CosineResult {
  // Build term-frequency vectors
  const allTerms = new Set<string>();

  // JD terms with weights
  const jdVector = new Map<string, number>();
  jdKeywords.skills.forEach(s => { const t = s.toLowerCase(); jdVector.set(t, (jdVector.get(t) || 0) + 3); allTerms.add(t); });
  jdKeywords.domain.forEach(s => { const t = s.toLowerCase(); jdVector.set(t, (jdVector.get(t) || 0) + 2.5); allTerms.add(t); });
  jdKeywords.experience.forEach(s => { const t = s.toLowerCase(); jdVector.set(t, (jdVector.get(t) || 0) + 2); allTerms.add(t); });
  jdKeywords.education.forEach(s => { const t = s.toLowerCase(); jdVector.set(t, (jdVector.get(t) || 0) + 2); allTerms.add(t); });
  jdKeywords.certifications.forEach(s => { const t = s.toLowerCase(); jdVector.set(t, (jdVector.get(t) || 0) + 2.5); allTerms.add(t); });
  jdKeywords.softSkills.forEach(s => { const t = s.toLowerCase(); jdVector.set(t, (jdVector.get(t) || 0) + 1.5); allTerms.add(t); });

  // Add synonym expansion for JD
  for (const [term, weight] of jdVector) {
    const synonyms = SKILL_SYNONYMS[term];
    if (synonyms) {
      synonyms.forEach(syn => {
        const synLower = syn.toLowerCase();
        jdVector.set(synLower, (jdVector.get(synLower) || 0) + weight * 0.5);
        allTerms.add(synLower);
      });
    }
  }

  // Resume terms with weights
  const resumeVector = new Map<string, number>();
  resume.skills.forEach(s => {
    const t = s.value.toLowerCase();
    resumeVector.set(t, (resumeVector.get(t) || 0) + 3 * s.confidence);
    allTerms.add(t);
    // Also add synonyms from resume
    const synonyms = SKILL_SYNONYMS[t];
    if (synonyms) {
      synonyms.forEach(syn => {
        const synLower = syn.toLowerCase();
        resumeVector.set(synLower, (resumeVector.get(synLower) || 0) + 1.5 * s.confidence);
        allTerms.add(synLower);
      });
    }
  });
  resume.education.forEach(s => { const t = s.value.toLowerCase(); resumeVector.set(t, (resumeVector.get(t) || 0) + 2 * s.confidence); allTerms.add(t); });
  resume.certifications.forEach(s => { const t = s.value.toLowerCase(); resumeVector.set(t, (resumeVector.get(t) || 0) + 2.5 * s.confidence); allTerms.add(t); });
  resume.softSkills.forEach(s => { const t = s.value.toLowerCase(); resumeVector.set(t, (resumeVector.get(t) || 0) + 1.5 * s.confidence); allTerms.add(t); });
  // Add experience years as a term
  resumeVector.set(`years:${resume.yearsOfExperience}`, 2);
  allTerms.add(`years:${resume.yearsOfExperience}`);

  // Compute dot product and magnitudes
  let dotProduct = 0;
  let jdMagnitude = 0;
  let resumeMagnitude = 0;

  for (const term of allTerms) {
    const jdVal = jdVector.get(term) || 0;
    const resVal = resumeVector.get(term) || 0;
    dotProduct += jdVal * resVal;
    jdMagnitude += jdVal * jdVal;
    resumeMagnitude += resVal * resVal;
  }

  jdMagnitude = Math.sqrt(jdMagnitude);
  resumeMagnitude = Math.sqrt(resumeMagnitude);

  const score = (jdMagnitude > 0 && resumeMagnitude > 0)
    ? dotProduct / (jdMagnitude * resumeMagnitude)
    : 0;

  // Find top contributing terms
  const contributions: { term: string; weight: number }[] = [];
  for (const term of allTerms) {
    const jdVal = jdVector.get(term) || 0;
    const resVal = resumeVector.get(term) || 0;
    if (jdVal > 0 && resVal > 0) {
      contributions.push({ term, weight: jdVal * resVal });
    }
  }
  contributions.sort((a, b) => b.weight - a.weight);

  return {
    score,
    jdVectorMagnitude: jdMagnitude,
    resumeVectorMagnitude: resumeMagnitude,
    dotProduct,
    topContributingTerms: contributions.slice(0, 15),
  };
}

/**
 * Compute keyword-level match between JD and resume
 */
export function computeKeywordMatch(jdKeywords: JDKeywords, resume: ResumeExtracted): KeywordMatchResult {
  const categories = [
    { name: 'skills', jdItems: jdKeywords.skills, resumeItems: resume.skills.map(s => s.value) },
    { name: 'experience', jdItems: jdKeywords.experience, resumeItems: resume.experience.map(s => s.value) },
    { name: 'education', jdItems: jdKeywords.education, resumeItems: resume.education.map(s => s.value) },
    { name: 'certifications', jdItems: jdKeywords.certifications, resumeItems: resume.certifications.map(s => s.value) },
    { name: 'softSkills', jdItems: jdKeywords.softSkills, resumeItems: resume.softSkills.map(s => s.value) },
    { name: 'domain', jdItems: jdKeywords.domain, resumeItems: resume.skills.map(s => s.value) },
  ];

  let totalKeywords = 0;
  let totalMatched = 0;
  const allMatched: string[] = [];
  const allUnmatched: string[] = [];
  const breakdown: KeywordMatchResult['categoryBreakdown'] = [];

  for (const cat of categories) {
    const matched: string[] = [];
    const missed: string[] = [];

    for (const jdItem of cat.jdItems) {
      totalKeywords++;
      const jdLower = jdItem.toLowerCase();
      let isMatch = false;

      // Direct match
      if (cat.resumeItems.some(r => r.toLowerCase() === jdLower)) {
        isMatch = true;
      }
      // Synonym match
      if (!isMatch) {
        const synonyms = SKILL_SYNONYMS[jdLower];
        if (synonyms && cat.resumeItems.some(r => synonyms.includes(r.toLowerCase()))) {
          isMatch = true;
        }
      }
      // Partial match (e.g., "react" in "react, next.js")
      if (!isMatch) {
        isMatch = cat.resumeItems.some(r => r.toLowerCase().includes(jdLower) || jdLower.includes(r.toLowerCase()));
      }

      if (isMatch) {
        matched.push(jdItem);
        allMatched.push(jdItem);
        totalMatched++;
      } else {
        missed.push(jdItem);
        allUnmatched.push(jdItem);
      }
    }

    breakdown.push({
      category: cat.name,
      total: cat.jdItems.length,
      matched: matched.length,
      percentage: cat.jdItems.length > 0 ? Math.round((matched.length / cat.jdItems.length) * 100) : 0,
      matchedItems: matched,
      missedItems: missed,
    });
  }

  return {
    totalKeywords,
    matchedKeywords: allMatched,
    unmatchedKeywords: allUnmatched,
    matchPercentage: totalKeywords > 0 ? Math.round((totalMatched / totalKeywords) * 100) : 0,
    categoryBreakdown: breakdown,
  };
}

/**
 * Generate anti-hallucination verification report
 * Cross-verifies extracted data against the original resume text
 */
export function generateAntiHallucinationReport(
  resume: ResumeExtracted,
  originalText: string
): AntiHallucinationReport {
  const lowerText = originalText.toLowerCase();
  let verifiedFacts = 0;
  let unverifiedFacts = 0;
  const flaggedItems: FlaggedItem[] = [];

  // Verify skills
  for (const skill of resume.skills) {
    if (isVerifiedInText(skill.value, lowerText)) {
      verifiedFacts++;
      skill.verified = true;
    } else {
      unverifiedFacts++;
      skill.verified = false;
      flaggedItems.push({
        item: skill.value,
        category: 'skills',
        reason: `Skill "${skill.value}" not found verbatim in resume. May be inferred.`,
        severity: skill.confidence > 0.8 ? 'info' : 'warning',
      });
    }
  }

  // Verify education
  for (const edu of resume.education) {
    if (isVerifiedInText(edu.value, lowerText)) {
      verifiedFacts++;
      edu.verified = true;
    } else {
      unverifiedFacts++;
      edu.verified = false;
      flaggedItems.push({
        item: edu.value,
        category: 'education',
        reason: `Education "${edu.value}" not found verbatim in resume.`,
        severity: 'warning',
      });
    }
  }

  // Verify certifications
  for (const cert of resume.certifications) {
    if (isVerifiedInText(cert.value, lowerText)) {
      verifiedFacts++;
      cert.verified = true;
    } else {
      unverifiedFacts++;
      cert.verified = false;
      flaggedItems.push({
        item: cert.value,
        category: 'certifications',
        reason: `Certification "${cert.value}" not found verbatim in resume.`,
        severity: 'critical',
      });
    }
  }

  // Check for inconsistencies
  const expYears = resume.yearsOfExperience;
  if (expYears > 0) {
    const yearPatterns = lowerText.match(/\d+\+?\s*years?/g);
    if (yearPatterns) {
      const maxYearsMentioned = Math.max(...yearPatterns.map(p => parseInt(p) || 0));
      if (maxYearsMentioned > 0 && Math.abs(expYears - maxYearsMentioned) > 3) {
        flaggedItems.push({
          item: `Experience: ${expYears} years calculated vs ${maxYearsMentioned} mentioned`,
          category: 'experience',
          reason: 'Discrepancy between calculated and stated experience years.',
          severity: 'warning',
        });
      }
    }
  }

  // Calculate overall confidence
  const totalFacts = verifiedFacts + unverifiedFacts;
  const overallConfidence = totalFacts > 0 ? verifiedFacts / totalFacts : 0;

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (overallConfidence < 0.5) riskLevel = 'high';
  else if (overallConfidence < 0.75) riskLevel = 'medium';

  // Check for critical flags
  if (flaggedItems.some(f => f.severity === 'critical')) {
    riskLevel = 'high';
  }

  return {
    overallConfidence,
    verifiedFacts,
    unverifiedFacts,
    flaggedItems,
    verificationMethod: 'Multi-pass: exact string match + synonym expansion + pattern extraction + cross-verification',
    riskLevel,
  };
}

/**
 * Main function: Full resume analysis against a JD
 */
export function analyzeResume(
  resumeText: string,
  jdText: string,
  jdRequirements: string[],
  shortlistThreshold: number = 75
): MatchResult {
  // Step 1: Extract JD keywords
  const jdKeywords = extractJDKeywords(jdText, jdRequirements);

  // Step 2: Parse resume
  const resume = parseResume(resumeText);

  // Step 3: Compute cosine similarity
  const cosineResult = computeCosineSimilarity(jdKeywords, resume);

  // Step 4: Compute keyword match
  const keywordMatch = computeKeywordMatch(jdKeywords, resume);

  // Step 5: Anti-hallucination verification
  const antiHallucinationReport = generateAntiHallucinationReport(resume, resumeText);

  // Step 6: Compute dimension scores
  const dimensionScores = computeDimensionScores(jdKeywords, resume, cosineResult, keywordMatch);

  // Step 7: Calculate weighted overall score
  const overall = Math.round(
    dimensionScores.reduce((sum, d) => sum + d.weightedScore, 0) /
    dimensionScores.reduce((sum, d) => sum + d.weight, 0)
  );

  // Step 8: Apply anti-hallucination confidence adjustment
  const confidenceAdjustedOverall = Math.round(
    overall * (0.5 + 0.5 * antiHallucinationReport.overallConfidence)
  );

  // Step 9: Determine shortlist status
  const shortlisted = confidenceAdjustedOverall >= shortlistThreshold;
  const shortlistReason = generateShortlistReason(confidenceAdjustedOverall, shortlistThreshold, keywordMatch, cosineResult);

  // Step 10: Generate recommendations
  const recommendations = generateRecommendations(keywordMatch, resume, jdKeywords);

  return {
    overall: confidenceAdjustedOverall,
    keywordMatch,
    cosineSimilarity: cosineResult,
    dimensionScores,
    shortlisted,
    shortlistReason,
    antiHallucinationReport,
    recommendations,
  };
}

/* ──────────────── Dimension Scoring ──────────────── */

function computeDimensionScores(
  jdKeywords: JDKeywords,
  resume: ResumeExtracted,
  cosine: CosineResult,
  keywordMatch: KeywordMatchResult
): DimensionScore[] {
  // Skills dimension
  const skillsCategory = keywordMatch.categoryBreakdown.find(c => c.category === 'skills');
  const domainCategory = keywordMatch.categoryBreakdown.find(c => c.category === 'domain');
  const skillsScore = Math.round(
    ((skillsCategory?.percentage || 0) * 0.7 + (domainCategory?.percentage || 0) * 0.3)
  );

  // Experience dimension
  const expReq = jdKeywords.experience;
  let expScore = 50; // base
  if (expReq.length > 0) {
    const yearsRequired = extractYearsFromRequirement(expReq);
    if (resume.yearsOfExperience >= yearsRequired) expScore = 90 + Math.min(10, (resume.yearsOfExperience - yearsRequired) * 2);
    else if (resume.yearsOfExperience >= yearsRequired * 0.75) expScore = 70;
    else if (resume.yearsOfExperience >= yearsRequired * 0.5) expScore = 50;
    else expScore = 30;
  }
  expScore = Math.min(100, Math.round(expScore));

  // Education dimension
  const eduCategory = keywordMatch.categoryBreakdown.find(c => c.category === 'education');
  const certCategory = keywordMatch.categoryBreakdown.find(c => c.category === 'certifications');
  const eduScore = Math.round(
    ((eduCategory?.percentage || 0) * 0.6 + (certCategory?.percentage || 0) * 0.4)
  );

  // Culture fit dimension (based on soft skills + cosine similarity)
  const softCategory = keywordMatch.categoryBreakdown.find(c => c.category === 'softSkills');
  const cultureScore = Math.round(
    ((softCategory?.percentage || 0) * 0.4 + cosine.score * 100 * 0.6)
  );

  return [
    {
      dimension: 'Skills Match',
      score: skillsScore,
      weight: 35,
      weightedScore: skillsScore * 0.35,
      details: `Matched ${skillsCategory?.matched || 0}/${skillsCategory?.total || 0} technical skills. ${skillsCategory?.missedItems?.length || 0} skills gap identified.`,
    },
    {
      dimension: 'Experience',
      score: expScore,
      weight: 30,
      weightedScore: expScore * 0.30,
      details: `Candidate has ${resume.yearsOfExperience} years experience. ${expScore >= 70 ? 'Meets requirements.' : 'Below required experience level.'}`,
    },
    {
      dimension: 'Education & Certs',
      score: eduScore,
      weight: 15,
      weightedScore: eduScore * 0.15,
      details: `Education match: ${eduCategory?.percentage || 0}%. Certification match: ${certCategory?.percentage || 0}%.`,
    },
    {
      dimension: 'Culture Fit',
      score: cultureScore,
      weight: 20,
      weightedScore: cultureScore * 0.20,
      details: `Soft skills alignment: ${softCategory?.percentage || 0}%. Semantic similarity: ${Math.round(cosine.score * 100)}%.`,
    },
  ];
}

/* ──────────────── Helper Functions ──────────────── */

function tokenize(text: string): string[] {
  return text
    .replace(/[^\w\s+#./-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t.toLowerCase()))
    .map(t => t.toLowerCase());
}

function extractSkillsFromText(tokens: string[], fullText: string): string[] {
  const skills = new Set<string>();

  // Match against master skill lists
  for (const [, skillList] of Object.entries(TECH_SKILLS_MASTER)) {
    for (const skill of skillList) {
      if (fullText.includes(skill.toLowerCase())) {
        skills.add(skill);
      }
    }
  }

  // Also check for compound terms
  const compoundPatterns = [
    /react\s*native/gi, /next\.?\s*js/gi, /node\.?\s*js/gi, /machine\s*learning/gi,
    /deep\s*learning/gi, /data\s*engineering/gi, /project\s*management/gi,
    /product\s*management/gi, /business\s*development/gi, /cloud\s*computing/gi,
    /full\s*stack/gi, /front\s*end/gi, /back\s*end/gi, /data\s*science/gi,
    /data\s*analytics/gi, /business\s*intelligence/gi, /quality\s*assurance/gi,
  ];

  for (const pattern of compoundPatterns) {
    const matches = fullText.match(pattern);
    if (matches) {
      matches.forEach(m => skills.add(m.trim()));
    }
  }

  return Array.from(skills);
}

function extractExperienceRequirements(text: string): string[] {
  const reqs: string[] = [];
  const yearPattern = /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/gi;
  const matches = text.match(yearPattern);
  if (matches) reqs.push(...matches.map(m => m.trim()));

  const levelPattern = /senior|lead|principal|staff|junior|mid.level|entry.level/gi;
  const levelMatches = text.match(levelPattern);
  if (levelMatches) reqs.push(...[...new Set(levelMatches)].map(l => `${l} level`));

  return reqs;
}

function extractEducationRequirements(text: string): string[] {
  const edu: string[] = [];
  const patterns = [
    /b\.?tech\.?|bachelor|b\.?e\.?|b\.?sc\.?/gi,
    /m\.?tech\.?|master|m\.?b\.?a\.?|m\.?sc\.?|m\.?c\.?a\.?/gi,
    /phd|ph\.?d|doctorate/gi,
    /computer science|information technology|electronics|mechanical|civil|electrical/gi,
    /iit|nit|bits|iiit/gi,
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) edu.push(...[...new Set(matches)].map(m => m.trim()));
  }

  return [...new Set(edu)];
}

function extractCertifications(text: string): string[] {
  const certs: string[] = [];
  const certPattern = /aws\s*(?:certified|solutions|developer|sysops)|azure\s*(?:certified|fundamentals|admin)|gcp\s*(?:certified|professional)|pmp|csm|psm|ck[ads]|shrm|phr|sap\s*(?:certified|hana|fico)|salesforce\s*(?:certified|admin|developer)|cisa|cism|cissp|cissp|six\s*sigma|itil|prince2/gi;
  const matches = text.match(certPattern);
  if (matches) certs.push(...[...new Set(matches)].map(m => m.trim()));
  return certs;
}

function extractSoftSkills(text: string): string[] {
  const softSkills = [
    'communication', 'leadership', 'teamwork', 'problem-solving', 'problem solving',
    'analytical', 'critical thinking', 'adaptability', 'time management',
    'collaboration', 'mentoring', 'presentation', 'negotiation', 'stakeholder management',
    'cross-functional', 'attention to detail', 'self-motivated', 'proactive',
  ];
  return softSkills.filter(s => text.includes(s.toLowerCase()));
}

function extractDomain(text: string): string[] {
  const domains = [
    'fintech', 'edtech', 'healthtech', 'e-commerce', 'ecommerce', 'saas',
    'b2b', 'b2c', 'enterprise', 'startup', 'hrms', 'ats', 'crm', 'erp',
    'banking', 'insurance', 'healthcare', 'retail', 'logistics', 'manufacturing',
  ];
  return domains.filter(d => text.includes(d.toLowerCase()));
}

function splitResumeSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const sectionHeaders = [
    'summary', 'profile', 'objective', 'about',
    'experience', 'work experience', 'professional experience', 'employment',
    'education', 'academic',
    'skills', 'technical skills', 'core competencies', 'competencies',
    'certifications', 'certificates', 'licenses',
    'projects', 'personal projects',
    'achievements', 'awards', 'honors',
    'publications', 'research',
    'volunteering', 'community',
    'interests', 'hobbies',
    'references',
  ];

  const lines = text.split('\n');
  let currentSection = 'header';
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();
    let matchedSection = false;

    for (const header of sectionHeaders) {
      if (trimmed === header || trimmed === `${header}:` || trimmed.includes(header)) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = header;
        currentContent = [];
        matchedSection = true;
        break;
      }
    }

    if (!matchedSection) {
      currentContent.push(line);
    }
  }

  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n');
  }

  return sections;
}

function extractSkillsFromResume(text: string, sections: Record<string, string>): ExtractedItem[] {
  const skills: ExtractedItem[] = [];
  const skillsSection = (sections['skills'] || sections['technical skills'] || '').toLowerCase();
  const allText = text;

  for (const [, skillList] of Object.entries(TECH_SKILLS_MASTER)) {
    for (const skill of skillList) {
      const skillLower = skill.toLowerCase();
      if (allText.includes(skillLower)) {
        // Higher confidence if found in skills section
        const inSkillsSection = skillsSection.includes(skillLower);
        skills.push({
          value: skill,
          confidence: inSkillsSection ? 0.95 : 0.7,
          source: inSkillsSection ? 'Skills section' : 'Mentioned in experience/projects',
          verified: false,
        });
      }
    }
  }

  // Also check for compound terms
  const compoundPatterns = [
    { pattern: /react\s*native/gi, name: 'React Native' },
    { pattern: /next\.?\s*js/gi, name: 'Next.js' },
    { pattern: /node\.?\s*js/gi, name: 'Node.js' },
    { pattern: /machine\s*learning/gi, name: 'Machine Learning' },
    { pattern: /deep\s*learning/gi, name: 'Deep Learning' },
    { pattern: /full\s*stack/gi, name: 'Full Stack' },
  ];

  for (const { pattern, name } of compoundPatterns) {
    if (pattern.test(allText) && !skills.some(s => s.value.toLowerCase() === name.toLowerCase())) {
      skills.push({
        value: name,
        confidence: 0.85,
        source: 'Detected in resume text',
        verified: false,
      });
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return skills.filter(s => {
    const key = s.value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractExperienceFromResume(text: string, sections: Record<string, string>): ExtractedItem[] {
  const items: ExtractedItem[] = [];
  const expSection = sections['experience'] || sections['work experience'] || sections['professional experience'] || '';

  // Extract job titles
  const titlePatterns = [
    /(?:senior|lead|principal|staff|junior)?\s*(?:software|frontend|backend|fullstack|full.stack|data|ml|devops|cloud|product|project|engineering|design|sales|marketing|hr|finance|operations)\s*(?:engineer|developer|architect|manager|lead|director|analyst|designer|consultant|specialist|coordinator)/gi,
  ];

  for (const pattern of titlePatterns) {
    const matches = expSection.match(pattern);
    if (matches) {
      [...new Set(matches)].forEach(m => {
        items.push({
          value: m.trim(),
          confidence: 0.9,
          source: 'Experience section',
          verified: false,
        });
      });
    }
  }

  return items;
}

function extractEducationFromResume(text: string, sections: Record<string, string>): ExtractedItem[] {
  const items: ExtractedItem[] = [];
  const eduSection = (sections['education'] || sections['academic'] || '').toLowerCase();

  const patterns = [
    { regex: /b\.?tech\.?/gi, name: 'B.Tech' },
    { regex: /m\.?tech\.?/gi, name: 'M.Tech' },
    { regex: /bachelor/gi, name: "Bachelor's Degree" },
    { regex: /master/gi, name: "Master's Degree" },
    { regex: /m\.?b\.?a\.?/gi, name: 'MBA' },
    { regex: /m\.?c\.?a\.?/gi, name: 'MCA' },
    { regex: /b\.?c\.?a\.?/gi, name: 'BCA' },
    { regex: /b\.?sc\.?/gi, name: 'B.Sc' },
    { regex: /m\.?sc\.?/gi, name: 'M.Sc' },
    { regex: /ph\.?d\.?/gi, name: 'PhD' },
    { regex: /computer science/gi, name: 'Computer Science' },
    { regex: /information technology/gi, name: 'Information Technology' },
  ];

  for (const { regex, name } of patterns) {
    if (regex.test(eduSection)) {
      items.push({
        value: name,
        confidence: 0.9,
        source: 'Education section',
        verified: false,
      });
    }
  }

  return items;
}

function extractCertificationsFromResume(text: string, sections: Record<string, string>): ExtractedItem[] {
  const items: ExtractedItem[] = [];
  const certSection = (sections['certifications'] || sections['certificates'] || '').toLowerCase();
  const fullText = text;

  const certPatterns = [
    { regex: /aws\s*(?:certified|solutions|developer)/gi, name: 'AWS Certified' },
    { regex: /azure\s*(?:certified|fundamentals|admin)/gi, name: 'Azure Certified' },
    { regex: /gcp\s*(?:certified|professional)/gi, name: 'GCP Certified' },
    { regex: /pmp/gi, name: 'PMP' },
    { regex: /csm/gi, name: 'CSM' },
    { regex: /ck[ads]/gi, name: 'Kubernetes Certified' },
    { regex: /salesforce\s*(?:certified|admin)/gi, name: 'Salesforce Certified' },
    { regex: /shrm/gi, name: 'SHRM Certified' },
  ];

  for (const { regex, name } of certPatterns) {
    if (regex.test(certSection)) {
      items.push({
        value: name,
        confidence: 0.95,
        source: 'Certifications section',
        verified: false,
      });
    } else if (regex.test(fullText)) {
      items.push({
        value: name,
        confidence: 0.6,
        source: 'Mentioned elsewhere in resume',
        verified: false,
      });
    }
  }

  return items;
}

function extractSoftSkillsFromResume(text: string, sections: Record<string, string>): ExtractedItem[] {
  const softKeywords = [
    'communication', 'leadership', 'teamwork', 'mentoring', 'collaboration',
    'problem-solving', 'analytical', 'critical thinking', 'stakeholder management',
    'presentation', 'negotiation', 'cross-functional', 'proactive', 'self-motivated',
  ];

  return softKeywords
    .filter(k => text.includes(k))
    .map(k => ({
      value: k.charAt(0).toUpperCase() + k.slice(1),
      confidence: 0.75,
      source: 'Detected in resume text',
      verified: false,
    }));
}

function calculateYearsOfExperience(text: string, sections: Record<string, string>): number {
  const expSection = sections['experience'] || sections['work experience'] || '';

  // Try to find explicit years mentioned
  const yearPattern = /(\d+)\+?\s*years?/gi;
  const matches = expSection.match(yearPattern);
  if (matches && matches.length > 0) {
    const years = matches.map(m => parseInt(m) || 0);
    return Math.max(...years);
  }

  // Try to calculate from date ranges
  const dateRangePattern = /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(\d{4})\s*[-–to]+\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|current)[a-z]*\.?\s*(\d{4})?/gi;
  const dateMatches = [...expSection.matchAll(dateRangePattern)];
  if (dateMatches.length > 0) {
    let totalMonths = 0;
    const currentYear = new Date().getFullYear();
    for (const match of dateMatches) {
      const startYear = parseInt(match[1]) || 0;
      const endYear = parseInt(match[2]) || currentYear;
      totalMonths += (endYear - startYear) * 12;
    }
    return Math.round(totalMonths / 12);
  }

  // Fallback: count year mentions
  const yearMentions = text.match(/20\d{2}/g);
  if (yearMentions && yearMentions.length >= 2) {
    const years = yearMentions.map(y => parseInt(y)).filter(y => y >= 2000 && y <= new Date().getFullYear());
    if (years.length >= 2) {
      return Math.max(...years) - Math.min(...years);
    }
  }

  return 0;
}

function extractCurrentRole(sections: Record<string, string>): string {
  const expSection = sections['experience'] || '';
  const titleMatch = expSection.match(/(?:senior|lead|principal|staff)?\s*(?:software|frontend|backend|fullstack|data|ml|devops|product|project|engineering|design|sales|marketing|hr)\s*(?:engineer|developer|architect|manager|lead|director|analyst|designer)/i);
  return titleMatch ? titleMatch[0].trim() : 'Not specified';
}

function extractLocation(sections: Record<string, string>): string {
  const headerSection = sections['header'] || '';
  const cityPattern = /(?:bangalore|bengaluru|mumbai|delhi|pune|hyderabad|chennai|kolkata|noida|gurgaon|ahmedabad|jaipur|indore|cochin|kochi|chandigarh)/i;
  const match = headerSection.match(cityPattern) || '';
  return match ? match[0] : 'Not specified';
}

function isVerifiedInText(item: string, lowerText: string): boolean {
  const itemLower = item.toLowerCase();
  if (lowerText.includes(itemLower)) return true;

  // Check synonyms
  const synonyms = SKILL_SYNONYMS[itemLower];
  if (synonyms) {
    for (const syn of synonyms) {
      if (lowerText.includes(syn.toLowerCase())) return true;
    }
  }

  // Check partial match for multi-word items
  const words = itemLower.split(/\s+/);
  if (words.length > 1) {
    const matchCount = words.filter(w => w.length > 2 && lowerText.includes(w)).length;
    if (matchCount / words.length >= 0.7) return true;
  }

  return false;
}

function extractYearsFromRequirement(reqs: string[]): number {
  for (const req of reqs) {
    const match = req.match(/(\d+)/);
    if (match) return parseInt(match[1]);
  }
  return 3; // default
}

function generateShortlistReason(
  score: number,
  threshold: number,
  keywordMatch: KeywordMatchResult,
  cosine: CosineResult
): string {
  if (score >= threshold) {
    const topTerms = cosine.topContributingTerms.slice(0, 5).map(t => t.term).join(', ');
    return `Score ${score}% exceeds threshold ${threshold}%. Strong match on: ${topTerms}. ${keywordMatch.matchedKeywords.length}/${keywordMatch.totalKeywords} keywords matched.`;
  }
  return `Score ${score}% below threshold ${threshold}%. Only ${keywordMatch.matchedKeywords.length}/${keywordMatch.totalKeywords} keywords matched. Missing: ${keywordMatch.unmatchedKeywords.slice(0, 5).join(', ')}.`;
}

function generateRecommendations(
  keywordMatch: KeywordMatchResult,
  resume: ResumeExtracted,
  jdKeywords: JDKeywords
): string[] {
  const recs: string[] = [];

  // Skills gap
  const skillsCat = keywordMatch.categoryBreakdown.find(c => c.category === 'skills');
  if (skillsCat && skillsCat.missedItems.length > 0) {
    recs.push(`Skills gap identified: ${skillsCat.missedItems.slice(0, 5).join(', ')}. Consider if these are must-have or nice-to-have.`);
  }

  // Experience gap
  if (resume.yearsOfExperience < 3) {
    recs.push('Candidate has limited experience. Consider for junior/entry-level positions or assess project depth.');
  }

  // Certifications
  const certCat = keywordMatch.categoryBreakdown.find(c => c.category === 'certifications');
  if (certCat && certCat.missedItems.length > 0) {
    recs.push(`Missing certifications: ${certCat.missedItems.join(', ')}. These may be required for compliance.`);
  }

  // Strong areas
  if (skillsCat && skillsCat.percentage >= 80) {
    recs.push(`Strong technical alignment (${skillsCat.percentage}% skill match). Prioritize for technical round.`);
  }

  // Interview focus
  if (keywordMatch.matchPercentage >= 60 && keywordMatch.matchPercentage < 80) {
    recs.push('Moderate match. Focus interview on gap areas to assess learnability and adaptability.');
  }

  return recs;
}

/**
 * Batch analyze multiple resumes against a JD
 * Returns results sorted by overall score (descending)
 */
export function batchAnalyzeResumes(
  resumes: { id: string; name: string; text: string }[],
  jdText: string,
  jdRequirements: string[],
  shortlistThreshold: number = 75
): { id: string; name: string; result: MatchResult }[] {
  return resumes
    .map(r => ({
      id: r.id,
      name: r.name,
      result: analyzeResume(r.text, jdText, jdRequirements, shortlistThreshold),
    }))
    .sort((a, b) => b.result.overall - a.result.overall);
}
