"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Award, Star, TrendingUp, Plus, ChevronDown, ChevronRight,
  Calendar, Users, MessageSquare, BarChart3, Clock, CheckCircle2,
  AlertCircle, ArrowRight, Search, Filter, Send, Eye, ThumbsUp,
  ThumbsDown, Minus, X, ChevronUp, Layers, GitBranch, Zap,
  UserCheck, FileText, Gauge, CircleDot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

/* ─── Animation Variants ─── */
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 0.8, 0.22, 1] } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.22, 0.8, 0.22, 1] } },
};
const slideRight = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 0.8, 0.22, 1] } },
};

/* ─── Types ─── */
interface KeyResult {
  id: string;
  title: string;
  progress: number;
  target: string;
  current: string;
}

interface Milestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
}

interface CompanyOKR {
  id: string;
  title: string;
  progress: number;
  owner: string;
  keyResults: KeyResult[];
  departmentOKRs: DepartmentOKR[];
}

interface DepartmentOKR {
  id: string;
  title: string;
  department: string;
  progress: number;
  owner: string;
}

interface IndividualGoal {
  id: string;
  employeeName: string;
  employeeInitials: string;
  goalTitle: string;
  progress: number;
  dueDate: string;
  status: "On Track" | "At Risk" | "Behind" | "Completed";
  keyResults: KeyResult[];
  milestones: Milestone[];
}

interface AppraisalEmployee {
  id: string;
  name: string;
  initials: string;
  department: string;
  selfRating: number | null;
  managerRating: number | null;
  finalRating: number | null;
  status: "Not Started" | "In Progress" | "Completed" | "Overdue";
}

interface FeedbackRequest {
  id: string;
  requestedBy: string;
  requestedByInitials: string;
  targetEmployee: string;
  targetInitials: string;
  deadline: string;
  status: "Pending" | "Completed" | "Declined";
  relationship: "Peer" | "Manager" | "Direct Report" | "Cross-functional";
}

interface FeedbackReceived {
  id: string;
  from: string;
  fromInitials: string;
  rating: number;
  strengths: string;
  improvements: string;
  date: string;
  relationship: string;
}

interface NineBoxEmployee {
  id: string;
  name: string;
  initials: string;
  department: string;
  performance: "Low" | "Medium" | "High";
  potential: "Low" | "Medium" | "High";
}

/* ─── Mock Data ─── */
const companyOKRs: CompanyOKR[] = [
  {
    id: "okr1",
    title: "Achieve $50M ARR by Q4 2026",
    progress: 68,
    owner: "CEO - Meera Sharma",
    keyResults: [
      { id: "kr1", title: "Close 120 enterprise deals", progress: 72, target: "120", current: "86" },
      { id: "kr2", title: "Reduce churn rate to <3%", progress: 85, target: "<3%", current: "3.4%" },
      { id: "kr3", title: "Launch 3 new product lines", progress: 33, target: "3", current: "1" },
    ],
    departmentOKRs: [
      { id: "dokr1", title: "Generate 4,500 qualified MQLs", department: "Marketing", progress: 74, owner: "Ravi Kumar" },
      { id: "dokr2", title: "Achieve 85% win rate on enterprise demos", department: "Sales", progress: 62, owner: "Anita Desai" },
    ],
  },
  {
    id: "okr2",
    title: "Improve Employee NPS to 75+",
    progress: 52,
    owner: "CHRO - Priya Nair",
    keyResults: [
      { id: "kr4", title: "Launch flexible work program", progress: 90, target: "100%", current: "90%" },
      { id: "kr5", title: "Reduce attrition to <8%", progress: 45, target: "<8%", current: "11.2%" },
      { id: "kr6", title: "Implement skill development for 80% of staff", progress: 38, target: "80%", current: "30%" },
    ],
    departmentOKRs: [
      { id: "dokr3", title: "Complete 500 L&D certifications", department: "L&D", progress: 41, owner: "Sunil Menon" },
      { id: "dokr4", title: "Launch peer recognition program", department: "HR", progress: 85, owner: "Kavitha Rao" },
    ],
  },
  {
    id: "okr3",
    title: "Launch Product V3.0 with AI Features",
    progress: 81,
    owner: "CTO - Arjun Mehta",
    keyResults: [
      { id: "kr7", title: "Ship AI assistant module", progress: 95, target: "1", current: "1" },
      { id: "kr8", title: "Achieve 99.9% uptime", progress: 88, target: "99.9%", current: "99.87%" },
      { id: "kr9", title: "Reduce API latency to <100ms", progress: 70, target: "<100ms", current: "132ms" },
    ],
    departmentOKRs: [
      { id: "dokr5", title: "Migrate 100% services to K8s", department: "DevOps", progress: 78, owner: "Deepak Joshi" },
      { id: "dokr6", title: "Train team on LLM integration", department: "Engineering", progress: 92, owner: "Neha Gupta" },
    ],
  },
  {
    id: "okr4",
    title: "Expand to 3 New Markets (SEA, MEA, LATAM)",
    progress: 35,
    owner: "CBO - Vikram Patel",
    keyResults: [
      { id: "kr10", title: "Establish local teams in 3 regions", progress: 44, target: "3", current: "1" },
      { id: "kr11", title: "Sign 30 regional partnerships", progress: 20, target: "30", current: "6" },
      { id: "kr12", title: "Achieve $2M pipeline per region", progress: 28, target: "$2M", current: "$340K" },
    ],
    departmentOKRs: [
      { id: "dokr7", title: "Complete market research for SEA", department: "Strategy", progress: 60, owner: "Lakshmi Iyer" },
    ],
  },
  {
    id: "okr5",
    title: "Achieve SOC 2 Type II Compliance",
    progress: 92,
    owner: "CISO - Rohan Singh",
    keyResults: [
      { id: "kr13", title: "Complete security audit", progress: 100, target: "1", current: "1" },
      { id: "kr14", title: "Implement 100% policy controls", progress: 88, target: "100%", current: "88%" },
      { id: "kr15", title: "Train all employees on security", progress: 95, target: "100%", current: "95%" },
    ],
    departmentOKRs: [
      { id: "dokr8", title: "Zero critical vulnerabilities", department: "Security", progress: 96, owner: "Maya Reddy" },
    ],
  },
];

const individualGoals: IndividualGoal[] = [
  { id: "ig1", employeeName: "Ananya Krishnan", employeeInitials: "AK", goalTitle: "Complete AWS Solutions Architect Certification", progress: 75, dueDate: "2026-07-15", status: "On Track", keyResults: [{ id: "kig1", title: "Complete all 6 course modules", progress: 83, target: "6", current: "5" }, { id: "kig2", title: "Pass practice exams with 85%+", progress: 60, target: "85%", current: "72%" }], milestones: [{ id: "m1", title: "Enroll in course", date: "2026-03-01", completed: true }, { id: "m2", title: "Complete modules 1-3", date: "2026-04-15", completed: true }, { id: "m3", title: "Pass mock exam", date: "2026-06-01", completed: false }, { id: "m4", title: "Take certification exam", date: "2026-07-15", completed: false }] },
  { id: "ig2", employeeName: "Rahul Verma", employeeInitials: "RV", goalTitle: "Lead Q2 product launch campaign", progress: 45, dueDate: "2026-06-30", status: "At Risk", keyResults: [{ id: "kig3", title: "Create launch assets for 5 channels", progress: 40, target: "5", current: "2" }, { id: "kig4", title: "Generate 500 sign-ups from campaign", progress: 50, target: "500", current: "250" }], milestones: [{ id: "m5", title: "Finalize campaign strategy", date: "2026-04-01", completed: true }, { id: "m6", title: "Launch social media blitz", date: "2026-05-15", completed: false }, { id: "m7", title: "Post-launch review", date: "2026-06-30", completed: false }] },
  { id: "ig3", employeeName: "Priya Sharma", employeeInitials: "PS", goalTitle: "Reduce customer onboarding time by 30%", progress: 88, dueDate: "2026-06-15", status: "On Track", keyResults: [{ id: "kig5", title: "Automate 5 onboarding steps", progress: 80, target: "5", current: "4" }, { id: "kig6", title: "Create self-service knowledge base", progress: 95, target: "50 articles", current: "48" }], milestones: [{ id: "m8", title: "Audit current onboarding flow", date: "2026-03-15", completed: true }, { id: "m9", title: "Deploy automation scripts", date: "2026-05-01", completed: true }, { id: "m10", title: "Measure final onboarding time", date: "2026-06-15", completed: false }] },
  { id: "ig4", employeeName: "Karthik Nair", employeeInitials: "KN", goalTitle: "Build real-time analytics dashboard", progress: 20, dueDate: "2026-08-30", status: "Behind", keyResults: [{ id: "kig7", title: "Design dashboard wireframes", progress: 40, target: "8 screens", current: "3" }, { id: "kig8", title: "Implement data pipeline", progress: 10, target: "5 sources", current: "1" }], milestones: [{ id: "m11", title: "Requirements gathering", date: "2026-05-01", completed: true }, { id: "m12", title: "MVP dashboard", date: "2026-07-01", completed: false }, { id: "m13", title: "Full deployment", date: "2026-08-30", completed: false }] },
  { id: "ig5", employeeName: "Divya Reddy", employeeInitials: "DR", goalTitle: "Implement DEI hiring initiative", progress: 100, dueDate: "2026-05-01", status: "Completed", keyResults: [{ id: "kig9", title: "Update job descriptions for inclusive language", progress: 100, target: "40", current: "40" }, { id: "kig10", title: "Partner with 10 diversity organizations", progress: 100, target: "10", current: "10" }], milestones: [{ id: "m14", title: "Audit current JDs", date: "2026-02-01", completed: true }, { id: "m15", title: "Launch partnerships", date: "2026-03-15", completed: true }, { id: "m16", title: "Report outcomes", date: "2026-05-01", completed: true }] },
  { id: "ig6", employeeName: "Suresh Menon", employeeInitials: "SM", goalTitle: "Migrate legacy DB to PostgreSQL", progress: 62, dueDate: "2026-09-01", status: "On Track", keyResults: [{ id: "kig11", title: "Migrate 12 database schemas", progress: 58, target: "12", current: "7" }, { id: "kig12", title: "Zero data loss validation", progress: 50, target: "100%", current: "50%" }], milestones: [{ id: "m17", title: "Schema mapping complete", date: "2026-05-15", completed: true }, { id: "m18", title: "Test migration", date: "2026-07-01", completed: false }, { id: "m19", title: "Go live", date: "2026-09-01", completed: false }] },
];

const appraisalEmployees: AppraisalEmployee[] = [
  { id: "ap1", name: "Ananya Krishnan", initials: "AK", department: "Engineering", selfRating: 4.5, managerRating: 4.2, finalRating: 4.3, status: "Completed" },
  { id: "ap2", name: "Rahul Verma", initials: "RV", department: "Marketing", selfRating: 3.8, managerRating: 3.5, finalRating: 3.6, status: "Completed" },
  { id: "ap3", name: "Priya Sharma", initials: "PS", department: "Customer Success", selfRating: 4.7, managerRating: 4.8, finalRating: null, status: "In Progress" },
  { id: "ap4", name: "Karthik Nair", initials: "KN", department: "Engineering", selfRating: null, managerRating: null, finalRating: null, status: "Not Started" },
  { id: "ap5", name: "Divya Reddy", initials: "DR", department: "HR", selfRating: 4.0, managerRating: 4.3, finalRating: 4.2, status: "Completed" },
  { id: "ap6", name: "Suresh Menon", initials: "SM", department: "DevOps", selfRating: 3.5, managerRating: null, finalRating: null, status: "In Progress" },
  { id: "ap7", name: "Meena Iyer", initials: "MI", department: "Finance", selfRating: 4.2, managerRating: 4.0, finalRating: null, status: "In Progress" },
  { id: "ap8", name: "Vikram Desai", initials: "VD", department: "Sales", selfRating: 3.2, managerRating: 2.8, finalRating: null, status: "Overdue" },
  { id: "ap9", name: "Neha Gupta", initials: "NG", department: "Engineering", selfRating: 4.8, managerRating: 4.9, finalRating: 4.9, status: "Completed" },
  { id: "ap10", name: "Arjun Patel", initials: "AP", department: "Product", selfRating: null, managerRating: null, finalRating: null, status: "Not Started" },
  { id: "ap11", name: "Kavitha Rao", initials: "KR", department: "HR", selfRating: 4.1, managerRating: 4.4, finalRating: 4.3, status: "Completed" },
  { id: "ap12", name: "Deepak Joshi", initials: "DJ", department: "DevOps", selfRating: 3.9, managerRating: null, finalRating: null, status: "In Progress" },
  { id: "ap13", name: "Lakshmi Iyer", initials: "LI", department: "Strategy", selfRating: null, managerRating: null, finalRating: null, status: "Overdue" },
  { id: "ap14", name: "Rohan Singh", initials: "RS", department: "Security", selfRating: 4.6, managerRating: 4.5, finalRating: 4.5, status: "Completed" },
  { id: "ap15", name: "Maya Reddy", initials: "MR", department: "Security", selfRating: 3.7, managerRating: 3.9, finalRating: null, status: "In Progress" },
];

const feedbackRequests: FeedbackRequest[] = [
  { id: "fb1", requestedBy: "Ananya Krishnan", requestedByInitials: "AK", targetEmployee: "Rahul Verma", targetInitials: "RV", deadline: "2026-06-20", status: "Pending", relationship: "Peer" },
  { id: "fb2", requestedBy: "Priya Sharma", requestedByInitials: "PS", targetEmployee: "Ananya Krishnan", targetInitials: "AK", deadline: "2026-06-18", status: "Pending", relationship: "Direct Report" },
  { id: "fb3", requestedBy: "Karthik Nair", requestedByInitials: "KN", targetEmployee: "Neha Gupta", targetInitials: "NG", deadline: "2026-06-25", status: "Pending", relationship: "Cross-functional" },
  { id: "fb4", requestedBy: "Divya Reddy", requestedByInitials: "DR", targetEmployee: "Kavitha Rao", targetInitials: "KR", deadline: "2026-06-10", status: "Completed", relationship: "Peer" },
  { id: "fb5", requestedBy: "Meena Iyer", requestedByInitials: "MI", targetEmployee: "Suresh Menon", targetInitials: "SM", deadline: "2026-06-15", status: "Pending", relationship: "Manager" },
  { id: "fb6", requestedBy: "Vikram Desai", requestedByInitials: "VD", targetEmployee: "Rahul Verma", targetInitials: "RV", deadline: "2026-06-22", status: "Declined", relationship: "Peer" },
  { id: "fb7", requestedBy: "Rohan Singh", requestedByInitials: "RS", targetEmployee: "Maya Reddy", targetInitials: "MR", deadline: "2026-06-28", status: "Pending", relationship: "Manager" },
  { id: "fb8", requestedBy: "Lakshmi Iyer", requestedByInitials: "LI", targetEmployee: "Arjun Patel", targetInitials: "AP", deadline: "2026-06-12", status: "Completed", relationship: "Cross-functional" },
];

const feedbackReceived: FeedbackReceived[] = [
  { id: "fr1", from: "Rahul Verma", fromInitials: "RV", rating: 4, strengths: "Excellent problem solver, always willing to help teammates, strong communication skills.", improvements: "Could improve on documentation practices and keeping stakeholders updated on progress.", date: "2026-05-28", relationship: "Peer" },
  { id: "fr2", from: "Neha Gupta", fromInitials: "NG", rating: 5, strengths: "Outstanding technical leadership, mentors junior engineers effectively, delivers high-quality code.", improvements: "Could delegate more tasks to team members instead of taking everything on.", date: "2026-05-25", relationship: "Manager" },
  { id: "fr3", from: "Divya Reddy", fromInitials: "DR", rating: 4, strengths: "Great team player, proactive in cross-team collaboration, strong analytical thinking.", improvements: "Would benefit from more visibility in leadership meetings.", date: "2026-05-22", relationship: "Cross-functional" },
  { id: "fr4", from: "Karthik Nair", fromInitials: "KN", rating: 3, strengths: "Solid technical skills, reliable on delivery.", improvements: "Needs to improve responsiveness to feedback and meeting deadlines consistently.", date: "2026-05-20", relationship: "Direct Report" },
];

const nineBoxEmployees: NineBoxEmployee[] = [
  { id: "nb1", name: "Neha Gupta", initials: "NG", department: "Engineering", performance: "High", potential: "High" },
  { id: "nb2", name: "Rohan Singh", initials: "RS", department: "Security", performance: "High", potential: "High" },
  { id: "nb3", name: "Priya Sharma", initials: "PS", department: "Customer Success", performance: "High", potential: "Medium" },
  { id: "nb4", name: "Divya Reddy", initials: "DR", department: "HR", performance: "High", potential: "Medium" },
  { id: "nb5", name: "Ananya Krishnan", initials: "AK", department: "Engineering", performance: "High", potential: "High" },
  { id: "nb6", name: "Kavitha Rao", initials: "KR", department: "HR", performance: "Medium", potential: "High" },
  { id: "nb7", name: "Suresh Menon", initials: "SM", department: "DevOps", performance: "Medium", potential: "High" },
  { id: "nb8", name: "Meena Iyer", initials: "MI", department: "Finance", performance: "Medium", potential: "Medium" },
  { id: "nb9", name: "Deepak Joshi", initials: "DJ", department: "DevOps", performance: "Medium", potential: "Medium" },
  { id: "nb10", name: "Maya Reddy", initials: "MR", department: "Security", performance: "Medium", potential: "Low" },
  { id: "nb11", name: "Rahul Verma", initials: "RV", department: "Marketing", performance: "Medium", potential: "Low" },
  { id: "nb12", name: "Lakshmi Iyer", initials: "LI", department: "Strategy", performance: "Low", potential: "Medium" },
  { id: "nb13", name: "Vikram Desai", initials: "VD", department: "Sales", performance: "Low", potential: "Low" },
  { id: "nb14", name: "Arjun Patel", initials: "AP", department: "Product", performance: "Low", potential: "High" },
  { id: "nb15", name: "Karthik Nair", initials: "KN", department: "Engineering", performance: "Low", potential: "Medium" },
];

const cycleSteps = [
  { label: "Self Review", icon: FileText, status: "completed" as const },
  { label: "Manager Review", icon: UserCheck, status: "current" as const },
  { label: "Calibration", icon: Layers, status: "upcoming" as const },
  { label: "Final Rating", icon: Award, status: "upcoming" as const },
];

function RatingScale({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[var(--saptta-ink-2)]">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className={`size-7 rounded-full text-[10px] font-bold transition-all ${
              n <= value
                ? "bg-[var(--saptta-accent)] text-white"
                : "bg-[var(--saptta-bg-2)] text-[var(--saptta-mute)] hover:bg-[var(--saptta-bg-2)]/80"
            }`}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Helper Functions ─── */
function statusColor(status: string) {
  switch (status) {
    case "On Track": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "At Risk": return "bg-amber-50 text-amber-700 border-amber-200";
    case "Behind": return "bg-red-50 text-red-700 border-red-200";
    case "Completed": return "bg-[var(--saptta-accent-2)]/15 text-[#6b7a1e] border-[var(--saptta-accent-2)]/30";
    case "Not Started": return "bg-gray-50 text-gray-600 border-gray-200";
    case "In Progress": return "bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] border-[var(--saptta-accent)]/20";
    case "Overdue": return "bg-red-50 text-red-700 border-red-200";
    case "Pending": return "bg-amber-50 text-amber-700 border-amber-200";
    case "Declined": return "bg-gray-50 text-gray-500 border-gray-200";
    default: return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

function progressColor(progress: number) {
  if (progress >= 80) return "#22c55e";
  if (progress >= 50) return "var(--saptta-accent)";
  if (progress >= 30) return "#f59e0b";
  return "#ef4444";
}

function ratingDisplay(rating: number | null) {
  if (rating === null) return <span className="text-[var(--saptta-mute)]">—</span>;
  const color = rating >= 4.5 ? "#22c55e" : rating >= 3.5 ? "var(--saptta-accent)" : rating >= 2.5 ? "#f59e0b" : "#ef4444";
  return <span className="font-semibold" style={{ color }}>{rating.toFixed(1)}</span>;
}

/* ─── Sub-Components ─── */

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={`text-[10px] rounded-full px-2 py-0 border font-medium ${statusColor(status)}`}>
      {status}
    </Badge>
  );
}

function StatCard({ icon: Icon, value, label, color }: { icon: React.ElementType; value: string | number; label: string; color: string }) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="border-[var(--saptta-line)] rounded-[20px]">
        <CardContent className="p-5 text-center">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-[16px]" style={{ backgroundColor: `${color}12`, color }}>
            <Icon className="size-5" />
          </div>
          <p className="text-2xl font-bold text-[var(--saptta-ink)]">{value}</p>
          <p className="text-xs text-[var(--saptta-mute)] mt-0.5">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Goals/OKR Tab ─── */
function GoalsOKRTab() {
  const [expandedOKR, setExpandedOKR] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<IndividualGoal | null>(null);
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [goalSearch, setGoalSearch] = useState("");

  const filteredGoals = individualGoals.filter(
    (g) =>
      g.employeeName.toLowerCase().includes(goalSearch.toLowerCase()) ||
      g.goalTitle.toLowerCase().includes(goalSearch.toLowerCase())
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Company OKRs */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--saptta-ink)]">Company OKRs</h2>
          <Badge className="rounded-full bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] hover:bg-[var(--saptta-accent)]/15 text-xs">
            {companyOKRs.length} Objectives
          </Badge>
        </div>
        <div className="space-y-3">
          {companyOKRs.map((okr) => (
            <motion.div key={okr.id} variants={fadeUp}>
              <Card className="border-[var(--saptta-line)] rounded-[20px] overflow-hidden">
                <CardContent className="p-0">
                  <button
                    className="w-full text-left p-4 flex items-start gap-3 hover:bg-[var(--saptta-bg-2)]/50 transition-colors"
                    onClick={() => setExpandedOKR(expandedOKR === okr.id ? null : okr.id)}
                  >
                    <div className="mt-0.5 flex size-8 items-center justify-center rounded-[12px] bg-[var(--saptta-accent)]/10 shrink-0">
                      <Target className="size-4 text-[var(--saptta-accent)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[var(--saptta-ink)] truncate">{okr.title}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-bold" style={{ color: progressColor(okr.progress) }}>{okr.progress}%</span>
                          {expandedOKR === okr.id ? (
                            <ChevronUp className="size-4 text-[var(--saptta-mute)]" />
                          ) : (
                            <ChevronDown className="size-4 text-[var(--saptta-mute)]" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-[var(--saptta-mute)] mt-0.5">{okr.owner}</p>
                      <div className="mt-2 h-1.5 rounded-full bg-[var(--saptta-bg-2)] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: progressColor(okr.progress) }}
                          initial={{ width: 0 }}
                          animate={{ width: `${okr.progress}%` }}
                          transition={{ duration: 0.8, ease: [0.22, 0.8, 0.22, 1] }}
                        />
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedOKR === okr.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 0.8, 0.22, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-[var(--saptta-line)]">
                          {/* Key Results */}
                          <div className="mt-3 mb-4">
                            <p className="text-xs font-semibold text-[var(--saptta-ink-2)] uppercase tracking-wider mb-2">Key Results</p>
                            <div className="space-y-2">
                              {okr.keyResults.map((kr) => (
                                <div key={kr.id} className="rounded-xl bg-[var(--saptta-bg-2)] px-3 py-2.5">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-[var(--saptta-ink-2)]">{kr.title}</p>
                                    <span className="text-[10px] font-semibold" style={{ color: progressColor(kr.progress) }}>
                                      {kr.current} / {kr.target}
                                    </span>
                                  </div>
                                  <div className="mt-1.5 h-1 rounded-full bg-white overflow-hidden">
                                    <motion.div
                                      className="h-full rounded-full"
                                      style={{ backgroundColor: progressColor(kr.progress) }}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${kr.progress}%` }}
                                      transition={{ duration: 0.6, ease: [0.22, 0.8, 0.22, 1], delay: 0.1 }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Department OKRs */}
                          {okr.departmentOKRs.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-[var(--saptta-ink-2)] uppercase tracking-wider mb-2">Department OKRs</p>
                              <div className="space-y-2">
                                {okr.departmentOKRs.map((dokr) => (
                                  <div key={dokr.id} className="rounded-xl border border-[var(--saptta-line)] px-3 py-2.5 flex items-center gap-3">
                                    <div className="flex size-6 items-center justify-center rounded-[10px] bg-[var(--saptta-accent-2)]/15 shrink-0">
                                      <GitBranch className="size-3 text-[#6b7a1e]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-[var(--saptta-ink-2)] truncate">{dokr.title}</p>
                                      <p className="text-[10px] text-[var(--saptta-mute)]">{dokr.department} · {dokr.owner}</p>
                                    </div>
                                    <span className="text-xs font-bold shrink-0" style={{ color: progressColor(dokr.progress) }}>
                                      {dokr.progress}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Individual Goals */}
      <motion.div variants={fadeUp}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-[var(--saptta-ink)]">Individual Goals</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--saptta-mute)]" />
              <Input
                placeholder="Search goals..."
                value={goalSearch}
                onChange={(e) => setGoalSearch(e.target.value)}
                className="pl-8 h-8 text-xs rounded-full w-48 border-[var(--saptta-line)]"
              />
            </div>
            <Dialog open={createGoalOpen} onOpenChange={setCreateGoalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-full bg-[var(--saptta-accent)] text-white text-xs hover:bg-[var(--saptta-accent)]/90 h-8">
                  <Plus className="size-3.5 mr-1" /> Create Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[24px] sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-[var(--saptta-ink)]">Create New Goal</DialogTitle>
                  <DialogDescription className="text-[var(--saptta-mute)]">Define a new goal with key results and milestones.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-[var(--saptta-ink-2)]">Goal Title</Label>
                    <Input placeholder="e.g., Complete PMP Certification" className="mt-1 rounded-xl border-[var(--saptta-line)]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-[var(--saptta-ink-2)]">Assign To</Label>
                      <Select>
                        <SelectTrigger className="mt-1 rounded-xl border-[var(--saptta-line)]">
                          <SelectValue placeholder="Employee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ak">Ananya Krishnan</SelectItem>
                          <SelectItem value="rv">Rahul Verma</SelectItem>
                          <SelectItem value="ps">Priya Sharma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-[var(--saptta-ink-2)]">Due Date</Label>
                      <Input type="date" className="mt-1 rounded-xl border-[var(--saptta-line)]" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--saptta-ink-2)]">Linked Company OKR</Label>
                    <Select>
                      <SelectTrigger className="mt-1 rounded-xl border-[var(--saptta-line)]">
                        <SelectValue placeholder="Select OKR" />
                      </SelectTrigger>
                      <SelectContent>
                        {companyOKRs.map((okr) => (
                          <SelectItem key={okr.id} value={okr.id}>{okr.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--saptta-ink-2)]">Key Results</Label>
                    <Textarea placeholder="One key result per line..." className="mt-1 rounded-xl border-[var(--saptta-line)] min-h-[60px]" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" className="rounded-full border-[var(--saptta-line)]" onClick={() => setCreateGoalOpen(false)}>Cancel</Button>
                  <Button className="rounded-full bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90" onClick={() => setCreateGoalOpen(false)}>
                    Create Goal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-2">
          {filteredGoals.map((goal) => (
            <motion.div
              key={goal.id}
              variants={slideRight}
              className="rounded-[16px] border border-[var(--saptta-line)] px-4 py-3 flex items-center gap-3 hover:bg-[var(--saptta-bg-2)]/40 transition-colors cursor-pointer"
              onClick={() => setSelectedGoal(goal)}
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] text-[10px] font-semibold">
                  {goal.employeeInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--saptta-ink)] truncate">{goal.goalTitle}</p>
                <p className="text-[10px] text-[var(--saptta-mute)]">{goal.employeeName} · Due {goal.dueDate}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 w-32">
                <div className="flex-1 h-1.5 rounded-full bg-[var(--saptta-bg-2)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: progressColor(goal.progress) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 0.6, ease: [0.22, 0.8, 0.22, 1] }}
                  />
                </div>
                <span className="text-xs font-bold shrink-0" style={{ color: progressColor(goal.progress) }}>
                  {goal.progress}%
                </span>
              </div>
              <StatusBadge status={goal.status} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Goal Detail Dialog */}
      <Dialog open={!!selectedGoal} onOpenChange={(open) => !open && setSelectedGoal(null)}>
        <DialogContent className="rounded-[24px] sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedGoal && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[var(--saptta-ink)]">{selectedGoal.goalTitle}</DialogTitle>
                <DialogDescription className="text-[var(--saptta-mute)]">
                  {selectedGoal.employeeName} · Due {selectedGoal.dueDate}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[var(--saptta-ink-2)]">Overall Progress</span>
                    <span className="text-sm font-bold" style={{ color: progressColor(selectedGoal.progress) }}>
                      {selectedGoal.progress}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[var(--saptta-bg-2)] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: progressColor(selectedGoal.progress) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedGoal.progress}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 0.8, 0.22, 1] }}
                    />
                  </div>
                  <div className="mt-2">
                    <StatusBadge status={selectedGoal.status} />
                  </div>
                </div>

                {/* Key Results */}
                <div>
                  <p className="text-xs font-semibold text-[var(--saptta-ink-2)] uppercase tracking-wider mb-2">Key Results</p>
                  <div className="space-y-2">
                    {selectedGoal.keyResults.map((kr) => (
                      <div key={kr.id} className="rounded-xl bg-[var(--saptta-bg-2)] px-3 py-2.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-[var(--saptta-ink-2)]">{kr.title}</p>
                          <span className="text-[10px] font-semibold text-[var(--saptta-mute)]">{kr.current} / {kr.target}</span>
                        </div>
                        <div className="mt-1.5 h-1 rounded-full bg-white overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: progressColor(kr.progress) }}
                            initial={{ width: 0 }}
                            animate={{ width: `${kr.progress}%` }}
                            transition={{ duration: 0.6, ease: [0.22, 0.8, 0.22, 1] }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <p className="text-xs font-semibold text-[var(--saptta-ink-2)] uppercase tracking-wider mb-2">Milestones</p>
                  <div className="space-y-0">
                    {selectedGoal.milestones.map((ms, idx) => (
                      <div key={ms.id} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`flex size-6 items-center justify-center rounded-full shrink-0 ${ms.completed ? "bg-[#22c55e]" : "border-2 border-[var(--saptta-line)]"}`}>
                            {ms.completed ? (
                              <CheckCircle2 className="size-3.5 text-white" />
                            ) : (
                              <CircleDot className="size-3 text-[var(--saptta-mute)]" />
                            )}
                          </div>
                          {idx < selectedGoal.milestones.length - 1 && (
                            <div className={`w-0.5 h-6 ${ms.completed ? "bg-[#22c55e]" : "bg-[var(--saptta-line)]"}`} />
                          )}
                        </div>
                        <div className="pb-3">
                          <p className={`text-xs font-medium ${ms.completed ? "text-[var(--saptta-ink)]" : "text-[var(--saptta-mute)]"}`}>
                            {ms.title}
                          </p>
                          <p className="text-[10px] text-[var(--saptta-mute)]">{ms.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-full border-[var(--saptta-line)]" onClick={() => setSelectedGoal(null)}>Close</Button>
                <Button className="rounded-full bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90">Edit Goal</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

/* ─── Appraisal Cycles Tab ─── */
function AppraisalCyclesTab() {
  const [newCycleOpen, setNewCycleOpen] = useState(false);
  const [appraisalFilter, setAppraisalFilter] = useState("all");

  const completedCount = appraisalEmployees.filter((e) => e.status === "Completed").length;
  const totalCount = appraisalEmployees.length;
  const cycleProgress = Math.round((completedCount / totalCount) * 100);

  const filteredAppraisals = appraisalEmployees.filter(
    (e) => appraisalFilter === "all" || e.status.toLowerCase().replace(" ", "-") === appraisalFilter
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Current Cycle Card */}
      <motion.div variants={fadeUp}>
        <Card className="border-[var(--saptta-line)] rounded-[24px] overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-[16px] bg-[var(--saptta-accent)]/10">
                    <Gauge className="size-5 text-[var(--saptta-accent)]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--saptta-ink)]">Q2 2026 Review</h3>
                    <p className="text-xs text-[var(--saptta-mute)]">Annual Performance Cycle</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 max-w-xs h-3 rounded-full bg-[var(--saptta-bg-2)] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[var(--saptta-accent)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${cycleProgress}%` }}
                      transition={{ duration: 1, ease: [0.22, 0.8, 0.22, 1] }}
                    />
                  </div>
                  <span className="text-sm font-bold text-[var(--saptta-accent)]">{cycleProgress}% completed</span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-[var(--saptta-mute)]">
                  <span><strong className="text-[var(--saptta-ink)]">{completedCount}</strong> / {totalCount} reviews done</span>
                  <span>·</span>
                  <span>{appraisalEmployees.filter((e) => e.status === "In Progress").length} in progress</span>
                  <span>·</span>
                  <span>{appraisalEmployees.filter((e) => e.status === "Overdue").length} overdue</span>
                </div>
              </div>
              <Dialog open={newCycleOpen} onOpenChange={setNewCycleOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-full bg-[var(--saptta-accent)] text-white text-xs hover:bg-[var(--saptta-accent)]/90 h-8 shrink-0">
                    <Plus className="size-3.5 mr-1" /> Start New Cycle
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[24px] sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-[var(--saptta-ink)]">Start New Appraisal Cycle</DialogTitle>
                    <DialogDescription className="text-[var(--saptta-mute)]">Configure a new performance review cycle.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-[var(--saptta-ink-2)]">Cycle Name</Label>
                      <Input placeholder="e.g., Q3 2026 Review" className="mt-1 rounded-xl border-[var(--saptta-line)]" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-[var(--saptta-ink-2)]">Start Date</Label>
                        <Input type="date" className="mt-1 rounded-xl border-[var(--saptta-line)]" />
                      </div>
                      <div>
                        <Label className="text-xs text-[var(--saptta-ink-2)]">End Date</Label>
                        <Input type="date" className="mt-1 rounded-xl border-[var(--saptta-line)]" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-[var(--saptta-ink-2)]">Review Template</Label>
                      <Select>
                        <SelectTrigger className="mt-1 rounded-xl border-[var(--saptta-line)]">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard Performance Review</SelectItem>
                          <SelectItem value="tech">Technical Roles Review</SelectItem>
                          <SelectItem value="leadership">Leadership Assessment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-[var(--saptta-ink-2)]">Participants</Label>
                      <Select>
                        <SelectTrigger className="mt-1 rounded-xl border-[var(--saptta-line)]">
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Employees</SelectItem>
                          <SelectItem value="engineering">Engineering Only</SelectItem>
                          <SelectItem value="managers">Managers & Above</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" className="rounded-full border-[var(--saptta-line)]" onClick={() => setNewCycleOpen(false)}>Cancel</Button>
                    <Button className="rounded-full bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90" onClick={() => setNewCycleOpen(false)}>
                      Create Cycle
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cycle Timeline */}
      <motion.div variants={fadeUp}>
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Cycle Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-0 overflow-x-auto pb-2">
              {cycleSteps.map((step, idx) => {
                const StepIcon = step.icon;
                const isCompleted = step.status === "completed";
                const isCurrent = step.status === "current";
                return (
                  <React.Fragment key={step.label}>
                    <div className="flex flex-col items-center min-w-[80px]">
                      <div
                        className={`flex size-10 items-center justify-center rounded-full transition-all ${
                          isCompleted
                            ? "bg-[#22c55e] text-white"
                            : isCurrent
                            ? "bg-[var(--saptta-accent)] text-white ring-4 ring-[var(--saptta-accent)]/20"
                            : "bg-[var(--saptta-bg-2)] text-[var(--saptta-mute)]"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="size-5" />
                        ) : (
                          <StepIcon className="size-4" />
                        )}
                      </div>
                      <p className={`text-[10px] mt-1.5 font-medium text-center ${
                        isCompleted ? "text-[#22c55e]" : isCurrent ? "text-[var(--saptta-accent)]" : "text-[var(--saptta-mute)]"
                      }`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <span className="text-[8px] text-[var(--saptta-accent)] font-semibold mt-0.5">IN PROGRESS</span>
                      )}
                    </div>
                    {idx < cycleSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 min-w-[40px] mx-2 rounded-full ${
                        isCompleted ? "bg-[#22c55e]" : "bg-[var(--saptta-line)]"
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Appraisal Table */}
      <motion.div variants={fadeUp}>
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Employee Appraisals</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={appraisalFilter} onValueChange={setAppraisalFilter}>
                  <SelectTrigger className="h-7 text-[10px] rounded-full border-[var(--saptta-line)] w-[130px]">
                    <Filter className="size-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ScrollArea className="h-[420px]">
              <div className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="border-[var(--saptta-line)] hover:bg-transparent sticky top-0 bg-white z-10">
                    <TableHead className="text-[10px] font-semibold text-[var(--saptta-mute)] pl-6 w-[200px]">Employee</TableHead>
                    <TableHead className="text-[10px] font-semibold text-[var(--saptta-mute)] w-[140px]">Department</TableHead>
                    <TableHead className="text-[10px] font-semibold text-[var(--saptta-mute)] text-center w-[80px]">Self</TableHead>
                    <TableHead className="text-[10px] font-semibold text-[var(--saptta-mute)] text-center w-[80px]">Manager</TableHead>
                    <TableHead className="text-[10px] font-semibold text-[var(--saptta-mute)] text-center w-[80px]">Final</TableHead>
                    <TableHead className="text-[10px] font-semibold text-[var(--saptta-mute)] text-center pr-6 w-[120px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppraisals.map((emp) => (
                    <TableRow key={emp.id} className="border-[var(--saptta-line)] hover:bg-[var(--saptta-bg-2)]">
                      <TableCell className="pl-6 w-[200px]">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7 shrink-0">
                            <AvatarFallback className="bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] text-[9px] font-semibold">
                              {emp.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-semibold text-[var(--saptta-ink)] truncate">{emp.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-[var(--saptta-mute)] w-[140px]">{emp.department}</TableCell>
                      <TableCell className="text-center w-[80px]">{ratingDisplay(emp.selfRating)}</TableCell>
                      <TableCell className="text-center w-[80px]">{ratingDisplay(emp.managerRating)}</TableCell>
                      <TableCell className="text-center w-[80px]">{ratingDisplay(emp.finalRating)}</TableCell>
                      <TableCell className="text-center pr-6 w-[120px]">
                        <StatusBadge status={emp.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

/* ─── 360 Feedback Tab ─── */
function Feedback360Tab() {
  const [giveFeedbackOpen, setGiveFeedbackOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackRequest | null>(null);
  const [feedbackRatings, setFeedbackRatings] = useState({
    technical: 3,
    communication: 3,
    leadership: 3,
    teamwork: 3,
  });
  const [activeSection, setActiveSection] = useState<"requests" | "received">("requests");

  const pendingCount = feedbackRequests.filter((f) => f.status === "Pending").length;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Summary Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-[var(--saptta-line)] rounded-[16px]">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-[var(--saptta-accent)]">{pendingCount}</p>
            <p className="text-[10px] text-[var(--saptta-mute)]">Pending Requests</p>
          </CardContent>
        </Card>
        <Card className="border-[var(--saptta-line)] rounded-[16px]">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-[#22c55e]">{feedbackRequests.filter((f) => f.status === "Completed").length}</p>
            <p className="text-[10px] text-[var(--saptta-mute)]">Completed</p>
          </CardContent>
        </Card>
        <Card className="border-[var(--saptta-line)] rounded-[16px]">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-[var(--saptta-ink)]">{feedbackReceived.length}</p>
            <p className="text-[10px] text-[var(--saptta-mute)]">Received</p>
          </CardContent>
        </Card>
        <Card className="border-[var(--saptta-line)] rounded-[16px]">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-[var(--saptta-accent-2)]">
              {feedbackReceived.length > 0
                ? (feedbackReceived.reduce((sum, f) => sum + f.rating, 0) / feedbackReceived.length).toFixed(1)
                : "—"}
            </p>
            <p className="text-[10px] text-[var(--saptta-mute)]">Avg. Rating</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section Toggle */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-2 p-1 bg-[var(--saptta-bg-2)] rounded-full w-fit">
          <button
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeSection === "requests"
                ? "bg-white text-[var(--saptta-ink)] shadow-sm"
                : "text-[var(--saptta-mute)] hover:text-[var(--saptta-ink-2)]"
            }`}
            onClick={() => setActiveSection("requests")}
          >
            Requests {pendingCount > 0 && <span className="ml-1 inline-flex items-center justify-center size-4 rounded-full bg-[var(--saptta-accent)] text-white text-[9px]">{pendingCount}</span>}
          </button>
          <button
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeSection === "received"
                ? "bg-white text-[var(--saptta-ink)] shadow-sm"
                : "text-[var(--saptta-mute)] hover:text-[var(--saptta-ink-2)]"
            }`}
            onClick={() => setActiveSection("received")}
          >
            Received
          </button>
        </div>
      </motion.div>

      {/* Feedback Requests */}
      <AnimatePresence mode="wait">
        {activeSection === "requests" && (
          <motion.div
            key="requests"
            variants={stagger}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="space-y-2"
          >
            {feedbackRequests.map((req) => (
              <motion.div key={req.id} variants={slideRight}>
                <Card className="border-[var(--saptta-line)] rounded-[16px] overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-9 shrink-0">
                        <AvatarFallback className="bg-[var(--saptta-accent-2)]/20 text-[#6b7a1e] text-[10px] font-semibold">
                          {req.targetInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-[var(--saptta-ink)]">
                              Feedback for <strong>{req.targetEmployee}</strong>
                            </p>
                            <p className="text-[10px] text-[var(--saptta-mute)] mt-0.5">
                              Requested by {req.requestedBy} · {req.relationship}
                            </p>
                          </div>
                          <StatusBadge status={req.status} />
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-[10px] text-[var(--saptta-mute)] flex items-center gap-1">
                            <Clock className="size-3" /> Due {req.deadline}
                          </span>
                          {req.status === "Pending" && (
                            <Button
                              size="sm"
                              className="rounded-full bg-[var(--saptta-accent)] text-white text-[10px] h-6 hover:bg-[var(--saptta-accent)]/90"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFeedback(req);
                                setGiveFeedbackOpen(true);
                              }}
                            >
                              <Send className="size-3 mr-1" /> Give Feedback
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Feedback Received */}
        {activeSection === "received" && (
          <motion.div
            key="received"
            variants={stagger}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="space-y-2"
          >
            {feedbackReceived.map((fb) => (
              <motion.div key={fb.id} variants={slideRight}>
                <Card className="border-[var(--saptta-line)] rounded-[16px] overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-9 shrink-0">
                        <AvatarFallback className="bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] text-[10px] font-semibold">
                          {fb.fromInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-[var(--saptta-ink)]">{fb.from}</p>
                            <p className="text-[10px] text-[var(--saptta-mute)]">{fb.relationship} · {fb.date}</p>
                          </div>
                          <div className="flex items-center gap-1 bg-[var(--saptta-accent-2)]/15 rounded-full px-2 py-0.5">
                            <Star className="size-3 text-[#6b7a1e] fill-[#6b7a1e]" />
                            <span className="text-xs font-bold text-[#6b7a1e]">{fb.rating}</span>
                          </div>
                        </div>
                        <div className="mt-2 space-y-1.5">
                          <div className="rounded-xl bg-emerald-50 px-3 py-2">
                            <p className="text-[10px] font-semibold text-emerald-700 mb-0.5 flex items-center gap-1">
                              <ThumbsUp className="size-3" /> Strengths
                            </p>
                            <p className="text-xs text-emerald-800">{fb.strengths}</p>
                          </div>
                          <div className="rounded-xl bg-amber-50 px-3 py-2">
                            <p className="text-[10px] font-semibold text-amber-700 mb-0.5 flex items-center gap-1">
                              <ThumbsDown className="size-3" /> Areas for Improvement
                            </p>
                            <p className="text-xs text-amber-800">{fb.improvements}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Give Feedback Dialog */}
      <Dialog open={giveFeedbackOpen} onOpenChange={setGiveFeedbackOpen}>
        <DialogContent className="rounded-[24px] sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedFeedback && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[var(--saptta-ink)]">Give Feedback for {selectedFeedback.targetEmployee}</DialogTitle>
                <DialogDescription className="text-[var(--saptta-mute)]">
                  {selectedFeedback.relationship} review · Requested by {selectedFeedback.requestedBy}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5">
                {/* Rating Scales */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-[var(--saptta-ink-2)] uppercase tracking-wider">Rating Scale</p>
                  <RatingScale
                    label="Technical Skills"
                    value={feedbackRatings.technical}
                    onChange={(v) => setFeedbackRatings((prev) => ({ ...prev, technical: v }))}
                  />
                  <RatingScale
                    label="Communication"
                    value={feedbackRatings.communication}
                    onChange={(v) => setFeedbackRatings((prev) => ({ ...prev, communication: v }))}
                  />
                  <RatingScale
                    label="Leadership"
                    value={feedbackRatings.leadership}
                    onChange={(v) => setFeedbackRatings((prev) => ({ ...prev, leadership: v }))}
                  />
                  <RatingScale
                    label="Teamwork"
                    value={feedbackRatings.teamwork}
                    onChange={(v) => setFeedbackRatings((prev) => ({ ...prev, teamwork: v }))}
                  />
                </div>

                {/* Strengths */}
                <div>
                  <Label className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <ThumbsUp className="size-3" /> Strengths
                  </Label>
                  <Textarea
                    placeholder="What does this person do well?"
                    className="mt-1 rounded-xl border-[var(--saptta-line)] min-h-[70px]"
                  />
                </div>

                {/* Improvements */}
                <div>
                  <Label className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                    <ThumbsDown className="size-3" /> Areas for Improvement
                  </Label>
                  <Textarea
                    placeholder="What could this person improve?"
                    className="mt-1 rounded-xl border-[var(--saptta-line)] min-h-[70px]"
                  />
                </div>

                {/* Additional Comments */}
                <div>
                  <Label className="text-xs text-[var(--saptta-ink-2)]">Additional Comments</Label>
                  <Textarea
                    placeholder="Any other observations..."
                    className="mt-1 rounded-xl border-[var(--saptta-line)] min-h-[50px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-full border-[var(--saptta-line)]" onClick={() => setGiveFeedbackOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="rounded-full bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90"
                  onClick={() => setGiveFeedbackOpen(false)}
                >
                  <Send className="size-3.5 mr-1" /> Submit Feedback
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

/* ─── 9-Box Matrix Tab ─── */
function NineBoxTab() {
  const [selectedCell, setSelectedCell] = useState<{ performance: string; potential: string } | null>(null);

  const performanceLevels = ["High", "Medium", "Low"];
  const potentialLevels = ["Low", "Medium", "High"];

  function getCellColor(perf: string, pot: string) {
    if (perf === "High" && pot === "High") return { bg: "#22c55e", bgLight: "#22c55e12", text: "#166534", label: "Stars" };
    if (perf === "High" && pot === "Medium") return { bg: "#86efac", bgLight: "#86efac15", text: "#166534", label: "Core Performers" };
    if (perf === "High" && pot === "Low") return { bg: "#fbbf24", bgLight: "#fbbf2415", text: "#92400e", label: "Professionals" };
    if (perf === "Medium" && pot === "High") return { bg: "var(--saptta-accent-2)", bgLight: "var(--saptta-accent-2)15", text: "#3d4f0d", label: "High Potentials" };
    if (perf === "Medium" && pot === "Medium") return { bg: "#f59e0b", bgLight: "#f59e0b12", text: "#92400e", label: "Key Contributors" };
    if (perf === "Medium" && pot === "Low") return { bg: "#fb923c", bgLight: "#fb923c12", text: "#9a3412", label: "Solid Citizens" };
    if (perf === "Low" && pot === "High") return { bg: "#a78bfa", bgLight: "#a78bfa15", text: "#4c1d95", label: "Rough Diamonds" };
    if (perf === "Low" && pot === "Medium") return { bg: "#f87171", bgLight: "#f8717112", text: "#991b1b", label: "Inconsistents" };
    if (perf === "Low" && pot === "Low") return { bg: "#ef4444", bgLight: "#ef444412", text: "#991b1b", label: "Underperformers" };
    return { bg: "#e8e8e8", bgLight: "#e8e8e815", text: "#2b2b2b", label: "" };
  }

  function getCellEmployees(perf: string, pot: string) {
    return nineBoxEmployees.filter(
      (e) => e.performance === perf && e.potential === pot
    );
  }

  const selectedEmployees = selectedCell
    ? getCellEmployees(selectedCell.performance, selectedCell.potential)
    : [];

  const selectedCellInfo = selectedCell
    ? getCellColor(selectedCell.performance, selectedCell.potential)
    : null;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* 9-Box Grid */}
      <motion.div variants={fadeUp}>
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">9-Box Matrix</CardTitle>
              <Badge className="rounded-full bg-[var(--saptta-bg-2)] text-[var(--saptta-ink-2)] text-[10px] border border-[var(--saptta-line)]">
                {nineBoxEmployees.length} employees
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="flex gap-2 sm:gap-4">
              {/* Y-Axis Label */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <p className="text-[10px] font-semibold text-[var(--saptta-mute)] uppercase tracking-wider [writing-mode:vertical-lr] rotate-180">
                  Performance →
                </p>
              </div>

              <div className="flex-1">
                {/* X-Axis Label */}
                <div className="text-center mb-3">
                  <p className="text-[10px] font-semibold text-[var(--saptta-mute)] uppercase tracking-wider">
                    Potential →
                  </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {performanceLevels.map((perf) =>
                    potentialLevels.map((pot) => {
                      const cellInfo = getCellColor(perf, pot);
                      const employees = getCellEmployees(perf, pot);
                      return (
                        <Tooltip key={`${perf}-${pot}`}>
                          <TooltipTrigger asChild>
                            <motion.button
                              className="relative rounded-[16px] p-3 sm:p-4 border-2 transition-all hover:scale-[1.02] cursor-pointer min-h-[80px] sm:min-h-[100px] flex flex-col items-center justify-center gap-1"
                              style={{
                                backgroundColor: cellInfo.bgLight,
                                borderColor: selectedCell?.performance === perf && selectedCell?.potential === pot
                                  ? cellInfo.bg
                                  : "transparent",
                              }}
                              onClick={() => setSelectedCell({ performance: perf, potential: pot })}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span
                                className="text-2xl sm:text-3xl font-bold"
                                style={{ color: cellInfo.bg }}
                              >
                                {employees.length}
                              </span>
                              <span
                                className="text-[9px] sm:text-[10px] font-semibold text-center leading-tight"
                                style={{ color: cellInfo.text }}
                              >
                                {cellInfo.label}
                              </span>
                              {employees.length > 0 && (
                                <div className="flex -space-x-1.5 mt-1">
                                  {employees.slice(0, 3).map((emp) => (
                                    <Avatar key={emp.id} className="size-5 border-2 border-white">
                                      <AvatarFallback
                                        className="text-[7px] font-bold"
                                        style={{ backgroundColor: cellInfo.bg, color: "white" }}
                                      >
                                        {emp.initials}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {employees.length > 3 && (
                                    <div className="size-5 rounded-full bg-[var(--saptta-bg-2)] border-2 border-white flex items-center justify-center">
                                      <span className="text-[7px] font-bold text-[var(--saptta-mute)]">+{employees.length - 3}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </motion.button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="rounded-xl p-2">
                            {employees.length > 0 ? (
                              <div>
                                <p className="text-[10px] font-semibold mb-1">{cellInfo.label} ({employees.length})</p>
                                {employees.map((emp) => (
                                  <p key={emp.id} className="text-[10px]">{emp.name} · {emp.department}</p>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px]">{cellInfo.label} — No employees</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })
                  )}
                </div>

                {/* Axis Labels */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-2">
                  <p className="text-[9px] text-center text-[var(--saptta-mute)] font-medium">Low</p>
                  <p className="text-[9px] text-center text-[var(--saptta-mute)] font-medium">Medium</p>
                  <p className="text-[9px] text-center text-[var(--saptta-mute)] font-medium">High</p>
                </div>
                <div className="flex justify-between mt-1">
                  <div />
                  <p className="text-[9px] text-[var(--saptta-mute)] font-medium">Potential Level</p>
                  <div />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Legend */}
      <motion.div variants={fadeUp}>
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)]">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">High Performers</p>
                {[
                  { color: "#22c55e", label: "Stars", desc: "High performance, high potential" },
                  { color: "#86efac", label: "Core Performers", desc: "High performance, medium potential" },
                  { color: "#fbbf24", label: "Professionals", desc: "High performance, low potential" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <div className="size-3 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: item.color }} />
                    <div>
                      <p className="text-[10px] font-medium text-[var(--saptta-ink)]">{item.label}</p>
                      <p className="text-[9px] text-[var(--saptta-mute)]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">Developing</p>
                {[
                  { color: "var(--saptta-accent-2)", label: "High Potentials", desc: "Medium performance, high potential" },
                  { color: "#f59e0b", label: "Key Contributors", desc: "Medium performance, medium potential" },
                  { color: "#fb923c", label: "Solid Citizens", desc: "Medium performance, low potential" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <div className="size-3 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: item.color }} />
                    <div>
                      <p className="text-[10px] font-medium text-[var(--saptta-ink)]">{item.label}</p>
                      <p className="text-[9px] text-[var(--saptta-mute)]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-red-700 uppercase tracking-wider">At Risk</p>
                {[
                  { color: "#a78bfa", label: "Rough Diamonds", desc: "Low performance, high potential" },
                  { color: "#f87171", label: "Inconsistents", desc: "Low performance, medium potential" },
                  { color: "#ef4444", label: "Underperformers", desc: "Low performance, low potential" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <div className="size-3 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: item.color }} />
                    <div>
                      <p className="text-[10px] font-medium text-[var(--saptta-ink)]">{item.label}</p>
                      <p className="text-[9px] text-[var(--saptta-mute)]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Selected Cell Detail */}
      <AnimatePresence>
        {selectedCell && selectedCellInfo && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: [0.22, 0.8, 0.22, 1] }}
          >
            <Card className="border-[var(--saptta-line)] rounded-[24px] overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full" style={{ backgroundColor: selectedCellInfo.bg }} />
                    <h3 className="text-sm font-semibold text-[var(--saptta-ink)]">{selectedCellInfo.label}</h3>
                    <Badge variant="outline" className="text-[9px] rounded-full border-[var(--saptta-line)]">
                      {selectedCell.performance} Performance · {selectedCell.potential} Potential
                    </Badge>
                  </div>
                  <button
                    className="size-6 flex items-center justify-center rounded-full hover:bg-[var(--saptta-bg-2)] transition-colors"
                    onClick={() => setSelectedCell(null)}
                  >
                    <X className="size-3.5 text-[var(--saptta-mute)]" />
                  </button>
                </div>
                {selectedEmployees.length > 0 ? (
                  <div className="space-y-2">
                    {selectedEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        className="rounded-xl bg-[var(--saptta-bg-2)] px-4 py-3 flex items-center gap-3"
                      >
                        <Avatar className="size-8">
                          <AvatarFallback
                            className="text-[10px] font-bold"
                            style={{ backgroundColor: selectedCellInfo.bg, color: "white" }}
                          >
                            {emp.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[var(--saptta-ink)]">{emp.name}</p>
                          <p className="text-[10px] text-[var(--saptta-mute)]">{emp.department}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge className="rounded-full text-[9px] bg-[var(--saptta-bg-2)] text-[var(--saptta-ink-2)] border border-[var(--saptta-line)]">
                            <Zap className="size-2.5 mr-0.5" /> {emp.potential}
                          </Badge>
                          <Badge className="rounded-full text-[9px] bg-[var(--saptta-bg-2)] text-[var(--saptta-ink-2)] border border-[var(--saptta-line)]">
                            <TrendingUp className="size-2.5 mr-0.5" /> {emp.performance}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="size-8 text-[var(--saptta-mute)] mx-auto mb-2" />
                    <p className="text-xs text-[var(--saptta-mute)]">No employees in this quadrant</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main Component ─── */
export function PerformanceView() {
  const [activeTab, setActiveTab] = useState("goals");

  const completedAppraisals = appraisalEmployees.filter((e) => e.status === "Completed").length;
  const pendingFeedback = feedbackRequests.filter((f) => f.status === "Pending").length;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--saptta-ink)] tracking-tight">Performance</h1>
          <p className="text-[var(--saptta-mute)] mt-1 text-sm">Track goals, reviews, and employee performance metrics.</p>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Target} value="5" label="Company OKRs" color="var(--saptta-accent)" />
        <StatCard icon={Award} value="72%" label="Review Completion" color="var(--saptta-accent-2)" />
        <StatCard icon={Star} value="4.2" label="Avg. Rating" color="#f59e0b" />
        <StatCard icon={MessageSquare} value={pendingFeedback} label="Pending Feedback" color="#8b5cf6" />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[var(--saptta-bg-2)] rounded-full p-1 h-auto gap-0">
            <TabsTrigger
              value="goals"
              className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[var(--saptta-accent)] px-4 py-1.5"
            >
              <Target className="size-3.5 mr-1.5" /> Goals / OKR
            </TabsTrigger>
            <TabsTrigger
              value="appraisals"
              className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[var(--saptta-accent)] px-4 py-1.5"
            >
              <BarChart3 className="size-3.5 mr-1.5" /> Appraisal Cycles
            </TabsTrigger>
            <TabsTrigger
              value="feedback"
              className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[var(--saptta-accent)] px-4 py-1.5 relative"
            >
              <MessageSquare className="size-3.5 mr-1.5" /> 360 Feedback
              {pendingFeedback > 0 && (
                <span className="ml-1 inline-flex items-center justify-center size-4 rounded-full bg-[var(--saptta-accent)] text-white text-[8px] font-bold">
                  {pendingFeedback}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="ninebox"
              className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[var(--saptta-accent)] px-4 py-1.5"
            >
              <Layers className="size-3.5 mr-1.5" /> 9-Box Matrix
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="mt-6">
            <GoalsOKRTab />
          </TabsContent>

          <TabsContent value="appraisals" className="mt-6">
            <AppraisalCyclesTab />
          </TabsContent>

          <TabsContent value="feedback" className="mt-6">
            <Feedback360Tab />
          </TabsContent>

          <TabsContent value="ninebox" className="mt-6">
            <NineBoxTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}