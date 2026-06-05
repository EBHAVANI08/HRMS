"use client";

import React, { useState, useMemo, useCallback } from "react";
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

/* ──────────────── Animation Config ──────────────── */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 0.8, 0.22, 1] } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, ease: [0.22, 0.8, 0.22, 1] } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.22, 0.8, 0.22, 1] } },
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
}

interface TimelineEvent {
  date: string;
  event: string;
  type: "applied" | "screened" | "interview" | "assessment" | "offer" | "hired" | "rejected" | "note" | "email";
}

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
}

/* ──────────────── Pipeline Stage Config ──────────────── */

const STAGE_CONFIG: Record<PipelineStage, { label: string; color: string; bgColor: string; dotColor: string }> = {
  sourced: { label: "Sourced", color: "#8b5cf6", bgColor: "#8b5cf615", dotColor: "#8b5cf6" },
  screening: { label: "Screening", color: "#ff6a2c", bgColor: "#ff6a2c15", dotColor: "#ff6a2c" },
  interview: { label: "Interview", color: "#f59e0b", bgColor: "#f59e0b15", dotColor: "#f59e0b" },
  assessment: { label: "Assessment", color: "#c8e056", bgColor: "#c8e05620", dotColor: "#c8e056" },
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
  {
    id: "c1",
    name: "Ananya Krishnan",
    email: "ananya.k@gmail.com",
    phone: "+91 98765 43210",
    avatar: "AK",
    role: "Senior Frontend Developer",
    jobId: "j1",
    stage: "interview",
    source: "LinkedIn",
    matchScore: 92,
    scoreBreakdown: { skills: 95, experience: 90, education: 88, culture: 94, overall: 92 },
    daysInStage: 3,
    appliedDate: "2025-02-15",
    lastActivity: "2 hours ago",
    location: "Bangalore, IN",
    experience: "6 years",
    salary: "₹28 LPA",
    timeline: [
      { date: "Feb 15", event: "Applied via LinkedIn", type: "applied" },
      { date: "Feb 16", event: "Resume screened by HR", type: "screened" },
      { date: "Feb 18", event: "Technical round scheduled", type: "interview" },
      { date: "Feb 20", event: "Interview completed - Strong", type: "interview" },
    ],
  },
  {
    id: "c2",
    name: "Rohan Patel",
    email: "rohan.p@outlook.com",
    phone: "+91 87654 32109",
    avatar: "RP",
    role: "Senior Frontend Developer",
    jobId: "j1",
    stage: "assessment",
    source: "Naukri",
    matchScore: 85,
    scoreBreakdown: { skills: 88, experience: 82, education: 85, culture: 86, overall: 85 },
    daysInStage: 1,
    appliedDate: "2025-02-10",
    lastActivity: "1 day ago",
    location: "Mumbai, IN",
    experience: "5 years",
    salary: "₹24 LPA",
    timeline: [
      { date: "Feb 10", event: "Applied via Naukri", type: "applied" },
      { date: "Feb 11", event: "Resume screened", type: "screened" },
      { date: "Feb 14", event: "Phone screening completed", type: "screened" },
      { date: "Feb 17", event: "Technical interview passed", type: "interview" },
      { date: "Feb 19", event: "Assessment sent", type: "assessment" },
    ],
  },
  {
    id: "c3",
    name: "Meera Sharma",
    email: "meera.s@gmail.com",
    phone: "+91 76543 21098",
    avatar: "MS",
    role: "Product Designer",
    jobId: "j2",
    stage: "offer",
    source: "Referral",
    matchScore: 94,
    scoreBreakdown: { skills: 96, experience: 93, education: 90, culture: 97, overall: 94 },
    daysInStage: 2,
    appliedDate: "2025-01-28",
    lastActivity: "5 hours ago",
    location: "Delhi, IN",
    experience: "7 years",
    salary: "₹32 LPA",
    timeline: [
      { date: "Jan 28", event: "Referred by Priya Sharma", type: "applied" },
      { date: "Jan 29", event: "Portfolio reviewed", type: "screened" },
      { date: "Feb 2", event: "Design challenge assigned", type: "assessment" },
      { date: "Feb 5", event: "Panel interview cleared", type: "interview" },
      { date: "Feb 8", event: "Offer approved", type: "offer" },
    ],
  },
  {
    id: "c4",
    name: "Vikram Desai",
    email: "vikram.d@gmail.com",
    phone: "+91 65432 10987",
    avatar: "VD",
    role: "Data Engineer",
    jobId: "j3",
    stage: "screening",
    source: "LinkedIn",
    matchScore: 78,
    scoreBreakdown: { skills: 80, experience: 75, education: 78, culture: 79, overall: 78 },
    daysInStage: 5,
    appliedDate: "2025-02-18",
    lastActivity: "5 days ago",
    location: "Pune, IN",
    experience: "4 years",
    salary: "₹20 LPA",
    timeline: [
      { date: "Feb 18", event: "Applied via LinkedIn", type: "applied" },
      { date: "Feb 19", event: "Under screening", type: "screened" },
    ],
  },
  {
    id: "c5",
    name: "Sneha Iyer",
    email: "sneha.i@gmail.com",
    phone: "+91 54321 09876",
    avatar: "SI",
    role: "Sales Manager",
    jobId: "j4",
    stage: "hired",
    source: "Agency",
    matchScore: 88,
    scoreBreakdown: { skills: 90, experience: 87, education: 82, culture: 91, overall: 88 },
    daysInStage: 1,
    appliedDate: "2025-01-10",
    lastActivity: "1 day ago",
    location: "Chennai, IN",
    experience: "8 years",
    salary: "₹35 LPA",
    timeline: [
      { date: "Jan 10", event: "Sourced via ABC Consulting", type: "applied" },
      { date: "Jan 12", event: "Screened by hiring manager", type: "screened" },
      { date: "Jan 16", event: "First interview completed", type: "interview" },
      { date: "Jan 20", event: "Assessment cleared", type: "assessment" },
      { date: "Jan 25", event: "Offer letter sent", type: "offer" },
      { date: "Feb 1", event: "Offer accepted", type: "hired" },
    ],
  },
  {
    id: "c6",
    name: "Arjun Nair",
    email: "arjun.n@gmail.com",
    phone: "+91 43210 98765",
    avatar: "AN",
    role: "HR Business Partner",
    jobId: "j5",
    stage: "sourced",
    source: "LinkedIn",
    matchScore: 72,
    scoreBreakdown: { skills: 70, experience: 74, education: 72, culture: 71, overall: 72 },
    daysInStage: 2,
    appliedDate: "2025-02-20",
    lastActivity: "2 days ago",
    location: "Hyderabad, IN",
    experience: "6 years",
    salary: "₹22 LPA",
    timeline: [
      { date: "Feb 20", event: "Profile sourced from LinkedIn", type: "applied" },
    ],
  },
  {
    id: "c7",
    name: "Priya Gupta",
    email: "priya.g@gmail.com",
    phone: "+91 32109 87654",
    avatar: "PG",
    role: "Senior Frontend Developer",
    jobId: "j1",
    stage: "rejected",
    source: "Website",
    matchScore: 45,
    scoreBreakdown: { skills: 50, experience: 40, education: 48, culture: 42, overall: 45 },
    daysInStage: 4,
    appliedDate: "2025-02-12",
    lastActivity: "4 days ago",
    location: "Kolkata, IN",
    experience: "2 years",
    salary: "₹14 LPA",
    timeline: [
      { date: "Feb 12", event: "Applied via website", type: "applied" },
      { date: "Feb 13", event: "Resume screened", type: "screened" },
      { date: "Feb 15", event: "Rejected - insufficient experience", type: "rejected" },
    ],
  },
  {
    id: "c8",
    name: "Karthik Reddy",
    email: "karthik.r@gmail.com",
    phone: "+91 21098 76543",
    avatar: "KR",
    role: "Data Engineer",
    jobId: "j3",
    stage: "interview",
    source: "Campus",
    matchScore: 68,
    scoreBreakdown: { skills: 65, experience: 60, education: 78, culture: 70, overall: 68 },
    daysInStage: 4,
    appliedDate: "2025-02-08",
    lastActivity: "1 day ago",
    location: "Bangalore, IN",
    experience: "1 year",
    salary: "₹12 LPA",
    timeline: [
      { date: "Feb 8", event: "Applied via campus placement", type: "applied" },
      { date: "Feb 10", event: "Screened by recruiter", type: "screened" },
      { date: "Feb 14", event: "Interview scheduled", type: "interview" },
    ],
  },
  {
    id: "c9",
    name: "Deepika Rao",
    email: "deepika.r@gmail.com",
    phone: "+91 10987 65432",
    avatar: "DR",
    role: "Product Designer",
    jobId: "j2",
    stage: "screening",
    source: "Naukri",
    matchScore: 81,
    scoreBreakdown: { skills: 84, experience: 78, education: 80, culture: 82, overall: 81 },
    daysInStage: 3,
    appliedDate: "2025-02-17",
    lastActivity: "3 days ago",
    location: "Mumbai, IN",
    experience: "5 years",
    salary: "₹26 LPA",
    timeline: [
      { date: "Feb 17", event: "Applied via Naukri", type: "applied" },
      { date: "Feb 18", event: "Under screening", type: "screened" },
    ],
  },
  {
    id: "c10",
    name: "Suresh Kumar",
    email: "suresh.k@gmail.com",
    phone: "+91 98765 12345",
    avatar: "SK",
    role: "Sales Manager",
    jobId: "j4",
    stage: "assessment",
    source: "Referral",
    matchScore: 76,
    scoreBreakdown: { skills: 78, experience: 80, education: 68, culture: 77, overall: 76 },
    daysInStage: 2,
    appliedDate: "2025-02-05",
    lastActivity: "2 days ago",
    location: "Delhi, IN",
    experience: "6 years",
    salary: "₹28 LPA",
    timeline: [
      { date: "Feb 5", event: "Referred by Amit Joshi", type: "applied" },
      { date: "Feb 6", event: "Phone screening completed", type: "screened" },
      { date: "Feb 10", event: "Interview with VP Sales", type: "interview" },
      { date: "Feb 15", event: "Assessment in progress", type: "assessment" },
    ],
  },
  {
    id: "c11",
    name: "Lakshmi Venkat",
    email: "lakshmi.v@gmail.com",
    phone: "+91 87654 56789",
    avatar: "LV",
    role: "DevOps Engineer",
    jobId: "j6",
    stage: "interview",
    source: "LinkedIn",
    matchScore: 89,
    scoreBreakdown: { skills: 92, experience: 88, education: 84, culture: 90, overall: 89 },
    daysInStage: 2,
    appliedDate: "2025-02-14",
    lastActivity: "6 hours ago",
    location: "Bangalore, IN",
    experience: "5 years",
    salary: "₹30 LPA",
    timeline: [
      { date: "Feb 14", event: "Applied via LinkedIn", type: "applied" },
      { date: "Feb 15", event: "Screened by technical lead", type: "screened" },
      { date: "Feb 18", event: "System design round", type: "interview" },
    ],
  },
  {
    id: "c12",
    name: "Nikhil Joshi",
    email: "nikhil.j@gmail.com",
    phone: "+91 76543 45678",
    avatar: "NJ",
    role: "DevOps Engineer",
    jobId: "j6",
    stage: "sourced",
    source: "Agency",
    matchScore: 64,
    scoreBreakdown: { skills: 66, experience: 62, education: 60, culture: 68, overall: 64 },
    daysInStage: 1,
    appliedDate: "2025-02-21",
    lastActivity: "1 day ago",
    location: "Pune, IN",
    experience: "3 years",
    salary: "₹18 LPA",
    timeline: [
      { date: "Feb 21", event: "Sourced via TechStaff Agency", type: "applied" },
    ],
  },
];

const MOCK_JOBS: JobPosting[] = [
  {
    id: "j1",
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "Bangalore, IN",
    type: "Full-time",
    status: "open",
    openings: 2,
    applicants: 34,
    daysOpen: 28,
    salary: "₹25-35 LPA",
    postedDate: "2025-01-25",
    urgent: true,
    hiringManager: "Rajesh Kumar",
    description: "We are looking for an experienced Senior Frontend Developer to join our engineering team. You will be responsible for building and maintaining high-performance web applications using React, Next.js, and TypeScript.",
    requirements: ["5+ years of frontend development experience", "Expert in React, Next.js, TypeScript", "Experience with state management (Redux, Zustand)", "Strong understanding of web performance optimization", "Familiarity with CI/CD pipelines"],
    responsibilities: ["Lead frontend architecture decisions", "Mentor junior developers", "Build reusable component libraries", "Optimize application performance", "Collaborate with design and backend teams"],
  },
  {
    id: "j2",
    title: "Product Designer",
    department: "Design",
    location: "Delhi, IN (Hybrid)",
    type: "Full-time",
    status: "open",
    openings: 1,
    applicants: 22,
    daysOpen: 21,
    salary: "₹28-38 LPA",
    postedDate: "2025-02-01",
    urgent: false,
    hiringManager: "Kavitha Reddy",
    description: "Seeking a talented Product Designer to craft intuitive, beautiful experiences for our HRMS platform. You will work closely with product managers and engineers to ship features that delight users.",
    requirements: ["4+ years of product design experience", "Proficiency in Figma", "Strong portfolio showcasing UX/UI work", "Experience with design systems", "Understanding of accessibility standards"],
    responsibilities: ["Design end-to-end user flows", "Maintain and evolve our design system", "Conduct user research and usability testing", "Create interactive prototypes", "Present designs to stakeholders"],
  },
  {
    id: "j3",
    title: "Data Engineer",
    department: "Analytics",
    location: "Pune, IN",
    type: "Full-time",
    status: "on-hold",
    openings: 1,
    applicants: 18,
    daysOpen: 35,
    salary: "₹22-30 LPA",
    postedDate: "2025-01-18",
    urgent: false,
    hiringManager: "Srinivas M",
    description: "Looking for a Data Engineer to build and optimize our data pipelines. You will work with large datasets and ensure data quality across the organization.",
    requirements: ["3+ years in data engineering", "Proficiency in Python, SQL", "Experience with Spark, Airflow", "Knowledge of cloud data warehouses", "Understanding of ETL best practices"],
    responsibilities: ["Build and maintain data pipelines", "Optimize data warehouse performance", "Implement data quality checks", "Collaborate with data scientists", "Document data architecture"],
  },
  {
    id: "j4",
    title: "Sales Manager",
    department: "Sales",
    location: "Chennai, IN",
    type: "Full-time",
    status: "open",
    openings: 1,
    applicants: 9,
    daysOpen: 14,
    salary: "₹30-40 LPA",
    postedDate: "2025-02-08",
    urgent: true,
    hiringManager: "Vikram Singh",
    description: "Seeking an experienced Sales Manager to lead our enterprise sales team. You will drive revenue growth and build strong client relationships in the B2B SaaS space.",
    requirements: ["7+ years in B2B SaaS sales", "3+ years in leadership", "Proven track record of meeting quotas", "Experience with enterprise sales cycles", "Strong negotiation skills"],
    responsibilities: ["Lead and mentor the sales team", "Develop sales strategies and targets", "Manage key enterprise accounts", "Forecast revenue and pipeline", "Collaborate with marketing on campaigns"],
  },
  {
    id: "j5",
    title: "HR Business Partner",
    department: "HR & Admin",
    location: "Hyderabad, IN",
    type: "Full-time",
    status: "open",
    openings: 1,
    applicants: 15,
    daysOpen: 18,
    salary: "₹20-28 LPA",
    postedDate: "2025-02-04",
    urgent: false,
    hiringManager: "Anita Deshmukh",
    description: "Looking for an HR Business Partner to align people strategies with business objectives. You will work closely with department heads to drive talent management and employee engagement.",
    requirements: ["5+ years in HR business partnering", "Strong understanding of labor laws", "Experience with performance management", "Excellent communication skills", "CHRP/SHRM certification preferred"],
    responsibilities: ["Partner with business leaders on people strategies", "Drive talent development programs", "Manage employee relations", "Support organizational change initiatives", "Analyze HR metrics and provide insights"],
  },
  {
    id: "j6",
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Bangalore, IN (Remote)",
    type: "Full-time",
    status: "open",
    openings: 2,
    applicants: 26,
    daysOpen: 10,
    salary: "₹24-34 LPA",
    postedDate: "2025-02-12",
    urgent: false,
    hiringManager: "Rajesh Kumar",
    description: "We need a DevOps Engineer to help us scale our infrastructure. You will design and maintain our CI/CD pipelines and ensure 99.9% uptime for our platform.",
    requirements: ["4+ years in DevOps/SRE", "Expert in AWS/GCP", "Experience with Kubernetes, Docker", "Strong scripting skills (Bash, Python)", "Knowledge of monitoring tools"],
    responsibilities: ["Design and maintain CI/CD pipelines", "Manage cloud infrastructure", "Implement monitoring and alerting", "Automate deployment processes", "Ensure system reliability and security"],
  },
];

/* ──────────────── Helper Functions ──────────────── */

function getScoreColor(score: number): string {
  if (score >= 85) return "#22c55e";
  if (score >= 70) return "#c8e056";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function getScoreBgColor(score: number): string {
  if (score >= 85) return "#22c55e15";
  if (score >= 70) return "#c8e05620";
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
  candidate,
  open,
  onOpenChange,
  onMoveStage,
}: {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMoveStage: (candidateId: string, newStage: PipelineStage) => void;
}) {
  if (!candidate) return null;
  const cfg = STAGE_CONFIG[candidate.stage];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-[24px] p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-[#0a0a0b] to-[#1a1a1c] p-6 rounded-t-[24px]">
          <div className="flex items-start gap-4">
            <Avatar className="size-14 rounded-2xl border-2 border-white/20">
              <AvatarFallback className="rounded-2xl bg-[#ff6a2c] text-white text-lg font-bold">
                {candidate.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white">{candidate.name}</h2>
              <p className="text-sm text-white/70 mt-0.5">{candidate.role}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <Badge
                  className="rounded-full text-[11px] font-medium border-0 px-3 py-0.5"
                  style={{ backgroundColor: cfg.bgColor, color: cfg.color }}
                >
                  {cfg.label}
                </Badge>
                <span className="text-xs text-white/50 flex items-center gap-1">
                  <MapPin className="size-3" /> {candidate.location}
                </span>
                <span className="text-xs text-white/50 flex items-center gap-1">
                  <Briefcase className="size-3" /> {candidate.experience}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: getScoreColor(candidate.matchScore) }}>
                {candidate.matchScore}
              </div>
              <div className="text-[10px] text-white/50 uppercase tracking-wider">Match</div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="size-3.5 text-[var(--saptta-mute)]" />
              <span className="text-[var(--saptta-ink-2)]">{candidate.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="size-3.5 text-[var(--saptta-mute)]" />
              <span className="text-[var(--saptta-ink-2)]">{candidate.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="size-3.5 text-[var(--saptta-mute)]" />
              <span className="text-[var(--saptta-ink-2)]">{candidate.source}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <IndianRupee className="size-3.5 text-[var(--saptta-mute)]" />
              <span className="text-[var(--saptta-ink-2)]">{candidate.salary}</span>
            </div>
          </div>

          <Separator />

          {/* Score Breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-3">Score Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: "Skills", value: candidate.scoreBreakdown.skills },
                { label: "Experience", value: candidate.scoreBreakdown.experience },
                { label: "Education", value: candidate.scoreBreakdown.education },
                { label: "Culture Fit", value: candidate.scoreBreakdown.culture },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--saptta-mute)] w-20">{item.label}</span>
                  <div className="flex-1">
                    <ScoreBar value={item.value} showLabel={false} />
                  </div>
                  <span className="text-xs font-semibold min-w-[32px] text-right" style={{ color: getScoreColor(item.value) }}>
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-3">Activity Timeline</h3>
            <div className="space-y-0">
              {candidate.timeline.map((event, i) => {
                const isLast = i === candidate.timeline.length - 1;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className="size-2.5 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: isLast ? "#ff6a2c" : "#d4d4d4" }}
                      />
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

          {/* Move Stage Actions */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-3">Move to Stage</h3>
            <div className="flex flex-wrap gap-2">
              {STAGE_ORDER.filter((s) => s !== candidate.stage).map((stage) => {
                const sc = STAGE_CONFIG[stage];
                return (
                  <Button
                    key={stage}
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs h-7 border-[var(--saptta-line)] hover:border-[var(--saptta-accent)]"
                    onClick={() => {
                      onMoveStage(candidate.id, stage);
                      onOpenChange(false);
                    }}
                  >
                    <div className="size-1.5 rounded-full mr-1.5" style={{ backgroundColor: sc.color }} />
                    {sc.label}
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

function JobDetailDialog({
  job,
  open,
  onOpenChange,
  candidates,
}: {
  job: JobPosting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: Candidate[];
}) {
  if (!job) return null;
  const statusCfg = JOB_STATUS_CONFIG[job.status];
  const jobCandidates = candidates.filter((c) => c.jobId === job.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-[24px] p-0">
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--saptta-ink)]">{job.title}</h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-sm text-[var(--saptta-mute)] flex items-center gap-1">
                  <Building2 className="size-3" /> {job.department}
                </span>
                <span className="text-sm text-[var(--saptta-mute)] flex items-center gap-1">
                  <MapPin className="size-3" /> {job.location}
                </span>
              </div>
            </div>
            <Badge
              className="rounded-full text-[11px] font-medium border-0 px-3 py-0.5"
              style={{ backgroundColor: statusCfg.bgColor, color: statusCfg.color }}
            >
              {statusCfg.label}
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Openings", value: job.openings, icon: Users },
              { label: "Applicants", value: job.applicants, icon: FileText },
              { label: "Days Open", value: job.daysOpen, icon: Clock },
              { label: "Salary", value: job.salary, icon: IndianRupee },
            ].map((stat) => (
              <div key={stat.label} className="bg-[var(--saptta-bg-2)] rounded-xl p-3 text-center">
                <stat.icon className="size-4 text-[var(--saptta-mute)] mx-auto mb-1" />
                <p className="text-sm font-bold text-[var(--saptta-ink)]">{stat.value}</p>
                <p className="text-[10px] text-[var(--saptta-mute)]">{stat.label}</p>
              </div>
            ))}
          </div>

          <Separator />

          {/* Pipeline for this job */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-3">Pipeline Overview</h3>
            <div className="flex gap-1">
              {STAGE_ORDER.filter((s) => s !== "rejected").map((stage) => {
                const count = jobCandidates.filter((c) => c.stage === stage).length;
                const sc = STAGE_CONFIG[stage];
                return (
                  <div key={stage} className="flex-1 text-center">
                    <div className="h-2 rounded-full mb-1.5" style={{ backgroundColor: count > 0 ? sc.color : "#e8e8e8" }} />
                    <p className="text-xs font-semibold" style={{ color: count > 0 ? sc.color : "#8a8680" }}>{count}</p>
                    <p className="text-[9px] text-[var(--saptta-mute)]">{sc.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-2">Job Description</h3>
            <p className="text-sm text-[var(--saptta-ink-2)] leading-relaxed">{job.description}</p>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-2">Requirements</h3>
            <ul className="space-y-1.5">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--saptta-ink-2)]">
                  <CheckCircle2 className="size-3.5 text-[#c8e056] mt-0.5 shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Responsibilities */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-2">Responsibilities</h3>
            <ul className="space-y-1.5">
              {job.responsibilities.map((resp, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--saptta-ink-2)]">
                  <ArrowRight className="size-3.5 text-[var(--saptta-accent)] mt-0.5 shrink-0" />
                  {resp}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────── Pipeline Tab (Kanban) ──────────────── */

function PipelineTab({
  candidates,
  onMoveStage,
}: {
  candidates: Candidate[];
  onMoveStage: (id: string, stage: PipelineStage) => void;
}) {
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
    const map: Record<PipelineStage, Candidate[]> = {
      sourced: [], screening: [], interview: [], assessment: [], offer: [], hired: [], rejected: [],
    };
    filtered.forEach((c) => map[c.stage].push(c));
    return map;
  }, [filtered]);

  const sources = useMemo(() => [...new Set(candidates.map((c) => c.source))], [candidates]);

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-[var(--saptta-mute)]" />
          <span className="text-xs text-[var(--saptta-mute)] font-medium">Filters:</span>
        </div>
        <Select value={jobFilter} onValueChange={setJobFilter}>
          <SelectTrigger className="h-8 text-xs rounded-full w-[200px]">
            <SelectValue placeholder="All Jobs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {MOCK_JOBS.map((j) => (
              <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="h-8 text-xs rounded-full w-[160px]">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="rounded-full text-[10px] px-3">
          {filtered.length} candidates
        </Badge>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-[1200px]">
          {STAGE_ORDER.map((stage) => {
            const cfg = STAGE_CONFIG[stage];
            const stageCandidates = grouped[stage];
            return (
              <div key={stage} className="flex-1 min-w-[160px]">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <span className="text-xs font-semibold text-[var(--saptta-ink)]">{cfg.label}</span>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: cfg.bgColor, color: cfg.color }}
                  >
                    {stageCandidates.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2 min-h-[120px]">
                  <AnimatePresence mode="popLayout">
                    {stageCandidates.map((c) => (
                      <motion.div
                        key={c.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -8 }}
                        transition={{ duration: 0.3, ease: [0.22, 0.8, 0.22, 1] }}
                      >
                        <Card
                          className="border-[var(--saptta-line)] rounded-[16px] cursor-pointer hover:shadow-md transition-all duration-300 hover:border-[var(--saptta-accent)]/30 group"
                          onClick={() => {
                            setSelectedCandidate(c);
                            setDetailOpen(true);
                          }}
                        >
                          <CardContent className="p-3 space-y-2.5">
                            <div className="flex items-center gap-2">
                              <Avatar className="size-7 rounded-lg">
                                <AvatarFallback
                                  className="rounded-lg text-[10px] font-bold"
                                  style={{ backgroundColor: getScoreBgColor(c.matchScore), color: getScoreColor(c.matchScore) }}
                                >
                                  {c.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-[var(--saptta-ink)] truncate">{c.name}</p>
                                <p className="text-[10px] text-[var(--saptta-mute)] truncate">{c.role}</p>
                              </div>
                            </div>

                            <ScoreBar value={c.matchScore} />

                            <div className="flex items-center justify-between">
                              <Badge
                                variant="outline"
                                className="text-[9px] rounded-full h-5 px-1.5 border-0"
                                style={{ backgroundColor: cfg.bgColor, color: cfg.color }}
                              >
                                {c.source}
                              </Badge>
                              <span className="text-[10px] text-[var(--saptta-mute)] flex items-center gap-0.5">
                                <Clock className="size-2.5" /> {c.daysInStage}d
                              </span>
                            </div>

                            {/* Quick move button */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex gap-1">
                                {STAGE_ORDER.filter((s) => s !== c.stage && s !== "rejected").slice(0, 3).map((s) => {
                                  const sc = STAGE_CONFIG[s];
                                  const nextIdx = STAGE_ORDER.indexOf(c.stage) + 1;
                                  const isNext = STAGE_ORDER.indexOf(s) === nextIdx;
                                  if (!isNext) return null;
                                  return (
                                    <Button
                                      key={s}
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 text-[9px] rounded-full px-2 w-full"
                                      style={{ backgroundColor: sc.bgColor, color: sc.color }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onMoveStage(c.id, s);
                                      }}
                                    >
                                      <ArrowRight className="size-2.5 mr-0.5" />
                                      {sc.label}
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

      {/* Candidate Detail Dialog */}
      <CandidateDetailDialog
        candidate={selectedCandidate}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onMoveStage={onMoveStage}
      />
    </div>
  );
}

/* ──────────────── Jobs Tab ──────────────── */

function JobsTab({ candidates }: { candidates: Candidate[] }) {
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [jobDetailOpen, setJobDetailOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--saptta-mute)]">{MOCK_JOBS.filter((j) => j.status === "open").length} active positions</p>
        </div>
        <Button className="rounded-full bg-[#ff6a2c] text-white hover:bg-[#ff6a2c]/90 h-8 text-xs px-4">
          <Plus className="size-3.5 mr-1.5" />
          Create Job
        </Button>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_JOBS.map((job, i) => {
          const statusCfg = JOB_STATUS_CONFIG[job.status];
          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 0.8, 0.22, 1] }}
            >
              <Card
                className="border-[var(--saptta-line)] rounded-[24px] hover:shadow-lg transition-all duration-300 hover:border-[var(--saptta-accent)]/30 cursor-pointer group"
                onClick={() => {
                  setSelectedJob(job);
                  setJobDetailOpen(true);
                }}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Title Row */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[var(--saptta-ink)] truncate">{job.title}</h3>
                        {job.urgent && (
                          <Badge className="bg-red-50 text-red-500 text-[9px] rounded-full border-0 px-1.5 py-0 h-4">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-[var(--saptta-mute)] mt-0.5">{job.department}</p>
                    </div>
                    <Badge
                      className="rounded-full text-[10px] font-medium border-0 px-2.5 py-0.5 shrink-0"
                      style={{ backgroundColor: statusCfg.bgColor, color: statusCfg.color }}
                    >
                      {statusCfg.label}
                    </Badge>
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--saptta-mute)]">
                      <MapPin className="size-3" /> {job.location}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--saptta-mute)]">
                      <IndianRupee className="size-3" /> {job.salary}
                    </div>
                  </div>

                  <Separator />

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-lg font-bold text-[var(--saptta-ink)]">{job.openings}</p>
                      <p className="text-[10px] text-[var(--saptta-mute)]">Openings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-[var(--saptta-accent)]">{job.applicants}</p>
                      <p className="text-[10px] text-[var(--saptta-mute)]">Applicants</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-[var(--saptta-ink-2)]">{job.daysOpen}</p>
                      <p className="text-[10px] text-[var(--saptta-mute)]">Days Open</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[var(--saptta-mute)]">Posted {job.postedDate}</span>
                    <ChevronRight className="size-4 text-[var(--saptta-mute)] group-hover:text-[var(--saptta-accent)] transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Job Detail Dialog */}
      <JobDetailDialog
        job={selectedJob}
        open={jobDetailOpen}
        onOpenChange={setJobDetailOpen}
        candidates={candidates}
      />
    </div>
  );
}

/* ──────────────── Candidates Tab ──────────────── */

function CandidatesTab({
  candidates,
  onMoveStage,
}: {
  candidates: Candidate[];
  onMoveStage: (id: string, stage: PipelineStage) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return candidates;
    const q = search.toLowerCase();
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.source.toLowerCase().includes(q)
    );
  }, [candidates, search]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--saptta-mute)]" />
          <Input
            placeholder="Search candidates by name, email, role..."
            className="pl-9 h-9 rounded-full text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Badge variant="outline" className="rounded-full text-[10px] px-3">
          {filtered.length} results
        </Badge>
      </div>

      {/* Table */}
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
                  <TableRow
                    key={c.id}
                    className="cursor-pointer hover:bg-[var(--saptta-bg-2)] transition-colors"
                    onClick={() => {
                      setSelectedCandidate(c);
                      setDetailOpen(true);
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 rounded-lg">
                          <AvatarFallback
                            className="rounded-lg text-[10px] font-bold"
                            style={{ backgroundColor: getScoreBgColor(c.matchScore), color: getScoreColor(c.matchScore) }}
                          >
                            {c.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-[var(--saptta-ink)]">{c.name}</p>
                          <p className="text-[11px] text-[var(--saptta-mute)]">{c.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] rounded-full border-0 bg-[var(--saptta-bg-2)] px-2 py-0.5">
                        {c.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-[var(--saptta-ink-2)]">{c.role}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="rounded-full text-[10px] font-medium border-0 px-2.5 py-0.5"
                        style={{ backgroundColor: stageCfg.bgColor, color: stageCfg.color }}
                      >
                        {stageCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <ScoreBar value={c.matchScore} showLabel={false} />
                        <span className="text-xs font-semibold" style={{ color: getScoreColor(c.matchScore) }}>
                          {c.matchScore}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-[var(--saptta-mute)]">{c.lastActivity}</span>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="size-4 text-[var(--saptta-mute)]" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Candidate Detail Dialog */}
      <CandidateDetailDialog
        candidate={selectedCandidate}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onMoveStage={onMoveStage}
      />
    </div>
  );
}

/* ──────────────── AI Tools Tab ──────────────── */

function AIToolsTab() {
  const [resumeFile, setResumeFile] = useState<string | null>(null);
  const [resumeParsed, setResumeParsed] = useState(false);
  const [jdText, setJdText] = useState("");
  const [jdGenerated, setJdGenerated] = useState(false);
  const [jdGenerating, setJdGenerating] = useState(false);
  const [jdInput, setJdInput] = useState({ title: "", department: "", level: "", skills: "" });
  const [generatedJD, setGeneratedJD] = useState("");

  const handleResumeUpload = () => {
    setResumeFile("resume_ananya_krishnan.pdf");
    setTimeout(() => setResumeParsed(true), 1500);
  };

  const handleJDGenerate = () => {
    setJdGenerating(true);
    setTimeout(() => {
      setJdGenerated(true);
      setJdGenerating(false);
      setGeneratedJD(`# ${jdInput.title || "Senior Software Engineer"}

## About the Role
We are seeking an experienced ${jdInput.title || "Senior Software Engineer"} to join our ${jdInput.department || "Engineering"} team. This role requires deep expertise in ${jdInput.skills || "modern web technologies"} and a passion for building scalable, high-performance applications.

## Key Responsibilities
- Lead technical design and architecture decisions for critical systems
- Mentor and develop junior engineers through code reviews and pair programming
- Build and maintain robust, scalable services that serve millions of users
- Collaborate with product managers and designers to ship features
- Drive best practices in code quality, testing, and documentation
- Participate in on-call rotations and incident response

## Required Qualifications
- 5+ years of professional software development experience
- Expert-level proficiency in ${jdInput.skills || "React, TypeScript, Node.js"}
- Strong understanding of distributed systems and microservices
- Experience with cloud platforms (AWS, GCP, or Azure)
- Excellent communication and collaboration skills
- Bachelor's degree in Computer Science or equivalent experience

## Nice to Have
- Experience with ${jdInput.level === "Senior" ? "team leadership" : "mentoring"}
- Contributions to open source projects
- Experience with CI/CD pipelines and DevOps practices
- Knowledge of performance optimization techniques

## What We Offer
- Competitive salary and equity package
- Flexible work arrangements
- Learning and development budget
- Health, dental, and vision insurance
- Generous PTO and parental leave`);
    }, 2500);
  };

  const resumeFields = [
    { field: "Full Name", value: "Ananya Krishnan", confidence: 98 },
    { field: "Email", value: "ananya.k@gmail.com", confidence: 99 },
    { field: "Phone", value: "+91 98765 43210", confidence: 95 },
    { field: "Location", value: "Bangalore, India", confidence: 92 },
    { field: "Experience", value: "6 years", confidence: 88 },
    { field: "Education", value: "B.Tech, IIT Delhi", confidence: 94 },
    { field: "Skills", value: "React, TypeScript, Next.js, Node.js", confidence: 91 },
    { field: "Current Company", value: "TechCorp India", confidence: 85 },
  ];

  const jdMatches = [
    { name: "Ananya Krishnan", score: 92, avatar: "AK" },
    { name: "Rohan Patel", score: 85, avatar: "RP" },
    { name: "Lakshmi Venkat", score: 79, avatar: "LV" },
    { name: "Karthik Reddy", score: 68, avatar: "KR" },
    { name: "Nikhil Joshi", score: 64, avatar: "NJ" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Resume Parser Card */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <Card className="border-[var(--saptta-line)] rounded-[24px] overflow-hidden">
          {/* Orange gradient header */}
          <div className="bg-gradient-to-r from-[#ff6a2c] to-[#ff8f5c] p-5">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-[16px] bg-white/20 flex items-center justify-center">
                <Brain className="size-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Resume Parser</h3>
                <p className="text-xs text-white/70">AI-powered resume extraction</p>
              </div>
            </div>
          </div>
          <CardContent className="p-5 space-y-4">
            {/* Upload Area */}
            {!resumeFile ? (
              <div
                className="border-2 border-dashed border-[var(--saptta-line)] rounded-[16px] p-8 text-center hover:border-[var(--saptta-accent)]/50 transition-colors cursor-pointer"
                onClick={handleResumeUpload}
              >
                <Upload className="size-8 text-[var(--saptta-mute)] mx-auto mb-3" />
                <p className="text-sm font-medium text-[var(--saptta-ink)]">Drop resume here or click to upload</p>
                <p className="text-xs text-[var(--saptta-mute)] mt-1">Supports PDF, DOCX, DOC (Max 10MB)</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File uploaded */}
                <div className="flex items-center gap-3 bg-[var(--saptta-bg-2)] rounded-xl p-3">
                  <div className="size-10 rounded-lg bg-[#ff6a2c15] flex items-center justify-center">
                    <FileText className="size-5 text-[#ff6a2c]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--saptta-ink)] truncate">{resumeFile}</p>
                    <p className="text-[10px] text-[var(--saptta-mute)]">245 KB · Uploaded just now</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-7 rounded-full p-0"
                    onClick={() => {
                      setResumeFile(null);
                      setResumeParsed(false);
                    }}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>

                {/* Parsed Results */}
                {resumeParsed ? (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="size-4 text-[#22c55e]" />
                      <span className="text-xs font-semibold text-[#22c55e]">Parsing Complete</span>
                    </div>
                    {resumeFields.map((field) => (
                      <div key={field.field} className="flex items-center gap-3">
                        <span className="text-[11px] text-[var(--saptta-mute)] w-28 shrink-0">{field.field}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[var(--saptta-ink)] truncate">{field.value}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="w-12 h-1 bg-[#e8e8e8] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${field.confidence}%`,
                                backgroundColor: field.confidence >= 90 ? "#22c55e" : field.confidence >= 80 ? "#c8e056" : "#f59e0b",
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold min-w-[24px] text-right" style={{
                            color: field.confidence >= 90 ? "#22c55e" : field.confidence >= 80 ? "#c8e056" : "#f59e0b"
                          }}>
                            {field.confidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="size-5 text-[var(--saptta-accent)] animate-spin mr-2" />
                    <span className="text-sm text-[var(--saptta-mute)]">Parsing resume...</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* JD Scoring Card */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <Card className="border-[var(--saptta-line)] rounded-[24px] overflow-hidden">
          {/* Orange gradient header */}
          <div className="bg-gradient-to-r from-[#c8e056] to-[#d4e87a] p-5">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-[16px] bg-white/20 flex items-center justify-center">
                <Target className="size-5 text-[#0a0a0a]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0a0a0a]">JD Scoring</h3>
                <p className="text-xs text-[#0a0a0a]/70">Match candidates to job descriptions</p>
              </div>
            </div>
          </div>
          <CardContent className="p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--saptta-ink)] mb-1.5 block">Job Description</label>
              <Textarea
                placeholder="Paste a job description here to find matching candidates..."
                className="min-h-[80px] text-xs rounded-xl resize-none"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            </div>

            {jdText.length > 20 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-3.5 text-[var(--saptta-accent)]" />
                  <span className="text-xs font-semibold text-[var(--saptta-ink)]">AI-Matched Candidates</span>
                </div>
                {jdMatches.map((match, i) => (
                  <motion.div
                    key={match.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3, ease: [0.22, 0.8, 0.22, 1] }}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="size-7 rounded-lg">
                      <AvatarFallback
                        className="rounded-lg text-[9px] font-bold"
                        style={{ backgroundColor: getScoreBgColor(match.score), color: getScoreColor(match.score) }}
                      >
                        {match.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-[var(--saptta-ink)] w-28 truncate">{match.name}</span>
                    <div className="flex-1">
                      <ScoreBar value={match.score} showLabel={false} />
                    </div>
                    <span className="text-xs font-semibold min-w-[32px] text-right" style={{ color: getScoreColor(match.score) }}>
                      {match.score}%
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!jdText && (
              <div className="text-center py-6">
                <FileUp className="size-8 text-[var(--saptta-mute)] mx-auto mb-2" />
                <p className="text-xs text-[var(--saptta-mute)]">Paste a JD above to see AI-ranked matches</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* AI JD Generator Card - Full Width */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-2">
        <Card className="border-[var(--saptta-line)] rounded-[24px] overflow-hidden">
          {/* Orange gradient header */}
          <div className="bg-gradient-to-r from-[#0a0a0b] to-[#2b2b2b] p-5">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-[16px] bg-[#ff6a2c]/20 flex items-center justify-center">
                <Zap className="size-5 text-[#ff6a2c]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AI JD Generator</h3>
                <p className="text-xs text-white/60">Generate professional job descriptions with AI</p>
              </div>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[var(--saptta-ink)] mb-1.5 block">Job Title</label>
                  <Input
                    placeholder="e.g., Senior Frontend Developer"
                    className="h-9 rounded-xl text-xs"
                    value={jdInput.title}
                    onChange={(e) => setJdInput({ ...jdInput, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--saptta-ink)] mb-1.5 block">Department</label>
                  <Input
                    placeholder="e.g., Engineering"
                    className="h-9 rounded-xl text-xs"
                    value={jdInput.department}
                    onChange={(e) => setJdInput({ ...jdInput, department: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--saptta-ink)] mb-1.5 block">Seniority Level</label>
                  <Select value={jdInput.level} onValueChange={(v) => setJdInput({ ...jdInput, level: v })}>
                    <SelectTrigger className="h-9 rounded-xl text-xs">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Junior">Junior</SelectItem>
                      <SelectItem value="Mid">Mid-Level</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Principal">Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--saptta-ink)] mb-1.5 block">Key Skills</label>
                  <Input
                    placeholder="e.g., React, TypeScript, Node.js"
                    className="h-9 rounded-xl text-xs"
                    value={jdInput.skills}
                    onChange={(e) => setJdInput({ ...jdInput, skills: e.target.value })}
                  />
                </div>
                <Button
                  className="w-full rounded-full bg-[#ff6a2c] text-white hover:bg-[#ff6a2c]/90 h-9 text-xs"
                  onClick={handleJDGenerate}
                  disabled={jdGenerating}
                >
                  {jdGenerating ? (
                    <>
                      <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5 mr-1.5" />
                      Generate JD
                    </>
                  )}
                </Button>
              </div>

              {/* Generated JD Preview */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="size-4 text-[var(--saptta-accent)]" />
                  <span className="text-xs font-semibold text-[var(--saptta-ink)]">Preview</span>
                </div>
                {generatedJD ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--saptta-bg-2)] rounded-[16px] p-4 max-h-[380px] overflow-y-auto"
                  >
                    <div className="prose prose-sm max-w-none text-[var(--saptta-ink-2)]">
                      {generatedJD.split("\n").map((line, i) => {
                        if (line.startsWith("# ")) return <h2 key={i} className="text-lg font-bold text-[var(--saptta-ink)] mt-0 mb-2">{line.slice(2)}</h2>;
                        if (line.startsWith("## ")) return <h3 key={i} className="text-sm font-semibold text-[var(--saptta-ink)] mt-3 mb-1">{line.slice(3)}</h3>;
                        if (line.startsWith("- ")) return <li key={i} className="text-xs text-[var(--saptta-ink-2)] ml-3">{line.slice(2)}</li>;
                        if (line.trim() === "") return <div key={i} className="h-1" />;
                        return <p key={i} className="text-xs text-[var(--saptta-ink-2)] leading-relaxed">{line}</p>;
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-[var(--saptta-bg-2)] rounded-[16px] p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
                    <FileText className="size-8 text-[var(--saptta-mute)] mx-auto mb-2" />
                    <p className="text-xs text-[var(--saptta-mute)]">Generated job description will appear here</p>
                    <p className="text-[10px] text-[var(--saptta-mute)] mt-1">Fill in the form and click Generate</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ──────────────── Main Recruitment View ──────────────── */

export function RecruitmentView() {
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);

  const handleMoveStage = useCallback((candidateId: string, newStage: PipelineStage) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? { ...c, stage: newStage, daysInStage: 0 }
          : c
      )
    );
  }, []);

  // Summary stats
  const stats = useMemo(() => {
    const activeCandidates = candidates.filter((c) => c.stage !== "rejected" && c.stage !== "hired");
    const openJobs = MOCK_JOBS.filter((j) => j.status === "open").length;
    const avgScore = Math.round(
      candidates.reduce((sum, c) => sum + c.matchScore, 0) / candidates.length
    );
    const interviewCount = candidates.filter((c) => c.stage === "interview").length;
    return { activeCandidates: activeCandidates.length, openJobs, avgScore, interviewCount };
  }, [candidates]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Page Header */}
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--saptta-ink)] tracking-tight">
            Recruitment
          </h1>
          <p className="text-[var(--saptta-mute)] mt-1 text-sm">
            Track job postings, candidates, and your hiring pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="rounded-xl bg-[var(--saptta-accent)] text-white text-xs hover:bg-[var(--saptta-accent)]/90">
            <Plus className="size-3.5 mr-1.5" />
            New Job Posting
          </Button>
        </div>
      </motion.div>

      {/* Summary Stats Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Users, label: "Active Candidates", value: stats.activeCandidates, color: "#ff6a2c" },
          { icon: Briefcase, label: "Open Positions", value: stats.openJobs, color: "#c8e056" },
          { icon: Target, label: "Avg Match Score", value: `${stats.avgScore}%`, color: "#f59e0b" },
          { icon: Calendar, label: "Interviews This Week", value: stats.interviewCount, color: "#8b5cf6" },
        ].map((stat) => (
          <Card key={stat.label} className="border-[var(--saptta-line)] rounded-[20px] hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className="size-9 flex items-center justify-center rounded-[14px]"
                  style={{ backgroundColor: `${stat.color}12`, color: stat.color }}
                >
                  <stat.icon className="size-4" />
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--saptta-ink)] leading-none">{stat.value}</p>
                  <p className="text-[10px] text-[var(--saptta-mute)] mt-0.5">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Tabs */}
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="pipeline" className="space-y-4">
          <TabsList className="bg-[var(--saptta-bg-2)] rounded-full p-1 h-auto">
            <TabsTrigger
              value="pipeline"
              className="rounded-full text-xs data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-1.5"
            >
              <BarChart3 className="size-3.5 mr-1.5" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="rounded-full text-xs data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-1.5"
            >
              <Briefcase className="size-3.5 mr-1.5" />
              Jobs
            </TabsTrigger>
            <TabsTrigger
              value="candidates"
              className="rounded-full text-xs data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-1.5"
            >
              <Users className="size-3.5 mr-1.5" />
              Candidates
            </TabsTrigger>
            <TabsTrigger
              value="ai-tools"
              className="rounded-full text-xs data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-1.5"
            >
              <Sparkles className="size-3.5 mr-1.5" />
              AI Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline">
            <PipelineTab candidates={candidates} onMoveStage={handleMoveStage} />
          </TabsContent>

          <TabsContent value="jobs">
            <JobsTab candidates={candidates} />
          </TabsContent>

          <TabsContent value="candidates">
            <CandidatesTab candidates={candidates} onMoveStage={handleMoveStage} />
          </TabsContent>

          <TabsContent value="ai-tools">
            <AIToolsTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
