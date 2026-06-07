"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock, MapPin, Users, Calendar, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Plane, Sun, Moon, RotateCcw, Send, Eye,
  Plus, Filter, Download, Upload, FileText, Shield, Timer,
  ArrowRight, Check, X, Info, Building2, Flag
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 0.8, 0.22, 1] } },
};

const attendanceLog = [
  { id: 1, date: "2026-06-05", checkIn: "09:15 AM", checkOut: "06:30 PM", hours: 9.25, status: "Present" as const },
  { id: 2, date: "2026-06-04", checkIn: "09:45 AM", checkOut: "06:20 PM", hours: 8.58, status: "Late" as const },
  { id: 3, date: "2026-06-03", checkIn: "09:05 AM", checkOut: "06:10 PM", hours: 9.08, status: "Present" as const },
  { id: 4, date: "2026-06-02", checkIn: "—", checkOut: "—", hours: 0, status: "Absent" as const },
  { id: 5, date: "2026-06-01", checkIn: "09:00 AM", checkOut: "01:05 PM", hours: 4.08, status: "Half-day" as const },
  { id: 6, date: "2026-05-30", checkIn: "09:10 AM", checkOut: "06:15 PM", hours: 9.08, status: "Present" as const },
  { id: 7, date: "2026-05-29", checkIn: "—", checkOut: "—", hours: 0, status: "WFH" as const },
  { id: 8, date: "2026-05-28", checkIn: "09:20 AM", checkOut: "06:45 PM", hours: 9.42, status: "Late" as const },
  { id: 9, date: "2026-05-27", checkIn: "09:00 AM", checkOut: "06:00 PM", hours: 9.0, status: "Present" as const },
  { id: 10, date: "2026-05-26", checkIn: "09:05 AM", checkOut: "06:30 PM", hours: 9.42, status: "Present" as const },
];

const teamAttendance = { present: 156, late: 8, onLeave: 12, absent: 4, wfh: 6, total: 186, percentage: 94.2 };

const leaveBalances = [
  { type: "Casual Leave", used: 8, total: 12, color: "var(--saptta-accent)" },
  { type: "Sick Leave", used: 2, total: 10, color: "#10b981" },
  { type: "Earned Leave", used: 5, total: 15, color: "#3b82f6" },
  { type: "Comp Off", used: 0, total: 2, color: "var(--saptta-accent-2)" },
];

const initialLeaveRequests = [
  { id: 1, employee: "Priya Sharma", empId: "EMP-0234", type: "Casual Leave", from: "2026-06-10", to: "2026-06-11", days: 2, status: "Pending" as const },
  { id: 2, employee: "Rahul Verma", empId: "EMP-0156", type: "Sick Leave", from: "2026-06-08", to: "2026-06-09", days: 2, status: "Approved" as const },
  { id: 3, employee: "Anita Desai", empId: "EMP-0078", type: "Earned Leave", from: "2026-06-15", to: "2026-06-20", days: 5, status: "Pending" as const },
  { id: 4, employee: "Vikram Patel", empId: "EMP-0301", type: "Comp Off", from: "2026-06-12", to: "2026-06-12", days: 1, status: "Rejected" as const },
  { id: 5, employee: "Meera Iyer", empId: "EMP-0112", type: "Casual Leave", from: "2026-06-07", to: "2026-06-07", days: 1, status: "Cancelled" as const },
  { id: 6, employee: "Arjun Nair", empId: "EMP-0445", type: "Sick Leave", from: "2026-06-05", to: "2026-06-06", days: 2, status: "Approved" as const },
];

const shifts = [
  { id: 1, name: "General", startTime: "09:00 AM", endTime: "06:00 PM", grace: 15, type: "Fixed", employees: 142 },
  { id: 2, name: "Night", startTime: "10:00 PM", endTime: "07:00 AM", grace: 10, type: "Fixed", employees: 24 },
  { id: 3, name: "Rotational", startTime: "Varies", endTime: "Varies", grace: 15, type: "Rotational", employees: 20 },
];

const rosterData = [
  { name: "Aarav K.", mon: "General", tue: "General", wed: "General", thu: "General", fri: "General", sat: "Off", sun: "Off" },
  { name: "Diya S.", mon: "Night", tue: "Night", wed: "Night", thu: "Night", fri: "Night", sat: "Off", sun: "Off" },
  { name: "Rohan M.", mon: "General", tue: "General", wed: "General", thu: "Rotational", fri: "Rotational", sat: "Off", sun: "Off" },
  { name: "Sneha P.", mon: "General", tue: "General", wed: "General", thu: "General", fri: "General", sat: "Off", sun: "Off" },
  { name: "Karan T.", mon: "Rotational", tue: "Rotational", wed: "General", thu: "General", fri: "General", sat: "Off", sun: "Off" },
];

const holidays2026 = [
  { id: 1, date: "2026-01-01", name: "New Year's Day", type: "Company" },
  { id: 2, date: "2026-01-14", name: "Makar Sankranti", type: "Restricted" },
  { id: 3, date: "2026-01-26", name: "Republic Day", type: "National" },
  { id: 4, date: "2026-03-14", name: "Holi", type: "National" },
  { id: 5, date: "2026-04-02", name: "Ram Navami", type: "Restricted" },
  { id: 6, date: "2026-04-14", name: "Ambedkar Jayanti", type: "National" },
  { id: 7, date: "2026-05-01", name: "Labour Day", type: "National" },
  { id: 8, date: "2026-06-05", name: "Buddha Purnima", type: "Restricted" },
  { id: 9, date: "2026-08-15", name: "Independence Day", type: "National" },
  { id: 10, date: "2026-10-02", name: "Gandhi Jayanti", type: "National" },
  { id: 11, date: "2026-10-20", name: "Dussehra", type: "National" },
  { id: 12, date: "2026-11-08", name: "Diwali", type: "National" },
  { id: 13, date: "2026-12-25", name: "Christmas", type: "National" },
];

const calendarDayStatus: Record<string, string> = {
  "2026-06-01": "half-day", "2026-06-02": "absent", "2026-06-03": "present",
  "2026-06-04": "late", "2026-06-05": "present", "2026-05-26": "present",
  "2026-05-27": "present", "2026-05-28": "late", "2026-05-29": "wfh",
  "2026-05-30": "present", "2026-05-31": "present",
};

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    "Present": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Late": "bg-amber-50 text-amber-700 border-amber-200",
    "Absent": "bg-red-50 text-red-700 border-red-200",
    "Half-day": "bg-blue-50 text-blue-700 border-blue-200",
    "WFH": "bg-purple-50 text-purple-700 border-purple-200",
    "Pending": "bg-amber-50 text-amber-700 border-amber-200",
    "Approved": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Rejected": "bg-red-50 text-red-700 border-red-200",
    "Cancelled": "bg-gray-50 text-gray-500 border-gray-200",
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config[status] || config["Present"]}`}>{status}</span>;
}

function AttendanceRing({ percentage, size = 160 }: { percentage: number; size?: number }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--saptta-line)" strokeWidth={strokeWidth} fill="none" />
        <motion.circle cx={size / 2} cy={size / 2} r={radius} stroke="#10b981" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.5, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-3xl font-bold text-[var(--saptta-ink)]" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>{percentage}%</motion.span>
        <span className="text-xs text-[var(--saptta-mute)]">Present Today</span>
      </div>
    </div>
  );
}

function AttendanceTab() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [punchedIn, setPunchedIn] = useState(true);
  const [punchInTime] = useState(new Date(new Date().setHours(9, 15, 0)));
  const [elapsedTime, setElapsedTime] = useState("6h 45m");
  const [regularizeOpen, setRegularizeOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("june");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (!punchedIn) return;
    const t = setInterval(() => {
      const diff = Date.now() - punchInTime.getTime();
      const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
      setElapsedTime(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(t);
  }, [punchedIn, punchInTime]);

  const formatTime = (d: Date) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const formatDate = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <Card className="overflow-hidden rounded-[24px] border-0 shadow-lg">
            <div className="p-6 text-white" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)" }}>
              <div className="flex items-center justify-between mb-6">
                <div><p className="text-sm opacity-80">{formatDate(currentTime)}</p><div className="flex items-center gap-2 mt-1"><MapPin className="w-4 h-4 opacity-80" /><span className="text-sm opacity-80">Bangalore Office, Koramangala</span></div></div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full"><div className={`w-2 h-2 rounded-full ${punchedIn ? "bg-white saptta-live-dot" : "bg-white/50"}`} /><span className="text-xs font-medium">{punchedIn ? "Clocked In" : "Clocked Out"}</span></div>
              </div>
              <div className="text-center my-4"><div className="text-5xl font-bold tracking-tight">{formatTime(currentTime)}</div></div>
              <div className="flex items-center justify-between mt-4 bg-white/10 rounded-2xl p-4">
                <div className="text-center"><p className="text-xs opacity-70">In At</p><p className="text-lg font-semibold">9:15 AM</p></div>
                <div className="text-center"><p className="text-xs opacity-70">Total Hours</p><p className="text-lg font-semibold">{elapsedTime}</p></div>
                <div className="text-center"><p className="text-xs opacity-70">Out At</p><p className="text-lg font-semibold">—</p></div>
              </div>
            </div>
            <CardContent className="p-4">
              <Button onClick={() => setPunchedIn(!punchedIn)} className={`w-full rounded-full py-6 text-base font-semibold ${punchedIn ? "bg-red-500 hover:bg-red-600 text-white" : "bg-[var(--saptta-accent)] hover:bg-[var(--saptta-accent)]/90 text-white"}`}>
                {punchedIn ? <><XCircle className="w-5 h-5 mr-2" />Punch Out</> : <><CheckCircle2 className="w-5 h-5 mr-2" />Punch In</>}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <Card className="rounded-[24px] border-0 shadow-lg h-full">
            <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold flex items-center gap-2"><Users className="w-5 h-5 text-[var(--saptta-accent)]" />Team Attendance</CardTitle><p className="text-sm text-[var(--saptta-mute)]">Today&apos;s overview</p></CardHeader>
            <CardContent>
              <div className="flex items-center justify-around">
                <AttendanceRing percentage={teamAttendance.percentage} size={140} />
                <div className="space-y-3">{[{label:"Present",count:teamAttendance.present,color:"bg-emerald-500"},{label:"Late",count:teamAttendance.late,color:"bg-amber-500"},{label:"On Leave",count:teamAttendance.onLeave,color:"bg-orange-500"},{label:"Absent",count:teamAttendance.absent,color:"bg-red-500"},{label:"WFH",count:teamAttendance.wfh,color:"bg-purple-500"}].map((item) => <div key={item.label} className="flex items-center gap-3"><div className={`w-2.5 h-2.5 rounded-full ${item.color}`} /><span className="text-sm text-[var(--saptta-mute)] w-16">{item.label}</span><span className="text-sm font-semibold w-8 text-right">{item.count}</span></div>)}</div>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--saptta-line)]"><p className="text-xs text-[var(--saptta-mute)] text-center">Out of <span className="font-semibold text-[var(--saptta-ink)]">{teamAttendance.total}</span> employees</p></div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2" variants={fadeUp} initial="hidden" animate="show">
          <Card className="rounded-[24px] border-0 shadow-lg">
            <CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-lg font-semibold flex items-center gap-2"><Timer className="w-5 h-5 text-[var(--saptta-accent)]" />Attendance Log</CardTitle><div className="flex items-center gap-2"><Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => toast.success("Exporting attendance log as CSV...")}><Download className="w-3.5 h-3.5 mr-1" />Export</Button><Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setFilterOpen(true)}><Filter className="w-3.5 h-3.5 mr-1" />Filter</Button></div></div></CardHeader>
            <CardContent><ScrollArea className="max-h-96"><Table><TableHeader><TableRow><TableHead className="text-xs font-medium">Date</TableHead><TableHead className="text-xs font-medium">Check-in</TableHead><TableHead className="text-xs font-medium">Check-out</TableHead><TableHead className="text-xs font-medium">Hours</TableHead><TableHead className="text-xs font-medium">Status</TableHead><TableHead className="text-xs font-medium">Action</TableHead></TableRow></TableHeader><TableBody>
              {attendanceLog.map((log) => (<TableRow key={log.id} className="hover:bg-[var(--saptta-bg-2)]"><TableCell className="text-sm font-medium">{new Date(log.date).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</TableCell><TableCell className="text-sm">{log.checkIn}</TableCell><TableCell className="text-sm">{log.checkOut}</TableCell><TableCell className="text-sm font-medium">{log.hours > 0 ? `${log.hours}h` : "—"}</TableCell><TableCell><StatusBadge status={log.status} /></TableCell><TableCell>{(log.status==="Absent"||log.status==="Late")&&<Dialog open={regularizeOpen} onOpenChange={setRegularizeOpen}><DialogTrigger asChild><Button variant="ghost" size="sm" className="text-xs text-[var(--saptta-accent)] h-7 px-2"><RotateCcw className="w-3 h-3 mr-1" />Regularise</Button></DialogTrigger><DialogContent className="rounded-[24px] max-w-md"><DialogHeader><DialogTitle>Regularise Attendance</DialogTitle><DialogDescription>Request correction for {log.date}</DialogDescription></DialogHeader><div className="space-y-4"><div><Label className="text-sm">Correct Check-in</Label><Input type="time" className="rounded-xl mt-1" /></div><div><Label className="text-sm">Correct Check-out</Label><Input type="time" className="rounded-xl mt-1" /></div><div><Label className="text-sm">Reason</Label><Textarea className="rounded-xl mt-1" placeholder="E.g., Forgot to punch in..." /></div></div><DialogFooter><Button className="rounded-full bg-[var(--saptta-accent)] hover:bg-[var(--saptta-accent)]/90 text-white"><Send className="w-4 h-4 mr-2" />Submit</Button></DialogFooter></DialogContent></Dialog>}</TableCell></TableRow>))}
            </TableBody></Table></ScrollArea></CardContent>
          </Card>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <Card className="rounded-[24px] border-0 shadow-lg h-full">
            <CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-lg font-semibold flex items-center gap-2"><Calendar className="w-5 h-5 text-[var(--saptta-accent)]" />Monthly View</CardTitle><div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={()=>{if(currentMonth===0){setCurrentMonth(11);setCurrentYear(currentYear-1)}else setCurrentMonth(currentMonth-1)}}><ChevronLeft className="w-4 h-4" /></Button><span className="text-sm font-medium min-w-[100px] text-center">{monthNames[currentMonth]} {currentYear}</span><Button variant="ghost" size="icon" className="h-7 w-7" onClick={()=>{if(currentMonth===11){setCurrentMonth(0);setCurrentYear(currentYear+1)}else setCurrentMonth(currentMonth+1)}}><ChevronRight className="w-4 h-4" /></Button></div></div></CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-1">{["Su","Mo","Tu","We","Th","Fr","Sa"].map((d)=><div key={d} className="text-center text-xs font-medium text-[var(--saptta-mute)] py-1">{d}</div>)}</div>
              <div className="grid grid-cols-7 gap-1">{(()=>{const daysInMonth=new Date(currentYear,currentMonth+1,0).getDate();const firstDay=new Date(currentYear,currentMonth,1).getDay();const cells:React.ReactNode[]=[];for(let i=0;i<firstDay;i++)cells.push(<div key={`e-${i}`} className="h-9 w-9" />);const colorMap:Record<string,string>={present:"bg-emerald-100 text-emerald-700 border border-emerald-200",late:"bg-amber-100 text-amber-700 border border-amber-200",absent:"bg-red-100 text-red-700 border border-red-200","half-day":"bg-blue-100 text-blue-700 border border-blue-200",wfh:"bg-purple-100 text-purple-700 border border-purple-200",leave:"bg-orange-100 text-orange-700 border border-orange-200"};for(let day=1;day<=daysInMonth;day++){const dateStr=`${currentYear}-${String(currentMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;const status=calendarDayStatus[dateStr];const isToday=day===new Date().getDate()&&currentMonth===new Date().getMonth()&&currentYear===new Date().getFullYear();const isWeekend=(firstDay+day-1)%7===0||(firstDay+day-1)%7===6;cells.push(<TooltipProvider key={day}><Tooltip><TooltipTrigger asChild><button className={`h-9 w-9 rounded-full text-xs font-medium flex items-center justify-center transition-all hover:scale-110 ${isToday?"ring-2 ring-[var(--saptta-accent)] ring-offset-1":""} ${status?colorMap[status]:isWeekend?"text-[var(--saptta-mute)]/50":"hover:bg-[var(--saptta-bg-2)]"}`}>{day}</button></TooltipTrigger><TooltipContent side="bottom" className="rounded-xl text-xs">{status?status.charAt(0).toUpperCase()+status.slice(1):isWeekend?"Weekend":"No data"}</TooltipContent></Tooltip></TooltipProvider>)}return cells})()}</div>
              <div className="mt-4 pt-3 border-t border-[var(--saptta-line)] grid grid-cols-3 gap-2">{[{l:"Present",c:"bg-emerald-500"},{l:"Late",c:"bg-amber-500"},{l:"Absent",c:"bg-red-500"},{l:"Leave",c:"bg-orange-500"},{l:"WFH",c:"bg-purple-500"},{l:"Half-day",c:"bg-blue-500"}].map((i)=><div key={i.l} className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${i.c}`} /><span className="text-[10px] text-[var(--saptta-mute)]">{i.l}</span></div>)}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      {/* ── Attendance Filter Dialog ── */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="sm:max-w-sm rounded-[24px] p-0">
          <DialogHeader className="p-6 pb-3"><DialogTitle>Filter Attendance</DialogTitle></DialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--saptta-ink-2)] mb-1.5 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="rounded-xl h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="half-day">Half Day</SelectItem>
                  <SelectItem value="wfh">WFH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--saptta-ink-2)] mb-1.5 block">Month</label>
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="rounded-xl h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="june">June 2026</SelectItem>
                  <SelectItem value="may">May 2026</SelectItem>
                  <SelectItem value="april">April 2026</SelectItem>
                  <SelectItem value="march">March 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 rounded-xl text-xs" onClick={() => { setFilterStatus("all"); setFilterMonth("june"); }}>Reset</Button>
              <Button className="flex-1 rounded-xl text-xs bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90" onClick={() => { setFilterOpen(false); toast.success(`Showing: ${filterStatus === "all" ? "All" : filterStatus} · ${filterMonth}`); }}>Apply</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShiftsRosterTab() {
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignEmployee, setAssignEmployee] = useState("");
  const [assignShift, setAssignShift] = useState("General");
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{shifts.map((shift)=>(
        <motion.div key={shift.id} variants={fadeUp} initial="hidden" animate="show"><Card className="rounded-[24px] border-0 shadow-lg hover:shadow-xl transition-shadow"><CardContent className="p-6"><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${shift.name==="General"?"bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)]":shift.name==="Night"?"bg-purple-100 text-purple-600":"bg-[var(--saptta-accent-2)]/20 text-[#6b7a1e]"}`}>{shift.name==="General"?<Sun className="w-5 h-5" />:shift.name==="Night"?<Moon className="w-5 h-5" />:<RotateCcw className="w-5 h-5" />}</div><div><h3 className="font-semibold text-[var(--saptta-ink)]">{shift.name} Shift</h3><p className="text-xs text-[var(--saptta-mute)]">{shift.type}</p></div></div><Badge variant="secondary" className="rounded-full text-xs">{shift.employees} staff</Badge></div><div className="space-y-2"><div className="flex justify-between text-sm"><span className="text-[var(--saptta-mute)]">Timing</span><span className="font-medium">{shift.startTime} — {shift.endTime}</span></div><div className="flex justify-between text-sm"><span className="text-[var(--saptta-mute)]">Grace Period</span><span className="font-medium">{shift.grace} min</span></div></div></CardContent></Card></motion.div>
      ))}</div>
      <motion.div variants={fadeUp} initial="hidden" animate="show"><Card className="rounded-[24px] border-0 shadow-lg"><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-lg font-semibold flex items-center gap-2"><Calendar className="w-5 h-5 text-[var(--saptta-accent)]" />Weekly Roster</CardTitle><div className="flex items-center gap-2"><Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => toast.info("Opening shift templates library...")}><FileText className="w-3.5 h-3.5 mr-1" />Templates</Button><Button size="sm" className="rounded-full text-xs bg-[var(--saptta-accent)] hover:bg-[var(--saptta-accent)]/90 text-white" onClick={() => setAssignOpen(true)}><Plus className="w-3.5 h-3.5 mr-1" />Assign Shift</Button></div></div></CardHeader><CardContent><ScrollArea className="max-h-80"><Table><TableHeader><TableRow><TableHead className="text-xs font-medium">Employee</TableHead>{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d)=><TableHead key={d} className="text-xs font-medium text-center">{d}</TableHead>)}</TableRow></TableHeader><TableBody>{rosterData.map((row,i)=>(<TableRow key={i} className="hover:bg-[var(--saptta-bg-2)]"><TableCell className="font-medium text-sm">{row.name}</TableCell>{(["mon","tue","wed","thu","fri","sat","sun"] as const).map((day)=>(<TableCell key={day} className="text-center"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${row[day]==="General"?"bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)]":row[day]==="Night"?"bg-purple-100 text-purple-600":row[day]==="Rotational"?"bg-[var(--saptta-accent-2)]/20 text-[#6b7a1e]":"bg-gray-100 text-gray-400"}`}>{row[day]}</span></TableCell>))}</TableRow>))}</TableBody></Table></ScrollArea></CardContent></Card></motion.div>

      {/* ── Assign Shift Dialog ── */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-sm rounded-[24px] p-0">
          <DialogHeader className="p-6 pb-3"><DialogTitle>Assign Shift</DialogTitle><DialogDescription className="text-xs text-[var(--saptta-mute)]">Assign a shift to an employee</DialogDescription></DialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <div><Label className="text-xs">Employee Name</Label><Input className="mt-1 rounded-xl text-sm" placeholder="e.g. Aarav K." value={assignEmployee} onChange={(e) => setAssignEmployee(e.target.value)} /></div>
            <div><Label className="text-xs">Shift</Label>
              <Select value={assignShift} onValueChange={setAssignShift}>
                <SelectTrigger className="mt-1 rounded-xl text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General (9AM – 6PM)</SelectItem>
                  <SelectItem value="Night">Night (10PM – 7AM)</SelectItem>
                  <SelectItem value="Rotational">Rotational</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Effective From</Label><Input type="date" className="mt-1 rounded-xl text-sm" /></div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 rounded-xl text-xs" onClick={() => setAssignOpen(false)}>Cancel</Button>
              <Button className="flex-1 rounded-xl text-xs bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90" onClick={() => { if (!assignEmployee) { toast.error("Enter employee name"); return; } setAssignOpen(false); toast.success(`${assignShift} shift assigned to ${assignEmployee}`); setAssignEmployee(""); }}>Assign</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";
type LeaveRequest = { id: number; employee: string; empId: string; type: string; from: string; to: string; days: number; status: LeaveStatus };

function LeaveTab() {
  const [applyOpen, setApplyOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [halfDay, setHalfDay] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);

  const handleApprove = (req: LeaveRequest) => {
    setLeaveRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "Approved" as LeaveStatus } : r));
    toast.success(`Leave approved for ${req.employee} (${req.type}, ${req.days} day${req.days > 1 ? "s" : ""})`);
  };

  const handleReject = (req: LeaveRequest) => {
    setLeaveRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "Rejected" as LeaveStatus } : r));
    toast.error(`Leave rejected for ${req.employee}`);
  };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{leaveBalances.map((lb,i)=>(
        <motion.div key={lb.type} variants={fadeUp} initial="hidden" animate="show" transition={{delay:i*0.05}}><Card className="rounded-[24px] border-0 shadow-lg"><CardContent className="p-5"><div className="flex items-center justify-between mb-3"><h4 className="text-sm font-medium text-[var(--saptta-mute)]">{lb.type}</h4><div className="w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor:`${lb.color}15`}}><Plane className="w-4 h-4" style={{color:lb.color}} /></div></div><div className="mb-2"><span className="text-2xl font-bold" style={{color:lb.color}}>{lb.used}</span><span className="text-sm text-[var(--saptta-mute)]">/{lb.total} used</span></div><Progress value={(lb.used/lb.total)*100} className="h-2 rounded-full" /><p className="text-xs text-[var(--saptta-mute)] mt-2">{lb.total-lb.used} days remaining</p></CardContent></Card></motion.div>
      ))}</div>
      <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Leave Requests</h3><Dialog open={applyOpen} onOpenChange={setApplyOpen}><DialogTrigger asChild><Button className="rounded-full bg-[var(--saptta-accent)] hover:bg-[var(--saptta-accent)]/90 text-white"><Plus className="w-4 h-4 mr-2" />Apply Leave</Button></DialogTrigger><DialogContent className="rounded-[24px] max-w-lg"><DialogHeader><DialogTitle>Apply for Leave</DialogTitle><DialogDescription>Submit your leave request for approval</DialogDescription></DialogHeader><div className="space-y-4"><div><Label className="text-sm">Leave Type</Label><Select value={leaveType} onValueChange={setLeaveType}><SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="Select leave type" /></SelectTrigger><SelectContent><SelectItem value="casual">Casual Leave (4 remaining)</SelectItem><SelectItem value="sick">Sick Leave (8 remaining)</SelectItem><SelectItem value="earned">Earned Leave (10 remaining)</SelectItem><SelectItem value="comp">Comp Off (2 earned)</SelectItem></SelectContent></Select></div><div className="grid grid-cols-2 gap-3"><div><Label className="text-sm">From Date</Label><Input type="date" className="rounded-xl mt-1" /></div><div><Label className="text-sm">To Date</Label><Input type="date" className="rounded-xl mt-1" /></div></div><div className="flex items-center gap-3"><Label className="text-sm">Half Day</Label><div className={`w-10 h-5 rounded-full cursor-pointer transition-colors flex items-center ${halfDay?"bg-[var(--saptta-accent)]":"bg-gray-200"}`} onClick={()=>setHalfDay(!halfDay)}><div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${halfDay?"translate-x-5":"translate-x-0.5"}`} /></div></div><div><Label className="text-sm">Reason</Label><Textarea className="rounded-xl mt-1" placeholder="Provide a reason..." /></div><div><Label className="text-sm">Attachment (optional)</Label><div className="mt-1 border-2 border-dashed border-[var(--saptta-line)] rounded-xl p-4 text-center hover:border-[var(--saptta-accent)]/50 transition-colors cursor-pointer"><Upload className="w-5 h-5 text-[var(--saptta-mute)] mx-auto mb-1" /><p className="text-xs text-[var(--saptta-mute)]">Click to upload</p></div></div></div><DialogFooter><Button className="rounded-full bg-[var(--saptta-accent)] hover:bg-[var(--saptta-accent)]/90 text-white"><Send className="w-4 h-4 mr-2" />Submit</Button></DialogFooter></DialogContent></Dialog></div>
      <motion.div variants={fadeUp} initial="hidden" animate="show"><Card className="rounded-[24px] border-0 shadow-lg"><CardContent className="p-0"><ScrollArea className="max-h-96"><Table><TableHeader><TableRow><TableHead className="text-xs font-medium">Employee</TableHead><TableHead className="text-xs font-medium">Type</TableHead><TableHead className="text-xs font-medium">From</TableHead><TableHead className="text-xs font-medium">To</TableHead><TableHead className="text-xs font-medium">Days</TableHead><TableHead className="text-xs font-medium">Status</TableHead><TableHead className="text-xs font-medium">Actions</TableHead></TableRow></TableHeader><TableBody>{leaveRequests.map((req)=>(<TableRow key={req.id} className="hover:bg-[var(--saptta-bg-2)]"><TableCell><div className="flex items-center gap-2"><Avatar className="h-7 w-7"><AvatarFallback className="text-[10px] bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)]">{req.employee.split(" ").map(n=>n[0]).join("")}</AvatarFallback></Avatar><div><p className="text-sm font-medium">{req.employee}</p><p className="text-[10px] text-[var(--saptta-mute)]">{req.empId}</p></div></div></TableCell><TableCell className="text-sm">{req.type}</TableCell><TableCell className="text-sm">{new Date(req.from).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</TableCell><TableCell className="text-sm">{new Date(req.to).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</TableCell><TableCell className="text-sm font-medium">{req.days}</TableCell><TableCell><StatusBadge status={req.status} /></TableCell><TableCell>{req.status==="Pending"?<div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={()=>handleApprove(req)}><Check className="w-4 h-4" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={()=>handleReject(req)}><X className="w-4 h-4" /></Button></div>:<Button variant="ghost" size="sm" className="text-xs text-[var(--saptta-mute)] h-7"><Eye className="w-3 h-3 mr-1" />View</Button>}</TableCell></TableRow>))}</TableBody></Table></ScrollArea></CardContent></Card></motion.div>
      <motion.div variants={fadeUp} initial="hidden" animate="show"><Card className="rounded-[24px] border-0 shadow-lg"><CardHeader className="pb-2"><CardTitle className="text-lg font-semibold flex items-center gap-2"><Shield className="w-5 h-5 text-[var(--saptta-accent)]" />Leave Policy Overview</CardTitle></CardHeader><CardContent><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[{title:"Accrual Rules",icon:<Plus className="w-4 h-4" />,items:["CL: 1 per month, credited on 1st","SL: 1 per month, credited on 1st","EL: 1.25 per month after probation","Comp Off: Earned for working holidays"]},{title:"Carry Forward",icon:<ArrowRight className="w-4 h-4" />,items:["CL: Max 3 days carry forward","SL: No carry forward","EL: Max 10 days carry forward","Comp Off: Must use within 30 days"]},{title:"Encashment",icon:<Building2 className="w-4 h-4" />,items:["EL encashment on separation","Rate: Basic salary / 30 × days","CL not encashable","Max 45 days EL encashment"]}].map((policy)=>(<div key={policy.title} className="p-4 rounded-2xl border border-[var(--saptta-line)]"><div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded-full bg-[var(--saptta-accent)]/10 flex items-center justify-center text-[var(--saptta-accent)]">{policy.icon}</div><h4 className="font-semibold text-sm">{policy.title}</h4></div><ul className="space-y-2">{policy.items.map((item,i)=><li key={i} className="text-xs text-[var(--saptta-mute)] flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-[var(--saptta-accent)] mt-1.5 shrink-0" />{item}</li>)}</ul></div>))}</div></CardContent></Card></motion.div>
    </div>
  );
}

function HolidaysTab() {
  const [filterType, setFilterType] = useState("all");
  const [addHolidayOpen, setAddHolidayOpen] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: "", date: "", type: "National" });
  const filteredHolidays = holidays2026.filter(h => filterType === "all" || h.type.toLowerCase() === filterType);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[{label:"National Holidays",count:holidays2026.filter(h=>h.type==="National").length,icon:<Flag className="w-5 h-5" />,color:"var(--saptta-accent)"},{label:"Company Holidays",count:holidays2026.filter(h=>h.type==="Company").length,icon:<Building2 className="w-5 h-5" />,color:"var(--saptta-accent-2)"},{label:"Restricted Holidays",count:holidays2026.filter(h=>h.type==="Restricted").length,icon:<Info className="w-5 h-5" />,color:"#f59e0b"}].map((item,i)=>(<motion.div key={item.label} variants={fadeUp} initial="hidden" animate="show" transition={{delay:i*0.05}}><Card className="rounded-[24px] border-0 shadow-lg"><CardContent className="p-5 flex items-center gap-4"><div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{backgroundColor:`${item.color}15`,color:item.color}}>{item.icon}</div><div><p className="text-2xl font-bold">{item.count}</p><p className="text-xs text-[var(--saptta-mute)]">{item.label}</p></div></CardContent></Card></motion.div>))}</div>
      <motion.div variants={fadeUp} initial="hidden" animate="show"><Card className="rounded-[24px] border-0 shadow-lg"><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-lg font-semibold">Holiday Calendar 2026</CardTitle><div className="flex items-center gap-2"><Select value={filterType} onValueChange={setFilterType}><SelectTrigger className="w-[140px] rounded-full h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="national">National</SelectItem><SelectItem value="company">Company</SelectItem><SelectItem value="restricted">Restricted</SelectItem></SelectContent></Select><Button size="sm" className="rounded-full text-xs bg-[var(--saptta-accent)] hover:bg-[var(--saptta-accent)]/90 text-white" onClick={() => setAddHolidayOpen(true)}><Plus className="w-3.5 h-3.5 mr-1" />Add Holiday</Button></div></div></CardHeader><CardContent><ScrollArea className="max-h-96"><div className="space-y-2">{filteredHolidays.map((holiday)=>{const d=new Date(holiday.date);return(<div key={holiday.id} className="flex items-center justify-between p-3 rounded-2xl border border-[var(--saptta-line)] hover:border-[var(--saptta-accent)]/30 transition-colors"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-[var(--saptta-bg-2)] flex flex-col items-center justify-center"><span className="text-lg font-bold leading-none">{d.getDate()}</span><span className="text-[10px] text-[var(--saptta-mute)]">{d.toLocaleDateString("en-IN",{month:"short"})}</span></div><div><p className="font-medium text-sm">{holiday.name}</p><p className="text-xs text-[var(--saptta-mute)]">{d.toLocaleDateString("en-IN",{weekday:"long"})}</p></div></div><Badge variant="secondary" className={`rounded-full text-xs ${holiday.type==="National"?"bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)]":holiday.type==="Company"?"bg-[var(--saptta-accent-2)]/20 text-[#6b7a1e]":"bg-amber-100 text-amber-700"}`}>{holiday.type}</Badge></div>)})}</div></ScrollArea></CardContent></Card></motion.div>

      {/* ── Add Holiday Dialog ── */}
      <Dialog open={addHolidayOpen} onOpenChange={setAddHolidayOpen}>
        <DialogContent className="sm:max-w-sm rounded-[24px] p-0">
          <DialogHeader className="p-6 pb-3"><DialogTitle>Add Holiday</DialogTitle><DialogDescription className="text-xs text-[var(--saptta-mute)]">Add to the 2026 holiday calendar</DialogDescription></DialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <div><Label className="text-xs">Holiday Name *</Label><Input className="mt-1 rounded-xl text-sm" placeholder="e.g. Eid al-Fitr" value={newHoliday.name} onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})} /></div>
            <div><Label className="text-xs">Date *</Label><Input type="date" className="mt-1 rounded-xl text-sm" value={newHoliday.date} onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})} /></div>
            <div><Label className="text-xs">Type</Label>
              <Select value={newHoliday.type} onValueChange={(v) => setNewHoliday({...newHoliday, type: v})}>
                <SelectTrigger className="mt-1 rounded-xl text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="National">National</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                  <SelectItem value="Restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 rounded-xl text-xs" onClick={() => setAddHolidayOpen(false)}>Cancel</Button>
              <Button className="flex-1 rounded-xl text-xs bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90" onClick={() => { if (!newHoliday.name || !newHoliday.date) { toast.error("Name and date are required"); return; } setAddHolidayOpen(false); toast.success(`"${newHoliday.name}" added to holiday calendar`); setNewHoliday({ name: "", date: "", type: "National" }); }}>Add Holiday</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AttendanceView() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--saptta-ink)] tracking-tight">Attendance & Leave</h1>
        <p className="text-[var(--saptta-mute)] mt-1 text-sm">Track attendance, manage shifts, apply leaves & view holidays.</p>
      </motion.div>
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="attendance" className="w-full">
          <TabsList className="bg-[var(--saptta-bg-2)] rounded-full p-1 h-auto mb-6 flex-wrap">
            <TabsTrigger value="attendance" className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white"><Clock className="w-4 h-4 mr-2" />Attendance</TabsTrigger>
            <TabsTrigger value="shifts" className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white"><Calendar className="w-4 h-4 mr-2" />Shifts & Roster</TabsTrigger>
            <TabsTrigger value="leave" className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white"><Plane className="w-4 h-4 mr-2" />Leave</TabsTrigger>
            <TabsTrigger value="holidays" className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white"><Sun className="w-4 h-4 mr-2" />Holidays</TabsTrigger>
          </TabsList>
          <TabsContent value="attendance"><AttendanceTab /></TabsContent>
          <TabsContent value="shifts"><ShiftsRosterTab /></TabsContent>
          <TabsContent value="leave"><LeaveTab /></TabsContent>
          <TabsContent value="holidays"><HolidaysTab /></TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}