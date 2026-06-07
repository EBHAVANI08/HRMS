"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Users, Building2, FileText,
  Download, Upload, Send, Eye, Check, AlertTriangle, Shield,
  Calculator, CreditCard, Banknote, PiggyBank, Clock, ChevronRight,
  ChevronLeft, Plus, Search, Info, BarChart3, Settings,
  Calendar, Lock, Zap, Briefcase, Wallet, Receipt, IndianRupee,
  AlertCircle, CheckCircle2, RefreshCw, Mail
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip as RechartsTooltip, LineChart, Line
} from "recharts";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 0.8, 0.22, 1] } },
};

const payrollSummary = { totalGross: 12000000, totalNet: 8450000, totalDeductions: 3550000, employeesProcessed: 1247, totalEmployees: 1280 };

const payrollTrend = [
  { month: "Jan", gross: 11200000, net: 7820000, deductions: 3380000 },
  { month: "Feb", gross: 11400000, net: 7950000, deductions: 3450000 },
  { month: "Mar", gross: 11500000, net: 8010000, deductions: 3490000 },
  { month: "Apr", gross: 11650000, net: 8120000, deductions: 3530000 },
  { month: "May", gross: 11800000, net: 8230000, deductions: 3570000 },
  { month: "Jun", gross: 12000000, net: 8450000, deductions: 3550000 },
];

const departmentCost = [
  { dept: "Engineering", cost: 4200000 }, { dept: "Product", cost: 1800000 },
  { dept: "Sales", cost: 2100000 }, { dept: "Marketing", cost: 950000 },
  { dept: "HR", cost: 720000 }, { dept: "Finance", cost: 680000 },
  { dept: "Operations", cost: 1550000 },
];

const recentPayrollRuns = [
  { id: 1, month: "June 2026", status: "Processing", processed: 1247, total: 1280, date: "2026-06-01" },
  { id: 2, month: "May 2026", status: "Locked", processed: 1275, total: 1275, date: "2026-05-01" },
  { id: 3, month: "April 2026", status: "Locked", processed: 1268, total: 1268, date: "2026-04-01" },
  { id: 4, month: "March 2026", status: "Locked", processed: 1260, total: 1260, date: "2026-03-01" },
];

const salaryComponents = {
  earnings: [
    { name: "Basic Salary", type: "percentage", value: 40, of: "CTC", monthly: 33333 },
    { name: "HRA", type: "percentage", value: 50, of: "Basic", monthly: 16667 },
    { name: "DA", type: "percentage", value: 5, of: "Basic", monthly: 1667 },
    { name: "Special Allowance", type: "fixed", value: 0, of: "—", monthly: 25000 },
    { name: "Transport Allowance", type: "fixed", value: 0, of: "—", monthly: 3200 },
    { name: "Medical Allowance", type: "fixed", value: 0, of: "—", monthly: 1250 },
  ],
  deductions: [
    { name: "Provident Fund (PF)", type: "percentage", value: 12, of: "Basic", monthly: 4000 },
    { name: "ESI", type: "percentage", value: 0.75, of: "Gross", monthly: 0 },
    { name: "Professional Tax (PT)", type: "fixed", value: 0, of: "—", monthly: 200 },
    { name: "TDS", type: "computed", value: 0, of: "Taxable", monthly: 8333 },
    { name: "Loss of Pay", type: "variable", value: 0, of: "—", monthly: 0 },
  ],
};

const structureTemplates = [
  { name: "Engineering - Senior", ctc: "₹25L - ₹45L", employees: 85, dept: "Engineering" },
  { name: "Engineering - Junior", ctc: "₹8L - ₹18L", employees: 235, dept: "Engineering" },
  { name: "Sales - Field", ctc: "₹6L - ₹15L + Incentives", employees: 120, dept: "Sales" },
  { name: "Management", ctc: "₹35L - ₹80L", employees: 15, dept: "Leadership" },
  { name: "Operations", ctc: "₹4L - ₹10L", employees: 282, dept: "Operations" },
];

const payslipEmployees = [
  { id: "EMP-001", name: "Aarav Kumar", department: "Engineering", designation: "Senior Developer", netPay: 142500, month: "Jun 2026" },
  { id: "EMP-002", name: "Priya Sharma", department: "Product", designation: "Product Manager", netPay: 168000, month: "Jun 2026" },
  { id: "EMP-003", name: "Rahul Verma", department: "Sales", designation: "Sales Lead", netPay: 95000, month: "Jun 2026" },
  { id: "EMP-004", name: "Anita Desai", department: "HR", designation: "HR Manager", netPay: 125000, month: "Jun 2026" },
  { id: "EMP-005", name: "Vikram Patel", department: "Finance", designation: "Financial Analyst", netPay: 108000, month: "Jun 2026" },
  { id: "EMP-006", name: "Meera Iyer", department: "Marketing", designation: "Marketing Specialist", netPay: 87000, month: "Jun 2026" },
];

const statutoryCompliance = [
  { type: "PF", task: "Monthly ECR Filing", dueDate: "2026-06-15", status: "Pending" as const },
  { type: "ESI", task: "Monthly Return", dueDate: "2026-06-15", status: "Filed" as const },
  { type: "PT", task: "Monthly Return", dueDate: "2026-06-30", status: "Pending" as const },
  { type: "TDS", task: "Form 24Q", dueDate: "2026-06-30", status: "Pending" as const },
  { type: "TDS", task: "Form 16 Generation", dueDate: "2026-06-15", status: "Overdue" as const },
  { type: "PF", task: "Annual Return", dueDate: "2026-04-30", status: "Filed" as const },
];

const activeLoans = [
  { id: 1, employee: "Aarav Kumar", empId: "EMP-001", type: "Personal Loan", amount: 300000, tenure: 24, emi: 13800, outstanding: 220800, paid: 5 },
  { id: 2, employee: "Sneha Patil", empId: "EMP-042", type: "Emergency Loan", amount: 50000, tenure: 12, emi: 4400, outstanding: 26400, paid: 6 },
  { id: 3, employee: "Karan Thakur", empId: "EMP-078", type: "Two-Wheeler Loan", amount: 150000, tenure: 36, emi: 4800, outstanding: 120000, paid: 10 },
  { id: 4, employee: "Diya Singh", empId: "EMP-015", type: "Personal Loan", amount: 200000, tenure: 18, emi: 12200, outstanding: 61000, paid: 11 },
];

const formatCurrency = (val: number) => { if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`; if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`; if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`; return `₹${val.toLocaleString("en-IN")}`; };
const formatINR = (val: number) => `₹${val.toLocaleString("en-IN")}`;

function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[{label:"Total Gross",value:formatCurrency(payrollSummary.totalGross),icon:<IndianRupee className="w-5 h-5" />,color:"var(--saptta-accent)",trend:"+1.7%",trendUp:true},{label:"Total Net",value:formatCurrency(payrollSummary.totalNet),icon:<Wallet className="w-5 h-5" />,color:"#10b981",trend:"+2.1%",trendUp:true},{label:"Total Deductions",value:formatCurrency(payrollSummary.totalDeductions),icon:<TrendingDown className="w-5 h-5" />,color:"#f59e0b",trend:"+0.5%",trendUp:false},{label:"Employees Processed",value:`${payrollSummary.employeesProcessed}/${payrollSummary.totalEmployees}`,icon:<Users className="w-5 h-5" />,color:"#8b5cf6",trend:"97.4%",trendUp:true}].map((card,i)=>(
          <motion.div key={card.label} variants={fadeUp} initial="hidden" animate="show" transition={{delay:i*0.05}}>
            <Card className="rounded-[24px] border-0 shadow-lg payroll-grid-pattern hover:shadow-xl transition-shadow">
              <CardContent className="p-5"><div className="flex items-center justify-between mb-3"><div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{backgroundColor:`${card.color}15`,color:card.color}}>{card.icon}</div><Badge variant="secondary" className={`rounded-full text-xs ${card.trendUp?"text-emerald-600 bg-emerald-50":"text-amber-600 bg-amber-50"}`}>{card.trendUp?<TrendingUp className="w-3 h-3 mr-1" />:<TrendingDown className="w-3 h-3 mr-1" />}{card.trend}</Badge></div><p className="text-2xl font-bold text-[var(--saptta-ink)]">{card.value}</p><p className="text-xs text-[var(--saptta-mute)] mt-1">{card.label}</p></CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeUp} initial="hidden" animate="show"><Card className="rounded-[24px] border-0 shadow-lg"><CardHeader className="pb-2"><CardTitle className="text-lg font-semibold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[var(--saptta-accent)]" />Payroll Cost Trend (6 Months)</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={260}><LineChart data={payrollTrend}><CartesianGrid strokeDasharray="3 3" stroke="var(--saptta-line)" /><XAxis dataKey="month" tick={{fontSize:12}} stroke="var(--saptta-mute)" /><YAxis tick={{fontSize:10}} stroke="var(--saptta-mute)" tickFormatter={(v:number)=>formatCurrency(v)} /><RechartsTooltip formatter={(value:number)=>formatINR(value)} contentStyle={{borderRadius:"16px",border:"1px solid var(--saptta-line)",fontSize:"12px"}} /><Line type="monotone" dataKey="gross" stroke="var(--saptta-accent)" strokeWidth={2.5} dot={{r:4,fill:"var(--saptta-accent)"}} name="Gross" /><Line type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2.5} dot={{r:4,fill:"#10b981"}} name="Net" /><Line type="monotone" dataKey="deductions" stroke="#f59e0b" strokeWidth={2} dot={{r:3,fill:"#f59e0b"}} name="Deductions" /></LineChart></ResponsiveContainer></CardContent></Card></motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show"><Card className="rounded-[24px] border-0 shadow-lg"><CardHeader className="pb-2"><CardTitle className="text-lg font-semibold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[var(--saptta-accent)]" />Department-wise Cost</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={260}><BarChart data={departmentCost} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="var(--saptta-line)" /><XAxis type="number" tick={{fontSize:10}} stroke="var(--saptta-mute)" tickFormatter={(v:number)=>formatCurrency(v)} /><YAxis type="category" dataKey="dept" tick={{fontSize:11}} stroke="var(--saptta-mute)" width={80} /><RechartsTooltip formatter={(value:number)=>formatINR(value)} contentStyle={{borderRadius:"16px",border:"1px solid var(--saptta-line)",fontSize:"12px"}} /><Bar dataKey="cost" fill="var(--saptta-accent)" radius={[0,8,8,0]} barSize={20} name="Cost" /></BarChart></ResponsiveContainer></CardContent></Card></motion.div>
      </div>
      <motion.div variants={fadeUp} initial="hidden" animate="show"><Card className="rounded-[24px] border-0 shadow-lg"><CardHeader className="pb-2"><CardTitle className="text-lg font-semibold flex items-center gap-2"><Clock className="w-5 h-5 text-[var(--saptta-accent)]" />Recent Payroll Runs</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead className="text-xs font-medium">Month</TableHead><TableHead className="text-xs font-medium">Status</TableHead><TableHead className="text-xs font-medium">Processed</TableHead><TableHead className="text-xs font-medium">Date</TableHead><TableHead className="text-xs font-medium">Action</TableHead></TableRow></TableHeader><TableBody>{recentPayrollRuns.map((run)=>(<TableRow key={run.id} className="hover:bg-[var(--saptta-bg-2)]"><TableCell className="font-medium text-sm">{run.month}</TableCell><TableCell><Badge variant="secondary" className={`rounded-full text-xs ${run.status==="Locked"?"bg-emerald-50 text-emerald-600":"bg-amber-50 text-amber-600"}`}>{run.status==="Locked"?<Lock className="w-3 h-3 mr-1" />:<RefreshCw className="w-3 h-3 mr-1 saptta-live-dot" />}{run.status}</Badge></TableCell><TableCell className="text-sm">{run.processed}/{run.total}</TableCell><TableCell className="text-sm text-[var(--saptta-mute)]">{new Date(run.date).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => toast.info("Opening details…")} className="text-xs text-[var(--saptta-accent)] h-7"><Eye className="w-3 h-3 mr-1" />View</Button></TableCell></TableRow>))}</TableBody></Table></CardContent></Card></motion.div>
    </div>
  );
}

function SalaryStructuresTab() {
  const [ctcInput, setCtcInput] = useState("1000000");
  const ctc = parseInt(ctcInput) || 0;
  const basic = ctc * 0.4;
  const hra = basic * 0.5;
  const da = basic * 0.05;
  const pf = basic * 0.12;
  const pt = 2400;
  const tds = Math.max(0, (ctc - 250000 - basic * 0.12 - hra * 0.5) * 0.1);
  const monthlyGross = ctc / 12;
  const monthlyDeductions = (pf + pt + tds) / 12;
  const monthlyNet = monthlyGross - monthlyDeductions;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeUp} initial="hidden" animate="show"><Card className="rounded-[24px] border-0 shadow-lg"><CardHeader className="pb-2"><CardTitle className="text-lg font-semibold flex items-center gap-2"><Settings className="w-5 h-5 text-[var(--saptta-accent)]" />Salary Component Builder</CardTitle></CardHeader><CardContent>
          <div className="mb-6 p-4 rounded-2xl bg-[var(--saptta-bg-2)]"><Label className="text-sm font-medium">CTC (Annual)</Label><div className="flex items-center gap-2 mt-1"><span className="text-lg font-bold text-[var(--saptta-mute)]">₹</span><Input type="text" value={ctcInput} onChange={(e)=>setCtcInput(e.target.value.replace(/[^0-9]/g,""))} className="rounded-xl text-lg font-bold" /></div><p className="text-xs text-[var(--saptta-mute)] mt-1">Monthly Gross: {formatINR(Math.round(monthlyGross))}</p></div>
          <div className="mb-4"><h4 className="text-sm font-semibold text-emerald-600 mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4" />Earnings</h4><div className="space-y-2">{salaryComponents.earnings.map((comp)=>(<div key={comp.name} className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 transition-colors"><div><p className="text-sm font-medium">{comp.name}</p><p className="text-[10px] text-[var(--saptta-mute)]">{comp.type==="percentage"?`${comp.value}% of ${comp.of}`:comp.type==="fixed"?"Fixed":"Computed"}</p></div><span className="text-sm font-semibold text-emerald-700">{formatINR(comp.monthly)}</span></div>))}<Separator className="my-2" /><div className="flex items-center justify-between px-2.5"><span className="text-sm font-semibold">Total Earnings</span><span className="text-sm font-bold text-emerald-700">{formatINR(Math.round(monthlyGross))}</span></div></div></div>
          <div><h4 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-2"><TrendingDown className="w-4 h-4" />Deductions</h4><div className="space-y-2">{salaryComponents.deductions.map((comp)=>(<div key={comp.name} className="flex items-center justify-between p-2.5 rounded-xl bg-red-50/50 hover:bg-red-50 transition-colors"><div><p className="text-sm font-medium">{comp.name}</p><p className="text-[10px] text-[var(--saptta-mute)]">{comp.type==="percentage"?`${comp.value}% of ${comp.of}`:comp.type==="fixed"?"Fixed":comp.type==="computed"?"Computed":"Variable"}</p></div><span className="text-sm font-semibold text-red-700">{comp.monthly>0?formatINR(comp.monthly):"—"}</span></div>))}<Separator className="my-2" /><div className="flex items-center justify-between px-2.5"><span className="text-sm font-semibold">Total Deductions</span><span className="text-sm font-bold text-red-700">{formatINR(Math.round(monthlyDeductions))}</span></div></div></div>
          <div className="mt-4 p-4 rounded-2xl bg-[var(--saptta-accent)]/5 border border-[var(--saptta-accent)]/20"><div className="flex items-center justify-between"><span className="text-base font-bold">Monthly Net Pay</span><span className="text-xl font-bold text-[var(--saptta-accent)]">{formatINR(Math.round(monthlyNet))}</span></div></div>
        </CardContent></Card></motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show"><Card className="rounded-[24px] border-0 shadow-lg h-full"><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-lg font-semibold flex items-center gap-2"><Briefcase className="w-5 h-5 text-[var(--saptta-accent)]" />Structure Templates</CardTitle><Button size="sm" onClick={() => toast.info("Create new salary structure template")} className="rounded-full text-xs bg-[var(--saptta-accent)] hover:bg-[var(--saptta-accent)]/90 text-white"><Plus className="w-3.5 h-3.5 mr-1" />New Template</Button></div></CardHeader><CardContent><div className="space-y-3">{structureTemplates.map((tpl)=>(<div key={tpl.name} className="flex items-center justify-between p-4 rounded-2xl border border-[var(--saptta-line)] hover:border-[var(--saptta-accent)]/30 transition-colors"><div><h4 className="font-medium text-sm">{tpl.name}</h4><p className="text-xs text-[var(--saptta-mute)]">{tpl.ctc} · {tpl.employees} employees</p></div><div className="flex items-center gap-2"><Badge variant="secondary" className="rounded-full text-xs">{tpl.dept}</Badge><Button variant="ghost" size="sm" onClick={() => toast.info("Opening details…")} className="text-xs text-[var(--saptta-accent)] h-7"><Eye className="w-3 h-3 mr-1" />View</Button></div></div>))}</div><div className="mt-4 pt-4 border-t border-[var(--saptta-line)]"><Button variant="outline" className="w-full rounded-full"><Upload className="w-4 h-4 mr-2" />Bulk Assign Structures</Button></div></CardContent></Card></motion.div>
      </div>
    </div>
  );
}

function RunPayrollTab() {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ["Select Month", "Verify Attendance", "Process", "Review", "Lock"];
  const stepIcons = [<Calendar className="w-4 h-4" key="cal" />,<CheckCircle2 className="w-4 h-4" key="chk" />,<RefreshCw className="w-4 h-4" key="ref" />,<Eye className="w-4 h-4" key="eye" />,<Lock className="w-4 h-4" key="lock" />];
  return (
    <div className="space-y-6">
      <motion.div variants={fadeUp} initial="hidden" animate="show"><Card className="rounded-[24px] border-0 shadow-lg"><CardContent className="p-6">
        <div className="flex items-center justify-between mb-8">{steps.map((step,i)=>(<React.Fragment key={step}><div className="flex items-center gap-2"><motion.div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${i<currentStep?"bg-emerald-500 text-white":i===currentStep?"bg-[var(--saptta-accent)] text-white":"bg-[var(--saptta-bg-2)] text-[var(--saptta-mute)]"}`} animate={i===currentStep?{scale:[1,1.1,1]}:{}} transition={{duration:0.5}}>{i<currentStep?<Check className="w-4 h-4" />:stepIcons[i]}</motion.div><span className={`text-sm font-medium hidden sm:inline ${i<=currentStep?"text-[var(--saptta-ink)]":"text-[var(--saptta-mute)]"}`}>{step}</span></div>{i<steps.length-1&&<div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${i<currentStep?"bg-emerald-500":"bg-[var(--saptta-bg-2)]"}`} />}</React.Fragment>))}</div>
        <AnimatePresence mode="wait">
          {currentStep===0&&<motion.div key="s0" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}><div className="text-center space-y-4"><h3 className="text-lg font-semibold">Select Payroll Month</h3><div className="max-w-xs mx-auto space-y-3"><Select defaultValue="june-2026"><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="june-2026">June 2026</SelectItem><SelectItem value="may-2026">May 2026</SelectItem></SelectContent></Select><div className="p-4 rounded-2xl bg-[var(--saptta-bg-2)]"><div className="flex justify-between text-sm"><span className="text-[var(--saptta-mute)]">Active Employees</span><span className="font-semibold">1,280</span></div><div className="flex justify-between text-sm mt-1"><span className="text-[var(--saptta-mute)]">New Joiners</span><span className="font-semibold text-emerald-600">12</span></div><div className="flex justify-between text-sm mt-1"><span className="text-[var(--saptta-mute)]">Exits</span><span className="font-semibold text-red-500">5</span></div></div></div></div></motion.div>}
          {currentStep===1&&<motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}><h3 className="text-lg font-semibold mb-4">Attendance Verification</h3><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">{[{label:"Full Attendance",value:"1,198",color:"text-emerald-600"},{label:"LOP Days",value:"33",color:"text-red-500"},{label:"Overtime Hours",value:"256h",color:"text-amber-600"}].map((item)=>(<div key={item.label} className="p-4 rounded-2xl bg-[var(--saptta-bg-2)] text-center"><p className={`text-2xl font-bold ${item.color}`}>{item.value}</p><p className="text-xs text-[var(--saptta-mute)]">{item.label}</p></div>))}</div><div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /><span className="text-sm text-amber-700">33 employees have LOP days this month. Verify before processing.</span></div></motion.div>}
          {currentStep===2&&<motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}><h3 className="text-lg font-semibold mb-4">Processing Payroll</h3><div className="text-center space-y-4 py-8"><div className="w-20 h-20 mx-auto rounded-full bg-[var(--saptta-accent)]/10 flex items-center justify-center"><RefreshCw className="w-10 h-10 text-[var(--saptta-accent)] saptta-live-dot" /></div><Progress value={72} className="max-w-md mx-auto h-3 rounded-full" /><p className="text-sm text-[var(--saptta-mute)]">Processing 924 of 1,280 employees...</p></div></motion.div>}
          {currentStep===3&&<motion.div key="s3" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}><h3 className="text-lg font-semibold mb-4">Review Summary</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"><div className="p-4 rounded-2xl bg-emerald-50"><p className="text-sm text-[var(--saptta-mute)]">Total Gross</p><p className="text-xl font-bold text-emerald-700">₹1,20,00,000</p></div><div className="p-4 rounded-2xl bg-[var(--saptta-accent)]/5"><p className="text-sm text-[var(--saptta-mute)]">Total Net</p><p className="text-xl font-bold text-[var(--saptta-accent)]">₹84,50,000</p></div></div><div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50"><div className="flex items-center gap-2 mb-3"><Zap className="w-4 h-4 text-amber-600" /><h4 className="text-sm font-semibold text-amber-700">AI Anomaly Detection</h4></div><div className="space-y-2">{[{text:"Unusual deduction detected for Employee #EMP-1234 — PF ₹8,200 (40% above normal)",severity:"high"},{text:"New joiner salary 30% above band — Employee #EMP-1290 (₹18L CTC, band: ₹12-14L)",severity:"medium"},{text:"Negative net pay for Employee #EMP-1156 due to excessive LOP",severity:"high"}].map((anomaly,i)=>(<div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white"><AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${anomaly.severity==="high"?"text-red-500":"text-amber-500"}`} /><p className="text-xs text-[var(--saptta-ink)]">{anomaly.text}</p></div>))}</div></div></motion.div>}
          {currentStep===4&&<motion.div key="s4" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}><h3 className="text-lg font-semibold mb-4">Lock & Generate Payslips</h3><div className="text-center space-y-4 py-4"><div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center"><Lock className="w-10 h-10 text-emerald-600" /></div><p className="text-sm text-[var(--saptta-mute)]">Locking payroll will finalize all calculations and generate payslips for 1,247 employees.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto"><div className="p-4 rounded-2xl bg-[var(--saptta-bg-2)]"><p className="text-xs text-[var(--saptta-mute)]">Bank File (NEFT)</p><Button variant="outline" size="sm" onClick={() => toast.success("Generating NEFT transfer file…")} className="mt-2 rounded-full text-xs w-full"><Download className="w-3 h-3 mr-1" />Generate NEFT File</Button></div><div className="p-4 rounded-2xl bg-[var(--saptta-bg-2)]"><p className="text-xs text-[var(--saptta-mute)]">Payslip Emails</p><Button variant="outline" size="sm" onClick={() => toast.success("Sending payslip emails to all employees…")} className="mt-2 rounded-full text-xs w-full"><Mail className="w-3 h-3 mr-1" />Send Payslips</Button></div></div></div></motion.div>}
        </AnimatePresence>
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--saptta-line)]">
          <Button variant="outline" className="rounded-full" onClick={()=>setCurrentStep(Math.max(0,currentStep-1))} disabled={currentStep===0}><ChevronLeft className="w-4 h-4 mr-1" />Previous</Button>
          {currentStep<steps.length-1?<Button className="rounded-full bg-[var(--saptta-accent)] hover:bg-[var(--saptta-accent)]/90 text-white" onClick={()=>setCurrentStep(Math.min(steps.length-1,currentStep+1))}>Next<ChevronRight className="w-4 h-4 ml-1" /></Button>:<Button className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white"><Lock className="w-4 h-4 mr-2" />Lock Payroll</Button>}
        </div>
      </CardContent></Card></motion.div>
    </div>
  );
}

function PayslipsTab() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [payslipOpen, setPayslipOpen] = useState(false);
  const [bulkDownloadOpen, setBulkDownloadOpen] = useState(false);
  const [emailPayslipsOpen, setEmailPayslipsOpen] = useState(false);
  const [payMonth, setPayMonth] = useState("jun-2026");
  const employee = payslipEmployees.find(e => e.id === selectedEmployee);
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div className="flex items-center gap-2 w-full sm:w-auto"><div className="relative flex-1 sm:w-80"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--saptta-mute)]" /><Input placeholder="Search employee..." className="rounded-full pl-9" /></div><Select value={payMonth} onValueChange={setPayMonth}><SelectTrigger className="w-[130px] rounded-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="jun-2026">Jun 2026</SelectItem><SelectItem value="may-2026">May 2026</SelectItem></SelectContent></Select></div><div className="flex items-center gap-2"><Button variant="outline" onClick={() => setBulkDownloadOpen(true)} className="rounded-full text-xs"><Download className="w-3.5 h-3.5 mr-1" />Bulk Download</Button><Button variant="outline" onClick={() => setEmailPayslipsOpen(true)} className="rounded-full text-xs"><Mail className="w-3.5 h-3.5 mr-1" />Email Payslips</Button></div></div>
      <motion.div variants={fadeUp} initial="hidden" animate="show"><Card className="rounded-[24px] border-0 shadow-lg"><CardContent className="p-0"><ScrollArea className="max-h-96"><Table><TableHeader><TableRow><TableHead className="text-xs font-medium">Employee</TableHead><TableHead className="text-xs font-medium">Department</TableHead><TableHead className="text-xs font-medium">Designation</TableHead><TableHead className="text-xs font-medium">Net Pay</TableHead><TableHead className="text-xs font-medium">Month</TableHead><TableHead className="text-xs font-medium">Actions</TableHead></TableRow></TableHeader><TableBody>{payslipEmployees.map((emp)=>(<TableRow key={emp.id} className="hover:bg-[var(--saptta-bg-2)]"><TableCell><div className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)]">{emp.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback></Avatar><div><p className="text-sm font-medium">{emp.name}</p><p className="text-[10px] text-[var(--saptta-mute)]">{emp.id}</p></div></div></TableCell><TableCell className="text-sm">{emp.department}</TableCell><TableCell className="text-sm">{emp.designation}</TableCell><TableCell className="text-sm font-semibold text-[var(--saptta-accent)]">{formatINR(emp.netPay)}</TableCell><TableCell className="text-sm text-[var(--saptta-mute)]">{emp.month}</TableCell><TableCell><Dialog open={payslipOpen&&selectedEmployee===emp.id} onOpenChange={(open)=>{setPayslipOpen(open);if(!open)setSelectedEmployee(null)}}><DialogTrigger asChild><Button variant="ghost" size="sm" className="text-xs text-[var(--saptta-accent)] h-7" onClick={()=>setSelectedEmployee(emp.id)}><Eye className="w-3 h-3 mr-1" />View</Button></DialogTrigger><DialogContent className="rounded-[24px] max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Payslip — {emp.name}</DialogTitle><DialogDescription>{emp.month}</DialogDescription></DialogHeader><div className="border border-[var(--saptta-line)] rounded-2xl overflow-hidden"><div className="bg-[var(--saptta-accent)] p-5 text-white"><h2 className="text-xl font-bold">Kam Technologies Pvt. Ltd.</h2><p className="text-xs opacity-80">4th Floor, Salarpuria Softzone, Outer Ring Road, Bangalore - 560103</p><p className="text-xs opacity-80">PAN: AABCS1234A | TAN: BLRS12345E | PF: KRBAN/12345/000</p></div><div className="p-5 border-b border-[var(--saptta-line)]"><div className="grid grid-cols-2 gap-4 text-sm"><div><span className="text-[var(--saptta-mute)]">Name:</span> <span className="font-medium">{emp.name}</span></div><div><span className="text-[var(--saptta-mute)]">Employee ID:</span> <span className="font-medium">{emp.id}</span></div><div><span className="text-[var(--saptta-mute)]">Department:</span> <span className="font-medium">{emp.department}</span></div><div><span className="text-[var(--saptta-mute)]">Designation:</span> <span className="font-medium">{emp.designation}</span></div></div></div><div className="grid grid-cols-2 gap-0 divide-x divide-[var(--saptta-line)]"><div className="p-5"><h4 className="text-sm font-semibold text-emerald-600 mb-3">Earnings</h4><div className="space-y-2">{[{label:"Basic Salary",value:66667},{label:"HRA",value:33333},{label:"Special Allowance",value:25000},{label:"Transport",value:3200},{label:"Medical",value:1250}].map((e)=>(<div key={e.label} className="flex justify-between text-sm"><span className="text-[var(--saptta-mute)]">{e.label}</span><span className="font-medium">{formatINR(e.value)}</span></div>))}<Separator /><div className="flex justify-between text-sm font-semibold"><span>Total Earnings</span><span className="text-emerald-600">{formatINR(129450)}</span></div></div></div><div className="p-5"><h4 className="text-sm font-semibold text-red-600 mb-3">Deductions</h4><div className="space-y-2">{[{label:"Provident Fund",value:8000},{label:"Professional Tax",value:200},{label:"TDS",value:15000},{label:"ESI",value:0}].map((d)=>(<div key={d.label} className="flex justify-between text-sm"><span className="text-[var(--saptta-mute)]">{d.label}</span><span className="font-medium">{d.value>0?formatINR(d.value):"—"}</span></div>))}<Separator /><div className="flex justify-between text-sm font-semibold"><span>Total Deductions</span><span className="text-red-600">{formatINR(23200)}</span></div></div></div></div><div className="p-5 bg-[var(--saptta-accent)]/5 border-t border-[var(--saptta-line)]"><div className="flex items-center justify-between"><div><p className="text-sm text-[var(--saptta-mute)]">Net Pay</p><p className="text-3xl font-bold text-[var(--saptta-accent)]">{formatINR(emp.netPay)}</p></div><div className="text-right text-xs text-[var(--saptta-mute)]"><p>YTD Gross: {formatINR(776700)}</p><p>YTD Tax: {formatINR(90000)}</p><p>YTD Net: {formatINR(686700)}</p></div></div></div></div><DialogFooter className="mt-4"><Button variant="outline" className="rounded-full" onClick={() => toast.success(`Downloading payslip for ${emp.name}...`)}><Download className="w-4 h-4 mr-2" />Download PDF</Button><Button className="rounded-full bg-[var(--saptta-accent)] hover:bg-[var(--saptta-accent)]/90 text-white" onClick={() => toast.success(`Payslip emailed to ${emp.name}`)}><Mail className="w-4 h-4 mr-2" />Email</Button></DialogFooter></DialogContent></Dialog></TableCell></TableRow>))}</TableBody></Table></ScrollArea></CardContent></Card></motion.div>

      {/* ── Bulk Download Preview ── */}
      <Dialog open={bulkDownloadOpen} onOpenChange={setBulkDownloadOpen}>
        <DialogContent className="sm:max-w-lg rounded-[24px] p-0">
          <DialogHeader className="p-5 pb-3 border-b border-[var(--saptta-line)]">
            <DialogTitle>Bulk Download — {payMonth === "jun-2026" ? "June 2026" : "May 2026"}</DialogTitle>
            <DialogDescription className="text-xs text-[var(--saptta-mute)]">{payslipEmployees.length} payslips will be downloaded as a ZIP</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[300px]">
            <div className="p-5 space-y-2">
              {payslipEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--saptta-bg-2)]">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px] bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)]">{emp.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback></Avatar>
                    <div><p className="text-sm font-medium">{emp.name}</p><p className="text-[10px] text-[var(--saptta-mute)]">{emp.department}</p></div>
                  </div>
                  <span className="text-sm font-semibold text-[var(--saptta-accent)]">{formatINR(emp.netPay)}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-5 pt-3 border-t border-[var(--saptta-line)] flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl text-xs" onClick={() => setBulkDownloadOpen(false)}>Cancel</Button>
            <Button className="flex-1 rounded-xl text-xs bg-[var(--saptta-ink)] text-white hover:bg-[var(--saptta-ink)]/90" onClick={() => { setBulkDownloadOpen(false); toast.success(`Downloading ${payslipEmployees.length} payslips as ZIP...`); }}>
              <Download className="w-3.5 h-3.5 mr-1.5" />Download All ({payslipEmployees.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Email Payslips Preview ── */}
      <Dialog open={emailPayslipsOpen} onOpenChange={setEmailPayslipsOpen}>
        <DialogContent className="sm:max-w-lg rounded-[24px] p-0">
          <DialogHeader className="p-5 pb-3 border-b border-[var(--saptta-line)]">
            <DialogTitle>Email Payslips — {payMonth === "jun-2026" ? "June 2026" : "May 2026"}</DialogTitle>
            <DialogDescription className="text-xs text-[var(--saptta-mute)]">Payslips will be sent to each employee&apos;s registered email</DialogDescription>
          </DialogHeader>
          <div className="p-5 space-y-3">
            <div className="p-3 rounded-xl border border-[var(--saptta-line)] bg-[var(--saptta-bg-2)]">
              <p className="text-xs text-[var(--saptta-mute)] mb-1">Email Subject</p>
              <p className="text-sm font-medium">Your Payslip for {payMonth === "jun-2026" ? "June 2026" : "May 2026"} — Kam Technologies Pvt. Ltd.</p>
            </div>
            <div className="p-3 rounded-xl border border-[var(--saptta-line)] bg-[var(--saptta-bg-2)]">
              <p className="text-xs text-[var(--saptta-mute)] mb-1">Preview Message</p>
              <p className="text-sm text-[var(--saptta-ink-2)] leading-relaxed">Dear [Employee Name],<br /><br />Please find attached your payslip for the month of {payMonth === "jun-2026" ? "June 2026" : "May 2026"}. If you have any queries, please contact the HR team.<br /><br />Regards,<br />Kam HR Team</p>
            </div>
            <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-emerald-700 font-medium">Recipients</span>
              <span className="font-bold text-emerald-700">{payslipEmployees.length} employees</span>
            </div>
          </div>
          <div className="p-5 pt-0 flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl text-xs" onClick={() => setEmailPayslipsOpen(false)}>Cancel</Button>
            <Button className="flex-1 rounded-xl text-xs bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90" onClick={() => { setEmailPayslipsOpen(false); toast.success(`Payslips emailed to ${payslipEmployees.length} employees`); }}>
              <Mail className="w-3.5 h-3.5 mr-1.5" />Send to All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatutoryTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">{[{label:"PF Compliance",status:"Due",icon:<Shield className="w-5 h-5" />,color:"var(--saptta-accent)"},{label:"ESI Compliance",status:"Filed",icon:<Shield className="w-5 h-5" />,color:"#10b981"},{label:"PT Compliance",status:"Due",icon:<Building2 className="w-5 h-5" />,color:"#f59e0b"},{label:"TDS Compliance",status:"Overdue",icon:<FileText className="w-5 h-5" />,color:"#ef4444"}].map((item,i)=>(<motion.div key={item.label} variants={fadeUp} initial="hidden" animate="show" transition={{delay:i*0.05}}><Card className="rounded-[24px] border-0 shadow-lg"><CardContent className="p-5"><div className="flex items-center justify-between mb-2"><div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{backgroundColor:`${item.color}15`,color:item.color}}>{item.icon}</div><Badge variant="secondary" className={`rounded-full text-xs ${item.status==="Filed"?"bg-emerald-50 text-emerald-600":item.status==="Overdue"?"bg-red-50 text-red-600":"bg-amber-50 text-amber-600"}`}>{item.status}</Badge></div><p className="font-semibold text-sm">{item.label}</p></CardContent></Card></motion.div>))}</div>
      <motion.div variants={fadeUp} initial="hidden" animate="show"><Card className="rounded-[24px] border-0 shadow-lg"><CardHeader className="pb-2"><CardTitle className="text-lg font-semibold flex items-center gap-2"><FileText className="w-5 h-5 text-[var(--saptta-accent)]" />Compliance Calendar</CardTitle></CardHeader><CardContent><ScrollArea className="max-h-80"><Table><TableHeader><TableRow><TableHead className="text-xs font-medium">Type</TableHead><TableHead className="text-xs font-medium">Task</TableHead><TableHead className="text-xs font-medium">Due Date</TableHead><TableHead className="text-xs font-medium">Status</TableHead><TableHead className="text-xs font-medium">Action</TableHead></TableRow></TableHeader><TableBody>{statutoryCompliance.map((item,i)=>(<TableRow key={i} className="hover:bg-[var(--saptta-bg-2)]"><TableCell><Badge variant="secondary" className="rounded-full text-xs bg-[var(--saptta-bg-2)] text-[var(--saptta-mute)]">{item.type}</Badge></TableCell><TableCell className="text-sm font-medium">{item.task}</TableCell><TableCell className="text-sm text-[var(--saptta-mute)]">{new Date(item.dueDate).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</TableCell><TableCell><Badge variant="secondary" className={`rounded-full text-xs ${item.status==="Filed"?"bg-emerald-50 text-emerald-600":item.status==="Overdue"?"bg-red-50 text-red-600":"bg-amber-50 text-amber-600"}`}>{item.status}</Badge></TableCell><TableCell>{item.status==="Filed"?<Button variant="ghost" size="sm" onClick={() => toast.success("Downloading filing receipt…")} className="text-xs h-7 text-emerald-600"><Download className="w-3 h-3 mr-1" />Receipt</Button>:<Button variant="ghost" size="sm" onClick={() => toast.info(`Filing ${item.task}…`)} className="text-xs h-7 text-[var(--saptta-accent)]"><Upload className="w-3 h-3 mr-1" />File Now</Button>}</TableCell></TableRow>))}</TableBody></Table></ScrollArea></CardContent></Card></motion.div>
    </div>
  );
}

function LoansTab() {
  const [loanOpen, setLoanOpen] = useState(false);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[{label:"Active Loans",value:"4",icon:<CreditCard className="w-5 h-5" />,color:"var(--saptta-accent)"},{label:"Total Outstanding",value:"₹4.28L",icon:<Banknote className="w-5 h-5" />,color:"#f59e0b"},{label:"Monthly EMI",value:"₹35,200",icon:<PiggyBank className="w-5 h-5" />,color:"#10b981"}].map((item,i)=>(<motion.div key={item.label} variants={fadeUp} initial="hidden" animate="show" transition={{delay:i*0.05}}><Card className="rounded-[24px] border-0 shadow-lg"><CardContent className="p-5 flex items-center gap-4"><div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{backgroundColor:`${item.color}15`,color:item.color}}>{item.icon}</div><div><p className="text-2xl font-bold">{item.value}</p><p className="text-xs text-[var(--saptta-mute)]">{item.label}</p></div></CardContent></Card></motion.div>))}</div>
      <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Active Loans</h3><Dialog open={loanOpen} onOpenChange={setLoanOpen}><DialogTrigger asChild><Button className="rounded-full bg-[var(--saptta-accent)] hover:bg-[var(--saptta-accent)]/90 text-white"><Plus className="w-4 h-4 mr-2" />Apply for Loan</Button></DialogTrigger><DialogContent className="rounded-[24px] max-w-md"><DialogHeader><DialogTitle>Apply for Loan</DialogTitle><DialogDescription>Submit a loan application</DialogDescription></DialogHeader><div className="space-y-4"><div><Label className="text-sm">Loan Type</Label><Select><SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="personal">Personal Loan</SelectItem><SelectItem value="emergency">Emergency Loan</SelectItem><SelectItem value="vehicle">Vehicle Loan</SelectItem><SelectItem value="education">Education Loan</SelectItem></SelectContent></Select></div><div><Label className="text-sm">Amount (₹)</Label><Input type="number" className="rounded-xl mt-1" placeholder="e.g., 100000" /></div><div><Label className="text-sm">Tenure (months)</Label><Select><SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="Select tenure" /></SelectTrigger><SelectContent><SelectItem value="12">12 months</SelectItem><SelectItem value="24">24 months</SelectItem><SelectItem value="36">36 months</SelectItem></SelectContent></Select></div><div><Label className="text-sm">Reason</Label><Textarea className="rounded-xl mt-1" placeholder="Provide a reason..." /></div></div><DialogFooter><Button className="rounded-full bg-[var(--saptta-accent)] hover:bg-[var(--saptta-accent)]/90 text-white"><Send className="w-4 h-4 mr-2" />Submit</Button></DialogFooter></DialogContent></Dialog></div>
      <motion.div variants={fadeUp} initial="hidden" animate="show"><Card className="rounded-[24px] border-0 shadow-lg"><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead className="text-xs font-medium">Employee</TableHead><TableHead className="text-xs font-medium">Type</TableHead><TableHead className="text-xs font-medium">Amount</TableHead><TableHead className="text-xs font-medium">EMI</TableHead><TableHead className="text-xs font-medium">Outstanding</TableHead><TableHead className="text-xs font-medium">Progress</TableHead><TableHead className="text-xs font-medium">Action</TableHead></TableRow></TableHeader><TableBody>{activeLoans.map((loan)=>(<TableRow key={loan.id} className="hover:bg-[var(--saptta-bg-2)]"><TableCell><div className="flex items-center gap-2"><Avatar className="h-7 w-7"><AvatarFallback className="text-[10px] bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)]">{loan.employee.split(" ").map(n=>n[0]).join("")}</AvatarFallback></Avatar><div><p className="text-sm font-medium">{loan.employee}</p><p className="text-[10px] text-[var(--saptta-mute)]">{loan.empId}</p></div></div></TableCell><TableCell className="text-sm">{loan.type}</TableCell><TableCell className="text-sm font-medium">{formatINR(loan.amount)}</TableCell><TableCell className="text-sm">{formatINR(loan.emi)}/mo</TableCell><TableCell className="text-sm font-semibold text-amber-600">{formatINR(loan.outstanding)}</TableCell><TableCell><div className="w-20"><Progress value={(loan.paid/loan.tenure)*100} className="h-2 rounded-full" /><p className="text-[10px] text-[var(--saptta-mute)] mt-0.5">{loan.paid}/{loan.tenure} EMIs</p></div></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => toast.info("Opening details…")} className="text-xs text-[var(--saptta-accent)] h-7"><Eye className="w-3 h-3 mr-1" />View</Button></TableCell></TableRow>))}</TableBody></Table></CardContent></Card></motion.div>
    </div>
  );
}

export function PayrollView() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--saptta-ink)] tracking-tight">Payroll</h1>
        <p className="text-[var(--saptta-mute)] mt-1 text-sm">Manage salary structures, run payroll, view payslips & statutory compliance.</p>
      </motion.div>
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-[var(--saptta-bg-2)] rounded-full p-1 h-auto mb-6 flex-wrap">
            <TabsTrigger value="overview" className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white"><BarChart3 className="w-4 h-4 mr-2" />Overview</TabsTrigger>
            <TabsTrigger value="structures" className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white"><Settings className="w-4 h-4 mr-2" />Salary Structures</TabsTrigger>
            <TabsTrigger value="run" className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white"><Calculator className="w-4 h-4 mr-2" />Run Payroll</TabsTrigger>
            <TabsTrigger value="payslips" className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white"><Receipt className="w-4 h-4 mr-2" />Payslips</TabsTrigger>
            <TabsTrigger value="statutory" className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white"><Shield className="w-4 h-4 mr-2" />Statutory</TabsTrigger>
            <TabsTrigger value="loans" className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white"><CreditCard className="w-4 h-4 mr-2" />Loans</TabsTrigger>
          </TabsList>
          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="structures"><SalaryStructuresTab /></TabsContent>
          <TabsContent value="run"><RunPayrollTab /></TabsContent>
          <TabsContent value="payslips"><PayslipsTab /></TabsContent>
          <TabsContent value="statutory"><StatutoryTab /></TabsContent>
          <TabsContent value="loans"><LoansTab /></TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}