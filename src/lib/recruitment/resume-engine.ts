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

/* ──────────────── Skill Synonyms & Abbreviation Map ──────────────── */

/**
 * SKILL_SYNONYMS: Maps a canonical skill name to its known synonyms/abbreviations.
 * Used for bidirectional matching — both the JD and resume can use either form.
 *
 * SKILL_ABBREVIATION_MAP: Maps short-form abbreviations to their full expanded forms.
 * When a resume contains "ML", "NLP", "DL", "CV" etc., these get expanded so the
 * matching engine can recognize them against full-form JD requirements.
 */
const SKILL_SYNONYMS: Record<string, string[]> = {
  // ── Programming Languages ──
  'javascript': ['js', 'es6', 'es2015', 'ecmascript', 'es2016', 'es2017', 'es2020', 'esnext'],
  'typescript': ['ts', 'tsx'],
  'python': ['py', 'python3', 'python2'],
  'java': ['j2ee', 'jee', 'jdk', 'jvm', 'java se', 'java ee'],
  'c': ['c language', 'ansi c'],
  'c++': ['cpp', 'c plus plus', 'cplusplus'],
  'c#': ['csharp', 'c sharp', 'csharp.net'],
  '.net': ['dotnet', 'dot net', 'asp.net', 'dotnet core'],
  'go': ['golang', 'go lang'],
  'rust': ['rustlang'],
  'ruby': ['ruby on rails', 'ror'],
  'php': ['php7', 'php8', 'laravel'],
  'swift': ['swift ios', 'swift5'],
  'kotlin': ['kotlin android', 'kt'],
  'scala': ['scala lang'],
  'r': ['r lang', 'rlang', 'r programming', 'rstats'],
  'matlab': ['matrix laboratory'],
  'perl': ['perl5'],
  'lua': ['lua script'],

  // ── Frontend Frameworks ──
  'react': ['reactjs', 'react.js', 'react js', 'react 18', 'react 19'],
  'nextjs': ['next.js', 'next', 'next js', 'nextjs 14', 'nextjs 15'],
  'angular': ['angularjs', 'angular.js', 'angular js', 'ng'],
  'vue': ['vuejs', 'vue.js', 'vue js', 'vue3', 'vue 3'],
  'svelte': ['sveltejs', 'svelte kit', 'sveltekit'],
  'remix': ['remix run'],
  'gatsby': ['gatsbyjs'],
  'nuxt': ['nuxtjs', 'nuxt.js'],

  // ── Backend Frameworks ──
  'nodejs': ['node', 'node.js', 'node js', 'express.js', 'express'],
  'express': ['expressjs', 'express.js', 'express js'],
  'django': ['django framework', 'django rest', 'drf', 'django rest framework'],
  'flask': ['flask framework', 'flask api'],
  'fastapi': ['fast api', 'fast-api'],
  'spring': ['spring boot', 'springboot', 'spring boot 3', 'spring framework'],
  'rails': ['ruby on rails', 'ror'],
  'laravel': ['laravel php'],
  'nestjs': ['nest.js', 'nest js'],
  'gin': ['gin gonic'],

  // ── Databases ──
  'postgresql': ['postgres', 'pg', 'psql', 'postgres sql'],
  'mongodb': ['mongo', 'mongoose'],
  'mysql': ['my sql', 'mariadb'],
  'redis': ['redis cache', 'redis server'],
  'elasticsearch': ['elastic', 'es', 'elastic search', 'opensearch'],
  'cassandra': ['apache cassandra', 'cql'],
  'dynamodb': ['dynamo db', 'aws dynamo'],
  'sqlite': ['sqlite3'],
  'neo4j': ['neo4j graph', 'cypher'],
  'oracle db': ['oracle database', 'pl/sql', 'plsql'],
  'sql server': ['mssql', 'ms sql', 't-sql', 'tsql'],

  // ── Cloud & DevOps ──
  'aws': ['amazon web services', 'amazon aws', 'aws cloud'],
  'gcp': ['google cloud', 'google cloud platform', 'gcloud'],
  'azure': ['microsoft azure', 'azure cloud', 'ms azure'],
  'docker': ['containerization', 'docker compose', 'docker-compose', 'container'],
  'kubernetes': ['k8s', 'kube', 'k8s cluster', 'helm'],
  'terraform': ['iac', 'infrastructure as code', 'tf'],
  'jenkins': ['ci server', 'jenkins pipeline'],
  'github actions': ['gh actions', 'gha'],
  'gitlab ci': ['gitlab pipeline'],
  'circleci': ['circle ci'],
  'argocd': ['argo cd', 'gitops'],
  'ansible': ['ansible playbook', 'ansible tower'],
  'cloudformation': ['cfn', 'aws cloudformation'],
  'nginx': ['nginx server', 'reverse proxy'],
  'apache': ['apache server', 'httpd'],

  // ── AI / Machine Learning ──
  'machine learning': ['ml', 'ml algorithms', 'ml models', 'ml engineering', 'ml ops', 'predictive modeling'],
  'artificial intelligence': ['ai', 'ai/ml', 'ai ml', 'ai systems', 'ai engineering'],
  'deep learning': ['dl', 'deep neural networks', 'dnn', 'deep nn', 'neural networks', 'nn'],
  'natural language processing': ['nlp', 'text mining', 'text analytics', 'language models', 'computational linguistics'],
  'computer vision': ['cv', 'image processing', 'visual recognition', 'object detection', 'image classification'],
  'large language models': ['llm', 'llms', 'gpt', 'transformer models', 'foundation models', 'generative ai', 'genai', 'gen ai'],
  'reinforcement learning': ['rl', 'rlhf', 'reward modeling'],
  'generative adversarial networks': ['gan', 'gans', 'generative models'],
  'convolutional neural networks': ['cnn', 'convnet', 'convolutional networks'],
  'recurrent neural networks': ['rnn', 'lstm', 'gru', 'sequential models'],
  'transformer architecture': ['transformers', 'attention mechanism', 'self-attention', 'bert', 'gpt architecture'],
  'retrieval augmented generation': ['rag', 'retrieval augmented', 'rag pipeline', 'vector search'],
  'prompt engineering': ['prompting', 'prompt design', 'prompt optimization', 'chain of thought', 'cot', 'few-shot', 'zero-shot'],
  'model fine-tuning': ['fine-tuning', 'finetuning', 'lora', 'qlora', 'peft', 'adapter', 'transfer learning'],
  'mlops': ['ml ops', 'ml operations', 'model deployment', 'model serving', 'ml infrastructure', 'ml platform'],
  'feature engineering': ['feature extraction', 'feature selection', 'feature store'],
  'data preprocessing': ['data cleaning', 'data wrangling', 'etl', 'data transformation'],
  'exploratory data analysis': ['eda', 'data exploration', 'data profiling'],
  'a/b testing': ['ab testing', 'split testing', 'experimentation', 'controlled experiments'],
  'recommender systems': ['recommendation engine', 'collaborative filtering', 'recsys'],

  // ── AI/ML Frameworks & Libraries ──
  'tensorflow': ['tf', 'tensorflow 2', 'tf2', 'keras'],
  'pytorch': ['torch', 'pytorch lightning', 'lightning'],
  'scikit-learn': ['sklearn', 'scikit learn', 'sk-learn'],
  'pandas': ['pd', 'pandas dataframe'],
  'numpy': ['np', 'numerical python'],
  'matplotlib': ['plt', 'pyplot'],
  'seaborn': ['sns'],
  'opencv': ['cv2', 'computer vision library'],
  'hugging face': ['huggingface', 'hf', 'transformers library', 'hf transformers'],
  'langchain': ['lang chain', 'lc'],
  'mlflow': ['ml flow', 'experiment tracking'],
  'weights & biases': ['wandb', 'w&b', 'wb'],
  'spacy': ['spacy nlp', 'spaCy'],
  'nltk': ['natural language toolkit'],
  'gensim': ['topic modeling'],
  'statsmodels': ['statistical models'],
  'xgboost': ['extreme gradient boosting', 'xgb'],
  'lightgbm': ['lgbm', 'light gbm', 'lgboost'],
  'catboost': ['cat boost', 'cb'],
  'ray': ['ray framework', 'distributed computing'],
  'apache spark': ['spark', 'pyspark', 'spark sql', 'spark ml'],
  'databricks': ['databricks platform', 'delta lake'],
  'airflow': ['apache airflow', 'dag', 'workflow orchestration'],
  'kafka': ['apache kafka', 'event streaming', 'message queue'],
  'dbt': ['data build tool', 'dbt core'],

  // ── Data & Analytics ──
  'sql': ['structured query language', 'sql queries', 'sql server'],
  'tableau': ['tableau desktop', 'tableau server', 'tableau prep'],
  'power bi': ['powerbi', 'pbi', 'dax'],
  'looker': ['lookml', 'looker studio'],
  'snowflake': ['snowflake db', 'snowflake warehouse'],
  'data warehousing': ['data warehouse', 'dw', 'data mart', 'olap'],
  'etl': ['extract transform load', 'data pipeline', 'data integration'],
  'data lake': ['datalake', 'data lakehouse', 'lakehouse'],
  'data governance': ['data quality', 'data catalog', 'data lineage'],
  'business intelligence': ['bi', 'bi tools', 'business analytics', 'reporting', 'dashboards'],
  'data engineering': ['data engineer', 'data infrastructure', 'data platform'],
  'data science': ['ds', 'data scientist', 'statistical analysis'],
  'data analytics': ['da', 'data analyst', 'analytics', 'quantitative analysis'],

  // ── Design ──
  'figma': ['figma design', 'figma prototype'],
  'sketch': ['sketch app', 'sketch design'],
  'adobe xd': ['xd', 'adobe experience design'],
  'ui/ux': ['user interface', 'user experience', 'ux/ui', 'ux design', 'ui design', 'product design'],
  'design systems': ['design system', 'component library', 'design tokens'],
  'prototyping': ['prototype', 'interactive prototype', 'wireframe prototype'],
  'wireframing': ['wireframe', 'wireframes', 'low fidelity'],
  'user research': ['ux research', 'usability research', 'user studies'],
  'accessibility': ['a11y', 'wcag', 'aria', 'inclusive design'],

  // ── Mobile ──
  'react native': ['reactnative', 'react native cli', 'expo'],
  'flutter': ['flutter sdk', 'dart', 'flutter app'],
  'ios': ['iphone', 'ipad', 'swiftui', 'uikit'],
  'android': ['android sdk', 'jetpack compose', 'android studio'],

  // ── Soft Skills / Methodologies ──
  'agile': ['scrum', 'kanban', 'agile methodology', 'sprint', 'agile framework'],
  'devops': ['sre', 'site reliability', 'devsecops', 'platform engineering'],
  'saas': ['software as a service', 'cloud software', 'web app'],
  'b2b': ['business to business', 'enterprise'],
  'b2c': ['business to consumer', 'consumer'],
  'hrms': ['human resource management', 'hr management', 'hr system', 'hris'],
  'ats': ['applicant tracking', 'recruitment software', 'recruiting platform'],
  'crm': ['customer relationship management', 'salesforce'],
  'erp': ['enterprise resource planning', 'sap', 'oracle erp'],

  // ── Version Control & Tools ──
  'git': ['github', 'gitlab', 'bitbucket', 'version control'],
  'jira': ['atlassian jira', 'issue tracking'],
  'confluence': ['atlassian confluence', 'wiki'],
  'notion': ['notion app', 'notion workspace'],
  'slack': ['slack api', 'slack bot'],
  'postman': ['api testing', 'rest client', 'http client'],

  // ── Security ──
  'cybersecurity': ['infosec', 'information security', 'security engineering', 'security ops', 'secops'],
  'penetration testing': ['pentesting', 'pen test', 'ethical hacking', 'red team'],
  'oauth': ['oauth2', 'openid connect', 'oidc', 'sso'],
  'encryption': ['cryptography', 'crypto', 'tls', 'ssl', 'https'],

  // ── Testing ──
  'unit testing': ['unit test', 'jest', 'mocha', 'pytest', 'junit'],
  'integration testing': ['integration test', 'e2e testing', 'end to end testing'],
  'selenium': ['selenium webdriver', 'webdriver'],
  'cypress': ['cypress io', 'cypress testing'],
  'playwright': ['playwright testing', 'ms playwright'],
  'load testing': ['performance testing', 'stress testing', 'jmeter', 'k6'],
};

/**
 * REVERSE_SYNONYM_MAP: For quick lookup — given any abbreviation/synonym,
 * find all canonical forms it could map to. Built automatically from SKILL_SYNONYMS.
 */
const REVERSE_SYNONYM_MAP: Record<string, string[]> = {};

// Build the reverse map
for (const [canonical, synonyms] of Object.entries(SKILL_SYNONYMS)) {
  for (const syn of synonyms) {
    const key = syn.toLowerCase();
    if (!REVERSE_SYNONYM_MAP[key]) REVERSE_SYNONYM_MAP[key] = [];
    if (!REVERSE_SYNONYM_MAP[key].includes(canonical)) {
      REVERSE_SYNONYM_MAP[key].push(canonical);
    }
  }
}

/**
 * Expand a skill abbreviation or short form to all possible canonical full forms.
 * E.g., "ml" → ["machine learning"], "nlp" → ["natural language processing"],
 * "dl" → ["deep learning"], "cv" → ["computer vision"]
 */
export function expandSkillAbbreviation(shortForm: string): string[] {
  const lower = shortForm.toLowerCase().trim();

  // Direct reverse lookup
  const fromReverse = REVERSE_SYNONYM_MAP[lower] || [];

  // Check if it's already a canonical form
  const isCanonical = SKILL_SYNONYMS[lower] !== undefined;

  // Combine results
  const results = new Set<string>();
  if (isCanonical) results.add(lower);
  for (const c of fromReverse) results.add(c);

  return Array.from(results);
}

/**
 * Get all possible forms (canonical + synonyms) for a given skill term.
 * Used during matching to check every possible variation.
 */
export function getAllSkillForms(skillTerm: string): string[] {
  const lower = skillTerm.toLowerCase().trim();
  const forms = new Set<string>();
  forms.add(lower);

  // If it's a canonical form, add all synonyms
  if (SKILL_SYNONYMS[lower]) {
    for (const syn of SKILL_SYNONYMS[lower]) forms.add(syn.toLowerCase());
  }

  // If it's a synonym/abbreviation, add canonical forms and their synonyms
  const canonicals = REVERSE_SYNONYM_MAP[lower] || [];
  for (const canonical of canonicals) {
    forms.add(canonical.toLowerCase());
    if (SKILL_SYNONYMS[canonical]) {
      for (const syn of SKILL_SYNONYMS[canonical]) forms.add(syn.toLowerCase());
    }
  }

  return Array.from(forms);
}

/* ──────────────── Technical Skills Master List ──────────────── */

const TECH_SKILLS_MASTER: Record<string, string[]> = {
  'engineering': ['react', 'nextjs', 'typescript', 'javascript', 'python', 'java', 'nodejs', 'go', 'rust', 'c++', 'ruby', 'php', 'swift', 'kotlin', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'terraform', 'ci/cd', 'git', 'sql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'graphql', 'rest api', 'microservices', 'system design', 'algorithms', 'data structures', 'redux', 'tailwind', 'css', 'html', 'angular', 'vue', 'svelte', 'express', 'django', 'flask', 'spring', 'react native', 'flutter', 'devops', 'sre', 'fastapi', 'nestjs', 'remix', 'nuxt', 'selenium', 'cypress', 'playwright', 'jest', 'pytest'],
  'ai & machine learning': ['python', 'machine learning', 'ml', 'deep learning', 'dl', 'natural language processing', 'nlp', 'computer vision', 'cv', 'artificial intelligence', 'ai', 'large language models', 'llm', 'llms', 'tensorflow', 'tf', 'pytorch', 'torch', 'scikit-learn', 'sklearn', 'pandas', 'numpy', 'keras', 'opencv', 'cv2', 'hugging face', 'huggingface', 'langchain', 'mlflow', 'spacy', 'nltk', 'transformers', 'bert', 'gpt', 'rag', 'retrieval augmented generation', 'prompt engineering', 'mlops', 'model fine-tuning', 'lora', 'qlora', 'peft', 'reinforcement learning', 'rl', 'generative adversarial networks', 'gan', 'convolutional neural networks', 'cnn', 'recurrent neural networks', 'rnn', 'lstm', 'xgboost', 'lightgbm', 'catboost', 'feature engineering', 'data preprocessing', 'eda', 'exploratory data analysis', 'a/b testing', 'recommender systems', 'spark', 'pyspark', 'airflow', 'kafka', 'databricks', 'weights & biases', 'wandb', 'ray', 'statistics', 'mathematics', 'linear algebra', 'calculus', 'probability', 'genai', 'generative ai', 'neural networks', 'nn', 'dnn', 'transfer learning', 'fine-tuning', 'model deployment', 'model serving', 'ai ethics', 'responsible ai'],
  'design': ['figma', 'sketch', 'adobe xd', 'invision', 'photoshop', 'illustrator', 'after effects', 'prototyping', 'wireframing', 'user research', 'usability testing', 'design systems', 'accessibility', 'responsive design', 'interaction design', 'information architecture', 'a11y', 'wcag', 'ux design', 'ui design', 'product design'],
  'data': ['python', 'sql', 'spark', 'airflow', 'kafka', 'hadoop', 'tableau', 'power bi', 'looker', 'snowflake', 'databricks', 'dbt', 'etl', 'data warehousing', 'machine learning', 'deep learning', 'nlp', 'computer vision', 'statistics', 'a/b testing', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'data engineering', 'data science', 'data analytics', 'data governance', 'data lake', 'business intelligence', 'bi', 'pyspark', 'delta lake', 'data pipeline', 'data modeling', 'snowflake', 'redshift'],
  'sales': ['salesforce', 'hubspot', 'crm', 'b2b', 'enterprise sales', 'saas', 'pipeline management', 'negotiation', 'revenue forecasting', 'cold calling', 'lead generation', 'account management', 'proposal writing'],
  'hr': ['hrms', 'ats', 'recruitment', 'onboarding', 'performance management', 'compensation', 'labor laws', 'pf', 'esi', 'tds', 'gratuity', 'payroll', 'employee engagement', 'talent management', 'succession planning', 'hris'],
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
 * Compute keyword-level match between JD and resume.
 * Uses comprehensive abbreviation expansion — matches "ML" in resume against
 * "Machine Learning" in JD (and vice versa), "NLP" against "Natural Language Processing",
 * etc. This ensures candidates who write skills in short form are not penalized.
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

  // Pre-compute all possible forms for each resume item (expands abbreviations)
  const resumeFormsMap = new Map<string, string[]>();
  for (const cat of categories) {
    for (const item of cat.resumeItems) {
      if (!resumeFormsMap.has(item.toLowerCase())) {
        resumeFormsMap.set(item.toLowerCase(), getAllSkillForms(item));
      }
    }
  }

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
      let matchType = '';

      // 1. Direct match (exact string equality)
      if (cat.resumeItems.some(r => r.toLowerCase() === jdLower)) {
        isMatch = true;
        matchType = 'exact';
      }

      // 2. Abbreviation-expanded match — get ALL forms for the JD term
      //    E.g., "machine learning" → also checks "ml", "ML algorithms", etc.
      //    E.g., "ml" → also checks "machine learning", "ML engineering", etc.
      if (!isMatch) {
        const jdForms = getAllSkillForms(jdItem);
        for (const form of jdForms) {
          if (cat.resumeItems.some(r => r.toLowerCase() === form)) {
            isMatch = true;
            matchType = 'abbreviation-expanded';
            break;
          }
        }
      }

      // 3. Reverse check — for each resume item, check if its expanded forms include the JD term
      //    This catches cases like: resume has "ML", JD has "Machine Learning"
      if (!isMatch) {
        for (const resumeItem of cat.resumeItems) {
          const resumeForms = resumeFormsMap.get(resumeItem.toLowerCase()) || getAllSkillForms(resumeItem);
          if (resumeForms.includes(jdLower)) {
            isMatch = true;
            matchType = 'reverse-abbreviation';
            break;
          }
        }
      }

      // 4. Synonym match (legacy compatibility)
      if (!isMatch) {
        const synonyms = SKILL_SYNONYMS[jdLower];
        if (synonyms && cat.resumeItems.some(r => synonyms.includes(r.toLowerCase()))) {
          isMatch = true;
          matchType = 'synonym';
        }
      }

      // 5. Partial match (e.g., "react" in "react, next.js")
      if (!isMatch) {
        isMatch = cat.resumeItems.some(r => {
          const rLower = r.toLowerCase();
          // Avoid false positives for very short terms like "c", "r", "go"
          if (jdLower.length <= 2 || rLower.length <= 2) return false;
          return rLower.includes(jdLower) || jdLower.includes(rLower);
        });
        if (isMatch) matchType = 'partial';
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

  // Expand abbreviations found in the JD text
  // E.g., if JD says "ML", also add "Machine Learning" as a keyword
  const jdAbbreviationPatterns: { pattern: RegExp; fullForm: string }[] = [
    { pattern: /\bML\b/gi, fullForm: 'Machine Learning' },
    { pattern: /\bNLP\b/gi, fullForm: 'Natural Language Processing' },
    { pattern: /\bDL\b/gi, fullForm: 'Deep Learning' },
    { pattern: /\bCV\b(?!2)/gi, fullForm: 'Computer Vision' },
    { pattern: /\bAI\b/gi, fullForm: 'Artificial Intelligence' },
    { pattern: /\bLLM\b/gi, fullForm: 'Large Language Models' },
    { pattern: /\bLLMs\b/gi, fullForm: 'Large Language Models' },
    { pattern: /\bRAG\b/gi, fullForm: 'Retrieval Augmented Generation' },
    { pattern: /\bGAN\b/gi, fullForm: 'Generative Adversarial Networks' },
    { pattern: /\bCNN\b/gi, fullForm: 'Convolutional Neural Networks' },
    { pattern: /\bRNN\b/gi, fullForm: 'Recurrent Neural Networks' },
    { pattern: /\bMLOps\b/gi, fullForm: 'MLOps' },
    { pattern: /\bGenAI\b/gi, fullForm: 'Generative AI' },
  ];

  for (const { pattern, fullForm } of jdAbbreviationPatterns) {
    if (pattern.test(fullText) && !skills.has(fullForm)) {
      skills.add(fullForm);
    }
  }

  // Also check for compound terms
  const compoundPatterns = [
    /react\s*native/gi, /next\.?\s*js/gi, /node\.?\s*js/gi, /machine\s*learning/gi,
    /deep\s*learning/gi, /data\s*engineering/gi, /project\s*management/gi,
    /product\s*management/gi, /business\s*development/gi, /cloud\s*computing/gi,
    /full\s*stack/gi, /front\s*end/gi, /back\s*end/gi, /data\s*science/gi,
    /data\s*analytics/gi, /business\s*intelligence/gi, /quality\s*assurance/gi,
    /large\s*language\s*models?/gi, /natural\s*language\s*processing/gi,
    /computer\s*vision/gi, /reinforcement\s*learning/gi, /generative\s*ai/gi,
    /prompt\s*engineering/gi, /model\s*fine.?\s*tuning/gi, /feature\s*engineering/gi,
    /transfer\s*learning/gi, /retrieval\s*augmented\s*generation/gi,
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

  // Also check for abbreviation short forms that might not be in TECH_SKILLS_MASTER
  // e.g., "ML", "NLP", "DL", "CV" etc. — expand them to full forms
  const abbreviationPatterns: { pattern: RegExp; fullForm: string; confidence: number }[] = [
    { pattern: /\bML\b/gi, fullForm: 'Machine Learning', confidence: 0.85 },
    { pattern: /\bNLP\b/gi, fullForm: 'Natural Language Processing', confidence: 0.9 },
    { pattern: /\bDL\b/gi, fullForm: 'Deep Learning', confidence: 0.85 },
    { pattern: /\bCV\b(?!2)/gi, fullForm: 'Computer Vision', confidence: 0.8 },
    { pattern: /\bAI\b/gi, fullForm: 'Artificial Intelligence', confidence: 0.85 },
    { pattern: /\bLLM\b/gi, fullForm: 'Large Language Models', confidence: 0.9 },
    { pattern: /\bLLMs\b/gi, fullForm: 'Large Language Models', confidence: 0.9 },
    { pattern: /\bRAG\b/gi, fullForm: 'Retrieval Augmented Generation', confidence: 0.9 },
    { pattern: /\bGAN\b/gi, fullForm: 'Generative Adversarial Networks', confidence: 0.85 },
    { pattern: /\bGANs\b/gi, fullForm: 'Generative Adversarial Networks', confidence: 0.85 },
    { pattern: /\bCNN\b/gi, fullForm: 'Convolutional Neural Networks', confidence: 0.85 },
    { pattern: /\bRNN\b/gi, fullForm: 'Recurrent Neural Networks', confidence: 0.85 },
    { pattern: /\bLSTM\b/gi, fullForm: 'Long Short-Term Memory', confidence: 0.85 },
    { pattern: /\bMLOps\b/gi, fullForm: 'MLOps', confidence: 0.9 },
    { pattern: /\bGenAI\b/gi, fullForm: 'Generative AI', confidence: 0.9 },
    { pattern: /\bRL\b/gi, fullForm: 'Reinforcement Learning', confidence: 0.8 },
    { pattern: /\bEDA\b/gi, fullForm: 'Exploratory Data Analysis', confidence: 0.8 },
    { pattern: /\bSRE\b/gi, fullForm: 'Site Reliability Engineering', confidence: 0.85 },
    { pattern: /\bK8s\b/gi, fullForm: 'Kubernetes', confidence: 0.95 },
    { pattern: /\bGCP\b/gi, fullForm: 'Google Cloud Platform', confidence: 0.9 },
    { pattern: /\bAWS\b/gi, fullForm: 'Amazon Web Services', confidence: 0.9 },
    { pattern: /\bIaC\b/gi, fullForm: 'Infrastructure as Code', confidence: 0.85 },
    { pattern: /\bCI\/CD\b/gi, fullForm: 'CI/CD', confidence: 0.95 },
    { pattern: /\bSaaS\b/gi, fullForm: 'Software as a Service', confidence: 0.9 },
    { pattern: /\bB2B\b/gi, fullForm: 'Business to Business', confidence: 0.9 },
    { pattern: /\bERP\b/gi, fullForm: 'Enterprise Resource Planning', confidence: 0.9 },
    { pattern: /\bCRM\b/gi, fullForm: 'Customer Relationship Management', confidence: 0.9 },
    { pattern: /\bA11y\b/gi, fullForm: 'Accessibility', confidence: 0.9 },
  ];

  for (const { pattern, fullForm, confidence } of abbreviationPatterns) {
    if (pattern.test(allText)) {
      // Only add if the full form isn't already detected
      const fullFormLower = fullForm.toLowerCase();
      if (!skills.some(s => s.value.toLowerCase() === fullFormLower)) {
        const inSkillsSection = skillsSection.includes(allText.match(pattern)?.[0]?.toLowerCase() || '');
        skills.push({
          value: fullForm,
          confidence: inSkillsSection ? Math.min(confidence + 0.1, 0.98) : confidence,
          source: inSkillsSection
            ? `Skills section (expanded from abbreviation ${pattern.source.replace(/\\b/g, '')})`
            : `Detected abbreviation in resume (expanded to ${fullForm})`,
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
    { pattern: /large\s*language\s*models?/gi, name: 'Large Language Models' },
    { pattern: /natural\s*language\s*processing/gi, name: 'Natural Language Processing' },
    { pattern: /computer\s*vision/gi, name: 'Computer Vision' },
    { pattern: /reinforcement\s*learning/gi, name: 'Reinforcement Learning' },
    { pattern: /generative\s*ai/gi, name: 'Generative AI' },
    { pattern: /prompt\s*engineering/gi, name: 'Prompt Engineering' },
    { pattern: /model\s*fine.?\s*tuning/gi, name: 'Model Fine-tuning' },
    { pattern: /feature\s*engineering/gi, name: 'Feature Engineering' },
    { pattern: /data\s*science/gi, name: 'Data Science' },
    { pattern: /data\s*engineering/gi, name: 'Data Engineering' },
    { pattern: /data\s*analytics/gi, name: 'Data Analytics' },
    { pattern: /transfer\s*learning/gi, name: 'Transfer Learning' },
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

  // Check all expanded forms (abbreviations, synonyms, etc.)
  const allForms = getAllSkillForms(item);
  for (const form of allForms) {
    if (lowerText.includes(form.toLowerCase())) return true;
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
    recs.push(`Skills gap identified: ${skillsCat.missedItems.slice(0, 5).join(', ')}. Consider if these are must-have or nice-to-have. Note: Some skills may be present under different names/abbreviations — verify manually if needed.`);
  }

  // Check for abbreviation-expanded matches that should be verified
  const expandedMatches: string[] = [];
  for (const skill of resume.skills) {
    if (skill.source.includes('expanded from abbreviation') || skill.source.includes('Detected abbreviation')) {
      expandedMatches.push(`${skill.value} (from abbreviation)`);
    }
  }
  if (expandedMatches.length > 0) {
    recs.push(`Abbreviation-expanded skills detected: ${expandedMatches.slice(0, 5).join(', ')}. These were auto-expanded from short forms (e.g., ML→Machine Learning, NLP→Natural Language Processing). Verify during interview.`);
  }

  // Experience gap
  if (resume.yearsOfExperience < 3) {
    recs.push('Candidate has limited experience. Consider for junior/entry-level positions or assess project depth.');
  }

  // Experience surplus
  if (resume.yearsOfExperience > 8) {
    recs.push('Senior candidate with significant experience. Ensure role level and compensation match expectations.');
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

  // Low match warning
  if (keywordMatch.matchPercentage < 50) {
    recs.push('Low keyword match detected. This candidate may be better suited for a different role. Review resume manually before rejecting.');
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
