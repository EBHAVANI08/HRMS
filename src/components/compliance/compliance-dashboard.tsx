'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Eye, FileText, Clock, Database, AlertTriangle,
  CheckCircle2, XCircle, Info, ChevronRight, Search,
  Download, RefreshCw, Settings, BookOpen, Brain, Scale,
  Lock, Hash, Activity, TrendingUp, TrendingDown, Users,
  UserCheck, AlertCircle, EyeOff, Sliders, Play,
  FileWarning, Calendar, Globe, MapPin, Zap, Layers,
  BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon,
  ScatterChart as ScatterChartIcon, Fingerprint, ShieldCheck,
  Gavel, Timer, Trash2, ExternalLink, Save, RotateCcw,
  ClipboardCheck, BadgeCheck, BadgeX, BadgeAlert,
  Briefcase, Heart
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, Cell, ZAxis, ReferenceLine,
  PieChart, Pie
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';

/* ──────────────────────────────────────
   MOCK DATA
   ────────────────────────────────────── */

const CANDIDATES = [
  { id: 'c1', name: 'Ananya Krishnan', job: 'Senior Frontend Developer' },
  { id: 'c2', name: 'Rohan Patel', job: 'Backend Engineer' },
  { id: 'c3', name: 'Deepika Rao', job: 'Product Designer' },
  { id: 'c4', name: 'Arjun Mehta', job: 'Data Scientist' },
  { id: 'c5', name: 'Sneha Iyer', job: 'Sales Manager' },
  { id: 'c6', name: 'Vikram Singh', job: 'DevOps Engineer' },
  { id: 'c7', name: 'Priya Nair', job: 'Senior Frontend Developer' },
  { id: 'c8', name: 'Karthik Reddy', job: 'Backend Engineer' },
  { id: 'c9', name: 'Meera Sharma', job: 'Product Designer' },
  { id: 'c10', name: 'Aditya Gupta', job: 'Data Scientist' },
];

const JOBS = [
  'Senior Frontend Developer',
  'Backend Engineer',
  'Product Designer',
  'Data Scientist',
  'Sales Manager',
  'DevOps Engineer',
];

interface EvidenceItem {
  name: string;
  score: number;
  snippet: string;
  matchType: 'exact' | 'synonym' | 'semantic' | 'inferred';
  confidence: number;
  uncertaintyFlag: boolean;
  verificationRequired: boolean;
}

interface DimensionScore {
  dimension: string;
  score: number;
  items: EvidenceItem[];
  reasoning: string;
}

const GLASS_BOX_DATA: Record<string, {
  overall: number;
  proposedAction: string;
  blindScore: number;
  nonBlindScore: number;
  dimensions: DimensionScore[];
}> = {
  c1: {
    overall: 4.2,
    proposedAction: 'Proposed Interview',
    blindScore: 4.2,
    nonBlindScore: 4.5,
    dimensions: [
      {
        dimension: 'Skills',
        score: 4.5,
        items: [
          { name: 'React', score: 5, snippet: '"5 years of professional experience building React applications with Redux and Next.js"', matchType: 'exact', confidence: 0.95, uncertaintyFlag: false, verificationRequired: false },
          { name: 'TypeScript', score: 5, snippet: '"Expert-level TypeScript with generics, utility types, and advanced type patterns"', matchType: 'exact', confidence: 0.92, uncertaintyFlag: false, verificationRequired: false },
          { name: 'CSS/Tailwind', score: 4, snippet: '"Proficient in CSS3, SASS, and Tailwind CSS for responsive design"', matchType: 'exact', confidence: 0.88, uncertaintyFlag: false, verificationRequired: false },
          { name: 'GraphQL', score: 3, snippet: '"Familiar with GraphQL APIs and Apollo Client"', matchType: 'synonym', confidence: 0.72, uncertaintyFlag: true, verificationRequired: false },
          { name: 'WebGL/Three.js', score: 2, snippet: '"Basic knowledge of 3D rendering for product visualization"', matchType: 'inferred', confidence: 0.45, uncertaintyFlag: true, verificationRequired: true },
        ],
        reasoning: 'Strong frontend skills with proven React/TypeScript expertise. GraphQL experience noted but below job threshold. WebGL knowledge inferred from portfolio description—requires verification.',
      },
      {
        dimension: 'Experience',
        score: 4.0,
        items: [
          { name: 'Years of Experience', score: 5, snippet: '"7+ years of professional software development experience"', matchType: 'exact', confidence: 0.97, uncertaintyFlag: false, verificationRequired: false },
          { name: 'Team Leadership', score: 4, snippet: '"Led a team of 6 frontend developers at previous company"', matchType: 'exact', confidence: 0.90, uncertaintyFlag: false, verificationRequired: false },
          { name: 'Startup Experience', score: 3, snippet: '"Worked in early-stage startup environment for 2 years"', matchType: 'semantic', confidence: 0.78, uncertaintyFlag: false, verificationRequired: false },
          { name: 'Enterprise Scale', score: 3, snippet: '"Delivered features used by 500K+ daily active users"', matchType: 'synonym', confidence: 0.82, uncertaintyFlag: false, verificationRequired: false },
        ],
        reasoning: 'Solid senior-level experience with leadership background. Startup and enterprise experience align with job requirements. No specific mention of managing cross-functional teams.',
      },
      {
        dimension: 'Education',
        score: 3.5,
        items: [
          { name: 'Degree', score: 4, snippet: '"B.Tech in Computer Science from IIT Bombay"', matchType: 'exact', confidence: 0.95, uncertaintyFlag: false, verificationRequired: false },
          { name: 'Relevant Coursework', score: 3, snippet: '"Completed advanced courses in Algorithms and Data Structures"', matchType: 'semantic', confidence: 0.75, uncertaintyFlag: false, verificationRequired: false },
          { name: 'Certifications', score: 3, snippet: '"AWS Certified Solutions Architect, Google Cloud Professional"', matchType: 'exact', confidence: 0.88, uncertaintyFlag: false, verificationRequired: false },
        ],
        reasoning: 'Strong educational background from premier institution. Certifications show cloud knowledge but not directly relevant to frontend role. No advanced degree mentioned.',
      },
      {
        dimension: 'Culture Fit',
        score: 4.0,
        items: [
          { name: 'Collaboration', score: 4, snippet: '"Cross-functional collaboration with design, product, and backend teams"', matchType: 'exact', confidence: 0.85, uncertaintyFlag: false, verificationRequired: false },
          { name: 'Growth Mindset', score: 4, snippet: '"Passionate about mentoring junior developers and continuous learning"', matchType: 'semantic', confidence: 0.80, uncertaintyFlag: false, verificationRequired: false },
          { name: 'Communication', score: 4, snippet: '"Presented at 3 tech conferences and authored blog posts on engineering culture"', matchType: 'exact', confidence: 0.82, uncertaintyFlag: false, verificationRequired: false },
          { name: 'Values Alignment', score: 4, snippet: '"Advocated for accessibility-first development practices"', matchType: 'semantic', confidence: 0.70, uncertaintyFlag: true, verificationRequired: false },
        ],
        reasoning: 'Strong culture indicators with emphasis on collaboration and mentoring. Values alignment inferred from accessibility advocacy. Communication skills well-demonstrated through conference presentations.',
      },
    ],
  },
  c2: {
    overall: 3.6,
    proposedAction: 'Proposed Hold',
    blindScore: 3.6,
    nonBlindScore: 3.8,
    dimensions: [
      {
        dimension: 'Skills',
        score: 3.8,
        items: [
          { name: 'Python', score: 4, snippet: '"4 years of Python development with Django and Flask"', matchType: 'exact', confidence: 0.90, uncertaintyFlag: false, verificationRequired: false },
          { name: 'Java', score: 4, snippet: '"Strong Java skills with Spring Boot experience"', matchType: 'exact', confidence: 0.88, uncertaintyFlag: false, verificationRequired: false },
          { name: 'PostgreSQL', score: 3, snippet: '"Experience with relational databases and query optimization"', matchType: 'synonym', confidence: 0.75, uncertaintyFlag: false, verificationRequired: false },
          { name: 'Microservices', score: 4, snippet: '"Designed and deployed microservices architecture at scale"', matchType: 'exact', confidence: 0.85, uncertaintyFlag: false, verificationRequired: false },
        ],
        reasoning: 'Solid backend skills with Python and Java. Database experience noted but depth unclear. Microservices experience is a strong plus.',
      },
      {
        dimension: 'Experience',
        score: 3.5,
        items: [
          { name: 'Years of Experience', score: 4, snippet: '"5+ years of backend development experience"', matchType: 'exact', confidence: 0.92, uncertaintyFlag: false, verificationRequired: false },
          { name: 'System Design', score: 3, snippet: '"Participated in system design for high-traffic applications"', matchType: 'semantic', confidence: 0.70, uncertaintyFlag: true, verificationRequired: false },
          { name: 'Team Collaboration', score: 4, snippet: '"Worked in Agile teams with 8-10 developers"', matchType: 'exact', confidence: 0.85, uncertaintyFlag: false, verificationRequired: false },
        ],
        reasoning: 'Good experience level but system design depth needs verification. Team collaboration skills are adequate.',
      },
      {
        dimension: 'Education',
        score: 3.5,
        items: [
          { name: 'Degree', score: 4, snippet: '"M.Sc in Computer Science from University of Mumbai"', matchType: 'exact', confidence: 0.93, uncertaintyFlag: false, verificationRequired: false },
          { name: 'Certifications', score: 3, snippet: '"Oracle Certified Java Programmer"', matchType: 'exact', confidence: 0.88, uncertaintyFlag: false, verificationRequired: false },
        ],
        reasoning: 'Relevant master\'s degree with Java certification. No additional specialized certifications.',
      },
      {
        dimension: 'Culture Fit',
        score: 3.5,
        items: [
          { name: 'Collaboration', score: 3, snippet: '"Comfortable working in cross-functional teams"', matchType: 'semantic', confidence: 0.68, uncertaintyFlag: true, verificationRequired: false },
          { name: 'Growth Mindset', score: 4, snippet: '"Active contributor to open-source projects"', matchType: 'exact', confidence: 0.80, uncertaintyFlag: false, verificationRequired: false },
          { name: 'Communication', score: 3, snippet: '"Wrote technical documentation for internal APIs"', matchType: 'synonym', confidence: 0.72, uncertaintyFlag: false, verificationRequired: false },
        ],
        reasoning: 'Moderate culture fit indicators. Open-source contributions show initiative. Collaboration and communication need deeper assessment.',
      },
    ],
  },
};

// Default data for candidates without specific data
const DEFAULT_GLASS_BOX: typeof GLASS_BOX_DATA[string] = {
  overall: 3.0,
  proposedAction: 'Proposed Hold',
  blindScore: 3.0,
  nonBlindScore: 3.2,
  dimensions: [
    {
      dimension: 'Skills',
      score: 3.0,
      items: [
        { name: 'Primary Skill', score: 3, snippet: '"3 years of relevant technical experience"', matchType: 'exact', confidence: 0.80, uncertaintyFlag: false, verificationRequired: false },
        { name: 'Secondary Skill', score: 3, snippet: '"Working knowledge of related technologies"', matchType: 'synonym', confidence: 0.70, uncertaintyFlag: false, verificationRequired: false },
      ],
      reasoning: 'Skills appear adequate but require further verification through technical assessment.',
    },
    {
      dimension: 'Experience',
      score: 3.0,
      items: [
        { name: 'Relevant Experience', score: 3, snippet: '"3-4 years in similar role"', matchType: 'semantic', confidence: 0.75, uncertaintyFlag: false, verificationRequired: false },
      ],
      reasoning: 'Experience level meets minimum requirements. Depth and impact need assessment.',
    },
    {
      dimension: 'Education',
      score: 3.0,
      items: [
        { name: 'Degree', score: 3, snippet: '"Bachelor\'s degree in related field"', matchType: 'exact', confidence: 0.85, uncertaintyFlag: false, verificationRequired: false },
      ],
      reasoning: 'Education meets basic requirements.',
    },
    {
      dimension: 'Culture Fit',
      score: 3.0,
      items: [
        { name: 'Team Fit', score: 3, snippet: '"Expressed interest in collaborative work environments"', matchType: 'semantic', confidence: 0.65, uncertaintyFlag: true, verificationRequired: false },
      ],
      reasoning: 'Culture fit indicators are moderate. Further assessment recommended.',
    },
  ],
};

// PII Redaction data
const PII_REDACTION_DATA = {
  original: `Ananya Krishnan
ananya.krishnan@gmail.com | +91-98765-43210 | She/Her
Mumbai, Maharashtra, India

Education:
B.Tech in Computer Science, IIT Bombay (2015-2019)
M.S. in Human-Computer Interaction, Georgia Tech (2019-2021)

Professional Experience:
Senior Frontend Developer at TechCorp (2021-Present)
- Led a team of 6 frontend developers
- Built React applications serving 500K+ daily users

Frontend Developer at StartupXYZ (2019-2021)
- Developed responsive web applications
- Collaborated with design and product teams

Languages: English, Hindi, Marathi
Interests: Open source, Accessibility advocacy, Tech blogging`,
  redacted: `[REDACTED NAME]
[REDACTED EMAIL] | [REDACTED PHONE] | [REDACTED PRONOUNS]
[REDACTED CITY], [REDACTED STATE], India

Education:
B.Tech in Computer Science, IIT Bombay ([REDACTED YEARS])
M.S. in Human-Computer Interaction, Georgia Tech ([REDACTED YEARS])

Professional Experience:
Senior Frontend Developer at TechCorp ([REDACTED DATE]-Present)
- Led a team of 6 frontend developers
- Built React applications serving 500K+ daily users

Frontend Developer at StartupXYZ ([REDACTED DATE]-[REDACTED DATE])
- Developed responsive web applications
- Collaborated with design and product teams

Languages: [REDACTED LANGUAGES]
Interests: Open source, Accessibility advocacy, Tech blogging`,
  redactedFields: [
    { field: 'Full Name', type: 'PII', original: 'Ananya Krishnan' },
    { field: 'Email', type: 'PII', original: 'ananya.krishnan@gmail.com' },
    { field: 'Phone', type: 'PII', original: '+91-98765-43210' },
    { field: 'Pronouns', type: 'Demographic', original: 'She/Her' },
    { field: 'City', type: 'Geographic', original: 'Mumbai' },
    { field: 'State', type: 'Geographic', original: 'Maharashtra' },
    { field: 'Graduation Years', type: 'Age-Proxy', original: '2015-2019, 2019-2021' },
    { field: 'Employment Dates', type: 'Age-Proxy', original: '2021, 2019-2021' },
    { field: 'Languages', type: 'Demographic', original: 'English, Hindi, Marathi' },
  ],
};

// Blind screening comparison data
const BLIND_SCREENING_DATA = [
  { candidate: 'Ananya K.', withPII: 4.5, withoutPII: 4.2, delta: 0.3 },
  { candidate: 'Rohan P.', withPII: 3.8, withoutPII: 3.6, delta: 0.2 },
  { candidate: 'Deepika R.', withPII: 4.0, withoutPII: 3.5, delta: 0.5 },
  { candidate: 'Arjun M.', withPII: 3.5, withoutPII: 3.4, delta: 0.1 },
  { candidate: 'Sneha I.', withPII: 3.9, withoutPII: 3.3, delta: 0.6 },
  { candidate: 'Vikram S.', withPII: 3.2, withoutPII: 3.1, delta: 0.1 },
  { candidate: 'Priya N.', withPII: 4.3, withoutPII: 4.0, delta: 0.3 },
  { candidate: 'Karthik R.', withPII: 3.6, withoutPII: 3.5, delta: 0.1 },
  { candidate: 'Meera S.', withPII: 4.1, withoutPII: 3.4, delta: 0.7 },
  { candidate: 'Aditya G.', withPII: 3.7, withoutPII: 3.6, delta: 0.1 },
];

// 4/5ths Rule data
const FOUR_FIFTHS_DATA = [
  { group: 'Male', category: 'Gender', total: 500, selected: 250, rate: 50.0, ratio: 100, pass: true },
  { group: 'Female', category: 'Gender', total: 400, selected: 180, rate: 45.0, ratio: 90, pass: true },
  { group: 'Non-binary', category: 'Gender', total: 100, selected: 30, rate: 30.0, ratio: 60, pass: false },
  { group: '25-34', category: 'Age', total: 400, selected: 220, rate: 55.0, ratio: 100, pass: true },
  { group: '35-44', category: 'Age', total: 350, selected: 140, rate: 40.0, ratio: 73, pass: true },
  { group: '45+', category: 'Age', total: 250, selected: 60, rate: 24.0, ratio: 44, pass: false },
  { group: 'General', category: 'Caste', total: 600, selected: 300, rate: 50.0, ratio: 100, pass: true },
  { group: 'OBC', category: 'Caste', total: 300, selected: 135, rate: 45.0, ratio: 90, pass: true },
  { group: 'SC/ST', category: 'Caste', total: 200, selected: 50, rate: 25.0, ratio: 50, pass: false },
  { group: 'Urban', category: 'Location', total: 700, selected: 350, rate: 50.0, ratio: 100, pass: true },
  { group: 'Rural', category: 'Location', total: 400, selected: 120, rate: 30.0, ratio: 60, pass: false },
];

// Historical impact ratios
const HISTORICAL_IMPACT = [
  { month: 'Jul 2025', gender: 0.82, age: 0.75, caste: 0.70, location: 0.68 },
  { month: 'Aug 2025', gender: 0.85, age: 0.78, caste: 0.72, location: 0.70 },
  { month: 'Sep 2025', gender: 0.88, age: 0.76, caste: 0.74, location: 0.72 },
  { month: 'Oct 2025', gender: 0.84, age: 0.74, caste: 0.71, location: 0.69 },
  { month: 'Nov 2025', gender: 0.87, age: 0.77, caste: 0.73, location: 0.71 },
  { month: 'Dec 2025', gender: 0.90, age: 0.80, caste: 0.76, location: 0.73 },
  { month: 'Jan 2026', gender: 0.86, age: 0.78, caste: 0.75, location: 0.72 },
  { month: 'Feb 2026', gender: 0.89, age: 0.82, caste: 0.78, location: 0.74 },
  { month: 'Mar 2026', gender: 0.91, age: 0.79, caste: 0.77, location: 0.76 },
  { month: 'Apr 2026', gender: 0.88, age: 0.75, caste: 0.74, location: 0.71 },
  { month: 'May 2026', gender: 0.90, age: 0.80, caste: 0.76, location: 0.74 },
  { month: 'Jun 2026', gender: 0.92, age: 0.81, caste: 0.78, location: 0.76 },
];

// Ground truth calibration data
const GROUND_TRUTH_DATA = [
  { candidate: 'Ananya K.', aiScore: 4.2, humanScore: 4.0 },
  { candidate: 'Rohan P.', aiScore: 3.6, humanScore: 3.8 },
  { candidate: 'Deepika R.', aiScore: 3.8, humanScore: 3.5 },
  { candidate: 'Arjun M.', aiScore: 3.4, humanScore: 3.6 },
  { candidate: 'Sneha I.', aiScore: 3.9, humanScore: 4.1 },
  { candidate: 'Vikram S.', aiScore: 3.1, humanScore: 3.0 },
  { candidate: 'Priya N.', aiScore: 4.0, humanScore: 3.8 },
  { candidate: 'Karthik R.', aiScore: 3.5, humanScore: 3.7 },
  { candidate: 'Meera S.', aiScore: 3.7, humanScore: 3.4 },
  { candidate: 'Aditya G.', aiScore: 3.3, humanScore: 3.5 },
];

// Audit trail data
const SCORE_CHANGE_LOG = [
  { timestamp: '2025-06-05 14:23', user: 'Priya Sharma', candidate: 'Ananya K.', dimension: 'Skills', item: 'Python', oldScore: 3, newScore: 5, reason: 'Candidate demonstrated expert-level Python in take-home assignment', hash: 'a3f7b2c1' },
  { timestamp: '2025-06-04 11:15', user: 'Kavitha Reddy', candidate: 'Rohan P.', dimension: 'Experience', item: 'System Design', oldScore: 3, newScore: 4, reason: 'System design skills confirmed in technical interview round', hash: '8d4e1f6a' },
  { timestamp: '2025-06-03 16:42', user: 'Priya Sharma', candidate: 'Deepika R.', dimension: 'Culture Fit', item: 'Values Alignment', oldScore: 2, newScore: 4, reason: 'Portfolio review showed strong accessibility and inclusion advocacy', hash: '2c9b7e3d' },
  { timestamp: '2025-06-02 09:30', user: 'Rajesh Kumar', candidate: 'Vikram S.', dimension: 'Skills', item: 'Kubernetes', oldScore: 2, newScore: 4, reason: 'Verified CKA certification that was not parsed from resume', hash: '5f1a8c4b' },
  { timestamp: '2025-06-01 13:55', user: 'Kavitha Reddy', candidate: 'Meera S.', dimension: 'Education', item: 'Degree', oldScore: 3, newScore: 4, reason: 'Confirmed first-class distinction from verified university records', hash: '7e6d2a9f' },
];

const SYSTEM_ACTION_LOG = [
  { timestamp: '2025-06-05 14:30', action: 'Human override applied', detail: 'Skills > Python score changed from 3 → 5 for Ananya K.', icon: 'edit' },
  { timestamp: '2025-06-05 13:45', action: 'Proposed action: Proposed Interview', detail: 'Ananya K. - Senior Frontend Developer', icon: 'zap' },
  { timestamp: '2025-06-05 13:44', action: 'Blind screening performed', detail: 'Batch of 10 candidates for Senior Frontend Developer', icon: 'eye-off' },
  { timestamp: '2025-06-05 13:40', action: 'Resume analyzed for candidate Ananya K.', detail: 'Glass Box scoring completed - Overall: 4.2/5', icon: 'scan' },
  { timestamp: '2025-06-05 11:20', action: 'PII redaction completed', detail: '9 fields redacted for Ananya K.', icon: 'lock' },
  { timestamp: '2025-06-05 10:00', action: '4/5ths rule analysis completed', detail: '3 demographic groups flagged for review', icon: 'alert' },
  { timestamp: '2025-06-04 16:30', action: 'Ground-truth calibration run', detail: 'Correlation coefficient: 0.87', icon: 'brain' },
  { timestamp: '2025-06-04 09:00', action: 'Data retention cleanup executed', detail: '12 records purged per retention policy', icon: 'trash' },
];

/* ──────────────────────────────────────
   HELPER COMPONENTS
   ────────────────────────────────────── */

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 0.8, 0.22, 1] as const },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

function MatchTypeBadge({ type }: { type: string }) {
  const config: Record<string, { bg: string; color: string; label: string }> = {
    exact: { bg: '#22c55e15', color: '#22c55e', label: 'Exact' },
    synonym: { bg: '#3b82f615', color: '#3b82f6', label: 'Synonym' },
    semantic: { bg: '#f59e0b15', color: '#f59e0b', label: 'Semantic' },
    inferred: { bg: '#ef444415', color: '#ef4444', label: 'Inferred' },
  };
  const c = config[type] || config.inferred;
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

function ScoreBar({ score, max = 5 }: { score: number; max?: number }) {
  const pct = (score / max) * 100;
  const color = score >= 4 ? '#22c55e' : score >= 3 ? 'var(--saptta-accent-2)' : score >= 2 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-[var(--saptta-bg-2)] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 0.8, 0.22, 1] }}
        />
      </div>
      <span className="text-xs font-bold min-w-[28px] text-right" style={{ color }}>{score}/{max}</span>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = value * 100;
  const color = value >= 0.85 ? '#22c55e' : value >= 0.7 ? 'var(--saptta-accent-2)' : value >= 0.5 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[var(--saptta-bg-2)] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.22, 0.8, 0.22, 1] }}
        />
      </div>
      <span className="text-[10px] font-semibold min-w-[32px] text-right" style={{ color }}>{Math.round(pct)}%</span>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const config: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    'Proposed Interview': { bg: '#22c55e15', color: '#22c55e', icon: <CheckCircle2 className="size-3" /> },
    'Proposed Rejection': { bg: '#ef444415', color: '#ef4444', icon: <XCircle className="size-3" /> },
    'Proposed Hold': { bg: '#f59e0b15', color: '#f59e0b', icon: <Clock className="size-3" /> },
  };
  const c = config[action] || config['Proposed Hold'];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: c.bg, color: c.color }}>
      {c.icon} {action}
    </span>
  );
}

function ComplianceGauge({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--saptta-bg-2)" strokeWidth="8" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.22, 0.8, 0.22, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}%</span>
        <span className="text-[10px] text-[var(--saptta-mute)]">Compliance</span>
      </div>
    </div>
  );
}

function SapttaCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`rounded-[24px] border border-[var(--saptta-line)] bg-[var(--saptta-bg)] shadow-sm ${className}`}
      {...fadeUp}
    >
      {children}
    </motion.div>
  );
}

function SapttaModuleCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`saptta-module-card rounded-[20px] border border-[var(--saptta-line)] bg-[var(--saptta-bg)] shadow-sm ${className}`}
      {...fadeUp}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────────────────────────────
   TAB 1: GLASS BOX SCORES
   ────────────────────────────────────── */

function GlassBoxTab() {
  const [selectedCandidate, setSelectedCandidate] = useState('c1');
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [overrideDimension, setOverrideDimension] = useState('');
  const [overrideItem, setOverrideItem] = useState('');
  const [overrideOldScore, setOverrideOldScore] = useState(0);
  const [overrideNewScore, setOverrideNewScore] = useState('0');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrides, setOverrides] = useState<Array<{
    dimension: string; item: string; oldScore: number; newScore: number;
    reason: string; timestamp: string; userId: string;
  }>>([]);

  const data = GLASS_BOX_DATA[selectedCandidate] || DEFAULT_GLASS_BOX;
  const scoreDelta = Math.abs(data.nonBlindScore - data.blindScore);
  const hasBiasAlert = scoreDelta > 0.5;

  const handleOverride = () => {
    if (!overrideReason.trim()) return;
    setOverrides(prev => [...prev, {
      dimension: overrideDimension,
      item: overrideItem,
      oldScore: overrideOldScore,
      newScore: parseInt(overrideNewScore),
      reason: overrideReason,
      timestamp: new Date().toLocaleString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      userId: 'Priya Sharma',
    }]);
    setOverrideDialogOpen(false);
    setOverrideReason('');
  };

  const openOverride = (dim: string, item: string, oldScore: number) => {
    setOverrideDimension(dim);
    setOverrideItem(item);
    setOverrideOldScore(oldScore);
    setOverrideNewScore(String(oldScore));
    setOverrideDialogOpen(true);
  };

  const overallColor = data.overall >= 4 ? '#22c55e' : data.overall >= 3 ? 'var(--saptta-accent-2)' : '#f59e0b';

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* Candidate & Job Selector */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Label className="text-xs font-medium text-[var(--saptta-mute)] mb-1.5 block">Select Candidate</Label>
          <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
            <SelectTrigger className="rounded-xl border-[var(--saptta-line)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CANDIDATES.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} — {c.job}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Overall Score + Proposed Action + Bias Alert */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Score */}
        <SapttaCard className="p-6 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-[var(--saptta-mute)] uppercase tracking-wider mb-2">Overall Glass Box Score</p>
          <motion.div
            className="text-6xl font-bold"
            style={{ color: overallColor }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 0.8, 0.22, 1] }}
          >
            {data.overall}
          </motion.div>
          <p className="text-sm text-[var(--saptta-mute)] mt-1">out of 5.0</p>
        </SapttaCard>

        {/* Proposed Action */}
        <SapttaCard className="p-6 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-[var(--saptta-mute)] uppercase tracking-wider mb-3">Proposed Action</p>
          <ActionBadge action={data.proposedAction} />
          <p className="text-[11px] text-[var(--saptta-mute)] mt-3 text-center">Based on composite scoring with explainability</p>
        </SapttaCard>

        {/* Blind vs Non-Blind */}
        <SapttaCard className="p-6 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-[var(--saptta-mute)] uppercase tracking-wider mb-3">Blind vs Non-Blind Score</p>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--saptta-accent)]">{data.blindScore}</div>
              <div className="text-[10px] text-[var(--saptta-mute)]">Blind</div>
            </div>
            <div className="text-[var(--saptta-mute)]">vs</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--saptta-ink)]">{data.nonBlindScore}</div>
              <div className="text-[10px] text-[var(--saptta-mute)]">Non-Blind</div>
            </div>
          </div>
          {hasBiasAlert && (
            <Badge className="mt-2 rounded-full bg-red-50 text-red-600 border-0 text-[10px]">
              <AlertTriangle className="size-3 mr-1" /> Bias Alert: Δ{scoreDelta.toFixed(1)} &gt; 0.5
            </Badge>
          )}
          {!hasBiasAlert && (
            <Badge className="mt-2 rounded-full bg-green-50 text-green-600 border-0 text-[10px]">
              <CheckCircle2 className="size-3 mr-1" /> No significant bias (Δ{scoreDelta.toFixed(1)})
            </Badge>
          )}
        </SapttaCard>
      </motion.div>

      {/* Dimension Scores */}
      <motion.div variants={staggerItem} className="space-y-4">
        {data.dimensions.map((dim, dimIdx) => (
          <SapttaCard key={dim.dimension} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-[12px] flex items-center justify-center" style={{
                  backgroundColor: dimIdx === 0 ? 'var(--saptta-accent)15' : dimIdx === 1 ? 'var(--saptta-accent-2)15' : dimIdx === 2 ? '#3b82f615' : '#8b5cf615',
                }}>
                  {dimIdx === 0 ? <Zap className="size-4 text-[var(--saptta-accent)]" /> :
                   dimIdx === 1 ? <Briefcase className="size-4 text-[var(--saptta-accent-2)]" /> :
                   dimIdx === 2 ? <BookOpen className="size-4 text-[#3b82f6]" /> :
                   <Heart className="size-4 text-[#8b5cf6]" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--saptta-ink)]">{dim.dimension}</h3>
                  <p className="text-[10px] text-[var(--saptta-mute)]">Dimension Score</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold" style={{
                  color: dim.score >= 4 ? '#22c55e' : dim.score >= 3 ? 'var(--saptta-accent-2)' : '#f59e0b'
                }}>
                  {dim.score}
                </div>
                <p className="text-[10px] text-[var(--saptta-mute)]">/ 5.0</p>
              </div>
            </div>

            <ScoreBar score={dim.score} />

            {/* Reasoning */}
            <div className="mt-4 p-3 rounded-xl bg-[var(--saptta-bg-2)]">
              <div className="flex items-center gap-1.5 mb-1">
                <Brain className="size-3 text-[var(--saptta-accent)]" />
                <span className="text-[10px] font-semibold text-[var(--saptta-accent)] uppercase tracking-wider">Reasoning Chain</span>
              </div>
              <p className="text-xs text-[var(--saptta-ink-2)] leading-relaxed">{dim.reasoning}</p>
            </div>

            {/* Item Scores */}
            <div className="mt-4 space-y-3">
              {dim.items.map((item) => (
                <div key={item.name} className="p-3 rounded-xl border border-[var(--saptta-line)] bg-[var(--saptta-bg)]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[var(--saptta-ink)]">{item.name}</span>
                        <MatchTypeBadge type={item.matchType} />
                        {item.uncertaintyFlag && (
                          <Badge className="rounded-full bg-yellow-50 text-yellow-600 border-0 text-[10px] px-2">
                            <AlertTriangle className="size-3 mr-1" /> Verification Required
                          </Badge>
                        )}
                        {item.verificationRequired && (
                          <Button
                            size="sm"
                            className="h-6 rounded-full text-[10px] bg-red-50 text-red-600 hover:bg-red-100 border-0 px-2"
                            onClick={() => openOverride(dim.dimension, item.name, item.score)}
                          >
                            Action Required
                          </Button>
                        )}
                      </div>
                      {/* Evidence Snippet */}
                      <div className="mt-1.5 p-2 rounded-lg bg-[var(--saptta-bg-2)] border border-[var(--saptta-line)]">
                        <p className="text-[11px] text-[var(--saptta-ink-2)] leading-relaxed italic">
                          {item.snippet}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 w-20">
                      <div className="text-sm font-bold text-right" style={{
                        color: item.score >= 4 ? '#22c55e' : item.score >= 3 ? 'var(--saptta-accent-2)' : item.score >= 2 ? '#f59e0b' : '#ef4444'
                      }}>
                        {item.score}/5
                      </div>
                      <ConfidenceBar value={item.confidence} />
                    </div>
                  </div>
                  {/* Override link */}
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] text-[var(--saptta-accent)] hover:text-[var(--saptta-accent)] px-1"
                      onClick={() => openOverride(dim.dimension, item.name, item.score)}
                    >
                      <Sliders className="size-3 mr-1" /> Override Score
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </SapttaCard>
        ))}
      </motion.div>

      {/* Override History */}
      {overrides.length > 0 && (
        <motion.div variants={staggerItem}>
          <SapttaCard className="p-6">
            <h3 className="text-sm font-bold text-[var(--saptta-ink)] mb-3 flex items-center gap-2">
              <RotateCcw className="size-4 text-[var(--saptta-accent)]" /> Override History
            </h3>
            <div className="space-y-2">
              {overrides.map((ov, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[var(--saptta-bg-2)] border border-[var(--saptta-line)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="rounded-full bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] border-0 text-[10px]">
                        {ov.dimension} &gt; {ov.item}
                      </Badge>
                      <span className="text-xs text-[var(--saptta-ink-2)]">{ov.oldScore} → <strong>{ov.newScore}</strong></span>
                    </div>
                    <span className="text-[10px] text-[var(--saptta-mute)]">{ov.timestamp}</span>
                  </div>
                  <p className="text-xs text-[var(--saptta-mute)] mt-1">"{ov.reason}"</p>
                  <p className="text-[10px] text-[var(--saptta-mute)] mt-1">By {ov.userId}</p>
                </div>
              ))}
            </div>
          </SapttaCard>
        </motion.div>
      )}

      {/* Override Dialog */}
      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent className="rounded-[24px] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[var(--saptta-ink)]">
              Override Score
            </DialogTitle>
            <DialogDescription className="text-sm text-[var(--saptta-mute)]">
              {overrideDimension} &gt; {overrideItem} (Current: {overrideOldScore}/5)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-[var(--saptta-ink-2)] mb-1.5 block">New Score</Label>
              <Select value={overrideNewScore} onValueChange={setOverrideNewScore}>
                <SelectTrigger className="rounded-xl border-[var(--saptta-line)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5].map(s => (
                    <SelectItem key={s} value={String(s)}>{s}/5</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-[var(--saptta-ink-2)] mb-1.5 block">
                Reason for Override <span className="text-red-500">*</span>
              </Label>
              <Textarea
                className="rounded-xl border-[var(--saptta-line)] text-sm min-h-[100px]"
                placeholder="Provide a detailed reason for this score override..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
              />
              {!overrideReason.trim() && (
                <p className="text-[10px] text-red-500 mt-1">Reason is mandatory for audit trail compliance</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-full border-[var(--saptta-line)]" onClick={() => setOverrideDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-full bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90"
              onClick={handleOverride}
              disabled={!overrideReason.trim()}
            >
              <Save className="size-4 mr-1.5" /> Submit Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

/* ──────────────────────────────────────
   TAB 2: PII & BLIND SCREENING
   ────────────────────────────────────── */

function PIIBlindTab() {
  const [blindScreeningEnabled, setBlindScreeningEnabled] = useState(true);
  const [biasAlertThreshold, setBiasAlertThreshold] = useState(0.5);

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* PII Redaction Preview */}
      <motion.div variants={staggerItem}>
        <SapttaCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <EyeOff className="size-4 text-[var(--saptta-accent)]" />
            <h3 className="text-sm font-bold text-[var(--saptta-ink)]">PII Redaction Preview</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Original */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="rounded-full bg-red-50 text-red-600 border-0 text-[10px]">Original Resume</Badge>
              </div>
              <div className="p-4 rounded-xl bg-[var(--saptta-bg-2)] border border-[var(--saptta-line)] text-xs text-[var(--saptta-ink-2)] whitespace-pre-wrap font-mono leading-relaxed max-h-72 overflow-y-auto">
                {PII_REDACTION_DATA.original.split('\n').map((line, i) => (
                  <div key={i}>
                    {line.includes('Ananya Krishnan') || line.includes('ananya.krishnan') || line.includes('+91') || line.includes('She/Her') || line.includes('Mumbai') || line.includes('Maharashtra') || line.includes('2015-2019') || line.includes('2019-2021') || line.includes('English, Hindi') ? (
                      <span className="bg-red-100 text-red-700 px-0.5 rounded">{line}</span>
                    ) : (
                      line
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Redacted */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="rounded-full bg-green-50 text-green-600 border-0 text-[10px]">Redacted Resume</Badge>
              </div>
              <div className="p-4 rounded-xl bg-[var(--saptta-bg-2)] border border-[var(--saptta-line)] text-xs text-[var(--saptta-ink-2)] whitespace-pre-wrap font-mono leading-relaxed max-h-72 overflow-y-auto">
                {PII_REDACTION_DATA.redacted.split('\n').map((line, i) => (
                  <div key={i}>
                    {line.includes('[REDACTED') ? (
                      <span className="bg-yellow-100 text-yellow-700 px-0.5 rounded">{line}</span>
                    ) : (
                      line
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Redacted Fields List */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-[var(--saptta-mute)] mb-2">Redacted Fields</p>
            <div className="flex flex-wrap gap-2">
              {PII_REDACTION_DATA.redactedFields.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--saptta-bg-2)] border border-[var(--saptta-line)]">
                  <span className="text-[10px] font-medium text-[var(--saptta-ink)]">{f.field}</span>
                  <Badge className="rounded-full text-[8px] px-1.5 py-0 h-4 border-0" style={{
                    backgroundColor: f.type === 'PII' ? '#ef444415' : f.type === 'Demographic' ? '#8b5cf615' : f.type === 'Age-Proxy' ? '#f59e0b15' : '#3b82f615',
                    color: f.type === 'PII' ? '#ef4444' : f.type === 'Demographic' ? '#8b5cf6' : f.type === 'Age-Proxy' ? '#f59e0b' : '#3b82f6',
                  }}>
                    {f.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </SapttaCard>
      </motion.div>

      {/* Demographic Scrub Preview */}
      <motion.div variants={staggerItem}>
        <SapttaCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Fingerprint className="size-4 text-[var(--saptta-accent)]" />
            <h3 className="text-sm font-bold text-[var(--saptta-ink)]">Demographic Scrub Preview</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-red-50/50 border border-red-100">
              <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider mb-2">Before Scrubbing</p>
              <div className="space-y-2 text-xs text-[var(--saptta-ink-2)]">
                <div className="p-2 rounded-lg bg-white/80"><span className="bg-red-100 text-red-700 px-1 rounded">She/Her</span> — Pronoun indicator</div>
                <div className="p-2 rounded-lg bg-white/80">Graduated <span className="bg-red-100 text-red-700 px-1 rounded">2015-2019</span> — Age proxy</div>
                <div className="p-2 rounded-lg bg-white/80">Languages: <span className="bg-red-100 text-red-700 px-1 rounded">English, Hindi, Marathi</span> — Ethnicity proxy</div>
                <div className="p-2 rounded-lg bg-white/80">Location: <span className="bg-red-100 text-red-700 px-1 rounded">Mumbai, Maharashtra</span> — Geographic bias</div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-green-50/50 border border-green-100">
              <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider mb-2">After Scrubbing</p>
              <div className="space-y-2 text-xs text-[var(--saptta-ink-2)]">
                <div className="p-2 rounded-lg bg-white/80"><span className="bg-green-100 text-green-700 px-1 rounded">[REDACTED PRONOUNS]</span> — Removed</div>
                <div className="p-2 rounded-lg bg-white/80">Graduated <span className="bg-green-100 text-green-700 px-1 rounded">[REDACTED YEARS]</span> — Year removed</div>
                <div className="p-2 rounded-lg bg-white/80">Languages: <span className="bg-green-100 text-green-700 px-1 rounded">[REDACTED]</span> — Removed</div>
                <div className="p-2 rounded-lg bg-white/80">Location: <span className="bg-green-100 text-green-700 px-1 rounded">[REDACTED CITY]</span> — City removed</div>
              </div>
            </div>
          </div>
        </SapttaCard>
      </motion.div>

      {/* Blind Screening Score Comparison */}
      <motion.div variants={staggerItem}>
        <SapttaCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-[var(--saptta-accent)]" />
              <h3 className="text-sm font-bold text-[var(--saptta-ink)]">Blind Screening Score Comparison</h3>
            </div>
            <Badge className="rounded-full bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] border-0 text-[10px]">
              {BLIND_SCREENING_DATA.filter(d => d.delta > biasAlertThreshold).length} Bias Alerts
            </Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BLIND_SCREENING_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--saptta-line)" />
                <XAxis dataKey="candidate" tick={{ fontSize: 10, fill: 'var(--saptta-mute)' }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: 'var(--saptta-mute)' }} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid var(--saptta-line)', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="withPII" name="With PII" fill="var(--saptta-accent)" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="withoutPII" name="Without PII" fill="var(--saptta-accent-2)" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Flagged candidates */}
          <div className="mt-4 space-y-2">
            {BLIND_SCREENING_DATA.filter(d => d.delta > biasAlertThreshold).map(d => (
              <div key={d.candidate} className="flex items-center gap-3 p-2.5 rounded-xl bg-red-50 border border-red-100">
                <AlertTriangle className="size-4 text-red-500 shrink-0" />
                <span className="text-xs font-semibold text-red-700">{d.candidate}</span>
                <span className="text-[10px] text-red-600">Score delta: {d.delta.toFixed(1)} (with PII: {d.withPII}, without: {d.withoutPII})</span>
                <Badge className="rounded-full bg-red-100 text-red-600 border-0 text-[10px] ml-auto">Bias Alert</Badge>
              </div>
            ))}
          </div>
        </SapttaCard>
      </motion.div>

      {/* Settings */}
      <motion.div variants={staggerItem}>
        <SapttaCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="size-4 text-[var(--saptta-accent)]" />
            <h3 className="text-sm font-bold text-[var(--saptta-ink)]">Blind Screening Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--saptta-ink)]">Enable Blind Screening</p>
                <p className="text-[10px] text-[var(--saptta-mute)]">Automatically redact PII before AI scoring</p>
              </div>
              <Switch checked={blindScreeningEnabled} onCheckedChange={setBlindScreeningEnabled} />
            </div>
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[var(--saptta-ink)]">Bias Alert Threshold</p>
                <span className="text-sm font-bold text-[var(--saptta-accent)]">{biasAlertThreshold.toFixed(1)}</span>
              </div>
              <Slider
                value={[biasAlertThreshold]}
                onValueChange={(v) => setBiasAlertThreshold(v[0])}
                min={0.1}
                max={1.0}
                step={0.1}
                className="w-full"
              />
              <p className="text-[10px] text-[var(--saptta-mute)] mt-1">Candidates with score delta above this value will be flagged</p>
            </div>
          </div>
        </SapttaCard>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────────────────────
   TAB 3: BIAS AUDIT (4/5THS RULE)
   ────────────────────────────────────── */

function BiasAuditTab() {
  const [weights, setWeights] = useState({ skills: 30, experience: 30, education: 20, culture: 20 });
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationDone, setCalibrationDone] = useState(true);

  const correlation = 0.87;
  const overallCompliance = FOUR_FIFTHS_DATA.every(d => d.pass);

  const runCalibration = () => {
    setCalibrating(true);
    setTimeout(() => {
      setCalibrating(false);
      setCalibrationDone(true);
    }, 2000);
  };

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* 4/5ths Rule Test Results */}
      <motion.div variants={staggerItem}>
        <SapttaCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Scale className="size-4 text-[var(--saptta-accent)]" />
              <h3 className="text-sm font-bold text-[var(--saptta-ink)]">4/5ths Rule Test Results</h3>
            </div>
            <Badge className={`rounded-full border-0 text-[10px] ${overallCompliance ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {overallCompliance ? <><CheckCircle2 className="size-3 mr-1" /> Compliant</> : <><XCircle className="size-3 mr-1" /> Non-Compliant</>}
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Group</TableHead>
                  <TableHead className="text-[10px]">Category</TableHead>
                  <TableHead className="text-[10px] text-right">Total</TableHead>
                  <TableHead className="text-[10px] text-right">Selected</TableHead>
                  <TableHead className="text-[10px] text-right">Selection Rate</TableHead>
                  <TableHead className="text-[10px] text-right">Impact Ratio</TableHead>
                  <TableHead className="text-[10px] text-center">Pass 4/5ths?</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {FOUR_FIFTHS_DATA.map((row) => (
                  <TableRow key={`${row.category}-${row.group}`}>
                    <TableCell className="text-xs font-medium text-[var(--saptta-ink)]">{row.group}</TableCell>
                    <TableCell>
                      <Badge className="rounded-full bg-[var(--saptta-bg-2)] text-[var(--saptta-ink-2)] border-0 text-[10px]">{row.category}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right text-[var(--saptta-ink-2)]">{row.total}</TableCell>
                    <TableCell className="text-xs text-right text-[var(--saptta-ink-2)]">{row.selected}</TableCell>
                    <TableCell className="text-xs text-right font-semibold text-[var(--saptta-ink)]">{row.rate.toFixed(1)}%</TableCell>
                    <TableCell className="text-xs text-right">
                      <span className={row.ratio >= 80 ? 'text-green-600' : 'text-red-600'}>
                        {row.ratio}% of highest
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {row.pass ? (
                        <span className="inline-flex items-center justify-center size-6 rounded-full bg-green-50">
                          <CheckCircle2 className="size-4 text-green-500" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center size-6 rounded-full bg-red-50">
                          <XCircle className="size-4 text-red-500" />
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-[var(--saptta-bg-2)]">
            <p className="text-[10px] text-[var(--saptta-mute)]">
              <strong className="text-[var(--saptta-ink)]">Impact Ratio</strong> = (Selection rate for group ÷ Highest selection rate) × 100.
              Per EEOC 4/5ths rule, ratios below 80% indicate adverse impact requiring remediation.
            </p>
          </div>
        </SapttaCard>
      </motion.div>

      {/* Historical Impact Ratios */}
      <motion.div variants={staggerItem}>
        <SapttaCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <LineChartIcon className="size-4 text-[var(--saptta-accent)]" />
            <h3 className="text-sm font-bold text-[var(--saptta-ink)]">Historical Impact Ratios (12 Months)</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HISTORICAL_IMPACT} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--saptta-line)" />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'var(--saptta-mute)' }} angle={-30} textAnchor="end" height={50} />
                <YAxis domain={[0.5, 1.0]} tick={{ fontSize: 10, fill: 'var(--saptta-mute)' }} tickFormatter={(v: number) => `${Math.round(v * 100)}%`} />
                <RechartsTooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--saptta-line)', fontSize: 12 }} formatter={(v: number) => `${Math.round(v * 100)}%`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={0.8} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '4/5ths threshold', position: 'right', fontSize: 10, fill: '#ef4444' }} />
                <Line type="monotone" dataKey="gender" name="Gender" stroke="var(--saptta-accent)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="age" name="Age" stroke="var(--saptta-accent-2)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="caste" name="Caste" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="location" name="Location" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SapttaCard>
      </motion.div>

      {/* Remediation Actions */}
      <motion.div variants={staggerItem}>
        <SapttaCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="size-4 text-[var(--saptta-accent)]" />
            <h3 className="text-sm font-bold text-[var(--saptta-ink)]">Recommended Remediation Actions</h3>
          </div>
          <div className="space-y-3">
            {[
              { action: 'Review scoring weights for Culture Fit dimension', severity: 'high', groups: ['Non-binary', 'SC/ST', 'Rural'] },
              { action: 'Increase semantic matching threshold from 0.65 to 0.75', severity: 'medium', groups: ['45+', 'Rural'] },
              { action: 'Conduct manual review of flagged candidates in failing groups', severity: 'high', groups: ['Non-binary', 'SC/ST', '45+', 'Rural'] },
              { action: 'Schedule third-party bias audit within 30 days', severity: 'critical', groups: ['All non-compliant'] },
            ].map((rem, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-[var(--saptta-line)] bg-[var(--saptta-bg)]">
                <div className={`mt-0.5 size-5 rounded-full flex items-center justify-center shrink-0 ${rem.severity === 'critical' ? 'bg-red-100' : rem.severity === 'high' ? 'bg-orange-100' : 'bg-yellow-100'}`}>
                  <AlertTriangle className={`size-3 ${rem.severity === 'critical' ? 'text-red-500' : rem.severity === 'high' ? 'text-orange-500' : 'text-yellow-500'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[var(--saptta-ink)]">{rem.action}</p>
                  <div className="flex gap-1.5 mt-1">
                    {rem.groups.map(g => (
                      <Badge key={g} className="rounded-full bg-[var(--saptta-bg-2)] text-[var(--saptta-ink-2)] border-0 text-[9px] px-1.5">{g}</Badge>
                    ))}
                  </div>
                </div>
                <Badge className={`rounded-full border-0 text-[10px] shrink-0 ${rem.severity === 'critical' ? 'bg-red-50 text-red-600' : rem.severity === 'high' ? 'bg-orange-50 text-orange-600' : 'bg-yellow-50 text-yellow-600'}`}>
                  {rem.severity}
                </Badge>
              </div>
            ))}
          </div>
        </SapttaCard>
      </motion.div>

      {/* Ground-Truth Calibration */}
      <motion.div variants={staggerItem}>
        <SapttaCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="size-4 text-[var(--saptta-accent)]" />
              <h3 className="text-sm font-bold text-[var(--saptta-ink)]">Ground-Truth Calibration</h3>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`rounded-full border-0 text-[10px] ${correlation >= 0.85 ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                Correlation: {correlation.toFixed(2)} {correlation >= 0.85 ? '✅' : '⚠️'} (Target ≥ 0.85)
              </Badge>
              <Button
                size="sm"
                className="rounded-full bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90 h-8 text-xs"
                onClick={runCalibration}
                disabled={calibrating}
              >
                {calibrating ? (
                  <><RefreshCw className="size-3 mr-1 animate-spin" /> Calibrating...</>
                ) : (
                  <><Play className="size-3 mr-1" /> Run Calibration</>
                )}
              </Button>
            </div>
          </div>

          {/* Scatter Plot */}
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--saptta-line)" />
                <XAxis type="number" dataKey="aiScore" name="AI Score" domain={[2, 5]} tick={{ fontSize: 10, fill: 'var(--saptta-mute)' }} label={{ value: 'AI Score', position: 'bottom', fontSize: 10, fill: 'var(--saptta-mute)' }} />
                <YAxis type="number" dataKey="humanScore" name="Human Score" domain={[2, 5]} tick={{ fontSize: 10, fill: 'var(--saptta-mute)' }} label={{ value: 'Human Score', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--saptta-mute)' }} />
                <ZAxis range={[80]} />
                <RechartsTooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--saptta-line)', fontSize: 12 }} cursor={{ strokeDasharray: '3 3' }} />
                <ReferenceLine segment={[{ x: 2, y: 2 }, { x: 5, y: 5 }]} stroke="var(--saptta-accent)" strokeDasharray="5 5" />
                <Scatter data={GROUND_TRUTH_DATA} fill="var(--saptta-accent)">
                  {GROUND_TRUTH_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Math.abs(entry.aiScore - entry.humanScore) > 0.3 ? '#ef4444' : 'var(--saptta-accent)'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto mb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Candidate</TableHead>
                  <TableHead className="text-[10px] text-right">AI Score</TableHead>
                  <TableHead className="text-[10px] text-right">Human Score</TableHead>
                  <TableHead className="text-[10px] text-right">Delta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {GROUND_TRUTH_DATA.map((row) => {
                  const delta = row.aiScore - row.humanScore;
                  return (
                    <TableRow key={row.candidate}>
                      <TableCell className="text-xs font-medium text-[var(--saptta-ink)]">{row.candidate}</TableCell>
                      <TableCell className="text-xs text-right">{row.aiScore.toFixed(1)}</TableCell>
                      <TableCell className="text-xs text-right">{row.humanScore.toFixed(1)}</TableCell>
                      <TableCell className={`text-xs text-right font-semibold ${Math.abs(delta) > 0.3 ? 'text-red-500' : 'text-green-500'}`}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Weight Adjustment */}
          <div className="p-4 rounded-xl bg-[var(--saptta-bg-2)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[var(--saptta-ink)]">Dimension Weight Adjustment</p>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full h-7 text-[10px] border-[var(--saptta-line)]"
                onClick={() => setWeights({ skills: 30, experience: 30, education: 20, culture: 20 })}
              >
                <RotateCcw className="size-3 mr-1" /> Reset
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { key: 'skills' as const, label: 'Skills Weight', color: 'var(--saptta-accent)' },
                { key: 'experience' as const, label: 'Experience Weight', color: 'var(--saptta-accent-2)' },
                { key: 'education' as const, label: 'Education Weight', color: '#3b82f6' },
                { key: 'culture' as const, label: 'Culture Weight', color: '#8b5cf6' },
              ]).map(w => (
                <div key={w.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium text-[var(--saptta-ink-2)]">{w.label}</span>
                    <span className="text-xs font-bold" style={{ color: w.color }}>{weights[w.key]}%</span>
                  </div>
                  <Slider
                    value={[weights[w.key]]}
                    onValueChange={(v) => setWeights(prev => ({ ...prev, [w.key]: v[0] }))}
                    min={0}
                    max={50}
                    step={5}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] text-[var(--saptta-mute)]">Total: {Object.values(weights).reduce((a, b) => a + b, 0)}%</span>
              <Button
                size="sm"
                className="rounded-full bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90 h-7 text-[10px]"
              >
                <RefreshCw className="size-3 mr-1" /> Recalculate Scores
              </Button>
            </div>
          </div>
        </SapttaCard>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────────────────────
   TAB 4: AUDIT TRAIL & REVISION LOGS
   ────────────────────────────────────── */

function AuditTrailTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('all');

  const filteredLogs = SCORE_CHANGE_LOG.filter(log => {
    const matchesSearch = log.candidate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.dimension.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = filterUser === 'all' || log.user === filterUser;
    return matchesSearch && matchesUser;
  });

  const uniqueUsers = [...new Set(SCORE_CHANGE_LOG.map(l => l.user))];

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* Score Change Log */}
      <motion.div variants={staggerItem}>
        <SapttaCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="size-4 text-[var(--saptta-accent)]" />
              <h3 className="text-sm font-bold text-[var(--saptta-ink)]">Score Change Log</h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full h-7 text-[10px] border-[var(--saptta-line)]"
            >
              <Download className="size-3 mr-1" /> Export CSV
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[var(--saptta-mute)]" />
              <Input
                className="rounded-xl border-[var(--saptta-line)] text-xs pl-8 h-8"
                placeholder="Search by candidate, dimension, item, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="rounded-xl border-[var(--saptta-line)] h-8 text-xs w-[160px]">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map(u => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Timestamp</TableHead>
                  <TableHead className="text-[10px]">User</TableHead>
                  <TableHead className="text-[10px]">Candidate</TableHead>
                  <TableHead className="text-[10px]">Dimension</TableHead>
                  <TableHead className="text-[10px]">Item</TableHead>
                  <TableHead className="text-[10px] text-right">Old</TableHead>
                  <TableHead className="text-[10px] text-right">New</TableHead>
                  <TableHead className="text-[10px]">Reason</TableHead>
                  <TableHead className="text-[10px]">Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-[10px] text-[var(--saptta-mute)] whitespace-nowrap">{log.timestamp}</TableCell>
                    <TableCell className="text-[10px] font-medium text-[var(--saptta-ink)]">{log.user}</TableCell>
                    <TableCell className="text-[10px] text-[var(--saptta-ink-2)]">{log.candidate}</TableCell>
                    <TableCell>
                      <Badge className="rounded-full bg-[var(--saptta-bg-2)] text-[var(--saptta-ink-2)] border-0 text-[9px] px-1.5">{log.dimension}</Badge>
                    </TableCell>
                    <TableCell className="text-[10px] text-[var(--saptta-ink-2)]">{log.item}</TableCell>
                    <TableCell className="text-[10px] text-right text-red-500 font-semibold">{log.oldScore}</TableCell>
                    <TableCell className="text-[10px] text-right text-green-600 font-semibold">{log.newScore}</TableCell>
                    <TableCell className="text-[10px] text-[var(--saptta-ink-2)] max-w-[200px] truncate" title={log.reason}>{log.reason}</TableCell>
                    <TableCell>
                      <code className="text-[9px] font-mono bg-[var(--saptta-bg-2)] px-1.5 py-0.5 rounded text-[var(--saptta-mute)]">{log.hash}</code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SapttaCard>
      </motion.div>

      {/* System Action Log */}
      <motion.div variants={staggerItem}>
        <SapttaCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="size-4 text-[var(--saptta-accent)]" />
            <h3 className="text-sm font-bold text-[var(--saptta-ink)]">System Action Log</h3>
          </div>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {SYSTEM_ACTION_LOG.map((entry, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--saptta-bg-2)] border border-[var(--saptta-line)]">
                  <div className="mt-0.5 size-6 rounded-full flex items-center justify-center shrink-0 bg-[var(--saptta-accent)]/10">
                    {entry.icon === 'edit' ? <Sliders className="size-3 text-[var(--saptta-accent)]" /> :
                     entry.icon === 'zap' ? <Zap className="size-3 text-[var(--saptta-accent)]" /> :
                     entry.icon === 'eye-off' ? <EyeOff className="size-3 text-[var(--saptta-accent)]" /> :
                     entry.icon === 'scan' ? <FileText className="size-3 text-[var(--saptta-accent)]" /> :
                     entry.icon === 'lock' ? <Lock className="size-3 text-[var(--saptta-accent)]" /> :
                     entry.icon === 'alert' ? <AlertTriangle className="size-3 text-[var(--saptta-accent)]" /> :
                     entry.icon === 'brain' ? <Brain className="size-3 text-[var(--saptta-accent)]" /> :
                     <Trash2 className="size-3 text-[var(--saptta-accent)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--saptta-ink)]">{entry.action}</p>
                    <p className="text-[10px] text-[var(--saptta-mute)]">{entry.detail}</p>
                  </div>
                  <span className="text-[9px] text-[var(--saptta-mute)] whitespace-nowrap shrink-0">{entry.timestamp}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SapttaCard>
      </motion.div>

      {/* Data Integrity */}
      <motion.div variants={staggerItem}>
        <SapttaCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="size-4 text-[var(--saptta-accent)]" />
            <h3 className="text-sm font-bold text-[var(--saptta-ink)]">Data Integrity Verification</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex flex-col items-center">
              <CheckCircle2 className="size-8 text-green-500 mb-2" />
              <p className="text-xs font-semibold text-green-700">Hash Chain Valid</p>
              <p className="text-[10px] text-green-600 mt-1">All {SCORE_CHANGE_LOG.length} entries verified</p>
            </div>
            <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex flex-col items-center">
              <Lock className="size-8 text-green-500 mb-2" />
              <p className="text-xs font-semibold text-green-700">Tamper-Proof</p>
              <p className="text-[10px] text-green-600 mt-1">No unauthorized modifications detected</p>
            </div>
            <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex flex-col items-center">
              <Hash className="size-8 text-green-500 mb-2" />
              <p className="text-xs font-semibold text-green-700">SHA-256 Encrypted</p>
              <p className="text-[10px] text-green-600 mt-1">Audit log integrity verified at {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </SapttaCard>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────────────────────
   TAB 5: DATA RETENTION & COMPLIANCE
   ────────────────────────────────────── */

function DataRetentionTab() {
  const [retentionPeriod, setRetentionPeriod] = useState(180);
  const [cleanupRunning, setCleanupRunning] = useState(false);
  const complianceScore = 82;

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* Compliance Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* EU AI Act */}
        <motion.div variants={staggerItem}>
          <SapttaCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="size-4 text-[var(--saptta-accent)]" />
              <h3 className="text-sm font-bold text-[var(--saptta-ink)]">EU AI Act Compliance</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'High-Risk AI System Designation', value: 'Yes — ATS/AEDT', status: 'pass' },
                { label: 'Technical Documentation Version', value: 'v2.4.1', status: 'pass' },
                { label: 'Quality Management System', value: 'Active & Certified', status: 'pass' },
                { label: 'Real-time Logging', value: 'Active', status: 'pass', live: true },
                { label: 'Last Assessment Date', value: '2026-03-15', status: 'pass' },
                { label: 'Next Assessment Date', value: '2026-09-15', status: 'warning' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--saptta-line)] last:border-0">
                  <div className="flex items-center gap-2">
                    {item.status === 'pass' ? (
                      <CheckCircle2 className="size-3.5 text-green-500" />
                    ) : (
                      <AlertTriangle className="size-3.5 text-yellow-500" />
                    )}
                    <span className="text-xs text-[var(--saptta-ink-2)]">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.live && <span className="saptta-live-dot" />}
                    <span className="text-xs font-semibold text-[var(--saptta-ink)]">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </SapttaCard>
        </motion.div>

        {/* NYC LL144 */}
        <motion.div variants={staggerItem}>
          <SapttaCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="size-4 text-[var(--saptta-accent)]" />
              <h3 className="text-sm font-bold text-[var(--saptta-ink)]">NYC LL144 Compliance</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'AEDT Designation', value: 'Confirmed', status: 'pass' },
                { label: 'Latest Selection Rate Analysis', value: '2026-05-20', status: 'pass' },
                { label: 'Impact Ratio Result', value: 'Non-Compliant (3 groups)', status: 'fail' },
                { label: 'Third-Party Audit Schedule', value: '2026-07-15', status: 'warning' },
                { label: 'Bias Notification Published', value: 'Yes — Website & API', status: 'pass' },
                { label: 'Candidate Opt-out Mechanism', value: 'Available', status: 'pass' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--saptta-line)] last:border-0">
                  <div className="flex items-center gap-2">
                    {item.status === 'pass' ? (
                      <CheckCircle2 className="size-3.5 text-green-500" />
                    ) : item.status === 'fail' ? (
                      <XCircle className="size-3.5 text-red-500" />
                    ) : (
                      <AlertTriangle className="size-3.5 text-yellow-500" />
                    )}
                    <span className="text-xs text-[var(--saptta-ink-2)]">{item.label}</span>
                  </div>
                  <span className={`text-xs font-semibold ${item.status === 'fail' ? 'text-red-600' : item.status === 'warning' ? 'text-yellow-600' : 'text-[var(--saptta-ink)]'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <Button
              size="sm"
              className="mt-4 rounded-full bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90 h-8 text-xs w-full"
            >
              <Calendar className="size-3 mr-1.5" /> Schedule Audit
            </Button>
          </SapttaCard>
        </motion.div>
      </div>

      {/* Data Retention Policies */}
      <motion.div variants={staggerItem}>
        <SapttaCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="size-4 text-[var(--saptta-accent)]" />
              <h3 className="text-sm font-bold text-[var(--saptta-ink)]">Data Retention Policies</h3>
            </div>
            <Badge className="rounded-full bg-green-50 text-green-600 border-0 text-[10px]">
              <CheckCircle2 className="size-3 mr-1" /> GDPR Compliant
            </Badge>
          </div>

          {/* Retention Period Setting */}
          <div className="mb-4 p-3 rounded-xl bg-[var(--saptta-bg-2)]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-[var(--saptta-ink)]">Default Retention Period</p>
              <span className="text-sm font-bold text-[var(--saptta-accent)]">{retentionPeriod} days</span>
            </div>
            <Slider
              value={[retentionPeriod]}
              onValueChange={(v) => setRetentionPeriod(v[0])}
              min={30}
              max={365}
              step={30}
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Data Type</TableHead>
                  <TableHead className="text-[10px] text-right">Retention</TableHead>
                  <TableHead className="text-[10px] text-right">Deletion Date</TableHead>
                  <TableHead className="text-[10px] text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { type: 'Resume Text', retention: `${retentionPeriod} days`, deletion: '2025-12-05', status: 'Active' },
                  { type: 'AI Scores', retention: `${retentionPeriod} days`, deletion: '2025-12-05', status: 'Active' },
                  { type: 'Audit Logs', retention: '3 years', deletion: '2028-06-05', status: 'Active' },
                  { type: 'Override Reasons', retention: '3 years', deletion: '2028-06-05', status: 'Active' },
                  { type: 'PII Redaction Records', retention: `${retentionPeriod} days`, deletion: '2025-12-05', status: 'Active' },
                  { type: 'Bias Analysis Results', retention: '1 year', deletion: '2026-06-05', status: 'Active' },
                  { type: 'Candidate Communications', retention: '2 years', deletion: '2027-06-05', status: 'Active' },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-medium text-[var(--saptta-ink)]">{row.type}</TableCell>
                    <TableCell className="text-xs text-right text-[var(--saptta-ink-2)]">{row.retention}</TableCell>
                    <TableCell className="text-xs text-right text-[var(--saptta-ink-2)]">{row.deletion}</TableCell>
                    <TableCell className="text-center">
                      <Badge className="rounded-full bg-green-50 text-green-600 border-0 text-[10px]">{row.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-[10px] text-[var(--saptta-mute)]">Next scheduled cleanup: 2026-07-01 00:00 UTC</p>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full h-8 text-xs border-[var(--saptta-line)]"
              onClick={() => {
                setCleanupRunning(true);
                setTimeout(() => setCleanupRunning(false), 2000);
              }}
              disabled={cleanupRunning}
            >
              {cleanupRunning ? (
                <><RefreshCw className="size-3 mr-1 animate-spin" /> Running...</>
              ) : (
                <><Trash2 className="size-3 mr-1" /> Run Cleanup</>
              )}
            </Button>
          </div>
        </SapttaCard>
      </motion.div>

      {/* Compliance Health Score */}
      <motion.div variants={staggerItem}>
        <SapttaCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="size-4 text-[var(--saptta-accent)]" />
            <h3 className="text-sm font-bold text-[var(--saptta-ink)]">Compliance Health Score</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ComplianceGauge score={complianceScore} size={140} />
            <div className="flex-1 space-y-3">
              {[
                { label: 'EU AI Act', score: 90, color: '#22c55e' },
                { label: 'NYC LL144', score: 68, color: '#f59e0b' },
                { label: 'GDPR', score: 95, color: '#22c55e' },
                { label: '4/5ths Rule', score: 72, color: '#f59e0b' },
                { label: 'Audit Trail Integrity', score: 100, color: '#22c55e' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--saptta-ink-2)]">{item.label}</span>
                    <span className="text-xs font-semibold" style={{ color: item.color }}>{item.score}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--saptta-bg-2)] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 0.8, 0.22, 1] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SapttaCard>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────────────────────
   MAIN COMPLIANCE DASHBOARD
   ────────────────────────────────────── */

export function ComplianceDashboard() {
  const { userRole } = useAppStore();
  const [activeTab, setActiveTab] = useState('glass-box');

  const isHRAdmin = userRole === 'hr_admin';
  const isRecruiter = userRole === 'recruiter';

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 0.8, 0.22, 1] }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--saptta-ink)]">Bias Audit & Compliance</h1>
            <p className="text-sm text-[var(--saptta-mute)] mt-1">
              AI explainability, fairness monitoring, and regulatory compliance for Kam
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(isHRAdmin || isRecruiter) && (
              <Badge className="rounded-full bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] border-0 text-[10px]">
                <Shield className="size-3 mr-1" /> {isHRAdmin ? 'HR Admin Access' : 'Recruiter Access'}
              </Badge>
            )}
            <div className="flex items-center gap-1.5">
              <span className="saptta-live-dot" />
              <span className="text-[10px] text-green-600 font-medium">Live Monitoring</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea className="w-full">
          <TabsList className="bg-[var(--saptta-bg-2)] rounded-[16px] p-1 h-auto flex-wrap gap-1 w-max">
            <TabsTrigger
              value="glass-box"
              className="rounded-[12px] data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white text-[var(--saptta-ink-2)] text-xs px-3 py-2 data-[state=active]:shadow-md"
            >
              <Eye className="size-3.5 mr-1.5" /> Glass Box Scores
            </TabsTrigger>
            <TabsTrigger
              value="pii-blind"
              className="rounded-[12px] data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white text-[var(--saptta-ink-2)] text-xs px-3 py-2 data-[state=active]:shadow-md"
            >
              <EyeOff className="size-3.5 mr-1.5" /> PII & Blind Screening
            </TabsTrigger>
            <TabsTrigger
              value="bias-audit"
              className="rounded-[12px] data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white text-[var(--saptta-ink-2)] text-xs px-3 py-2 data-[state=active]:shadow-md"
            >
              <Scale className="size-3.5 mr-1.5" /> Bias Audit
            </TabsTrigger>
            <TabsTrigger
              value="audit-trail"
              className="rounded-[12px] data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white text-[var(--saptta-ink-2)] text-xs px-3 py-2 data-[state=active]:shadow-md"
            >
              <ClipboardCheck className="size-3.5 mr-1.5" /> Audit Trail
            </TabsTrigger>
            <TabsTrigger
              value="data-retention"
              className="rounded-[12px] data-[state=active]:bg-[var(--saptta-accent)] data-[state=active]:text-white text-[var(--saptta-ink-2)] text-xs px-3 py-2 data-[state=active]:shadow-md"
            >
              <Database className="size-3.5 mr-1.5" /> Data Retention
            </TabsTrigger>
          </TabsList>
        </ScrollArea>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 0.8, 0.22, 1] }}
          >
            <TabsContent value="glass-box" className="mt-4">
              <GlassBoxTab />
            </TabsContent>
            <TabsContent value="pii-blind" className="mt-4">
              <PIIBlindTab />
            </TabsContent>
            <TabsContent value="bias-audit" className="mt-4">
              <BiasAuditTab />
            </TabsContent>
            <TabsContent value="audit-trail" className="mt-4">
              <AuditTrailTab />
            </TabsContent>
            <TabsContent value="data-retention" className="mt-4">
              <DataRetentionTab />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}