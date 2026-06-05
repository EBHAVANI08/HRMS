"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Plus,
  Users,
  Clock,
  CheckCircle2,
  ChevronRight,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  FileText,
  Upload,
  Brain,
  Target,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Zap,
  FileUp,
  BarChart3,
  Loader2,
  X,
  IndianRupee,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Link2,
  QrCode,
  Code2,
  Send,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  TrendingUp,
  Eye,
  Copy,
  Check,
  Files,
  ChevronDown,
  Bell,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { analyzeResume, batchAnalyzeResumes } from "@/lib/recruitment/resume-engine";
import type { MatchResult } from "@/lib/recruitment/resume-engine";

/* ──────────────── AI/ML Skill Suggestions ──────────────── */

const AI_ML_SKILL_SUGGESTIONS = [
  "Python", "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "LLMs",
  "RAG", "Transformers", "PyTorch", "TensorFlow", "scikit-learn", "Pandas", "NumPy",
  "Docker", "Kubernetes", "AWS", "GCP", "MLOps", "SQL", "Git", "FastAPI", "Flask",
  "LangChain", "Hugging Face", "Fine-Tuning", "LoRA", "PEFT", "RAG Pipelines",
  "Reinforcement Learning", "Generative AI", "Prompt Engineering", "Data Engineering",
  "ETL", "Spark", "Airflow", "dbt", "Snowflake", "Feature Engineering",
  "A/B Testing", "Model Deployment", "CI/CD", "Terraform", "Ansible",
  "React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "MongoDB", "Redis",
  "System Design", "Microservices", "REST API", "GraphQL", "Redis",
];

/* ──────────────── Animation Config ──────────────── */

const EASE_SMOOTH = [0.22, 0.8, 0.22, 1] as const;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_SMOOTH } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, ease: EASE_SMOOTH } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: EASE_SMOOTH } },
};

/* ──────────────── Types ──────────────── */

type PipelineStage = "sourced" | "screening" | "interview" | "assessment" | "offer" | "hired" | "rejected";
type JobStatus = "draft" | "open" | "on-hold" | "closed" | "fulfilled";
type CandidateSource = "LinkedIn" | "Naukri" | "Referral" | "Website" | "Campus" | "Agency";

interface ScoreBreakdown {
  skills: number;
  experience: number;
  education: number;
  culture: number;
  overall: number;
}

interface AIAnalysisData {
  analysisId: string;
  overallScore: number;
  shortlistDecision: boolean;
  confidence: number;
  provider: string;
  domainDetection: { primaryDomain: string; secondaryDomains: string[]; confidence: number };
  seniorityLevel: { level: string; yearsRange: string; confidence: number };
  skillExpansion: { original: string[]; expanded: { abbreviation: string; fullForms: string[]; relatedSkills: string[] }[]; allSkills: string[] };
  jobMatch: { overallScore: number; skillsMatch: number; experienceMatch: number; matchedSkills: string[]; missingSkills: string[] };
  atsScore: { overall: number; keywordOptimization: number; issues: string[]; recommendations: string[] };
  gapAnalysis: { criticalGaps: string[]; moderateGaps: string[]; bridgingSteps: string[] };
  recruiterInsights: { oneLineSummary: string; redFlags: string[]; greenFlags: string[]; shortlistRecommendation: string; recommendationReason: string };
  interviewPrediction: { likelihood: number; expectedRounds: string[]; preparationTopics: string[]; potentialWeakAreas: string[] };
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  jobId: string;
  stage: PipelineStage;
  source: CandidateSource;
  matchScore: number;
  scoreBreakdown: ScoreBreakdown;
  daysInStage: number;
  appliedDate: string;
  lastActivity: string;
  location: string;
  experience: string;
  salary: string;
  timeline: TimelineEvent[];
  aiAnalysis?: AIAnalysisData | null;
}

interface TimelineEvent {
  date: string;
  event: string;
  type: "applied" | "screened" | "interview" | "assessment" | "offer" | "hired" | "rejected" | "note" | "email";
}

type ExperienceLevel = "fresher" | "0-1" | "1-3" | "2-5" | "3-5" | "5-10" | "10+" | "mid" | "senior" | "lead" | "executive";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: JobStatus;
  openings: number;
  applicants: number;
  daysOpen: number;
  salary: string;
  postedDate: string;
  urgent: boolean;
  hiringManager: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  experienceLevel?: ExperienceLevel;
  skills?: string[];
  benefits?: string[];
}

interface HighScoreNotification {
  id: string;
  candidateName: string;
  candidateEmail: string;
  score: number;
  jobTitle: string;
  avatar: string;
  timestamp: string;
  read: boolean;
}

/* ──────────────── Pipeline Stage Config ──────────────── */

const STAGE_CONFIG: Record<PipelineStage, { label: string; color: string; bgColor: string; dotColor: string }> = {
  sourced: { label: "Sourced", color: "#8b5cf6", bgColor: "#8b5cf615", dotColor: "#8b5cf6" },
  screening: { label: "Screening", color: "#FF9900", bgColor: "#FF990015", dotColor: "#FF9900" },
  interview: { label: "Interview", color: "#f59e0b", bgColor: "#f59e0b15", dotColor: "#f59e0b" },
  assessment: { label: "Assessment", color: "#0066CC", bgColor: "#0066CC20", dotColor: "#0066CC" },
  offer: { label: "Offer", color: "#22c55e", bgColor: "#22c55e15", dotColor: "#22c55e" },
  hired: { label: "Hired", color: "#3b82f6", bgColor: "#3b82f615", dotColor: "#3b82f6" },
  rejected: { label: "Rejected", color: "#ef4444", bgColor: "#ef444415", dotColor: "#ef4444" },
};

const STAGE_ORDER: PipelineStage[] = ["sourced", "screening", "interview", "assessment", "offer", "hired", "rejected"];

const JOB_STATUS_CONFIG: Record<JobStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: "Draft", color: "#8a8680", bgColor: "#8a868015" },
  open: { label: "Open", color: "#22c55e", bgColor: "#22c55e15" },
  "on-hold": { label: "On Hold", color: "#f59e0b", bgColor: "#f59e0b15" },
  closed: { label: "Closed", color: "#ef4444", bgColor: "#ef444415" },
  fulfilled: { label: "Fulfilled", color: "#3b82f6", bgColor: "#3b82f615" },
};

/* ──────────────── Mock Data ──────────────── */

const MOCK_CANDIDATES: Candidate[] = [
  { id: "c1", name: "Ananya Krishnan", email: "ananya.k@gmail.com", phone: "+91 98765 43210", avatar: "AK", role: "Senior Frontend Developer", jobId: "j1", stage: "interview", source: "LinkedIn", matchScore: 92, scoreBreakdown: { skills: 95, experience: 90, education: 88, culture: 94, overall: 92 }, daysInStage: 3, appliedDate: "2025-02-15", lastActivity: "2 hours ago", location: "Bangalore, IN", experience: "6 years", salary: "₹28 LPA", timeline: [{ date: "Feb 15", event: "Applied via LinkedIn", type: "applied" }, { date: "Feb 16", event: "Resume screened by HR", type: "screened" }, { date: "Feb 18", event: "Technical round scheduled", type: "interview" }, { date: "Feb 20", event: "Interview completed - Strong", type: "interview" }] },
  { id: "c2", name: "Rohan Patel", email: "rohan.p@outlook.com", phone: "+91 87654 32109", avatar: "RP", role: "Senior Frontend Developer", jobId: "j1", stage: "assessment", source: "Naukri", matchScore: 85, scoreBreakdown: { skills: 88, experience: 82, education: 85, culture: 86, overall: 85 }, daysInStage: 1, appliedDate: "2025-02-10", lastActivity: "1 day ago", location: "Mumbai, IN", experience: "5 years", salary: "₹24 LPA", timeline: [{ date: "Feb 10", event: "Applied via Naukri", type: "applied" }, { date: "Feb 11", event: "Resume screened", type: "screened" }, { date: "Feb 14", event: "Phone screening completed", type: "screened" }, { date: "Feb 17", event: "Technical interview passed", type: "interview" }, { date: "Feb 19", event: "Assessment sent", type: "assessment" }] },
  { id: "c3", name: "Meera Sharma", email: "meera.s@gmail.com", phone: "+91 76543 21098", avatar: "MS", role: "Product Designer", jobId: "j2", stage: "offer", source: "Referral", matchScore: 94, scoreBreakdown: { skills: 96, experience: 93, education: 90, culture: 97, overall: 94 }, daysInStage: 2, appliedDate: "2025-01-28", lastActivity: "5 hours ago", location: "Delhi, IN", experience: "7 years", salary: "₹32 LPA", timeline: [{ date: "Jan 28", event: "Referred by Priya Sharma", type: "applied" }, { date: "Jan 29", event: "Portfolio reviewed", type: "screened" }, { date: "Feb 2", event: "Design challenge assigned", type: "assessment" }, { date: "Feb 5", event: "Panel interview cleared", type: "interview" }, { date: "Feb 8", event: "Offer approved", type: "offer" }] },
  { id: "c4", name: "Vikram Desai", email: "vikram.d@gmail.com", phone: "+91 65432 10987", avatar: "VD", role: "Data Engineer", jobId: "j3", stage: "screening", source: "LinkedIn", matchScore: 78, scoreBreakdown: { skills: 80, experience: 75, education: 78, culture: 79, overall: 78 }, daysInStage: 5, appliedDate: "2025-02-18", lastActivity: "5 days ago", location: "Pune, IN", experience: "4 years", salary: "₹20 LPA", timeline: [{ date: "Feb 18", event: "Applied via LinkedIn", type: "applied" }, { date: "Feb 19", event: "Under screening", type: "screened" }] },
  { id: "c5", name: "Sneha Iyer", email: "sneha.i@gmail.com", phone: "+91 54321 09876", avatar: "SI", role: "Sales Manager", jobId: "j4", stage: "hired", source: "Agency", matchScore: 88, scoreBreakdown: { skills: 90, experience: 87, education: 82, culture: 91, overall: 88 }, daysInStage: 1, appliedDate: "2025-01-10", lastActivity: "1 day ago", location: "Chennai, IN", experience: "8 years", salary: "₹35 LPA", timeline: [{ date: "Jan 10", event: "Sourced via ABC Consulting", type: "applied" }, { date: "Jan 12", event: "Screened by hiring manager", type: "screened" }, { date: "Jan 16", event: "First interview completed", type: "interview" }, { date: "Jan 20", event: "Assessment cleared", type: "assessment" }, { date: "Jan 25", event: "Offer letter sent", type: "offer" }, { date: "Feb 1", event: "Offer accepted", type: "hired" }] },
  { id: "c6", name: "Arjun Nair", email: "arjun.n@gmail.com", phone: "+91 43210 98765", avatar: "AN", role: "HR Business Partner", jobId: "j5", stage: "sourced", source: "LinkedIn", matchScore: 72, scoreBreakdown: { skills: 70, experience: 74, education: 72, culture: 71, overall: 72 }, daysInStage: 2, appliedDate: "2025-02-20", lastActivity: "2 days ago", location: "Hyderabad, IN", experience: "6 years", salary: "₹22 LPA", timeline: [{ date: "Feb 20", event: "Profile sourced from LinkedIn", type: "applied" }] },
  { id: "c7", name: "Priya Gupta", email: "priya.g@gmail.com", phone: "+91 32109 87654", avatar: "PG", role: "Senior Frontend Developer", jobId: "j1", stage: "rejected", source: "Website", matchScore: 45, scoreBreakdown: { skills: 50, experience: 40, education: 48, culture: 42, overall: 45 }, daysInStage: 4, appliedDate: "2025-02-12", lastActivity: "4 days ago", location: "Kolkata, IN", experience: "2 years", salary: "₹14 LPA", timeline: [{ date: "Feb 12", event: "Applied via website", type: "applied" }, { date: "Feb 13", event: "Resume screened", type: "screened" }, { date: "Feb 15", event: "Rejected - insufficient experience", type: "rejected" }] },
  { id: "c8", name: "Karthik Reddy", email: "karthik.r@gmail.com", phone: "+91 21098 76543", avatar: "KR", role: "Data Engineer", jobId: "j3", stage: "interview", source: "Campus", matchScore: 68, scoreBreakdown: { skills: 65, experience: 60, education: 78, culture: 70, overall: 68 }, daysInStage: 4, appliedDate: "2025-02-08", lastActivity: "1 day ago", location: "Bangalore, IN", experience: "1 year", salary: "₹12 LPA", timeline: [{ date: "Feb 8", event: "Applied via campus placement", type: "applied" }, { date: "Feb 10", event: "Screened by recruiter", type: "screened" }, { date: "Feb 14", event: "Interview scheduled", type: "interview" }] },
  { id: "c9", name: "Deepika Rao", email: "deepika.r@gmail.com", phone: "+91 10987 65432", avatar: "DR", role: "Product Designer", jobId: "j2", stage: "screening", source: "Naukri", matchScore: 81, scoreBreakdown: { skills: 84, experience: 78, education: 80, culture: 82, overall: 81 }, daysInStage: 3, appliedDate: "2025-02-17", lastActivity: "3 days ago", location: "Mumbai, IN", experience: "5 years", salary: "₹26 LPA", timeline: [{ date: "Feb 17", event: "Applied via Naukri", type: "applied" }, { date: "Feb 18", event: "Under screening", type: "screened" }] },
  { id: "c10", name: "Suresh Kumar", email: "suresh.k@gmail.com", phone: "+91 98765 12345", avatar: "SK", role: "Sales Manager", jobId: "j4", stage: "assessment", source: "Referral", matchScore: 76, scoreBreakdown: { skills: 78, experience: 80, education: 68, culture: 77, overall: 76 }, daysInStage: 2, appliedDate: "2025-02-05", lastActivity: "2 days ago", location: "Delhi, IN", experience: "6 years", salary: "₹28 LPA", timeline: [{ date: "Feb 5", event: "Referred by Amit Joshi", type: "applied" }, { date: "Feb 6", event: "Phone screening completed", type: "screened" }, { date: "Feb 10", event: "Interview with VP Sales", type: "interview" }, { date: "Feb 15", event: "Assessment in progress", type: "assessment" }] },
  { id: "c11", name: "Lakshmi Venkat", email: "lakshmi.v@gmail.com", phone: "+91 87654 56789", avatar: "LV", role: "DevOps Engineer", jobId: "j6", stage: "interview", source: "LinkedIn", matchScore: 89, scoreBreakdown: { skills: 92, experience: 88, education: 84, culture: 90, overall: 89 }, daysInStage: 2, appliedDate: "2025-02-14", lastActivity: "6 hours ago", location: "Bangalore, IN", experience: "5 years", salary: "₹30 LPA", timeline: [{ date: "Feb 14", event: "Applied via LinkedIn", type: "applied" }, { date: "Feb 15", event: "Screened by technical lead", type: "screened" }, { date: "Feb 18", event: "System design round", type: "interview" }] },
  { id: "c12", name: "Nikhil Joshi", email: "nikhil.j@gmail.com", phone: "+91 76543 45678", avatar: "NJ", role: "DevOps Engineer", jobId: "j6", stage: "sourced", source: "Agency", matchScore: 64, scoreBreakdown: { skills: 66, experience: 62, education: 60, culture: 68, overall: 64 }, daysInStage: 1, appliedDate: "2025-02-21", lastActivity: "1 day ago", location: "Pune, IN", experience: "3 years", salary: "₹18 LPA", timeline: [{ date: "Feb 21", event: "Sourced via TechStaff Agency", type: "applied" }] },
];

const MOCK_JOBS: JobPosting[] = [
  { id: "j1", title: "Senior Frontend Developer", department: "Engineering", location: "Bangalore, IN", type: "Full-time", status: "open", openings: 2, applicants: 34, daysOpen: 28, salary: "₹25-35 LPA", postedDate: "2025-01-25", urgent: true, hiringManager: "Rajesh Kumar", description: "We are looking for an experienced Senior Frontend Developer to join our engineering team. You will be responsible for building and maintaining high-performance web applications using React, Next.js, and TypeScript.", requirements: ["5+ years of frontend development experience", "Expert in React, Next.js, TypeScript", "Experience with state management (Redux, Zustand)", "Strong understanding of web performance optimization", "Familiarity with CI/CD pipelines"], responsibilities: ["Lead frontend architecture decisions", "Mentor junior developers", "Build reusable component libraries", "Optimize application performance", "Collaborate with design and backend teams"] },
  { id: "j2", title: "Product Designer", department: "Design", location: "Delhi, IN (Hybrid)", type: "Full-time", status: "open", openings: 1, applicants: 22, daysOpen: 21, salary: "₹28-38 LPA", postedDate: "2025-02-01", urgent: false, hiringManager: "Kavitha Reddy", description: "Seeking a talented Product Designer to craft intuitive, beautiful experiences for our HRMS platform. You will work closely with product managers and engineers to ship features that delight users.", requirements: ["4+ years of product design experience", "Proficiency in Figma", "Strong portfolio showcasing UX/UI work", "Experience with design systems", "Understanding of accessibility standards"], responsibilities: ["Design end-to-end user flows", "Maintain and evolve our design system", "Conduct user research and usability testing", "Create interactive prototypes", "Present designs to stakeholders"] },
  { id: "j3", title: "Data Engineer", department: "Analytics", location: "Pune, IN", type: "Full-time", status: "on-hold", openings: 1, applicants: 18, daysOpen: 35, salary: "₹22-30 LPA", postedDate: "2025-01-18", urgent: false, hiringManager: "Srinivas M", description: "Looking for a Data Engineer to build and optimize our data pipelines. You will work with large datasets and ensure data quality across the organization.", requirements: ["3+ years in data engineering", "Proficiency in Python, SQL", "Experience with Spark, Airflow", "Knowledge of cloud data warehouses", "Understanding of ETL best practices"], responsibilities: ["Build and maintain data pipelines", "Optimize data warehouse performance", "Implement data quality checks", "Collaborate with data scientists", "Document data architecture"] },
  { id: "j4", title: "Sales Manager", department: "Sales", location: "Chennai, IN", type: "Full-time", status: "open", openings: 1, applicants: 9, daysOpen: 14, salary: "₹30-40 LPA", postedDate: "2025-02-08", urgent: true, hiringManager: "Vikram Singh", description: "Seeking an experienced Sales Manager to lead our enterprise sales team. You will drive revenue growth and build strong client relationships in the B2B SaaS space.", requirements: ["7+ years in B2B SaaS sales", "3+ years in leadership", "Proven track record of meeting quotas", "Experience with enterprise sales cycles", "Strong negotiation skills"], responsibilities: ["Lead and mentor the sales team", "Develop sales strategies and targets", "Manage key enterprise accounts", "Forecast revenue and pipeline", "Collaborate with marketing on campaigns"] },
  { id: "j5", title: "HR Business Partner", department: "HR & Admin", location: "Hyderabad, IN", type: "Full-time", status: "open", openings: 1, applicants: 15, daysOpen: 18, salary: "₹20-28 LPA", postedDate: "2025-02-04", urgent: false, hiringManager: "Anita Deshmukh", description: "Looking for an HR Business Partner to align people strategies with business objectives. You will work closely with department heads to drive talent management and employee engagement.", requirements: ["5+ years in HR business partnering", "Strong understanding of labor laws", "Experience with performance management", "Excellent communication skills", "CHRP/SHRM certification preferred"], responsibilities: ["Partner with business leaders on people strategies", "Drive talent development programs", "Manage employee relations", "Support organizational change initiatives", "Analyze HR metrics and provide insights"] },
  { id: "j6", title: "DevOps Engineer", department: "Engineering", location: "Bangalore, IN (Remote)", type: "Full-time", status: "open", openings: 2, applicants: 26, daysOpen: 10, salary: "₹24-34 LPA", postedDate: "2025-02-12", urgent: false, hiringManager: "Rajesh Kumar", description: "We need a DevOps Engineer to help us scale our infrastructure. You will design and maintain our CI/CD pipelines and ensure 99.9% uptime for our platform.", requirements: ["4+ years in DevOps/SRE", "Expert in AWS/GCP", "Experience with Kubernetes, Docker", "Strong scripting skills (Bash, Python)", "Knowledge of monitoring tools"], responsibilities: ["Design and maintain CI/CD pipelines", "Manage cloud infrastructure", "Implement monitoring and alerting", "Automate deployment processes", "Ensure system reliability and security"] },
  { id: "j7", title: "Backend Developer", department: "Engineering", location: "Bangalore, IN", type: "Full-time", status: "open", openings: 3, applicants: 41, daysOpen: 15, salary: "₹22-32 LPA", postedDate: "2025-02-10", urgent: true, hiringManager: "Rajesh Kumar", description: "Looking for a skilled Backend Developer to design and build scalable server-side applications. You will work on our core platform APIs, database architecture, and microservices infrastructure.", requirements: ["4+ years of backend development experience", "Expert in Node.js, Python, or Java", "Experience with SQL and NoSQL databases", "Knowledge of microservices architecture", "Familiarity with REST API design and GraphQL", "Understanding of cloud platforms (AWS/GCP)"], responsibilities: ["Design and implement RESTful APIs and microservices", "Optimize database queries and schema design", "Build scalable and maintainable backend systems", "Implement authentication, authorization, and security", "Write unit and integration tests", "Collaborate with frontend and mobile teams"] },
  { id: "j8", title: "Full Stack Developer", department: "Engineering", location: "Pune, IN (Hybrid)", type: "Full-time", status: "open", openings: 2, applicants: 30, daysOpen: 8, salary: "₹20-30 LPA", postedDate: "2025-02-14", urgent: false, hiringManager: "Rajesh Kumar", description: "Seeking a versatile Full Stack Developer who can work across the entire application stack. You will build features end-to-end, from database design to pixel-perfect UI implementation.", requirements: ["3+ years of full-stack development", "Proficiency in React/Next.js and Node.js", "Experience with PostgreSQL or MongoDB", "Understanding of DevOps basics (CI/CD, Docker)", "Knowledge of version control (Git)"], responsibilities: ["Build end-to-end features across the stack", "Design and implement database schemas", "Create responsive and accessible UI components", "Integrate third-party APIs and services", "Participate in code reviews and architecture discussions"] },
  { id: "j9", title: "QA Engineer", department: "Engineering", location: "Hyderabad, IN", type: "Full-time", status: "open", openings: 1, applicants: 12, daysOpen: 20, salary: "₹14-22 LPA", postedDate: "2025-01-30", urgent: false, hiringManager: "Kavitha Reddy", description: "We need a detail-oriented QA Engineer to ensure the quality of our HRMS platform. You will design test plans, automate regression tests, and work closely with developers to deliver bug-free releases.", requirements: ["3+ years in QA/testing", "Experience with automated testing (Selenium, Cypress, or Playwright)", "Strong understanding of SDLC and testing methodologies", "Knowledge of API testing tools (Postman, REST Assured)", "Experience with performance testing is a plus"], responsibilities: ["Design and execute test plans and test cases", "Automate regression and smoke test suites", "Report and track defects using JIRA", "Perform API and integration testing", "Collaborate with developers on bug fixes and root cause analysis"] },
  { id: "j10", title: "Digital Marketing Manager", department: "Marketing", location: "Delhi, IN", type: "Full-time", status: "open", openings: 1, applicants: 19, daysOpen: 12, salary: "₹18-26 LPA", postedDate: "2025-02-06", urgent: false, hiringManager: "Vikram Singh", description: "Looking for a creative and data-driven Digital Marketing Manager to lead our online marketing efforts. You will own our digital presence, drive lead generation, and optimize conversion funnels.", requirements: ["5+ years in digital marketing", "Expert in SEO, SEM, and social media marketing", "Experience with Google Analytics and marketing automation", "Strong copywriting and content strategy skills", "Experience with B2B SaaS marketing preferred"], responsibilities: ["Develop and execute digital marketing strategies", "Manage PPC campaigns and optimize for ROI", "Create content calendars and oversee social media", "Analyze campaign performance and report insights", "Manage marketing budget and vendor relationships"] },
  { id: "j11", title: "Financial Analyst", department: "Finance", location: "Mumbai, IN", type: "Full-time", status: "open", openings: 1, applicants: 8, daysOpen: 25, salary: "₹16-24 LPA", postedDate: "2025-01-25", urgent: false, hiringManager: "Priya Sharma", description: "Seeking a Financial Analyst to support our financial planning and analysis. You will prepare budgets, forecast revenues, and provide actionable financial insights to leadership.", requirements: ["3+ years in financial analysis", "Strong proficiency in Excel and financial modeling", "Knowledge of accounting principles (GAAP/IFRS)", "Experience with ERP systems (SAP, Oracle)", "CFA or MBA preferred"], responsibilities: ["Prepare monthly and quarterly financial reports", "Build financial models for forecasting", "Analyze budget vs actuals and explain variances", "Support strategic planning with data-driven insights", "Ensure compliance with financial regulations"] },
  { id: "j12", title: "Technical Recruiter", department: "HR & Admin", location: "Bangalore, IN (Remote)", type: "Full-time", status: "open", openings: 2, applicants: 14, daysOpen: 7, salary: "₹12-20 LPA", postedDate: "2025-02-15", urgent: true, hiringManager: "Kavitha Reddy", description: "We need a Technical Recruiter who understands software engineering roles and can source top talent. You will manage the full recruitment lifecycle from sourcing to offer closure for our engineering team.", requirements: ["2+ years in technical recruitment", "Strong understanding of software engineering roles and technologies", "Experience with ATS platforms and sourcing tools", "Excellent candidate engagement and relationship-building skills", "Knowledge of IT staffing market trends"], responsibilities: ["Source and screen technical candidates", "Manage end-to-end recruitment for engineering roles", "Build and maintain talent pipelines", "Conduct initial phone screens and coordinate interviews", "Negotiate offers and manage candidate experience"], experienceLevel: "1-3" },
  { id: "j13", title: "AI Developer - Fresher", department: "AI & Machine Learning", location: "Bangalore, IN", type: "Full-time", status: "open", openings: 5, applicants: 67, daysOpen: 5, salary: "₹6-10 LPA", postedDate: "2025-02-18", urgent: true, hiringManager: "Rajesh Kumar", description: "Kickstart your career in Artificial Intelligence! We are looking for passionate freshers who want to build intelligent systems. You will work alongside senior AI engineers on real-world ML/AI projects, learning cutting-edge technologies like deep learning, NLP, and computer vision from day one.", requirements: ["0-1 years of experience (freshers welcome)", "B.Tech/M.Tech in Computer Science, AI/ML, or related field", "Strong fundamentals in Python, mathematics, and statistics", "Familiarity with machine learning concepts (supervised/unsupervised learning)", "Knowledge of libraries like NumPy, Pandas, scikit-learn is a plus", "Good problem-solving and analytical skills", "Eagerness to learn and adapt quickly"], responsibilities: ["Assist in building and training ML models under senior guidance", "Perform data preprocessing, feature engineering, and EDA", "Write clean, well-documented Python code for AI pipelines", "Participate in code reviews and team knowledge-sharing sessions", "Contribute to research and experimentation on new AI approaches", "Help maintain AI model documentation and experiment tracking"], experienceLevel: "fresher", skills: ["Python", "Machine Learning", "Deep Learning", "NumPy", "Pandas", "scikit-learn", "TensorFlow/PyTorch", "SQL", "Git", "Mathematics"], benefits: ["Comprehensive AI/ML training program", "Mentorship from senior AI engineers", "Health insurance for self and family", "Flexible work hours", "Learning budget for courses and conferences", "Free meals and snacks"] },
  { id: "j14", title: "AI Developer (2+ Years Exp)", department: "AI & Machine Learning", location: "Bangalore, IN (Hybrid)", type: "Full-time", status: "open", openings: 3, applicants: 42, daysOpen: 12, salary: "₹15-25 LPA", postedDate: "2025-02-11", urgent: true, hiringManager: "Rajesh Kumar", description: "We are looking for an experienced AI Developer with 2+ years of hands-on experience building and deploying machine learning models in production. You will design ML pipelines, fine-tune LLMs, and build intelligent features that power our AI-driven HRMS platform.", requirements: ["2-5 years of experience in AI/ML development", "Strong proficiency in Python and ML frameworks (TensorFlow, PyTorch)", "Experience with NLP, LLMs, and transformer architectures", "Hands-on with model deployment (Docker, Kubernetes, MLflow)", "Understanding of cloud platforms (AWS SageMaker, GCP Vertex AI, Azure ML)", "Experience with MLOps practices and CI/CD for ML systems", "B.Tech/M.Tech in CS, AI/ML, or equivalent experience"], responsibilities: ["Design, train, and deploy production ML models for HR intelligence features", "Fine-tune and integrate large language models for resume parsing and JD matching", "Build robust data pipelines for model training and inference", "Implement MLOps best practices (versioning, monitoring, A/B testing)", "Collaborate with product and engineering teams on AI feature roadmaps", "Mentor junior AI developers and review their work"], experienceLevel: "2-5", skills: ["Python", "TensorFlow", "PyTorch", "NLP", "LLMs", "Transformers", "Docker", "Kubernetes", "MLflow", "AWS SageMaker", "MLOps", "SQL", "Git"], benefits: ["Competitive salary with ESOPs", "Remote-first culture with office access", "Health insurance for self and family", "Annual learning budget of ₹2 Lakhs", "Sponsored conference attendance", "Flexible work hours"] },
  { id: "j15", title: "Senior AI Developer (5-10 Years Exp)", department: "AI & Machine Learning", location: "Bangalore, IN (Remote)", type: "Full-time", status: "open", openings: 2, applicants: 28, daysOpen: 18, salary: "₹30-50 LPA", postedDate: "2025-02-05", urgent: false, hiringManager: "Rajesh Kumar", description: "Lead our AI strategy and architecture. We need a seasoned AI professional who can drive innovation, architect large-scale ML systems, and mentor a growing team of AI engineers. You will own the end-to-end AI roadmap for our HRMS platform, from research to production deployment.", requirements: ["5-10 years of experience in AI/ML with at least 2 years in a leadership role", "Deep expertise in NLP, computer vision, and generative AI", "Proven track record of deploying ML systems at scale (millions of predictions/day)", "Expert-level Python, with strong systems design and architecture skills", "Experience with LLM fine-tuning (LoRA, QLoRA), RAG pipelines, and vector databases", "Strong understanding of AI ethics, bias mitigation, and responsible AI practices", "PhD or MS in CS/AI/ML from a top institution preferred"], responsibilities: ["Define and execute the AI/ML technical roadmap for the HRMS platform", "Architect scalable ML infrastructure (training, serving, monitoring, feedback loops)", "Lead research on cutting-edge AI techniques and evaluate their business impact", "Build and mentor a team of 5-10 AI developers", "Collaborate with C-suite on AI strategy and investment decisions", "Ensure AI compliance with EU AI Act, NYC LL 144, and other regulations", "Present AI capabilities and ROI to stakeholders and board"], experienceLevel: "5-10", skills: ["Python", "TensorFlow", "PyTorch", "LLMs", "RAG", "Transformers", "Computer Vision", "MLOps", "Kubernetes", "AWS/GCP", "System Design", "AI Ethics", "Leadership", "Research"], benefits: ["₹30-50 LPA + ESOPs", "VP-level title and authority", "Dedicated research budget", "Full remote flexibility", "Premium health insurance", "Annual international conference sponsorship", "Stock options with accelerated vesting"] },
];

/* ──────────────── Mock Resume Texts ──────────────── */

const MOCK_RESUME_TEXTS: { id: string; name: string; email: string; text: string }[] = [
  {
    id: "mr1", name: "Ananya Krishnan", email: "ananya.k@gmail.com",
    text: `Ananya Krishnan
Bangalore, India | ananya.k@gmail.com | +91 98765 43210

Summary
Senior Frontend Developer with 6+ years of experience building high-performance web applications. Expert in React, Next.js, and TypeScript with a strong focus on performance optimization and developer experience.

Skills
React, Next.js, TypeScript, JavaScript, Redux, Zustand, Tailwind CSS, HTML5, CSS3, GraphQL, REST API, Git, CI/CD, Docker, Node.js, Webpack, Vite, Jest, React Testing Library, Storybook

Experience
Senior Frontend Developer at TechCorp India
Jan 2022 – Present
- Lead frontend architecture for the HRMS platform serving 50K+ users
- Built reusable component library with React, TypeScript, and Tailwind CSS
- Optimized application performance achieving 95+ Lighthouse scores
- Mentored team of 4 junior developers through code reviews and pair programming

Frontend Developer at StartupXYZ
Mar 2019 – Dec 2021
- Developed features using React, Next.js, and TypeScript
- Implemented state management with Redux and Zustand
- Collaborated with design team on UI/UX improvements
- Built CI/CD pipelines using GitHub Actions

Education
B.Tech in Computer Science, IIT Delhi
Graduated 2018

Certifications
AWS Certified Developer - Associate`,
  },
  {
    id: "mr2", name: "Rohan Patel", email: "rohan.p@outlook.com",
    text: `Rohan Patel
Mumbai, India | rohan.p@outlook.com | +91 87654 32109

Summary
Frontend Developer with 5+ years of experience in React and TypeScript ecosystems. Passionate about building accessible, performant web applications.

Skills
React, TypeScript, JavaScript, Next.js, Redux, CSS, HTML, Git, Webpack, Jest, REST API, Node.js, Tailwind CSS, Figma, Agile

Experience
Frontend Developer at Digital Solutions Ltd
Jun 2020 – Present
- Built and maintained React applications with TypeScript
- Implemented responsive designs and accessibility standards
- Developed REST API integrations with Node.js backend
- Participated in agile sprints and code reviews

Junior Developer at WebCraft Inc
Aug 2018 – May 2020
- Developed UI components using React and CSS
- Fixed bugs and improved application performance
- Collaborated with senior developers on feature development

Education
B.Sc in Information Technology, Mumbai University
Graduated 2018`,
  },
  {
    id: "mr3", name: "Meera Sharma", email: "meera.s@gmail.com",
    text: `Meera Sharma
Delhi, India | meera.s@gmail.com | +91 76543 21098

Summary
Creative Product Designer with 7+ years of experience in UX/UI design, design systems, and user research. Skilled in Figma with a strong portfolio of B2B SaaS products.

Skills
Figma, Sketch, Adobe XD, Prototyping, Wireframing, User Research, Usability Testing, Design Systems, Accessibility, Responsive Design, Interaction Design, Information Architecture, HTML, CSS

Experience
Lead Product Designer at DesignHub Pro
Feb 2021 – Present
- Led design for B2B SaaS HRMS platform used by 100+ companies
- Built and maintained design system with 200+ components in Figma
- Conducted user research and usability testing sessions
- Collaborated with engineering on design-to-code handoff

Product Designer at CreativeTech
Mar 2018 – Jan 2021
- Designed end-to-end user flows for mobile and web applications
- Created interactive prototypes and design specifications
- Conducted stakeholder workshops and design critiques
- Maintained accessibility standards across products

Education
Master of Design (M.Des), NID Ahmedabad
Graduated 2018

Certifications
Google UX Design Professional Certificate`,
  },
  {
    id: "mr4", name: "Vikram Desai", email: "vikram.d@gmail.com",
    text: `Vikram Desai
Pune, India | vikram.d@gmail.com | +91 65432 10987

Summary
Data Engineer with 4 years of experience in building data pipelines and ETL workflows. Proficient in Python, SQL, and cloud data platforms.

Skills
Python, SQL, Spark, Airflow, AWS, Snowflake, ETL, Data Warehousing, Kafka, Pandas, NumPy, Docker, Git

Experience
Data Engineer at DataFlow Technologies
Jul 2021 – Present
- Built and maintained data pipelines using Apache Airflow and Spark
- Designed data warehouse schemas on Snowflake
- Implemented data quality checks and monitoring
- Collaborated with data scientists on ML feature pipelines

Junior Data Analyst at AnalyticsCo
Aug 2019 – Jun 2021
- Performed data analysis using Python and SQL
- Created dashboards and reports for business stakeholders
- Assisted in ETL pipeline development

Education
B.Tech in Computer Science, Pune University
Graduated 2019`,
  },
  {
    id: "mr5", name: "Suresh Kumar", email: "suresh.k@gmail.com",
    text: `Suresh Kumar
Delhi, India | suresh.k@gmail.com | +91 98765 12345

Summary
Recent computer science graduate with basic knowledge of web development. Looking for entry-level opportunities to grow as a developer.

Skills
HTML, CSS, JavaScript, Basic React, Python, Git

Experience
Intern at SmallWeb Agency
Jan 2025 – Present
- Assisted in building simple web pages using HTML and CSS
- Learned React fundamentals through online courses

Education
BCA, Delhi University
Graduated 2024

Certifications
None`,
  },
  {
    id: "mr6", name: "Arjun Mehta", email: "arjun.m@gmail.com",
    text: `Arjun Mehta
Bangalore, India | arjun.m@gmail.com | +91 99887 76655

Summary
AI Engineer with 3 years of experience in ML, NLP, and DL. Built production LLM pipelines and RAG systems for enterprise HR platforms. Strong in Python, TensorFlow, and PyTorch.

Skills
ML, NLP, DL, CV, Python, TensorFlow, PyTorch, LLM, RAG, Transformers, Docker, Kubernetes, AWS, MLOps, SQL, Git, Pandas, NumPy, scikit-learn

Experience
AI Engineer at IntelliCorp
Jun 2022 – Present
- Built ML pipelines for resume parsing using NLP and DL techniques
- Fine-tuned LLMs for candidate-job matching with RAG architecture
- Deployed models on AWS SageMaker with Docker and Kubernetes
- Implemented MLOps practices for model versioning and monitoring

Junior ML Engineer at DataSense AI
Aug 2020 – May 2022
- Developed CV models for document extraction
- Created NLP pipelines for text classification and entity recognition
- Built recommendation engine using collaborative filtering

Education
B.Tech in Computer Science, IIT Bombay
Graduated 2020

Certifications
AWS Certified Machine Learning - Specialty`,
  },
  {
    id: "mr7", name: "Priya Nair", email: "priya.n@gmail.com",
    text: `Priya Nair
Hyderabad, India | priya.n@gmail.com | +91 88776 65544

Summary
Fresher with strong fundamentals in AI/ML. Built academic projects in NLP, CV, and GenAI. Seeking entry-level AI Developer role to apply my skills in production ML systems.

Skills
Python, ML, NLP, DL, CV, GenAI, PyTorch, TensorFlow, Pandas, NumPy, scikit-learn, SQL, Git, Mathematics, Statistics

Projects
Sentiment Analysis Tool (NLP)
- Built a sentiment classifier using BERT and HuggingFace Transformers
- Achieved 92% accuracy on movie review dataset
- Deployed using FastAPI and Docker

Image Classification System (CV)
- Developed CNN model for plant disease detection
- Used transfer learning with ResNet50
- 95% classification accuracy on test set

Chatbot with RAG (GenAI)
- Built a RAG-based chatbot using LangChain and OpenAI API
- Implemented vector search with FAISS for document retrieval
- Created Streamlit frontend for user interaction

Education
B.Tech in AI & Machine Learning, IIIT Hyderabad
Graduated 2025

Certifications
Deep Learning Specialization (Coursera)`,
  },
  {
    id: "mr8", name: "Dr. Kavitha Rajan", email: "kavitha.r@gmail.com",
    text: `Dr. Kavitha Rajan
Bangalore, India | kavitha.r@gmail.com | +91 77665 54433

Summary
Senior AI Research Scientist with 8 years of experience leading ML teams. Expert in NLP, CV, LLM fine-tuning (LoRA, QLoRA), RAG pipelines, and responsible AI. Published 15+ papers in top-tier conferences (NeurIPS, ICML, ACL).

Skills
Python, ML, NLP, CV, DL, LLM, RAG, LoRA, QLoRA, PEFT, Transformers, PyTorch, TensorFlow, MLOps, Docker, Kubernetes, AWS, GCP, AI Ethics, Responsible AI, System Design, Leadership, Research, GenAI, GAN, CNN, RNN

Experience
Principal AI Scientist at DeepTech Labs
Jan 2021 – Present
- Lead a team of 12 AI engineers building LLM-powered enterprise solutions
- Architected RAG pipeline processing 10M+ documents with 99.5% uptime
- Fine-tuned LLMs using LoRA/QLoRA for domain-specific tasks (HR, Finance, Legal)
- Published 8 papers on efficient LLM inference and bias mitigation
- Ensure AI compliance with EU AI Act and responsible AI practices

Senior ML Engineer at AI Solutions Inc
Mar 2018 – Dec 2020
- Built production NLP pipelines for document understanding
- Led CV team for real-time object detection in manufacturing
- Implemented MLOps practices reducing model deployment time by 70%

ML Engineer at StartupML
Jun 2016 – Feb 2018
- Developed recommendation systems using collaborative filtering
- Built NLP models for customer feedback analysis

Education
PhD in Computer Science (AI/ML), IISc Bangalore
MS in Computer Science, Georgia Tech
BTech in Computer Science, NIT Trichy

Certifications
AWS Certified Machine Learning - Specialty
GCP Professional Machine Learning Engineer`,
  },
];

/* ──────────────── Helper Functions ──────────────── */

function getScoreColor(score: number): string {
  if (score >= 85) return "#22c55e";
  if (score >= 70) return "#0066CC";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function getScoreBgColor(score: number): string {
  if (score >= 85) return "#22c55e15";
  if (score >= 70) return "#0066CC20";
  if (score >= 50) return "#f59e0b15";
  return "#ef444415";
}

/* ──────────────── Score Bar Component ──────────────── */

function ScoreBar({ value, color, showLabel = true }: { value: number; color?: string; showLabel?: boolean }) {
  const barColor = color || getScoreColor(value);
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-[#e8e8e8] dark:bg-[#2a2a2c] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.22, 0.8, 0.22, 1] }}
        />
      </div>
      {showLabel && (
        <span className="text-[11px] font-semibold min-w-[28px] text-right" style={{ color: barColor }}>
          {value}%
        </span>
      )}
    </div>
  );
}

/* ──────────────── Candidate Detail Dialog ──────────────── */

function CandidateDetailDialog({
  candidate, open, onOpenChange, onMoveStage, onRunAIAnalysis,
}: {
  candidate: Candidate | null; open: boolean; onOpenChange: (open: boolean) => void; onMoveStage: (candidateId: string, newStage: PipelineStage) => void; onRunAIAnalysis: (candidate: Candidate) => void;
}) {
  if (!candidate) return null;
  const cfg = STAGE_CONFIG[candidate.stage];
  const analysis = candidate.aiAnalysis;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-[24px] p-0">
        <div className="bg-gradient-to-r from-[#0a0a0b] to-[#1a1a1c] p-6 rounded-t-[24px]">
          <div className="flex items-start gap-4">
            <Avatar className="size-14 rounded-2xl border-2 border-white/20">
              <AvatarFallback className="rounded-2xl bg-[#FF9900] text-white text-lg font-bold">{candidate.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white">{candidate.name}</h2>
              <p className="text-sm text-white/70 mt-0.5">{candidate.role}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <Badge className="rounded-full text-[11px] font-medium border-0 px-3 py-0.5" style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>{cfg.label}</Badge>
                <span className="text-xs text-white/50 flex items-center gap-1"><MapPin className="size-3" /> {candidate.location}</span>
                <span className="text-xs text-white/50 flex items-center gap-1"><Briefcase className="size-3" /> {candidate.experience}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: getScoreColor(candidate.matchScore) }}>{candidate.matchScore}</div>
              <div className="text-[10px] text-white/50 uppercase tracking-wider">Match</div>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm"><Mail className="size-3.5 text-[var(--saptta-mute)]" /><span className="text-[var(--saptta-ink-2)]">{candidate.email}</span></div>
            <div className="flex items-center gap-2 text-sm"><Phone className="size-3.5 text-[var(--saptta-mute)]" /><span className="text-[var(--saptta-ink-2)]">{candidate.phone}</span></div>
            <div className="flex items-center gap-2 text-sm"><Building2 className="size-3.5 text-[var(--saptta-mute)]" /><span className="text-[var(--saptta-ink-2)]">{candidate.source}</span></div>
            <div className="flex items-center gap-2 text-sm"><IndianRupee className="size-3.5 text-[var(--saptta-mute)]" /><span className="text-[var(--saptta-ink-2)]">{candidate.salary}</span></div>
          </div>
          <Separator />

          {/* AI Analysis Section */}
          {analysis ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="size-4 text-[#FF9900]" />
                <h3 className="text-sm font-semibold text-[var(--saptta-ink)]">HireMind AI Analysis</h3>
                <Badge className="rounded-full text-[9px] border-0 px-2 py-0.5" style={{ backgroundColor: analysis.shortlistDecision ? "#22c55e15" : "#ef444415", color: analysis.shortlistDecision ? "#22c55e" : "#ef4444" }}>
                  {analysis.shortlistDecision ? "✓ Shortlisted" : "✗ Not Shortlisted"}
                </Badge>
              </div>

              {/* Recruiter Insights */}
              {analysis.recruiterInsights && (
                <div className="bg-[var(--saptta-bg-2)] rounded-xl p-3 space-y-2">
                  <p className="text-sm font-medium text-[var(--saptta-ink)]">{analysis.recruiterInsights.oneLineSummary}</p>
                  {analysis.recruiterInsights.greenFlags?.length > 0 && (
                    <div><p className="text-[10px] font-semibold text-green-600 mb-1">Green Flags</p>
                    <div className="flex flex-wrap gap-1">{analysis.recruiterInsights.greenFlags.map((f, i) => <Badge key={i} className="text-[9px] rounded-full border-0 px-2 py-0 bg-green-50 text-green-700">{f}</Badge>)}</div></div>
                  )}
                  {analysis.recruiterInsights.redFlags?.length > 0 && (
                    <div><p className="text-[10px] font-semibold text-red-600 mb-1">Red Flags</p>
                    <div className="flex flex-wrap gap-1">{analysis.recruiterInsights.redFlags.map((f, i) => <Badge key={i} className="text-[9px] rounded-full border-0 px-2 py-0 bg-red-50 text-red-700">{f}</Badge>)}</div></div>
                  )}
                </div>
              )}

              {/* Skill Expansion */}
              {analysis.skillExpansion?.expanded?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--saptta-ink)] mb-2">Skill Expansion</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.skillExpansion.expanded.filter(e => e.fullForms?.length > 0).map((exp, i) => (
                      <Badge key={i} className="text-[9px] rounded-full border-0 px-2 py-0.5 bg-[#0066CC15] text-[#0066CC]">
                        {exp.abbreviation} → {exp.fullForms[0]}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* ATS Score */}
              {analysis.atsScore && (
                <div>
                  <p className="text-xs font-semibold text-[var(--saptta-ink)] mb-2">ATS Score: {analysis.atsScore.overall}%</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-[10px] text-[var(--saptta-mute)]">Keyword Match: <span className="font-semibold text-[var(--saptta-ink)]">{analysis.atsScore.keywordOptimization}%</span></div>
                  </div>
                  {analysis.atsScore.issues?.length > 0 && (
                    <div className="mt-1"><p className="text-[10px] text-[var(--saptta-mute)]">Issues: {analysis.atsScore.issues.slice(0, 2).join(", ")}</p></div>
                  )}
                </div>
              )}

              {/* Gap Analysis */}
              {analysis.gapAnalysis?.criticalGaps?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--saptta-ink)] mb-1">Critical Gaps</p>
                  <div className="flex flex-wrap gap-1">{analysis.gapAnalysis.criticalGaps.map((g, i) => <Badge key={i} className="text-[9px] rounded-full border-0 px-2 py-0 bg-red-50 text-red-700">{g}</Badge>)}</div>
                </div>
              )}

              {/* Interview Prediction */}
              {analysis.interviewPrediction && (
                <div>
                  <p className="text-xs font-semibold text-[var(--saptta-ink)] mb-1">Interview Likelihood: {analysis.interviewPrediction.likelihood}%</p>
                  {analysis.interviewPrediction.expectedRounds?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">{analysis.interviewPrediction.expectedRounds.map((r, i) => <Badge key={i} className="text-[9px] rounded-full border-0 px-2 py-0 bg-[#FF990015] text-[#FF9900]">{r}</Badge>)}</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-4">
              <Button className="rounded-full bg-[#FF9900] text-white hover:bg-[#FF9900]/90 h-9 text-xs px-5" onClick={() => { onRunAIAnalysis(candidate); onOpenChange(false); }}>
                <Brain className="size-4 mr-2" />Run HireMind AI Analysis
              </Button>
            </div>
          )}

          <Separator />
          <div>
            <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-3">Score Breakdown</h3>
            <div className="space-y-3">
              {[{ label: "Skills", value: candidate.scoreBreakdown.skills }, { label: "Experience", value: candidate.scoreBreakdown.experience }, { label: "Education", value: candidate.scoreBreakdown.education }, { label: "Culture Fit", value: candidate.scoreBreakdown.culture }].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--saptta-mute)] w-20">{item.label}</span>
                  <div className="flex-1"><ScoreBar value={item.value} showLabel={false} /></div>
                  <span className="text-xs font-semibold min-w-[32px] text-right" style={{ color: getScoreColor(item.value) }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-3">Activity Timeline</h3>
            <div className="space-y-0">
              {candidate.timeline.map((event, i) => {
                const isLast = i === candidate.timeline.length - 1;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="size-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: isLast ? "#FF9900" : "#d4d4d4" }} />
                      {!isLast && <div className="w-px flex-1 bg-[#e8e8e8] dark:bg-[#2a2a2c] my-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm text-[var(--saptta-ink)]">{event.event}</p>
                      <p className="text-xs text-[var(--saptta-mute)]">{event.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-3">Move to Stage</h3>
            <div className="flex flex-wrap gap-2">
              {STAGE_ORDER.filter((s) => s !== candidate.stage).map((stage) => {
                const sc = STAGE_CONFIG[stage];
                return (
                  <Button key={stage} variant="outline" size="sm" className="rounded-full text-xs h-7 border-[var(--saptta-line)] hover:border-[var(--saptta-accent)]" onClick={() => { onMoveStage(candidate.id, stage); onOpenChange(false); }}>
                    <div className="size-1.5 rounded-full mr-1.5" style={{ backgroundColor: sc.color }} />{sc.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────── Job Detail Dialog ──────────────── */

function JobDetailDialog({ job, open, onOpenChange, candidates, onPublish, onEdit }: {
  job: JobPosting | null; open: boolean; onOpenChange: (open: boolean) => void; candidates: Candidate[]; onPublish: (job: JobPosting) => void; onEdit?: (job: JobPosting) => void;
}) {
  if (!job) return null;
  const statusCfg = JOB_STATUS_CONFIG[job.status];
  const expCfg = EXPERIENCE_LEVEL_CONFIG[job.experienceLevel || "mid"];
  const jobCandidates = candidates.filter((c) => c.jobId === job.id);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-[24px] p-0">
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--saptta-ink)]">{job.title}</h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-sm text-[var(--saptta-mute)] flex items-center gap-1"><Building2 className="size-3" /> {job.department}</span>
                <span className="text-sm text-[var(--saptta-mute)] flex items-center gap-1"><MapPin className="size-3" /> {job.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="rounded-full text-[11px] font-medium border-0 px-3 py-0.5" style={{ backgroundColor: statusCfg.bgColor, color: statusCfg.color }}>{statusCfg.label}</Badge>
              {job.experienceLevel && (
                <Badge className="rounded-full text-[10px] border-0 px-2.5 py-0.5" style={{ backgroundColor: expCfg.bgColor, color: expCfg.color }}>{expCfg.label}</Badge>
              )}
              {onEdit && (
                <Button size="sm" variant="outline" className="rounded-full h-7 text-[10px] px-3 border-[var(--saptta-line)]" onClick={() => { onEdit(job); onOpenChange(false); }}>
                  <FileText className="size-3 mr-1" />Edit
                </Button>
              )}
              {job.status === "open" && (
                <Button size="sm" className="rounded-full bg-[#FF9900] text-white hover:bg-[#FF9900]/90 h-7 text-[10px] px-3" onClick={() => onPublish(job)}>
                  <Globe className="size-3 mr-1" />Publish
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[{ label: "Openings", value: job.openings, icon: Users }, { label: "Applicants", value: job.applicants, icon: FileText }, { label: "Days Open", value: job.daysOpen, icon: Clock }, { label: "Salary", value: job.salary, icon: IndianRupee }].map((stat) => (
              <div key={stat.label} className="bg-[var(--saptta-bg-2)] rounded-xl p-3 text-center">
                <stat.icon className="size-4 text-[var(--saptta-mute)] mx-auto mb-1" />
                <p className="text-sm font-bold text-[var(--saptta-ink)]">{stat.value}</p>
                <p className="text-[10px] text-[var(--saptta-mute)]">{stat.label}</p>
              </div>
            ))}
          </div>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-3">Pipeline Overview</h3>
            <div className="flex gap-1">
              {STAGE_ORDER.filter((s) => s !== "rejected").map((stage) => {
                const count = jobCandidates.filter((c) => c.stage === stage).length;
                const sc = STAGE_CONFIG[stage];
                return (<div key={stage} className="flex-1 text-center"><div className="h-2 rounded-full mb-1.5" style={{ backgroundColor: count > 0 ? sc.color : "#e8e8e8" }} /><p className="text-xs font-semibold" style={{ color: count > 0 ? sc.color : "#8a8680" }}>{count}</p><p className="text-[9px] text-[var(--saptta-mute)]">{sc.label}</p></div>);
              })}
            </div>
          </div>
          <Separator />
          <div><h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-2">Job Description</h3><p className="text-sm text-[var(--saptta-ink-2)] leading-relaxed">{job.description}</p></div>
          <div><h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-2">Requirements</h3><ul className="space-y-1.5">{job.requirements.map((req, i) => (<li key={i} className="flex items-start gap-2 text-sm text-[var(--saptta-ink-2)]"><CheckCircle2 className="size-3.5 text-[#0066CC] mt-0.5 shrink-0" />{req}</li>))}</ul></div>
          <div><h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-2">Responsibilities</h3><ul className="space-y-1.5">{job.responsibilities.map((resp, i) => (<li key={i} className="flex items-start gap-2 text-sm text-[var(--saptta-ink-2)]"><ArrowRight className="size-3.5 text-[var(--saptta-accent)] mt-0.5 shrink-0" />{resp}</li>))}</ul></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────── JD Publish Dialog ──────────────── */

function JDPublishDialog({ job, open, onOpenChange }: { job: JobPosting | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [careerPageEnabled, setCareerPageEnabled] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  if (!job) return null;
  const jobUrl = `https://kamglobal.com/careers/${job.id}/${job.title.toLowerCase().replace(/\s+/g, "-")}`;
  const linkedInText = `🚀 We're hiring! ${job.title} at Kam\n\n${job.description.slice(0, 200)}...\n\nApply now: ${jobUrl}`;
  const emailBody = `Subject: Exciting Opportunity: ${job.title} at Kam\n\nDear Candidate,\n\nWe have an exciting opportunity for the role of ${job.title} at Kam.\n\nAbout the Role:\n${job.description.slice(0, 300)}\n\nKey Requirements:\n${job.requirements.slice(0, 3).map((r) => `• ${r}`).join("\n")}\n\nLocation: ${job.location}\nSalary: ${job.salary}\n\nApply here: ${jobUrl}\n\nBest regards,\nKam Recruitment Team`;
  const embedSnippet = `<iframe src="${jobUrl}/embed" width="100%" height="600" frameborder="0" style="border-radius:16px;"></iframe>`;

  const handleCopy = (text: string, type: "link" | "embed") => {
    navigator.clipboard.writeText(text);
    if (type === "link") { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }
    else { setCopiedEmbed(true); setTimeout(() => setCopiedEmbed(false), 2000); }
  };

  const publishOptions = [
    { icon: Globe, title: "Career Page", description: "Publish on your company career page", color: "#22c55e", content: (
      <div className="space-y-3">
        <div className="flex items-center justify-between"><span className="text-sm text-[var(--saptta-ink-2)]">Publish on career page</span><Switch checked={careerPageEnabled} onCheckedChange={setCareerPageEnabled} /></div>
        {careerPageEnabled && <div className="bg-[var(--saptta-bg-2)] rounded-xl p-3"><p className="text-xs text-[var(--saptta-mute)] mb-1">Preview URL</p><p className="text-sm text-[#FF9900] font-medium truncate">{jobUrl}</p></div>}
      </div>
    )},
    { icon: Linkedin, title: "LinkedIn", description: "Share on LinkedIn with pre-filled post", color: "#0077b5", content: (
      <div className="space-y-3">
        <div className="bg-[var(--saptta-bg-2)] rounded-xl p-3"><p className="text-xs text-[var(--saptta-mute)] mb-1">Pre-filled post text</p><p className="text-sm text-[var(--saptta-ink-2)] whitespace-pre-line">{linkedInText}</p></div>
        <Button className="w-full rounded-full bg-[#0077b5] text-white hover:bg-[#0077b5]/90 h-9 text-xs" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`, "_blank")}>
          <Linkedin className="size-4 mr-2" />Share on LinkedIn
        </Button>
      </div>
    )},
    { icon: Twitter, title: "Twitter / X", description: "Share job posting on Twitter", color: "#1da1f2", content: (
      <Button className="w-full rounded-full bg-[#1da1f2] text-white hover:bg-[#1da1f2]/90 h-9 text-xs" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🚀 We're hiring! ${job.title} at Kam. Apply now!`)}&url=${encodeURIComponent(jobUrl)}`, "_blank")}>
        <Twitter className="size-4 mr-2" />Share on Twitter / X
      </Button>
    )},
    { icon: Facebook, title: "Facebook", description: "Share on Facebook", color: "#4267b2", content: (
      <Button className="w-full rounded-full bg-[#4267b2] text-white hover:bg-[#4267b2]/90 h-9 text-xs" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`, "_blank")}>
        <Facebook className="size-4 mr-2" />Share on Facebook
      </Button>
    )},
    { icon: Link2, title: "Direct Link", description: "Copy shareable URL for the job posting", color: "#FF9900", content: (
      <div className="space-y-3">
        <div className="flex items-center gap-2"><Input value={jobUrl} readOnly className="rounded-xl text-xs h-9 flex-1" /><Button variant="outline" size="sm" className="rounded-full h-9 px-3" onClick={() => handleCopy(jobUrl, "link")}>{copiedLink ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}</Button></div>
      </div>
    )},
    { icon: Mail, title: "Email Template", description: "Pre-filled email with JD summary", color: "#0066CC", content: (
      <div className="space-y-3">
        <div className="bg-[var(--saptta-bg-2)] rounded-xl p-3 max-h-40 overflow-y-auto"><p className="text-xs text-[var(--saptta-ink-2)] whitespace-pre-line">{emailBody}</p></div>
        <Button className="w-full rounded-full bg-[#0066CC] text-[var(--saptta-ink)] hover:bg-[#0066CC]/90 h-9 text-xs" onClick={() => handleCopy(emailBody, "link")}>
          <Copy className="size-4 mr-2" />Copy Email Template
        </Button>
      </div>
    )},
    { icon: QrCode, title: "QR Code", description: "Generate QR code linking to job page", color: "#003d7a", content: (
      <div className="flex flex-col items-center gap-3">
        <div className="w-32 h-32 bg-[var(--saptta-bg-2)] rounded-xl flex items-center justify-center border-2 border-dashed border-[var(--saptta-line)]">
          <div className="grid grid-cols-5 gap-0.5">
            {Array.from({ length: 25 }).map((_, i) => (<div key={i} className="size-2 rounded-[1px]" style={{ backgroundColor: Math.random() > 0.35 ? "#0a0a0a" : "transparent" }} />))}
          </div>
        </div>
        <p className="text-xs text-[var(--saptta-mute)]">Scan to view job posting</p>
      </div>
    )},
    { icon: Code2, title: "Embed Widget", description: "HTML snippet for embedding on external sites", color: "#8b5cf6", content: (
      <div className="space-y-3">
        <div className="bg-[var(--saptta-bg-2)] rounded-xl p-3"><code className="text-[10px] text-[var(--saptta-ink-2)] break-all">{embedSnippet}</code></div>
        <Button variant="outline" className="w-full rounded-full h-9 text-xs" onClick={() => handleCopy(embedSnippet, "embed")}>{copiedEmbed ? <Check className="size-3.5 text-green-500 mr-2" /> : <Copy className="size-3.5 mr-2" />}Copy Embed Code</Button>
      </div>
    )},
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto rounded-[24px] p-0">
        <div className="bg-gradient-to-r from-[#0a0a0b] to-[#1a1a1c] p-6 rounded-t-[24px]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-[16px] bg-white/10 flex items-center justify-center"><Globe className="size-5 text-white" /></div>
            <div><h2 className="text-lg font-bold text-white">Publish Job Posting</h2><p className="text-xs text-white/60">{job.title} &middot; {job.department}</p></div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publishOptions.map((opt) => (
              <motion.div key={opt.title} variants={fadeUp} initial="hidden" animate="show">
                <Card className="border-[var(--saptta-line)] rounded-[20px] hover:shadow-md transition-all hover:border-[var(--saptta-accent)]/20">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${opt.color}15` }}><opt.icon className="size-4" style={{ color: opt.color }} /></div>
                      <div><p className="text-sm font-semibold text-[var(--saptta-ink)]">{opt.title}</p><p className="text-[10px] text-[var(--saptta-mute)]">{opt.description}</p></div>
                    </div>
                    {opt.content}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────── Email Candidate Dialog ──────────────── */

function EmailCandidateDialog({ open, onOpenChange, candidateName, candidateEmail, jobTitle }: {
  open: boolean; onOpenChange: (open: boolean) => void; candidateName: string; candidateEmail: string; jobTitle: string;
}) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const subject = `Congratulations! You've been shortlisted for ${jobTitle}`;
  const body = `Dear ${candidateName},\n\nCongratulations! We are pleased to inform you that you have been shortlisted for the position of ${jobTitle} at Kam.\n\nYour application stood out among many, and we were particularly impressed with your skills and experience.\n\nNext Steps:\n• Our team will reach out to schedule a technical interview within the next 3-5 business days.\n• Please ensure your availability and prepare for a discussion on your experience and projects.\n• If you have any questions, feel free to reply to this email.\n\nWe look forward to speaking with you soon!\n\nBest regards,\nKam Recruitment Team\nhttps://kamglobal.com`;

  const handleSend = () => {
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); setTimeout(() => { setSent(false); onOpenChange(false); }, 1500); }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-[24px] p-0">
        <div className="bg-gradient-to-r from-[#FF9900] to-[#ff8f5c] p-5 rounded-t-[24px]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-[16px] bg-white/20 flex items-center justify-center"><Mail className="size-5 text-white" /></div>
            <div><h2 className="text-base font-bold text-white">Email Candidate</h2><p className="text-xs text-white/70">Send shortlist notification</p></div>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {sent ? (
            <motion.div className="text-center py-8" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="size-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="size-8 text-green-500" /></div>
              <p className="text-lg font-bold text-[var(--saptta-ink)]">Email Sent!</p>
              <p className="text-sm text-[var(--saptta-mute)]">Notification sent to {candidateEmail}</p>
            </motion.div>
          ) : (
            <>
              <div><label className="text-xs font-medium text-[var(--saptta-mute)] mb-1 block">To</label><Input value={candidateEmail} readOnly className="rounded-xl text-xs h-9 bg-[var(--saptta-bg-2)]" /></div>
              <div><label className="text-xs font-medium text-[var(--saptta-mute)] mb-1 block">Subject</label><Input value={subject} readOnly className="rounded-xl text-xs h-9 bg-[var(--saptta-bg-2)]" /></div>
              <div><label className="text-xs font-medium text-[var(--saptta-mute)] mb-1 block">Body</label><Textarea value={body} readOnly className="rounded-xl text-xs min-h-[180px] bg-[var(--saptta-bg-2)]" /></div>
              <Button className="w-full rounded-full bg-[#FF9900] text-white hover:bg-[#FF9900]/90 h-10" onClick={handleSend} disabled={sending}>
                {sending ? <><Loader2 className="size-4 mr-2 animate-spin" />Sending...</> : <><Send className="size-4 mr-2" />Send Email</>}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────── Resume Analyzer Tab ──────────────── */

function ResumeAnalyzerTab() {
  const [resumeText, setResumeText] = useState("");
  const [selectedJD, setSelectedJD] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandEmail] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileParsing, setFileParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = () => {
    if (!resumeText.trim() || !selectedJD) return;
    const job = MOCK_JOBS.find((j) => j.id === selectedJD);
    if (!job) return;
    setAnalyzing(true);
    setTimeout(() => {
      const res = analyzeResume(resumeText, job.description, job.requirements);
      setResult(res);
      if (!candidateName) {
        const firstLine = resumeText.split("\n")[0]?.trim() || "Candidate";
        setCandidateName(firstLine);
      }
      if (!candidateEmail) {
        const emailMatch = resumeText.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) setCandEmail(emailMatch[0]);
      }
      setAnalyzing(false);
    }, 1200);
  };

  const parseFileViaAPI = async (file: File) => {
    setFileParsing(true);
    setParseError("");
    setUploadedFileName(file.name);

    const fileName = file.name.toLowerCase();

    // For .txt files, read directly on client side (no API needed)
    if (fileName.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        setResumeText(text);
        const firstLine = text.split("\n")[0]?.trim() || "";
        if (firstLine) setCandidateName(firstLine);
        const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) setCandEmail(emailMatch[0]);
        setFileParsing(false);
      };
      reader.onerror = () => {
        setParseError("Failed to read text file.");
        setFileParsing(false);
      };
      reader.readAsText(file);
      return;
    }

    // For .docx / .doc / .pdf — use server-side API
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/recruitment/parse-resume", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        setResumeText(data.text);
        // Auto-detect candidate name from first line
        const firstLine = data.text.split("\n")[0]?.trim() || "";
        if (firstLine && !candidateName) {
          setCandidateName(firstLine);
        }
        // Auto-detect email
        const emailMatch = data.text.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch && !candidateEmail) {
          setCandEmail(emailMatch[0]);
        }
      } else {
        setParseError(data.error || "Failed to parse file");
        // For docx/doc files that failed server parsing, try extracting what we can
        if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
          setParseError("Could not extract text from this DOCX file. The file may be image-based or corrupted. Please try pasting the resume text directly, or upload a .txt or .pdf file instead.");
        }
      }
    } catch (err: any) {
      // Network error — provide helpful message
      if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
        setParseError("Network error while parsing DOCX. Please paste your resume text directly into the text area below, or try again.");
      } else if (fileName.endsWith(".pdf")) {
        setParseError("Network error while parsing PDF. Please paste your resume text directly into the text area below, or try again.");
      } else {
        setParseError("Network error. Please check your connection and try again.");
      }
    } finally {
      setFileParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseFileViaAPI(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      parseFileViaAPI(file);
    }
  };

  const loadMockResume = (id: string) => {
    const mock = MOCK_RESUME_TEXTS.find((m) => m.id === id);
    if (mock) { setResumeText(mock.text); setCandidateName(mock.name); setCandEmail(mock.email); }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Resume Input */}
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <Card className="border-[var(--saptta-line)] rounded-[24px] overflow-hidden">
            <div className="bg-[#FF9900] p-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-[14px] bg-white/20 flex items-center justify-center"><Brain className="size-4 text-white" /></div>
                <div><h3 className="text-sm font-bold text-white">Resume Analyzer</h3><p className="text-[10px] text-white/70">AI-powered resume matching</p></div>
              </div>
            </div>
            <CardContent className="p-4 space-y-4">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-[16px] p-6 text-center transition-all cursor-pointer ${dragOver ? "border-[#FF9900] bg-[#FF990008]" : "border-[var(--saptta-line)] hover:border-[var(--saptta-accent)]/40"}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !fileParsing && fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} />
                {fileParsing ? (
                  <>
                    <Loader2 className="size-7 text-[#FF9900] mx-auto mb-2 animate-spin" />
                    <p className="text-sm font-medium text-[var(--saptta-ink)]">Parsing {uploadedFileName}...</p>
                    <p className="text-[10px] text-[var(--saptta-mute)] mt-1">Extracting text from document</p>
                  </>
                ) : uploadedFileName && !parseError ? (
                  <>
                    <CheckCircle2 className="size-7 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-[var(--saptta-ink)]">{uploadedFileName}</p>
                    <p className="text-[10px] text-green-600 mt-1">File parsed successfully — click to replace</p>
                  </>
                ) : (
                  <>
                    <Upload className="size-7 text-[var(--saptta-mute)] mx-auto mb-2" />
                    <p className="text-sm font-medium text-[var(--saptta-ink)]">Drop resume here or click to upload</p>
                    <p className="text-[10px] text-[var(--saptta-mute)] mt-1">Supports PDF, DOCX, TXT (Max 10MB)</p>
                  </>
                )}
              </div>

              {/* Parse Error */}
              {parseError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="size-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-red-700">File Parse Error</p>
                    <p className="text-[10px] text-red-600 mt-0.5">{parseError}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto h-6 px-2" onClick={() => setParseError("")}>
                    <X className="size-3" />
                  </Button>
                </div>
              )}

              {/* Or paste text */}
              <div>
                <label className="text-xs font-medium text-[var(--saptta-mute)] mb-1.5 block">Or paste resume text</label>
                <Textarea
                  placeholder="Paste resume content here..."
                  className="rounded-xl text-xs min-h-[140px] resize-none"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              </div>

              {/* Quick load mock */}
              <div>
                <p className="text-[10px] text-[var(--saptta-mute)] mb-1.5">Quick demo — load a sample resume:</p>
                <div className="flex flex-wrap gap-1.5">
                  {MOCK_RESUME_TEXTS.map((m) => (
                    <Button key={m.id} variant="outline" size="sm" className="rounded-full text-[9px] h-6 px-2" onClick={() => loadMockResume(m.id)}>
                      {m.name.split(" ")[0]}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: JD Selection + Analyze */}
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <Card className="border-[var(--saptta-line)] rounded-[24px] overflow-hidden h-full">
            <div className="bg-[#0066CC] p-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-[14px] bg-white/20 flex items-center justify-center"><Target className="size-4 text-white" /></div>
                <div><h3 className="text-sm font-bold text-white">Match Against Job</h3><p className="text-[10px] text-white/70">Select JD for comparison</p></div>
              </div>
            </div>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--saptta-mute)] mb-1.5 block">Select Job Description / Role</label>
                <Select value={selectedJD} onValueChange={setSelectedJD}>
                  <SelectTrigger className="rounded-xl h-9 text-xs"><SelectValue placeholder="Choose a job role to match against" /></SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const departments = [...new Set(MOCK_JOBS.map(j => j.department))];
                      return departments.map(dept => (
                        <React.Fragment key={dept}>
                          <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--saptta-mute)]">{dept}</div>
                          {MOCK_JOBS.filter(j => j.department === dept).map(j => (
                            <SelectItem key={j.id} value={j.id} className="text-xs">
                              {j.title} {j.urgent ? "🔴" : ""} — {j.location}
                            </SelectItem>
                          ))}
                        </React.Fragment>
                      ));
                    })()}
                  </SelectContent>
                </Select>
              </div>

              {selectedJD && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--saptta-bg-2)] rounded-xl p-3 space-y-2">
                  {(() => { const job = MOCK_JOBS.find((j) => j.id === selectedJD); if (!job) return null; return (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[var(--saptta-ink)]">{job.title}</p>
                        {job.urgent && <Badge className="bg-red-50 text-red-500 text-[9px] rounded-full border-0 px-1.5 py-0 h-4">Urgent</Badge>}
                      </div>
                      <p className="text-xs text-[var(--saptta-mute)]">{job.location} &middot; {job.salary} &middot; {job.openings} opening{job.openings > 1 ? 's' : ''}</p>
                      <p className="text-xs text-[var(--saptta-ink-2)] mt-1 leading-relaxed">{job.description.slice(0, 150)}...</p>
                      <div className="flex flex-wrap gap-1 mt-1">{job.requirements.slice(0, 4).map((r, i) => (<Badge key={i} variant="outline" className="text-[9px] rounded-full border-0 bg-white px-2 py-0">{r.slice(0, 35)}{r.length > 35 ? '...' : ''}</Badge>))}</div>
                    </>
                  ); })()}
                </motion.div>
              )}

              <Button
                className="w-full rounded-full bg-[#FF9900] text-white hover:bg-[#FF9900]/90 h-10 saptta-btn-fill"
                onClick={handleAnalyze}
                disabled={!resumeText.trim() || !selectedJD || analyzing}
              >
                {analyzing ? <><Loader2 className="size-4 mr-2 animate-spin" />Analyzing Resume...</> : <><Sparkles className="size-4 mr-2" />Analyze Resume</>}
              </Button>

              {/* Stats Preview */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="bg-[var(--saptta-bg-2)] rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-[#FF9900]">{MOCK_JOBS.filter((j) => j.status === "open").length}</p>
                  <p className="text-[9px] text-[var(--saptta-mute)]">Open Jobs</p>
                </div>
                <div className="bg-[var(--saptta-bg-2)] rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-[#0066CC]">{MOCK_RESUME_TEXTS.length}</p>
                  <p className="text-[9px] text-[var(--saptta-mute)]">Sample Resumes</p>
                </div>
                <div className="bg-[var(--saptta-bg-2)] rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-[#003d7a]">75%</p>
                  <p className="text-[9px] text-[var(--saptta-mute)]">Threshold</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5, ease: [0.22, 0.8, 0.22, 1] }}>
            <div className="space-y-4">
              {/* Overall Score + Shortlist Decision */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Overall Match Score */}
                <motion.div variants={scaleIn} initial="hidden" animate="show" className="md:col-span-1">
                  <Card className="border-[var(--saptta-line)] rounded-[24px] saptta-card-glow">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                      <p className="text-xs text-[var(--saptta-mute)] uppercase tracking-wider mb-2">Overall Match Score</p>
                      <div className="relative size-32">
                        <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--saptta-bg-2)" strokeWidth="6" />
                          <motion.circle cx="50" cy="50" r="45" fill="none" stroke={getScoreColor(result.overall)} strokeWidth="6" strokeLinecap="round" strokeDasharray={283} initial={{ strokeDashoffset: 283 }} animate={{ strokeDashoffset: 283 - (283 * result.overall) / 100 }} transition={{ duration: 1.2, ease: [0.22, 0.8, 0.22, 1] }} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div>
                            <span className="text-4xl font-bold" style={{ color: getScoreColor(result.overall) }}>{result.overall}</span>
                            <span className="text-sm font-medium text-[var(--saptta-mute)]">%</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Badge className={`rounded-full text-xs font-bold px-4 py-1 border-0 ${result.overall >= 85 ? "bg-green-50 text-green-600" : result.overall >= 70 ? "bg-lime-50 text-lime-600" : result.overall >= 50 ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-500"}`}>
                          {result.overall >= 85 ? "Excellent Match" : result.overall >= 70 ? "Good Match" : result.overall >= 50 ? "Fair Match" : "Poor Match"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Shortlist Decision */}
                <motion.div variants={scaleIn} initial="hidden" animate="show" className="md:col-span-2">
                  <Card className="border-[var(--saptta-line)] rounded-[24px]">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`size-14 rounded-2xl flex items-center justify-center shrink-0 ${result.shortlisted ? "bg-green-50" : "bg-red-50"}`}>
                          {result.shortlisted ? <CheckCircle2 className="size-7 text-green-500" /> : <X className="size-7 text-red-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge className={`rounded-full text-xs font-bold px-4 py-1 border-0 mb-2 ${result.shortlisted ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                            {result.shortlisted ? "SHORTLISTED" : "NOT SHORTLISTED"}
                          </Badge>
                          <p className="text-sm text-[var(--saptta-ink-2)] leading-relaxed">{result.shortlistReason}</p>
                          {result.shortlisted && (
                            <div className="flex gap-2 mt-4">
                              <Button size="sm" className="rounded-full bg-[#FF9900] text-white hover:bg-[#FF9900]/90 h-8 text-xs px-4" onClick={() => alert("HR notification sent!")}>
                                <Send className="size-3 mr-1.5" />Send to HR
                              </Button>
                              <Button size="sm" variant="outline" className="rounded-full h-8 text-xs px-4" onClick={() => setEmailDialogOpen(true)}>
                                <Mail className="size-3 mr-1.5" />Email Candidate
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Keyword Match + Cosine Similarity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Keyword Match Section */}
                <motion.div variants={fadeUp} initial="hidden" animate="show">
                  <Card className="border-[var(--saptta-line)] rounded-[24px]">
                    <CardHeader className="pb-3 pt-5 px-5"><CardTitle className="text-sm font-semibold text-[var(--saptta-ink)] flex items-center gap-2"><Target className="size-4 text-[#FF9900]" />Keyword Match</CardTitle></CardHeader>
                    <CardContent className="px-5 pb-5 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center"><p className="text-2xl font-bold" style={{ color: getScoreColor(result.keywordMatch.matchPercentage) }}>{result.keywordMatch.matchPercentage}%</p><p className="text-[9px] text-[var(--saptta-mute)]">Match Rate</p></div>
                        <Separator orientation="vertical" className="h-10" />
                        <div className="text-center"><p className="text-lg font-bold text-[var(--saptta-ink)]">{result.keywordMatch.matchedKeywords.length}</p><p className="text-[9px] text-[var(--saptta-mute)]">Matched</p></div>
                        <div className="text-center"><p className="text-lg font-bold text-[var(--saptta-mute)]">{result.keywordMatch.unmatchedKeywords.length}</p><p className="text-[9px] text-[var(--saptta-mute)]">Unmatched</p></div>
                        <div className="text-center"><p className="text-lg font-bold text-[var(--saptta-ink)]">{result.keywordMatch.totalKeywords}</p><p className="text-[9px] text-[var(--saptta-mute)]">Total</p></div>
                      </div>
                      <div className="space-y-2.5">
                        {result.keywordMatch.categoryBreakdown.map((cat) => (
                          <div key={cat.category}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-medium text-[var(--saptta-ink-2)] capitalize">{cat.category}</span>
                              <span className="text-[10px] font-semibold" style={{ color: getScoreColor(cat.percentage) }}>{cat.matched}/{cat.total} ({cat.percentage}%)</span>
                            </div>
                            <div className="h-1.5 bg-[var(--saptta-bg-2)] rounded-full overflow-hidden">
                              <motion.div className="h-full rounded-full" style={{ backgroundColor: getScoreColor(cat.percentage) }} initial={{ width: 0 }} animate={{ width: `${cat.percentage}%` }} transition={{ duration: 0.6, ease: [0.22, 0.8, 0.22, 1] }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Cosine Similarity Section */}
                <motion.div variants={fadeUp} initial="hidden" animate="show">
                  <Card className="border-[var(--saptta-line)] rounded-[24px]">
                    <CardHeader className="pb-3 pt-5 px-5"><CardTitle className="text-sm font-semibold text-[var(--saptta-ink)] flex items-center gap-2"><BarChart3 className="size-4 text-[#0066CC]" />Cosine Similarity</CardTitle></CardHeader>
                    <CardContent className="px-5 pb-5 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center"><p className="text-2xl font-bold" style={{ color: getScoreColor(Math.round(result.cosineSimilarity.score * 100)) }}>{Math.round(result.cosineSimilarity.score * 100)}%</p><p className="text-[9px] text-[var(--saptta-mute)]">Cosine Score</p></div>
                        <Separator orientation="vertical" className="h-10" />
                        <div className="text-center"><p className="text-sm font-bold text-[var(--saptta-ink)]">{result.cosineSimilarity.dotProduct.toFixed(1)}</p><p className="text-[9px] text-[var(--saptta-mute)]">Dot Product</p></div>
                        <div className="text-center"><p className="text-sm font-bold text-[var(--saptta-ink)]">{result.cosineSimilarity.jdVectorMagnitude.toFixed(1)}</p><p className="text-[9px] text-[var(--saptta-mute)]">JD |V|</p></div>
                        <div className="text-center"><p className="text-sm font-bold text-[var(--saptta-ink)]">{result.cosineSimilarity.resumeVectorMagnitude.toFixed(1)}</p><p className="text-[9px] text-[var(--saptta-mute)]">Res |V|</p></div>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-[var(--saptta-ink-2)] mb-2">Top Contributing Terms</p>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {result.cosineSimilarity.topContributingTerms.map((term, i) => {
                            const maxWeight = result.cosineSimilarity.topContributingTerms[0]?.weight || 1;
                            return (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-[10px] text-[var(--saptta-mute)] w-4 text-right">{i + 1}</span>
                                <span className="text-[10px] font-medium text-[var(--saptta-ink)] min-w-[80px] truncate">{term.term}</span>
                                <div className="flex-1 h-1.5 bg-[var(--saptta-bg-2)] rounded-full overflow-hidden">
                                  <motion.div className="h-full rounded-full bg-[#0066CC]" initial={{ width: 0 }} animate={{ width: `${(term.weight / maxWeight) * 100}%` }} transition={{ duration: 0.5, delay: i * 0.03 }} />
                                </div>
                                <span className="text-[9px] text-[var(--saptta-mute)] min-w-[30px] text-right">{term.weight.toFixed(1)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Dimension Scores + Anti-Hallucination */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Dimension Scores */}
                <motion.div variants={fadeUp} initial="hidden" animate="show">
                  <Card className="border-[var(--saptta-line)] rounded-[24px]">
                    <CardHeader className="pb-3 pt-5 px-5"><CardTitle className="text-sm font-semibold text-[var(--saptta-ink)] flex items-center gap-2"><TrendingUp className="size-4 text-[#003d7a]" />Dimension Scores</CardTitle></CardHeader>
                    <CardContent className="px-5 pb-5 space-y-3">
                      {result.dimensionScores.map((dim) => (
                        <div key={dim.dimension} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-[var(--saptta-ink)]">{dim.dimension}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-[var(--saptta-mute)]">Weight: {dim.weight}%</span>
                              <span className="text-xs font-bold" style={{ color: getScoreColor(dim.score) }}>{dim.score}%</span>
                            </div>
                          </div>
                          <div className="h-2 bg-[var(--saptta-bg-2)] rounded-full overflow-hidden">
                            <motion.div className="h-full rounded-full" style={{ backgroundColor: getScoreColor(dim.score) }} initial={{ width: 0 }} animate={{ width: `${dim.score}%` }} transition={{ duration: 0.7, ease: [0.22, 0.8, 0.22, 1] }} />
                          </div>
                          <p className="text-[9px] text-[var(--saptta-mute)]">{dim.details}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Anti-Hallucination Report */}
                <motion.div variants={fadeUp} initial="hidden" animate="show">
                  <Card className="border-[var(--saptta-line)] rounded-[24px]">
                    <CardHeader className="pb-3 pt-5 px-5">
                      <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)] flex items-center gap-2">
                        {result.antiHallucinationReport.riskLevel === "low" ? <ShieldCheck className="size-4 text-green-500" /> : result.antiHallucinationReport.riskLevel === "medium" ? <ShieldAlert className="size-4 text-yellow-500" /> : <ShieldX className="size-4 text-red-500" />}
                        Anti-Hallucination Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center"><p className="text-2xl font-bold" style={{ color: getScoreColor(Math.round(result.antiHallucinationReport.overallConfidence * 100)) }}>{Math.round(result.antiHallucinationReport.overallConfidence * 100)}%</p><p className="text-[9px] text-[var(--saptta-mute)]">Confidence</p></div>
                        <Separator orientation="vertical" className="h-10" />
                        <div className="text-center"><p className="text-sm font-bold text-green-500">{result.antiHallucinationReport.verifiedFacts}</p><p className="text-[9px] text-[var(--saptta-mute)]">Verified</p></div>
                        <div className="text-center"><p className="text-sm font-bold text-yellow-500">{result.antiHallucinationReport.unverifiedFacts}</p><p className="text-[9px] text-[var(--saptta-mute)]">Unverified</p></div>
                        <Badge className={`rounded-full text-[10px] font-bold border-0 ${result.antiHallucinationReport.riskLevel === "low" ? "bg-green-50 text-green-600" : result.antiHallucinationReport.riskLevel === "medium" ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-500"}`}>
                          {result.antiHallucinationReport.riskLevel.toUpperCase()} RISK
                        </Badge>
                      </div>
                      {result.antiHallucinationReport.flaggedItems.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          <p className="text-[10px] font-medium text-[var(--saptta-mute)] uppercase tracking-wider">Flagged Items</p>
                          {result.antiHallucinationReport.flaggedItems.map((flag, i) => (
                            <div key={i} className="flex items-start gap-2 bg-[var(--saptta-bg-2)] rounded-lg p-2.5">
                              <AlertTriangle className={`size-3.5 mt-0.5 shrink-0 ${flag.severity === "critical" ? "text-red-500" : flag.severity === "warning" ? "text-yellow-500" : "text-blue-400"}`} />
                              <div><p className="text-[10px] font-medium text-[var(--saptta-ink)]">{flag.item} <Badge className="text-[8px] rounded-full border-0 px-1 py-0 h-3.5 ml-1" style={{ backgroundColor: flag.severity === "critical" ? "#ef444420" : flag.severity === "warning" ? "#f59e0b20" : "#3b82f620", color: flag.severity === "critical" ? "#ef4444" : flag.severity === "warning" ? "#f59e0b" : "#3b82f6" }}>{flag.severity}</Badge></p><p className="text-[9px] text-[var(--saptta-mute)]">{flag.reason}</p></div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <motion.div variants={fadeUp} initial="hidden" animate="show">
                  <Card className="border-[var(--saptta-line)] rounded-[24px]">
                    <CardHeader className="pb-3 pt-5 px-5"><CardTitle className="text-sm font-semibold text-[var(--saptta-ink)] flex items-center gap-2"><Sparkles className="size-4 text-[#FF9900]" />Recommendations</CardTitle></CardHeader>
                    <CardContent className="px-5 pb-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {result.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-2 bg-[var(--saptta-bg-2)] rounded-xl p-3">
                            <div className="size-5 rounded-full bg-[#FF990015] flex items-center justify-center shrink-0 mt-0.5"><span className="text-[9px] font-bold text-[#FF9900]">{i + 1}</span></div>
                            <p className="text-xs text-[var(--saptta-ink-2)] leading-relaxed">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Dialog */}
      <EmailCandidateDialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen} candidateName={candidateName || "Candidate"} candidateEmail={candidateEmail || "candidate@email.com"} jobTitle={selectedJD ? MOCK_JOBS.find((j) => j.id === selectedJD)?.title || "" : ""} />
    </div>
  );
}

/* ──────────────── Batch Resume Analysis Tab ──────────────── */

function BatchAnalysisTab({ onHighScore }: { onHighScore: (n: HighScoreNotification) => void }) {
  const [selectedJD, setSelectedJD] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<{ id: string; name: string; email: string; result: MatchResult }[]>([]);
  const [filterShortlisted, setFilterShortlisted] = useState(false);
  const [scoreRange, setScoreRange] = useState<string>("all");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailTarget, setEmailTarget] = useState({ name: "", email: "", jobTitle: "" });

  const runBatchAnalysis = () => {
    if (!selectedJD) return;
    const job = MOCK_JOBS.find((j) => j.id === selectedJD);
    if (!job) return;
    setRunning(true);
    setTimeout(() => {
      const batchResults = batchAnalyzeResumes(
        MOCK_RESUME_TEXTS.map((m) => ({ id: m.id, name: m.name, text: m.text })),
        job.description, job.requirements
      );
      const mapped = batchResults.map((r) => ({ id: r.id, name: r.name, email: MOCK_RESUME_TEXTS.find((m) => m.id === r.id)?.email || "", result: r.result }));
      setResults(mapped.sort((a, b) => b.result.overall - a.result.overall));
      setRunning(false);
      // Trigger high-score notifications
      mapped.forEach((r) => {
        if (r.result.overall >= 75) {
          onHighScore({
            id: `notif-${Date.now()}-${r.id}`,
            candidateName: r.name,
            candidateEmail: r.email,
            score: r.result.overall,
            jobTitle: job.title,
            avatar: r.name.split(" ").map((n) => n[0]).join(""),
            timestamp: "Just now",
            read: false,
          });
        }
      });
    }, 2000);
  };

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      if (filterShortlisted && !r.result.shortlisted) return false;
      if (scoreRange === "high" && r.result.overall < 85) return false;
      if (scoreRange === "medium" && (r.result.overall < 70 || r.result.overall >= 85)) return false;
      if (scoreRange === "low" && r.result.overall >= 70) return false;
      return true;
    });
  }, [results, filterShortlisted, scoreRange]);

  const shortlistedCount = results.filter((r) => r.result.shortlisted).length;

  const handleEmailCandidate = (name: string, email: string) => {
    const job = MOCK_JOBS.find((j) => j.id === selectedJD);
    setEmailTarget({ name, email, jobTitle: job?.title || "" });
    setEmailDialogOpen(true);
  };

  const handleBulkEmail = () => {
    const shortlisted = results.filter((r) => r.result.shortlisted);
    alert(`Bulk email sent to ${shortlisted.length} shortlisted candidates: ${shortlisted.map((s) => s.email).join(", ")}`);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedJD} onValueChange={setSelectedJD}>
          <SelectTrigger className="h-9 text-xs rounded-full w-[240px]"><SelectValue placeholder="Select Job Description" /></SelectTrigger>
          <SelectContent>{MOCK_JOBS.filter((j) => j.status === "open").map((j) => (<SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>))}</SelectContent>
        </Select>
        <Button className="rounded-full bg-[#FF9900] text-white hover:bg-[#FF9900]/90 h-9 text-xs px-4" onClick={runBatchAnalysis} disabled={!selectedJD || running}>
          {running ? <><Loader2 className="size-3.5 mr-1.5 animate-spin" />Analyzing...</> : <><Files className="size-3.5 mr-1.5" />Analyze All Resumes</>}
        </Button>
        {results.length > 0 && (
          <>
            <Button variant={filterShortlisted ? "default" : "outline"} size="sm" className={`rounded-full text-xs h-8 ${filterShortlisted ? "bg-green-500 text-white hover:bg-green-500/90" : ""}`} onClick={() => setFilterShortlisted(!filterShortlisted)}>
              <CheckCircle2 className="size-3 mr-1" />Shortlisted Only ({shortlistedCount})
            </Button>
            <Select value={scoreRange} onValueChange={setScoreRange}>
              <SelectTrigger className="h-8 text-xs rounded-full w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="high">High (85+)</SelectItem>
                <SelectItem value="medium">Medium (70-84)</SelectItem>
                <SelectItem value="low">Low (&lt;70)</SelectItem>
              </SelectContent>
            </Select>
            {shortlistedCount > 0 && (
              <Button variant="outline" size="sm" className="rounded-full text-xs h-8" onClick={handleBulkEmail}>
                <Mail className="size-3 mr-1" />Bulk Email Shortlisted ({shortlistedCount})
              </Button>
            )}
          </>
        )}
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <Card className="border-[var(--saptta-line)] rounded-[24px] overflow-hidden">
          <ScrollArea className="max-h-[520px]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[var(--saptta-mute)]">Candidate</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[var(--saptta-mute)]">Overall Score</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[var(--saptta-mute)]">Keyword Match</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[var(--saptta-mute)]">Cosine Similarity</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[var(--saptta-mute)]">Shortlisted</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[var(--saptta-mute)]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((r) => (
                  <TableRow key={r.id} className="hover:bg-[var(--saptta-bg-2)] transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 rounded-lg"><AvatarFallback className="rounded-lg text-[10px] font-bold" style={{ backgroundColor: getScoreBgColor(r.result.overall), color: getScoreColor(r.result.overall) }}>{r.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                        <div><p className="text-sm font-medium text-[var(--saptta-ink)]">{r.name}</p><p className="text-[11px] text-[var(--saptta-mute)]">{r.email}</p></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="flex-1 h-1.5 bg-[var(--saptta-bg-2)] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ backgroundColor: getScoreColor(r.result.overall), width: `${r.result.overall}%` }} /></div>
                        <span className="text-xs font-semibold" style={{ color: getScoreColor(r.result.overall) }}>{r.result.overall}%</span>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-xs font-medium" style={{ color: getScoreColor(r.result.keywordMatch.matchPercentage) }}>{r.result.keywordMatch.matchPercentage}%</span></TableCell>
                    <TableCell><span className="text-xs font-medium" style={{ color: getScoreColor(Math.round(r.result.cosineSimilarity.score * 100)) }}>{Math.round(r.result.cosineSimilarity.score * 100)}%</span></TableCell>
                    <TableCell>
                      <Badge className={`rounded-full text-[10px] font-bold border-0 px-2.5 ${r.result.shortlisted ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                        {r.result.shortlisted ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="size-7 rounded-full p-0" title="View Details"><Eye className="size-3.5 text-[var(--saptta-mute)]" /></Button>
                        {r.result.shortlisted && (
                          <Button variant="ghost" size="sm" className="size-7 rounded-full p-0" title="Email Candidate" onClick={() => handleEmailCandidate(r.name, r.email)}><Mail className="size-3.5 text-[#FF9900]" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}

      {results.length === 0 && !running && (
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardContent className="p-12 text-center">
            <FileUp className="size-12 text-[var(--saptta-mute)] mx-auto mb-4" />
            <p className="text-sm font-medium text-[var(--saptta-ink)]">No analysis results yet</p>
            <p className="text-xs text-[var(--saptta-mute)] mt-1">Select a job and click &quot;Analyze All Resumes&quot; to start batch analysis</p>
          </CardContent>
        </Card>
      )}

      {running && (
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardContent className="p-12 text-center">
            <Loader2 className="size-12 text-[#FF9900] mx-auto mb-4 animate-spin" />
            <p className="text-sm font-medium text-[var(--saptta-ink)]">Analyzing {MOCK_RESUME_TEXTS.length} resumes...</p>
            <p className="text-xs text-[var(--saptta-mute)] mt-1">Running keyword matching, cosine similarity, and anti-hallucination checks</p>
          </CardContent>
        </Card>
      )}

      <EmailCandidateDialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen} candidateName={emailTarget.name} candidateEmail={emailTarget.email} jobTitle={emailTarget.jobTitle} />
    </div>
  );
}

/* ──────────────── Pipeline Tab (Kanban) ──────────────── */

function PipelineTab({ candidates, onMoveStage }: { candidates: Candidate[]; onMoveStage: (id: string, stage: PipelineStage) => void }) {
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (jobFilter !== "all" && c.jobId !== jobFilter) return false;
      if (sourceFilter !== "all" && c.source !== sourceFilter) return false;
      return true;
    });
  }, [candidates, jobFilter, sourceFilter]);

  const grouped = useMemo(() => {
    const map: Record<PipelineStage, Candidate[]> = { sourced: [], screening: [], interview: [], assessment: [], offer: [], hired: [], rejected: [] };
    filtered.forEach((c) => map[c.stage].push(c));
    return map;
  }, [filtered]);

  const sources = useMemo(() => [...new Set(candidates.map((c) => c.source))], [candidates]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2"><Filter className="size-4 text-[var(--saptta-mute)]" /><span className="text-xs text-[var(--saptta-mute)] font-medium">Filters:</span></div>
        <Select value={jobFilter} onValueChange={setJobFilter}>
          <SelectTrigger className="h-8 text-xs rounded-full w-[200px]"><SelectValue placeholder="All Jobs" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Jobs</SelectItem>{MOCK_JOBS.map((j) => (<SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>))}</SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="h-8 text-xs rounded-full w-[160px]"><SelectValue placeholder="All Sources" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Sources</SelectItem>{sources.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
        </Select>
        <Badge variant="outline" className="rounded-full text-[10px] px-3">{filtered.length} candidates</Badge>
      </div>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-[1200px]">
          {STAGE_ORDER.map((stage) => {
            const cfg = STAGE_CONFIG[stage];
            const stageCandidates = grouped[stage];
            return (
              <div key={stage} className="flex-1 min-w-[160px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2"><div className="size-2.5 rounded-full" style={{ backgroundColor: cfg.color }} /><span className="text-xs font-semibold text-[var(--saptta-ink)]">{cfg.label}</span></div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>{stageCandidates.length}</span>
                </div>
                <div className="space-y-2 min-h-[120px]">
                  <AnimatePresence mode="popLayout">
                    {stageCandidates.map((c) => (
                      <motion.div key={c.id} layout initial={{ opacity: 0, scale: 0.9, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -8 }} transition={{ duration: 0.3, ease: [0.22, 0.8, 0.22, 1] }}>
                        <Card className="border-[var(--saptta-line)] rounded-[16px] cursor-pointer hover:shadow-md transition-all duration-300 hover:border-[var(--saptta-accent)]/30 group" onClick={() => { setSelectedCandidate(c); setDetailOpen(true); }}>
                          <CardContent className="p-3 space-y-2.5">
                            <div className="flex items-center gap-2">
                              <Avatar className="size-7 rounded-lg"><AvatarFallback className="rounded-lg text-[10px] font-bold" style={{ backgroundColor: getScoreBgColor(c.matchScore), color: getScoreColor(c.matchScore) }}>{c.avatar}</AvatarFallback></Avatar>
                              <div className="min-w-0 flex-1"><p className="text-xs font-semibold text-[var(--saptta-ink)] truncate">{c.name}</p><p className="text-[10px] text-[var(--saptta-mute)] truncate">{c.role}</p></div>
                            </div>
                            <ScoreBar value={c.matchScore} />
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-[9px] rounded-full h-5 px-1.5 border-0" style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>{c.source}</Badge>
                              <span className="text-[10px] text-[var(--saptta-mute)] flex items-center gap-0.5"><Clock className="size-2.5" /> {c.daysInStage}d</span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex gap-1">
                                {STAGE_ORDER.filter((s) => s !== c.stage && s !== "rejected").slice(0, 3).map((s) => {
                                  const sc = STAGE_CONFIG[s];
                                  const nextIdx = STAGE_ORDER.indexOf(c.stage) + 1;
                                  if (STAGE_ORDER.indexOf(s) !== nextIdx) return null;
                                  return (
                                    <Button key={s} variant="ghost" size="sm" className="h-5 text-[9px] rounded-full px-2 w-full" style={{ backgroundColor: sc.bgColor, color: sc.color }} onClick={(e) => { e.stopPropagation(); onMoveStage(c.id, s); }}>
                                      <ArrowRight className="size-2.5 mr-0.5" />{sc.label}
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <CandidateDetailDialog candidate={selectedCandidate} open={detailOpen} onOpenChange={setDetailOpen} onMoveStage={onMoveStage} />
    </div>
  );
}

/* ──────────────── AI Job Role Templates ──────────────── */

const AI_JOB_TEMPLATES: { label: string; data: Omit<JobPosting, "id" | "applicants" | "daysOpen" | "postedDate"> }[] = [
  {
    label: "AI Developer - Fresher",
    data: {
      title: "AI Developer - Fresher",
      department: "AI & Machine Learning",
      location: "Bangalore, IN",
      type: "Full-time",
      status: "draft",
      openings: 3,
      salary: "₹6-10 LPA",
      urgent: false,
      hiringManager: "Rajesh Kumar",
      description: "We are looking for passionate freshers who want to build intelligent systems. You will work alongside senior AI engineers on real-world ML/AI projects, learning cutting-edge technologies like deep learning, NLP, and computer vision from day one.",
      requirements: ["0-1 years of experience (freshers welcome)", "B.Tech/M.Tech in Computer Science, AI/ML, or related field", "Strong fundamentals in Python, mathematics, and statistics", "Familiarity with machine learning concepts", "Knowledge of NumPy, Pandas, scikit-learn is a plus", "Good problem-solving and analytical skills"],
      responsibilities: ["Assist in building and training ML models", "Perform data preprocessing and feature engineering", "Write clean, well-documented Python code for AI pipelines", "Participate in code reviews and knowledge-sharing sessions", "Contribute to research on new AI approaches"],
      experienceLevel: "fresher",
      skills: ["Python", "Machine Learning", "Deep Learning", "NumPy", "Pandas", "scikit-learn", "TensorFlow/PyTorch", "SQL", "Git"],
      benefits: ["Comprehensive AI/ML training program", "Mentorship from senior AI engineers", "Health insurance", "Flexible work hours", "Learning budget"],
    },
  },
  {
    label: "AI Developer (2+ Years)",
    data: {
      title: "AI Developer (2+ Years Exp)",
      department: "AI & Machine Learning",
      location: "Bangalore, IN (Hybrid)",
      type: "Full-time",
      status: "draft",
      openings: 2,
      salary: "₹15-25 LPA",
      urgent: false,
      hiringManager: "Rajesh Kumar",
      description: "We are looking for an experienced AI Developer with 2+ years of hands-on experience building and deploying ML models in production. You will design ML pipelines, fine-tune LLMs, and build intelligent features for our AI-driven HRMS platform.",
      requirements: ["2-5 years of experience in AI/ML development", "Strong proficiency in Python and ML frameworks (TensorFlow, PyTorch)", "Experience with NLP, LLMs, and transformer architectures", "Hands-on with model deployment (Docker, Kubernetes, MLflow)", "Understanding of cloud platforms (AWS SageMaker, GCP Vertex AI)", "Experience with MLOps practices"],
      responsibilities: ["Design, train, and deploy production ML models", "Fine-tune and integrate large language models", "Build robust data pipelines for model training and inference", "Implement MLOps best practices", "Collaborate with product teams on AI feature roadmaps", "Mentor junior AI developers"],
      experienceLevel: "2-5",
      skills: ["Python", "TensorFlow", "PyTorch", "NLP", "LLMs", "Transformers", "Docker", "Kubernetes", "MLflow", "AWS SageMaker", "MLOps"],
      benefits: ["Competitive salary with ESOPs", "Remote-first culture", "Health insurance", "Annual learning budget ₹2 Lakhs", "Sponsored conference attendance"],
    },
  },
  {
    label: "Senior AI Developer (5-10 Years)",
    data: {
      title: "Senior AI Developer (5-10 Years Exp)",
      department: "AI & Machine Learning",
      location: "Bangalore, IN (Remote)",
      type: "Full-time",
      status: "draft",
      openings: 1,
      salary: "₹30-50 LPA",
      urgent: false,
      hiringManager: "Rajesh Kumar",
      description: "Lead our AI strategy and architecture. We need a seasoned AI professional who can drive innovation, architect large-scale ML systems, and mentor a growing team of AI engineers. You will own the end-to-end AI roadmap for our HRMS platform.",
      requirements: ["5-10 years of experience in AI/ML with 2+ years in leadership", "Deep expertise in NLP, computer vision, and generative AI", "Proven track record of deploying ML systems at scale", "Expert-level Python with strong systems design skills", "Experience with LLM fine-tuning (LoRA, QLoRA), RAG pipelines", "Strong understanding of AI ethics and responsible AI"],
      responsibilities: ["Define and execute the AI/ML technical roadmap", "Architect scalable ML infrastructure", "Lead research on cutting-edge AI techniques", "Build and mentor a team of AI developers", "Collaborate with C-suite on AI strategy", "Ensure AI compliance with regulations"],
      experienceLevel: "5-10",
      skills: ["Python", "TensorFlow", "PyTorch", "LLMs", "RAG", "Transformers", "Computer Vision", "MLOps", "Kubernetes", "AWS/GCP", "System Design", "AI Ethics", "Leadership"],
      benefits: ["₹30-50 LPA + ESOPs", "VP-level title", "Dedicated research budget", "Full remote flexibility", "Premium health insurance", "International conference sponsorship"],
    },
  },
  {
    label: "ML Engineer",
    data: {
      title: "Machine Learning Engineer",
      department: "AI & Machine Learning",
      location: "Pune, IN",
      type: "Full-time",
      status: "draft",
      openings: 2,
      salary: "₹18-30 LPA",
      urgent: false,
      hiringManager: "Rajesh Kumar",
      description: "Build and optimize ML systems that power our intelligent HRMS platform. You will focus on model deployment, serving infrastructure, and building robust ML pipelines.",
      requirements: ["3+ years in ML engineering", "Strong Python and systems programming skills", "Experience with model serving (TensorFlow Serving, Triton)", "Knowledge of distributed computing (Spark, Ray)", "Experience with cloud ML platforms", "Understanding of model optimization (quantization, distillation)"],
      responsibilities: ["Build and optimize ML serving infrastructure", "Implement model training pipelines", "Design A/B testing frameworks for ML models", "Optimize model inference for latency and cost", "Implement monitoring and alerting for ML systems"],
      experienceLevel: "3-5",
      skills: ["Python", "TensorFlow", "PyTorch", "Docker", "Kubernetes", "MLflow", "Spark", "Ray", "AWS/GCP", "CI/CD"],
      benefits: ["Competitive salary", "Health insurance", "Learning budget", "Flexible work hours"],
    },
  },
  {
    label: "Data Scientist",
    data: {
      title: "Data Scientist - AI Team",
      department: "AI & Machine Learning",
      location: "Hyderabad, IN (Hybrid)",
      type: "Full-time",
      status: "draft",
      openings: 1,
      salary: "₹20-35 LPA",
      urgent: false,
      hiringManager: "Rajesh Kumar",
      description: "Join our AI team as a Data Scientist to extract insights from HR data, build predictive models, and drive data-informed decision making across the platform.",
      requirements: ["3+ years in data science", "Strong statistics and experimental design skills", "Proficiency in Python, SQL, and BI tools", "Experience with A/B testing and causal inference", "Knowledge of HR analytics domain is a plus"],
      responsibilities: ["Build predictive models for attrition, performance, and hiring", "Design and analyze A/B tests", "Create dashboards and reports for stakeholders", "Collaborate with AI engineers on model features", "Present findings to leadership"],
      experienceLevel: "3-5",
      skills: ["Python", "SQL", "Statistics", "A/B Testing", "Tableau/PowerBI", "Pandas", "scikit-learn", "Experiment Design"],
      benefits: ["Competitive salary", "Health insurance", "Conference budget", "Flexible work hours"],
    },
  },
  {
    label: "Prompt Engineer",
    data: {
      title: "Prompt Engineer / AI Specialist",
      department: "AI & Machine Learning",
      location: "Delhi, IN (Remote)",
      type: "Full-time",
      status: "draft",
      openings: 2,
      salary: "₹12-22 LPA",
      urgent: false,
      hiringManager: "Kavitha Reddy",
      description: "Design and optimize prompts for LLM-powered features in our HRMS platform. You will work at the intersection of AI research and product development, crafting prompts that deliver accurate, reliable, and bias-free results.",
      requirements: ["1+ years working with LLMs (GPT, Claude, Llama, Mistral)", "Strong written communication and analytical skills", "Understanding of prompt engineering techniques (chain-of-thought, few-shot, RAG)", "Experience with API integrations and evaluation frameworks", "Basic Python skills"],
      responsibilities: ["Design and test prompts for resume parsing, JD generation, and candidate matching", "Build evaluation frameworks for LLM outputs", "Optimize prompts for accuracy, speed, and cost", "Document prompt strategies and best practices", "Collaborate with AI engineers on model fine-tuning"],
      experienceLevel: "1-3",
      skills: ["Prompt Engineering", "LLMs", "RAG", "Python", "API Integration", "Evaluation Frameworks", "NLP", "Technical Writing"],
      benefits: ["Competitive salary", "Health insurance", "Learning budget", "Flexible work hours"],
    },
  },
  {
    label: "Frontend Developer",
    data: {
      title: "Frontend Developer",
      department: "Engineering",
      location: "Bangalore, IN",
      type: "Full-time",
      status: "draft",
      openings: 2,
      salary: "₹12-22 LPA",
      urgent: false,
      hiringManager: "Rajesh Kumar",
      description: "We're looking for a skilled Frontend Developer to build beautiful, responsive, and accessible web interfaces for our HRMS platform using React, Next.js, and TypeScript.",
      requirements: ["2+ years of frontend development experience", "Proficiency in React, Next.js, and TypeScript", "Experience with state management (Redux, Zustand)", "Understanding of responsive design and accessibility", "Knowledge of Git and CI/CD"],
      responsibilities: ["Build and maintain React/Next.js components", "Implement responsive designs from Figma mockups", "Optimize application performance", "Write unit and integration tests", "Collaborate with backend and design teams"],
      experienceLevel: "2-5",
      skills: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "Redux", "Git", "REST API", "HTML", "CSS"],
      benefits: ["Competitive salary", "Health insurance", "Learning budget", "Flexible work hours"],
    },
  },
  {
    label: "Backend Developer",
    data: {
      title: "Backend Developer",
      department: "Engineering",
      location: "Pune, IN",
      type: "Full-time",
      status: "draft",
      openings: 2,
      salary: "₹14-25 LPA",
      urgent: false,
      hiringManager: "Rajesh Kumar",
      description: "Join our backend team to design and build scalable APIs, microservices, and database systems that power our HRMS platform.",
      requirements: ["3+ years of backend development experience", "Expert in Node.js or Python", "Experience with SQL and NoSQL databases", "Knowledge of microservices and REST API design", "Familiarity with cloud platforms (AWS/GCP)"],
      responsibilities: ["Design and implement RESTful APIs", "Build scalable microservices", "Optimize database queries and schema", "Implement authentication and security", "Write unit and integration tests"],
      experienceLevel: "3-5",
      skills: ["Node.js", "Python", "PostgreSQL", "MongoDB", "Docker", "AWS", "REST API", "Git", "Redis", "CI/CD"],
      benefits: ["Competitive salary", "Health insurance", "Learning budget", "Flexible work hours"],
    },
  },
  {
    label: "Product Designer",
    data: {
      title: "Product Designer",
      department: "Design",
      location: "Delhi, IN (Hybrid)",
      type: "Full-time",
      status: "draft",
      openings: 1,
      salary: "₹18-30 LPA",
      urgent: false,
      hiringManager: "Kavitha Reddy",
      description: "Craft intuitive, beautiful experiences for our HRMS platform. You will work closely with product managers and engineers to ship features that delight users.",
      requirements: ["4+ years of product design experience", "Proficiency in Figma", "Strong portfolio showcasing UX/UI work", "Experience with design systems and accessibility", "Understanding of user research methods"],
      responsibilities: ["Design end-to-end user flows", "Maintain and evolve our design system", "Conduct user research and usability testing", "Create interactive prototypes", "Present designs to stakeholders"],
      experienceLevel: "3-5",
      skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Accessibility", "Wireframing", "UI/UX", "Responsive Design"],
      benefits: ["Competitive salary", "Health insurance", "Conference budget", "Flexible work hours"],
    },
  },
  {
    label: "DevOps Engineer",
    data: {
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Bangalore, IN (Remote)",
      type: "Full-time",
      status: "draft",
      openings: 1,
      salary: "₹20-35 LPA",
      urgent: false,
      hiringManager: "Rajesh Kumar",
      description: "Help us scale our infrastructure and ensure 99.9% uptime for our HRMS platform. You will design CI/CD pipelines, manage cloud infrastructure, and automate everything.",
      requirements: ["4+ years in DevOps/SRE", "Expert in AWS or GCP", "Experience with Kubernetes, Docker, Terraform", "Strong scripting skills (Bash, Python)", "Knowledge of monitoring and alerting tools"],
      responsibilities: ["Design and maintain CI/CD pipelines", "Manage cloud infrastructure with IaC", "Implement monitoring and alerting", "Automate deployment processes", "Ensure system reliability and security"],
      experienceLevel: "3-5",
      skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Python", "Bash", "Monitoring", "Linux", "Git"],
      benefits: ["Competitive salary", "Health insurance", "Remote-first", "Learning budget"],
    },
  },
  {
    label: "Data Analyst",
    data: {
      title: "Data Analyst",
      department: "Analytics",
      location: "Mumbai, IN",
      type: "Full-time",
      status: "draft",
      openings: 1,
      salary: "₹10-18 LPA",
      urgent: false,
      hiringManager: "Srinivas M",
      description: "Join our analytics team to turn data into actionable insights. You will analyze HR data, build dashboards, and help drive data-informed decision making.",
      requirements: ["2+ years in data analysis", "Proficiency in SQL, Python, and Excel", "Experience with BI tools (Tableau, Power BI)", "Strong analytical and problem-solving skills", "Understanding of statistics"],
      responsibilities: ["Analyze HR data and create reports", "Build dashboards for stakeholders", "Perform ad-hoc analysis", "Identify trends and patterns", "Support data-driven decision making"],
      experienceLevel: "1-3",
      skills: ["SQL", "Python", "Tableau", "Power BI", "Excel", "Statistics", "Data Analytics", "ETL"],
      benefits: ["Competitive salary", "Health insurance", "Learning budget", "Flexible work hours"],
    },
  },
];

const EXPERIENCE_LEVEL_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  fresher: { label: "Fresher", color: "#22c55e", bgColor: "#22c55e15" },
  "0-1": { label: "0-1 Years", color: "#22c55e", bgColor: "#22c55e15" },
  "1-3": { label: "1-3 Years", color: "#0066CC", bgColor: "#0066CC20" },
  "2-5": { label: "2-5 Years", color: "#0066CC", bgColor: "#0066CC20" },
  "3-5": { label: "3-5 Years", color: "#FF9900", bgColor: "#FF990015" },
  "5-10": { label: "5-10 Years", color: "#FF9900", bgColor: "#FF990015" },
  "10+": { label: "10+ Years", color: "#ef4444", bgColor: "#ef444415" },
  mid: { label: "Mid-Level", color: "#0066CC", bgColor: "#0066CC20" },
  senior: { label: "Senior", color: "#FF9900", bgColor: "#FF990015" },
  lead: { label: "Lead", color: "#8b5cf6", bgColor: "#8b5cf615" },
  executive: { label: "Executive", color: "#ef4444", bgColor: "#ef444415" },
};

/* ──────────────── Create/Edit Job Dialog ──────────────── */

function CreateEditJobDialog({
  open,
  onOpenChange,
  onSave,
  editJob,
  jobs,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (job: JobPosting) => void;
  editJob: JobPosting | null;
  jobs: JobPosting[];
}) {
  const isEdit = !!editJob;
  const [step, setStep] = useState<"template" | "form">(isEdit ? "form" : "template");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [skillInput, setSkillInput] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [formData, setFormData] = useState<Partial<JobPosting>>(isEdit && editJob ? {
    title: editJob.title,
    department: editJob.department,
    location: editJob.location,
    type: editJob.type,
    status: editJob.status,
    openings: editJob.openings,
    salary: editJob.salary,
    urgent: editJob.urgent,
    hiringManager: editJob.hiringManager,
    description: editJob.description,
    requirements: [...editJob.requirements],
    responsibilities: [...editJob.responsibilities],
    experienceLevel: editJob.experienceLevel || "mid",
    skills: editJob.skills ? [...editJob.skills] : [],
    benefits: editJob.benefits ? [...editJob.benefits] : [""],
  } : {
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    status: "draft",
    openings: 1,
    salary: "",
    urgent: false,
    hiringManager: "",
    description: "",
    requirements: [""],
    responsibilities: [""],
    experienceLevel: "mid",
    skills: [],
    benefits: [""],
  });

  // Handle skill input with auto-suggestions
  const handleSkillInputChange = (value: string) => {
    setSkillInput(value);
    if (value.trim().length > 0) {
      const q = value.toLowerCase();
      const currentSkills = formData.skills || [];
      const filtered = AI_ML_SKILL_SUGGESTIONS.filter(
        s => s.toLowerCase().includes(q) && !currentSkills.includes(s)
      ).slice(0, 8);
      setSkillSuggestions(filtered);
      setShowSkillSuggestions(filtered.length > 0);
    } else {
      setSkillSuggestions([]);
      setShowSkillSuggestions(false);
    }
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !(formData.skills || []).includes(trimmed)) {
      setFormData(prev => ({ ...prev, skills: [...(prev.skills || []), trimmed] }));
    }
    setSkillInput("");
    setSkillSuggestions([]);
    setShowSkillSuggestions(false);
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: (prev.skills || []).filter(s => s !== skill) }));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = AI_JOB_TEMPLATES.find((t) => t.label === templateId);
    if (template) {
      setFormData({
        ...template.data,
        requirements: [...template.data.requirements],
        responsibilities: [...template.data.responsibilities],
        skills: template.data.skills ? [...template.data.skills] : [""],
        benefits: template.data.benefits ? [...template.data.benefits] : [""],
      });
      setSelectedTemplate(templateId);
      setStep("form");
    }
  };

  const startFromScratch = () => {
    setSelectedTemplate("");
    setStep("form");
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateListItem = (field: "requirements" | "responsibilities" | "skills" | "benefits", index: number, value: string) => {
    setFormData((prev) => {
      const list = [...(prev[field] || [])];
      list[index] = value;
      return { ...prev, [field]: list };
    });
  };

  const addListItem = (field: "requirements" | "responsibilities" | "skills" | "benefits") => {
    setFormData((prev) => ({ ...prev, [field]: [...(prev[field] || []), ""] }));
  };

  const removeListItem = (field: "requirements" | "responsibilities" | "skills" | "benefits", index: number) => {
    setFormData((prev) => {
      const list = [...(prev[field] || [])];
      list.splice(index, 1);
      return { ...prev, [field]: list.length ? list : [""] };
    });
  };

  const handleSave = () => {
    if (!formData.title?.trim() || !formData.department?.trim()) return;
    const job: JobPosting = {
      id: editJob?.id || `j${Date.now()}`,
      title: formData.title!.trim(),
      department: formData.department!.trim(),
      location: formData.location || "Bangalore, IN",
      type: formData.type || "Full-time",
      status: formData.status || "draft",
      openings: formData.openings || 1,
      applicants: editJob?.applicants || 0,
      daysOpen: editJob?.daysOpen || 0,
      salary: formData.salary || "Competitive",
      postedDate: editJob?.postedDate || new Date().toISOString().split("T")[0],
      urgent: formData.urgent || false,
      hiringManager: formData.hiringManager || "Rajesh Kumar",
      description: formData.description || "",
      requirements: (formData.requirements || []).filter((r) => r.trim()),
      responsibilities: (formData.responsibilities || []).filter((r) => r.trim()),
      experienceLevel: formData.experienceLevel as ExperienceLevel,
      skills: (formData.skills || []).filter((s) => s.trim()),
      benefits: (formData.benefits || []).filter((b) => b.trim()),
    };
    onSave(job);
    onOpenChange(false);
  };

  const isValid = formData.title?.trim() && formData.department?.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-[24px] p-0">
        {/* Header */}
        <div className="bg-[#FF9900] p-5 rounded-t-[24px]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-[16px] bg-white/20 flex items-center justify-center">
              {isEdit ? <Files className="size-5 text-white" /> : <Plus className="size-5 text-white" />}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white">{isEdit ? "Edit Job Role" : "Create New Job Role"}</DialogTitle>
              <DialogDescription className="text-xs text-white/70">{isEdit ? "Update job details and requirements" : "Add a new position to your hiring pipeline"}</DialogDescription>
            </div>
          </div>
        </div>

        {step === "template" && !isEdit ? (
          /* Template Selection Step */
          <div className="p-5 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-1">Choose a Template</h3>
              <p className="text-xs text-[var(--saptta-mute)]">Start with a pre-built role template or create from scratch</p>
            </div>

            {/* Group templates by department */}
            {Object.entries(
              AI_JOB_TEMPLATES.reduce((groups, t) => {
                const dept = t.data.department;
                if (!groups[dept]) groups[dept] = [];
                groups[dept].push(t);
                return groups;
              }, {} as Record<string, typeof AI_JOB_TEMPLATES>)
            ).map(([dept, templates]) => (
              <div key={dept} className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--saptta-mute)]">{dept}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {templates.map((template) => {
                  const expCfg = EXPERIENCE_LEVEL_CONFIG[template.data.experienceLevel || "mid"];
                  return (
                    <motion.div
                      key={template.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Card
                        className={`border-2 cursor-pointer transition-all hover:shadow-md rounded-[16px] ${selectedTemplate === template.label ? "border-[#FF9900] bg-[#FF990008]" : "border-[var(--saptta-line)] hover:border-[#FF9900]/40"}`}
                        onClick={() => applyTemplate(template.label)}
                      >
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-semibold text-[var(--saptta-ink)]">{template.data.title}</h4>
                            <Badge className="rounded-full text-[9px] border-0 px-2 py-0 h-4 shrink-0 ml-2" style={{ backgroundColor: expCfg.bgColor, color: expCfg.color }}>
                              {expCfg.label}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-[var(--saptta-mute)] line-clamp-2">{template.data.description.slice(0, 100)}...</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] text-[var(--saptta-mute)] flex items-center gap-0.5"><MapPin className="size-2.5" />{template.data.location}</span>
                            <span className="text-[9px] text-[var(--saptta-mute)] flex items-center gap-0.5"><IndianRupee className="size-2.5" />{template.data.salary}</span>
                          </div>
                          {template.data.skills && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {template.data.skills.slice(0, 5).map((skill) => (
                                <Badge key={skill} variant="outline" className="text-[8px] rounded-full px-1.5 py-0 h-4 border-[var(--saptta-line)]">{skill}</Badge>
                              ))}
                              {template.data.skills.length > 5 && (
                                <Badge variant="outline" className="text-[8px] rounded-full px-1.5 py-0 h-4 border-[var(--saptta-line)]">+{template.data.skills.length - 5}</Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
                </div>
              </div>
            ))}

            <Separator />

            {/* Start from scratch */}
            <Button variant="outline" className="w-full rounded-full h-10 border-dashed border-2" onClick={startFromScratch}>
              <Plus className="size-4 mr-2" />Create from Scratch
            </Button>
          </div>
        ) : (
          /* Form Step */
          <div className="p-5 space-y-5">
            {/* Back button when creating */}
            {!isEdit && (
              <Button variant="ghost" size="sm" className="rounded-full text-xs -ml-2 mb-2" onClick={() => setStep("template")}>
                <ChevronRight className="size-3 mr-1 rotate-180" />Back to Templates
              </Button>
            )}

            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--saptta-ink)]">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-medium text-[var(--saptta-mute)] mb-1 block">Job Title *</label>
                  <Input
                    placeholder="e.g., AI Developer - Fresher"
                    className="rounded-xl h-9 text-xs"
                    value={formData.title || ""}
                    onChange={(e) => updateField("title", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[var(--saptta-mute)] mb-1 block">Department *</label>
                  <Select value={formData.department || ""} onValueChange={(v) => updateField("department", v)}>
                    <SelectTrigger className="rounded-xl h-9 text-xs"><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {["AI & Machine Learning", "Engineering", "Design", "Sales", "Marketing", "Analytics", "HR & Admin", "Finance", "Operations", "Product"].map((d) => (
                        <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[var(--saptta-mute)] mb-1 block">Experience Level</label>
                  <Select value={formData.experienceLevel || "mid"} onValueChange={(v) => updateField("experienceLevel", v)}>
                    <SelectTrigger className="rounded-xl h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(EXPERIENCE_LEVEL_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key} className="text-xs">{cfg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[var(--saptta-mute)] mb-1 block">Location</label>
                  <Input placeholder="e.g., Bangalore, IN" className="rounded-xl h-9 text-xs" value={formData.location || ""} onChange={(e) => updateField("location", e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[var(--saptta-mute)] mb-1 block">Job Type</label>
                  <Select value={formData.type || "Full-time"} onValueChange={(v) => updateField("type", v)}>
                    <SelectTrigger className="rounded-xl h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Full-time", "Part-time", "Contract", "Internship", "Freelance"].map((t) => (
                        <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[var(--saptta-mute)] mb-1 block">Salary Range</label>
                  <Input placeholder="e.g., ₹15-25 LPA" className="rounded-xl h-9 text-xs" value={formData.salary || ""} onChange={(e) => updateField("salary", e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[var(--saptta-mute)] mb-1 block">Openings</label>
                  <Input type="number" min={1} className="rounded-xl h-9 text-xs" value={formData.openings || 1} onChange={(e) => updateField("openings", parseInt(e.target.value) || 1)} />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[var(--saptta-mute)] mb-1 block">Hiring Manager</label>
                  <Input placeholder="e.g., Rajesh Kumar" className="rounded-xl h-9 text-xs" value={formData.hiringManager || ""} onChange={(e) => updateField("hiringManager", e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[var(--saptta-mute)] mb-1 block">Status</label>
                  <Select value={formData.status || "draft"} onValueChange={(v) => updateField("status", v)}>
                    <SelectTrigger className="rounded-xl h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(JOB_STATUS_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key} className="text-xs">{cfg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <Switch checked={formData.urgent || false} onCheckedChange={(v) => updateField("urgent", v)} />
                  <label className="text-xs text-[var(--saptta-ink)]">Urgent Position</label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--saptta-ink)]">Job Description</h3>
              <Textarea
                placeholder="Describe the role, team, and what makes this opportunity exciting..."
                className="rounded-xl text-xs min-h-[120px] resize-none"
                value={formData.description || ""}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>

            <Separator />

            {/* Requirements */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--saptta-ink)]">Requirements</h3>
                <Button variant="outline" size="sm" className="rounded-full text-[10px] h-6 px-2" onClick={() => addListItem("requirements")}>
                  <Plus className="size-3 mr-1" />Add
                </Button>
              </div>
              <div className="space-y-2">
                {(formData.requirements || [""]).map((req, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--saptta-mute)] w-4 shrink-0">{i + 1}.</span>
                    <Input placeholder="e.g., 3+ years of experience in..." className="rounded-xl h-8 text-xs flex-1" value={req} onChange={(e) => updateListItem("requirements", i, e.target.value)} />
                    <Button variant="ghost" size="sm" className="size-7 shrink-0 rounded-full" onClick={() => removeListItem("requirements", i)}>
                      <X className="size-3 text-[var(--saptta-mute)]" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Responsibilities */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--saptta-ink)]">Responsibilities</h3>
                <Button variant="outline" size="sm" className="rounded-full text-[10px] h-6 px-2" onClick={() => addListItem("responsibilities")}>
                  <Plus className="size-3 mr-1" />Add
                </Button>
              </div>
              <div className="space-y-2">
                {(formData.responsibilities || [""]).map((resp, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--saptta-mute)] w-4 shrink-0">{i + 1}.</span>
                    <Input placeholder="e.g., Design and build ML pipelines..." className="rounded-xl h-8 text-xs flex-1" value={resp} onChange={(e) => updateListItem("responsibilities", i, e.target.value)} />
                    <Button variant="ghost" size="sm" className="size-7 shrink-0 rounded-full" onClick={() => removeListItem("responsibilities", i)}>
                      <X className="size-3 text-[var(--saptta-mute)]" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Skills */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--saptta-ink)]">Skills</h3>
              <div className="space-y-2">
                {/* Selected skills as tags */}
                <div className="flex flex-wrap gap-1.5">
                  {(formData.skills || []).map((skill, i) => (
                    <Badge key={i} className="rounded-full text-[10px] font-medium border-0 px-2.5 py-0.5 bg-[#FF990015] text-[#FF9900] hover:bg-[#FF990025] cursor-pointer" onClick={() => removeSkill(skill)}>
                      {skill}
                      <X className="size-2.5 ml-1" />
                    </Badge>
                  ))}
                </div>
                {/* Skill input with auto-suggestions */}
                <div className="relative">
                  <Input
                    placeholder="Type a skill (e.g., Python, ML, Docker) and press Enter..."
                    className="rounded-xl h-9 text-xs"
                    value={skillInput}
                    onChange={(e) => handleSkillInputChange(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    onFocus={() => { if (skillSuggestions.length > 0) setShowSkillSuggestions(true); }}
                    onBlur={() => { setTimeout(() => setShowSkillSuggestions(false), 200); }}
                  />
                  {showSkillSuggestions && skillSuggestions.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[var(--saptta-line)] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {skillSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--saptta-bg-2)] transition-colors"
                          onMouseDown={(e) => { e.preventDefault(); addSkill(suggestion); }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-[var(--saptta-mute)]">Press Enter or click a suggestion to add. Click a tag to remove.</p>
              </div>
            </div>

            <Separator />

            {/* Benefits */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--saptta-ink)]">Benefits</h3>
                <Button variant="outline" size="sm" className="rounded-full text-[10px] h-6 px-2" onClick={() => addListItem("benefits")}>
                  <Plus className="size-3 mr-1" />Add
                </Button>
              </div>
              <div className="space-y-2">
                {(formData.benefits || [""]).map((ben, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--saptta-mute)] w-4 shrink-0">{i + 1}.</span>
                    <Input placeholder="e.g., Health insurance, ESOPs..." className="rounded-xl h-8 text-xs flex-1" value={ben} onChange={(e) => updateListItem("benefits", i, e.target.value)} />
                    <Button variant="ghost" size="sm" className="size-7 shrink-0 rounded-full" onClick={() => removeListItem("benefits", i)}>
                      <X className="size-3 text-[var(--saptta-mute)]" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <DialogFooter className="pt-2 gap-2">
              <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button className="rounded-full bg-[#FF9900] text-white hover:bg-[#FF9900]/90" disabled={!isValid} onClick={handleSave}>
                {isEdit ? <><Check className="size-4 mr-1.5" />Update Job</> : <><Plus className="size-4 mr-1.5" />Create Job</>}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────── Jobs Tab ──────────────── */

function JobsTab({ candidates, onPublish, jobs, onCreateJob, onEditJob, onDeleteJob }: {
  candidates: Candidate[];
  onPublish: (job: JobPosting) => void;
  jobs: JobPosting[];
  onCreateJob: () => void;
  onEditJob: (job: JobPosting) => void;
  onDeleteJob: (jobId: string) => void;
}) {
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [jobDetailOpen, setJobDetailOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobPosting | null>(null);
  const [filterDept, setFilterDept] = useState<string>("all");
  const [filterExp, setFilterExp] = useState<string>("all");

  const filteredJobs = useMemo(() => {
    let result = jobs;
    if (filterDept !== "all") result = result.filter((j) => j.department === filterDept);
    if (filterExp !== "all") result = result.filter((j) => j.experienceLevel === filterExp);
    return result;
  }, [jobs, filterDept, filterExp]);

  const departments = useMemo(() => [...new Set(jobs.map((j) => j.department))], [jobs]);

  const handleDeleteClick = (e: React.MouseEvent, job: JobPosting) => {
    e.stopPropagation();
    setJobToDelete(job);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (jobToDelete) {
      onDeleteJob(jobToDelete.id);
      setDeleteConfirmOpen(false);
      setJobToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-sm text-[var(--saptta-mute)]">{jobs.filter((j) => j.status === "open").length} active positions</p>
          <Select value={filterDept} onValueChange={setFilterDept}>
            <SelectTrigger className="rounded-full h-7 text-[10px] w-40"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterExp} onValueChange={setFilterExp}>
            <SelectTrigger className="rounded-full h-7 text-[10px] w-36"><SelectValue placeholder="Experience" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Levels</SelectItem>
              {Object.entries(EXPERIENCE_LEVEL_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key} className="text-xs">{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="rounded-full bg-[#FF9900] text-white hover:bg-[#FF9900]/90 h-8 text-xs px-4" onClick={onCreateJob}>
          <Plus className="size-3.5 mr-1.5" />Create Job
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job, i) => {
          const statusCfg = JOB_STATUS_CONFIG[job.status];
          const expCfg = EXPERIENCE_LEVEL_CONFIG[job.experienceLevel || "mid"];
          return (
            <motion.div key={job.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 0.8, 0.22, 1] }}>
              <Card className="border-[var(--saptta-line)] rounded-[24px] hover:shadow-lg transition-all duration-300 hover:border-[var(--saptta-accent)]/30 cursor-pointer group" onClick={() => { setSelectedJob(job); setJobDetailOpen(true); }}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-[var(--saptta-ink)] truncate">{job.title}</h3>
                        {job.urgent && <Badge className="bg-red-50 text-red-500 text-[9px] rounded-full border-0 px-1.5 py-0 h-4">Urgent</Badge>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <p className="text-xs text-[var(--saptta-mute)]">{job.department}</p>
                        {job.experienceLevel && (
                          <Badge className="rounded-full text-[8px] border-0 px-1.5 py-0 h-3.5" style={{ backgroundColor: expCfg.bgColor, color: expCfg.color }}>
                            {expCfg.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge className="rounded-full text-[10px] font-medium border-0 px-2.5 py-0.5 shrink-0" style={{ backgroundColor: statusCfg.bgColor, color: statusCfg.color }}>{statusCfg.label}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--saptta-mute)]"><MapPin className="size-3" /> {job.location}</div>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--saptta-mute)]"><IndianRupee className="size-3" /> {job.salary}</div>
                  </div>
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {job.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-[8px] rounded-full px-1.5 py-0 h-4 border-[var(--saptta-line)]">{skill}</Badge>
                      ))}
                      {job.skills.length > 4 && <Badge variant="outline" className="text-[8px] rounded-full px-1.5 py-0 h-4 border-[var(--saptta-line)]">+{job.skills.length - 4}</Badge>}
                    </div>
                  )}
                  <Separator />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center"><p className="text-lg font-bold text-[var(--saptta-ink)]">{job.openings}</p><p className="text-[10px] text-[var(--saptta-mute)]">Openings</p></div>
                    <div className="text-center"><p className="text-lg font-bold text-[var(--saptta-accent)]">{job.applicants}</p><p className="text-[10px] text-[var(--saptta-mute)]">Applicants</p></div>
                    <div className="text-center"><p className="text-lg font-bold text-[var(--saptta-ink-2)]">{job.daysOpen}</p><p className="text-[10px] text-[var(--saptta-mute)]">Days Open</p></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[var(--saptta-mute)]">Posted {job.postedDate}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="size-7 rounded-full" onClick={(e) => { e.stopPropagation(); onEditJob(job); }}>
                        <FileText className="size-3 text-[var(--saptta-mute)]" />
                      </Button>
                      <Button variant="ghost" size="sm" className="size-7 rounded-full" onClick={(e) => handleDeleteClick(e, job)}>
                        <X className="size-3 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      <JobDetailDialog job={selectedJob} open={jobDetailOpen} onOpenChange={setJobDetailOpen} candidates={candidates} onPublish={onPublish} onEdit={onEditJob} />

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md rounded-[24px] p-0">
          <div className="p-6 text-center space-y-4">
            <div className="size-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <AlertTriangle className="size-7 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-[var(--saptta-ink)]">Delete Job Role?</h2>
            <p className="text-sm text-[var(--saptta-mute)]">
              Are you sure you want to delete <span className="font-semibold text-[var(--saptta-ink)]">&quot;{jobToDelete?.title}&quot;</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" className="rounded-full px-6" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
              <Button className="rounded-full bg-red-500 text-white hover:bg-red-600 px-6" onClick={confirmDelete}>Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ──────────────── Candidates Tab ──────────────── */

function CandidatesTab({ candidates, onMoveStage, onRunAIAnalysis }: { candidates: Candidate[]; onMoveStage: (id: string, stage: PipelineStage) => void; onRunAIAnalysis: (candidate: Candidate) => void }) {
  const [search, setSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const filtered = useMemo(() => {
    if (!search) return candidates;
    const q = search.toLowerCase();
    return candidates.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) || c.source.toLowerCase().includes(q));
  }, [candidates, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--saptta-mute)]" />
          <Input placeholder="Search candidates by name, email, role..." className="pl-9 h-9 rounded-full text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Badge variant="outline" className="rounded-full text-[10px] px-3">{filtered.length} results</Badge>
      </div>
      <Card className="border-[var(--saptta-line)] rounded-[24px] overflow-hidden">
        <ScrollArea className="max-h-[520px]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[var(--saptta-mute)]">Candidate</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[var(--saptta-mute)]">Source</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[var(--saptta-mute)]">Applied For</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[var(--saptta-mute)]">Stage</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[var(--saptta-mute)]">Match Score</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[var(--saptta-mute)]">Last Activity</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[var(--saptta-mute)] w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const stageCfg = STAGE_CONFIG[c.stage];
                return (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-[var(--saptta-bg-2)] transition-colors" onClick={() => { setSelectedCandidate(c); setDetailOpen(true); }}>
                    <TableCell><div className="flex items-center gap-2.5"><Avatar className="size-8 rounded-lg"><AvatarFallback className="rounded-lg text-[10px] font-bold" style={{ backgroundColor: getScoreBgColor(c.matchScore), color: getScoreColor(c.matchScore) }}>{c.avatar}</AvatarFallback></Avatar><div><p className="text-sm font-medium text-[var(--saptta-ink)]">{c.name}</p><p className="text-[11px] text-[var(--saptta-mute)]">{c.email}</p></div></div></TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] rounded-full border-0 bg-[var(--saptta-bg-2)] px-2 py-0.5">{c.source}</Badge></TableCell>
                    <TableCell><span className="text-sm text-[var(--saptta-ink-2)]">{c.role}</span></TableCell>
                    <TableCell><Badge className="rounded-full text-[10px] font-medium border-0 px-2.5 py-0.5" style={{ backgroundColor: stageCfg.bgColor, color: stageCfg.color }}>{stageCfg.label}</Badge></TableCell>
                    <TableCell><div className="flex items-center gap-2 min-w-[100px]"><ScoreBar value={c.matchScore} showLabel={false} /><span className="text-xs font-semibold" style={{ color: getScoreColor(c.matchScore) }}>{c.matchScore}%</span></div></TableCell>
                    <TableCell><span className="text-xs text-[var(--saptta-mute)]">{c.lastActivity}</span></TableCell>
                    <TableCell><div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="size-7 rounded-full" onClick={(e) => { e.stopPropagation(); onRunAIAnalysis(c); }} title="Run AI Analysis">
                        <Brain className="size-3.5 text-[#FF9900]" />
                      </Button>
                      <ChevronRight className="size-4 text-[var(--saptta-mute)]" />
                    </div></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
      <CandidateDetailDialog candidate={selectedCandidate} open={detailOpen} onOpenChange={setDetailOpen} onMoveStage={onMoveStage} onRunAIAnalysis={onRunAIAnalysis} />
    </div>
  );
}

/* ──────────────── High Score Notification Banner ──────────────── */

function HighScoreBanner({ notification, onDismiss, onViewProfile, onEmail }: {
  notification: HighScoreNotification; onDismiss: () => void; onViewProfile: () => void; onEmail: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.22, 0.8, 0.22, 1] }}
      className="bg-gradient-to-r from-[#FF9900] to-[#ff8f5c] rounded-[20px] p-4 shadow-lg"
    >
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Star className="size-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">High-scoring candidate detected!</p>
          <p className="text-xs text-white/80">{notification.candidateName} scored <span className="font-bold">{notification.score}%</span> for {notification.jobTitle}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" className="rounded-full bg-white text-[#FF9900] hover:bg-white/90 h-7 text-[10px] px-3" onClick={onViewProfile}>
            <Eye className="size-3 mr-1" />View Profile
          </Button>
          <Button size="sm" className="rounded-full bg-white/20 text-white hover:bg-white/30 h-7 text-[10px] px-3" onClick={onEmail}>
            <Mail className="size-3 mr-1" />Email
          </Button>
          <Button size="sm" variant="ghost" className="size-7 rounded-full p-0 text-white/70 hover:text-white hover:bg-white/10" onClick={onDismiss}>
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────── Main Component ──────────────── */

export function EnhancedRecruitmentView() {
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [jobs, setJobs] = useState<JobPosting[]>(MOCK_JOBS);
  const [publishJob, setPublishJob] = useState<JobPosting | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [notifications, setNotifications] = useState<HighScoreNotification[]>([]);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailTarget, setEmailTarget] = useState({ name: "", email: "", jobTitle: "" });

  // Job CRUD state
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);

  // AI Analysis state
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);
  const [aiAnalysisCandidate, setAiAnalysisCandidate] = useState<Candidate | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AIAnalysisData | null>(null);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);

  // Load data from API on mount
  useEffect(() => {
    loadJobsFromDB();
    loadCandidatesFromDB();
  }, []);

  const loadJobsFromDB = async () => {
    try {
      const res = await fetch("/api/recruitment/jobs");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          setJobs(data.data);
        }
      }
    } catch { /* use mock data as fallback */ }
  };

  const loadCandidatesFromDB = async () => {
    try {
      const res = await fetch("/api/recruitment/candidates");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          const mapped = data.data.map((c: any) => ({
            ...c,
            scoreBreakdown: typeof c.scoreBreakdown === "string" ? JSON.parse(c.scoreBreakdown) : c.scoreBreakdown,
            timeline: typeof c.timeline === "string" ? JSON.parse(c.timeline) : c.timeline,
          }));
          setCandidates(mapped);
        }
      }
    } catch { /* use mock data as fallback */ }
  };

  const handleRunAIAnalysis = useCallback(async (candidate: Candidate) => {
    setAiAnalysisCandidate(candidate);
    setAiAnalysisLoading(true);
    setAiAnalysisOpen(true);
    setAiAnalysisResult(null);

    try {
      // Get resume text (from mock data or candidate record)
      const resumeText = candidate.aiAnalysis ? null :
        MOCK_RESUME_TEXTS.find(r => r.id === `mr${MOCK_CANDIDATES.findIndex(c => c.id === candidate.id) + 1}`)?.text ||
        `Name: ${candidate.name}\nEmail: ${candidate.email}\nRole: ${candidate.role}\nExperience: ${candidate.experience}\nSkills: Based on ${candidate.role}`;

      const res = await fetch("/api/recruitment/hiremind-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobId: candidate.jobId,
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          analysisType: "full",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAiAnalysisResult(data.data.result);
          // Update candidate score
          setCandidates(prev => prev.map(c =>
            c.id === candidate.id
              ? { ...c, matchScore: data.data.result.overallScore, aiAnalysis: data.data.result }
              : c
          ));
        }
      }
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setAiAnalysisLoading(false);
    }
  }, []);

  const handleMoveStage = useCallback((candidateId: string, newStage: PipelineStage) => {
    setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c)));
  }, []);

  const handlePublish = useCallback((job: JobPosting) => {
    setPublishJob(job);
    setPublishOpen(true);
  }, []);

  // Job CRUD handlers
  const handleCreateJob = useCallback(() => {
    setEditingJob(null);
    setCreateJobOpen(true);
  }, []);

  const handleEditJob = useCallback((job: JobPosting) => {
    setEditingJob(job);
    setCreateJobOpen(true);
  }, []);

  const handleSaveJob = useCallback(async (job: JobPosting) => {
    // Try to save to API
    try {
      const existingJob = jobs.find(j => j.id === job.id);
      if (existingJob) {
        // Update
        await fetch(`/api/recruitment/jobs/${job.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(job),
        });
      } else {
        // Create
        await fetch("/api/recruitment/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(job),
        });
      }
    } catch { /* offline fallback */ }

    // Update local state regardless
    setJobs((prev) => {
      const exists = prev.find((j) => j.id === job.id);
      if (exists) {
        return prev.map((j) => (j.id === job.id ? job : j));
      }
      return [job, ...prev];
    });
  }, [jobs]);

  const handleDeleteJob = useCallback((jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  }, []);

  const handleHighScore = useCallback((notification: HighScoreNotification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const openEmailForNotification = useCallback((notif: HighScoreNotification) => {
    setEmailTarget({ name: notif.candidateName, email: notif.candidateEmail, jobTitle: notif.jobTitle });
    setEmailDialogOpen(true);
  }, []);

  // Stats
  const openJobs = jobs.filter((j) => j.status === "open").length;
  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicants, 0);
  const avgTimeToHire = 18;
  const offerRate = Math.round((candidates.filter((c) => c.stage === "hired").length / candidates.length) * 100);

  return (
    <div className="space-y-6">
      {/* High Score Notifications */}
      <AnimatePresence>
        {notifications.slice(0, 3).map((notif) => (
          <HighScoreBanner
            key={notif.id}
            notification={notif}
            onDismiss={() => dismissNotification(notif.id)}
            onViewProfile={() => dismissNotification(notif.id)}
            onEmail={() => { openEmailForNotification(notif); dismissNotification(notif.id); }}
          />
        ))}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--saptta-ink)]">Recruitment</h1>
          <p className="text-sm text-[var(--saptta-mute)] mt-0.5">Manage your hiring pipeline and find the best talent</p>
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" className="rounded-full text-xs h-8 relative">
              <Bell className="size-3.5 mr-1.5" />
              Notifications
              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-[#FF9900] text-white text-[8px] flex items-center justify-center">{notifications.length}</span>
            </Button>
          )}
          <Button className="rounded-full bg-[#FF9900] text-white hover:bg-[#FF9900]/90 h-9 text-xs px-4 saptta-btn-fill" onClick={handleCreateJob}>
            <Plus className="size-3.5 mr-1.5" />New Job
          </Button>
        </div>
      </div>

      {/* Stats */}
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3" variants={stagger} initial="hidden" animate="show">
        {[
          { label: "Open Positions", value: openJobs, icon: Briefcase, color: "#FF9900", bg: "#FF990015" },
          { label: "Total Applicants", value: totalApplicants, icon: Users, color: "#0066CC", bg: "#0066CC20" },
          { label: "Avg Time to Hire", value: `${avgTimeToHire}d`, icon: Clock, color: "#003d7a", bg: "#003d7a15" },
          { label: "Offer Rate", value: `${offerRate}%`, icon: Target, color: "#22c55e", bg: "#22c55e15" },
        ].map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <Card className="border-[var(--saptta-line)] rounded-[20px] saptta-module-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="size-10 rounded-[14px] flex items-center justify-center" style={{ backgroundColor: stat.bg }}>
                  <stat.icon className="size-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--saptta-ink)]">{stat.value}</p>
                  <p className="text-[10px] text-[var(--saptta-mute)]">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className="bg-[var(--saptta-bg-2)] rounded-full p-1 h-auto gap-0.5">
          <TabsTrigger value="pipeline" className="rounded-full text-xs px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Pipeline</TabsTrigger>
          <TabsTrigger value="jobs" className="rounded-full text-xs px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Jobs</TabsTrigger>
          <TabsTrigger value="candidates" className="rounded-full text-xs px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Candidates</TabsTrigger>
          <TabsTrigger value="resume-analyzer" className="rounded-full text-xs px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Brain className="size-3 mr-1.5" />Resume Analyzer
          </TabsTrigger>
          <TabsTrigger value="batch-analysis" className="rounded-full text-xs px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Files className="size-3 mr-1.5" />Batch Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline"><PipelineTab candidates={candidates} onMoveStage={handleMoveStage} /></TabsContent>
        <TabsContent value="jobs"><JobsTab candidates={candidates} onPublish={handlePublish} jobs={jobs} onCreateJob={handleCreateJob} onEditJob={handleEditJob} onDeleteJob={handleDeleteJob} /></TabsContent>
        <TabsContent value="candidates"><CandidatesTab candidates={candidates} onMoveStage={handleMoveStage} onRunAIAnalysis={handleRunAIAnalysis} /></TabsContent>
        <TabsContent value="resume-analyzer"><ResumeAnalyzerTab /></TabsContent>
        <TabsContent value="batch-analysis"><BatchAnalysisTab onHighScore={handleHighScore} /></TabsContent>
      </Tabs>

      {/* Create/Edit Job Dialog — key forces remount on editJob change */}
      <CreateEditJobDialog key={editingJob?.id ?? "new"} open={createJobOpen} onOpenChange={setCreateJobOpen} onSave={handleSaveJob} editJob={editingJob} jobs={jobs} />

      {/* JD Publish Dialog */}
      <JDPublishDialog job={publishJob} open={publishOpen} onOpenChange={setPublishOpen} />

      {/* Email Dialog (from notification) */}
      <EmailCandidateDialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen} candidateName={emailTarget.name} candidateEmail={emailTarget.email} jobTitle={emailTarget.jobTitle} />

      {/* HireMind AI Analysis Dialog */}
      <Dialog open={aiAnalysisOpen} onOpenChange={setAiAnalysisOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto rounded-[24px] p-0">
          <div className="bg-[#FF9900] p-5 rounded-t-[24px]">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-[16px] bg-white/20 flex items-center justify-center">
                <Brain className="size-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white">HireMind AI Analysis</DialogTitle>
                <DialogDescription className="text-xs text-white/70">
                  {aiAnalysisCandidate ? `Analyzing ${aiAnalysisCandidate.name}` : "Analyzing candidate..."}
                </DialogDescription>
              </div>
            </div>
          </div>
          <div className="p-5">
            {aiAnalysisLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="size-10 text-[#FF9900] animate-spin" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-[var(--saptta-ink)]">Running 12-Agent Analysis...</p>
                  <p className="text-xs text-[var(--saptta-mute)] mt-1">This may take 30-60 seconds</p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 w-full max-w-md mt-2">
                  {["Resume Parser", "Domain Detector", "Seniority", "Skill Expansion", "JD Parser", "Job Matcher", "Achievements", "ATS Scoring", "Gap Analysis", "Improvements", "Interview Pred.", "Recruiter AI"].map((agent, i) => (
                    <div key={agent} className="flex items-center gap-1.5 text-[9px] text-[var(--saptta-mute)]">
                      <Loader2 className="size-2.5 animate-spin text-[#FF9900]" />
                      {agent}
                    </div>
                  ))}
                </div>
              </div>
            ) : aiAnalysisResult ? (
              <div className="space-y-5">
                {/* Score Overview */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold" style={{ color: getScoreColor(aiAnalysisResult.overallScore) }}>{aiAnalysisResult.overallScore}</div>
                    <div className="text-[10px] text-[var(--saptta-mute)] uppercase tracking-wider">Overall Score</div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--saptta-mute)] w-20">Skills</span>
                      <div className="flex-1"><ScoreBar value={aiAnalysisResult.jobMatch.skillsMatch} showLabel={false} /></div>
                      <span className="text-xs font-semibold" style={{ color: getScoreColor(aiAnalysisResult.jobMatch.skillsMatch) }}>{aiAnalysisResult.jobMatch.skillsMatch}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--saptta-mute)] w-20">Experience</span>
                      <div className="flex-1"><ScoreBar value={aiAnalysisResult.jobMatch.experienceMatch} showLabel={false} /></div>
                      <span className="text-xs font-semibold" style={{ color: getScoreColor(aiAnalysisResult.jobMatch.experienceMatch) }}>{aiAnalysisResult.jobMatch.experienceMatch}%</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge className="rounded-full text-xs font-bold border-0 px-4 py-1" style={{ backgroundColor: aiAnalysisResult.shortlistDecision ? "#22c55e15" : "#ef444415", color: aiAnalysisResult.shortlistDecision ? "#22c55e" : "#ef4444" }}>
                      {aiAnalysisResult.shortlistDecision ? "SHORTLIST" : "NOT SHORTLIST"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Skill Expansion */}
                {aiAnalysisResult.skillExpansion?.expanded?.filter(e => e.fullForms?.length > 0).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-2 flex items-center gap-2"><Zap className="size-4 text-[#FF9900]" /> Skill Expansion</h3>
                    <div className="flex flex-wrap gap-2">
                      {aiAnalysisResult.skillExpansion.expanded.filter(e => e.fullForms?.length > 0).map((exp, i) => (
                        <div key={i} className="bg-[var(--saptta-bg-2)] rounded-lg px-3 py-1.5">
                          <span className="text-xs font-medium text-[#0066CC]">{exp.abbreviation}</span>
                          <span className="text-xs text-[var(--saptta-mute)] mx-1">→</span>
                          <span className="text-xs text-[var(--saptta-ink)]">{exp.fullForms[0]}</span>
                          {exp.relatedSkills?.length > 0 && (
                            <div className="flex flex-wrap gap-0.5 mt-0.5">{exp.relatedSkills.slice(0, 3).map((rs, j) => <Badge key={j} className="text-[8px] rounded-full border-0 px-1.5 py-0 bg-[#0066CC10] text-[#0066CC]">{rs}</Badge>)}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched / Missing Skills */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-green-600 mb-2">Matched Skills</h4>
                    <div className="flex flex-wrap gap-1">{aiAnalysisResult.jobMatch.matchedSkills?.map((s, i) => <Badge key={i} className="text-[9px] rounded-full border-0 px-2 py-0 bg-green-50 text-green-700">{s}</Badge>)}</div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-red-600 mb-2">Missing Skills</h4>
                    <div className="flex flex-wrap gap-1">{aiAnalysisResult.jobMatch.missingSkills?.map((s, i) => <Badge key={i} className="text-[9px] rounded-full border-0 px-2 py-0 bg-red-50 text-red-700">{s}</Badge>)}</div>
                  </div>
                </div>

                <Separator />

                {/* Recruiter Insights */}
                {aiAnalysisResult.recruiterInsights && (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-2 flex items-center gap-2"><Eye className="size-4 text-[#0066CC]" /> Recruiter Insights</h3>
                    <div className="bg-[var(--saptta-bg-2)] rounded-xl p-4 space-y-3">
                      <p className="text-sm text-[var(--saptta-ink)]">{aiAnalysisResult.recruiterInsights.oneLineSummary}</p>
                      <div className="grid grid-cols-2 gap-3">
                        {aiAnalysisResult.recruiterInsights.greenFlags?.length > 0 && (
                          <div><p className="text-[10px] font-semibold text-green-600 mb-1">Green Flags</p>
                          <ul className="space-y-0.5">{aiAnalysisResult.recruiterInsights.greenFlags.slice(0, 4).map((f, i) => <li key={i} className="text-[10px] text-green-700">✓ {f}</li>)}</ul></div>
                        )}
                        {aiAnalysisResult.recruiterInsights.redFlags?.length > 0 && (
                          <div><p className="text-[10px] font-semibold text-red-600 mb-1">Red Flags</p>
                          <ul className="space-y-0.5">{aiAnalysisResult.recruiterInsights.redFlags.slice(0, 4).map((f, i) => <li key={i} className="text-[10px] text-red-700">✗ {f}</li>)}</ul></div>
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--saptta-mute)]">Recommendation: <span className="font-semibold text-[var(--saptta-ink)]">{aiAnalysisResult.recruiterInsights.shortlistRecommendation}</span></p>
                      <p className="text-[10px] text-[var(--saptta-mute)]">{aiAnalysisResult.recruiterInsights.recommendationReason}</p>
                    </div>
                  </div>
                )}

                {/* Gap Analysis */}
                {aiAnalysisResult.gapAnalysis && (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-2 flex items-center gap-2"><AlertTriangle className="size-4 text-[#FF9900]" /> Gap Analysis</h3>
                    {aiAnalysisResult.gapAnalysis.criticalGaps?.length > 0 && (
                      <div className="mb-2"><p className="text-[10px] font-semibold text-red-600 mb-1">Critical Gaps</p>
                      <div className="flex flex-wrap gap-1">{aiAnalysisResult.gapAnalysis.criticalGaps.map((g, i) => <Badge key={i} className="text-[9px] rounded-full border-0 px-2 py-0 bg-red-50 text-red-700">{g}</Badge>)}</div></div>
                    )}
                    {aiAnalysisResult.gapAnalysis.bridgingSteps?.length > 0 && (
                      <div><p className="text-[10px] font-semibold text-[#0066CC] mb-1">Bridging Steps</p>
                      <ul className="space-y-0.5">{aiAnalysisResult.gapAnalysis.bridgingSteps.slice(0, 4).map((s, i) => <li key={i} className="text-[10px] text-[var(--saptta-ink-2)]">→ {s}</li>)}</ul></div>
                    )}
                  </div>
                )}

                {/* Interview Prediction */}
                {aiAnalysisResult.interviewPrediction && (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-2 flex items-center gap-2"><Target className="size-4 text-[#22c55e]" /> Interview Prediction</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-[var(--saptta-mute)]">Likelihood</p>
                        <p className="text-sm font-bold" style={{ color: getScoreColor(aiAnalysisResult.interviewPrediction.likelihood) }}>{aiAnalysisResult.interviewPrediction.likelihood}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--saptta-mute)]">Expected Rounds</p>
                        <div className="flex flex-wrap gap-1 mt-0.5">{aiAnalysisResult.interviewPrediction.expectedRounds?.map((r, i) => <Badge key={i} className="text-[9px] rounded-full border-0 px-2 py-0 bg-[#FF990015] text-[#FF9900]">{r}</Badge>)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ATS Score */}
                {aiAnalysisResult.atsScore && (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-2 flex items-center gap-2"><ShieldCheck className="size-4 text-[#0066CC]" /> ATS Compatibility: {aiAnalysisResult.atsScore.overall}%</h3>
                    {aiAnalysisResult.atsScore.recommendations?.length > 0 && (
                      <div className="space-y-0.5">{aiAnalysisResult.atsScore.recommendations.slice(0, 3).map((r, i) => <p key={i} className="text-[10px] text-[var(--saptta-ink-2)]">→ {r}</p>)}</div>
                    )}
                  </div>
                )}

                {/* Provider info */}
                <div className="text-center pt-2">
                  <p className="text-[9px] text-[var(--saptta-mute)]">Powered by HireMind AI ({aiAnalysisResult.provider}) • Confidence: {Math.round(aiAnalysisResult.confidence * 100)}%</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="size-12 text-[var(--saptta-mute)] mx-auto mb-3" />
                <p className="text-sm text-[var(--saptta-mute)]">No analysis results available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
