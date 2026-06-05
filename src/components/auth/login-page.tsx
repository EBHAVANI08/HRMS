"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Users,
  UserCheck,
  UserPlus,
  Briefcase,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Lock,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";

/* ─── Animation Variants ─── */

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 0.8, 0.22, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 0.8, 0.22, 1] },
  },
};

const errorVariants = {
  hidden: { opacity: 0, y: -8, height: 0 },
  visible: {
    opacity: 1,
    y: 0,
    height: "auto",
    transition: { duration: 0.3, ease: [0.22, 0.8, 0.22, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    height: 0,
    transition: { duration: 0.2, ease: [0.22, 0.8, 0.22, 1] },
  },
};

const featureStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.5,
    },
  },
};

const featureItem = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.22, 0.8, 0.22, 1] },
  },
};

/* ─── Demo Role Config ─── */

interface DemoRole {
  label: string;
  email: string;
  password: string;
  icon: React.ElementType;
  accent: string;
  accentLight: string;
  description: string;
}

const demoRoles: DemoRole[] = [
  {
    label: "HR Admin",
    email: "priya@saptta.io",
    password: "admin123",
    icon: Shield,
    accent: "#ff6a2c",
    accentLight: "rgba(255, 106, 44, 0.08)",
    description: "Full HR management & compliance",
  },
  {
    label: "Manager",
    email: "rajesh@saptta.io",
    password: "manager123",
    icon: Users,
    accent: "#c8e056",
    accentLight: "rgba(200, 224, 86, 0.08)",
    description: "Team oversight & approvals",
  },
  {
    label: "Employee",
    email: "anita@saptta.io",
    password: "employee123",
    icon: UserCheck,
    accent: "#5a3a2a",
    accentLight: "rgba(90, 58, 42, 0.08)",
    description: "Self-service HR portal",
  },
  {
    label: "Recruiter",
    email: "kavitha@saptta.io",
    password: "recruiter123",
    icon: UserPlus,
    accent: "#f4a261",
    accentLight: "rgba(244, 162, 97, 0.08)",
    description: "Candidate pipeline & screening",
  },
  {
    label: "Job Applicant",
    email: "arun@gmail.com",
    password: "applicant123",
    icon: Briefcase,
    accent: "#8b5cf6",
    accentLight: "rgba(139, 92, 246, 0.08)",
    description: "Application tracking & status",
  },
];

/* ─── Saptta Logo Component ─── */

function SapttaLoginLogo({ size = "default" }: { size?: "default" | "small" }) {
  const isSmall = size === "small";
  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative flex shrink-0 items-center justify-center rounded-[16px] text-white font-bold shadow-lg ${
          isSmall ? "size-9 text-base" : "size-12 text-xl"
        }`}
        style={{ background: "linear-gradient(135deg, #ff6a2c 0%, #e04a0c 100%)" }}
      >
        <span className="relative z-10">s</span>
      </div>
      <span
        className={`font-bold tracking-tight text-white ${isSmall ? "text-xl" : "text-3xl"}`}
      >
        saptta
      </span>
    </div>
  );
}

/* ─── Feature Highlight Component ─── */

function FeatureHighlight({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      variants={featureItem}
      className="flex items-start gap-4 group"
    >
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-[16px] transition-transform duration-300 group-hover:scale-110"
        style={{
          background: "rgba(255, 106, 44, 0.1)",
          border: "1px solid rgba(255, 106, 44, 0.15)",
        }}
      >
        <Icon className="size-5" style={{ color: "#ff6a2c" }} />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
        <p className="text-xs leading-relaxed" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
          {description}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Demo Role Card Component ─── */

function DemoRoleCard({
  role,
  onSelect,
  isSubmitting,
}: {
  role: DemoRole;
  onSelect: (role: DemoRole) => void;
  isSubmitting: boolean;
}) {
  const Icon = role.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.22, 0.8, 0.22, 1] }}
    >
      <Card
        className="cursor-pointer border transition-all duration-300 hover:shadow-md py-0 overflow-hidden"
        style={{
          borderColor: `${role.accent}20`,
          background: role.accentLight,
        }}
        onClick={() => !isSubmitting && onSelect(role)}
      >
        <CardContent className="p-3.5">
          <div className="flex items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-[16px] transition-transform duration-300"
              style={{
                background: `${role.accent}15`,
                border: `1px solid ${role.accent}25`,
              }}
            >
              <Icon className="size-4" style={{ color: role.accent }} />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-sm font-semibold leading-tight"
                style={{ color: role.accent }}
              >
                {role.label}
              </p>
              <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--saptta-mute)" }}>
                {role.email}
              </p>
            </div>
            <ArrowRight
              className="size-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: role.accent }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Main LoginPage Component ─── */

export function LoginPage() {
  const { login, isLoading } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      setError("");

      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }
      if (!password.trim()) {
        setError("Please enter your password.");
        return;
      }

      const success = await login(email.trim(), password.trim());
      if (!success) {
        setError("Invalid email or password. Try a demo account below.");
      }
    },
    [email, password, login]
  );

  const handleDemoSelect = useCallback(
    async (role: DemoRole) => {
      setEmail(role.email);
      setPassword(role.password);
      setError("");

      // Small delay for visual feedback before submitting
      await new Promise((resolve) => setTimeout(resolve, 150));
      const success = await login(role.email, role.password);
      if (!success) {
        setError("Demo login failed. Please try again.");
      }
    },
    [login]
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="flex min-h-screen w-full"
    >
      {/* ─── Left Brand Panel (Desktop) ─── */}
      <div
        className="hidden lg:flex lg:w-[480px] xl:w-[540px] relative flex-col justify-between overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0a0a0b 0%, #1a1a1c 100%)",
        }}
      >
        {/* Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.04,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
          }}
        />

        {/* Decorative glow */}
        <div
          className="absolute top-1/4 -left-20 size-80 rounded-full blur-[120px] pointer-events-none"
          style={{ background: "rgba(255, 106, 44, 0.08)" }}
        />
        <div
          className="absolute bottom-1/4 -right-20 size-60 rounded-full blur-[100px] pointer-events-none"
          style={{ background: "rgba(200, 224, 86, 0.05)" }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-12">
          {/* Logo & Tagline */}
          <div>
            <SapttaLoginLogo />
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 0.8, 0.22, 1] }}
              className="mt-5 text-base leading-relaxed"
              style={{ color: "rgba(255, 255, 255, 0.55)" }}
            >
              AI-Powered HRMS & Recruitment Platform
            </motion.p>
          </div>

          {/* Feature Highlights */}
          <motion.div
            variants={featureStagger}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <FeatureHighlight
              icon={Sparkles}
              title="Smart Recruitment"
              description="AI-powered candidate screening with bias auditing"
              index={0}
            />
            <FeatureHighlight
              icon={CheckCircle2}
              title="Complete HR Suite"
              description="Attendance, payroll, performance in one platform"
              index={1}
            />
            <FeatureHighlight
              icon={Shield}
              title="Compliance First"
              description="EU AI Act, NYC LL144, and GDPR compliant"
              index={2}
            />
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div
              className="size-1.5 rounded-full"
              style={{ background: "#22c55e" }}
            />
            <span className="text-xs" style={{ color: "rgba(255, 255, 255, 0.35)" }}>
              All systems operational
            </span>
          </motion.div>
        </div>
      </div>

      {/* ─── Right Login Form Panel ─── */}
      <div className="flex flex-1 flex-col min-h-screen" style={{ background: "var(--saptta-bg)" }}>
        {/* Mobile Brand Header */}
        <div
          className="lg:hidden flex items-center gap-3 px-6 py-5"
          style={{
            background: "linear-gradient(180deg, #0a0a0b 0%, #141416 100%)",
          }}
        >
          <SapttaLoginLogo size="small" />
          <span
            className="ml-1 text-xs"
            style={{ color: "rgba(255, 255, 255, 0.45)" }}
          >
            AI-Powered HRMS
          </span>
        </div>

        {/* Form Area */}
        <div className="flex flex-1 items-start justify-center px-5 py-8 sm:px-8 md:px-12 lg:items-center lg:py-0">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full max-w-[440px]"
          >
            {/* Welcome Text */}
            <motion.div variants={staggerItem} className="mb-8">
              <h1
                className="text-2xl sm:text-3xl font-bold tracking-tight"
                style={{ color: "var(--saptta-ink)" }}
              >
                Welcome back
              </h1>
              <p
                className="mt-2 text-sm"
                style={{ color: "var(--saptta-mute)" }}
              >
                Sign in to your saptta account to continue
              </p>
            </motion.div>

            {/* Login Form */}
            <motion.form variants={staggerItem} onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error-msg"
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden"
                  >
                    <div
                      className="flex items-center gap-2.5 rounded-[16px] px-4 py-3 text-sm"
                      style={{
                        background: "rgba(239, 68, 68, 0.06)",
                        border: "1px solid rgba(239, 68, 68, 0.15)",
                        color: "#dc2626",
                      }}
                    >
                      <div
                        className="flex size-5 shrink-0 items-center justify-center rounded-full"
                        style={{ background: "rgba(239, 68, 68, 0.1)" }}
                      >
                        <span className="text-xs font-bold">!</span>
                      </div>
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="login-email"
                  className="text-xs font-semibold tracking-wide uppercase"
                  style={{ color: "var(--saptta-ink-2)" }}
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4"
                    style={{ color: "var(--saptta-mute)" }}
                  />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    disabled={isLoading}
                    className="h-11 pl-10 rounded-[16px] border text-sm transition-all duration-200 focus:ring-2"
                    style={{
                      borderColor: "var(--saptta-line)",
                      background: "var(--saptta-bg)",
                    }}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="text-xs font-semibold tracking-wide uppercase"
                    style={{ color: "var(--saptta-ink-2)" }}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium transition-colors duration-200 hover:underline"
                    style={{ color: "var(--saptta-accent)" }}
                    tabIndex={0}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4"
                    style={{ color: "var(--saptta-mute)" }}
                  />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    disabled={isLoading}
                    className="h-11 pl-10 pr-11 rounded-[16px] border text-sm transition-all duration-200 focus:ring-2"
                    style={{
                      borderColor: "var(--saptta-line)",
                      background: "var(--saptta-bg)",
                    }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md transition-colors duration-200 hover:bg-[var(--saptta-bg-2)]"
                    style={{ color: "var(--saptta-mute)" }}
                    tabIndex={0}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="relative h-11 w-full rounded-[999px] text-sm font-semibold text-white shadow-lg transition-all duration-300 overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg, #ff6a2c 0%, #e04a0c 100%)",
                  boxShadow: "0 4px 20px rgba(255, 106, 44, 0.3)",
                }}
              >
                {/* Shimmer effect on hover */}
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2s linear infinite",
                  }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </>
                  )}
                </span>
              </Button>
            </motion.form>

            {/* Divider */}
            <motion.div
              variants={staggerItem}
              className="flex items-center gap-3 my-8"
            >
              <div
                className="flex-1 h-px"
                style={{ background: "var(--saptta-line)" }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: "var(--saptta-mute)" }}
              >
                Quick Demo Login
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "var(--saptta-line)" }}
              />
            </motion.div>

            {/* Demo Role Cards */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
            >
              {demoRoles.map((role) => (
                <motion.div key={role.email} variants={staggerItem}>
                  <DemoRoleCard
                    role={role}
                    onSelect={handleDemoSelect}
                    isSubmitting={isLoading}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom note */}
            <motion.p
              variants={staggerItem}
              className="mt-8 text-center text-[11px] leading-relaxed"
              style={{ color: "var(--saptta-mute)" }}
            >
              By signing in, you agree to our{" "}
              <span
                className="font-medium underline underline-offset-2 cursor-pointer"
                style={{ color: "var(--saptta-accent)" }}
              >
                Terms of Service
              </span>{" "}
              and{" "}
              <span
                className="font-medium underline underline-offset-2 cursor-pointer"
                style={{ color: "var(--saptta-accent)" }}
              >
                Privacy Policy
              </span>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
