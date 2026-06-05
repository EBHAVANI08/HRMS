"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Send, Lightbulb, BarChart3, Users, Clock, Database,
  FileText, BookOpen, Copy, Check, ChevronRight, Wand2,
  PenTool, Mail, FileBadge, ClipboardList, MessageSquare,
  Search, ThumbsUp, ThumbsDown, ExternalLink, History,
  Zap, Bot, User, Globe, Shield, PieChart as PieChartIcon, TrendingUp,
  FileDown, Eye, RefreshCw, ArrowRight, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { generateLocalResponse, getSuggestedQuestions } from "@/lib/ai/local-chat-engine";
import { generateJD, inferJDParams, type JDInput } from "@/lib/ai/jd-generator";
import { useAppStore } from "@/lib/store";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 0.8, 0.22, 1] } },
};

// ─── CHAT DATA ───
type MessageCategory = "Data Query" | "Policy" | "Action" | "Report";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  category?: MessageCategory;
  sources?: string[];
  followUps?: string[];
  timestamp: string;
}

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content: "Hello, Priya! 👋 I'm saptta AI, your HR assistant. I can help you with employee data, attendance insights, payroll queries, recruitment analytics, and more. What would you like to know?",
    category: undefined,
    sources: [],
    followUps: ["How many employees joined this month?", "Show me the attendance trend", "What's the leave balance policy?"],
    timestamp: "10:00 AM",
  },
  {
    role: "user",
    content: "How many employees joined in March 2026?",
    timestamp: "10:02 AM",
  },
  {
    role: "assistant",
    content: `Based on the HR database, here are the new joiners for March 2026:\n\n📊 **Total New Joiners: 19**\n\n| Department | Count |\n|------------|-------|\n| Engineering | 8 |\n| Analytics | 4 |\n| Marketing | 3 |\n| Sales | 2 |\n| Operations | 2 |\n\nThis represents a 12% increase compared to February 2026 (17 joiners). The Engineering team saw the highest intake, primarily driven by the new product initiative.`,
    category: "Data Query",
    sources: ["HR Database — Employee Master", "Recruitment Module — Hiring Tracker"],
    followUps: ["Show department-wise headcount", "Compare with last quarter", "What's the attrition rate?"],
    timestamp: "10:02 AM",
  },
];

const chatSuggestions = [
  { label: "How many employees joined this month?", icon: Users, category: "Data Query" as MessageCategory },
  { label: "Show me the attendance trend for this week", icon: BarChart3, category: "Report" as MessageCategory },
  { label: "What's the current leave balance policy?", icon: Clock, category: "Policy" as MessageCategory },
  { label: "Generate a hiring forecast for Q2", icon: Lightbulb, category: "Action" as MessageCategory },
];

const categoryColors: Record<MessageCategory, string> = {
  "Data Query": "bg-blue-50 text-blue-600 border-blue-200",
  "Policy": "bg-purple-50 text-purple-600 border-purple-200",
  "Action": "bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] border-[var(--saptta-accent)]/20",
  "Report": "bg-green-50 text-green-600 border-green-200",
};

// ─── POLICY Q&A DATA ───
const policyDocuments = [
  { id: "p1", name: "Leave Policy 2026", category: "Leave", pages: 24, updated: "Jan 15, 2026" },
  { id: "p2", name: "Remote Work Policy", category: "Work Arrangement", pages: 12, updated: "Mar 01, 2026" },
  { id: "p3", name: "Code of Conduct", category: "Ethics", pages: 18, updated: "Dec 10, 2025" },
  { id: "p4", name: "Travel & Expense Policy", category: "Finance", pages: 15, updated: "Feb 20, 2026" },
  { id: "p5", name: "Performance Review Guidelines", category: "Performance", pages: 20, updated: "Jan 30, 2026" },
  { id: "p6", name: "Anti-Harassment Policy", category: "Compliance", pages: 16, updated: "Nov 05, 2025" },
  { id: "p7", name: "Data Security & Privacy", category: "IT", pages: 22, updated: "Mar 10, 2026" },
  { id: "p8", name: "Employee Benefits Handbook", category: "Benefits", pages: 30, updated: "Jan 01, 2026" },
];

const policyQA = [
  {
    question: "How many casual leaves am I entitled to?",
    answer: "According to the Leave Policy 2026 (Section 3.2), all full-time employees are entitled to 12 Casual Leaves (CL) per calendar year. CL can be availed for personal work, short notices, or emergencies. A maximum of 3 CL can be carried forward to the next year. CL must be approved by your reporting manager.",
    confidence: 96,
    sources: ["Leave Policy 2026 — Section 3.2 (Page 5)", "Employee Benefits Handbook — Chapter 4"],
    relatedPolicies: ["Leave Policy 2026", "Employee Benefits Handbook"],
  },
  {
    question: "What is the work from home policy?",
    answer: "As per the Remote Work Policy (effective April 1, 2026), employees can work remotely up to 3 days per week with prior manager approval. Key conditions: (1) Must be available during core hours (10 AM - 4 PM IST), (2) Must have stable internet connection, (3) Must attend in-person meetings when required. New employees must complete 90 days in-office before becoming eligible for remote work.",
    confidence: 92,
    sources: ["Remote Work Policy — Section 2.1 (Page 3)", "Remote Work Policy — Section 4.3 (Page 8)"],
    relatedPolicies: ["Remote Work Policy", "Code of Conduct"],
  },
  {
    question: "What is the reimbursement process for travel expenses?",
    answer: "As per the Travel & Expense Policy (Section 5.1), employees can claim reimbursement within 30 days of travel completion. Steps: (1) Submit expense report through the HR portal with all receipts, (2) Get manager approval, (3) Finance processes within 15 business days. Per diem rates: Domestic - ₹2,500/day, International - $75/day. Advance requests must be submitted 7 days prior to travel.",
    confidence: 89,
    sources: ["Travel & Expense Policy — Section 5.1 (Page 10)", "Travel & Expense Policy — Section 6.2 (Page 13)"],
    relatedPolicies: ["Travel & Expense Policy", "Employee Benefits Handbook"],
  },
];

const policyAutoSuggest = [
  "How many sick leaves do I get?",
  "What is the probation period?",
  "How to apply for sabbatical leave?",
  "What are the exit procedures?",
  "Is overtime compensation provided?",
];

// ─── CONTENT GENERATION DATA ───
const contentTemplates = [
  { id: "t1", name: "Job Description", icon: ClipboardList, color: "#ff6a2c", description: "Generate a complete JD with roles, requirements, and qualifications", params: ["Job Title", "Department", "Level", "Location", "Employment Type"] },
  { id: "t2", name: "Offer Letter", icon: FileBadge, color: "#22c55e", description: "Create a formal offer letter with compensation details", params: ["Candidate Name", "Position", "Start Date", "Salary", "Department"] },
  { id: "t3", name: "Performance Review", icon: Users, color: "#8b5cf6", description: "Generate performance review feedback and evaluation", params: ["Employee Name", "Review Period", "Rating", "Department", "Manager"] },
  { id: "t4", name: "Policy Document", icon: Shield, color: "#f59e0b", description: "Draft a new policy document from template", params: ["Policy Name", "Category", "Effective Date", "Applicable To"] },
  { id: "t5", name: "Email Template", icon: Mail, color: "#3b82f6", description: "Generate professional HR email templates", params: ["Email Type", "Recipient", "Subject", "Tone"] },
];

const generatedHistory = [
  { name: "Job Description — Senior Backend Developer", date: "Mar 14, 2026", type: "Job Description" },
  { name: "Offer Letter — Meera Joshi", date: "Mar 12, 2026", type: "Offer Letter" },
  { name: "Performance Review — Q1 2026 Template", date: "Mar 10, 2026", type: "Performance Review" },
  { name: "Remote Work Policy Update", date: "Mar 08, 2026", type: "Policy Document" },
  { name: "Welcome Email — New Hires Batch", date: "Mar 05, 2026", type: "Email Template" },
];

const sampleGeneratedContent = `# Job Description: Senior Backend Developer

**Department:** Engineering  
**Location:** Bangalore, India  
**Employment Type:** Full-Time  
**Level:** Senior (L5)

## About the Role
We are seeking an experienced Senior Backend Developer to join our Engineering team. You will be responsible for designing, developing, and maintaining scalable backend services that power our HRMS platform.

## Key Responsibilities
- Design and implement RESTful APIs and microservices
- Lead technical discussions and mentor junior developers
- Optimize database queries and system performance
- Write clean, maintainable, and well-tested code
- Participate in code reviews and technical planning

## Required Qualifications
- 5+ years of experience in backend development
- Strong proficiency in Python, Node.js, or Go
- Experience with PostgreSQL, Redis, and message queues
- Understanding of cloud services (AWS/GCP)
- Excellent problem-solving and communication skills

## Preferred Qualifications
- Experience with HR tech or SaaS platforms
- Knowledge of DevOps practices and CI/CD
- Contributions to open-source projects`;

// ─── NL ANALYTICS DATA ───
const nlQueryExamples = [
  'Show me attrition by department for last quarter',
  'What is the average time to hire by recruiter?',
  'Compare headcount growth across offices',
  'Which department has the highest overtime?',
  'Show leave utilization trend for 2026',
];

const nlQueryResult = {
  query: "Show me attrition by department for last quarter",
  interpretation: "Analyzing employee exit data grouped by department for Q4 2025 (Oct-Dec)",
  chartType: "bar" as const,
  data: [
    { department: "Engineering", attrition: 8.2, exits: 12 },
    { department: "Sales", attrition: 12.5, exits: 8 },
    { department: "Marketing", attrition: 6.1, exits: 3 },
    { department: "Analytics", attrition: 9.3, exits: 5 },
    { department: "Operations", attrition: 5.8, exits: 4 },
    { department: "HR", attrition: 4.2, exits: 2 },
    { department: "Finance", attrition: 3.9, exits: 2 },
    { department: "Design", attrition: 7.1, exits: 3 },
  ],
  insights: [
    "Sales has the highest attrition rate at 12.5%, significantly above the company average of 7.4%",
    "Finance and HR have the lowest attrition rates, below 5%",
    "Overall Q4 attrition of 7.4% is an improvement from Q3's 8.1%",
    "Engineering exits (12) represent the highest volume despite moderate rate",
  ],
  followUps: [
    "What's driving Sales attrition?",
    "Show me attrition trend over last 4 quarters",
    "Compare with industry benchmarks",
  ],
};

const queryHistory = [
  { query: "Employee headcount by department", date: "Mar 14, 2026", type: "bar" },
  { query: "Revenue per employee trend", date: "Mar 12, 2026", type: "line" },
  { query: "Leave utilization by type", date: "Mar 10, 2026", type: "pie" },
  { query: "Hiring funnel conversion rates", date: "Mar 08, 2026", type: "bar" },
  { query: "Salary distribution by grade", date: "Mar 05, 2026", type: "bar" },
];

export function AIAssistantView() {
  const { userRole, user } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [policyQuestion, setPolicyQuestion] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showGeneratedContent, setShowGeneratedContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(sampleGeneratedContent);
  const [nlQuery, setNlQuery] = useState("");
  const [showNlResult, setShowNlResult] = useState(false);

  // JD form state
  const [jdForm, setJdForm] = useState<Record<string, string>>({});

  // Get role-specific suggestions
  const roleSuggestions = getSuggestedQuestions(userRole);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: input, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    const queryText = input;
    setInput("");
    setIsTyping(true);

    // Use local AI engine - no API needed!
    setTimeout(() => {
      const response = generateLocalResponse(queryText);
      const aiMsg: ChatMessage = {
        role: "assistant",
        content: response.content,
        category: response.category,
        sources: response.sources,
        followUps: response.followUps,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 700); // Natural typing delay
  }, [input]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--saptta-ink)] tracking-tight">AI Assistant</h1>
        <p className="text-[var(--saptta-mute)] mt-1 text-sm">Ask saptta AI anything about your HR data, policies, and analytics. <span className="text-green-600 text-xs font-medium">100% Local — No API Key Required</span></p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="bg-[var(--saptta-bg-2)] rounded-[999px] p-1 h-auto flex-wrap">
            <TabsTrigger value="chat" className="rounded-[999px] px-5 py-2 text-xs data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white data-[state=active]:shadow-sm">
              <MessageSquare className="size-3.5 mr-1.5" />Chat
            </TabsTrigger>
            <TabsTrigger value="policy" className="rounded-[999px] px-5 py-2 text-xs data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white data-[state=active]:shadow-sm">
              <BookOpen className="size-3.5 mr-1.5" />Policy Q&A
            </TabsTrigger>
            <TabsTrigger value="content" className="rounded-[999px] px-5 py-2 text-xs data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white data-[state=active]:shadow-sm">
              <Wand2 className="size-3.5 mr-1.5" />Content Generation
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-[999px] px-5 py-2 text-xs data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white data-[state=active]:shadow-sm">
              <BarChart3 className="size-3.5 mr-1.5" />NL Analytics
            </TabsTrigger>
          </TabsList>

          {/* ═══════════ CHAT TAB ═══════════ */}
          <TabsContent value="chat">
            <Card className="border-[var(--saptta-line)] rounded-[24px] overflow-hidden">
              <div className="h-[520px] overflow-y-auto p-6 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <Avatar className="size-8 rounded-lg shrink-0 mt-0.5">
                        <AvatarFallback className="rounded-lg bg-[var(--saptta-accent)] text-white">
                          <Sparkles className="size-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[75%] ${msg.role === "assistant" ? "" : ""}`}>
                      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[var(--saptta-accent)] text-white"
                          : "bg-[var(--saptta-bg-2)] text-[var(--saptta-ink)]"
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {/* Category + Sources */}
                      {msg.role === "assistant" && msg.category && (
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-[9px] rounded-[999px] ${categoryColors[msg.category]}`}>
                            {msg.category}
                          </Badge>
                          {msg.sources?.map((source, j) => (
                            <span key={j} className="flex items-center gap-1 text-[9px] text-[var(--saptta-mute)]">
                              <Database className="size-2.5" />{source}
                            </span>
                          ))}
                          <button
                            onClick={() => handleCopy(msg.content, `msg-${i}`)}
                            className="text-[var(--saptta-mute)] hover:text-[var(--saptta-ink)] transition-colors ml-auto"
                          >
                            {copied === `msg-${i}` ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
                          </button>
                        </div>
                      )}
                      {/* Follow-up suggestions */}
                      {msg.role === "assistant" && msg.followUps && msg.followUps.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {msg.followUps.map((fu, j) => (
                            <button
                              key={j}
                              onClick={() => setInput(fu)}
                              className="saptta-tag hover:bg-[var(--saptta-accent)]/10 hover:text-[var(--saptta-accent)] transition-colors cursor-pointer text-[10px] gap-1"
                            >
                              <ArrowRight className="size-2.5" />{fu}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="size-8 rounded-lg shrink-0">
                      <AvatarFallback className="rounded-lg bg-[var(--saptta-accent)] text-white">
                        <Sparkles className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl px-4 py-3 bg-[var(--saptta-bg-2)]">
                      <div className="flex items-center gap-1.5">
                        <motion.div className="size-2 rounded-full bg-[var(--saptta-mute)]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
                        <motion.div className="size-2 rounded-full bg-[var(--saptta-mute)]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                        <motion.div className="size-2 rounded-full bg-[var(--saptta-mute)]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Tool Call Visualization */}
              {isTyping && (
                <div className="border-t border-[var(--saptta-line)] px-4 py-2 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--saptta-accent)]">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Zap className="size-3" />
                    </motion.div>
                    <span>Querying HR Database...</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--saptta-mute)]">
                    <Database className="size-3" />
                    <span>Analyzing records...</span>
                  </div>
                </div>
              )}

              {/* Suggestions - role specific */}
              <div className="border-t border-[var(--saptta-line)] px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {roleSuggestions.map((s, i) => {
                    const icons = [Users, BarChart3, Clock, Lightbulb, Sparkles, Search];
                    const Icon = icons[i % icons.length];
                    return (
                      <button
                        key={s.label}
                        onClick={() => setInput(s.label)}
                        className="saptta-tag hover:bg-[var(--saptta-accent)]/10 hover:text-[var(--saptta-accent)] transition-colors cursor-pointer gap-1.5"
                      >
                        <Icon className="size-3" />{s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-[var(--saptta-line)] p-4">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask saptta AI anything..."
                    className="flex-1 h-10 rounded-xl border border-[var(--saptta-line)] bg-[var(--saptta-bg-2)] px-4 text-sm text-[var(--saptta-ink)] placeholder:text-[var(--saptta-mute)] focus:outline-none focus:ring-2 focus:ring-[var(--saptta-accent)]/20 focus:border-[var(--saptta-accent)]/30"
                  />
                  <Button type="submit" size="icon" className="h-10 w-10 rounded-xl bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90">
                    <Send className="size-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </TabsContent>

          {/* ═══════════ POLICY Q&A TAB ═══════════ */}
          <TabsContent value="policy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Policy Documents List */}
              <Card className="border-[var(--saptta-line)] rounded-[24px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)]">Policy Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 max-h-[600px] overflow-y-auto">
                  {policyDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[var(--saptta-bg-2)] transition-colors cursor-pointer">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--saptta-accent)]/10 shrink-0">
                        <FileText className="size-3.5 text-[var(--saptta-accent)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--saptta-ink)] truncate">{doc.name}</p>
                        <p className="text-[9px] text-[var(--saptta-mute)]">{doc.category} · {doc.pages} pages · Updated {doc.updated}</p>
                      </div>
                      <ChevronRight className="size-3.5 text-[var(--saptta-mute)] shrink-0" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Q&A Section */}
              <div className="lg:col-span-2 space-y-4">
                {/* Ask Question */}
                <Card className="border-[var(--saptta-line)] rounded-[24px]">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-3">Ask a Policy Question</h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--saptta-mute)]" />
                      <input
                        type="text"
                        value={policyQuestion}
                        onChange={(e) => setPolicyQuestion(e.target.value)}
                        placeholder="e.g., How many casual leaves am I entitled to?"
                        className="w-full h-11 rounded-xl border border-[var(--saptta-line)] bg-[var(--saptta-bg-2)] pl-10 pr-4 text-sm text-[var(--saptta-ink)] placeholder:text-[var(--saptta-mute)] focus:outline-none focus:ring-2 focus:ring-[var(--saptta-accent)]/20 focus:border-[var(--saptta-accent)]/30"
                      />
                    </div>
                    {/* Auto-suggest */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {policyAutoSuggest.map((sug) => (
                        <button
                          key={sug}
                          onClick={() => setPolicyQuestion(sug)}
                          className="saptta-tag hover:bg-[var(--saptta-accent)]/10 hover:text-[var(--saptta-accent)] transition-colors cursor-pointer text-[10px]"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Q&A Answers */}
                <div className="space-y-4">
                  {policyQA.map((qa, i) => (
                    <motion.div key={i} variants={fadeUp}>
                      <Card className="border-[var(--saptta-line)] rounded-[24px]">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3">
                            <Avatar className="size-8 rounded-lg shrink-0 mt-0.5">
                              <AvatarFallback className="rounded-lg bg-purple-50 text-purple-600">
                                <BookOpen className="size-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[var(--saptta-ink)]">{qa.question}</p>
                              <p className="text-xs text-[var(--saptta-ink-2)] mt-2 leading-relaxed">{qa.answer}</p>

                              {/* Confidence + Sources */}
                              <div className="mt-3 pt-3 border-t border-[var(--saptta-line)]">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <div className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-16 rounded-full bg-[var(--saptta-bg-2)] overflow-hidden">
                                      <div className="h-full rounded-full bg-green-500" style={{ width: `${qa.confidence}%` }} />
                                    </div>
                                    <span className="text-[10px] font-medium text-green-600">{qa.confidence}% confident</span>
                                  </div>
                                </div>
                                <div className="mt-2 space-y-1">
                                  <p className="text-[9px] font-semibold text-[var(--saptta-mute)] uppercase tracking-wider">Sources</p>
                                  {qa.sources.map((source, j) => (
                                    <div key={j} className="flex items-center gap-1.5 text-[10px] text-[var(--saptta-accent)]">
                                      <ExternalLink className="size-2.5" />{source}
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                  <span className="text-[9px] text-[var(--saptta-mute)]">Related:</span>
                                  {qa.relatedPolicies.map((p, j) => (
                                    <Badge key={j} variant="outline" className="text-[9px] rounded-[999px] cursor-pointer hover:bg-[var(--saptta-accent)]/10">
                                      {p}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-3">
                                <button className="flex items-center gap-1 text-[10px] text-[var(--saptta-mute)] hover:text-green-500 transition-colors">
                                  <ThumbsUp className="size-3" />Helpful
                                </button>
                                <button className="flex items-center gap-1 text-[10px] text-[var(--saptta-mute)] hover:text-red-500 transition-colors">
                                  <ThumbsDown className="size-3" />Not helpful
                                </button>
                                <button onClick={() => handleCopy(qa.answer, `qa-${i}`)} className="flex items-center gap-1 text-[10px] text-[var(--saptta-mute)] hover:text-[var(--saptta-ink)] transition-colors ml-auto">
                                  {copied === `qa-${i}` ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
                                  {copied === `qa-${i}` ? "Copied" : "Copy"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ═══════════ CONTENT GENERATION TAB ═══════════ */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Templates */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--saptta-ink)]">Templates</h3>
                <div className="space-y-2">
                  {contentTemplates.map((template) => (
                    <motion.div key={template.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Card
                        className={`cursor-pointer border rounded-[20px] transition-all ${
                          selectedTemplate === template.id
                            ? "border-[var(--saptta-accent)]/30 bg-[var(--saptta-accent)]/5"
                            : "border-[var(--saptta-line)] hover:border-[var(--saptta-accent)]/20"
                        }`}
                        onClick={() => { setSelectedTemplate(template.id); setShowGeneratedContent(false); }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${template.color}15` }}>
                              <template.icon className="size-4" style={{ color: template.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[var(--saptta-ink)]">{template.name}</p>
                              <p className="text-[9px] text-[var(--saptta-mute)] mt-0.5 line-clamp-2">{template.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* History */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--saptta-ink)] flex items-center gap-2">
                    <History className="size-4 text-[var(--saptta-mute)]" />History
                  </h3>
                  <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
                    {generatedHistory.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[var(--saptta-bg-2)] transition-colors cursor-pointer">
                        <FileText className="size-3.5 text-[var(--saptta-mute)] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-[var(--saptta-ink)] truncate">{item.name}</p>
                          <p className="text-[9px] text-[var(--saptta-mute)]">{item.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generator */}
              <div className="lg:col-span-2">
                {selectedTemplate ? (
                  <Card className="border-[var(--saptta-line)] rounded-[24px]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">
                        Generate: {contentTemplates.find(t => t.id === selectedTemplate)?.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!showGeneratedContent ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {contentTemplates.find(t => t.id === selectedTemplate)?.params.map((param) => (
                              <div key={param}>
                                <label className="text-[10px] font-medium text-[var(--saptta-mute)] mb-1 block">{param}</label>
                                <Input
                                  placeholder={`Enter ${param.toLowerCase()}`}
                                  className="rounded-xl h-9 text-xs"
                                  value={jdForm[param] || ""}
                                  onChange={(e) => setJdForm(prev => ({ ...prev, [param]: e.target.value }))}
                                />
                              </div>
                            ))}
                          </div>
                          <Button onClick={() => {
                            // Use the local JD generator engine
                            if (selectedTemplate === "t1") {
                              const jobTitle = jdForm["Job Title"] || "Software Engineer";
                              const inferred = inferJDParams(jobTitle);
                              const jdInput: JDInput = {
                                jobTitle,
                                department: jdForm["Department"] || inferred.department || "Engineering",
                                level: (jdForm["Level"] as any) || inferred.level || "Mid",
                                location: jdForm["Location"] || inferred.location || "Bangalore, India",
                                employmentType: (jdForm["Employment Type"] as any) || "Full-Time",
                                experienceMin: inferred.experienceMin || 3,
                                experienceMax: inferred.experienceMax || 5,
                                salaryMin: "12",
                                salaryMax: "20",
                                skills: [],
                                responsibilities: [],
                                education: inferred.education || "B.Tech/M.Tech in Computer Science or equivalent",
                              };
                              const result = generateJD(jdInput);
                              setGeneratedContent(result.content);
                            } else if (selectedTemplate === "t2") {
                              const candidateName = jdForm["Candidate Name"] || "Candidate";
                              const position = jdForm["Position"] || "Software Engineer";
                              const startDate = jdForm["Start Date"] || "April 1, 2026";
                              const salary = jdForm["Salary"] || "14,00,000";
                              const dept = jdForm["Department"] || "Engineering";
                              setGeneratedContent(`# Offer Letter\n\n**Date:** ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}\n\n**To:** ${candidateName}\n\n**Subject:** Offer of Employment — ${position}\n\nDear ${candidateName},\n\nWe are delighted to extend an offer of employment for the position of **${position}** in our **${dept}** department at saptta Inc.\n\n**Terms of Employment:**\n\n| Component | Details |\n|-----------|--------|\n| Position | ${position} |\n| Department | ${dept} |\n| Start Date | ${startDate} |\n| CTC | INR ${salary} per annum |\n| Employment Type | Full-Time |\n| Probation | 6 months |\n| Reporting To | Department Head |\n\n**Compensation Breakup:**\n- Basic Pay: 42% of CTC\n- HRA: 21% of CTC\n- Special Allowance: Balance\n- PF: 12% of Basic (Employer + Employee)\n\n**Conditions:**\n1. This offer is contingent upon successful background verification\n2. You must submit all required documents before joining\n3. A 30-day notice period applies after confirmation\n\nPlease confirm your acceptance by signing and returning this letter within 5 business days.\n\nWelcome aboard!\n\nBest regards,\nHR Team\nsaptta Inc.`);
                            } else if (selectedTemplate === "t3") {
                              const empName = jdForm["Employee Name"] || "Employee";
                              const reviewPeriod = jdForm["Review Period"] || "Q1 2026";
                              const rating = jdForm["Rating"] || "3";
                              const dept = jdForm["Department"] || "Engineering";
                              const manager = jdForm["Manager"] || "Manager";
                              setGeneratedContent(`# Performance Review — ${empName}\n\n**Review Period:** ${reviewPeriod}\n**Department:** ${dept}\n**Manager:** ${manager}\n\n## Overall Rating: ${rating}/5\n\n## Goals Assessment\n| Goal | Target | Achievement | Rating |\n|------|--------|-------------|--------|\n| Project Delivery | On-time | Achieved | 4/5 |\n| Code Quality | <5% defect rate | 3.2% | 5/5 |\n| Team Collaboration | Peer feedback >4 | 4.2 | 4/5 |\n| Learning | 2 certifications | 1 completed | 3/5 |\n\n## Strengths\n- Consistently delivers high-quality work\n- Strong technical problem-solving abilities\n- Good collaboration with cross-functional teams\n\n## Areas for Improvement\n- Could take more initiative in leading technical discussions\n- Complete pending certifications\n- Improve documentation practices\n\n## Development Plan\n1. Enroll in advanced architecture course\n2. Lead at least 2 technical brown-bag sessions\n3. Mentor 1 junior team member\n\n## Manager Comments\n${empName} has been a reliable contributor this quarter. The focus for next quarter should be on expanding leadership scope and completing the certification roadmap.`);
                            } else if (selectedTemplate === "t4") {
                              const policyName = jdForm["Policy Name"] || "New Policy";
                              const category = jdForm["Category"] || "General";
                              const effectiveDate = jdForm["Effective Date"] || "April 1, 2026";
                              const applicableTo = jdForm["Applicable To"] || "All Employees";
                              setGeneratedContent(`# ${policyName}\n\n**Category:** ${category}\n**Effective Date:** ${effectiveDate}\n**Applicable To:** ${applicableTo}\n**Version:** 1.0\n**Approved By:** HR Committee\n\n## 1. Purpose\nThis policy establishes guidelines and procedures for ${policyName.toLowerCase()} at saptta Inc. It aims to ensure consistency, fairness, and compliance with applicable regulations.\n\n## 2. Scope\nThis policy applies to ${applicableTo.toLowerCase()} across all offices and remote locations.\n\n## 3. Definitions\n- **Employee:** Any person employed by saptta Inc. on a full-time, part-time, or contractual basis\n- **Manager:** Direct reporting manager of the employee\n- **HR:** Human Resources department\n\n## 4. Policy Guidelines\n\n### 4.1 General Provisions\nAll employees are expected to adhere to the guidelines outlined in this document.\n\n### 4.2 Procedures\n1. Employees must submit requests through the HR portal\n2. Managers must review and approve within 5 business days\n3. HR will process approved requests within 10 business days\n\n### 4.3 Exceptions\nAny exceptions to this policy require written approval from the HR Director and department VP.\n\n## 5. Compliance\nNon-compliance may result in disciplinary action as per the Code of Conduct.\n\n## 6. Review Cycle\nThis policy will be reviewed annually or as needed based on regulatory changes.\n\n## 7. Contact\nFor questions, contact: hr@company.com`);
                            } else if (selectedTemplate === "t5") {
                              const emailType = jdForm["Email Type"] || "Welcome";
                              const recipient = jdForm["Recipient"] || "Team";
                              const subject = jdForm["Subject"] || "Welcome to the team!";
                              const tone = jdForm["Tone"] || "Professional";
                              setGeneratedContent(`**To:** ${recipient}\n**Subject:** ${subject}\n**Tone:** ${tone}\n\n---\n\nDear ${recipient},\n\n${emailType === "Welcome" ? `We are thrilled to welcome you to saptta Inc.! We're excited to have you join our team and look forward to the contributions you'll make.\n\n**Your First Week:**\n- Day 1: Orientation and IT setup at 9:30 AM\n- Day 2-3: Team introductions and project onboarding\n- Day 4-5: Tool setup and initial assignments\n\n**Important Contacts:**\n- HR: Priya Sharma (priya@saptta.io)\n- IT Support: helpdesk@saptta.io\n- Your Buddy: Will be assigned on Day 1\n\n**What to Bring:**\n- Government ID for verification\n- Bank account details for payroll setup\n- Previous employment documents (if applicable)\n\nDon't hesitate to reach out if you have any questions before your start date.\n\nBest regards,\nHR Team\nsaptta Inc.` : emailType === "Interview Invitation" ? `We are pleased to invite you for an interview for the position at saptta Inc.\n\n**Interview Details:**\n- Date: [To be confirmed]\n- Time: [To be confirmed]\n- Format: Technical Round (Video Call)\n- Duration: Approximately 60 minutes\n\n**What to Expect:**\n- Technical problem-solving discussion\n- System design conversation\n- Q&A about the role and team\n\nPlease confirm your availability by replying to this email.\n\nBest regards,\nRecruitment Team\nsaptta Inc.` : `Thank you for your continued dedication and hard work. We appreciate your contributions to the team and the organization.\n\nIf you have any questions or concerns, please don't hesitate to reach out to your manager or the HR team.\n\nBest regards,\nHR Team\nsaptta Inc.`}\n\n---\n*This email was generated locally by saptta AI — no cloud API used.*`);
                            }
                            setShowGeneratedContent(true);
                          }} className="rounded-xl bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90">
                            <Wand2 className="size-4 mr-1.5" />Generate Content
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="text-[9px] rounded-[999px] bg-green-50 text-green-600 gap-1">
                              <Zap className="size-2.5" />Generated Locally — No API Key
                            </Badge>
                          </div>
                          <div className="rounded-xl bg-[var(--saptta-bg-2)] p-4 max-h-[400px] overflow-y-auto">
                            <pre className="text-xs text-[var(--saptta-ink)] whitespace-pre-wrap font-sans leading-relaxed">{generatedContent}</pre>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" className="rounded-xl text-xs" onClick={() => setShowGeneratedContent(false)}>
                              <RefreshCw className="size-3 mr-1" />Regenerate
                            </Button>
                            <Button variant="outline" className="rounded-xl text-xs" onClick={() => handleCopy(generatedContent, "gen-content")}>
                              {copied === "gen-content" ? <Check className="size-3 mr-1 text-green-500" /> : <Copy className="size-3 mr-1" />}
                              {copied === "gen-content" ? "Copied!" : "Copy"}
                            </Button>
                            <Button variant="outline" className="rounded-xl text-xs">
                              <PenTool className="size-3 mr-1" />Edit
                            </Button>
                            <Button className="rounded-xl bg-[var(--saptta-accent)] text-white text-xs hover:bg-[var(--saptta-accent)]/90 ml-auto">
                              <FileDown className="size-3 mr-1" />Export
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-[var(--saptta-line)] rounded-[24px] h-full flex items-center justify-center min-h-[400px]">
                    <CardContent className="text-center p-8">
                      <div className="flex size-16 items-center justify-center rounded-2xl bg-[var(--saptta-accent)]/10 mx-auto mb-4">
                        <Wand2 className="size-8 text-[var(--saptta-accent)]" />
                      </div>
                      <p className="text-sm font-semibold text-[var(--saptta-ink)]">Select a Template</p>
                      <p className="text-xs text-[var(--saptta-mute)] mt-1">Choose a content template from the left to start generating</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ═══════════ NL ANALYTICS TAB ═══════════ */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Query Input */}
            <Card className="border-[var(--saptta-line)] rounded-[24px]">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-[var(--saptta-ink)] mb-3 flex items-center gap-2">
                  <BarChart3 className="size-4 text-[var(--saptta-accent)]" />
                  Natural Language Analytics
                </h3>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--saptta-mute)]" />
                    <input
                      type="text"
                      value={nlQuery}
                      onChange={(e) => setNlQuery(e.target.value)}
                      placeholder='e.g., "Show me attrition by department for last quarter"'
                      className="w-full h-11 rounded-xl border border-[var(--saptta-line)] bg-[var(--saptta-bg-2)] pl-10 pr-4 text-sm text-[var(--saptta-ink)] placeholder:text-[var(--saptta-mute)] focus:outline-none focus:ring-2 focus:ring-[var(--saptta-accent)]/20 focus:border-[var(--saptta-accent)]/30"
                    />
                  </div>
                  <Button
                    onClick={() => setShowNlResult(true)}
                    className="rounded-xl bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90 h-11"
                  >
                    <Sparkles className="size-4 mr-1.5" />Analyze
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {nlQueryExamples.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setNlQuery(ex)}
                      className="saptta-tag hover:bg-[var(--saptta-accent)]/10 hover:text-[var(--saptta-accent)] transition-colors cursor-pointer text-[10px]"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {showNlResult && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 0.8, 0.22, 1] }} className="space-y-4">
                {/* Query Interpretation */}
                <Card className="border-[var(--saptta-line)] rounded-[24px]">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-purple-50 shrink-0">
                        <Bot className="size-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--saptta-ink)]">Query Interpretation</p>
                        <p className="text-xs text-[var(--saptta-ink-2)] mt-0.5">{nlQueryResult.interpretation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Chart Result */}
                <Card className="border-[var(--saptta-line)] rounded-[24px]">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Attrition by Department — Q4 2025</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-7">
                          <FileDown className="size-3 mr-1" />Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={nlQueryResult.data} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--saptta-line)" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11, fill: "var(--saptta-mute)" }} axisLine={false} tickLine={false} domain={[0, 15]} />
                          <YAxis type="category" dataKey="department" tick={{ fontSize: 11, fill: "var(--saptta-ink-2)" }} axisLine={false} tickLine={false} width={90} />
                          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--saptta-line)", fontSize: 12 }} formatter={(value: number) => [`${value}%`, "Attrition Rate"]} />
                          <Bar dataKey="attrition" fill="#ff6a2c" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Insights */}
                <Card className="border-[var(--saptta-line)] rounded-[24px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)] flex items-center gap-2">
                      <Sparkles className="size-4 text-[var(--saptta-accent)]" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {nlQueryResult.insights.map((insight, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-lg bg-[var(--saptta-bg-2)] px-3 py-2.5">
                          <div className="flex size-5 items-center justify-center rounded-full bg-[var(--saptta-accent)]/10 shrink-0 mt-0.5">
                            <span className="text-[9px] font-bold text-[var(--saptta-accent)]">{i + 1}</span>
                          </div>
                          <p className="text-xs text-[var(--saptta-ink-2)] leading-relaxed">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Follow-up suggestions */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-[var(--saptta-mute)]">Follow up:</span>
                  {nlQueryResult.followUps.map((fu, i) => (
                    <button
                      key={i}
                      onClick={() => { setNlQuery(fu); setShowNlResult(false); }}
                      className="saptta-tag hover:bg-[var(--saptta-accent)]/10 hover:text-[var(--saptta-accent)] transition-colors cursor-pointer text-[10px] gap-1"
                    >
                      <ArrowRight className="size-2.5" />{fu}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Query History */}
            <Card className="border-[var(--saptta-line)] rounded-[24px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)] flex items-center gap-2">
                  <History className="size-4 text-[var(--saptta-mute)]" />Query History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {queryHistory.map((q, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[var(--saptta-bg-2)] transition-colors cursor-pointer"
                      onClick={() => { setNlQuery(q.query); setShowNlResult(false); }}
                    >
                      <div className="flex size-7 items-center justify-center rounded-lg bg-[var(--saptta-accent)]/10 shrink-0">
                        {q.type === "bar" ? <BarChart3 className="size-3.5 text-[var(--saptta-accent)]" /> :
                         q.type === "line" ? <TrendingUp className="size-3.5 text-[var(--saptta-accent)]" /> :
                         <PieChartIcon className="size-3.5 text-[var(--saptta-accent)]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--saptta-ink)] truncate">{q.query}</p>
                        <p className="text-[9px] text-[var(--saptta-mute)]">{q.date} · {q.type} chart</p>
                      </div>
                      <ChevronRight className="size-3.5 text-[var(--saptta-mute)] shrink-0" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
