"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  Clock,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  FileText,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  UserCheck,
  Target,
  CalendarDays,
  PieChart as PieChartIcon,
  BarChart3,
  Send,
  Video,
  Mail,
  Phone,
  MapPin,
  Shield,
  ClipboardList,
  Wallet,
  Goal,
  PartyPopper,
  Cake,
  Palmtree,
  Coffee,
  XCircle,
  Check,
  X,
  ChevronDown,
  LayoutDashboard,
  Eye,
  BadgeCheck,
  FileSpreadsheet,
  UserCog,
  CalendarClock,
  UsersRound,
  MessageSquare,
  Search,
  Star,
  Award,
  BriefcaseIcon,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAppStore, type UserRole } from "@/lib/store";
import { ApplicantDashboard } from "@/components/applicant-dashboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

/* ──────────────── Animation Config ──────────────── */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 0.8, 0.22, 1] } },
};

/* ──────────────── Count-Up Hook ──────────────── */

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

/* ──────────────── Chart Tooltip ──────────────── */

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-[#0a0a0b] dark:bg-[#2a2a2c] px-3 py-2 text-xs text-white shadow-lg border border-[#2a2a2c]">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

/* ──────────────── Circular Progress ──────────────── */

function CircularProgress({ value, size = 80, strokeWidth = 6 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const [animatedOffset, setAnimatedOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedOffset(offset), 100);
    return () => clearTimeout(timer);
  }, [offset]);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e8e8e8" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--saptta-accent)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: animatedOffset }}
        transition={{ duration: 1.5, ease: [0.22, 0.8, 0.22, 1] }}
      />
    </svg>
  );
}

/* ──────────────── KPI Card ──────────────── */

function KpiCard({
  icon: Icon,
  label,
  value,
  displayValue,
  trend,
  trendLabel,
  accentColor,
  extra,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  displayValue: string;
  trend: "up" | "down" | "neutral";
  trendLabel: string;
  accentColor?: string;
  extra?: React.ReactNode;
}) {
  const count = useCountUp(value);

  return (
    <Card className="saptta-module-card border-[var(--saptta-line)] bg-white hover:shadow-lg transition-shadow duration-300 rounded-[20px]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div
            className="flex size-10 items-center justify-center rounded-[16px] module-icon"
            style={{ backgroundColor: `${accentColor || "#fdc500"}10`, color: accentColor || "#fdc500" }}
          >
            <Icon className="size-5" />
          </div>
          {trend !== "neutral" && (
            <Badge
              variant="secondary"
              className={`text-[10px] font-semibold rounded-full ${
                trend === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
              }`}
            >
              {trend === "up" ? <ArrowUpRight className="size-3 mr-0.5" /> : <ArrowDownRight className="size-3 mr-0.5" />}
              {trendLabel}
            </Badge>
          )}
          {trend === "neutral" && (
            <Badge variant="secondary" className="text-[10px] font-semibold rounded-full bg-blue-50 text-blue-600">
              {trendLabel}
            </Badge>
          )}
        </div>
        <div className="mt-4 flex items-end gap-3">
          <span
            className="text-[40px] md:text-[48px] font-bold leading-none tracking-[-2px] text-[var(--saptta-ink)] module-text"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {displayValue || count.toLocaleString()}
          </span>
          {extra}
        </div>
        <p className="text-xs text-[var(--saptta-mute)] italic mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}


/* ──────────────── Greeting Header ──────────────── */

const AI_SUMMARIES: Record<string, { title: string; points: string[] }> = {
  hr_admin: {
    title: "HR Admin — Today's AI Summary",
    points: [
      "1,247 employees active · 4 new joiners this week · 1 exit pending offboarding.",
      "Attendance today: 94.2% present · 8 late · 4 absent · 6 WFH.",
      "3 leave requests pending your approval (Priya, Anita, Ravi).",
      "Payroll for June is on track — scheduled to run on the 28th (₹42.5L).",
      "12 open positions · 148 candidates in pipeline · 23 interviews this week.",
      "Top alert: Ananya Krishnan scored 92% match for Sr. Frontend Dev — recommend shortlisting.",
    ],
  },
  manager: {
    title: "Manager — Today's AI Summary",
    points: [
      "Your team: 18 members · 15 present · 2 on leave · 1 WFH today.",
      "2 interviews scheduled today — Ananya K. at 10:00 AM, Vikram S. at 2:30 PM.",
      "1 pending leave request from Priya Sharma (Jun 10–11) awaiting your approval.",
      "Team performance avg: 3.8/5 · Q2 review deadline in 24 days.",
      "3 open goals behind schedule — Rohan's backlog target needs attention.",
    ],
  },
  employee: {
    title: "Employee — Today's AI Summary",
    points: [
      "You've checked in at 9:15 AM today — attendance marked Present.",
      "Leave balance: 4 Casual · 8 Sick · 10 Earned days remaining.",
      "Next payslip: June 28 · Estimated net ₹1,81,800.",
      "Goal progress: Q2 Features at 72% · Backlog reduction at 55%.",
      "Upcoming: Bakrid holiday on Jun 10 · Company Offsite Jun 20–22.",
    ],
  },
  recruiter: {
    title: "Recruiter — Today's AI Summary",
    points: [
      "4 interviews today · 2 completed · Ananya K. (2 PM) and Neha G. (4 PM) upcoming.",
      "Pipeline: 156 candidates · 42 screened · 18 in interview · 6 offers pending.",
      "High-priority: Ananya Krishnan 92% match — share profile with hiring manager.",
      "Top source this week: LinkedIn (45) · Naukri (38) · Referrals (28).",
      "Action needed: 3 candidates haven't heard back in 5+ days.",
    ],
  },
  applicant: {
    title: "Applicant — Today's AI Summary",
    points: [
      "Interview scheduled: Technical round at 10:00 AM — Preparation tips available.",
      "Application status: 2 active · 1 offer stage · 1 under review.",
      "Profile completeness: 78% — add certifications to improve match scores.",
      "Tip: Practise system design questions; your interviewer focuses on architecture.",
      "Next step: Confirm your availability for the HR round by EOD.",
    ],
  },
};

function GreetingHeader({ name, role, subtitle }: { name: string; role: string; subtitle: string }) {
  const { setCurrentView, userRole } = useAppStore();
  const [aiOpen, setAiOpen] = useState(false);
  const [dateRange, setDateRange] = useState("today");
  const summary = AI_SUMMARIES[userRole] ?? AI_SUMMARIES.hr_admin;

  return (
    <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--saptta-ink)] tracking-tight">
          Good morning, {name} 👋
        </h1>
        <p className="text-[var(--saptta-mute)] mt-1 text-sm">
          {role} &middot; {subtitle}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {/* Today / Date Range */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-xl border-[var(--saptta-line)] text-xs">
              <Calendar className="size-3.5 mr-1.5" />
              {dateRange === "today" ? "Today" : dateRange === "week" ? "This Week" : dateRange === "month" ? "This Month" : "Last 30 Days"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl w-40">
            <DropdownMenuLabel className="text-xs text-[var(--saptta-mute)]">Date Range</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
              { value: "30days", label: "Last 30 Days" },
            ].map((opt) => (
              <DropdownMenuItem key={opt.value} onClick={() => setDateRange(opt.value)}
                className={dateRange === opt.value ? "bg-[var(--saptta-accent)]/5 text-[var(--saptta-accent)]" : ""}>
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* AI Summary */}
        <Button size="sm" className="rounded-xl bg-[var(--saptta-accent)] text-white text-xs hover:bg-[var(--saptta-accent)]/90"
          onClick={() => setAiOpen(true)}>
          <Sparkles className="size-3.5 mr-1.5" />
          AI Summary
        </Button>
      </div>

      {/* AI Summary Dialog */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="rounded-[24px] max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="size-10 rounded-2xl bg-[var(--saptta-accent)]/10 flex items-center justify-center">
                <Sparkles className="size-5 text-[var(--saptta-accent)]" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-[var(--saptta-ink)]">{summary.title}</DialogTitle>
                <p className="text-xs text-[var(--saptta-mute)]">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</p>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-3 mt-1">
            {summary.points.map((point, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--saptta-bg-2)]">
                <div className="size-5 rounded-full bg-[var(--saptta-accent)]/15 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-[var(--saptta-accent)]">{i + 1}</span>
                </div>
                <p className="text-sm text-[var(--saptta-ink-2)] leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Button className="flex-1 rounded-full bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90 text-sm"
              onClick={() => { setAiOpen(false); setCurrentView("ai-assistant"); }}>
              <Sparkles className="size-4 mr-1.5" />Ask Follow-up
            </Button>
            <Button variant="outline" className="rounded-full border-[var(--saptta-line)] text-sm"
              onClick={() => setAiOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

/* ──────────────── Quick Actions Row ──────────────── */

const QUICK_ACTION_ROUTES: Record<string, string> = {
  "Ask AI": "ai-assistant",
  "AI Career Coach": "ai-assistant",
  "Raise Requisition": "recruitment",
  "Approve Leave": "attendance",
  "Review Performance": "performance",
  "Run Payroll": "payroll",
  "View Analytics": "analytics",
  "My Payslips": "payroll",
  "Apply for Leave": "attendance",
  "Apply Leave": "attendance",
  "View Payslip": "payroll",
  "Update Profile": "core-hr",
  "My Goals": "performance",
  "Update Resume": "recruitment",
  "Browse Jobs": "recruitment",
  "Prepare for Interview": "ai-assistant",
  "Interview Prep": "ai-assistant",
  "Post a Job": "recruitment",
  "Schedule Interview": "attendance",
  "View Reports": "analytics",
};

function QuickActions({ actions }: { actions: Array<{ icon: React.ElementType; label: string; accent?: boolean }> }) {
  const { setCurrentView } = useAppStore();
  return (
    <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
      {actions.map((action, i) => {
        const Icon = action.icon;
        const route = QUICK_ACTION_ROUTES[action.label];
        const handleClick = () => {
          if (route) setCurrentView(route);
          else toast.info(`${action.label} — opening...`);
        };
        return action.accent ? (
          <Button key={i} onClick={handleClick} className="rounded-[999px] bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90 px-6 py-2.5 text-sm font-semibold h-auto">
            <Icon className="size-4 mr-2" />{action.label}
          </Button>
        ) : (
          <Button key={i} onClick={handleClick} className="saptta-btn-fill rounded-[999px] bg-[var(--saptta-ink)] text-white hover:text-white px-6 py-2.5 text-sm font-semibold h-auto">
            <Icon className="size-4 mr-2" />{action.label}
          </Button>
        );
      })}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HR ADMIN DASHBOARD
   ══════════════════════════════════════════════════════════════ */

const headcountData = [
  { month: "Jan", count: 1120 },
  { month: "Feb", count: 1135 },
  { month: "Mar", count: 1150 },
  { month: "Apr", count: 1162 },
  { month: "May", count: 1178 },
  { month: "Jun", count: 1190 },
  { month: "Jul", count: 1198 },
  { month: "Aug", count: 1210 },
  { month: "Sep", count: 1218 },
  { month: "Oct", count: 1225 },
  { month: "Nov", count: 1235 },
  { month: "Dec", count: 1247 },
];

const deptData = [
  { name: "Engineering", value: 420, color: "var(--saptta-accent)" },
  { name: "Sales", value: 210, color: "var(--saptta-accent-2)" },
  { name: "Marketing", value: 135, color: "#4d94db" },
  { name: "HR", value: 82, color: "var(--saptta-accent-3)" },
  { name: "Finance", value: 95, color: "#8a8680" },
  { name: "Operations", value: 180, color: "#d4a574" },
  { name: "Design", value: 125, color: "#e76f51" },
];

const attritionData = [
  { month: "Jan", rate: 2.1 },
  { month: "Feb", rate: 1.8 },
  { month: "Mar", rate: 2.4 },
  { month: "Apr", rate: 1.6 },
  { month: "May", rate: 2.0 },
  { month: "Jun", rate: 1.5 },
  { month: "Jul", rate: 1.9 },
  { month: "Aug", rate: 2.2 },
  { month: "Sep", rate: 1.7 },
  { month: "Oct", rate: 1.4 },
  { month: "Nov", rate: 1.8 },
  { month: "Dec", rate: 1.3 },
];

const hiringFunnelData = [
  { stage: "Applied", count: 1240, fill: "var(--saptta-accent)" },
  { stage: "Screened", count: 680, fill: "#4d94db" },
  { stage: "Interviewed", count: 320, fill: "var(--saptta-accent-2)" },
  { stage: "Offered", count: 85, fill: "var(--saptta-accent-3)" },
  { stage: "Hired", count: 42, fill: "#8a8680" },
];

const recentActivities = [
  { id: 1, type: "hire", name: "Priya Sharma", action: "joined as Senior Engineer", department: "Engineering", time: "2 min ago", avatar: "PS" },
  { id: 2, type: "leave", name: "Arjun Mehta", action: "applied for leave (3 days)", department: "Marketing", time: "15 min ago", avatar: "AM" },
  { id: 3, type: "promotion", name: "Kavitha Reddy", action: "promoted to Lead Designer", department: "Design", time: "1 hr ago", avatar: "KR" },
  { id: 4, type: "hire", name: "Rahul Verma", action: "joined as Product Manager", department: "Product", time: "2 hrs ago", avatar: "RV" },
  { id: 5, type: "notice", name: "Deepak Nair", action: "resignation submitted", department: "Sales", time: "3 hrs ago", avatar: "DN" },
  { id: 6, type: "leave", name: "Sneha Patil", action: "leave approved (5 days)", department: "Finance", time: "4 hrs ago", avatar: "SP" },
  { id: 7, type: "hire", name: "Vikram Singh", action: "offer letter sent", department: "Engineering", time: "5 hrs ago", avatar: "VS" },
];

const upcomingEventsHR = [
  { type: "birthday", title: "Riya Kapoor's Birthday", date: "Tomorrow", emoji: "🎂" },
  { type: "anniversary", title: "Amit Joshi — 5 Year Anniversary", date: "Jun 8", emoji: "🏆" },
  { type: "holiday", title: "Bakrid — Office Closed", date: "Jun 10", emoji: "🎉" },
  { type: "birthday", title: "Neha Gupta's Birthday", date: "Jun 12", emoji: "🎂" },
  { type: "anniversary", title: "Suresh Kumar — 3 Year Anniversary", date: "Jun 15", emoji: "🏆" },
];

const typeColors: Record<string, string> = {
  hire: "var(--saptta-accent-2)",
  leave: "var(--saptta-accent)",
  promotion: "#4d94db",
  notice: "#ef4444",
};

function HRAdminDashboard() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <GreetingHeader name="Priya" role="HR Director" subtitle="Here's what's happening across your organization today." />

      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Total Employees" value={1247} displayValue="1,247" trend="up" trendLabel="+12 this month" accentColor="#fdc500" />
        <KpiCard icon={Briefcase} label="Open Positions" value={34} displayValue="34" trend="up" trendLabel="8 urgent" accentColor="#00509d" />
        <motion.div variants={fadeUp}>
          <Card className="saptta-module-card border-[var(--saptta-line)] bg-white hover:shadow-lg transition-shadow duration-300 rounded-[20px]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-[16px] module-icon" style={{ backgroundColor: "#f59e0b10", color: "#f59e0b" }}>
                  <Clock className="size-5" />
                </div>
                <Badge variant="secondary" className="text-[10px] font-semibold rounded-full bg-green-50 text-green-600">
                  <ArrowUpRight className="size-3 mr-0.5" />+1.2%
                </Badge>
              </div>
              <div className="flex items-end gap-4 mt-4">
                <span className="text-[40px] md:text-[48px] font-bold leading-none tracking-[-2px] text-[var(--saptta-ink)] module-text" style={{ fontVariantNumeric: "tabular-nums" }}>
                  94.2<span className="text-[24px] md:text-[28px]">%</span>
                </span>
                <div className="pb-1">
                  <CircularProgress value={94.2} size={52} strokeWidth={5} />
                </div>
              </div>
              <p className="text-xs text-[var(--saptta-mute)] italic mt-1">Attendance Today</p>
            </CardContent>
          </Card>
        </motion.div>
        <KpiCard icon={IndianRupee} label="Monthly Payroll" value={120} displayValue="₹1.2Cr" trend="up" trendLabel="+3.5% vs last" accentColor="#00509d" />
      </motion.div>

      {/* Charts 2x2 */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Headcount Trend */}
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Headcount Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={headcountData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8a8680" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#8a8680" }} axisLine={false} tickLine={false} domain={[1100, 1280]} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="count" name="Headcount" stroke="var(--saptta-accent)" strokeWidth={3} dot={{ r: 4, fill: "var(--saptta-accent)", strokeWidth: 0 }} activeDot={{ r: 6, fill: "var(--saptta-accent)", stroke: "#fff", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={deptData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0];
                    return (
                      <div className="rounded-xl bg-[#0a0a0b] dark:bg-[#2a2a2c] px-3 py-2 text-xs text-white shadow-lg border border-[#2a2a2c]">
                        <p className="font-medium">{data.name}</p>
                        <p style={{ color: (data.payload as { color: string }).color }}>{data.value} employees</p>
                      </div>
                    );
                  }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attrition Rate */}
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Attrition Rate (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={attritionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8a8680" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#8a8680" }} axisLine={false} tickLine={false} domain={[0, 3]} />
                <Tooltip content={<ChartTooltip />} />
                <defs>
                  <linearGradient id="attritionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--saptta-accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--saptta-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="rate" name="Attrition %" stroke="var(--saptta-accent)" strokeWidth={2} fill="url(#attritionGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hiring Funnel */}
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Hiring Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={hiringFunnelData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#8a8680" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="stage" tick={{ fontSize: 12, fill: "#8a8680" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Candidates" radius={[0, 8, 8, 0]} barSize={28}>
                  {hiringFunnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <QuickActions actions={[
        { icon: IndianRupee, label: "Run Payroll" },
        { icon: Briefcase, label: "Create Job Requisition" },
        { icon: FileText, label: "Generate Report" },
        { icon: Sparkles, label: "Ask AI", accent: true },
      ]} />

      {/* AI Insights Card */}
      <motion.div variants={fadeUp}>
        <Card className="saptta-card-glow border-[var(--saptta-accent)]/20 rounded-[24px] bg-gradient-to-r from-[var(--saptta-accent)]/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-[20px] bg-[var(--saptta-accent)]/10">
                <Sparkles className="size-6 text-[var(--saptta-accent)]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-[var(--saptta-ink)]">AI Insights</h3>
                <p className="text-sm text-[var(--saptta-mute)] mt-1">
                  3 candidates scored above 90% for <span className="font-medium text-[var(--saptta-ink)]">Senior Frontend Developer</span>. Review and shortlist?
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <Button size="sm" className="rounded-[999px] bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90 px-5 h-9 text-sm">
                    <Eye className="size-3.5 mr-1.5" />
                    Review Candidates
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-[999px] border-[var(--saptta-line)] text-sm px-5 h-9">
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Row: Activity Feed + Upcoming Events */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Recent Activity</CardTitle>
            <Button variant="ghost" className="text-xs text-[var(--saptta-mute)] hover:text-[var(--saptta-accent)] p-0 h-auto">
              View all <ChevronRight className="size-3.5 ml-0.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-0.5 max-h-80 overflow-y-auto">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="saptta-pipeline-row flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[var(--saptta-bg-2)] transition-colors"
              >
                <div className="relative">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] text-xs font-semibold">
                      {activity.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white dark:border-[var(--saptta-dark-card)]"
                    style={{ backgroundColor: typeColors[activity.type] }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--saptta-ink)] truncate">
                    <span className="font-medium">{activity.name}</span>{" "}
                    <span className="text-[var(--saptta-mute)]">{activity.action}</span>
                  </p>
                  <p className="text-xs text-[var(--saptta-mute)] mt-0.5">{activity.department}</p>
                </div>
                <span className="text-[11px] text-[var(--saptta-mute)] whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Upcoming Events</CardTitle>
            <Calendar className="size-4 text-[var(--saptta-mute)]" />
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {upcomingEventsHR.map((event, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--saptta-bg-2)] transition-colors">
                <span className="text-xl mt-0.5">{event.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--saptta-ink)] truncate">{event.title}</p>
                  <p className="text-xs text-[var(--saptta-mute)] mt-0.5">{event.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MANAGER DASHBOARD
   ══════════════════════════════════════════════════════════════ */

const teamPerformanceData = [
  { name: "Arun K.", rating: 4.5 },
  { name: "Meena S.", rating: 3.8 },
  { name: "Rohit P.", rating: 4.2 },
  { name: "Divya M.", rating: 4.8 },
  { name: "Kiran V.", rating: 3.5 },
  { name: "Pooja R.", rating: 4.0 },
  { name: "Sanjay T.", rating: 3.2 },
  { name: "Lakshmi N.", rating: 4.6 },
];

const pipelineStages = [
  { stage: "Open", count: 8, color: "var(--saptta-accent)" },
  { stage: "Screening", count: 12, color: "#4d94db" },
  { stage: "Interview", count: 6, color: "var(--saptta-accent-2)" },
  { stage: "Assessment", count: 4, color: "var(--saptta-accent-3)" },
  { stage: "Offer", count: 2, color: "#8a8680" },
];

const pendingApprovals = [
  { id: 1, type: "Leave Request", name: "Arun Kumar", detail: "3 days — Jun 5-7", avatar: "AK", icon: CalendarDays },
  { id: 2, type: "Leave Request", name: "Meena Sharma", detail: "1 day — Jun 8", avatar: "MS", icon: CalendarDays },
  { id: 3, type: "Expense Claim", name: "Rohit Patil", detail: "₹12,500 — Travel", avatar: "RP", icon: Wallet },
  { id: 4, type: "Leave Request", name: "Divya Menon", detail: "5 days — Jun 12-16", avatar: "DM", icon: CalendarDays },
];

const teamOnLeave = [
  { name: "Vikram Iyer", role: "Senior Engineer", avatar: "VI", reason: "Personal" },
  { name: "Nisha Patel", role: "QA Engineer", avatar: "NP", reason: "Sick Leave" },
  { name: "Amit Joshi", role: "Frontend Dev", avatar: "AJ", reason: "Vacation" },
];

const managerInterviews = [
  { id: 1, candidate: "Suresh Babu", job: "Backend Engineer", time: "10:00 AM", interviewer: "You", avatar: "SB" },
  { id: 2, candidate: "Ananya Krishnan", job: "Senior Frontend Dev", time: "2:00 PM", interviewer: "You + HR", avatar: "AK" },
  { id: 3, candidate: "Rohan Patel", job: "DevOps Engineer", time: "4:30 PM", interviewer: "You", avatar: "RP" },
];

function ManagerDashboard() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <GreetingHeader name="Rajesh" role="Engineering Manager" subtitle="Your team overview and pending actions." />

      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Team Size" value={42} displayValue="42" trend="up" trendLabel="+2 this month" accentColor="#fdc500" />
        <KpiCard icon={Briefcase} label="Open Requisitions" value={5} displayValue="5" trend="up" trendLabel="3 urgent" accentColor="#00509d" />
        <motion.div variants={fadeUp}>
          <Card className="saptta-module-card border-[var(--saptta-line)] bg-white hover:shadow-lg transition-shadow duration-300 rounded-[20px]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-[16px] module-icon" style={{ backgroundColor: "#f59e0b10", color: "#f59e0b" }}>
                  <Clock className="size-5" />
                </div>
                <Badge variant="secondary" className="text-[10px] font-semibold rounded-full bg-green-50 text-green-600">
                  <ArrowUpRight className="size-3 mr-0.5" />96.5%
                </Badge>
              </div>
              <div className="flex items-end gap-4 mt-4">
                <span className="text-[40px] md:text-[48px] font-bold leading-none tracking-[-2px] text-[var(--saptta-ink)] module-text" style={{ fontVariantNumeric: "tabular-nums" }}>
                  96.5<span className="text-[24px] md:text-[28px]">%</span>
                </span>
                <div className="pb-1">
                  <CircularProgress value={96.5} size={52} strokeWidth={5} />
                </div>
              </div>
              <p className="text-xs text-[var(--saptta-mute)] italic mt-1">Team Attendance</p>
            </CardContent>
          </Card>
        </motion.div>
        <KpiCard icon={ClipboardList} label="Pending Reviews" value={8} displayValue="8" trend="neutral" trendLabel="Due this week" accentColor="#003f88" />
      </motion.div>

      {/* Hiring Pipeline + Team Performance */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mini Kanban Pipeline */}
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">My Team&apos;s Hiring Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pipelineStages.map((stage, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-20 text-xs font-medium text-[var(--saptta-ink)]">{stage.stage}</div>
                <div className="flex-1 bg-[var(--saptta-bg-2)] rounded-full h-8 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stage.count / 12) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 0.8, 0.22, 1] }}
                    className="h-full rounded-full flex items-center justify-end pr-2"
                    style={{ backgroundColor: stage.color }}
                  >
                    <span className="text-xs font-bold text-white">{stage.count}</span>
                  </motion.div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Team Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={teamPerformanceData} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8a8680" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#8a8680" }} axisLine={false} tickLine={false} domain={[0, 5]} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="rating" name="Q Rating" radius={[8, 8, 0, 0]} barSize={32}>
                  {teamPerformanceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "var(--saptta-accent)" : "var(--saptta-accent-2)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pending Approvals + Team on Leave + Interviews */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pending Approvals */}
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {pendingApprovals.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="p-3 rounded-xl bg-[var(--saptta-bg-2)] space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] text-[10px] font-semibold">
                        {item.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--saptta-ink)]">{item.name}</p>
                      <p className="text-[10px] text-[var(--saptta-mute)]">{item.detail}</p>
                    </div>
                    <Badge variant="secondary" className="text-[9px] rounded-full bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)]">
                      <Icon className="size-2.5 mr-0.5" />
                      {item.type}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-7 rounded-lg bg-green-500 text-white hover:bg-green-600 text-xs">
                      <Check className="size-3 mr-1" />Approve
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 h-7 rounded-lg text-xs border-red-200 text-red-500 hover:bg-red-50">
                      <X className="size-3 mr-1" />Reject
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Team Members on Leave Today */}
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">On Leave Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {teamOnLeave.map((person, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--saptta-bg-2)]">
                <Avatar className="size-9 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] text-xs font-semibold">
                    {person.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--saptta-ink)]">{person.name}</p>
                  <p className="text-xs text-[var(--saptta-mute)]">{person.role}</p>
                </div>
                <Badge variant="secondary" className="text-[9px] rounded-full bg-amber-50 text-amber-600">
                  {person.reason}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Interviews This Week */}
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Interviews This Week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {managerInterviews.map((interview) => (
              <div key={interview.id} className="p-3 rounded-xl bg-[var(--saptta-bg-2)] space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="size-7 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] text-[10px] font-semibold">
                      {interview.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--saptta-ink)]">{interview.candidate}</p>
                    <p className="text-[10px] text-[var(--saptta-mute)]">{interview.job}</p>
                  </div>
                  <Badge variant="secondary" className="text-[9px] rounded-full bg-blue-50 text-blue-600">
                    {interview.time}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[var(--saptta-mute)]">With: {interview.interviewer}</span>
                  <Button size="sm" className="h-6 rounded-lg bg-[var(--saptta-accent)] text-white text-[10px] px-3 hover:bg-[var(--saptta-accent)]/90"
                    onClick={() => { toast.success("Opening meeting room…"); window.open("https://meet.google.com/new", "_blank"); }}>
                    <Video className="size-3 mr-1" />Join
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <QuickActions actions={[
        { icon: Briefcase, label: "Raise Requisition" },
        { icon: CheckCircle2, label: "Approve Leave" },
        { icon: Target, label: "Review Performance" },
        { icon: Sparkles, label: "Ask AI", accent: true },
      ]} />
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   EMPLOYEE DASHBOARD
   ══════════════════════════════════════════════════════════════ */

const leaveRequests = [
  { id: 1, type: "Casual Leave", dates: "May 28-29", days: 2, status: "approved" },
  { id: 2, type: "Sick Leave", dates: "Jun 3", days: 1, status: "approved" },
  { id: 3, type: "Planned Leave", dates: "Jun 15-16", days: 2, status: "pending" },
  { id: 4, type: "Casual Leave", dates: "Jun 22", days: 1, status: "rejected" },
];

const payslipSummary = [
  { month: "May 2025", gross: "₹2,40,000", deductions: "₹58,200", net: "₹1,81,800" },
  { month: "Apr 2025", gross: "₹2,40,000", deductions: "₹58,200", net: "₹1,81,800" },
  { month: "Mar 2025", gross: "₹2,35,000", deductions: "₹57,100", net: "₹1,77,900" },
];

const myGoals = [
  { id: 1, title: "Complete Q2 Feature Deliverables", progress: 72, target: "Ship 5 features by Jun 30" },
  { id: 2, title: "Reduce Bug Backlog by 40%", progress: 55, target: "From 60 to 36 open bugs" },
  { id: 3, title: "Mentor 2 Junior Engineers", progress: 85, target: "Weekly 1:1s and code reviews" },
];

const employeeEvents = [
  { emoji: "🎂", title: "Team Lunch — Riya's Birthday", date: "Tomorrow" },
  { emoji: "🎉", title: "Bakrid — Office Closed", date: "Jun 10" },
  { emoji: "🏆", title: "Hackathon Winners Announcement", date: "Jun 12" },
  { emoji: "🌴", title: "Company Offsite — Goa", date: "Jun 20-22" },
];

// Mini calendar data for current month (June 2025)
const calendarDays = [
  // June 2025 starts on Sunday
  { day: 1, status: "present" },
  { day: 2, status: "present" },
  { day: 3, status: "present" },
  { day: 4, status: "present" },
  { day: 5, status: "present" },
  { day: 6, status: "present" },
  { day: 7, status: "weekend" },
  { day: 8, status: "weekend" },
  { day: 9, status: "present" },
  { day: 10, status: "present" },
  { day: 11, status: "present" },
  { day: 12, status: "present" },
  { day: 13, status: "present" },
  { day: 14, status: "weekend" },
  { day: 15, status: "weekend" },
  { day: 16, status: "present" },
  { day: 17, status: "present" },
  { day: 18, status: "present" },
  { day: 19, status: "wfh" },
  { day: 20, status: "present" },
  { day: 21, status: "weekend" },
  { day: 22, status: "weekend" },
  { day: 23, status: "present" },
  { day: 24, status: "present" },
  { day: 25, status: "present" },
  { day: 26, status: "today" },
  { day: 27, status: "future" },
  { day: 28, status: "future" },
  { day: 29, status: "weekend" },
  { day: 30, status: "weekend" },
];

const statusColors: Record<string, string> = {
  present: "bg-green-500 text-white",
  wfh: "bg-blue-500 text-white",
  leave: "bg-amber-500 text-white",
  weekend: "bg-[var(--saptta-bg-2)] text-[var(--saptta-mute)]",
  today: "bg-[var(--saptta-accent)] text-white ring-2 ring-[var(--saptta-accent)]/30",
  future: "bg-white text-[var(--saptta-mute)]",
};

function EmployeeDashboard() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <GreetingHeader name="Anita" role="Software Engineer" subtitle="Your personal overview and quick actions." />

      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Palmtree} label="Leave Balance" value={18} displayValue="18 days" trend="neutral" trendLabel="CL: 10, SL: 5, PL: 3" accentColor="#fdc500" />
        <motion.div variants={fadeUp}>
          <Card className="saptta-module-card border-[var(--saptta-line)] bg-white hover:shadow-lg transition-shadow duration-300 rounded-[20px]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-[16px] module-icon" style={{ backgroundColor: "#22c55e10", color: "#22c55e" }}>
                  <CalendarDays className="size-5" />
                </div>
                <Badge variant="secondary" className="text-[10px] font-semibold rounded-full bg-green-50 text-green-600">
                  22/23
                </Badge>
              </div>
              <div className="flex items-end gap-4 mt-4">
                <span className="text-[40px] md:text-[48px] font-bold leading-none tracking-[-2px] text-[var(--saptta-ink)] module-text" style={{ fontVariantNumeric: "tabular-nums" }}>
                  22<span className="text-[24px] md:text-[28px]">/23</span>
                </span>
                <div className="pb-1">
                  <CircularProgress value={95.6} size={52} strokeWidth={5} />
                </div>
              </div>
              <p className="text-xs text-[var(--saptta-mute)] italic mt-1">This Month Attendance</p>
            </CardContent>
          </Card>
        </motion.div>
        <KpiCard icon={IndianRupee} label="Pay Slip (Net)" value={180} displayValue="₹1.8L" trend="up" trendLabel="+2.1% vs last" accentColor="#00509d" />
        <motion.div variants={fadeUp}>
          <Card className="saptta-module-card border-[var(--saptta-line)] bg-white hover:shadow-lg transition-shadow duration-300 rounded-[20px]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-[16px] module-icon" style={{ backgroundColor: "var(--saptta-accent-3)10", color: "var(--saptta-accent-3)" }}>
                  <Goal className="size-5" />
                </div>
                <Badge variant="secondary" className="text-[10px] font-semibold rounded-full bg-amber-50 text-amber-600">
                  On Track
                </Badge>
              </div>
              <div className="flex items-end gap-4 mt-4">
                <span className="text-[40px] md:text-[48px] font-bold leading-none tracking-[-2px] text-[var(--saptta-ink)] module-text" style={{ fontVariantNumeric: "tabular-nums" }}>
                  72<span className="text-[24px] md:text-[28px]">%</span>
                </span>
                <div className="pb-1">
                  <CircularProgress value={72} size={52} strokeWidth={5} />
                </div>
              </div>
              <p className="text-xs text-[var(--saptta-mute)] italic mt-1">Goals Progress</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Attendance Calendar + Leave Requests */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mini Attendance Calendar */}
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">My Attendance Calendar — June 2025</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-medium text-[var(--saptta-mute)] py-1">
                  {d}
                </div>
              ))}
            </div>
            {/* Calendar grid - June 2025 starts on Sunday (index 0) */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells before day 1 - June 1 is Sunday, so 0 offset */}
              {calendarDays.map((d) => (
                <div
                  key={d.day}
                  className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium ${statusColors[d.status]}`}
                >
                  {d.day}
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4">
              {[
                { label: "Present", color: "bg-green-500" },
                { label: "WFH", color: "bg-blue-500" },
                { label: "Leave", color: "bg-amber-500" },
                { label: "Today", color: "bg-[var(--saptta-accent)]" },
                { label: "Weekend", color: "bg-[var(--saptta-bg-2)]" },
              ].map((l, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={`size-2.5 rounded-sm ${l.color}`} />
                  <span className="text-[10px] text-[var(--saptta-mute)]">{l.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leave Requests */}
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">My Leave Requests</CardTitle>
            <Button variant="ghost" className="text-xs text-[var(--saptta-mute)] hover:text-[var(--saptta-accent)] p-0 h-auto">
              View all <ChevronRight className="size-3.5 ml-0.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {leaveRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--saptta-bg-2)]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--saptta-ink)]">{req.type}</p>
                  <p className="text-xs text-[var(--saptta-mute)]">{req.dates} &middot; {req.days} day{req.days > 1 ? "s" : ""}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-[10px] font-semibold rounded-full ${
                    req.status === "approved"
                      ? "bg-green-50 text-green-600"
                      : req.status === "pending"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {req.status === "approved" && <CheckCircle2 className="size-3 mr-0.5" />}
                  {req.status === "pending" && <Clock className="size-3 mr-0.5" />}
                  {req.status === "rejected" && <XCircle className="size-3 mr-0.5" />}
                  {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Payslip Summary + Goals */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payslip Summary */}
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Payslip Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--saptta-line)]">
                    <th className="text-left py-2 text-xs font-medium text-[var(--saptta-mute)]">Month</th>
                    <th className="text-right py-2 text-xs font-medium text-[var(--saptta-mute)]">Gross</th>
                    <th className="text-right py-2 text-xs font-medium text-[var(--saptta-mute)]">Deductions</th>
                    <th className="text-right py-2 text-xs font-medium text-[var(--saptta-mute)]">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {payslipSummary.map((slip, i) => (
                    <tr key={i} className="border-b border-[var(--saptta-line)] last:border-0">
                      <td className="py-2.5 text-[var(--saptta-ink)] font-medium text-xs">{slip.month}</td>
                      <td className="py-2.5 text-right text-xs text-[var(--saptta-ink)]">{slip.gross}</td>
                      <td className="py-2.5 text-right text-xs text-red-500">{slip.deductions}</td>
                      <td className="py-2.5 text-right text-xs font-semibold text-[var(--saptta-ink)]">{slip.net}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4 rounded-xl border-[var(--saptta-line)] text-xs">
              <FileText className="size-3.5 mr-1.5" />
              Download Latest Payslip
            </Button>
          </CardContent>
        </Card>

        {/* My Goals/OKRs */}
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">My Goals / OKRs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-80 overflow-y-auto">
            {myGoals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--saptta-ink)]">{goal.title}</p>
                    <p className="text-xs text-[var(--saptta-mute)]">{goal.target}</p>
                  </div>
                  <span className="text-sm font-bold text-[var(--saptta-accent)]">{goal.progress}%</span>
                </div>
                <div className="w-full bg-[var(--saptta-bg-2)] rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 1, ease: [0.22, 0.8, 0.22, 1] }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: goal.progress >= 70 ? "var(--saptta-accent-2)" : goal.progress >= 40 ? "#4d94db" : "var(--saptta-accent)" }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming Events */}
      <motion.div variants={fadeUp}>
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Upcoming Events</CardTitle>
            <PartyPopper className="size-4 text-[var(--saptta-mute)]" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {employeeEvents.map((event, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--saptta-bg-2)]">
                  <span className="text-xl mt-0.5">{event.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--saptta-ink)] truncate">{event.title}</p>
                    <p className="text-xs text-[var(--saptta-mute)] mt-0.5">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <QuickActions actions={[
        { icon: CalendarDays, label: "Apply Leave" },
        { icon: FileText, label: "View Payslip" },
        { icon: UserCog, label: "Update Profile" },
        { icon: Sparkles, label: "Ask AI", accent: true },
      ]} />
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   RECRUITER DASHBOARD
   ══════════════════════════════════════════════════════════════ */

const recruiterFunnelData = [
  { stage: "Sourced", count: 68, fill: "#fdc500" },
  { stage: "Screened", count: 42, fill: "#4d8bc9" },
  { stage: "Interview", count: 18, fill: "#00509d" },
  { stage: "Assessment", count: 12, fill: "#003f88" },
  { stage: "Offer", count: 6, fill: "#6b82a8" },
  { stage: "Hired", count: 3, fill: "#22c55e" },
];

const highScoreCandidates = [
  { id: 1, name: "Ananya Krishnan", job: "Senior Frontend Developer", score: 92, skills: ["React", "TypeScript", "Node.js"], avatar: "AK" },
  { id: 2, name: "Suresh Babu", job: "Backend Engineer", score: 88, skills: ["Java", "Spring Boot", "AWS"], avatar: "SB" },
  { id: 3, name: "Rohan Patel", job: "DevOps Engineer", score: 85, skills: ["Docker", "K8s", "Terraform"], avatar: "RP" },
];

const recruiterInterviews = [
  { id: 1, candidate: "Ananya Krishnan", job: "Senior Frontend Developer", time: "9:00 AM", interviewer: "Rajesh Kumar", avatar: "AK" },
  { id: 2, candidate: "Vikram Singh", job: "Product Designer", time: "11:30 AM", interviewer: "Kavitha Reddy", avatar: "VS" },
  { id: 3, candidate: "Suresh Babu", job: "Backend Engineer", time: "2:00 PM", interviewer: "Rajesh Kumar", avatar: "SB" },
  { id: 4, candidate: "Neha Gupta", job: "QA Engineer", time: "4:00 PM", interviewer: "Meena Sharma", avatar: "NG" },
];

const sourceAnalytics = [
  { source: "LinkedIn", count: 45, fill: "#fdc500" },
  { source: "Naukri", count: 38, fill: "#00509d" },
  { source: "Referral", count: 28, fill: "#4d8bc9" },
  { source: "Website", count: 25, fill: "#003f88" },
  { source: "Campus", count: 12, fill: "#6b82a8" },
  { source: "Agency", count: 8, fill: "#ffd500" },
];

const jobWiseData = [
  { job: "Sr. Frontend Dev", sourced: 18, screened: 12, interview: 6, offer: 2 },
  { job: "Backend Engineer", sourced: 15, screened: 10, interview: 4, offer: 1 },
  { job: "Product Designer", sourced: 12, screened: 8, interview: 3, offer: 1 },
  { job: "DevOps Engineer", sourced: 10, screened: 6, interview: 3, offer: 1 },
  { job: "QA Engineer", sourced: 8, screened: 4, interview: 2, offer: 1 },
  { job: "Data Analyst", sourced: 5, screened: 2, interview: 0, offer: 0 },
];

function RecruiterDashboard() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <GreetingHeader name="Kavitha" role="Senior Recruiter" subtitle="Your recruiting pipeline and candidate updates." />

      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Briefcase} label="Active Jobs" value={12} displayValue="12" trend="up" trendLabel="3 urgent" accentColor="#fdc500" />
        <KpiCard icon={Users} label="Total Candidates" value={156} displayValue="156" trend="up" trendLabel="+24 this week" accentColor="#00509d" />
        <KpiCard icon={Video} label="Interviews Today" value={4} displayValue="4" trend="neutral" trendLabel="2 completed" accentColor="#4d94db" />
        <KpiCard icon={BadgeCheck} label="Offers Pending" value={6} displayValue="6" trend="up" trendLabel="+2 this week" accentColor="#003f88" />
      </motion.div>

      {/* Recruiting Pipeline Funnel */}
      <motion.div variants={fadeUp}>
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Recruiting Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {recruiterFunnelData.map((stage, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center min-w-[80px]">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 0.8, 0.22, 1] }}
                      className="w-full rounded-t-xl flex items-end justify-center overflow-hidden"
                      style={{ minHeight: 60 }}
                    >
                      <div
                        className="w-full rounded-xl flex flex-col items-center justify-center py-4 px-3"
                        style={{ backgroundColor: `${stage.fill}15` }}
                      >
                        <span className="text-2xl font-bold" style={{ color: stage.fill }}>{stage.count}</span>
                      </div>
                    </motion.div>
                    <span className="text-xs font-medium text-[var(--saptta-ink)] mt-2">{stage.stage}</span>
                  </div>
                  {i < recruiterFunnelData.length - 1 && (
                    <ChevronRight className="size-4 text-[var(--saptta-mute)] shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* High-Score Candidates */}
      <motion.div variants={fadeUp}>
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">High-Score Candidates Alert</CardTitle>
            <Badge variant="secondary" className="text-[10px] font-semibold rounded-full bg-green-50 text-green-600">
              <Zap className="size-3 mr-0.5" />≥85% Match
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {highScoreCandidates.map((candidate) => (
                <div key={candidate.id} className="p-4 rounded-[20px] border border-[var(--saptta-line)] bg-[var(--saptta-bg-2)] space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 rounded-xl">
                      <AvatarFallback className="rounded-xl bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] text-sm font-semibold">
                        {candidate.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--saptta-ink)]">{candidate.name}</p>
                      <p className="text-xs text-[var(--saptta-mute)]">{candidate.job}</p>
                    </div>
                    <div className="flex size-11 items-center justify-center rounded-full bg-green-500/10">
                      <span className="text-sm font-bold text-green-600">{candidate.score}%</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-[9px] rounded-full bg-[var(--saptta-accent)]/5 text-[var(--saptta-accent)]">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-8 rounded-lg bg-[var(--saptta-accent)] text-white text-xs hover:bg-[var(--saptta-accent)]/90">
                      <Mail className="size-3 mr-1" />Email
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 h-8 rounded-lg text-xs border-[var(--saptta-line)]">
                      <Calendar className="size-3 mr-1" />Schedule
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Interviews */}
      <motion.div variants={fadeUp}>
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Today&apos;s Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recruiterInterviews.map((interview) => (
                <div key={interview.id} className="p-4 rounded-[20px] border border-[var(--saptta-line)] bg-[var(--saptta-bg-2)] space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] text-xs font-semibold">
                        {interview.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--saptta-ink)]">{interview.candidate}</p>
                      <p className="text-[10px] text-[var(--saptta-mute)]">{interview.job}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--saptta-mute)]">
                    <Clock className="size-3" />
                    {interview.time}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--saptta-mute)]">
                    <Users className="size-3" />
                    {interview.interviewer}
                  </div>
                  <Button size="sm" className="w-full h-8 rounded-lg bg-[var(--saptta-accent)] text-white text-xs hover:bg-[var(--saptta-accent)]/90"
                    onClick={() => { toast.success(`Joining interview with ${interview.candidate}…`); window.open("https://meet.google.com/new", "_blank"); }}>
                    <Video className="size-3 mr-1" />Join Interview
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Source Analytics + Job-wise Distribution */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source Analytics */}
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Source Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sourceAnalytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
                <XAxis dataKey="source" tick={{ fontSize: 11, fill: "#8a8680" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#8a8680" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Candidates" radius={[8, 8, 0, 0]} barSize={36}>
                  {sourceAnalytics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Job-wise Candidate Distribution */}
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Job-wise Candidate Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={jobWiseData} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
                <XAxis dataKey="job" tick={{ fontSize: 10, fill: "#8a8680" }} axisLine={false} tickLine={false} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 12, fill: "#8a8680" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="sourced" name="Sourced" stackId="a" fill="var(--saptta-accent)" radius={[0, 0, 0, 0]} barSize={28} />
                <Bar dataKey="screened" name="Screened" stackId="a" fill="#4d94db" radius={[0, 0, 0, 0]} barSize={28} />
                <Bar dataKey="interview" name="Interview" stackId="a" fill="var(--saptta-accent-2)" radius={[0, 0, 0, 0]} barSize={28} />
                <Bar dataKey="offer" name="Offer" stackId="a" fill="var(--saptta-accent-3)" radius={[8, 8, 0, 0]} barSize={28} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <QuickActions actions={[
        { icon: Briefcase, label: "Post Job" },
        { icon: Search, label: "Screen Resumes" },
        { icon: Calendar, label: "Schedule Interview" },
        { icon: Sparkles, label: "Ask AI", accent: true },
      ]} />
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN ROLE-BASED DASHBOARD VIEW
   ══════════════════════════════════════════════════════════════ */

export function RoleBasedDashboardView() {
  const { userRole } = useAppStore();

  switch (userRole) {
    case "hr_admin":
      return <HRAdminDashboard />;
    case "manager":
      return <ManagerDashboard />;
    case "employee":
      return <EmployeeDashboard />;
    case "recruiter":
      return <RecruiterDashboard />;
    case "applicant":
      return <ApplicantDashboard />;
    default:
      return <HRAdminDashboard />;
  }
}