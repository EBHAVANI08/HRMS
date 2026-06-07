"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Video,
  Award,
  Target,
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  ExternalLink,
  FileText,
  User,
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  Filter,
  TrendingUp,
  Building2,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  X,
  Search,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppStore, type JobApplication } from "@/lib/store";
import { toast } from "sonner";

/* ──────────────── Animation Config ──────────────── */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 0.8, 0.22, 1] },
  },
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

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
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

function CircularProgress({
  value,
  size = 80,
  strokeWidth = 6,
  strokeColor = "var(--saptta-accent)",
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  strokeColor?: string;
}) {
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
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e8e8e8"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={strokeColor}
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
            style={{
              backgroundColor: `${accentColor || "var(--saptta-accent)"}10`,
              color: accentColor || "var(--saptta-accent)",
            }}
          >
            <Icon className="size-5" />
          </div>
          {trend !== "neutral" && (
            <Badge
              variant="secondary"
              className={`text-[10px] font-semibold rounded-full ${
                trend === "up"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-500"
              }`}
            >
              {trend === "up" ? (
                <ArrowUpRight className="size-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="size-3 mr-0.5" />
              )}
              {trendLabel}
            </Badge>
          )}
          {trend === "neutral" && (
            <Badge
              variant="secondary"
              className="text-[10px] font-semibold rounded-full bg-blue-50 text-blue-600"
            >
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
        <p className="text-xs text-[var(--saptta-mute)] italic mt-1">
          {label}
        </p>
      </CardContent>
    </Card>
  );
}

/* ──────────────── Status Badge Helper ──────────────── */

const statusConfig: Record<
  JobApplication["status"],
  { label: string; bg: string; text: string; dot: string }
> = {
  applied: {
    label: "Applied",
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-500",
  },
  screening: {
    label: "Screening",
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-500",
  },
  interview: {
    label: "Interview",
    bg: "bg-purple-50",
    text: "text-purple-600",
    dot: "bg-purple-500",
  },
  offered: {
    label: "Offered",
    bg: "bg-green-50",
    text: "text-green-600",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-500",
    dot: "bg-red-500",
  },
  withdrawn: {
    label: "Withdrawn",
    bg: "bg-gray-50",
    text: "text-gray-500",
    dot: "bg-gray-400",
  },
};

function StatusBadge({ status }: { status: JobApplication["status"] }) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="secondary"
      className={`text-[10px] font-semibold rounded-[999px] ${config.bg} ${config.text} gap-1 px-2.5 py-0.5`}
    >
      <span className={`size-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </Badge>
  );
}

/* ──────────────── Mock Data ──────────────── */

const upcomingInterviews = [
  {
    id: "i1",
    jobTitle: "React Developer",
    company: "Acme Corp",
    date: "Jun 6, 2025",
    time: "10:00 AM",
    interviewer: "Rajesh Kumar",
    type: "Technical Round",
    meetingLink: true,
  },
  {
    id: "i2",
    jobTitle: "Senior Frontend Developer",
    company: "Kam Global",
    date: "Jun 9, 2025",
    time: "2:30 PM",
    interviewer: "Priya Sharma",
    type: "HR Round",
    meetingLink: false,
  },
];

const jobRecommendations = [
  {
    id: "r1",
    jobTitle: "Senior React Developer",
    company: "TechCorp India",
    location: "Bangalore, IN",
    matchScore: 91,
    salary: "₹22-28 LPA",
    posted: "2 days ago",
  },
  {
    id: "r2",
    jobTitle: "Frontend Architect",
    company: "InnovateLabs",
    location: "Hyderabad, IN",
    matchScore: 85,
    salary: "₹25-32 LPA",
    posted: "5 days ago",
  },
  {
    id: "r3",
    jobTitle: "UI Engineer",
    company: "DesignFirst",
    location: "Remote",
    matchScore: 78,
    salary: "₹18-24 LPA",
    posted: "1 week ago",
  },
];

const profileChecklist = [
  { label: "Personal Information", completed: true },
  { label: "Work Experience", completed: true },
  { label: "Education", completed: true },
  { label: "Skills Assessment", completed: false },
  { label: "Portfolio Upload", completed: false },
];

/* ══════════════════════════════════════════════════════════════
   APPLICANT DASHBOARD
   ══════════════════════════════════════════════════════════════ */

export function ApplicantDashboard() {
  const { user, jobApplications, updateApplicationStatus, setCurrentView } = useAppStore();
  const [applicationFilter, setApplicationFilter] = useState("all");

  // Derived KPIs from store data
  const activeApplications = useMemo(
    () =>
      jobApplications.filter((a) =>
        ["applied", "screening", "interview"].includes(a.status)
      ).length,
    [jobApplications]
  );
  const interviewsScheduled = useMemo(
    () => jobApplications.filter((a) => a.status === "interview").length,
    [jobApplications]
  );
  const offersReceived = useMemo(
    () => jobApplications.filter((a) => a.status === "offered").length,
    [jobApplications]
  );
  const avgMatchScore = useMemo(() => {
    const activeApps = jobApplications.filter((a) =>
      ["applied", "screening", "interview", "offered"].includes(a.status)
    );
    if (activeApps.length === 0) return 0;
    const total = activeApps.reduce((acc, a) => acc + (a.matchScore || 0), 0);
    return Math.round(total / activeApps.length);
  }, [jobApplications]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    switch (applicationFilter) {
      case "active":
        return jobApplications.filter((a) =>
          ["applied", "screening", "interview"].includes(a.status)
        );
      case "interview":
        return jobApplications.filter((a) => a.status === "interview");
      case "offered":
        return jobApplications.filter((a) => a.status === "offered");
      case "closed":
        return jobApplications.filter((a) =>
          ["rejected", "withdrawn"].includes(a.status)
        );
      default:
        return jobApplications;
    }
  }, [jobApplications, applicationFilter]);

  // Pipeline data derived from applications
  const pipelineData = useMemo(() => {
    const stages = [
      {
        stage: "Applied",
        count: jobApplications.filter((a) => a.status === "applied").length,
        color: "#3b82f6",
      },
      {
        stage: "Screening",
        count: jobApplications.filter((a) => a.status === "screening").length,
        color: "#f59e0b",
      },
      {
        stage: "Interview",
        count: jobApplications.filter((a) => a.status === "interview").length,
        color: "#8b5cf6",
      },
      {
        stage: "Offer",
        count: jobApplications.filter((a) => a.status === "offered").length,
        color: "#22c55e",
      },
      {
        stage: "Hired",
        count: 0,
        color: "#8a8680",
      },
    ];
    return stages;
  }, [jobApplications]);

  const maxPipelineCount = Math.max(...pipelineData.map((s) => s.count), 1);

  const profileCompleteness = useMemo(() => {
    const completed = profileChecklist.filter((i) => i.completed).length;
    return Math.round((completed / profileChecklist.length) * 100);
  }, []);

  const handleWithdraw = (id: string) => {
    updateApplicationStatus(id, "withdrawn");
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* ──────────── 1. Greeting Header ──────────── */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--saptta-ink)] tracking-tight">
            Welcome back, {user.name?.split(" ")[0] || "Arun"} 👋
          </h1>
          <p className="text-[var(--saptta-mute)] mt-1 text-sm">
            Track your job applications and stay updated on your career journey.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-[999px] border-[var(--saptta-line)] bg-white hover:bg-[var(--saptta-bg-2)] text-sm font-medium gap-2 px-4 h-9"
          >
            <Search className="size-4" />
            Browse Jobs
          </Button>
          <Button
            size="sm"
            className="rounded-[999px] bg-[var(--saptta-accent)] text-white text-sm font-medium hover:bg-[var(--saptta-accent)]/90 gap-2 px-4 h-9"
          >
            <User className="size-4" />
            Update Profile
          </Button>
        </div>
      </motion.div>

      {/* ──────────── 2. KPI Cards Row ──────────── */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <KpiCard
          icon={Briefcase}
          label="Active Applications"
          value={activeApplications}
          displayValue={String(activeApplications)}
          trend="up"
          trendLabel="+1 this week"
          accentColor="var(--saptta-accent)"
        />
        <KpiCard
          icon={Video}
          label="Interviews Scheduled"
          value={interviewsScheduled}
          displayValue={String(interviewsScheduled)}
          trend="neutral"
          trendLabel="Upcoming"
          accentColor="#8b5cf6"
        />
        <KpiCard
          icon={Award}
          label="Offers Received"
          value={offersReceived}
          displayValue={String(offersReceived)}
          trend="up"
          trendLabel="1 new"
          accentColor="#22c55e"
        />
        <motion.div variants={fadeUp}>
          <Card className="saptta-module-card border-[var(--saptta-line)] bg-white hover:shadow-lg transition-shadow duration-300 rounded-[20px]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div
                  className="flex size-10 items-center justify-center rounded-[16px] module-icon"
                  style={{ backgroundColor: "var(--saptta-accent-2)10", color: "var(--saptta-accent-2)" }}
                >
                  <Target className="size-5" />
                </div>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-semibold rounded-full bg-amber-50 text-amber-600"
                >
                  +4% vs avg
                </Badge>
              </div>
              <div className="flex items-end gap-4 mt-4">
                <span
                  className="text-[40px] md:text-[48px] font-bold leading-none tracking-[-2px] text-[var(--saptta-ink)] module-text"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {avgMatchScore}
                  <span className="text-[24px] md:text-[28px]">%</span>
                </span>
                <div className="pb-1">
                  <CircularProgress
                    value={avgMatchScore}
                    size={52}
                    strokeWidth={5}
                    strokeColor="var(--saptta-accent-2)"
                  />
                </div>
              </div>
              <p className="text-xs text-[var(--saptta-mute)] italic mt-1">
                Profile Match Avg
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ──────────── 3. My Applications ──────────── */}
      <motion.div variants={fadeUp}>
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">
              My Applications
            </CardTitle>
            <Tabs
              value={applicationFilter}
              onValueChange={setApplicationFilter}
              className="w-full sm:w-auto"
            >
              <TabsList className="bg-[var(--saptta-bg-2)] h-8 p-0.5 rounded-[999px]">
                <TabsTrigger
                  value="all"
                  className="text-[11px] px-3 h-7 rounded-[999px] data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="text-[11px] px-3 h-7 rounded-[999px] data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="interview"
                  className="text-[11px] px-3 h-7 rounded-[999px] data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Interview
                </TabsTrigger>
                <TabsTrigger
                  value="offered"
                  className="text-[11px] px-3 h-7 rounded-[999px] data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Offered
                </TabsTrigger>
                <TabsTrigger
                  value="closed"
                  className="text-[11px] px-3 h-7 rounded-[999px] data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Closed
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[480px] overflow-y-auto">
            {filteredApplications.length === 0 && (
              <div className="py-12 text-center">
                <Briefcase className="size-10 mx-auto text-[var(--saptta-mute)] mb-3" />
                <p className="text-sm text-[var(--saptta-mute)]">
                  No applications found for this filter.
                </p>
              </div>
            )}
            {filteredApplications.map((application, i) => (
              <motion.div
                key={application.id}
                variants={fadeUp}
                className="p-4 rounded-xl bg-[var(--saptta-bg-2)] hover:bg-white border border-transparent hover:border-[var(--saptta-line)] transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Left: Company Avatar + Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="size-10 rounded-[16px] flex-shrink-0">
                      <AvatarFallback className="rounded-[16px] bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] text-xs font-bold">
                        {application.company
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[var(--saptta-ink)] truncate">
                          {application.jobTitle}
                        </p>
                        <StatusBadge status={application.status} />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[var(--saptta-mute)]">
                          {application.company}
                        </span>
                        <span className="text-[var(--saptta-line)]">·</span>
                        <span className="text-xs text-[var(--saptta-mute)]">
                          Applied {application.appliedAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Match Score + Dates + Actions */}
                  <div className="flex items-center gap-4 sm:gap-6 pl-[52px] sm:pl-0">
                    {/* Match Score */}
                    {application.matchScore != null && (
                      <div className="flex flex-col items-center min-w-[72px]">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 bg-[var(--saptta-line)] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${application.matchScore}%`,
                              }}
                              transition={{
                                duration: 0.8,
                                delay: i * 0.05,
                                ease: [0.22, 0.8, 0.22, 1],
                              }}
                              className="h-full rounded-full"
                              style={{
                                backgroundColor:
                                  application.matchScore >= 80
                                    ? "#22c55e"
                                    : application.matchScore >= 60
                                      ? "#f59e0b"
                                      : "#ef4444",
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-[var(--saptta-ink)]">
                            {application.matchScore}%
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--saptta-mute)] mt-0.5">
                          Match
                        </span>
                      </div>
                    )}

                    {/* Updated date */}
                    <div className="hidden md:flex flex-col items-center min-w-[80px]">
                      <span className="text-xs text-[var(--saptta-ink-2)]">
                        {application.lastUpdatedAt}
                      </span>
                      <span className="text-[10px] text-[var(--saptta-mute)]">
                        Updated
                      </span>
                    </div>

                    {/* Notes tooltip */}
                    {application.notes && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-lg hover:bg-[var(--saptta-accent)]/5"
                            >
                              <FileText className="size-3.5 text-[var(--saptta-mute)]" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="max-w-[220px] text-xs"
                          >
                            {application.notes}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 rounded-lg text-[11px] px-3 border-[var(--saptta-line)]"
                      >
                        <Eye className="size-3 mr-1" />
                        View Details
                      </Button>
                      {["applied", "screening", "interview"].includes(
                        application.status
                      ) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 rounded-lg text-[11px] px-3 border-red-200 text-red-500 hover:bg-red-50"
                          onClick={() => handleWithdraw(application.id)}
                        >
                          <X className="size-3 mr-1" />
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* ──────────── 4. Application Pipeline ──────────── */}
      <motion.div variants={fadeUp}>
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">
              Application Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-stretch gap-0">
              {pipelineData.map((stage, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  {/* Stage bar */}
                  <div className="w-full px-2">
                    <div className="bg-[var(--saptta-bg-2)] rounded-xl h-20 overflow-hidden relative">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{
                          height: `${Math.max((stage.count / maxPipelineCount) * 100, stage.count > 0 ? 20 : 0)}%`,
                        }}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.1,
                          ease: [0.22, 0.8, 0.22, 1],
                        }}
                        className="absolute bottom-0 left-0 right-0 rounded-xl flex items-end justify-center pb-1.5"
                        style={{ backgroundColor: stage.color }}
                      >
                        <span className="text-sm font-bold text-white">
                          {stage.count}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                  {/* Stage label + connector */}
                  <div className="mt-3 flex flex-col items-center">
                    <span className="text-[11px] font-medium text-[var(--saptta-ink)]">
                      {stage.stage}
                    </span>
                    <div
                      className="size-2.5 rounded-full mt-1.5"
                      style={{ backgroundColor: stage.color }}
                    />
                  </div>
                  {/* Connector arrow */}
                  {i < pipelineData.length - 1 && (
                    <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
                  )}
                </div>
              ))}
            </div>
            {/* Pipeline summary */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[var(--saptta-line)]">
              {pipelineData.map((stage, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-[10px] text-[var(--saptta-mute)]">
                    {stage.stage}: {stage.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ──────────── 5. Upcoming Interviews + Profile Completeness ──────────── */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-1 lg:grid-cols-5 gap-4"
      >
        {/* Upcoming Interviews - wider */}
        <Card className="lg:col-span-3 border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">
              Upcoming Interviews
            </CardTitle>
            <Calendar className="size-4 text-[var(--saptta-mute)]" />
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {upcomingInterviews.map((interview) => (
              <div
                key={interview.id}
                className="p-4 rounded-xl bg-[var(--saptta-bg-2)] space-y-3 hover:bg-white hover:border-[var(--saptta-line)] border border-transparent transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-[16px] bg-purple-50 flex-shrink-0">
                    <Video className="size-5 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--saptta-ink)]">
                      {interview.jobTitle}
                    </p>
                    <p className="text-xs text-[var(--saptta-mute)] mt-0.5">
                      {interview.company}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-[10px] rounded-[999px] bg-purple-50 text-purple-600 flex-shrink-0"
                  >
                    {interview.type}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pl-[52px] sm:pl-0">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3 text-[var(--saptta-mute)]" />
                      <span className="text-xs text-[var(--saptta-ink-2)]">
                        {interview.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 text-[var(--saptta-mute)]" />
                      <span className="text-xs text-[var(--saptta-ink-2)]">
                        {interview.time}
                      </span>
                    </div>
                    {interview.interviewer && (
                      <div className="flex items-center gap-1.5">
                        <User className="size-3 text-[var(--saptta-mute)]" />
                        <span className="text-xs text-[var(--saptta-mute)]">
                          {interview.interviewer}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-lg text-[11px] px-3 border-[var(--saptta-line)]"
                      onClick={() => { setCurrentView("ai-assistant"); toast.info("Opening AI Interview Prep..."); }}
                    >
                      <FileText className="size-3 mr-1" />
                      Prepare
                    </Button>
                    {interview.meetingLink && (
                      <Button
                        size="sm"
                        className="h-7 rounded-lg text-[11px] px-3 bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90"
                        onClick={() => { toast.success("Joining meeting room..."); window.open(interview.meetingLink, "_blank"); }}
                      >
                        <Video className="size-3 mr-1" />
                        Join Meeting
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Profile Completeness */}
        <Card className="lg:col-span-2 border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">
              Profile Completeness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                <CircularProgress
                  value={profileCompleteness}
                  size={72}
                  strokeWidth={7}
                  strokeColor="var(--saptta-accent)"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-[var(--saptta-ink)]">
                    {profileCompleteness}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--saptta-ink)]">
                  Almost there!
                </p>
                <p className="text-xs text-[var(--saptta-mute)] mt-0.5">
                  Complete your profile to unlock better matches.
                </p>
              </div>
            </div>
            <div className="space-y-2.5">
              {profileChecklist.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5"
                >
                  {item.completed ? (
                    <CheckCircle2 className="size-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="size-4 text-[var(--saptta-line)] flex-shrink-0" />
                  )}
                  <span
                    className={`text-xs ${
                      item.completed
                        ? "text-[var(--saptta-ink-2)] line-through"
                        : "text-[var(--saptta-ink)] font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <Button
              size="sm"
              className="w-full mt-4 rounded-[999px] bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90 h-9 text-sm"
            >
              <User className="size-3.5 mr-1.5" />
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* ──────────── 6. Job Recommendations ──────────── */}
      <motion.div variants={fadeUp}>
        <Card className="border-[var(--saptta-line)] rounded-[24px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">
                Recommended for You
              </CardTitle>
              <Badge
                variant="secondary"
                className="text-[9px] rounded-[999px] bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)]"
              >
                AI Powered
              </Badge>
            </div>
            <Button
              variant="ghost"
              className="text-xs text-[var(--saptta-mute)] hover:text-[var(--saptta-accent)] p-0 h-auto"
            >
              View All Recommendations
              <ChevronRight className="size-3.5 ml-0.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {jobRecommendations.map((job, i) => (
                <motion.div
                  key={job.id}
                  variants={fadeUp}
                  className="p-4 rounded-xl bg-[var(--saptta-bg-2)] hover:bg-white border border-transparent hover:border-[var(--saptta-line)] transition-all duration-300 group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="size-9 rounded-[12px] flex-shrink-0">
                      <AvatarFallback className="rounded-[12px] bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] text-[10px] font-bold">
                        {job.company
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--saptta-ink)] truncate">
                        {job.jobTitle}
                      </p>
                      <p className="text-xs text-[var(--saptta-mute)] mt-0.5">
                        {job.company}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3 text-[11px] text-[var(--saptta-mute)]">
                    <div className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {job.posted}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] text-[var(--saptta-mute)]">
                      Match
                    </span>
                    <div className="flex-1 h-1.5 bg-[var(--saptta-line)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${job.matchScore}%` }}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.1,
                          ease: [0.22, 0.8, 0.22, 1],
                        }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor:
                            job.matchScore >= 85
                              ? "#22c55e"
                              : job.matchScore >= 70
                                ? "#f59e0b"
                                : "var(--saptta-accent)",
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{
                        color:
                          job.matchScore >= 85
                            ? "#22c55e"
                            : job.matchScore >= 70
                              ? "#f59e0b"
                              : "var(--saptta-accent)",
                      }}
                    >
                      {job.matchScore}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-semibold text-[var(--saptta-ink)]">
                      {job.salary}
                    </span>
                    <Button
                      size="sm"
                      className="h-7 rounded-lg text-[11px] px-3 bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90"
                    >
                      Apply Now
                      <ArrowRight className="size-3 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ──────────── 7 & 8. AI Insights + Quick Actions ──────────── */}
      <motion.div variants={fadeUp}>
        <Card className="saptta-card-glow border-[var(--saptta-accent)]/20 rounded-[24px] bg-gradient-to-r from-[var(--saptta-accent)]/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-[20px] bg-[var(--saptta-accent)]/10 flex-shrink-0">
                <Sparkles className="size-6 text-[var(--saptta-accent)]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-[var(--saptta-ink)]">
                  AI Career Assistant
                </h3>
                <p className="text-sm text-[var(--saptta-mute)] mt-1">
                  Your interview for{" "}
                  <span className="font-medium text-[var(--saptta-ink)]">
                    React Developer at Acme Corp
                  </span>{" "}
                  is in 2 days. Want me to generate a preparation checklist and
                  mock questions?
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <Button
                    size="sm"
                    className="rounded-[999px] bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90 px-5 h-9 text-sm"
                  >
                    <Sparkles className="size-3.5 mr-1.5" />
                    Prepare with AI
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-[999px] border-[var(--saptta-line)] text-sm px-5 h-9"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
        <Button className="saptta-btn-fill rounded-[999px] bg-[var(--saptta-ink)] text-white hover:text-white px-6 py-2.5 text-sm font-semibold h-auto"
          onClick={() => setCurrentView("recruitment")}>
          <Briefcase className="size-4 mr-2" />Browse Jobs
        </Button>
        <Button className="saptta-btn-fill rounded-[999px] bg-[var(--saptta-ink)] text-white hover:text-white px-6 py-2.5 text-sm font-semibold h-auto"
          onClick={() => setCurrentView("recruitment")}>
          <FileText className="size-4 mr-2" />Update Resume
        </Button>
        <Button className="saptta-btn-fill rounded-[999px] bg-[var(--saptta-ink)] text-white hover:text-white px-6 py-2.5 text-sm font-semibold h-auto"
          onClick={() => setCurrentView("ai-assistant")}>
          <Video className="size-4 mr-2" />Prepare for Interview
        </Button>
        <Button className="rounded-[999px] bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90 px-6 py-2.5 text-sm font-semibold h-auto"
          onClick={() => setCurrentView("ai-assistant")}>
          <Sparkles className="size-4 mr-2" />Ask AI
        </Button>
      </motion.div>
    </motion.div>
  );
}