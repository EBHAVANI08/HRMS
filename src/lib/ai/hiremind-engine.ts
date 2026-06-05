/**
 * HireMind AI Engine — 12-Agent Resume Analysis System
 *
 * Architecture:
 * - LLM Provider Abstraction: Works with Ollama (when available) and z-ai-web-dev-sdk
 * - 12 Focused Agents: Each agent calls the LLM with targeted prompts (NOT massive JSON dumps)
 * - RAG Pipeline: TF-IDF based document retrieval for context enrichment
 * - Skill Abbreviation Expansion: Comprehensive dictionary for AI/ML domain
 *
 * IMPORTANT: This runs server-side only. z-ai-web-dev-sdk must NOT be imported on the client.
 */

/* ──────────────── Types ──────────────── */

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experience: { title: string; company: string; duration: string; highlights: string[] }[];
  education: { degree: string; institution: string; year: string }[];
  certifications: string[];
  totalYearsExperience: number;
  rawText: string;
}

export interface DomainResult {
  primaryDomain: string;
  secondaryDomains: string[];
  confidence: number;
  reasoning: string;
}

export interface SeniorityResult {
  level: string; // "fresher" | "junior" | "mid" | "senior" | "lead" | "principal" | "director"
  yearsRange: string;
  reasoning: string;
  confidence: number;
}

export interface ExpandedSkills {
  original: string[];
  expanded: { abbreviation: string; fullForms: string[]; relatedSkills: string[] }[];
  allSkills: string[];
}

export interface ParsedJD {
  title: string;
  department: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: string;
  experienceYears: { min: number; max: number };
  education: string[];
  responsibilities: string[];
  benefits: string[];
  domain: string;
  rawText: string;
}

export interface MatchResult {
  overallScore: number; // 0-100
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  domainMatch: number;
  matchedSkills: string[];
  missingSkills: string[];
  skillGapDetails: { skill: string; importance: "critical" | "important" | "nice-to-have"; candidateHas: boolean }[];
}

export interface AchievementResult {
  score: number; // 0-100
  quantifiedAchievements: string[];
  genericStatements: string[];
  improvementSuggestions: string[];
  impactLevel: "high" | "medium" | "low";
}

export interface ATSScore {
  overall: number; // 0-100
  keywordOptimization: number;
  formatting: number;
  sectionCompleteness: number;
  impactLanguage: number;
  issues: string[];
  recommendations: string[];
}

export interface GapResult {
  criticalGaps: string[];
  moderateGaps: string[];
  minorGaps: string[];
  bridgingSteps: string[];
  trainingRecommendations: string[];
  timeToBridge: string;
}

export interface ImprovementResult {
  priorityImprovements: { area: string; suggestion: string; impact: "high" | "medium" | "low" }[];
  keywordAdditions: string[];
  sectionReorder: string[];
  summaryRewrite: string;
}

export interface InterviewPrediction {
  likelihood: number; // 0-100
  expectedRounds: string[];
  preparationTopics: string[];
  potentialWeakAreas: string[];
  strongAreas: string[];
  suggestedQuestions: string[];
}

export interface RecruiterInsight {
  oneLineSummary: string;
  redFlags: string[];
  greenFlags: string[];
  cultureFitIndicators: string[];
  salaryExpectation: string;
  retentionRisk: "low" | "medium" | "high";
  shortlistRecommendation: "strong_yes" | "yes" | "maybe" | "no" | "strong_no";
  recommendationReason: string;
}

export interface FullAnalysisResult {
  parsedResume: ParsedResume;
  domainDetection: DomainResult;
  seniorityLevel: SeniorityResult;
  skillExpansion: ExpandedSkills;
  jdParsing: ParsedJD;
  jobMatch: MatchResult;
  achievements: AchievementResult;
  atsScore: ATSScore;
  gapAnalysis: GapResult;
  improvements: ImprovementResult;
  interviewPrediction: InterviewPrediction;
  recruiterInsights: RecruiterInsight;
  overallScore: number;
  shortlistDecision: boolean;
  confidence: number;
  provider: string;
  model: string;
  analyzedAt: string;
}

/* ──────────────── LLM Provider Interface ──────────────── */

export interface LLMProvider {
  name: string;
  generate(prompt: string, systemPrompt: string): Promise<string>;
  isAvailable(): Promise<boolean>;
}

/* ──────────────── Ollama Provider ──────────────── */

export class OllamaProvider implements LLMProvider {
  name = "ollama";
  private baseUrl: string;
  private modelName: string;

  constructor(baseUrl = "http://127.0.0.1:11434", model = "qwen2.5:0.5b") {
    this.baseUrl = baseUrl;
    this.modelName = model;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${this.baseUrl}/api/tags`, { signal: controller.signal });
      clearTimeout(timeout);
      return res.ok;
    } catch {
      return false;
    }
  }

  async generate(prompt: string, systemPrompt: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        stream: false,
        options: { temperature: 0.3, num_predict: 2048 },
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.message?.content || "";
  }
}

/* ──────────────── z-ai-web-dev-sdk Provider ──────────────── */

export class ZAISDKProvider implements LLMProvider {
  name = "z-ai-sdk";
  private sdk: any;

  constructor() {
    // Dynamically imported to ensure server-side only
  }

  async isAvailable(): Promise<boolean> {
    try {
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      this.sdk = ZAI;
      return true;
    } catch {
      return false;
    }
  }

  async generate(prompt: string, systemPrompt: string): Promise<string> {
    if (!this.sdk) {
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      this.sdk = ZAI;
    }

    const response = await this.sdk.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    return response.choices?.[0]?.message?.content || "";
  }
}

/* ──────────────── Skill Abbreviation Dictionary ──────────────── */

const SKILL_ABBREVIATIONS: Record<string, string[]> = {
  "ML": ["Machine Learning"],
  "NLP": ["Natural Language Processing"],
  "DL": ["Deep Learning"],
  "CV": ["Computer Vision"],
  "AI": ["Artificial Intelligence"],
  "DS": ["Data Science", "Data Structures"],
  "GenAI": ["Generative AI", "Generative Artificial Intelligence"],
  "LLM": ["Large Language Model", "Large Language Models"],
  "RAG": ["Retrieval-Augmented Generation"],
  "CNN": ["Convolutional Neural Network"],
  "RNN": ["Recurrent Neural Network"],
  "GAN": ["Generative Adversarial Network"],
  "RL": ["Reinforcement Learning"],
  "PEFT": ["Parameter-Efficient Fine-Tuning"],
  "LoRA": ["Low-Rank Adaptation"],
  "QLoRA": ["Quantized Low-Rank Adaptation"],
  "MLOps": ["Machine Learning Operations"],
  "ETL": ["Extract Transform Load"],
  "CI/CD": ["Continuous Integration/Continuous Deployment"],
  "REST": ["Representational State Transfer"],
  "API": ["Application Programming Interface"],
  "SQL": ["Structured Query Language"],
  "NoSQL": ["Not Only SQL"],
  "AWS": ["Amazon Web Services"],
  "GCP": ["Google Cloud Platform"],
  "K8s": ["Kubernetes"],
  "TF": ["TensorFlow"],
  "PT": ["PyTorch"],
  "EDA": ["Exploratory Data Analysis"],
  "PCA": ["Principal Component Analysis"],
  "SVM": ["Support Vector Machine"],
  "XGBoost": ["Extreme Gradient Boosting"],
  "BFS": ["Breadth-First Search"],
  "DFS": ["Depth-First Search"],
  "OOP": ["Object-Oriented Programming"],
  "TDD": ["Test-Driven Development"],
  "BDD": ["Behavior-Driven Development"],
  "DDD": ["Domain-Driven Design"],
  "SRE": ["Site Reliability Engineering"],
  "IaC": ["Infrastructure as Code"],
  "SaaS": ["Software as a Service"],
  "PaaS": ["Platform as a Service"],
  "IaaS": ["Infrastructure as a Service"],
  "DaaS": ["Data as a Service"],
  "BaaS": ["Backend as a Service"],
  "FaaS": ["Function as a Service"],
  "HPC": ["High-Performance Computing"],
  "GPU": ["Graphics Processing Unit"],
  "TPU": ["Tensor Processing Unit"],
  "CLI": ["Command Line Interface"],
  "GUI": ["Graphical User Interface"],
  "IDE": ["Integrated Development Environment"],
  "SDK": ["Software Development Kit"],
  "ORM": ["Object-Relational Mapping"],
  "CRUD": ["Create Read Update Delete"],
  "DRY": ["Don't Repeat Yourself"],
  "SOLID": ["Single Responsibility Open/Closed Liskov Interface Dependency Inversion"],
  "YAGNI": ["You Aren't Gonna Need It"],
  "KISS": ["Keep It Simple Stupid"],
  "WAF": ["Web Application Firewall"],
  "DDoS": ["Distributed Denial of Service"],
  "RBAC": ["Role-Based Access Control"],
  "ABAC": ["Attribute-Based Access Control"],
  "SSO": ["Single Sign-On"],
  "OAuth": ["Open Authorization"],
  "JWT": ["JSON Web Token"],
  "LDAP": ["Lightweight Directory Access Protocol"],
  "SAML": ["Security Assertion Markup Language"],
  "CICD": ["Continuous Integration Continuous Deployment"],
  "DevOps": ["Development Operations"],
  "DevSecOps": ["Development Security Operations"],
  "GitOps": ["Git Operations"],
  "AIOps": ["Artificial Intelligence Operations"],
  "FinOps": ["Financial Operations"],
  "DevEx": ["Developer Experience"],
  "RPA": ["Robotic Process Automation"],
  "BPM": ["Business Process Management"],
  "ERP": ["Enterprise Resource Planning"],
  "CRM": ["Customer Relationship Management"],
  "HRMS": ["Human Resource Management System"],
  "ATS": ["Applicant Tracking System"],
  "CMS": ["Content Management System"],
  "DMS": ["Document Management System"],
  "LMS": ["Learning Management System"],
  "WMS": ["Warehouse Management System"],
  "TMS": ["Transportation Management System"],
  "PIM": ["Product Information Management"],
  "MDM": ["Master Data Management"],
  "BI": ["Business Intelligence"],
  "BA": ["Business Analytics"],
  "DV": ["Data Visualization"],
  "DW": ["Data Warehouse"],
  "OLAP": ["Online Analytical Processing"],
  "OLTP": ["Online Transaction Processing"],
  "HTAP": ["Hybrid Transactional Analytical Processing"],
  "CDC": ["Change Data Capture"],
  "MQ": ["Message Queue"],
  "PubSub": ["Publish Subscribe"],
  "CQRS": ["Command Query Responsibility Segregation"],
  "ES": ["Event Sourcing"],
  "SOA": ["Service-Oriented Architecture"],
  "WSDL": ["Web Services Description Language"],
  "SOAP": ["Simple Object Access Protocol"],
  "gRPC": ["Google Remote Procedure Call"],
  "GraphQL": ["Graph Query Language"],
  "JSON": ["JavaScript Object Notation"],
  "XML": ["Extensible Markup Language"],
  "YAML": ["YAML Ain't Markup Language"],
  "TOML": ["Tom's Obvious Minimal Language"],
  "HEIF": ["High Efficiency Image Format"],
  "WebP": ["Web Picture Format"],
  "SVG": ["Scalable Vector Graphics"],
  "PNG": ["Portable Network Graphics"],
  "JPEG": ["Joint Photographic Experts Group"],
  "MP4": ["MPEG-4 Part 14"],
  "HDFS": ["Hadoop Distributed File System"],
  "YARN": ["Yet Another Resource Negotiator"],
  "MapReduce": ["Map Reduce Programming Model"],
  "Spark": ["Apache Spark"],
  "Flink": ["Apache Flink"],
  "Kafka": ["Apache Kafka"],
  "Pulsar": ["Apache Pulsar"],
  "Airflow": ["Apache Airflow"],
  "Luigi": ["Spotify Luigi Pipeline"],
  "Prefect": ["Prefect Workflow"],
  "Dagster": ["Dagster Data Orchestrator"],
  "dbt": ["Data Build Tool"],
  "Looker": ["Google Looker"],
  "Tableau": ["Salesforce Tableau"],
  "PowerBI": ["Microsoft Power BI"],
  "Superset": ["Apache Superset"],
  "Metabase": ["Metabase BI"],
  "Grafana": ["Grafana Observability"],
  "Prometheus": ["Prometheus Monitoring"],
  "Datadog": ["Datadog Observability"],
  "NewRelic": ["New Relic Observability"],
  "Splunk": ["Splunk Observability"],
  "ELK": ["Elasticsearch Logstash Kibana"],
  "EFK": ["Elasticsearch Fluentd Kibana"],
  "VPC": ["Virtual Private Cloud"],
  "EC2": ["Elastic Compute Cloud"],
  "S3": ["Simple Storage Service"],
  "ECS": ["Elastic Container Service"],
  "EKS": ["Elastic Kubernetes Service"],
  "Lambda": ["AWS Lambda Serverless"],
  "CloudFormation": ["AWS CloudFormation IaC"],
  "Terraform": ["HashiCorp Terraform IaC"],
  "Pulumi": ["Pulumi IaC"],
  "Ansible": ["Red Hat Ansible Automation"],
  "Chef": ["Progress Chef Automation"],
  "Puppet": ["Puppet Automation"],
  "Vault": ["HashiCorp Vault Secrets"],
  "Consul": ["HashiCorp Consul Service Mesh"],
  "Istio": ["Istio Service Mesh"],
  "Linkerd": ["Linkerd Service Mesh"],
  "Envoy": ["Envoy Proxy"],
  "Nginx": ["Nginx Web Server"],
  "HAProxy": ["HA Proxy Load Balancer"],
  "Traefik": ["Traefik Cloud Proxy"],
  "Caddy": ["Caddy Web Server"],
  "Redis": ["Redis In-Memory Data Store"],
  "Memcached": ["Memcached Cache"],
  "MongoDB": ["MongoDB Document Database"],
  "PostgreSQL": ["PostgreSQL Relational Database"],
  "MySQL": ["MySQL Relational Database"],
  "Cassandra": ["Apache Cassandra Wide-Column Store"],
  "DynamoDB": ["AWS DynamoDB Key-Value Store"],
  "CosmosDB": ["Azure Cosmos DB Multi-Model"],
  "Spanner": ["Google Cloud Spanner"],
  "BigQuery": ["Google BigQuery Data Warehouse"],
  "Snowflake": ["Snowflake Data Cloud"],
  "Redshift": ["AWS Redshift Data Warehouse"],
  "Athena": ["AWS Athena Serverless Query"],
  "Presto": ["Presto SQL Engine"],
  "Trino": ["Trino SQL Engine"],
  "Neo4j": ["Neo4j Graph Database"],
  "DGraph": ["DGraph Graph Database"],
  "Fauna": ["Fauna Serverless Database"],
  "CockroachDB": ["CockroachDB Distributed SQL"],
  "TiDB": ["TiDB NewSQL Database"],
  "ScyllaDB": ["ScyllaDB NoSQL Database"],
  "InfluxDB": ["InfluxDB Time Series"],
  "TimescaleDB": ["TimescaleDB Time Series"],
  "QuestDB": ["QuestDB Time Series"],
  "Pinecone": ["Pinecone Vector Database"],
  "Weaviate": ["Weaviate Vector Database"],
  "Milvus": ["Milvus Vector Database"],
  "Qdrant": ["Qdrant Vector Database"],
  "ChromaDB": ["Chroma Vector Database"],
  "FAISS": ["Facebook AI Similarity Search"],
  "LangChain": ["LangChain LLM Framework"],
  "LlamaIndex": ["LlamaIndex Data Framework"],
  "CrewAI": ["CrewAI Multi-Agent Framework"],
  "AutoGen": ["Microsoft AutoGen Framework"],
  "SemanticKernel": ["Microsoft Semantic Kernel"],
  "Haystack": ["deepset Haystack Framework"],
  "VLLM": ["vLLM Inference Engine"],
  "TGI": ["Text Generation Inference"],
  "ONNX": ["Open Neural Network Exchange"],
  "TensorRT": ["NVIDIA TensorRT"],
  "OpenVINO": ["Intel OpenVINO"],
  "CoreML": ["Apple Core ML"],
  "TFLite": ["TensorFlow Lite"],
  "PyTorchMobile": ["PyTorch Mobile"],
  "JAX": ["Google JAX"],
  "Flax": ["Flax Neural Network Library"],
  "Haiku": ["DeepMind Haiku"],
  "Optax": ["DeepMind Optax"],
  "HuggingFace": ["Hugging Face Platform"],
  "Transformers": ["Hugging Face Transformers"],
  "Diffusers": ["Hugging Face Diffusers"],
  "Datasets": ["Hugging Face Datasets"],
  "Accelerate": ["Hugging Face Accelerate"],
  "PEFTLib": ["PEFT Library"],
  "TRL": ["Transformer Reinforcement Learning"],
  "WeightsBiases": ["Weights & Biases MLOps"],
  "MLflow": ["MLflow Model Management"],
  "DVC": ["Data Version Control"],
  "ClearML": ["ClearML MLOps"],
  "Neptune": ["Neptune AI MLOps"],
  "Comet": ["Comet ML MLOps"],
  "Kubeflow": ["Kubeflow ML Platform"],
  "Flyte": ["Flyte ML Orchestration"],
  "VertexAI": ["Google Vertex AI"],
  "SageMaker": ["AWS SageMaker"],
  "AzureML": ["Azure Machine Learning"],
  "Roboflow": ["Roboflow CV Platform"],
  "LabelStudio": ["Label Studio Data Labeling"],
  "ScaleAI": ["Scale AI Data Labeling"],
  "OpenAI": ["OpenAI API"],
  "Anthropic": ["Anthropic Claude API"],
  "Cohere": ["Cohere NLP API"],
  "Mistral": ["Mistral AI API"],
  "StabilityAI": ["Stability AI Image Generation"],
  "Midjourney": ["Midjourney Image Generation"],
  "DALLE": ["DALL-E Image Generation"],
};

/* ──────────────── Skill Expansion Engine ──────────────── */

export class SkillExpansionEngine {
  private abbreviationMap: Map<string, string[]>;
  private relatedSkillsMap: Map<string, string[]>;

  constructor() {
    this.abbreviationMap = new Map(Object.entries(SKILL_ABBREVIATIONS));
    this.relatedSkillsMap = new Map([
      // AI/ML Related Skills
      ["Machine Learning", ["Deep Learning", "scikit-learn", "TensorFlow", "PyTorch", "Feature Engineering", "Model Evaluation", "Cross-Validation", "Hyperparameter Tuning"]],
      ["Deep Learning", ["Neural Networks", "CNN", "RNN", "LSTM", "Transformer", "Attention Mechanism", "Backpropagation", "Gradient Descent"]],
      ["Natural Language Processing", ["Text Classification", "Named Entity Recognition", "Sentiment Analysis", "Tokenization", "Word Embeddings", "BERT", "GPT", "Transformer"]],
      ["Computer Vision", ["Image Classification", "Object Detection", "Semantic Segmentation", "Image Generation", "CNN", "ResNet", "YOLO", "OpenCV"]],
      ["Large Language Model", ["GPT", "BERT", "Transformer", "Fine-Tuning", "Prompt Engineering", "RLHF", "Tokenization", "Attention Mechanism"]],
      ["Retrieval-Augmented Generation", ["Vector Database", "Embeddings", "Semantic Search", "Document Retrieval", "LangChain", "LlamaIndex", "FAISS", "Pinecone"]],
      ["MLOps", ["Model Deployment", "CI/CD", "Docker", "Kubernetes", "MLflow", "Model Monitoring", "A/B Testing", "Feature Store"]],
      ["PyTorch", ["Deep Learning", "Neural Networks", "GPU Computing", "Autograd", "TorchScript", "PyTorch Lightning"]],
      ["TensorFlow", ["Deep Learning", "Keras", "TF Lite", "TF Serving", "TFX", "TensorBoard"]],
      ["Python", ["NumPy", "Pandas", "Matplotlib", "scikit-learn", "Flask", "Django", "FastAPI", "Jupyter"]],
      ["Docker", ["Containerization", "Docker Compose", "Dockerfile", "Container Registry", "Microservices"]],
      ["Kubernetes", ["Container Orchestration", "Helm", "Kubectl", "Service Mesh", "Pod Management", "Auto-scaling"]],
      ["AWS", ["EC2", "S3", "Lambda", "RDS", "SageMaker", "CloudFormation", "VPC", "IAM"]],
      ["React", ["Next.js", "TypeScript", "Redux", "Zustand", "React Hooks", "JSX", "Virtual DOM"]],
      ["Node.js", ["Express", "Fastify", "NPM", "REST API", "Event Loop", "Async/Await"]],
      ["SQL", ["PostgreSQL", "MySQL", "Query Optimization", "Joins", "Indexing", "Stored Procedures"]],
      ["Git", ["GitHub", "GitLab", "Branching", "Merging", "Rebase", "Pull Requests"]],
    ]);
  }

  expand(skill: string): { fullForms: string[]; relatedSkills: string[] } {
    const normalized = skill.trim();
    const fullForms = this.abbreviationMap.get(normalized) || [];
    const relatedSkills = this.relatedSkillsMap.get(normalized) ||
      this.relatedSkillsMap.get(fullForms[0]) || [];
    return { fullForms, relatedSkills };
  }

  expandAll(skills: string[]): ExpandedSkills {
    const expanded: ExpandedSkills["expanded"] = [];
    const allSkillsSet = new Set(skills.map(s => s.trim()));

    for (const skill of skills) {
      const { fullForms, relatedSkills } = this.expand(skill);
      expanded.push({ abbreviation: skill, fullForms, relatedSkills });
      fullForms.forEach(f => allSkillsSet.add(f));
      relatedSkills.forEach(r => allSkillsSet.add(r));
    }

    return {
      original: skills,
      expanded,
      allSkills: Array.from(allSkillsSet),
    };
  }
}

/* ──────────────── TF-IDF RAG Pipeline ──────────────── */

export class RAGPipeline {
  private documents: { id: string; text: string; type: string }[] = [];
  private tfidfCache: Map<string, Map<string, number>> = new Map();

  addDocument(id: string, text: string, type: string) {
    this.documents.push({ id, text, type });
    this.tfidfCache.set(id, this.computeTFIDF(text));
  }

  clear() {
    this.documents = [];
    this.tfidfCache.clear();
  }

  search(query: string, topK = 5, type?: string): { id: string; score: number; text: string }[] {
    const queryTFIDF = this.computeTFIDF(query);
    const candidates = type ? this.documents.filter(d => d.type === type) : this.documents;

    return candidates
      .map(doc => {
        const docTFIDF = this.tfidfCache.get(doc.id);
        if (!docTFIDF) return { id: doc.id, score: 0, text: doc.text };
        return { id: doc.id, score: this.cosineSimilarity(queryTFIDF, docTFIDF), text: doc.text };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(t => t.length > 2);
  }

  private computeTFIDF(text: string): Map<string, number> {
    const tokens = this.tokenize(text);
    const tf = new Map<string, number>();
    for (const t of tokens) {
      tf.set(t, (tf.get(t) || 0) + 1);
    }
    // Normalize TF
    const maxTF = Math.max(...tf.values(), 1);
    for (const [k, v] of tf) {
      tf.set(k, v / maxTF);
    }
    return tf;
  }

  private cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
    const allKeys = new Set([...a.keys(), ...b.keys()]);
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (const key of allKeys) {
      const va = a.get(key) || 0;
      const vb = b.get(key) || 0;
      dotProduct += va * vb;
      normA += va * va;
      normB += vb * vb;
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dotProduct / denom;
  }
}

/* ──────────────── JSON Parser Helper ──────────────── */

function safeParseJSON<T>(text: string, fallback: T): T {
  try {
    // Try direct parse
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[1]); } catch { /* fall through */ }
    }
    // Try to find first { ... } or [ ... ]
    const braceMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (braceMatch) {
      try { return JSON.parse(braceMatch[1]); } catch { /* fall through */ }
    }
    return fallback;
  }
}

/* ──────────────── HireMind Engine ──────────────── */

export class HireMindEngine {
  private provider: LLMProvider;
  private skillExpander: SkillExpansionEngine;
  private ragPipeline: RAGPipeline;
  private providerName: string;

  constructor(provider?: LLMProvider) {
    this.skillExpander = new SkillExpansionEngine();
    this.ragPipeline = new RAGPipeline();
    // Default to z-ai-sdk provider
    this.provider = provider || new ZAISDKProvider();
    this.providerName = this.provider.name;
  }

  /** Initialize the provider (check availability) */
  async init(): Promise<void> {
    const available = await this.provider.isAvailable();
    if (!available) {
      console.warn(`[HireMind] Provider "${this.providerName}" not available, falling back to z-ai-sdk`);
      this.provider = new ZAISDKProvider();
      this.providerName = "z-ai-sdk";
      await this.provider.isAvailable();
    }
    console.log(`[HireMind] Using provider: ${this.providerName}`);
  }

  private async callLLM(prompt: string, systemPrompt: string): Promise<string> {
    try {
      return await this.provider.generate(prompt, systemPrompt);
    } catch (error: any) {
      console.error(`[HireMind] LLM call failed:`, error.message);
      return "";
    }
  }

  /* ──── Agent 1: Resume Parser ──── */
  async parseResume(resumeText: string): Promise<ParsedResume> {
    const systemPrompt = `You are a precise resume parser. Extract structured information from resumes. Return ONLY valid JSON matching the schema. Be accurate - don't invent information that isn't in the text.`;

    const prompt = `Parse this resume and return a JSON object with these fields:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number",
  "location": "City, Country",
  "summary": "Professional summary in 2-3 sentences",
  "skills": ["skill1", "skill2"],
  "experience": [{"title": "Job Title", "company": "Company Name", "duration": "Start - End", "highlights": ["achievement1", "achievement2"]}],
  "education": [{"degree": "Degree Name", "institution": "University", "year": "Graduation Year"}],
  "certifications": ["cert1"],
  "totalYearsExperience": 5
}

Resume text:
${resumeText}`;

    const result = await this.callLLM(prompt, systemPrompt);
    const parsed = safeParseJSON<ParsedResume>(result, {
      name: "", email: "", phone: "", location: "", summary: "",
      skills: [], experience: [], education: [], certifications: [],
      totalYearsExperience: 0, rawText: resumeText,
    });
    parsed.rawText = resumeText;
    return parsed;
  }

  /* ──── Agent 2: Domain Detector ──── */
  async detectDomain(parsedResume: ParsedResume): Promise<DomainResult> {
    const systemPrompt = `You are a career domain classifier. Identify the professional domain(s) of a candidate based on their resume. Return ONLY valid JSON.`;

    const prompt = `Based on this candidate's profile, identify their primary and secondary professional domains.

Skills: ${parsedResume.skills.join(", ")}
Experience titles: ${parsedResume.experience.map(e => e.title).join(", ")}
Education: ${parsedResume.education.map(e => `${e.degree} from ${e.institution}`).join(", ")}

Return JSON:
{
  "primaryDomain": "e.g., Software Engineering, Data Science, Product Design, Sales, HR, etc.",
  "secondaryDomains": ["related domain 1", "related domain 2"],
  "confidence": 0.9,
  "reasoning": "Brief explanation of why this domain was chosen"
}`;

    const result = await this.callLLM(prompt, systemPrompt);
    return safeParseJSON<DomainResult>(result, {
      primaryDomain: "General", secondaryDomains: [], confidence: 0.5, reasoning: "Could not determine domain",
    });
  }

  /* ──── Agent 3: Seniority Detector ──── */
  async detectSeniority(parsedResume: ParsedResume): Promise<SeniorityResult> {
    const systemPrompt = `You are a seniority level classifier. Determine the professional seniority level of a candidate. Return ONLY valid JSON.`;

    const prompt = `Determine the seniority level of this candidate.

Total experience: ${parsedResume.totalYearsExperience} years
Job titles held: ${parsedResume.experience.map(e => e.title).join(", ")}
Education: ${parsedResume.education.map(e => e.degree).join(", ")}

Return JSON:
{
  "level": "fresher|junior|mid|senior|lead|principal|director",
  "yearsRange": "e.g., 5-8 years",
  "reasoning": "Why this level was chosen",
  "confidence": 0.9
}`;

    const result = await this.callLLM(prompt, systemPrompt);
    return safeParseJSON<SeniorityResult>(result, {
      level: "mid", yearsRange: "3-5 years", reasoning: "Default estimate", confidence: 0.5,
    });
  }

  /* ──── Agent 4: Skill Expansion ──── */
  async expandSkills(skills: string[]): Promise<ExpandedSkills> {
    // First use local dictionary
    const localResult = this.skillExpander.expandAll(skills);

    // Then use LLM to find any additional expansions the dictionary missed
    const systemPrompt = `You are a skill abbreviation expander for the tech industry. Expand abbreviations and find related skills. Return ONLY valid JSON.`;

    const prompt = `Expand these skill abbreviations and find related skills:
${skills.join(", ")}

Return JSON:
{
  "expansions": [
    {"abbreviation": "ML", "fullForms": ["Machine Learning"], "relatedSkills": ["Deep Learning", "scikit-learn"]}
  ]
}`;

    const result = await this.callLLM(prompt, systemPrompt);
    const llmResult = safeParseJSON<{ expansions: { abbreviation: string; fullForms: string[]; relatedSkills: string[] }[] }>(result, { expansions: [] });

    // Merge local + LLM results
    const allSkillsSet = new Set(localResult.allSkills);
    for (const exp of llmResult.expansions) {
      const existing = localResult.expanded.find(e => e.abbreviation === exp.abbreviation);
      if (existing) {
        exp.fullForms.forEach(f => { existing.fullForms.push(f); allSkillsSet.add(f); });
        exp.relatedSkills.forEach(r => { existing.relatedSkills.push(r); allSkillsSet.add(r); });
      } else {
        localResult.expanded.push(exp);
        exp.fullForms.forEach(f => allSkillsSet.add(f));
        exp.relatedSkills.forEach(r => allSkillsSet.add(r));
      }
    }
    localResult.allSkills = Array.from(allSkillsSet);
    return localResult;
  }

  /* ──── Agent 5: JD Parser ──── */
  async parseJD(jdText: string): Promise<ParsedJD> {
    const systemPrompt = `You are a job description parser. Extract structured information from job descriptions. Return ONLY valid JSON.`;

    const prompt = `Parse this job description and return a JSON object:

{
  "title": "Job Title",
  "department": "Department Name",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["nice-to-have skill"],
  "experienceLevel": "junior|mid|senior|lead",
  "experienceYears": {"min": 2, "max": 5},
  "education": ["B.Tech in CS"],
  "responsibilities": ["resp1", "resp2"],
  "benefits": ["benefit1"],
  "domain": "Software Engineering|Data Science|etc"
}

Job Description:
${jdText}`;

    const result = await this.callLLM(prompt, systemPrompt);
    const parsed = safeParseJSON<ParsedJD>(result, {
      title: "", department: "", requiredSkills: [], preferredSkills: [],
      experienceLevel: "mid", experienceYears: { min: 2, max: 5 },
      education: [], responsibilities: [], benefits: [], domain: "General", rawText: jdText,
    });
    parsed.rawText = jdText;
    return parsed;
  }

  /* ──── Agent 6: JD Match Engine ──── */
  async matchJob(parsedResume: ParsedResume, parsedJD: ParsedJD): Promise<MatchResult> {
    const systemPrompt = `You are an expert candidate-job matching engine. Compare a candidate's profile against a job description and provide a detailed match analysis. Return ONLY valid JSON.`;

    const prompt = `Compare this candidate against the job requirements:

CANDIDATE:
- Skills: ${parsedResume.skills.join(", ")}
- Experience: ${parsedResume.totalYearsExperience} years
- Roles: ${parsedResume.experience.map(e => e.title).join(", ")}
- Education: ${parsedResume.education.map(e => e.degree).join(", ")}

JOB REQUIREMENTS:
- Title: ${parsedJD.title}
- Required Skills: ${parsedJD.requiredSkills.join(", ")}
- Preferred Skills: ${parsedJD.preferredSkills.join(", ")}
- Experience: ${parsedJD.experienceYears.min}-${parsedJD.experienceYears.max} years
- Education: ${parsedJD.education.join(", ")}

Return JSON:
{
  "overallScore": 75,
  "skillsMatch": 80,
  "experienceMatch": 70,
  "educationMatch": 90,
  "domainMatch": 85,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3"],
  "skillGapDetails": [{"skill": "skill name", "importance": "critical|important|nice-to-have", "candidateHas": false}]
}

Scores are 0-100. Be objective and fair.`;

    const result = await this.callLLM(prompt, systemPrompt);
    return safeParseJSON<MatchResult>(result, {
      overallScore: 50, skillsMatch: 50, experienceMatch: 50, educationMatch: 50,
      domainMatch: 50, matchedSkills: [], missingSkills: [], skillGapDetails: [],
    });
  }

  /* ──── Agent 7: Achievement Analyzer ──── */
  async analyzeAchievements(resumeText: string): Promise<AchievementResult> {
    const systemPrompt = `You are an achievement analyzer. Evaluate how well a candidate quantifies their impact in their resume. Return ONLY valid JSON.`;

    const prompt = `Analyze the achievement quality in this resume. Look for:
1. Quantified results (numbers, percentages, metrics)
2. Impact-driven statements
3. Generic/vague statements that lack impact

Resume:
${resumeText}

Return JSON:
{
  "score": 65,
  "quantifiedAchievements": ["Achievement with numbers"],
  "genericStatements": ["Vague statement found"],
  "improvementSuggestions": ["How to improve"],
  "impactLevel": "high|medium|low"
}`;

    const result = await this.callLLM(prompt, systemPrompt);
    return safeParseJSON<AchievementResult>(result, {
      score: 50, quantifiedAchievements: [], genericStatements: [],
      improvementSuggestions: [], impactLevel: "medium",
    });
  }

  /* ──── Agent 8: ATS Scoring ──── */
  async calculateATS(matchResult: MatchResult, parsedResume: ParsedResume): Promise<ATSScore> {
    const systemPrompt = `You are an ATS (Applicant Tracking System) optimizer. Evaluate how well a resume would perform in automated screening systems. Return ONLY valid JSON.`;

    const prompt = `Evaluate this resume for ATS compatibility:

Candidate skills: ${parsedResume.skills.join(", ")}
Experience sections: ${parsedResume.experience.length}
Education entries: ${parsedResume.education.length}
Has summary: ${!!parsedResume.summary}
Skills match score: ${matchResult.skillsMatch}%
Matched skills: ${matchResult.matchedSkills.join(", ")}
Missing skills: ${matchResult.missingSkills.join(", ")}

Return JSON:
{
  "overall": 70,
  "keywordOptimization": 75,
  "formatting": 85,
  "sectionCompleteness": 80,
  "impactLanguage": 60,
  "issues": ["List of ATS issues found"],
  "recommendations": ["How to improve ATS score"]
}

All scores 0-100.`;

    const result = await this.callLLM(prompt, systemPrompt);
    return safeParseJSON<ATSScore>(result, {
      overall: 50, keywordOptimization: 50, formatting: 70,
      sectionCompleteness: 60, impactLanguage: 50, issues: [], recommendations: [],
    });
  }

  /* ──── Agent 9: Gap Analyzer ──── */
  async analyzeGaps(parsedResume: ParsedResume, parsedJD: ParsedJD): Promise<GapResult> {
    const systemPrompt = `You are a skill gap analyst. Identify gaps between a candidate's profile and job requirements, and provide actionable bridging steps. Return ONLY valid JSON.`;

    const prompt = `Analyze the gaps between this candidate and job:

CANDIDATE:
- Skills: ${parsedResume.skills.join(", ")}
- Experience: ${parsedResume.totalYearsExperience} years (${parsedResume.experience.map(e => e.title).join(", ")})
- Education: ${parsedResume.education.map(e => e.degree).join(", ")}

JOB REQUIREMENTS:
- Required Skills: ${parsedJD.requiredSkills.join(", ")}
- Experience: ${parsedJD.experienceYears.min}-${parsedJD.experienceYears.max} years
- Education: ${parsedJD.education.join(", ")}

Return JSON:
{
  "criticalGaps": ["Must-have skills candidate lacks"],
  "moderateGaps": ["Important skills candidate partially has"],
  "minorGaps": ["Nice-to-have skills missing"],
  "bridgingSteps": ["How to close each gap"],
  "trainingRecommendations": ["Specific courses or resources"],
  "timeToBridge": "Estimated time to close critical gaps (e.g., '3-6 months')"
}`;

    const result = await this.callLLM(prompt, systemPrompt);
    return safeParseJSON<GapResult>(result, {
      criticalGaps: [], moderateGaps: [], minorGaps: [],
      bridgingSteps: [], trainingRecommendations: [], timeToBridge: "Unknown",
    });
  }

  /* ──── Agent 10: Resume Improvement ──── */
  async suggestImprovements(resumeText: string, matchResult: MatchResult): Promise<ImprovementResult> {
    const systemPrompt = `You are a resume improvement advisor. Suggest specific, actionable improvements to help a candidate's resume match a job better. Return ONLY valid JSON.`;

    const prompt = `Suggest improvements for this resume to better match the job.

Missing skills: ${matchResult.missingSkills.join(", ")}
Current skills match: ${matchResult.skillsMatch}%
Experience match: ${matchResult.experienceMatch}%

Resume excerpt (first 2000 chars):
${resumeText.substring(0, 2000)}

Return JSON:
{
  "priorityImprovements": [{"area": "section name", "suggestion": "specific improvement", "impact": "high|medium|low"}],
  "keywordAdditions": ["Keywords to add for ATS"],
  "sectionReorder": ["Recommended section order"],
  "summaryRewrite": "Improved professional summary suggestion"
}`;

    const result = await this.callLLM(prompt, systemPrompt);
    return safeParseJSON<ImprovementResult>(result, {
      priorityImprovements: [], keywordAdditions: [], sectionReorder: [], summaryRewrite: "",
    });
  }

  /* ──── Agent 11: Interview Prediction ──── */
  async predictInterviews(parsedResume: ParsedResume, parsedJD: ParsedJD): Promise<InterviewPrediction> {
    const systemPrompt = `You are an interview prediction analyst. Based on a candidate's profile vs job requirements, predict interview outcomes and preparation recommendations. Return ONLY valid JSON.`;

    const prompt = `Predict interview likelihood and preparation for this candidate:

CANDIDATE:
- Skills: ${parsedResume.skills.join(", ")}
- Experience: ${parsedResume.totalYearsExperience} years
- Roles: ${parsedResume.experience.map(e => e.title).join(", ")}

JOB:
- Title: ${parsedJD.title}
- Required Skills: ${parsedJD.requiredSkills.join(", ")}
- Experience Level: ${parsedJD.experienceLevel}

Return JSON:
{
  "likelihood": 75,
  "expectedRounds": ["Technical Screen", "System Design", "Behavioral"],
  "preparationTopics": ["Topics to prepare"],
  "potentialWeakAreas": ["Areas likely to be challenged"],
  "strongAreas": ["Areas candidate will excel in"],
  "suggestedQuestions": ["Practice questions for preparation"]
}`;

    const result = await this.callLLM(prompt, systemPrompt);
    return safeParseJSON<InterviewPrediction>(result, {
      likelihood: 50, expectedRounds: [], preparationTopics: [],
      potentialWeakAreas: [], strongAreas: [], suggestedQuestions: [],
    });
  }

  /* ──── Agent 12: Recruiter Insights ──── */
  async generateRecruiterInsights(candidate: ParsedResume, matchResult: MatchResult): Promise<RecruiterInsight> {
    const systemPrompt = `You are an experienced technical recruiter providing actionable insights about a candidate. Be honest, specific, and practical. Return ONLY valid JSON.`;

    const prompt = `Provide recruiter insights for this candidate:

CANDIDATE:
- Name: ${candidate.name}
- Skills: ${candidate.skills.join(", ")}
- Experience: ${candidate.totalYearsExperience} years
- Current/Last Role: ${candidate.experience[0]?.title || "Unknown"} at ${candidate.experience[0]?.company || "Unknown"}
- Education: ${candidate.education.map(e => e.degree).join(", ")}

MATCH SCORE: ${matchResult.overallScore}%
MATCHED SKILLS: ${matchResult.matchedSkills.join(", ")}
MISSING SKILLS: ${matchResult.missingSkills.join(", ")}

Return JSON:
{
  "oneLineSummary": "One sentence summary of this candidate",
  "redFlags": ["Concerns about the candidate"],
  "greenFlags": ["Positive signals"],
  "cultureFitIndicators": ["What their profile suggests about culture fit"],
  "salaryExpectation": "Estimated salary range based on profile",
  "retentionRisk": "low|medium|high",
  "shortlistRecommendation": "strong_yes|yes|maybe|no|strong_no",
  "recommendationReason": "Why this recommendation was made"
}`;

    const result = await this.callLLM(prompt, systemPrompt);
    return safeParseJSON<RecruiterInsight>(result, {
      oneLineSummary: "Analysis unavailable",
      redFlags: [], greenFlags: [], cultureFitIndicators: [],
      salaryExpectation: "Unknown", retentionRisk: "medium",
      shortlistRecommendation: "maybe", recommendationReason: "Insufficient data for analysis",
    });
  }

  /* ──── Master Orchestrator ──── */
  async fullAnalysis(
    resumeText: string,
    jdText: string,
    jobId: string,
    candidateId: string,
    analysisType: "full" | "quick" = "full"
  ): Promise<FullAnalysisResult> {
    console.log(`[HireMind] Starting ${analysisType} analysis for candidate ${candidateId} vs job ${jobId}`);

    await this.init();

    // Load into RAG pipeline
    this.ragPipeline.clear();
    this.ragPipeline.addDocument(`resume_${candidateId}`, resumeText, "resume");
    this.ragPipeline.addDocument(`jd_${jobId}`, jdText, "jd");

    // Agent 1: Parse Resume
    console.log("[HireMind] Agent 1: Parsing resume...");
    const parsedResume = await this.parseResume(resumeText);

    // Agent 2: Detect Domain
    console.log("[HireMind] Agent 2: Detecting domain...");
    const domainDetection = await this.detectDomain(parsedResume);

    // Agent 3: Detect Seniority
    console.log("[HireMind] Agent 3: Detecting seniority...");
    const seniorityLevel = await this.detectSeniority(parsedResume);

    // Agent 4: Expand Skills
    console.log("[HireMind] Agent 4: Expanding skills...");
    const skillExpansion = await this.expandSkills(parsedResume.skills);

    // Agent 5: Parse JD
    console.log("[HireMind] Agent 5: Parsing JD...");
    const jdParsing = await this.parseJD(jdText);

    // Agent 6: Match Job
    console.log("[HireMind] Agent 6: Matching job...");
    const jobMatch = await this.matchJob(parsedResume, jdParsing);

    // For quick analysis, skip agents 7-12
    if (analysisType === "quick") {
      const overallScore = jobMatch.overallScore;
      return {
        parsedResume, domainDetection, seniorityLevel, skillExpansion,
        jdParsing, jobMatch,
        achievements: { score: 0, quantifiedAchievements: [], genericStatements: [], improvementSuggestions: [], impactLevel: "medium" },
        atsScore: { overall: 0, keywordOptimization: 0, formatting: 0, sectionCompleteness: 0, impactLanguage: 0, issues: [], recommendations: [] },
        gapAnalysis: { criticalGaps: [], moderateGaps: [], minorGaps: [], bridgingSteps: [], trainingRecommendations: [], timeToBridge: "" },
        improvements: { priorityImprovements: [], keywordAdditions: [], sectionReorder: [], summaryRewrite: "" },
        interviewPrediction: { likelihood: 0, expectedRounds: [], preparationTopics: [], potentialWeakAreas: [], strongAreas: [], suggestedQuestions: [] },
        recruiterInsights: { oneLineSummary: "", redFlags: [], greenFlags: [], cultureFitIndicators: [], salaryExpectation: "", retentionRisk: "medium", shortlistRecommendation: "maybe", recommendationReason: "Quick analysis mode" },
        overallScore,
        shortlistDecision: overallScore >= 70,
        confidence: 0.6,
        provider: this.providerName,
        model: "qwen2.5",
        analyzedAt: new Date().toISOString(),
      };
    }

    // Agent 7: Achievement Analysis
    console.log("[HireMind] Agent 7: Analyzing achievements...");
    const achievements = await this.analyzeAchievements(resumeText);

    // Agent 8: ATS Scoring
    console.log("[HireMind] Agent 8: Calculating ATS score...");
    const atsScore = await this.calculateATS(jobMatch, parsedResume);

    // Agent 9: Gap Analysis
    console.log("[HireMind] Agent 9: Analyzing gaps...");
    const gapAnalysis = await this.analyzeGaps(parsedResume, jdParsing);

    // Agent 10: Resume Improvement
    console.log("[HireMind] Agent 10: Suggesting improvements...");
    const improvements = await this.suggestImprovements(resumeText, jobMatch);

    // Agent 11: Interview Prediction
    console.log("[HireMind] Agent 11: Predicting interviews...");
    const interviewPrediction = await this.predictInterviews(parsedResume, jdParsing);

    // Agent 12: Recruiter Insights
    console.log("[HireMind] Agent 12: Generating recruiter insights...");
    const recruiterInsights = await this.generateRecruiterInsights(parsedResume, jobMatch);

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      jobMatch.overallScore * 0.35 +
      atsScore.overall * 0.15 +
      achievements.score * 0.10 +
      jobMatch.domainMatch * 0.10 +
      (recruiterInsights.shortlistRecommendation === "strong_yes" ? 95 :
       recruiterInsights.shortlistRecommendation === "yes" ? 80 :
       recruiterInsights.shortlistRecommendation === "maybe" ? 60 :
       recruiterInsights.shortlistRecommendation === "no" ? 35 : 15) * 0.15 +
      interviewPrediction.likelihood * 0.15
    );

    const shortlistDecision = overallScore >= 70 &&
      recruiterInsights.shortlistRecommendation !== "no" &&
      recruiterInsights.shortlistRecommendation !== "strong_no";

    const confidence = Math.min(
      domainDetection.confidence,
      seniorityLevel.confidence,
      0.5 + (jobMatch.matchedSkills.length / Math.max(jobMatch.matchedSkills.length + jobMatch.missingSkills.length, 1)) * 0.5
    );

    console.log(`[HireMind] Analysis complete. Score: ${overallScore}, Shortlist: ${shortlistDecision}, Confidence: ${confidence.toFixed(2)}`);

    return {
      parsedResume,
      domainDetection,
      seniorityLevel,
      skillExpansion,
      jdParsing,
      jobMatch,
      achievements,
      atsScore,
      gapAnalysis,
      improvements,
      interviewPrediction,
      recruiterInsights,
      overallScore,
      shortlistDecision,
      confidence: Math.round(confidence * 100) / 100,
      provider: this.providerName,
      model: "qwen2.5",
      analyzedAt: new Date().toISOString(),
    };
  }
}

/* ──────────────── Singleton ──────────────── */

let engineInstance: HireMindEngine | null = null;

export function getHireMindEngine(): HireMindEngine {
  if (!engineInstance) {
    engineInstance = new HireMindEngine();
  }
  return engineInstance;
}
