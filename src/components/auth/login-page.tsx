"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
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
      delayChildren: 0.15,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 18 },
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
    email: "priya@kamglobal.io",
    password: "admin123",
    icon: Shield,
    accent: "var(--saptta-accent)",
    accentLight: "rgba(255, 153, 0, 0.07)",
    description: "Full HR management & compliance",
  },
  {
    label: "Manager",
    email: "rajesh@kamglobal.io",
    password: "manager123",
    icon: Users,
    accent: "var(--saptta-accent-2)",
    accentLight: "rgba(0, 102, 204, 0.07)",
    description: "Team oversight & approvals",
  },
  {
    label: "Employee",
    email: "anita@kamglobal.io",
    password: "employee123",
    icon: UserCheck,
    accent: "var(--saptta-accent)",
    accentLight: "rgba(255, 153, 0, 0.07)",
    description: "Self-service HR portal",
  },
  {
    label: "Recruiter",
    email: "kavitha@kamglobal.io",
    password: "recruiter123",
    icon: UserPlus,
    accent: "var(--saptta-accent-2)",
    accentLight: "rgba(0, 102, 204, 0.07)",
    description: "Candidate pipeline & screening",
  },
  {
    label: "Job Applicant",
    email: "arun@gmail.com",
    password: "applicant123",
    icon: Briefcase,
    accent: "var(--saptta-accent-3)",
    accentLight: "rgba(139, 92, 246, 0.07)",
    description: "Application tracking & status",
  },
];

/* ─── Kam Logo Component ─── */

function KamLoginLogo({ size = "default" }: { size?: "default" | "small" }) {
  const isSmall = size === "small";
  return (
    <div className="flex items-center justify-center">
      <Image
        src="/kam-logo.png"
        alt="Kam Global — AI-Powered HRMS"
        width={isSmall ? 110 : 160}
        height={isSmall ? 36 : 52}
        priority
        style={{ objectFit: "contain" }}
      />
    </div>
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
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.22, 0.8, 0.22, 1] }}
    >
      <Card
        className="cursor-pointer border transition-all duration-200 hover:shadow-sm py-0 overflow-hidden"
        style={{
          borderColor: `${role.accent}25`,
          background: role.accentLight,
        }}
        onClick={() => !isSubmitting && onSelect(role)}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: `${role.accent}18`,
                border: `1px solid ${role.accent}28`,
              }}
            >
              <Icon className="size-3.5" style={{ color: role.accent }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight" style={{ color: role.accent }}>
                {role.label}
              </p>
              <p className="text-[11px] mt-0.5 truncate text-gray-400">
                {role.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Main LoginPage Component ─── */

export function LoginPage({ onSwitchToRegister }: { onSwitchToRegister?: () => void }) {
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
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10"
      style={{ background: "#FAF7F2" }}
    >
      {/* ─── Decorative Blobs ─── */}

      {/* Top-right large blob */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 size-[420px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,180,60,0.55) 0%, rgba(255,100,30,0.35) 55%, transparent 80%)",
          filter: "blur(0px)",
        }}
      />
      {/* Top-right inner solid circle (like Mangools reference) */}
      <div
        className="pointer-events-none absolute -top-10 right-0 size-[260px] rounded-full"
        style={{
          background: "linear-gradient(135deg, #FFB830 0%, #FF6B35 60%, #FF4444 100%)",
          opacity: 0.92,
        }}
      />

      {/* Bottom-left small blob */}
      <div
        className="pointer-events-none absolute bottom-8 -left-10 size-[140px] rounded-full"
        style={{
          background: "linear-gradient(135deg, #FFB830 0%, #FF8E35 100%)",
          opacity: 0.85,
        }}
      />
      {/* Bottom-left glow */}
      <div
        className="pointer-events-none absolute bottom-0 -left-16 size-[220px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,180,60,0.4) 0%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* ─── Centered Form Card ─── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* Logo above card */}
        <motion.div variants={staggerItem} className="mb-7 flex justify-center">
          <KamLoginLogo />
        </motion.div>

        {/* White card */}
        <motion.div
          variants={staggerItem}
          className="rounded-2xl bg-white px-8 py-8 shadow-xl"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.09)" }}
        >
          {/* Title */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Sign in to your Kam account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error */}
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
                  <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm text-red-600"
                    style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)" }}>
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full"
                      style={{ background: "rgba(239,68,68,0.12)" }}>
                      <span className="text-xs font-bold">!</span>
                    </div>
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Your email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="e.g. you@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                  disabled={isLoading}
                  className="h-11 pl-10 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Your password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium transition-colors hover:underline"
                  style={{ color: "var(--saptta-accent)" }}
                  tabIndex={0}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="e.g. yourpassword123"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
                  disabled={isLoading}
                  className="h-11 pl-10 pr-11 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={0}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="relative h-11 w-full rounded-full text-sm font-semibold text-white overflow-hidden group mt-1"
              style={{
                background: "var(--saptta-accent)",
                boxShadow: "0 4px 18px rgba(255,153,0,0.32)",
              }}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.15) 50%,transparent 100%)" }} />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <><Loader2 className="size-4 animate-spin" /> Signing in...</>
                ) : (
                  <>Sign in <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></>
                )}
              </span>
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs font-medium text-gray-400">Quick Demo Login</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Demo Role Cards */}
          <div className="grid grid-cols-2 gap-2">
            {demoRoles.map((role) => (
              <div key={role.email} className={role.label === "Job Applicant" ? "col-span-2" : ""}>
                <DemoRoleCard role={role} onSelect={handleDemoSelect} isSubmitting={isLoading} />
              </div>
            ))}
          </div>

          {/* Footer links */}
          <p className="mt-6 text-center text-[11px] text-gray-400">
            By signing in, you agree to our{" "}
            <span className="font-medium underline underline-offset-2 cursor-pointer" style={{ color: "var(--saptta-accent)" }}>
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="font-medium underline underline-offset-2 cursor-pointer" style={{ color: "var(--saptta-accent)" }}>
              Privacy Policy
            </span>
          </p>

          {onSwitchToRegister && (
            <p className="mt-3 text-center text-sm text-gray-500">
              New applicant?{" "}
              <button
                onClick={onSwitchToRegister}
                className="font-semibold hover:underline"
                style={{ color: "var(--saptta-accent)" }}
              >
                Create an account
              </button>
            </p>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
