"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, UserMinus, ClipboardCheck, CheckCircle2, Clock, FileText,
  Mail, Laptop, Users, ArrowRight, Upload, Shield, BookOpen,
  CalendarDays, AlertCircle, ChevronRight, Timer, HandshakeIcon,
  MessageSquare, DollarSign, FileBadge, X, Search, Filter,
  Package, Key, CreditCard, Library, Building2, UserCheck,
  FileDown, Eye, Play, Pause
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 0.8, 0.22, 1] } },
};

// ─── ONBOARDING DATA ───
const pipelineStages = ["Pre-boarding", "Day 1", "Week 1", "Month 1", "Completed"];

const newHires = [
  {
    id: "1", name: "Meera Joshi", role: "Frontend Developer", dept: "Engineering",
    startDate: "Mar 18, 2026", progress: 75, stage: 3, initials: "MJ",
    buddy: "Arjun M.", mentor: "Sanjay K.",
    tasks: [
      { label: "Complete employee profile", done: true },
      { label: "Submit ID documents", done: true },
      { label: "IT equipment setup", done: true },
      { label: "Manager introduction", done: false },
      { label: "Policy acknowledgment", done: false },
    ],
    documents: [
      { name: "Offer Letter", status: "verified" },
      { name: "ID Proof (Aadhaar)", status: "verified" },
      { name: "PAN Card", status: "verified" },
      { name: "Bank Details", status: "pending" },
      { name: "Education Certificates", status: "pending" },
    ],
    itSetup: [
      { item: "Laptop (MacBook Pro)", status: "delivered" },
      { item: "Email account", status: "active" },
      { item: "Slack access", status: "active" },
      { item: "GitHub access", status: "pending" },
      { item: "VPN credentials", status: "pending" },
    ],
  },
  {
    id: "2", name: "Arjun Reddy", role: "Data Scientist", dept: "Analytics",
    startDate: "Mar 18, 2026", progress: 50, stage: 2, initials: "AR",
    buddy: "Priya V.", mentor: "Ramesh T.",
    tasks: [
      { label: "Complete employee profile", done: true },
      { label: "Submit ID documents", done: true },
      { label: "IT equipment setup", done: false },
      { label: "Manager introduction", done: false },
      { label: "Policy acknowledgment", done: false },
    ],
    documents: [
      { name: "Offer Letter", status: "verified" },
      { name: "ID Proof (Aadhaar)", status: "verified" },
      { name: "PAN Card", status: "pending" },
      { name: "Bank Details", status: "pending" },
      { name: "Education Certificates", status: "pending" },
    ],
    itSetup: [
      { item: "Laptop (ThinkPad)", status: "ordered" },
      { item: "Email account", status: "active" },
      { item: "Slack access", status: "active" },
      { item: "Jupyter Hub access", status: "pending" },
      { item: "VPN credentials", status: "pending" },
    ],
  },
  {
    id: "3", name: "Nisha Patel", role: "Marketing Manager", dept: "Marketing",
    startDate: "Mar 25, 2026", progress: 25, stage: 1, initials: "NP",
    buddy: "Kavya N.", mentor: "Divya S.",
    tasks: [
      { label: "Complete employee profile", done: true },
      { label: "Submit ID documents", done: false },
      { label: "IT equipment setup", done: false },
      { label: "Manager introduction", done: false },
      { label: "Policy acknowledgment", done: false },
    ],
    documents: [
      { name: "Offer Letter", status: "verified" },
      { name: "ID Proof (Aadhaar)", status: "pending" },
      { name: "PAN Card", status: "pending" },
      { name: "Bank Details", status: "pending" },
      { name: "Education Certificates", status: "pending" },
    ],
    itSetup: [
      { item: "Laptop (MacBook Air)", status: "ordered" },
      { item: "Email account", status: "pending" },
      { item: "Slack access", status: "pending" },
      { item: "HubSpot access", status: "pending" },
      { item: "VPN credentials", status: "pending" },
    ],
  },
  {
    id: "4", name: "Rohan Das", role: "DevOps Engineer", dept: "Engineering",
    startDate: "Apr 01, 2026", progress: 0, stage: 0, initials: "RD",
    buddy: "Unassigned", mentor: "Unassigned",
    tasks: [
      { label: "Complete employee profile", done: false },
      { label: "Submit ID documents", done: false },
      { label: "IT equipment setup", done: false },
      { label: "Manager introduction", done: false },
      { label: "Policy acknowledgment", done: false },
    ],
    documents: [
      { name: "Offer Letter", status: "pending" },
      { name: "ID Proof (Aadhaar)", status: "pending" },
      { name: "PAN Card", status: "pending" },
      { name: "Bank Details", status: "pending" },
      { name: "Education Certificates", status: "pending" },
    ],
    itSetup: [
      { item: "Laptop (Dell XPS)", status: "ordered" },
      { item: "Email account", status: "pending" },
      { item: "Slack access", status: "pending" },
      { item: "AWS Console access", status: "pending" },
      { item: "VPN credentials", status: "pending" },
    ],
  },
];

const welcomeEmail = {
  to: "meera.joshi@saptta.io",
  subject: "Welcome to saptta! 🎉 Your Onboarding Journey Begins",
  body: `Hi Meera,

We're thrilled to have you join saptta as a Frontend Developer!

Your first day is March 18, 2026. Here's what to expect:

📋 Pre-boarding Checklist:
• Complete your employee profile in the HR portal
• Upload required documents (ID proof, PAN, bank details)
• Review the employee handbook

💻 IT Setup:
• Your MacBook Pro will be ready at your desk
• Email and Slack credentials will be shared on Day 1
• GitHub access will be provisioned by your manager

👤 Your Buddy: Arjun M. (arjun.m@saptta.io)
🧑‍🏫 Your Mentor: Sanjay K. (sanjay.k@saptta.io)

We can't wait to see you shine!

Best regards,
The saptta HR Team`,
};

// ─── OFFBOARDING DATA ───
const resignationRequests = [
  {
    id: "r1", name: "Vikram Singh", role: "Senior Developer", dept: "Engineering",
    submittedDate: "Feb 28, 2026", lastWorkingDay: "Apr 28, 2026",
    status: "approved", noticeDays: 60, daysRemaining: 54, initials: "VS",
    reason: "Career growth opportunity",
  },
  {
    id: "r2", name: "Anita Sharma", role: "QA Lead", dept: "Quality",
    submittedDate: "Mar 05, 2026", lastWorkingDay: "May 04, 2026",
    status: "pending", noticeDays: 60, daysRemaining: 60, initials: "AS",
    reason: "Relocation to another city",
  },
  {
    id: "r3", name: "Deepak Kumar", role: "Sales Executive", dept: "Sales",
    submittedDate: "Mar 10, 2026", lastWorkingDay: "Apr 10, 2026",
    status: "pending", noticeDays: 30, daysRemaining: 36, initials: "DK",
    reason: "Better compensation elsewhere",
  },
  {
    id: "r4", name: "Sneha Reddy", role: "UX Designer", dept: "Design",
    submittedDate: "Mar 12, 2026", lastWorkingDay: "May 11, 2026",
    status: "under_review", noticeDays: 60, daysRemaining: 61, initials: "SR",
    reason: "Personal reasons",
  },
];

const ktPlans = [
  { name: "Vikram Singh", transferTo: "Arjun M.", progress: 45, items: 8, completed: 3, status: "in_progress" },
  { name: "Anita Sharma", transferTo: "Rohit P.", progress: 0, items: 6, completed: 0, status: "not_started" },
  { name: "Deepak Kumar", transferTo: "Meera J.", progress: 20, items: 5, completed: 1, status: "in_progress" },
  { name: "Sneha Reddy", transferTo: "TBD", progress: 0, items: 7, completed: 0, status: "not_started" },
];

const exitInterviews = [
  { name: "Vikram Singh", scheduledDate: "Apr 20, 2026", interviewer: "Priya Sharma", status: "scheduled" },
  { name: "Anita Sharma", scheduledDate: "TBD", interviewer: "TBD", status: "pending" },
  { name: "Deepak Kumar", scheduledDate: "Apr 05, 2026", interviewer: "Rahul Mehta", status: "scheduled" },
  { name: "Sneha Reddy", scheduledDate: "TBD", interviewer: "TBD", status: "pending" },
];

const fnfChecklist = [
  { item: "Final salary computation", status: "completed" },
  { item: "Leave encashment calculation", status: "completed" },
  { item: "Bonus / incentive settlement", status: "pending" },
  { item: "Provident Fund settlement", status: "pending" },
  { item: "Gratuity computation", status: "pending" },
  { item: "Tax deduction calculation", status: "pending" },
  { item: "Dues recovery check", status: "completed" },
  { item: "Bank details verification", status: "completed" },
];

// ─── EXIT CLEARANCE DATA ───
const clearanceDepartments = [
  {
    dept: "IT Department", icon: Laptop, items: [
      { item: "Laptop return", status: "pending" },
      { item: "Mobile device return", status: "pending" },
      { item: "Email account deactivation", status: "pending" },
      { item: "VPN access revocation", status: "pending" },
      { item: "Software licenses recovery", status: "pending" },
    ],
  },
  {
    dept: "Finance", icon: DollarSign, items: [
      { item: "Advance settlement", status: "completed" },
      { item: "Credit card return", status: "pending" },
      { item: "Expense reimbursement", status: "completed" },
      { item: "Petty cash settlement", status: "waived" },
    ],
  },
  {
    dept: "HR Department", icon: Building2, items: [
      { item: "Exit interview completed", status: "pending" },
      { item: "Policy acknowledgment return", status: "pending" },
      { item: "ID card return", status: "pending" },
      { item: "Confidentiality agreement", status: "pending" },
    ],
  },
  {
    dept: "Library / Resources", icon: Library, items: [
      { item: "Book returns", status: "completed" },
      { item: "Training material return", status: "waived" },
      { item: "Access card return", status: "pending" },
    ],
  },
  {
    dept: "Admin / Facilities", icon: Key, items: [
      { item: "Cubicle/desk clearance", status: "pending" },
      { item: "Parking pass return", status: "pending" },
      { item: "Cabinet key return", status: "completed" },
    ],
  },
];

const settlementPreview = {
  employee: "Vikram Singh",
  basicSalary: 120000,
  da: 24000,
  leaveEncashment: 36000,
  bonus: 18000,
  gratuity: 82000,
  totalEarnings: 280000,
  pfDeduction: 14400,
  taxDeduction: 42000,
  noticeRecovery: 0,
  otherDeductions: 2500,
  totalDeductions: 58900,
  netSettlement: 221100,
};

// ─── STATUS HELPERS ───
function statusColor(status: string) {
  switch (status) {
    case "verified": case "completed": case "delivered": case "active": case "approved": return "bg-green-50 text-green-600 border-green-200";
    case "pending": case "not_started": case "under_review": case "ordered": return "bg-amber-50 text-amber-600 border-amber-200";
    case "waived": return "bg-gray-50 text-gray-500 border-gray-200";
    default: return "bg-[var(--saptta-bg-2)] text-[var(--saptta-mute)] border-[var(--saptta-line)]";
  }
}

function statusIcon(status: string) {
  switch (status) {
    case "verified": case "completed": case "delivered": case "active": case "approved": return <CheckCircle2 className="size-3.5 text-green-500" />;
    case "pending": case "not_started": case "under_review": case "ordered": return <Clock className="size-3.5 text-amber-500" />;
    case "waived": return <AlertCircle className="size-3.5 text-gray-400" />;
    default: return null;
  }
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    verified: "Verified", completed: "Completed", delivered: "Delivered", active: "Active", approved: "Approved",
    pending: "Pending", not_started: "Not Started", under_review: "Under Review", ordered: "Ordered", waived: "Waived", in_progress: "In Progress",
  };
  return map[status] || status;
}

export function OnboardingView() {
  const [selectedHire, setSelectedHire] = useState(newHires[0]);
  const [showWelcomeEmail, setShowWelcomeEmail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--saptta-ink)] tracking-tight">Onboarding & Offboarding</h1>
          <p className="text-[var(--saptta-mute)] mt-1 text-sm">Manage new hire journeys, offboarding processes, and exit clearances.</p>
        </div>
        <Button size="sm" className="rounded-xl bg-[var(--saptta-accent)] text-white text-xs hover:bg-[var(--saptta-accent)]/90">
          <UserPlus className="size-3.5 mr-1.5" />
          Add New Hire
        </Button>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs defaultValue="onboarding" className="space-y-6">
          <TabsList className="bg-[var(--saptta-bg-2)] rounded-[999px] p-1 h-auto">
            <TabsTrigger value="onboarding" className="rounded-[999px] px-5 py-2 text-xs data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white data-[state=active]:shadow-sm">
              <UserPlus className="size-3.5 mr-1.5" />Onboarding
            </TabsTrigger>
            <TabsTrigger value="offboarding" className="rounded-[999px] px-5 py-2 text-xs data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white data-[state=active]:shadow-sm">
              <UserMinus className="size-3.5 mr-1.5" />Offboarding
            </TabsTrigger>
            <TabsTrigger value="clearance" className="rounded-[999px] px-5 py-2 text-xs data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white data-[state=active]:shadow-sm">
              <ClipboardCheck className="size-3.5 mr-1.5" />Exit Clearance
            </TabsTrigger>
          </TabsList>

          {/* ═══════════ ONBOARDING TAB ═══════════ */}
          <TabsContent value="onboarding" className="space-y-6">
            {/* Pipeline */}
            <Card className="border-[var(--saptta-line)] rounded-[24px]">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-4">New Hire Pipeline</h3>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {pipelineStages.map((stage, i) => (
                    <div key={stage} className="flex items-center gap-2 shrink-0">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-[999px] text-xs font-medium transition-colors ${
                        i <= 2
                          ? "bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] border border-[var(--saptta-accent)]/20"
                          : "bg-[var(--saptta-bg-2)] text-[var(--saptta-mute)] border border-[var(--saptta-line)]"
                      }`}>
                        <span className="flex size-5 items-center justify-center rounded-full text-[10px] font-bold" style={{
                          backgroundColor: i <= 2 ? "var(--saptta-accent)" : "var(--saptta-line)",
                          color: i <= 2 ? "white" : "var(--saptta-mute)",
                        }}>{i + 1}</span>
                        {stage}
                      </div>
                      {i < pipelineStages.length - 1 && <ArrowRight className="size-3.5 text-[var(--saptta-mute)] shrink-0" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* New Hire Cards + Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* New Hires List */}
              <div className="lg:col-span-1 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[var(--saptta-mute)]" />
                  <Input
                    placeholder="Search new hires..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 rounded-xl border-[var(--saptta-line)] bg-[var(--saptta-bg-2)] text-xs"
                  />
                </div>
                {newHires
                  .filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.role.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((hire) => (
                  <motion.div key={hire.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Card
                      className={`cursor-pointer border rounded-[20px] transition-all ${
                        selectedHire.id === hire.id
                          ? "border-[var(--saptta-accent)]/30 bg-[var(--saptta-accent)]/5"
                          : "border-[var(--saptta-line)] hover:border-[var(--saptta-accent)]/20"
                      }`}
                      onClick={() => setSelectedHire(hire)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10 rounded-xl">
                            <AvatarFallback className="rounded-xl bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] text-sm font-semibold">
                              {hire.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--saptta-ink)] truncate">{hire.name}</p>
                            <p className="text-xs text-[var(--saptta-mute)] truncate">{hire.role} · {hire.dept}</p>
                          </div>
                          <Badge variant="outline" className={`text-[10px] rounded-[999px] shrink-0 ${statusColor(hire.stage >= 3 ? "completed" : "pending")}`}>
                            {pipelineStages[hire.stage]}
                          </Badge>
                        </div>
                        <div className="mt-3 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-[var(--saptta-mute)]">Progress</span>
                            <span className="font-medium text-[var(--saptta-ink)]">{hire.progress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[var(--saptta-bg-2)] overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-[var(--saptta-accent)]"
                              initial={{ width: 0 }}
                              animate={{ width: `${hire.progress}%` }}
                              transition={{ duration: 0.8, ease: [0.22, 0.8, 0.22, 1] }}
                            />
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--saptta-mute)]">
                          <CalendarDays className="size-3" />
                          Starts {hire.startDate}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Selected Hire Detail */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedHire.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.22, 0.8, 0.22, 1] }}
                    className="space-y-4"
                  >
                    {/* Task Checklist */}
                    <Card className="border-[var(--saptta-line)] rounded-[24px]">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Task Checklist — {selectedHire.name}</CardTitle>
                          <Badge variant="outline" className="text-[10px] rounded-[999px]">
                            {selectedHire.tasks.filter(t => t.done).length}/{selectedHire.tasks.length} done
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {selectedHire.tasks.map((task, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[var(--saptta-bg-2)] transition-colors">
                            <div className={`flex size-5 items-center justify-center rounded-full border-2 transition-colors ${
                              task.done
                                ? "bg-[var(--saptta-accent)] border-[var(--saptta-accent)]"
                                : "border-[var(--saptta-line)] bg-white"
                            }`}>
                              {task.done && <CheckCircle2 className="size-3 text-white" />}
                            </div>
                            <span className={`text-sm ${task.done ? "text-[var(--saptta-mute)] line-through" : "text-[var(--saptta-ink)]"}`}>
                              {task.label}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Digital Joining Kit + IT Setup */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Digital Joining Kit */}
                      <Card className="border-[var(--saptta-line)] rounded-[24px]">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)]">
                              <FileText className="size-4 inline mr-1.5 text-[var(--saptta-accent)]" />
                              Digital Joining Kit
                            </CardTitle>
                            <Badge variant="outline" className="text-[10px] rounded-[999px]">
                              {selectedHire.documents.filter(d => d.status === "verified").length}/{selectedHire.documents.length}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-1.5">
                          {selectedHire.documents.map((doc, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[var(--saptta-bg-2)] transition-colors">
                              <div className="flex items-center gap-2">
                                {statusIcon(doc.status)}
                                <span className="text-xs text-[var(--saptta-ink-2)]">{doc.name}</span>
                              </div>
                              <Badge variant="outline" className={`text-[9px] rounded-[999px] ${statusColor(doc.status)}`}>
                                {statusLabel(doc.status)}
                              </Badge>
                            </div>
                          ))}
                          <Button variant="outline" size="sm" className="w-full mt-2 rounded-xl text-xs h-8">
                            <Upload className="size-3 mr-1.5" />Upload Document
                          </Button>
                        </CardContent>
                      </Card>

                      {/* IT Setup Tracker */}
                      <Card className="border-[var(--saptta-line)] rounded-[24px]">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)]">
                              <Laptop className="size-4 inline mr-1.5 text-[var(--saptta-accent)]" />
                              IT Setup Tracker
                            </CardTitle>
                            <Badge variant="outline" className="text-[10px] rounded-[999px]">
                              {selectedHire.itSetup.filter(s => s.status === "active" || s.status === "delivered").length}/{selectedHire.itSetup.length}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-1.5">
                          {selectedHire.itSetup.map((item, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[var(--saptta-bg-2)] transition-colors">
                              <div className="flex items-center gap-2">
                                {statusIcon(item.status)}
                                <span className="text-xs text-[var(--saptta-ink-2)]">{item.item}</span>
                              </div>
                              <Badge variant="outline" className={`text-[9px] rounded-[999px] ${statusColor(item.status)}`}>
                                {statusLabel(item.status)}
                              </Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Buddy/Mentor + Welcome Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Buddy & Mentor */}
                      <Card className="border-[var(--saptta-line)] rounded-[24px]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)]">
                            <HandshakeIcon className="size-4 inline mr-1.5 text-[var(--saptta-accent)]" />
                            Buddy & Mentor
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-3 rounded-xl px-3 py-3 bg-[var(--saptta-bg-2)]">
                            <Avatar className="size-8 rounded-lg">
                              <AvatarFallback className="rounded-lg bg-[var(--saptta-accent-2)]/20 text-[var(--saptta-accent-2)] text-xs font-semibold">
                                BU
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xs font-medium text-[var(--saptta-ink)]">Buddy</p>
                              <p className="text-xs text-[var(--saptta-mute)]">{selectedHire.buddy}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 rounded-xl px-3 py-3 bg-[var(--saptta-bg-2)]">
                            <Avatar className="size-8 rounded-lg">
                              <AvatarFallback className="rounded-lg bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] text-xs font-semibold">
                                ME
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xs font-medium text-[var(--saptta-ink)]">Mentor</p>
                              <p className="text-xs text-[var(--saptta-mute)]">{selectedHire.mentor}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="w-full rounded-xl text-xs h-8">
                            <Users className="size-3 mr-1.5" />Reassign
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Welcome Email Preview */}
                      <Card className="border-[var(--saptta-line)] rounded-[24px]">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)]">
                              <Mail className="size-4 inline mr-1.5 text-[var(--saptta-accent)]" />
                              Welcome Email
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] rounded-lg" onClick={() => setShowWelcomeEmail(!showWelcomeEmail)}>
                              {showWelcomeEmail ? "Hide" : "Preview"}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="rounded-xl bg-[var(--saptta-bg-2)] p-3 space-y-2">
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="text-[var(--saptta-mute)]">To:</span>
                              <span className="text-[var(--saptta-ink)]">{welcomeEmail.to}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="text-[var(--saptta-mute)]">Subject:</span>
                              <span className="text-[var(--saptta-ink)] font-medium">{welcomeEmail.subject}</span>
                            </div>
                            {showWelcomeEmail && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                <div className="mt-2 pt-2 border-t border-[var(--saptta-line)] text-[10px] text-[var(--saptta-ink-2)] whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                                  {welcomeEmail.body}
                                </div>
                              </motion.div>
                            )}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="flex-1 rounded-xl bg-[var(--saptta-accent)] text-white text-[10px] h-8 hover:bg-[var(--saptta-accent)]/90">
                              <Mail className="size-3 mr-1" />Send Now
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 rounded-xl text-[10px] h-8">
                              Edit Template
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>

          {/* ═══════════ OFFBOARDING TAB ═══════════ */}
          <TabsContent value="offboarding" className="space-y-6">
            {/* Resignation Requests */}
            <Card className="border-[var(--saptta-line)] rounded-[24px]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Resignation Requests</CardTitle>
                  <Badge variant="outline" className="text-[10px] rounded-[999px]">{resignationRequests.length} active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {resignationRequests.map((req) => (
                  <div key={req.id} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl px-4 py-3 border border-[var(--saptta-line)] hover:border-[var(--saptta-accent)]/20 transition-colors">
                    <Avatar className="size-10 rounded-xl shrink-0">
                      <AvatarFallback className="rounded-xl bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] text-sm font-semibold">
                        {req.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-[var(--saptta-ink)]">{req.name}</p>
                        <Badge variant="outline" className={`text-[9px] rounded-[999px] ${statusColor(req.status)}`}>
                          {statusLabel(req.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--saptta-mute)]">{req.role} · {req.dept}</p>
                      <p className="text-[10px] text-[var(--saptta-mute)] mt-0.5">Reason: {req.reason}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      {/* Notice Period Countdown */}
                      <div className="text-center">
                        <p className="text-lg font-bold text-[var(--saptta-accent)]">{req.daysRemaining}</p>
                        <p className="text-[9px] text-[var(--saptta-mute)]">days left</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-[var(--saptta-mute)]">Last working day</p>
                        <p className="text-xs font-medium text-[var(--saptta-ink)]">{req.lastWorkingDay}</p>
                      </div>
                      <ChevronRight className="size-4 text-[var(--saptta-mute)]" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* KT Plans + Exit Interviews + F&F */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Knowledge Transfer */}
              <Card className="border-[var(--saptta-line)] rounded-[24px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)]">
                    <BookOpen className="size-4 inline mr-1.5 text-[var(--saptta-accent)]" />
                    Knowledge Transfer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ktPlans.map((kt, i) => (
                    <div key={i} className="rounded-xl px-3 py-3 bg-[var(--saptta-bg-2)]">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-[var(--saptta-ink)]">{kt.name}</p>
                        <Badge variant="outline" className={`text-[9px] rounded-[999px] ${statusColor(kt.status)}`}>
                          {statusLabel(kt.status)}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-[var(--saptta-mute)] mt-0.5">Transfer to: {kt.transferTo}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--saptta-line)] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-[var(--saptta-accent)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${kt.progress}%` }}
                            transition={{ duration: 0.8, ease: [0.22, 0.8, 0.22, 1] }}
                          />
                        </div>
                        <span className="text-[10px] text-[var(--saptta-mute)]">{kt.completed}/{kt.items}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Exit Interviews */}
              <Card className="border-[var(--saptta-line)] rounded-[24px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)]">
                    <MessageSquare className="size-4 inline mr-1.5 text-[var(--saptta-accent)]" />
                    Exit Interviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {exitInterviews.map((ei, i) => (
                    <div key={i} className="rounded-xl px-3 py-3 border border-[var(--saptta-line)]">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-[var(--saptta-ink)]">{ei.name}</p>
                        <Badge variant="outline" className={`text-[9px] rounded-[999px] ${statusColor(ei.status)}`}>
                          {statusLabel(ei.status)}
                        </Badge>
                      </div>
                      <div className="mt-1.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--saptta-mute)]">
                          <CalendarDays className="size-3" />{ei.scheduledDate}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--saptta-mute)]">
                          <UserCheck className="size-3" />{ei.interviewer}
                        </div>
                      </div>
                      {ei.status === "scheduled" && (
                        <Button variant="outline" size="sm" className="w-full mt-2 rounded-lg text-[10px] h-7">
                          <Timer className="size-3 mr-1" />Reschedule
                        </Button>
                      )}
                      {ei.status === "pending" && (
                        <Button size="sm" className="w-full mt-2 rounded-lg bg-[var(--saptta-accent)] text-white text-[10px] h-7 hover:bg-[var(--saptta-accent)]/90">
                          <CalendarDays className="size-3 mr-1" />Schedule Interview
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* F&F Settlement */}
              <Card className="border-[var(--saptta-line)] rounded-[24px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)]">
                    <DollarSign className="size-4 inline mr-1.5 text-[var(--saptta-accent)]" />
                    Full & Final Settlement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {fnfChecklist.map((item, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[var(--saptta-bg-2)] transition-colors">
                        <div className="flex items-center gap-2">
                          {statusIcon(item.status)}
                          <span className="text-xs text-[var(--saptta-ink-2)]">{item.item}</span>
                        </div>
                        <Badge variant="outline" className={`text-[9px] rounded-[999px] ${statusColor(item.status)}`}>
                          {statusLabel(item.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--saptta-line)]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--saptta-mute)]">Overall Progress</span>
                      <span className="text-xs font-semibold text-[var(--saptta-ink)]">
                        {fnfChecklist.filter(c => c.status === "completed").length}/{fnfChecklist.length}
                      </span>
                    </div>
                    <Progress
                      value={(fnfChecklist.filter(c => c.status === "completed").length / fnfChecklist.length) * 100}
                      className="h-1.5 mt-2 bg-[var(--saptta-bg-2)] [&>[data-slot=progress-indicator]]:bg-[var(--saptta-accent)]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════ EXIT CLEARANCE TAB ═══════════ */}
          <TabsContent value="clearance" className="space-y-6">
            {/* Employee selector */}
            <Card className="border-[var(--saptta-line)] rounded-[24px]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 rounded-xl">
                      <AvatarFallback className="rounded-xl bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] text-sm font-semibold">VS</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-[var(--saptta-ink)]">Vikram Singh</p>
                      <p className="text-xs text-[var(--saptta-mute)]">Senior Developer · Engineering · Last day: Apr 28, 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-50 text-amber-600 border border-amber-200 text-[10px] rounded-[999px]">54 days remaining</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clearance by Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clearanceDepartments.map((dept, i) => (
                <motion.div key={dept.dept} variants={fadeUp}>
                  <Card className="border-[var(--saptta-line)] rounded-[24px] h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)] flex items-center gap-2">
                          <div className="flex size-7 items-center justify-center rounded-lg bg-[var(--saptta-accent)]/10">
                            <dept.icon className="size-3.5 text-[var(--saptta-accent)]" />
                          </div>
                          {dept.dept}
                        </CardTitle>
                        <Badge variant="outline" className="text-[9px] rounded-[999px]">
                          {dept.items.filter(d => d.status === "completed" || d.status === "waived").length}/{dept.items.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1.5">
                      {dept.items.map((item, j) => (
                        <div key={j} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[var(--saptta-bg-2)] transition-colors">
                          <div className="flex items-center gap-2">
                            {statusIcon(item.status)}
                            <span className="text-xs text-[var(--saptta-ink-2)]">{item.item}</span>
                          </div>
                          <Badge variant="outline" className={`text-[9px] rounded-[999px] ${statusColor(item.status)}`}>
                            {statusLabel(item.status)}
                          </Badge>
                        </div>
                      ))}
                      <div className="mt-2 pt-2 border-t border-[var(--saptta-line)]">
                        <Progress
                          value={(dept.items.filter(d => d.status === "completed" || d.status === "waived").length / dept.items.length) * 100}
                          className="h-1 bg-[var(--saptta-bg-2)] [&>[data-slot=progress-indicator]]:bg-[var(--saptta-accent)]"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Settlement Preview + Letter Generation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Settlement Amount */}
              <Card className="border-[var(--saptta-line)] rounded-[24px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)]">
                    <CreditCard className="size-4 inline mr-1.5 text-[var(--saptta-accent)]" />
                    Settlement Calculation Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-[10px] font-semibold text-[var(--saptta-mute)] uppercase tracking-wider">Earnings</div>
                    {[
                      { label: "Basic Salary", value: settlementPreview.basicSalary },
                      { label: "Dearness Allowance", value: settlementPreview.da },
                      { label: "Leave Encashment", value: settlementPreview.leaveEncashment },
                      { label: "Bonus", value: settlementPreview.bonus },
                      { label: "Gratuity", value: settlementPreview.gratuity },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-[var(--saptta-ink-2)]">{item.label}</span>
                        <span className="text-[var(--saptta-ink)] font-medium">₹{item.value.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-[var(--saptta-line)]">
                      <span className="text-[var(--saptta-ink)]">Total Earnings</span>
                      <span className="text-green-600">₹{settlementPreview.totalEarnings.toLocaleString()}</span>
                    </div>

                    <div className="text-[10px] font-semibold text-[var(--saptta-mute)] uppercase tracking-wider mt-3">Deductions</div>
                    {[
                      { label: "PF Deduction", value: settlementPreview.pfDeduction },
                      { label: "Tax Deduction (TDS)", value: settlementPreview.taxDeduction },
                      { label: "Notice Period Recovery", value: settlementPreview.noticeRecovery },
                      { label: "Other Deductions", value: settlementPreview.otherDeductions },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-[var(--saptta-ink-2)]">{item.label}</span>
                        <span className="text-red-500 font-medium">₹{item.value.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-[var(--saptta-line)]">
                      <span className="text-[var(--saptta-ink)]">Total Deductions</span>
                      <span className="text-red-500">₹{settlementPreview.totalDeductions.toLocaleString()}</span>
                    </div>

                    <div className="mt-3 pt-3 border-t-2 border-[var(--saptta-accent)]/20 rounded-xl bg-[var(--saptta-accent)]/5 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[var(--saptta-ink)]">Net Settlement</span>
                        <span className="text-xl font-bold text-[var(--saptta-accent)]">₹{settlementPreview.netSettlement.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Letter Generation */}
              <Card className="border-[var(--saptta-line)] rounded-[24px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)]">
                    <FileBadge className="size-4 inline mr-1.5 text-[var(--saptta-accent)]" />
                    Letter Generation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-xl border border-[var(--saptta-line)] p-4 space-y-4">
                    {/* Experience Letter */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--saptta-accent)]/10">
                          <FileText className="size-4 text-[var(--saptta-accent)]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--saptta-ink)]">Experience Letter</p>
                          <p className="text-[10px] text-[var(--saptta-mute)]">Employment duration & role verification</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-8">
                          <Eye className="size-3 mr-1" />Preview
                        </Button>
                        <Button size="sm" className="rounded-lg bg-[var(--saptta-accent)] text-white text-[10px] h-8 hover:bg-[var(--saptta-accent)]/90">
                          <FileDown className="size-3 mr-1" />Generate
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-[var(--saptta-line)]" />

                    {/* Relieving Letter */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--saptta-accent-2)]/20">
                          <Shield className="size-4 text-[var(--saptta-accent-2)]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--saptta-ink)]">Relieving Letter</p>
                          <p className="text-[10px] text-[var(--saptta-mute)]">Official release from duties</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-8">
                          <Eye className="size-3 mr-1" />Preview
                        </Button>
                        <Button size="sm" className="rounded-lg bg-[var(--saptta-accent)] text-white text-[10px] h-8 hover:bg-[var(--saptta-accent)]/90">
                          <FileDown className="size-3 mr-1" />Generate
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-[var(--saptta-line)]" />

                    {/* Service Certificate */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-purple-50">
                          <Package className="size-4 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--saptta-ink)]">Service Certificate</p>
                          <p className="text-[10px] text-[var(--saptta-mute)]">Complete service record</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-8">
                          <Eye className="size-3 mr-1" />Preview
                        </Button>
                        <Button size="sm" className="rounded-lg bg-[var(--saptta-accent)] text-white text-[10px] h-8 hover:bg-[var(--saptta-accent)]/90">
                          <FileDown className="size-3 mr-1" />Generate
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[var(--saptta-bg-2)] p-3 flex items-center gap-2">
                    <AlertCircle className="size-4 text-amber-500 shrink-0" />
                    <p className="text-[10px] text-[var(--saptta-mute)]">
                      Letters can only be generated after all department clearances are completed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
