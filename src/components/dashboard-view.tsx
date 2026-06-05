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
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  UserPlus,
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

/* ──────────────── Chart Data ──────────────── */

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
  { name: "Engineering", value: 420, color: "#FF9900" },
  { name: "Sales", value: 210, color: "#0066CC" },
  { name: "Marketing", value: 135, color: "#4d94db" },
  { name: "HR", value: 82, color: "#003d7a" },
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
  { stage: "Applied", count: 1240, fill: "#FF9900" },
  { stage: "Screened", count: 680, fill: "#4d94db" },
  { stage: "Interviewed", count: 320, fill: "#0066CC" },
  { stage: "Offered", count: 85, fill: "#003d7a" },
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

const upcomingEvents = [
  { type: "birthday", title: "Riya Kapoor's Birthday", date: "Tomorrow", emoji: "🎂" },
  { type: "anniversary", title: "Amit Joshi — 5 Year Anniversary", date: "Jun 8", emoji: "🏆" },
  { type: "holiday", title: "Bakrid — Office Closed", date: "Jun 10", emoji: "🎉" },
  { type: "birthday", title: "Neha Gupta's Birthday", date: "Jun 12", emoji: "🎂" },
  { type: "anniversary", title: "Suresh Kumar — 3 Year Anniversary", date: "Jun 15", emoji: "🏆" },
];

const typeColors: Record<string, string> = {
  hire: "#0066CC",
  leave: "#FF9900",
  promotion: "#4d94db",
  notice: "#ef4444",
};

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
        stroke="#FF9900"
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

/* ──────────────── KPI Cards ──────────────── */

function KpiCard({
  icon: Icon,
  label,
  value,
  displayValue,
  trend,
  trendLabel,
  accentColor,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  displayValue: string;
  trend: "up" | "down";
  trendLabel: string;
  accentColor?: string;
}) {
  const count = useCountUp(value);

  return (
    <Card className="saptta-module-card border-[var(--saptta-line)] bg-white hover:shadow-lg transition-shadow duration-300 rounded-[20px]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div
            className="flex size-10 items-center justify-center rounded-[16px] module-icon"
            style={{ backgroundColor: `${accentColor || "#FF9900"}10`, color: accentColor || "#FF9900" }}
          >
            <Icon className="size-5" />
          </div>
          <Badge
            variant="secondary"
            className={`text-[10px] font-semibold rounded-full ${
              trend === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
            }`}
          >
            {trend === "up" ? <ArrowUpRight className="size-3 mr-0.5" /> : <ArrowDownRight className="size-3 mr-0.5" />}
            {trendLabel}
          </Badge>
        </div>
        <div className="mt-4">
          <span
            className="text-[40px] md:text-[48px] font-bold leading-none tracking-[-2px] text-[var(--saptta-ink)] module-text"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {label === "Monthly Payroll" ? displayValue : count.toLocaleString()}
          </span>
          <p className="text-xs text-[var(--saptta-mute)] italic mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ──────────────── Main Dashboard ──────────────── */

export function DashboardView() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Page Header */}
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--saptta-ink)] tracking-tight">
            Good morning, Priya 👋
          </h1>
          <p className="text-[var(--saptta-mute)] mt-1 text-sm">
            Here&apos;s what&apos;s happening across your organization today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl border-[var(--saptta-line)] text-xs">
            <Calendar className="size-3.5 mr-1.5" />
            Last 30 days
          </Button>
          <Button size="sm" className="rounded-xl bg-[var(--saptta-accent)] text-white text-xs hover:bg-[var(--saptta-accent)]/90">
            <Sparkles className="size-3.5 mr-1.5" />
            AI Summary
          </Button>
        </div>
      </motion.div>

      {/* KPI Tiles Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Users}
          label="Total Employees"
          value={1247}
          displayValue="1,247"
          trend="up"
          trendLabel="+12 this month"
          accentColor="#FF9900"
        />
        <KpiCard
          icon={Briefcase}
          label="Open Positions"
          value={34}
          displayValue="34"
          trend="up"
          trendLabel="8 urgent"
          accentColor="#0066CC"
        />
        {/* Attendance KPI with ring */}
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
                <span
                  className="text-[40px] md:text-[48px] font-bold leading-none tracking-[-2px] text-[var(--saptta-ink)] module-text"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
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
        <KpiCard
          icon={IndianRupee}
          label="Monthly Payroll"
          value={120}
          displayValue="₹1.2Cr"
          trend="up"
          trendLabel="+3.5% vs last"
          accentColor="#0066CC"
        />
      </motion.div>

      {/* Charts Section 2x2 */}
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
                <Line type="monotone" dataKey="count" name="Headcount" stroke="#FF9900" strokeWidth={3} dot={{ r: 4, fill: "#FF9900", strokeWidth: 0 }} activeDot={{ r: 6, fill: "#FF9900", stroke: "#fff", strokeWidth: 2 }} />
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
                    <stop offset="5%" stopColor="#FF9900" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF9900" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="rate" name="Attrition %" stroke="#FF9900" strokeWidth={2} fill="url(#attritionGrad)" />
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

      {/* Quick Actions Row */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
        <Button className="saptta-btn-fill rounded-[999px] bg-[var(--saptta-ink)] text-white hover:text-white px-6 py-2.5 text-sm font-semibold h-auto">
          <IndianRupee className="size-4 mr-2" />
          Run Payroll
        </Button>
        <Button className="saptta-btn-fill rounded-[999px] bg-[var(--saptta-ink)] text-white hover:text-white px-6 py-2.5 text-sm font-semibold h-auto">
          <Briefcase className="size-4 mr-2" />
          Create Job Requisition
        </Button>
        <Button className="saptta-btn-fill rounded-[999px] bg-[var(--saptta-ink)] text-white hover:text-white px-6 py-2.5 text-sm font-semibold h-auto">
          <FileText className="size-4 mr-2" />
          Generate Report
        </Button>
        <Button className="rounded-[999px] bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90 px-6 py-2.5 text-sm font-semibold h-auto">
          <Sparkles className="size-4 mr-2" />
          Ask AI
        </Button>
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
            {upcomingEvents.map((event, i) => (
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
