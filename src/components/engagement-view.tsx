"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Heart, MessageSquare, PartyPopper, Trophy, Star,
  Award, Zap, Target, TrendingUp, Plus, Send, Pin, Eye,
  Bell, Filter, Search, CalendarDays, Clock, Users, Flame,
  Brain, Footprints, Apple, Dumbbell, ChevronRight, ThumbsUp,
  Crown, Medal, Gift, Megaphone, BookOpen, Phone, Mail,
  CheckCircle2, ArrowUpRight, ArrowDownRight, CircleDot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 0.8, 0.22, 1] } },
};

// ─── PULSE SURVEY DATA ───
const activeSurvey = {
  name: "Q1 2026 Employee Pulse Survey",
  startDate: "Mar 01, 2026",
  endDate: "Mar 15, 2026",
  participationRate: 72,
  totalEmployees: 892,
  responded: 642,
  questions: [
    { id: 1, text: "I feel valued and recognized for my contributions", responses: { "Strongly Agree": 38, "Agree": 32, "Neutral": 18, "Disagree": 8, "Strongly Disagree": 4 } },
    { id: 2, text: "My manager provides regular and constructive feedback", responses: { "Strongly Agree": 28, "Agree": 35, "Neutral": 22, "Disagree": 10, "Strongly Disagree": 5 } },
    { id: 3, text: "I have the resources and tools I need to do my job well", responses: { "Strongly Agree": 42, "Agree": 30, "Neutral": 15, "Disagree": 8, "Strongly Disagree": 5 } },
    { id: 4, text: "I feel connected to my team and colleagues", responses: { "Strongly Agree": 33, "Agree": 36, "Neutral": 17, "Disagree": 9, "Strongly Disagree": 5 } },
    { id: 5, text: "The company communicates openly about important changes", responses: { "Strongly Agree": 25, "Agree": 30, "Neutral": 25, "Disagree": 12, "Strongly Disagree": 8 } },
  ],
};

const surveyTrendData = [
  { quarter: "Q1'25", score: 7.2, participation: 68 },
  { quarter: "Q2'25", score: 7.5, participation: 72 },
  { quarter: "Q3'25", score: 7.8, participation: 75 },
  { quarter: "Q4'25", score: 8.1, participation: 78 },
  { quarter: "Q1'26", score: 8.4, participation: 72 },
];

const responseColors: Record<string, string> = {
  "Strongly Agree": "#22c55e",
  "Agree": "#86efac",
  "Neutral": "#fbbf24",
  "Disagree": "#fb923c",
  "Strongly Disagree": "#ef4444",
};

// ─── RECOGNITION DATA ───
const recognitionFeed = [
  { id: "r1", from: "Ananya S.", fromInit: "AS", to: "Rahul K.", toInit: "RK", message: "Great job on the product launch! Your attention to detail made all the difference.", type: "Kudos", badge: "🌟", timestamp: "2 hours ago", likes: 12 },
  { id: "r2", from: "Priya V.", fromInit: "PV", to: "Engineering Team", toInit: "ET", message: "Outstanding sprint delivery — 0 bugs in production for 3 consecutive releases!", type: "Team Award", badge: "🏆", timestamp: "5 hours ago", likes: 24 },
  { id: "r3", from: "Vikram P.", fromInit: "VP", to: "Kavya N.", toInit: "KN", message: "Thanks for the data insights on Q1 — they directly influenced our strategy pivot.", type: "Kudos", badge: "🌟", timestamp: "1 day ago", likes: 8 },
  { id: "r4", from: "Meera J.", fromInit: "MJ", to: "Sanjay K.", toInit: "SK", message: "Living our value of 'Customer First' — resolved a critical client issue at midnight!", type: "Values Champion", badge: "💎", timestamp: "1 day ago", likes: 31 },
  { id: "r5", from: "HR Team", fromInit: "HR", to: "Arjun Reddy", toInit: "AR", message: "Consistently exceeding performance targets for 4 quarters in a row.", type: "Star Performer", badge: "⭐", timestamp: "3 days ago", likes: 45 },
  { id: "r6", from: "Divya S.", fromInit: "DS", to: "Nisha P.", toInit: "NP", message: "Your marketing campaign brought in 200+ qualified leads this month!", type: "Kudos", badge: "🌟", timestamp: "4 days ago", likes: 18 },
];

const leaderboard = [
  { rank: 1, name: "Arjun Reddy", init: "AR", dept: "Analytics", recognitions: 28, points: 340, trend: "up" },
  { rank: 2, name: "Kavya Nair", init: "KN", dept: "Engineering", recognitions: 24, points: 310, trend: "up" },
  { rank: 3, name: "Sanjay Kumar", init: "SK", dept: "Product", recognitions: 22, points: 285, trend: "same" },
  { rank: 4, name: "Priya Verma", init: "PV", dept: "Engineering", recognitions: 19, points: 260, trend: "down" },
  { rank: 5, name: "Rahul Mehta", init: "RM", dept: "Sales", recognitions: 17, points: 230, trend: "up" },
];

const awardTypes = [
  { type: "Kudos", icon: "🌟", color: "var(--saptta-accent)", description: "Quick peer-to-peer appreciation" },
  { type: "Star Performer", icon: "⭐", color: "#f59e0b", description: "Outstanding individual achievement" },
  { type: "Team Award", icon: "🏆", color: "var(--saptta-accent-2)", description: "Exceptional team collaboration" },
  { type: "Values Champion", icon: "💎", color: "#8b5cf6", description: "Living company values" },
];

// ─── ANNOUNCEMENTS DATA ───
const announcements = [
  {
    id: "a1", title: "Q1 Town Hall — Strategy & Vision 2026", content: "Join us for the quarterly town hall where leadership will share the company's strategic direction for 2026. All employees are encouraged to attend and participate in the Q&A session.",
    author: "Priya Sharma", authorInit: "PS", date: "Mar 15, 2026", pinned: true, category: "Company", readBy: 756, totalEmployees: 892,
  },
  {
    id: "a2", title: "New Health Insurance Provider — Effective April 1", content: "We are transitioning to a new health insurance provider with enhanced coverage including dental, vision, and mental health benefits. Please review the updated policy document in the HR portal.",
    author: "HR Team", authorInit: "HR", date: "Mar 12, 2026", pinned: true, category: "Benefits", readBy: 620, totalEmployees: 892,
  },
  {
    id: "a3", title: "Office Closure — Holi Festival", content: "The office will be closed on March 14th for Holi. Wishing everyone a colorful and joyous celebration!",
    author: "Admin Team", authorInit: "AD", date: "Mar 10, 2026", pinned: false, category: "Holiday", readBy: 880, totalEmployees: 892,
  },
  {
    id: "a4", title: "Hackathon 2026 — Register Now!", content: "Our annual hackathon is back! Form teams of 3-5 and register by March 20. Prizes worth ₹5 lakhs to be won. Innovation awaits!",
    author: "Engineering", authorInit: "EN", date: "Mar 08, 2026", pinned: false, category: "Events", readBy: 430, totalEmployees: 892,
  },
  {
    id: "a5", title: "Updated Remote Work Policy", content: "Effective April 1, employees can work remotely up to 3 days per week with manager approval. Please review the detailed guidelines on the HR portal.",
    author: "HR Team", authorInit: "HR", date: "Mar 05, 2026", pinned: false, category: "Policy", readBy: 510, totalEmployees: 892,
  },
];

// ─── WELLNESS DATA ───
const wellnessScore = {
  overall: 78,
  physical: 82,
  mental: 74,
  social: 79,
  financial: 76,
};

const activityData = [
  { day: "Mon", steps: 8200, meditation: 15, water: 6, sleep: 7.2 },
  { day: "Tue", steps: 6500, meditation: 10, water: 7, sleep: 6.8 },
  { day: "Wed", steps: 9800, meditation: 20, water: 8, sleep: 7.5 },
  { day: "Thu", steps: 7300, meditation: 15, water: 5, sleep: 7.0 },
  { day: "Fri", steps: 11000, meditation: 25, water: 8, sleep: 7.8 },
  { day: "Sat", steps: 5200, meditation: 30, water: 6, sleep: 8.5 },
  { day: "Sun", steps: 3400, meditation: 20, water: 5, sleep: 9.0 },
];

const wellnessChallenges = [
  { name: "10K Steps Daily", participants: 234, duration: "30 days", progress: 65, leader: "Arjun Reddy", icon: Footprints, color: "var(--saptta-accent)" },
  { name: "Mindful Minutes", participants: 156, duration: "21 days", progress: 42, leader: "Kavya Nair", icon: Brain, color: "#8b5cf6" },
  { name: "Hydration Hero", participants: 312, duration: "14 days", progress: 78, leader: "Priya Verma", icon: Apple, color: "#22c55e" },
  { name: "Fitness First", participants: 189, duration: "28 days", progress: 55, leader: "Rahul Mehta", icon: Dumbbell, color: "#f59e0b" },
];

const eapResources = [
  { title: "Confidential Counseling", description: "24/7 access to licensed counselors for personal or work-related concerns", icon: Phone, contact: "1-800-KAM" },
  { title: "Stress Management Workshop", description: "Monthly virtual sessions on coping strategies and resilience building", icon: Brain, contact: "Register on portal" },
  { title: "Financial Wellness Program", description: "Free financial planning consultations and budgeting workshops", icon: Target, contact: "finance-wellness@kamglobal.io" },
  { title: "Work-Life Balance Guide", description: "Resources and tips for maintaining healthy boundaries", icon: BookOpen, contact: "Available on intranet" },
];

export function EngagementView() {
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [showCreateSurvey, setShowCreateSurvey] = useState(false);
  const [showCreateRecognition, setShowCreateRecognition] = useState(false);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [announcementFilter, setAnnouncementFilter] = useState("All");

  const filteredAnnouncements = announcementFilter === "All"
    ? announcements
    : announcements.filter(a => a.category === announcementFilter);

  const participationData = [
    { name: "Responded", value: activeSurvey.responded, color: "var(--saptta-accent)" },
    { name: "Pending", value: activeSurvey.totalEmployees - activeSurvey.responded, color: "#e8e8e8" },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--saptta-ink)] tracking-tight">Engagement</h1>
        <p className="text-[var(--saptta-mute)] mt-1 text-sm">Measure, understand, and improve employee engagement and culture.</p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs defaultValue="pulse" className="space-y-6">
          <TabsList className="bg-[var(--saptta-bg-2)] rounded-[999px] p-1 h-auto">
            <TabsTrigger value="pulse" className="rounded-[999px] px-5 py-2 text-xs data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white data-[state=active]:shadow-sm">
              <BarChart3 className="size-3.5 mr-1.5" />Pulse Surveys
            </TabsTrigger>
            <TabsTrigger value="recognition" className="rounded-[999px] px-5 py-2 text-xs data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white data-[state=active]:shadow-sm">
              <Trophy className="size-3.5 mr-1.5" />Recognition
            </TabsTrigger>
            <TabsTrigger value="announcements" className="rounded-[999px] px-5 py-2 text-xs data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white data-[state=active]:shadow-sm">
              <Megaphone className="size-3.5 mr-1.5" />Announcements
            </TabsTrigger>
            <TabsTrigger value="wellness" className="rounded-[999px] px-5 py-2 text-xs data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white data-[state=active]:shadow-sm">
              <Heart className="size-3.5 mr-1.5" />Wellness
            </TabsTrigger>
          </TabsList>

          {/* ═══════════ PULSE SURVEYS TAB ═══════════ */}
          <TabsContent value="pulse" className="space-y-6">
            {/* Active Survey + Participation Ring */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2 border-[var(--saptta-line)] rounded-[24px]">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">{activeSurvey.name}</CardTitle>
                    <Badge className="bg-green-50 text-green-600 border border-green-200 text-[10px] rounded-[999px]">Active</Badge>
                  </div>
                  <p className="text-xs text-[var(--saptta-mute)]">{activeSurvey.startDate} — {activeSurvey.endDate}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeSurvey.questions.map((q, i) => (
                    <div
                      key={q.id}
                      className={`rounded-xl p-3 cursor-pointer transition-all border ${
                        selectedQuestion === i
                          ? "border-[var(--saptta-accent)]/30 bg-[var(--saptta-accent)]/5"
                          : "border-transparent hover:bg-[var(--saptta-bg-2)]"
                      }`}
                      onClick={() => setSelectedQuestion(i)}
                    >
                      <p className="text-xs font-medium text-[var(--saptta-ink)] mb-2">Q{i + 1}: {q.text}</p>
                      {selectedQuestion === i && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
                          {Object.entries(q.responses).map(([key, val]) => (
                            <div key={key} className="flex items-center gap-2">
                              <span className="text-[10px] text-[var(--saptta-mute)] w-24 shrink-0">{key}</span>
                              <div className="flex-1 h-2 rounded-full bg-[var(--saptta-bg-2)] overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: responseColors[key] }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${val}%` }}
                                  transition={{ duration: 0.6, ease: [0.22, 0.8, 0.22, 1] }}
                                />
                              </div>
                              <span className="text-[10px] font-medium text-[var(--saptta-ink)] w-8 text-right">{val}%</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Participation Rate */}
              <div className="space-y-4">
                <Card className="border-[var(--saptta-line)] rounded-[24px]">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-32 h-32 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={participationData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={55} strokeWidth={0}>
                            {participationData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div>
                          <p className="text-2xl font-bold text-[var(--saptta-ink)]">{activeSurvey.participationRate}%</p>
                          <p className="text-[9px] text-[var(--saptta-mute)]">Participation</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--saptta-mute)] mt-2">{activeSurvey.responded} of {activeSurvey.totalEmployees} responded</p>
                    <Button size="sm" onClick={() => toast.success("Reminder sent to all pending respondents!")} className="mt-3 rounded-xl bg-[var(--saptta-accent)] text-white text-xs h-8 hover:bg-[var(--saptta-accent)]/90">
                      <Send className="size-3 mr-1" />Send Reminder
                    </Button>
                  </CardContent>
                </Card>

                <Dialog open={showCreateSurvey} onOpenChange={setShowCreateSurvey}>
                  <DialogTrigger asChild>
                    <Button className="w-full rounded-[20px] bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] hover:bg-[var(--saptta-accent)]/20 text-xs h-12 border border-dashed border-[var(--saptta-accent)]/30">
                      <Plus className="size-4 mr-1.5" />Create New Survey
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-[24px]">
                    <DialogHeader>
                      <DialogTitle>Create Pulse Survey</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input placeholder="Survey name" className="rounded-xl" />
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Start date" className="rounded-xl" />
                        <Input placeholder="End date" className="rounded-xl" />
                      </div>
                      <Textarea placeholder="Add survey questions (one per line)" className="rounded-xl min-h-[120px]" />
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-[999px] text-[10px] cursor-pointer hover:bg-[var(--saptta-accent)]/10">All Employees</Badge>
                        <Badge variant="outline" className="rounded-[999px] text-[10px] cursor-pointer hover:bg-[var(--saptta-accent)]/10">Engineering</Badge>
                        <Badge variant="outline" className="rounded-[999px] text-[10px] cursor-pointer hover:bg-[var(--saptta-accent)]/10">+ Add Group</Badge>
                      </div>
                      <Button className="w-full rounded-xl bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90" onClick={() => { setShowCreateSurvey(false); toast.success("Survey created and sent to employees!"); }}>Create & Send</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Survey Trend */}
            <Card className="border-[var(--saptta-line)] rounded-[24px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Survey Score Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={surveyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--saptta-line)" />
                      <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: "var(--saptta-mute)" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[6, 9]} tick={{ fontSize: 11, fill: "var(--saptta-mute)" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid var(--saptta-line)", fontSize: 12 }}
                        formatter={(value: number, name: string) => [name === "score" ? `${value}/10` : `${value}%`, name === "score" ? "Engagement Score" : "Participation"]}
                      />
                      <Line type="monotone" dataKey="score" stroke="var(--saptta-accent)" strokeWidth={2.5} dot={{ fill: "var(--saptta-accent)", strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="participation" stroke="var(--saptta-accent-2)" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "var(--saptta-accent-2)", strokeWidth: 0, r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 justify-center mt-2">
                  <div className="flex items-center gap-1.5"><div className="size-3 rounded bg-[var(--saptta-accent)]" /><span className="text-xs text-[var(--saptta-mute)]">Engagement Score</span></div>
                  <div className="flex items-center gap-1.5"><div className="size-3 rounded bg-[var(--saptta-accent-2)]" /><span className="text-xs text-[var(--saptta-mute)]">Participation %</span></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════ RECOGNITION TAB ═══════════ */}
          <TabsContent value="recognition" className="space-y-6">
            {/* Award Types */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {awardTypes.map((award) => (
                <Card key={award.type} className="border-[var(--saptta-line)] rounded-[20px] cursor-pointer hover:border-[var(--saptta-accent)]/30 transition-colors">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-1">{award.icon}</div>
                    <p className="text-xs font-semibold text-[var(--saptta-ink)]">{award.type}</p>
                    <p className="text-[9px] text-[var(--saptta-mute)] mt-0.5">{award.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Recognition Feed */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--saptta-ink)]">Recognition Feed</h3>
                  <Dialog open={showCreateRecognition} onOpenChange={setShowCreateRecognition}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="rounded-xl bg-[var(--saptta-accent)] text-white text-xs h-8 hover:bg-[var(--saptta-accent)]/90">
                        <Plus className="size-3 mr-1" />Give Recognition
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[24px]">
                      <DialogHeader>
                        <DialogTitle>Give Recognition</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-2">
                          {awardTypes.map((award) => (
                            <button key={award.type} className="rounded-xl border border-[var(--saptta-line)] p-2 text-center hover:border-[var(--saptta-accent)]/30 transition-colors">
                              <div className="text-lg">{award.icon}</div>
                              <p className="text-[9px] text-[var(--saptta-mute)] mt-0.5">{award.type}</p>
                            </button>
                          ))}
                        </div>
                        <Input placeholder="Search employee..." className="rounded-xl" />
                        <Textarea placeholder="Write your recognition message..." className="rounded-xl min-h-[80px]" />
                        <Button className="w-full rounded-xl bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90" onClick={() => { setShowCreateRecognition(false); toast.success("Recognition sent successfully!"); }}>
                          <Award className="size-4 mr-1.5" />Send Recognition
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {recognitionFeed.map((rec) => (
                    <motion.div key={rec.id} variants={fadeUp}>
                      <Card className="border-[var(--saptta-line)] rounded-[20px]">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="text-xl shrink-0 mt-0.5">{rec.badge}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <Avatar className="size-5 rounded-md">
                                    <AvatarFallback className="rounded-md bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] text-[8px] font-semibold">{rec.fromInit}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs font-medium text-[var(--saptta-ink)]">{rec.from}</span>
                                </div>
                                <ArrowUpRight className="size-3 text-[var(--saptta-mute)]" />
                                <div className="flex items-center gap-1.5">
                                  <Avatar className="size-5 rounded-md">
                                    <AvatarFallback className="rounded-md bg-[var(--saptta-accent-2)]/20 text-[#6b7a2e] text-[8px] font-semibold">{rec.toInit}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs font-medium text-[var(--saptta-ink)]">{rec.to}</span>
                                </div>
                                <Badge variant="outline" className="text-[9px] rounded-[999px] ml-auto">{rec.type}</Badge>
                              </div>
                              <p className="text-xs text-[var(--saptta-ink-2)] mt-1.5 leading-relaxed">{rec.message}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <button className="flex items-center gap-1 text-[10px] text-[var(--saptta-mute)] hover:text-[var(--saptta-accent)] transition-colors">
                                  <ThumbsUp className="size-3" />{rec.likes}
                                </button>
                                <span className="text-[10px] text-[var(--saptta-mute)]">{rec.timestamp}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <Card className="border-[var(--saptta-line)] rounded-[24px] h-fit">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-[var(--saptta-ink)] flex items-center gap-2">
                    <Crown className="size-4 text-amber-500" />
                    Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {leaderboard.map((person) => (
                    <div key={person.rank} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[var(--saptta-bg-2)] transition-colors">
                      <div className={`flex size-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                        person.rank === 1 ? "bg-amber-100 text-amber-700" :
                        person.rank === 2 ? "bg-gray-100 text-gray-600" :
                        person.rank === 3 ? "bg-orange-100 text-orange-700" :
                        "bg-[var(--saptta-bg-2)] text-[var(--saptta-mute)]"
                      }`}>
                        {person.rank}
                      </div>
                      <Avatar className="size-7 rounded-lg shrink-0">
                        <AvatarFallback className="rounded-lg bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] text-[10px] font-semibold">{person.init}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--saptta-ink)] truncate">{person.name}</p>
                        <p className="text-[9px] text-[var(--saptta-mute)]">{person.dept}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-[var(--saptta-accent)]">{person.points}</p>
                        <p className="text-[9px] text-[var(--saptta-mute)]">{person.recognitions} rec</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════ ANNOUNCEMENTS TAB ═══════════ */}
          <TabsContent value="announcements" className="space-y-6">
            {/* Filters + Create */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {["All", "Company", "Benefits", "Holiday", "Events", "Policy"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAnnouncementFilter(cat)}
                    className={`px-3 py-1.5 rounded-[999px] text-[10px] font-medium transition-colors ${
                      announcementFilter === cat
                        ? "bg-[var(--saptta-accent)] text-white"
                        : "bg-[var(--saptta-bg-2)] text-[var(--saptta-mute)] hover:bg-[var(--saptta-accent)]/10 hover:text-[var(--saptta-accent)]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <Dialog open={showCreateAnnouncement} onOpenChange={setShowCreateAnnouncement}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-xl bg-[var(--saptta-accent)] text-white text-xs h-8 hover:bg-[var(--saptta-accent)]/90">
                    <Plus className="size-3 mr-1" />New Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[24px]">
                  <DialogHeader>
                    <DialogTitle>Create Announcement</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input placeholder="Announcement title" className="rounded-xl" />
                    <Textarea placeholder="Announcement content..." className="rounded-xl min-h-[120px]" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--saptta-mute)]">Target:</span>
                      <Badge variant="outline" className="rounded-[999px] text-[10px] cursor-pointer">All Employees</Badge>
                      <Badge variant="outline" className="rounded-[999px] text-[10px] cursor-pointer">Engineering</Badge>
                      <Badge variant="outline" className="rounded-[999px] text-[10px] cursor-pointer">+ More</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="pin-ann" className="rounded" />
                      <label htmlFor="pin-ann" className="text-xs text-[var(--saptta-ink-2)]">Pin this announcement</label>
                    </div>
                    <Button className="w-full rounded-xl bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90" onClick={() => { setShowCreateAnnouncement(false); toast.success("Announcement published to all employees!"); }}>Publish</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Announcement Cards */}
            <div className="space-y-3">
              {filteredAnnouncements.map((ann) => (
                <motion.div key={ann.id} variants={fadeUp}>
                  <Card className={`border rounded-[20px] transition-all ${
                    ann.pinned ? "border-[var(--saptta-accent)]/20 bg-[var(--saptta-accent)]/[0.02]" : "border-[var(--saptta-line)]"
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="size-9 rounded-xl shrink-0 mt-0.5">
                          <AvatarFallback className="rounded-xl bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] text-xs font-semibold">{ann.authorInit}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-[var(--saptta-ink)]">{ann.title}</p>
                            {ann.pinned && (
                              <Badge className="bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] border-0 text-[9px] rounded-[999px]">
                                <Pin className="size-2.5 mr-0.5" />Pinned
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[9px] rounded-[999px] ml-auto">{ann.category}</Badge>
                          </div>
                          <p className="text-xs text-[var(--saptta-ink-2)] mt-1 leading-relaxed line-clamp-2">{ann.content}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-[10px] text-[var(--saptta-mute)]">by {ann.author}</span>
                            <span className="text-[10px] text-[var(--saptta-mute)]">{ann.date}</span>
                            <div className="flex items-center gap-1 ml-auto">
                              <Eye className="size-3 text-[var(--saptta-mute)]" />
                              <span className="text-[10px] text-[var(--saptta-mute)]">{Math.round((ann.readBy / ann.totalEmployees) * 100)}% read</span>
                            </div>
                          </div>
                          {/* Read Progress */}
                          <div className="mt-2 h-1 rounded-full bg-[var(--saptta-bg-2)] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[var(--saptta-accent)]"
                              style={{ width: `${(ann.readBy / ann.totalEmployees) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ═══════════ WELLNESS TAB ═══════════ */}
          <TabsContent value="wellness" className="space-y-6">
            {/* Wellness Score + Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Wellness Score Card */}
              <Card className="border-[var(--saptta-line)] rounded-[24px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-[var(--saptta-ink)] flex items-center gap-2">
                    <Heart className="size-4 text-[var(--saptta-accent)]" />
                    Wellness Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mx-auto w-28 h-28 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Score", value: wellnessScore.overall, color: "var(--saptta-accent)" },
                            { name: "Gap", value: 100 - wellnessScore.overall, color: "#e8e8e8" },
                          ]}
                          dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={48} strokeWidth={0}
                        >
                          <Cell fill="var(--saptta-accent)" />
                          <Cell fill="#e8e8e8" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div>
                        <p className="text-2xl font-bold text-[var(--saptta-ink)]">{wellnessScore.overall}</p>
                        <p className="text-[8px] text-[var(--saptta-mute)]">/ 100</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-left">
                    {[
                      { label: "Physical", value: wellnessScore.physical, color: "#22c55e" },
                      { label: "Mental", value: wellnessScore.mental, color: "#8b5cf6" },
                      { label: "Social", value: wellnessScore.social, color: "var(--saptta-accent)" },
                      { label: "Financial", value: wellnessScore.financial, color: "#f59e0b" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-lg bg-[var(--saptta-bg-2)] px-2.5 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-[var(--saptta-mute)]">{item.label}</span>
                          <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}</span>
                        </div>
                        <div className="mt-1 h-1 rounded-full bg-white overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Tracker */}
              <Card className="lg:col-span-2 border-[var(--saptta-line)] rounded-[24px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-[var(--saptta-ink)]">Activity Tracker — This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--saptta-line)" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--saptta-mute)" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "var(--saptta-mute)" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--saptta-line)", fontSize: 12 }} />
                        <Bar dataKey="steps" fill="var(--saptta-accent)" radius={[6, 6, 0, 0]} name="Steps" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {[
                      { label: "Avg Steps", value: "7,343", icon: Footprints, color: "var(--saptta-accent)" },
                      { label: "Meditation", value: "19 min/day", icon: Brain, color: "#8b5cf6" },
                      { label: "Water Intake", value: "6.4 glasses", icon: Apple, color: "#22c55e" },
                      { label: "Sleep", value: "7.7 hrs", icon: Moon, color: "#3b82f6" },
                    ].map((metric) => (
                      <div key={metric.label} className="rounded-xl bg-[var(--saptta-bg-2)] px-3 py-2 text-center">
                        <metric.icon className="size-4 mx-auto" style={{ color: metric.color }} />
                        <p className="text-xs font-bold text-[var(--saptta-ink)] mt-1">{metric.value}</p>
                        <p className="text-[9px] text-[var(--saptta-mute)]">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Challenges + EAP */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Wellness Challenges */}
              <Card className="border-[var(--saptta-line)] rounded-[24px]">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)] flex items-center gap-2">
                      <Flame className="size-4 text-[var(--saptta-accent)]" />
                      Wellness Challenges
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => toast.info("Create a new wellness challenge")} className="rounded-lg text-[10px] h-7">
                      <Plus className="size-3 mr-1" />Create
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {wellnessChallenges.map((challenge) => (
                    <div key={challenge.name} className="rounded-xl border border-[var(--saptta-line)] p-3 hover:border-[var(--saptta-accent)]/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${challenge.color}15` }}>
                          <challenge.icon className="size-4" style={{ color: challenge.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[var(--saptta-ink)]">{challenge.name}</p>
                          <p className="text-[9px] text-[var(--saptta-mute)]">{challenge.participants} participants · {challenge.duration} · Leader: {challenge.leader}</p>
                        </div>
                        <span className="text-xs font-bold" style={{ color: challenge.color }}>{challenge.progress}%</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-[var(--saptta-bg-2)] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: challenge.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${challenge.progress}%` }}
                          transition={{ duration: 0.8, ease: [0.22, 0.8, 0.22, 1] }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* EAP Resources */}
              <Card className="border-[var(--saptta-line)] rounded-[24px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-[var(--saptta-ink)] flex items-center gap-2">
                    <Phone className="size-4 text-[var(--saptta-accent)]" />
                    Employee Assistance Program
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {eapResources.map((resource) => (
                    <div key={resource.title} className="rounded-xl bg-[var(--saptta-bg-2)] p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-white shrink-0">
                          <resource.icon className="size-4 text-[var(--saptta-accent)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[var(--saptta-ink)]">{resource.title}</p>
                          <p className="text-[10px] text-[var(--saptta-mute)] mt-0.5 leading-relaxed">{resource.description}</p>
                          <p className="text-[10px] font-medium text-[var(--saptta-accent)] mt-1">{resource.contact}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="rounded-xl bg-[var(--saptta-accent)]/5 border border-[var(--saptta-accent)]/10 p-3 mt-2">
                    <p className="text-[10px] text-[var(--saptta-ink-2)] leading-relaxed">
                      💡 All EAP services are <strong>100% confidential</strong>. No personal information is shared with your employer. Reach out anytime — we&apos;re here for you.
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

function Moon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}