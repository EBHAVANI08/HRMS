"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  FileText,
  DollarSign,
  Clock,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  Users,
  Network,
  BookOpen,
  ListFilter,
  Briefcase,
  GraduationCap,
  Shield,
  Banknote,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore, type CoreHrTab } from "@/lib/store";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/* ──────────────── Types ──────────────── */

type EmployeeStatus = "Active" | "On Leave" | "Probation" | "Notice";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  department: string;
  designation: string;
  location: string;
  status: EmployeeStatus;
  joinDate: string;
  dob: string;
  manager: string;
  emergencyContact: string;
  emergencyPhone: string;
  bankName: string;
  bankAccount: string;
  ifscCode: string;
  pan: string;
  salary: number;
  promotions: Array<{ title: string; date: string; from: string }>;
  documents: Array<{ name: string; type: string; date: string; size: string }>;
  timeline: Array<{ event: string; date: string; type: string }>;
}

/* ──────────────── Animation Config ──────────────── */

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 0.8, 0.22, 1] } },
};

/* ──────────────── Mock Data ──────────────── */

const DEPARTMENTS = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations", "Design", "Product"];
const LOCATIONS = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"];
const STATUSES: EmployeeStatus[] = ["Active", "On Leave", "Probation", "Notice"];

const employees: Employee[] = [
  {
    id: "EMP001", name: "Aarav Patel", email: "aarav.patel@kamglobal.com", phone: "+91 98765 43210",
    employeeId: "SAP-001", department: "Engineering", designation: "Senior Software Engineer", location: "Bangalore",
    status: "Active", joinDate: "2021-03-15", dob: "1992-07-22", manager: "Vikram Singh",
    emergencyContact: "Meera Patel", emergencyPhone: "+91 98765 43211", bankName: "HDFC Bank",
    bankAccount: "XXXX-XXXX-4521", ifscCode: "HDFC0001234", pan: "ABCPD1234K", salary: 2400000,
    promotions: [{ title: "Senior Software Engineer", date: "2023-06-01", from: "Software Engineer" }],
    documents: [
      { name: "Offer Letter", type: "PDF", date: "2021-03-01", size: "245 KB" },
      { name: "Aadhaar Card", type: "PDF", date: "2021-03-10", size: "512 KB" },
      { name: "PAN Card", type: "PDF", date: "2021-03-10", size: "180 KB" },
    ],
    timeline: [
      { event: "Joined as Software Engineer", date: "2021-03-15", type: "hire" },
      { event: "Completed probation", date: "2021-06-15", type: "milestone" },
      { event: "Promoted to Senior Software Engineer", date: "2023-06-01", type: "promotion" },
    ],
  },
  {
    id: "EMP002", name: "Priya Sharma", email: "priya.sharma@kamglobal.com", phone: "+91 98123 45670",
    employeeId: "SAP-002", department: "Design", designation: "Lead Designer", location: "Mumbai",
    status: "Active", joinDate: "2020-08-01", dob: "1990-11-05", manager: "Rahul Verma",
    emergencyContact: "Rakesh Sharma", emergencyPhone: "+91 98123 45671", bankName: "ICICI Bank",
    bankAccount: "XXXX-XXXX-7832", ifscCode: "ICIC0005678", pan: "BCDPS5678L", salary: 2800000,
    promotions: [
      { title: "Senior Designer", date: "2022-01-01", from: "Designer" },
      { title: "Lead Designer", date: "2024-01-01", from: "Senior Designer" },
    ],
    documents: [
      { name: "Offer Letter", type: "PDF", date: "2020-07-20", size: "230 KB" },
      { name: "Aadhaar Card", type: "PDF", date: "2020-07-25", size: "490 KB" },
    ],
    timeline: [
      { event: "Joined as Designer", date: "2020-08-01", type: "hire" },
      { event: "Promoted to Senior Designer", date: "2022-01-01", type: "promotion" },
      { event: "Promoted to Lead Designer", date: "2024-01-01", type: "promotion" },
    ],
  },
  {
    id: "EMP003", name: "Arjun Mehta", email: "arjun.mehta@kamglobal.com", phone: "+91 97654 32100",
    employeeId: "SAP-003", department: "Marketing", designation: "Marketing Manager", location: "Delhi",
    status: "On Leave", joinDate: "2019-11-10", dob: "1988-03-14", manager: "Sneha Patil",
    emergencyContact: "Kavita Mehta", emergencyPhone: "+91 97654 32101", bankName: "SBI",
    bankAccount: "XXXX-XXXX-3456", ifscCode: "SBIN0009012", pan: "CDKPA9012M", salary: 2200000,
    promotions: [{ title: "Marketing Manager", date: "2022-06-01", from: "Senior Marketing Associate" }],
    documents: [
      { name: "Offer Letter", type: "PDF", date: "2019-11-01", size: "260 KB" },
      { name: "Aadhaar Card", type: "PDF", date: "2019-11-05", size: "530 KB" },
    ],
    timeline: [
      { event: "Joined as Senior Marketing Associate", date: "2019-11-10", type: "hire" },
      { event: "Promoted to Marketing Manager", date: "2022-06-01", type: "promotion" },
      { event: "On leave (personal)", date: "2025-05-28", type: "leave" },
    ],
  },
  {
    id: "EMP004", name: "Kavitha Reddy", email: "kavitha.reddy@kamglobal.com", phone: "+91 98321 67890",
    employeeId: "SAP-004", department: "Design", designation: "Lead Designer", location: "Hyderabad",
    status: "Active", joinDate: "2020-01-20", dob: "1991-09-18", manager: "Rahul Verma",
    emergencyContact: "Suresh Reddy", emergencyPhone: "+91 98321 67891", bankName: "Axis Bank",
    bankAccount: "XXXX-XXXX-9102", ifscCode: "UTIB0003456", pan: "DEFKR3456N", salary: 3000000,
    promotions: [
      { title: "Senior Designer", date: "2021-07-01", from: "Designer" },
      { title: "Lead Designer", date: "2023-07-01", from: "Senior Designer" },
    ],
    documents: [{ name: "Offer Letter", type: "PDF", date: "2020-01-10", size: "240 KB" }],
    timeline: [
      { event: "Joined as Designer", date: "2020-01-20", type: "hire" },
      { event: "Promoted to Senior Designer", date: "2021-07-01", type: "promotion" },
      { event: "Promoted to Lead Designer", date: "2023-07-01", type: "promotion" },
    ],
  },
  {
    id: "EMP005", name: "Rahul Verma", email: "rahul.verma@kamglobal.com", phone: "+91 98456 71230",
    employeeId: "SAP-005", department: "Product", designation: "VP of Product", location: "Bangalore",
    status: "Active", joinDate: "2018-05-01", dob: "1985-12-30", manager: "CEO",
    emergencyContact: "Anita Verma", emergencyPhone: "+91 98456 71231", bankName: "HDFC Bank",
    bankAccount: "XXXX-XXXX-6789", ifscCode: "HDFC0007890", pan: "GHIRV7890P", salary: 5500000,
    promotions: [
      { title: "Director of Product", date: "2020-05-01", from: "Senior PM" },
      { title: "VP of Product", date: "2023-01-01", from: "Director of Product" },
    ],
    documents: [
      { name: "Offer Letter", type: "PDF", date: "2018-04-20", size: "280 KB" },
      { name: "Passport", type: "PDF", date: "2018-04-25", size: "1.2 MB" },
    ],
    timeline: [
      { event: "Joined as Senior PM", date: "2018-05-01", type: "hire" },
      { event: "Promoted to Director of Product", date: "2020-05-01", type: "promotion" },
      { event: "Promoted to VP of Product", date: "2023-01-01", type: "promotion" },
    ],
  },
  {
    id: "EMP006", name: "Deepak Nair", email: "deepak.nair@kamglobal.com", phone: "+91 97890 12345",
    employeeId: "SAP-006", department: "Sales", designation: "Sales Lead", location: "Chennai",
    status: "Notice", joinDate: "2021-09-01", dob: "1993-06-10", manager: "Amit Joshi",
    emergencyContact: "Lakshmi Nair", emergencyPhone: "+91 97890 12346", bankName: "Kotak Bank",
    bankAccount: "XXXX-XXXX-2345", ifscCode: "KKBK0002345", pan: "JKLDN2345Q", salary: 1800000,
    promotions: [],
    documents: [{ name: "Offer Letter", type: "PDF", date: "2021-08-25", size: "250 KB" }],
    timeline: [
      { event: "Joined as Sales Lead", date: "2021-09-01", type: "hire" },
      { event: "Resignation submitted", date: "2025-05-20", type: "notice" },
    ],
  },
  {
    id: "EMP007", name: "Sneha Patil", email: "sneha.patil@kamglobal.com", phone: "+91 98567 89012",
    employeeId: "SAP-007", department: "Finance", designation: "Finance Manager", location: "Pune",
    status: "Active", joinDate: "2019-04-15", dob: "1989-01-25", manager: "Rahul Verma",
    emergencyContact: "Rajesh Patil", emergencyPhone: "+91 98567 89013", bankName: "SBI",
    bankAccount: "XXXX-XXXX-5678", ifscCode: "SBIN0005678", pan: "LMNSP5678R", salary: 2600000,
    promotions: [{ title: "Finance Manager", date: "2022-04-01", from: "Senior Accountant" }],
    documents: [{ name: "Offer Letter", type: "PDF", date: "2019-04-05", size: "255 KB" }],
    timeline: [
      { event: "Joined as Senior Accountant", date: "2019-04-15", type: "hire" },
      { event: "Promoted to Finance Manager", date: "2022-04-01", type: "promotion" },
    ],
  },
  {
    id: "EMP008", name: "Vikram Singh", email: "vikram.singh@kamglobal.com", phone: "+91 98234 56789",
    employeeId: "SAP-008", department: "Engineering", designation: "Engineering Manager", location: "Bangalore",
    status: "Active", joinDate: "2018-11-01", dob: "1987-08-15", manager: "CTO",
    emergencyContact: "Priti Singh", emergencyPhone: "+91 98234 56790", bankName: "ICICI Bank",
    bankAccount: "XXXX-XXXX-8901", ifscCode: "ICIC0008901", pan: "NOPVS8901S", salary: 4200000,
    promotions: [
      { title: "Engineering Manager", date: "2020-05-01", from: "Tech Lead" },
    ],
    documents: [
      { name: "Offer Letter", type: "PDF", date: "2018-10-20", size: "270 KB" },
      { name: "Relieving Letter (Prev)", type: "PDF", date: "2018-10-28", size: "180 KB" },
    ],
    timeline: [
      { event: "Joined as Tech Lead", date: "2018-11-01", type: "hire" },
      { event: "Promoted to Engineering Manager", date: "2020-05-01", type: "promotion" },
    ],
  },
  {
    id: "EMP009", name: "Neha Gupta", email: "neha.gupta@kamglobal.com", phone: "+91 98345 67890",
    employeeId: "SAP-009", department: "HR", designation: "HR Business Partner", location: "Delhi",
    status: "Probation", joinDate: "2025-02-01", dob: "1995-04-08", manager: "Sneha Patil",
    emergencyContact: "Sunil Gupta", emergencyPhone: "+91 98345 67891", bankName: "HDFC Bank",
    bankAccount: "XXXX-XXXX-1234", ifscCode: "HDFC0001234", pan: "PQRNG1234T", salary: 1200000,
    promotions: [],
    documents: [{ name: "Offer Letter", type: "PDF", date: "2025-01-25", size: "240 KB" }],
    timeline: [
      { event: "Joined as HR Business Partner", date: "2025-02-01", type: "hire" },
    ],
  },
  {
    id: "EMP010", name: "Amit Joshi", email: "amit.joshi@kamglobal.com", phone: "+91 98456 78901",
    employeeId: "SAP-010", department: "Sales", designation: "Regional Sales Head", location: "Mumbai",
    status: "Active", joinDate: "2017-07-10", dob: "1984-10-20", manager: "COO",
    emergencyContact: "Ritu Joshi", emergencyPhone: "+91 98456 78902", bankName: "Axis Bank",
    bankAccount: "XXXX-XXXX-4567", ifscCode: "UTIB0004567", pan: "STUAJ4567U", salary: 3800000,
    promotions: [{ title: "Regional Sales Head", date: "2021-07-01", from: "Sales Manager" }],
    documents: [{ name: "Offer Letter", type: "PDF", date: "2017-07-01", size: "265 KB" }],
    timeline: [
      { event: "Joined as Sales Manager", date: "2017-07-10", type: "hire" },
      { event: "Promoted to Regional Sales Head", date: "2021-07-01", type: "promotion" },
    ],
  },
  {
    id: "EMP011", name: "Suresh Kumar", email: "suresh.kumar@kamglobal.com", phone: "+91 98567 89012",
    employeeId: "SAP-011", department: "Operations", designation: "Operations Lead", location: "Hyderabad",
    status: "Active", joinDate: "2022-06-15", dob: "1994-02-28", manager: "Vikram Singh",
    emergencyContact: "Padma Kumar", emergencyPhone: "+91 98567 89013", bankName: "SBI",
    bankAccount: "XXXX-XXXX-7890", ifscCode: "SBIN0007890", pan: "UVWSK7890V", salary: 1600000,
    promotions: [],
    documents: [{ name: "Offer Letter", type: "PDF", date: "2022-06-05", size: "248 KB" }],
    timeline: [{ event: "Joined as Operations Lead", date: "2022-06-15", type: "hire" }],
  },
  {
    id: "EMP012", name: "Riya Kapoor", email: "riya.kapoor@kamglobal.com", phone: "+91 98678 90123",
    employeeId: "SAP-012", department: "Marketing", designation: "Content Strategist", location: "Bangalore",
    status: "Active", joinDate: "2023-01-09", dob: "1996-05-12", manager: "Arjun Mehta",
    emergencyContact: "Anil Kapoor", emergencyPhone: "+91 98678 90124", bankName: "Kotak Bank",
    bankAccount: "XXXX-XXXX-0123", ifscCode: "KKBK0000123", pan: "WXYZK0123W", salary: 1400000,
    promotions: [],
    documents: [{ name: "Offer Letter", type: "PDF", date: "2023-01-02", size: "242 KB" }],
    timeline: [{ event: "Joined as Content Strategist", date: "2023-01-09", type: "hire" }],
  },
];

/* ──────────────── Status Config ──────────────── */

const statusConfig: Record<EmployeeStatus, { bg: string; text: string; dot: string }> = {
  Active: { bg: "bg-green-50 dark:bg-green-950", text: "text-green-600 dark:text-green-400", dot: "#22c55e" },
  "On Leave": { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-600 dark:text-amber-400", dot: "#f59e0b" },
  Probation: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-600 dark:text-blue-400", dot: "#3b82f6" },
  Notice: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-600 dark:text-red-400", dot: "#ef4444" },
};

/* ──────────────── Pagination ──────────────── */

const PAGE_SIZE = 8;

/* ──────────────── Info / Comp Rows ──────────────── */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--saptta-mute)] italic mb-0.5">{label}</p>
      <p className="text-sm text-[var(--saptta-ink)] dark:text-[var(--saptta-ink)]">{value}</p>
    </div>
  );
}

function CompRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[var(--saptta-line)] dark:border-[var(--saptta-dark-line)] last:border-0">
      <span className="text-sm text-[var(--saptta-ink-2)]">{label}</span>
      <span className="text-sm font-medium text-[var(--saptta-ink)]">{value}</span>
    </div>
  );
}

/* ──────────────── Employee Detail View ──────────────── */

function EmployeeDetailView({ employee, onBack }: { employee: Employee; onBack: () => void }) {
  const [detailTab, setDetailTab] = useState("personal");
  const [emailOpen, setEmailOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [emailBody, setEmailBody] = useState("");
  const [msgText, setMsgText] = useState("");
  const initials = employee.name.split(" ").map((n) => n[0]).join("");

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 0.8, 0.22, 1] }}
      className="space-y-6"
    >
      <Button variant="ghost" className="text-sm text-[var(--saptta-mute)] hover:text-[var(--saptta-ink)] p-0 h-auto" onClick={onBack}>
        <ChevronLeft className="size-4 mr-1" /> Back to Employees
      </Button>

      {/* Profile Header */}
      <Card className="border-[var(--saptta-line)] rounded-[24px]">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="size-20 rounded-2xl">
              <AvatarFallback className="text-2xl font-bold bg-[var(--saptta-accent)] text-white rounded-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--saptta-ink)]">{employee.name}</h2>
                  <p className="text-base text-[var(--saptta-ink-2)]">{employee.designation}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-sm text-[var(--saptta-mute)] flex items-center gap-1">
                      <Building2 className="size-3.5" /> {employee.department}
                    </span>
                    <span className="text-sm text-[var(--saptta-mute)] flex items-center gap-1">
                      <MapPin className="size-3.5" /> {employee.location}
                    </span>
                    <span className="text-sm text-[var(--saptta-mute)] flex items-center gap-1">
                      <Calendar className="size-3.5" /> Joined {employee.joinDate}
                    </span>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 saptta-tag px-3 py-1 text-sm font-medium ${statusConfig[employee.status].bg} ${statusConfig[employee.status].text}`}>
                  <span className="size-2 rounded-full" style={{ backgroundColor: statusConfig[employee.status].dot }} />
                  {employee.status}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="rounded-xl bg-[var(--saptta-ink)] text-white h-8 text-xs" onClick={() => setEmailOpen(true)}>
                  <Mail className="size-3.5 mr-1" /> Email
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl border-[var(--saptta-line)] h-8 text-xs" onClick={() => toast.info(`Calling ${employee.name} · ${employee.phone}`)}>
                  <Phone className="size-3.5 mr-1" /> Call
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl border-[var(--saptta-line)] h-8 text-xs" onClick={() => setDetailTab("documents")}>
                  <FileText className="size-3.5 mr-1" /> Documents
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl border-[var(--saptta-line)] h-8 text-xs" onClick={() => setMsgOpen(true)}>
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Tabs */}
      <Tabs value={detailTab} onValueChange={setDetailTab}>
        <TabsList className="bg-[var(--saptta-bg-2)] dark:bg-[var(--saptta-dark-card)] p-1 rounded-[20px]">
          {["personal", "employment", "documents", "compensation", "timeline"].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-[var(--saptta-dark-card)] data-[state=active]:text-[var(--saptta-accent)] rounded-2xl px-4 capitalize">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="personal" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-[var(--saptta-line)] rounded-[24px]">
              <CardContent className="p-5">
                <h4 className="text-sm font-semibold text-[var(--saptta-ink)] mb-4 flex items-center gap-2">
                  <Phone className="size-4 text-[var(--saptta-accent)]" /> Contact Information
                </h4>
                <div className="space-y-3">
                  <InfoRow label="Email" value={employee.email} />
                  <InfoRow label="Phone" value={employee.phone} />
                  <InfoRow label="Location" value={employee.location} />
                  <InfoRow label="Date of Birth" value={employee.dob} />
                </div>
              </CardContent>
            </Card>
            <Card className="border-[var(--saptta-line)] rounded-[24px]">
              <CardContent className="p-5">
                <h4 className="text-sm font-semibold text-[var(--saptta-ink)] mb-4 flex items-center gap-2">
                  <Shield className="size-4 text-[var(--saptta-accent)]" /> Emergency Contact
                </h4>
                <div className="space-y-3">
                  <InfoRow label="Contact Name" value={employee.emergencyContact} />
                  <InfoRow label="Contact Phone" value={employee.emergencyPhone} />
                </div>
              </CardContent>
            </Card>
            <Card className="border-[var(--saptta-line)] rounded-[24px] md:col-span-2">
              <CardContent className="p-5">
                <h4 className="text-sm font-semibold text-[var(--saptta-ink)] mb-4 flex items-center gap-2">
                  <Banknote className="size-4 text-[var(--saptta-accent)]" /> Bank Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <InfoRow label="Bank Name" value={employee.bankName} />
                  <InfoRow label="Account Number" value={employee.bankAccount} />
                  <InfoRow label="IFSC Code" value={employee.ifscCode} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employment" className="mt-4">
          <div className="space-y-4">
            <Card className="border-[var(--saptta-line)] rounded-[24px]">
              <CardContent className="p-5">
                <h4 className="text-sm font-semibold text-[var(--saptta-ink)] mb-4 flex items-center gap-2">
                  <Briefcase className="size-4 text-[var(--saptta-accent)]" /> Current Role
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <InfoRow label="Designation" value={employee.designation} />
                  <InfoRow label="Department" value={employee.department} />
                  <InfoRow label="Manager" value={employee.manager} />
                  <InfoRow label="Join Date" value={employee.joinDate} />
                  <InfoRow label="Employee ID" value={employee.employeeId} />
                  <InfoRow label="Location" value={employee.location} />
                </div>
              </CardContent>
            </Card>
            {employee.promotions.length > 0 && (
              <Card className="border-[var(--saptta-line)] rounded-[24px]">
                <CardContent className="p-5">
                  <h4 className="text-sm font-semibold text-[var(--saptta-ink)] mb-4 flex items-center gap-2">
                    <GraduationCap className="size-4 text-[var(--saptta-accent-2)]" /> Promotion History
                  </h4>
                  <div className="space-y-3">
                    {employee.promotions.map((p, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--saptta-bg-2)]">
                        <div className="size-8 rounded-[16px] flex items-center justify-center bg-[var(--saptta-accent-2)]/20 text-[var(--saptta-accent-2)]">
                          <GraduationCap className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--saptta-ink)]">{p.title}</p>
                          <p className="text-xs text-[var(--saptta-mute)]">From {p.from} · {p.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card className="border-[var(--saptta-line)] rounded-[24px]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-[var(--saptta-ink)] flex items-center gap-2">
                  <FileText className="size-4 text-[var(--saptta-accent)]" /> Uploaded Documents
                </h4>
                <Button size="sm" className="rounded-xl bg-[var(--saptta-accent)] text-white h-8 text-xs hover:bg-[var(--saptta-accent)]/90" onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".pdf,.doc,.docx,.jpg,.png"; inp.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) toast.success(`Uploading "${f.name}" for ${employee.name}...`); }; inp.click(); }}>
                  <Upload className="size-3.5 mr-1" /> Upload
                </Button>
              </div>
              <div className="space-y-2">
                {employee.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--saptta-bg-2)] hover:bg-[var(--saptta-line)] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-[16px] flex items-center justify-center bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)]">
                        <FileText className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--saptta-ink)]">{doc.name}</p>
                        <p className="text-xs text-[var(--saptta-mute)]">{doc.type} · {doc.size} · {doc.date}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => toast.success(`Downloading "${doc.name}"...`)}>
                      <Download className="size-4 text-[var(--saptta-mute)]" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compensation" className="mt-4">
          <Card className="border-[var(--saptta-line)] rounded-[24px]">
            <CardContent className="p-5">
              <h4 className="text-sm font-semibold text-[var(--saptta-ink)] mb-4 flex items-center gap-2">
                <DollarSign className="size-4 text-[var(--saptta-accent)]" /> Salary Structure
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--saptta-bg-2)]">
                  <p className="text-xs text-[var(--saptta-mute)] italic mb-1">CTC (Annual)</p>
                  <p className="text-3xl font-bold text-[var(--saptta-ink)] tracking-[-1px]" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatCurrency(employee.salary)}
                  </p>
                </div>
                <div className="space-y-2">
                  <CompRow label="Basic Salary" value={formatCurrency(Math.round(employee.salary * 0.4))} />
                  <CompRow label="HRA" value={formatCurrency(Math.round(employee.salary * 0.2))} />
                  <CompRow label="Special Allowance" value={formatCurrency(Math.round(employee.salary * 0.2))} />
                  <CompRow label="PF Contribution" value={formatCurrency(Math.round(employee.salary * 0.12 * 0.4))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card className="border-[var(--saptta-line)] rounded-[24px]">
            <CardContent className="p-5">
              <h4 className="text-sm font-semibold text-[var(--saptta-ink)] mb-4 flex items-center gap-2">
                <Clock className="size-4 text-[var(--saptta-accent)]" /> Activity Log
              </h4>
              <div className="relative">
                {employee.timeline.map((event, i) => {
                  const dotColor = event.type === "hire" ? "var(--saptta-accent-2)" : event.type === "promotion" ? "var(--saptta-accent)" : event.type === "notice" ? "#ef4444" : "#4d94db";
                  return (
                    <div key={i} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className="size-3 rounded-full border-2 border-white dark:border-[var(--saptta-dark-card)]" style={{ backgroundColor: dotColor }} />
                        {i < employee.timeline.length - 1 && <div className="w-0.5 flex-1 bg-[var(--saptta-line)] dark:bg-[var(--saptta-dark-line)] mt-1" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--saptta-ink)]">{event.event}</p>
                        <p className="text-xs text-[var(--saptta-mute)] mt-0.5">{event.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Email Dialog ── */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-lg rounded-[24px]">
          <DialogHeader>
            <DialogTitle>Email {employee.name}</DialogTitle>
            <DialogDescription className="text-xs text-[var(--saptta-mute)]">Compose and send an email to {employee.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">To</Label><input className="mt-1 w-full rounded-xl border border-[var(--saptta-line)] px-3 py-2 text-sm bg-[var(--saptta-bg-2)]" value={employee.email} readOnly /></div>
            <div><Label className="text-xs">Subject</Label><input className="mt-1 w-full rounded-xl border border-[var(--saptta-line)] px-3 py-2 text-sm" placeholder="e.g. Performance Review – June 2026" /></div>
            <div><Label className="text-xs">Message</Label><Textarea className="mt-1 rounded-xl border-[var(--saptta-line)] text-sm min-h-[120px]" placeholder={`Hi ${employee.name.split(" ")[0]},\n\n`} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button className="rounded-xl bg-[var(--saptta-ink)] text-white hover:bg-[var(--saptta-ink)]/90" onClick={() => { setEmailOpen(false); setEmailBody(""); toast.success(`Email sent to ${employee.name}`); }}>
              <Mail className="size-3.5 mr-1.5" />Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Send Message Dialog ── */}
      <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
        <DialogContent className="sm:max-w-md rounded-[24px]">
          <DialogHeader>
            <DialogTitle>Message {employee.name}</DialogTitle>
            <DialogDescription className="text-xs text-[var(--saptta-mute)]">Send an internal message</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">To</Label><input className="mt-1 w-full rounded-xl border border-[var(--saptta-line)] px-3 py-2 text-sm bg-[var(--saptta-bg-2)]" value={`${employee.name} (${employee.employeeId})`} readOnly /></div>
            <div><Label className="text-xs">Message</Label><Textarea className="mt-1 rounded-xl border-[var(--saptta-line)] text-sm min-h-[100px]" placeholder="Type your message..." value={msgText} onChange={(e) => setMsgText(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setMsgOpen(false)}>Cancel</Button>
            <Button className="rounded-xl bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90" onClick={() => { setMsgOpen(false); setMsgText(""); toast.success(`Message sent to ${employee.name}`); }}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

/* ──────────────── Org Chart ──────────────── */

interface OrgNode {
  id: string;
  name: string;
  designation: string;
  department: string;
  avatar: string;
  children: OrgNode[];
}

const orgData: OrgNode = {
  id: "CEO", name: "Ananya Iyer", designation: "CEO", department: "Executive", avatar: "AI",
  children: [
    {
      id: "CTO", name: "Rohan Das", designation: "CTO", department: "Technology", avatar: "RD",
      children: [
        {
          id: "ENG_MGR", name: "Vikram Singh", designation: "Engineering Manager", department: "Engineering", avatar: "VS",
          children: [
            { id: "SWE1", name: "Aarav Patel", designation: "Senior Engineer", department: "Engineering", avatar: "AP", children: [] },
            { id: "SWE2", name: "Nisha Rao", designation: "Software Engineer", department: "Engineering", avatar: "NR", children: [] },
          ],
        },
        {
          id: "DESIGN_LEAD", name: "Kavitha Reddy", designation: "Lead Designer", department: "Design", avatar: "KR",
          children: [
            { id: "DES1", name: "Priya Sharma", designation: "Lead Designer", department: "Design", avatar: "PS", children: [] },
          ],
        },
      ],
    },
    {
      id: "COO", name: "Manish Tiwari", designation: "COO", department: "Operations", avatar: "MT",
      children: [
        { id: "OPS_LEAD", name: "Suresh Kumar", designation: "Operations Lead", department: "Operations", avatar: "SK", children: [] },
        {
          id: "SALES_HEAD", name: "Amit Joshi", designation: "Regional Sales Head", department: "Sales", avatar: "AJ",
          children: [
            { id: "SALES1", name: "Deepak Nair", designation: "Sales Lead", department: "Sales", avatar: "DN", children: [] },
          ],
        },
      ],
    },
    {
      id: "CFO", name: "Lata Menon", designation: "CFO", department: "Finance", avatar: "LM",
      children: [
        { id: "FIN_MGR", name: "Sneha Patil", designation: "Finance Manager", department: "Finance", avatar: "SP", children: [] },
      ],
    },
  ],
};

function OrgNodeCard({ node, onSelect }: { node: OrgNode; onSelect: (id: string) => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(255,106,44,0.15)" }}
      transition={{ duration: 0.2, ease: [0.22, 0.8, 0.22, 1] }}
      className="bg-white dark:bg-[var(--saptta-dark-card)] border border-[var(--saptta-line)] dark:border-[var(--saptta-dark-line)] rounded-[20px] p-3 cursor-pointer min-w-[160px] max-w-[200px]"
      onClick={() => onSelect(node.id)}
    >
      <div className="flex items-center gap-2 mb-1">
        <Avatar className="size-8 rounded-lg">
          <AvatarFallback className="text-xs font-medium bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] rounded-lg">{node.avatar}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[var(--saptta-ink)] truncate">{node.name}</p>
          <p className="text-[10px] text-[var(--saptta-mute)] truncate">{node.designation}</p>
        </div>
      </div>
      <span className="saptta-tag text-[10px]">{node.department}</span>
    </motion.div>
  );
}

function OrgTree({ node, onSelect }: { node: OrgNode; onSelect: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center">
      <OrgNodeCard node={node} onSelect={onSelect} />
      {node.children.length > 0 && (
        <>
          <div className="w-0.5 h-6 bg-[var(--saptta-line)] dark:bg-[var(--saptta-dark-line)]" />
          <div className="flex gap-6 items-start relative">
            {node.children.length > 1 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 bg-[var(--saptta-line)] dark:bg-[var(--saptta-dark-line)]" style={{ width: `${Math.min((node.children.length - 1) * 200, 400)}px` }} />
            )}
            {node.children.map((child, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-0.5 h-4 bg-[var(--saptta-line)] dark:bg-[var(--saptta-dark-line)]" />
                <OrgTree node={child} onSelect={onSelect} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function OrgChartTab() {
  const { setSelectedEmployeeId } = useAppStore();
  const [zoom, setZoom] = useState(100);

  const handleSelect = (nodeId: string) => {
    const emp = employees.find((e) => {
      const initials = e.name.split(" ").map((n) => n[0]).join("");
      return e.employeeId === nodeId || initials === nodeId;
    });
    if (emp) setSelectedEmployeeId(emp.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--saptta-mute)]">Click on any node to view employee details</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="size-8 rounded-xl border-[var(--saptta-line)]" onClick={() => setZoom(Math.max(50, zoom - 10))}>
            <ZoomOut className="size-4" />
          </Button>
          <span className="text-xs text-[var(--saptta-mute)] w-12 text-center">{zoom}%</span>
          <Button variant="outline" size="icon" className="size-8 rounded-xl border-[var(--saptta-line)]" onClick={() => setZoom(Math.min(150, zoom + 10))}>
            <ZoomIn className="size-4" />
          </Button>
        </div>
      </div>
      <Card className="border-[var(--saptta-line)] rounded-[24px] p-6 overflow-auto">
        <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center", transition: "transform 0.3s cubic-bezier(.22,.8,.22,1)" }} className="min-w-fit">
          <OrgTree node={orgData} onSelect={handleSelect} />
        </div>
      </Card>
    </div>
  );
}

/* ──────────────── Directory Tab ──────────────── */

function DirectoryTab() {
  const { setSelectedEmployeeId } = useAppStore();
  const [search, setSearch] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const filtered = employees.filter((emp) => {
    const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || emp.designation.toLowerCase().includes(search.toLowerCase());
    const matchLetter = !selectedLetter || emp.name[0].toUpperCase() === selectedLetter;
    return matchSearch && matchLetter;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--saptta-mute)]" />
          <Input
            placeholder="Search directory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-[20px] border-[var(--saptta-line)] h-10"
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Alphabetical index */}
        <div className="hidden md:flex flex-col items-center gap-0.5 sticky top-4 self-start">
          {alphabet.map((letter) => {
            const hasEmployees = employees.some((e) => e.name[0].toUpperCase() === letter);
            return (
              <button
                key={letter}
                onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
                className={`size-7 rounded-lg text-xs font-medium transition-colors ${
                  selectedLetter === letter
                    ? "bg-[var(--saptta-accent)] text-white"
                    : hasEmployees
                    ? "text-[var(--saptta-ink)] hover:bg-[var(--saptta-bg-2)]"
                    : "text-[var(--saptta-line)] cursor-default"
                }`}
                disabled={!hasEmployees}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Card grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp, i) => (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03, ease: [0.22, 0.8, 0.22, 1] }}
            >
              <Card
                className="saptta-module-card border-[var(--saptta-line)] bg-white hover:shadow-lg transition-shadow duration-300 rounded-[20px] cursor-pointer"
                onClick={() => setSelectedEmployeeId(emp.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="size-11 rounded-xl">
                      <AvatarFallback className="text-sm font-medium bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] rounded-xl">
                        {emp.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--saptta-ink)] truncate">{emp.name}</p>
                      <p className="text-xs text-[var(--saptta-mute)] truncate">{emp.designation}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="saptta-tag text-[10px]">{emp.department}</span>
                    <span className={`inline-flex items-center gap-1 saptta-tag px-2 py-0.5 text-[10px] font-medium ${statusConfig[emp.status].bg} ${statusConfig[emp.status].text}`}>
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: statusConfig[emp.status].dot }} />
                      {emp.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users className="size-10 text-[var(--saptta-line)] mx-auto mb-3" />
              <p className="text-sm text-[var(--saptta-mute)]">No employees found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Employees Tab ──────────────── */

function EmployeesTab() {
  const { selectedEmployeeId, setSelectedEmployeeId } = useAppStore();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [locFilter, setLocFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);
  const [bulkEmailOpen, setBulkEmailOpen] = useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: "", email: "", department: "", designation: "", location: "", status: "Active" as EmployeeStatus });

  const filtered = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || emp.department === deptFilter;
    const matchLoc = locFilter === "all" || emp.location === locFilter;
    const matchStatus = statusFilter === "all" || emp.status === statusFilter;
    return matchSearch && matchDept && matchLoc && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  if (selectedEmployee) {
    return <EmployeeDetailView employee={selectedEmployee} onBack={() => setSelectedEmployeeId(null)} />;
  }

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--saptta-mute)]" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 rounded-[20px] border-[var(--saptta-line)] bg-white dark:bg-[var(--saptta-dark-card)] h-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px] rounded-[20px] border-[var(--saptta-line)] bg-white dark:bg-[var(--saptta-dark-card)] h-10 text-sm">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {DEPARTMENTS.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={locFilter} onValueChange={(v) => { setLocFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[130px] rounded-[20px] border-[var(--saptta-line)] bg-white dark:bg-[var(--saptta-dark-card)] h-10 text-sm">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {LOCATIONS.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[130px] rounded-[20px] border-[var(--saptta-line)] bg-white dark:bg-[var(--saptta-dark-card)] h-10 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-[999px] border-[var(--saptta-line)] text-sm h-10">
                <ListFilter className="size-4 mr-1" /> Bulk
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => toast.success("Exporting employee list as CSV...")}>Export CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setBulkEmailOpen(true)}>Send Bulk Email</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setBulkStatusOpen(true)}>Bulk Update Status</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="rounded-[999px] bg-[var(--saptta-accent)] text-white text-sm h-10 hover:bg-[var(--saptta-accent)]/90" onClick={() => setAddOpen(true)}>
            <Plus className="size-4 mr-1" /> Add Employee
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border-[var(--saptta-line)] rounded-[24px] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[var(--saptta-line)] hover:bg-transparent bg-[var(--saptta-bg-2)]">
                <TableHead className="text-xs font-semibold text-[var(--saptta-mute)] uppercase tracking-wider py-3">Employee</TableHead>
                <TableHead className="text-xs font-semibold text-[var(--saptta-mute)] uppercase tracking-wider py-3">ID</TableHead>
                <TableHead className="text-xs font-semibold text-[var(--saptta-mute)] uppercase tracking-wider py-3">Department</TableHead>
                <TableHead className="text-xs font-semibold text-[var(--saptta-mute)] uppercase tracking-wider py-3">Designation</TableHead>
                <TableHead className="text-xs font-semibold text-[var(--saptta-mute)] uppercase tracking-wider py-3">Location</TableHead>
                <TableHead className="text-xs font-semibold text-[var(--saptta-mute)] uppercase tracking-wider py-3">Status</TableHead>
                <TableHead className="text-xs font-semibold text-[var(--saptta-mute)] uppercase tracking-wider py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((emp, i) => (
                <motion.tr
                  key={emp.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03, ease: [0.22, 0.8, 0.22, 1] }}
                  className="border-b border-[var(--saptta-line)] dark:border-[var(--saptta-dark-line)] cursor-pointer hover:bg-[var(--saptta-bg-2)] transition-colors"
                  onClick={() => setSelectedEmployeeId(emp.id)}
                >
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 rounded-lg">
                        <AvatarFallback className="text-xs font-medium bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] rounded-lg">
                          {emp.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-[var(--saptta-ink)]">{emp.name}</p>
                        <p className="text-xs text-[var(--saptta-mute)]">{emp.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-[var(--saptta-ink-2)] font-mono">{emp.employeeId}</TableCell>
                  <TableCell className="py-3 text-sm text-[var(--saptta-ink-2)]">{emp.department}</TableCell>
                  <TableCell className="py-3 text-sm text-[var(--saptta-ink-2)]">{emp.designation}</TableCell>
                  <TableCell className="py-3 text-sm text-[var(--saptta-ink-2)]">{emp.location}</TableCell>
                  <TableCell className="py-3">
                    <span className={`inline-flex items-center gap-1.5 saptta-tag px-2.5 py-0.5 text-xs font-medium ${statusConfig[emp.status].bg} ${statusConfig[emp.status].text}`}>
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: statusConfig[emp.status].dot }} />
                      {emp.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4 text-[var(--saptta-mute)]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedEmployeeId(emp.id); }}>View Profile</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditEmp(emp); }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.success(`Message sent to ${emp.name}`); }}>Send Message</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--saptta-line)]">
          <p className="text-xs text-[var(--saptta-mute)]">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="size-8 rounded-xl border-[var(--saptta-line)]" disabled={page === 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i} variant={page === i + 1 ? "default" : "outline"} size="icon"
                className={`size-8 text-xs rounded-xl ${page === i + 1 ? "bg-[var(--saptta-accent)] hover:bg-[var(--saptta-accent)]/90 text-white" : "border-[var(--saptta-line)]"}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" size="icon" className="size-8 rounded-xl border-[var(--saptta-line)]" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Add Employee Dialog ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg rounded-[24px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription className="text-xs text-[var(--saptta-mute)]">Fill in the details to onboard a new employee</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label className="text-xs">Full Name *</Label><input className="mt-1 w-full rounded-xl border border-[var(--saptta-line)] px-3 py-2 text-sm" placeholder="e.g. Priya Sharma" value={newEmp.name} onChange={(e) => setNewEmp({...newEmp, name: e.target.value})} /></div>
            <div className="col-span-2"><Label className="text-xs">Work Email *</Label><input className="mt-1 w-full rounded-xl border border-[var(--saptta-line)] px-3 py-2 text-sm" placeholder="priya@kamglobal.com" value={newEmp.email} onChange={(e) => setNewEmp({...newEmp, email: e.target.value})} /></div>
            <div><Label className="text-xs">Department *</Label>
              <select className="mt-1 w-full rounded-xl border border-[var(--saptta-line)] px-3 py-2 text-sm" value={newEmp.department} onChange={(e) => setNewEmp({...newEmp, department: e.target.value})}>
                <option value="">Select...</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div><Label className="text-xs">Location</Label>
              <select className="mt-1 w-full rounded-xl border border-[var(--saptta-line)] px-3 py-2 text-sm" value={newEmp.location} onChange={(e) => setNewEmp({...newEmp, location: e.target.value})}>
                <option value="">Select...</option>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="col-span-2"><Label className="text-xs">Designation</Label><input className="mt-1 w-full rounded-xl border border-[var(--saptta-line)] px-3 py-2 text-sm" placeholder="e.g. Software Engineer" value={newEmp.designation} onChange={(e) => setNewEmp({...newEmp, designation: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="rounded-xl bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90" onClick={() => { if (!newEmp.name || !newEmp.email) { toast.error("Name and email are required"); return; } setAddOpen(false); toast.success(`${newEmp.name} added to ${newEmp.department || "the organisation"}`); setNewEmp({ name: "", email: "", department: "", designation: "", location: "", status: "Active" }); }}>
              <Plus className="size-3.5 mr-1.5" />Add Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Employee Dialog ── */}
      <Dialog open={!!editEmp} onOpenChange={(o) => { if (!o) setEditEmp(null); }}>
        <DialogContent className="sm:max-w-lg rounded-[24px]">
          <DialogHeader>
            <DialogTitle>Edit {editEmp?.name}</DialogTitle>
            <DialogDescription className="text-xs text-[var(--saptta-mute)]">Update employee information</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label className="text-xs">Full Name</Label><input defaultValue={editEmp?.name} className="mt-1 w-full rounded-xl border border-[var(--saptta-line)] px-3 py-2 text-sm" /></div>
            <div className="col-span-2"><Label className="text-xs">Work Email</Label><input defaultValue={editEmp?.email} className="mt-1 w-full rounded-xl border border-[var(--saptta-line)] px-3 py-2 text-sm" /></div>
            <div><Label className="text-xs">Department</Label><input defaultValue={editEmp?.department} className="mt-1 w-full rounded-xl border border-[var(--saptta-line)] px-3 py-2 text-sm" /></div>
            <div><Label className="text-xs">Location</Label><input defaultValue={editEmp?.location} className="mt-1 w-full rounded-xl border border-[var(--saptta-line)] px-3 py-2 text-sm" /></div>
            <div className="col-span-2"><Label className="text-xs">Designation</Label><input defaultValue={editEmp?.designation} className="mt-1 w-full rounded-xl border border-[var(--saptta-line)] px-3 py-2 text-sm" /></div>
            <div><Label className="text-xs">Status</Label>
              <select defaultValue={editEmp?.status} className="mt-1 w-full rounded-xl border border-[var(--saptta-line)] px-3 py-2 text-sm">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setEditEmp(null)}>Cancel</Button>
            <Button className="rounded-xl bg-[var(--saptta-ink)] text-white hover:bg-[var(--saptta-ink)]/90" onClick={() => { setEditEmp(null); toast.success(`${editEmp?.name} updated successfully`); }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Bulk Email Dialog ── */}
      <Dialog open={bulkEmailOpen} onOpenChange={setBulkEmailOpen}>
        <DialogContent className="sm:max-w-lg rounded-[24px]">
          <DialogHeader>
            <DialogTitle>Send Bulk Email</DialogTitle>
            <DialogDescription className="text-xs text-[var(--saptta-mute)]">Send an email to all {filtered.length} filtered employees</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">To</Label><input readOnly className="mt-1 w-full rounded-xl border border-[var(--saptta-line)] px-3 py-2 text-sm bg-[var(--saptta-bg-2)]" value={`All employees (${filtered.length} recipients)`} /></div>
            <div><Label className="text-xs">Subject</Label><input className="mt-1 w-full rounded-xl border border-[var(--saptta-line)] px-3 py-2 text-sm" placeholder="e.g. Company-wide Announcement" /></div>
            <div><Label className="text-xs">Message</Label><Textarea className="mt-1 rounded-xl border-[var(--saptta-line)] text-sm min-h-[100px]" placeholder="Dear Team,&#10;&#10;" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setBulkEmailOpen(false)}>Cancel</Button>
            <Button className="rounded-xl bg-[var(--saptta-ink)] text-white hover:bg-[var(--saptta-ink)]/90" onClick={() => { setBulkEmailOpen(false); toast.success(`Bulk email sent to ${filtered.length} employees`); }}>
              <Mail className="size-3.5 mr-1.5" />Send to All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Bulk Status Update Dialog ── */}
      <Dialog open={bulkStatusOpen} onOpenChange={setBulkStatusOpen}>
        <DialogContent className="sm:max-w-sm rounded-[24px]">
          <DialogHeader>
            <DialogTitle>Bulk Update Status</DialogTitle>
            <DialogDescription className="text-xs text-[var(--saptta-mute)]">Update status for all {filtered.length} filtered employees</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">New Status</Label>
              <select className="mt-1 w-full rounded-xl border border-[var(--saptta-line)] px-3 py-2 text-sm">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><Label className="text-xs">Reason (optional)</Label><Textarea className="mt-1 rounded-xl border-[var(--saptta-line)] text-sm" placeholder="Reason for bulk status change..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setBulkStatusOpen(false)}>Cancel</Button>
            <Button className="rounded-xl bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90" onClick={() => { setBulkStatusOpen(false); toast.success(`Status updated for ${filtered.length} employees`); }}>Apply Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ──────────────── Main Core HR View ──────────────── */

export function CoreHRView() {
  const { coreHrTab, setCoreHrTab, selectedEmployeeId, setSelectedEmployeeId } = useAppStore();

  // If an employee is selected, show detail view regardless of tab
  if (selectedEmployeeId) {
    const employee = employees.find((e) => e.id === selectedEmployeeId);
    if (employee) {
      return <EmployeeDetailView employee={employee} onBack={() => setSelectedEmployeeId(null)} />;
    }
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Page Header */}
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--saptta-ink)] tracking-tight">Core HR</h1>
          <p className="text-[var(--saptta-mute)] mt-1 text-sm">Manage your organization&apos;s people, structure, and policies.</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs value={coreHrTab} onValueChange={(v) => setCoreHrTab(v as CoreHrTab)}>
          <TabsList className="bg-[var(--saptta-bg-2)] dark:bg-[var(--saptta-dark-card)] p-1 rounded-[20px]">
            <TabsTrigger value="employees" className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-[var(--saptta-dark-card)] data-[state=active]:text-[var(--saptta-accent)] rounded-2xl px-5 gap-1.5">
              <Users className="size-4" /> Employees
            </TabsTrigger>
            <TabsTrigger value="orgchart" className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-[var(--saptta-dark-card)] data-[state=active]:text-[var(--saptta-accent)] rounded-2xl px-5 gap-1.5">
              <Network className="size-4" /> Org Chart
            </TabsTrigger>
            <TabsTrigger value="directory" className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-[var(--saptta-dark-card)] data-[state=active]:text-[var(--saptta-accent)] rounded-2xl px-5 gap-1.5">
              <BookOpen className="size-4" /> Directory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="mt-4">
            <EmployeesTab />
          </TabsContent>
          <TabsContent value="orgchart" className="mt-4">
            <OrgChartTab />
          </TabsContent>
          <TabsContent value="directory" className="mt-4">
            <DirectoryTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}