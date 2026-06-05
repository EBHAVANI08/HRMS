"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Users, DollarSign, Download, Filter,
  Clock, Award, GraduationCap, Activity, Sparkles,
  Search, FileText, Building2, CalendarDays, UserCheck, UserX,
  Briefcase, Target, ChevronRight, Layout, Share2, Plus,
  ArrowUpRight, ArrowDownRight, Brain, Layers, Settings,
  Eye, ClipboardList, BadgeDollarSign, ShieldCheck, UsersRound,
  Timer, CheckCircle2, Globe, BarChart2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 0.8, 0.22, 1] } },
};

// ─── OVERVIEW DATA ───
const kpiTiles = [
  { label: "Employee Growth", value: "+9.8%", description: "YoY headcount increase", trend: "up", icon: TrendingUp, color: "#22c55e" },
  { label: "Attrition Rate", value: "7.4%", description: "Down from 8.1% last quarter", trend: "down", icon: UserX, color: "#FF9900" },
  { label: "Time to Hire", value: "23 days", description: "Down from 28 days", trend: "down", icon: Clock, color: "#8b5cf6" },
  { label: "Offer Acceptance", value: "87%", description: "Improved by 4% this month", trend: "up", icon: UserCheck, color: "#3b82f6" },
  { label: "Revenue / Employee", value: "₹28.5L", description: "Annualized metric", trend: "up", icon: DollarSign, color: "#f59e0b" },
  { label: "Avg Tenure", value: "3.8 yrs", description: "Stable over last year", trend: "neutral", icon: CalendarDays, color: "#ec4899" },
  { label: "Diversity Ratio", value: "38:62", description: "Female:Male (target 40:60)", trend: "up", icon: Users, color: "#0066CC" },
  { label: "Training Hours", value: "24.5 hrs", description: "Per employee per quarter", trend: "up", icon: GraduationCap, color: "#06b6d4" },
];

const workforceTrendData = [
  { month: "Apr", headcount: 812, hires: 14, exits: 6 },
  { month: "May", headcount: 820, hires: 16, exits: 8 },
  { month: "Jun", headcount: 828, hires: 12, exits: 4 },
  { month: "Jul", headcount: 835, hires: 18, exits: 11 },
  { month: "Aug", headcount: 842, hires: 15, exits: 8 },
  { month: "Sep", headcount: 849, hires: 13, exits: 6 },
  { month: "Oct", headcount: 858, hires: 12, exits: 4 },
  { month: "Nov", headcount: 870, hires: 18, exits: 6 },
  { month: "Dec", headcount: 875, hires: 8, exits: 3 },
  { month: "Jan", headcount: 892, hires: 22, exits: 5 },
  { month: "Feb", headcount: 903, hires: 15, exits: 4 },
  { month: "Mar", headcount: 915, hires: 19, exits: 7 },
];

const deptHeadcountData = [
  { department: "Engineering", count: 248, color: "#FF9900" },
  { department: "Sales", count: 156, color: "#0066CC" },
  { department: "Marketing", count: 89, color: "#8b5cf6" },
  { department: "Analytics", count: 112, color: "#3b82f6" },
  { department: "Operations", count: 134, color: "#f59e0b" },
  { department: "HR", count: 52, color: "#ec4899" },
  { department: "Finance", count: 67, color: "#06b6d4" },
  { department: "Design", count: 57, color: "#22c55e" },
];

const ageDistributionData = [
  { range: "18-25", count: 142, percentage: 15.5 },
  { range: "26-30", count: 289, percentage: 31.6 },
  { range: "31-35", count: 234, percentage: 25.6 },
  { range: "36-40", count: 138, percentage: 15.1 },
  { range: "41-45", count: 72, percentage: 7.9 },
  { range: "46+", count: 40, percentage: 4.4 },
];

const tenureDistributionData = [
  { range: "< 1 yr", count: 156, percentage: 17.0 },
  { range: "1-2 yrs", count: 213, percentage: 23.3 },
  { range: "2-3 yrs", count: 189, percentage: 20.7 },
  { range: "3-5 yrs", count: 178, percentage: 19.5 },
  { range: "5-7 yrs", count: 112, percentage: 12.2 },
  { range: "7+ yrs", count: 67, percentage: 7.3 },
];

const aiInsights = [
  "Employee growth has accelerated in Q1 2026 with a net addition of 23 employees, the highest quarterly gain in 2 years.",
  "The Engineering department (27.1% of workforce) continues to be the largest, but Sales saw the highest proportional growth at 8.3%.",
  "Attrition in the 26-30 age group is 2x the company average — consider targeted retention programs.",
  "Revenue per employee increased 6.2% YoY, indicating improving productivity metrics.",
  "Diversity ratio is approaching the 40:60 target — current female representation at 38% is up from 34% last year.",
];

// ─── REPORTS DATA ───
interface Report {
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  frequency?: string;
}

const reportCategories = [
  {
    name: "HR Reports",
    color: "#FF9900",
    reports: [
      { name: "Employee Master", description: "Complete employee database with all personal and professional details", icon: Users, frequency: "On-demand" },
      { name: "New Joiners Report", description: "List of employees who joined in a selected period with onboarding status", icon: UserCheck, frequency: "Monthly" },
      { name: "Exits Report", description: "Employee exits with reason, notice period, and exit interview summary", icon: UserX, frequency: "Monthly" },
      { name: "Headcount Summary", description: "Department-wise headcount with trends and comparisons", icon: Building2, frequency: "Weekly" },
      { name: "Employee Directory", description: "Contact information and organizational mapping", icon: ClipboardList, frequency: "On-demand" },
    ] as Report[],
  },
  {
    name: "Attendance Reports",
    color: "#8b5cf6",
    reports: [
      { name: "Daily Attendance", description: "Day-wise attendance with check-in/out times and status", icon: CalendarDays, frequency: "Daily" },
      { name: "Monthly Attendance Summary", description: "Aggregated monthly attendance by department and employee", icon: BarChart2, frequency: "Monthly" },
      { name: "Late Comers Report", description: "Employees arriving late with frequency and patterns", icon: Clock, frequency: "Weekly" },
      { name: "Overtime Report", description: "OT hours by employee and department with cost implications", icon: Timer, frequency: "Monthly" },
      { name: "Work from Home Report", description: "WFH utilization and compliance tracking", icon: Globe, frequency: "Weekly" },
    ] as Report[],
  },
  {
    name: "Leave Reports",
    color: "#22c55e",
    reports: [
      { name: "Leave Register", description: "Complete leave records with type, duration, and approval status", icon: ClipboardList, frequency: "On-demand" },
      { name: "Leave Balance Report", description: "Employee-wise leave balance across all leave types", icon: BarChart3, frequency: "Monthly" },
      { name: "Leave Trend Analysis", description: "Leave utilization patterns and seasonal trends", icon: TrendingUp, frequency: "Quarterly" },
      { name: "Comp-off Report", description: "Compensatory off earned, utilized, and expired", icon: CheckCircle2, frequency: "Monthly" },
    ] as Report[],
  },
  {
    name: "Payroll Reports",
    color: "#f59e0b",
    reports: [
      { name: "Payroll Register", description: "Complete payroll breakdown — earnings, deductions, net pay", icon: BadgeDollarSign, frequency: "Monthly" },
      { name: "PF Statement", description: "Provident Fund contributions by employee with employer share", icon: ShieldCheck, frequency: "Monthly" },
      { name: "ESI Statement", description: "Employee State Insurance contributions and deductions", icon: Activity, frequency: "Monthly" },
      { name: "PT Statement", description: "Professional Tax deductions by state and slab", icon: FileText, frequency: "Monthly" },
      { name: "TDS Report", description: "Tax Deducted at Source summary with section-wise break-up", icon: FileText, frequency: "Monthly" },
      { name: "Form 16", description: "Annual TDS certificate generation for all employees", icon: FileText, frequency: "Annual" },
      { name: "Salary Reconciliation", description: "Month-over-month payroll variance analysis", icon: BarChart2, frequency: "Monthly" },
    ] as Report[],
  },
  {
    name: "Recruitment Reports",
    color: "#3b82f6",
    reports: [
      { name: "Hiring Funnel", description: "Candidate pipeline from application to offer with conversion rates", icon: Target, frequency: "Weekly" },
      { name: "Source Analysis", description: "Recruitment channel effectiveness and cost comparison", icon: Search, frequency: "Monthly" },
      { name: "Time to Fill", description: "Average days to fill positions by department and role level", icon: Clock, frequency: "Monthly" },
      { name: "Cost per Hire", description: "Recruitment cost breakdown by source and department", icon: DollarSign, frequency: "Quarterly" },
      { name: "Offer Drop Rate", description: "Candidates who declined offers with reasons and trends", icon: UserX, frequency: "Monthly" },
    ] as Report[],
  },
  {
    name: "Performance Reports",
    color: "#ec4899",
    reports: [
      { name: "Rating Distribution", description: "Performance rating bell curve across departments and levels", icon: BarChart2, frequency: "Quarterly" },
      { name: "Goal Completion", description: "OKR and goal achievement rates by team and individual", icon: Target, frequency: "Monthly" },
      { name: "9-Box Summary", description: "Performance vs potential matrix for talent classification", icon: Layers, frequency: "Quarterly" },
      { name: "Promotion Readiness", description: "Employees meeting promotion criteria and timeline", icon: Award, frequency: "Quarterly" },
    ] as Report[],
  },
  {
    name: "Compliance Reports",
    color: "#06b6d4",
    reports: [
      { name: "PF ECR Filing", description: "Electronic Challan cum Return for PF submission", icon: ShieldCheck, frequency: "Monthly" },
      { name: "ESI Return", description: "ESI half-yearly return with contribution details", icon: FileText, frequency: "Half-yearly" },
      { name: "Statutory Compliance Dashboard", description: "Comprehensive compliance status across all statutory requirements", icon: ShieldCheck, frequency: "Monthly" },
      { name: "Labour Law Compliance", description: "Compliance checklist against applicable labour laws", icon: Building2, frequency: "Quarterly" },
    ] as Report[],
  },
];

// ─── CUSTOM DASHBOARDS DATA ───
const dashboardTemplates = [
  { name: "CEO Dashboard", description: "High-level KPIs, workforce metrics, and financial indicators", icon: Briefcase, widgets: 8, color: "#FF9900" },
  { name: "HR Operations", description: "Attendance, leave, hiring, and onboarding metrics", icon: Users, widgets: 6, color: "#8b5cf6" },
  { name: "Recruitment Hub", description: "Pipeline, source analytics, and hiring funnel", icon: Target, widgets: 5, color: "#3b82f6" },
  { name: "Finance Overview", description: "Payroll, cost analysis, and budget tracking", icon: DollarSign, widgets: 7, color: "#22c55e" },
  { name: "People Analytics", description: "Diversity, engagement, and retention deep dive", icon: Brain, widgets: 6, color: "#f59e0b" },
  { name: "Compliance Tracker", description: "Statutory filing status and deadline monitoring", icon: ShieldCheck, widgets: 4, color: "#06b6d4" },
];

const customDashboardWidgets = [
  { id: "w1", title: "Headcount Trend", type: "line", span: "col-span-2" },
  { id: "w2", title: "Department Split", type: "pie", span: "col-span-1" },
  { id: "w3", title: "Monthly Hires vs Exits", type: "bar", span: "col-span-2" },
  { id: "w4", title: "Attrition Rate", type: "kpi", span: "col-span-1" },
  { id: "w5", title: "Leave Utilization", type: "bar", span: "col-span-1" },
  { id: "w6", title: "Engagement Score", type: "kpi", span: "col-span-1" },
];

const pieColors = ["#FF9900", "#0066CC", "#8b5cf6", "#3b82f6", "#f59e0b", "#ec4899", "#06b6d4", "#22c55e"];

export function AnalyticsView() {
  const [reportSearch, setReportSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dashboardSearch, setDashboardSearch] = useState("");

  // Flatten all reports for search
  const allReports = reportCategories.flatMap(cat =>
    cat.reports.map(r => ({ ...r, category: cat.name, color: cat.color }))
  );

  const filteredReports = allReports.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(reportSearch.toLowerCase()) ||
                        r.description.toLowerCase().includes(reportSearch.toLowerCase());
    const matchCategory = selectedCategory === "All" || r.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--saptta-ink)] tracking-tight">Analytics</h1>
          <p className="text-[var(--saptta-mute)] mt-1 text-sm">Deep-dive into workforce data, trends, and predictive insights.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl border-[var(--saptta-line)] text-xs">
            <Filter className="size-3.5 mr-1.5" />Filter
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl border-[var(--saptta-line)] text-xs">
            <Download className="size-3.5 mr-1.5" />Export
          </Button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-[var(--saptta-bg-2)] rounded-[999px] p-1 h-auto">
            <TabsTrigger value="overview" className="rounded-[999px] px-5 py-2 text-xs data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white data-[state=active]:shadow-sm">
              <Activity className="size-3.5 mr-1.5" />Overview
            </TabsTrigger>
            <TabsTrigger value="reports" className="rounded-[999px] px-5 py-2 text-xs data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white data-[state=active]:shadow-sm">
              <FileText className="size-3.5 mr-1.5" />Reports
            </TabsTrigger>
            <TabsTrigger value="dashboards" className="rounded-[999px] px-5 py-2 text-xs data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white data-[state=active]:shadow-sm">
              <Layout className="size-3.5 mr-1.5" />Dashboards
            </TabsTrigger>
          </TabsList>

          {/* ═══════════ OVERVIEW TAB ═══════════ */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {kpiTiles.map((kpi) => (
                <motion.div key={kpi.label} variants={fadeUp}>
                  <Card className="border-[var(--saptta-line)] rounded-[20px] h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex size-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${kpi.color}15` }}>
                          <kpi.icon className="size-4" style={{ color: kpi.color }} />
                        </div>
                        {kpi.trend === "up" && (
                          <div className="flex items-center gap-0.5 text-green-500">
                            <ArrowUpRight className="size-3" />
                          </div>
                        )}
                        {kpi.trend === "down" && (
                          <div className="flex items-center gap-0.5 text-red-500">
                            <ArrowDownRight className="size-3" />
                          </div>
                        )}
                      </div>
                      <p className="text-xl font-bold text-[var(--saptta-ink)]">{kpi.value}</p>
                      <p className="text-[10px] font-medium text-[var(--saptta-ink-2)] mt-0.5">{kpi.label}</p>
                      <p className="text-[9px] text-[var(--saptta-mute)] mt-0.5">{kpi.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Charts 2x2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Workforce Trend */}
              <Card className="border-[var(--saptta-line)] rounded-[24px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)]">Workforce Trend (12 months)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={workforceTrendData}>
                        <defs>
                          <linearGradient id="colorHeadcount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF9900" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#FF9900" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--saptta-line)" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--saptta-mute)" }} axisLine={false} tickLine={false} />
                        <YAxis domain={[780, 930]} tick={{ fontSize: 10, fill: "var(--saptta-mute)" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--saptta-line)", fontSize: 12 }} />
                        <Area type="monotone" dataKey="headcount" stroke="#FF9900" strokeWidth={2} fill="url(#colorHeadcount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Department Headcount */}
              <Card className="border-[var(--saptta-line)] rounded-[24px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)]">Department Headcount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deptHeadcountData}
                          dataKey="count"
                          nameKey="department"
                          cx="50%"
                          cy="50%"
                          outerRadius={85}
                          innerRadius={50}
                          strokeWidth={2}
                          stroke="white"
                        >
                          {deptHeadcountData.map((_, index) => (
                            <Cell key={index} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--saptta-line)", fontSize: 12 }} formatter={(value: number, name: string) => [`${value} employees`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                    {deptHeadcountData.map((dept, i) => (
                      <div key={dept.department} className="flex items-center gap-1.5">
                        <div className="size-2.5 rounded-sm shrink-0" style={{ backgroundColor: pieColors[i] }} />
                        <span className="text-[9px] text-[var(--saptta-mute)] truncate">{dept.department}</span>
                        <span className="text-[9px] font-medium text-[var(--saptta-ink)] ml-auto">{dept.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Age Distribution */}
              <Card className="border-[var(--saptta-line)] rounded-[24px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)]">Age Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageDistributionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--saptta-line)" vertical={false} />
                        <XAxis dataKey="range" tick={{ fontSize: 10, fill: "var(--saptta-mute)" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "var(--saptta-mute)" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--saptta-line)", fontSize: 12 }} formatter={(value: number) => [`${value} employees`]} />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Tenure Distribution */}
              <Card className="border-[var(--saptta-line)] rounded-[24px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)]">Tenure Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={tenureDistributionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--saptta-line)" vertical={false} />
                        <XAxis dataKey="range" tick={{ fontSize: 10, fill: "var(--saptta-mute)" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "var(--saptta-mute)" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--saptta-line)", fontSize: 12 }} formatter={(value: number) => [`${value} employees`]} />
                        <Bar dataKey="count" fill="#0066CC" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <Card className="border-[var(--saptta-accent)]/20 bg-gradient-to-r from-[var(--saptta-accent)]/5 to-transparent rounded-[24px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-[var(--saptta-ink)] flex items-center gap-2">
                  <Sparkles className="size-5 text-[var(--saptta-accent)]" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {aiInsights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-white/60 px-4 py-3">
                      <div className="flex size-6 items-center justify-center rounded-full bg-[var(--saptta-accent)]/10 shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-[var(--saptta-accent)]">{i + 1}</span>
                      </div>
                      <p className="text-xs text-[var(--saptta-ink-2)] leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════ REPORTS TAB ═══════════ */}
          <TabsContent value="reports" className="space-y-6">
            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--saptta-mute)]" />
                <Input
                  placeholder="Search reports by name or description..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  className="pl-9 h-10 rounded-xl border-[var(--saptta-line)] bg-[var(--saptta-bg-2)] text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedCategory("All")}
                  className={`px-3 py-1.5 rounded-[999px] text-[10px] font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === "All" ? "bg-[var(--saptta-accent)] text-white" : "bg-[var(--saptta-bg-2)] text-[var(--saptta-mute)] hover:bg-[var(--saptta-accent)]/10"
                  }`}
                >All ({allReports.length})</button>
                {reportCategories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-3 py-1.5 rounded-[999px] text-[10px] font-medium transition-colors whitespace-nowrap ${
                      selectedCategory === cat.name ? "bg-[var(--saptta-accent)] text-white" : "bg-[var(--saptta-bg-2)] text-[var(--saptta-mute)] hover:bg-[var(--saptta-accent)]/10"
                    }`}
                  >{cat.name} ({cat.reports.length})</button>
                ))}
              </div>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredReports.map((report) => (
                <motion.div key={`${report.category}-${report.name}`} variants={fadeUp}>
                  <Card className="border-[var(--saptta-line)] rounded-[20px] h-full hover:border-[var(--saptta-accent)]/20 transition-all group">
                    <CardContent className="p-4 flex flex-col h-full">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex size-9 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: `${report.color}15` }}>
                          <report.icon className="size-4" style={{ color: report.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[var(--saptta-ink)]">{report.name}</p>
                          <Badge variant="outline" className="text-[8px] rounded-[999px] mt-1">{report.category}</Badge>
                        </div>
                      </div>
                      <p className="text-[10px] text-[var(--saptta-mute)] leading-relaxed flex-1">{report.description}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--saptta-line)]">
                        <span className="text-[9px] text-[var(--saptta-mute)]">{report.frequency}</span>
                        <Button size="sm" className="rounded-lg bg-[var(--saptta-accent)] text-white text-[10px] h-7 hover:bg-[var(--saptta-accent)]/90 opacity-0 group-hover:opacity-100 transition-opacity">
                          Generate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <Search className="size-8 text-[var(--saptta-mute)] mx-auto mb-3" />
                <p className="text-sm text-[var(--saptta-mute)]">No reports found matching your search.</p>
              </div>
            )}
          </TabsContent>

          {/* ═══════════ CUSTOM DASHBOARDS TAB ═══════════ */}
          <TabsContent value="dashboards" className="space-y-6">
            {/* Dashboard Templates */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-3">Dashboard Templates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {dashboardTemplates.map((template) => (
                  <motion.div key={template.name} whileHover={{ scale: 1.01 }}>
                    <Card className="border-[var(--saptta-line)] rounded-[20px] hover:border-[var(--saptta-accent)]/20 transition-all cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex size-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${template.color}15` }}>
                            <template.icon className="size-5" style={{ color: template.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[var(--saptta-ink)]">{template.name}</p>
                            <p className="text-[10px] text-[var(--saptta-mute)]">{template.widgets} widgets</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-[var(--saptta-mute)] leading-relaxed">{template.description}</p>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="flex-1 rounded-lg bg-[var(--saptta-accent)] text-white text-[10px] h-7 hover:bg-[var(--saptta-accent)]/90">
                            Use Template
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-7">
                            <Eye className="size-3 mr-1" />Preview
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Custom Dashboard Preview */}
            <Card className="border-[var(--saptta-line)] rounded-[24px]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">My Dashboard — HR Operations</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-7">
                      <Share2 className="size-3 mr-1" />Share
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-7">
                      <Download className="size-3 mr-1" />Export PDF
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-7">
                      <Settings className="size-3 mr-1" />Configure
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Widget: Headcount Trend */}
                  <Card className="md:col-span-2 border-[var(--saptta-line)] rounded-[20px]">
                    <CardHeader className="pb-1 pt-3 px-4">
                      <CardTitle className="text-xs font-semibold text-[var(--saptta-ink)]">Headcount Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={workforceTrendData.slice(-6)}>
                            <defs>
                              <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FF9900" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#FF9900" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--saptta-line)" />
                            <XAxis dataKey="month" tick={{ fontSize: 9, fill: "var(--saptta-mute)" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 9, fill: "var(--saptta-mute)" }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--saptta-line)", fontSize: 11 }} />
                            <Area type="monotone" dataKey="headcount" stroke="#FF9900" strokeWidth={2} fill="url(#dashGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Widget: Department Split */}
                  <Card className="border-[var(--saptta-line)] rounded-[20px]">
                    <CardHeader className="pb-1 pt-3 px-4">
                      <CardTitle className="text-xs font-semibold text-[var(--saptta-ink)]">Department Split</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={deptHeadcountData.slice(0, 5)} dataKey="count" nameKey="department" cx="50%" cy="50%" outerRadius={55} innerRadius={30} strokeWidth={2} stroke="white">
                              {deptHeadcountData.slice(0, 5).map((_, index) => (
                                <Cell key={index} fill={pieColors[index]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--saptta-line)", fontSize: 11 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Widget: Monthly Hires vs Exits */}
                  <Card className="md:col-span-2 border-[var(--saptta-line)] rounded-[20px]">
                    <CardHeader className="pb-1 pt-3 px-4">
                      <CardTitle className="text-xs font-semibold text-[var(--saptta-ink)]">Monthly Hires vs Exits</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={workforceTrendData.slice(-6)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--saptta-line)" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 9, fill: "var(--saptta-mute)" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 9, fill: "var(--saptta-mute)" }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--saptta-line)", fontSize: 11 }} />
                            <Bar dataKey="hires" fill="#FF9900" radius={[4, 4, 0, 0]} name="Hires" />
                            <Bar dataKey="exits" fill="#0066CC" radius={[4, 4, 0, 0]} name="Exits" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* KPI Widgets */}
                  <div className="space-y-3">
                    <Card className="border-[var(--saptta-line)] rounded-[20px]">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--saptta-accent)]/10 shrink-0">
                          <UserX className="size-4 text-[var(--saptta-accent)]" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-[var(--saptta-ink)]">7.4%</p>
                          <p className="text-[9px] text-[var(--saptta-mute)]">Attrition Rate</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-[var(--saptta-line)] rounded-[20px]">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--saptta-accent-2)]/20 shrink-0">
                          <Activity className="size-4 text-[#6b7a2e]" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-[var(--saptta-ink)]">8.4</p>
                          <p className="text-[9px] text-[var(--saptta-mute)]">Engagement Score</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Drag & Drop Placeholder */}
                <div className="mt-4 pt-4 border-t border-dashed border-[var(--saptta-line)]">
                  <button className="w-full rounded-xl border-2 border-dashed border-[var(--saptta-line)] py-6 text-center hover:border-[var(--saptta-accent)]/30 hover:bg-[var(--saptta-accent)]/5 transition-all group">
                    <Plus className="size-5 text-[var(--saptta-mute)] group-hover:text-[var(--saptta-accent)] mx-auto mb-1 transition-colors" />
                    <p className="text-xs text-[var(--saptta-mute)] group-hover:text-[var(--saptta-accent)] transition-colors">Drag & drop widgets or click to add</p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
