"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Users, UserCheck, UserPlus, Briefcase,
  Eye, EyeOff, Loader2, Lock, Mail, ChevronRight,
  LayoutDashboard, UserCog, Headphones, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";

/* ─── Variants ─── */

const cardIn = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: [0.22, 0.8, 0.22, 1] } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 0.8, 0.22, 1] } },
};

const errAnim = {
  hidden: { opacity: 0, y: -6, height: 0 },
  visible: { opacity: 1, y: 0, height: "auto", transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -6, height: 0, transition: { duration: 0.2 } },
};

/* ─── Demo Roles ─── */

interface DemoRole {
  label: string;
  email: string;
  password: string;
  icon: React.ElementType;
  sub: string;
}

const demoRoles: DemoRole[] = [
  { label: "HR Admin",      email: "priya@kamglobal.io",   password: "admin123",     icon: Shield,         sub: "Full HR & compliance" },
  { label: "Manager",       email: "rajesh@kamglobal.io",  password: "manager123",   icon: Building2,      sub: "Team oversight" },
  { label: "Employee",      email: "anita@kamglobal.io",   password: "employee123",  icon: UserCheck,      sub: "Self-service portal" },
  { label: "Recruiter",     email: "kavitha@kamglobal.io", password: "recruiter123", icon: UserCog,        sub: "Candidate pipeline" },
  { label: "Job Applicant", email: "arun@gmail.com",       password: "applicant123", icon: Briefcase,      sub: "Application tracking" },
];

/* ─── Logo ─── */

function KamLogo() {
  return (
    <div className="flex justify-center">
      <Image src="/kam-logo.png" alt="Kam Global HRMS" width={150} height={48} priority style={{ objectFit: "contain" }} />
    </div>
  );
}

/* ─── Main ─── */

export function LoginPage({ onSwitchToRegister }: { onSwitchToRegister?: () => void }) {
  const { login, isLoading } = useAppStore();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    if (!email.trim())    { setError("Please enter your email address."); return; }
    if (!password.trim()) { setError("Please enter your password."); return; }
    const ok = await login(email.trim(), password.trim());
    if (!ok) setError("Invalid email or password. Try a demo role →");
  }, [email, password, login]);

  const handleDemo = useCallback(async (role: DemoRole) => {
    setEmail(role.email);
    setPassword(role.password);
    setError("");
    await new Promise(r => setTimeout(r, 120));
    const ok = await login(role.email, role.password);
    if (!ok) setError("Demo login failed. Please try again.");
  }, [login]);

  return (
    /* Page — light gray bg */
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8"
      style={{ background: "#F0F0F0" }}>

      {/* Outer card */}
      <motion.div
        variants={cardIn} initial="hidden" animate="visible"
        className="w-full max-w-5xl overflow-hidden rounded-[32px] shadow-2xl flex flex-col lg:flex-row bg-white"
        style={{ minHeight: 580 }}
      >

        {/* ── LEFT — form ── */}
        <motion.div
          variants={stagger} initial="hidden" animate="visible"
          className="flex flex-1 flex-col items-center justify-center px-8 py-12 sm:px-14"
        >
          {/* Logo */}
          <motion.div variants={item} className="mb-6 w-full">
            <KamLogo />
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={item} className="mb-6 text-3xl font-bold text-gray-900 tracking-tight">
            Sign In
          </motion.h1>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div key="err" variants={errAnim} initial="hidden" animate="visible" exit="exit"
                className="w-full mb-4 overflow-hidden">
                <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-red-600 bg-red-50 border border-red-100">
                  <span className="flex size-5 items-center justify-center rounded-full bg-red-100 text-xs font-bold shrink-0">!</span>
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form variants={stagger} onSubmit={handleSubmit} className="w-full space-y-4">
            {/* Email */}
            <motion.div variants={item} className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
              <Input
                type="email" placeholder="Email"
                value={email} onChange={e => { setEmail(e.target.value); if (error) setError(""); }}
                disabled={isLoading}
                className="h-13 pl-11 rounded-full border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/20 transition-all"
                autoComplete="email"
              />
            </motion.div>

            {/* Password */}
            <motion.div variants={item} className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
              <Input
                type={showPwd ? "text" : "password"} placeholder="Password"
                value={password} onChange={e => { setPassword(e.target.value); if (error) setError(""); }}
                disabled={isLoading}
                className="h-13 pl-11 pr-12 rounded-full border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/20 transition-all"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </motion.div>

            {/* Forgot */}
            <motion.div variants={item} className="text-center">
              <button type="button" className="text-sm text-gray-500 hover:text-[#FF9900] transition-colors">
                Forgot Your Password?
              </button>
            </motion.div>

            {/* Submit */}
            <motion.div variants={item}>
              <Button type="submit" disabled={isLoading}
                className="w-full h-12 rounded-full text-sm font-semibold text-white transition-all duration-300 group"
                style={{ background: "#FF9900", boxShadow: "0 4px 18px rgba(255,153,0,0.35)" }}>
                {isLoading
                  ? <><Loader2 className="size-4 animate-spin mr-2" />Signing in...</>
                  : <span className="uppercase tracking-widest text-xs font-bold">Sign In</span>}
              </Button>
            </motion.div>
          </motion.form>

          {/* Terms */}
          <motion.p variants={item} className="mt-6 text-center text-[11px] text-gray-400">
            By signing in you agree to our{" "}
            <span className="underline cursor-pointer" style={{ color: "#FF9900" }}>Terms of Service</span>
            {" "}and{" "}
            <span className="underline cursor-pointer" style={{ color: "#FF9900" }}>Privacy Policy</span>
          </motion.p>
        </motion.div>

        {/* ── RIGHT — demo panel ── */}
        <div
          className="hidden lg:flex flex-col items-center justify-center w-[420px] xl:w-[460px] shrink-0 px-10 py-12 relative"
          style={{
            background: "#FF9900",
            borderRadius: "40px 0 0 40px",
          }}
        >
          {/* Decorative large faded circle */}
          <div className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="pointer-events-none absolute -bottom-10 -left-10 size-48 rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }} />

          <div className="relative z-10 w-full text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Hello, Friend!</h2>
            <p className="text-sm text-white/75 mb-8 leading-relaxed">
              Enter your credentials or click any<br />demo role to explore instantly
            </p>

            {/* Demo role buttons */}
            <div className="space-y-2.5">
              {demoRoles.map((role) => {
                const Icon = role.icon;
                return (
                  <motion.button
                    key={role.email}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDemo(role)}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 group"
                    style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                      <Icon className="size-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white leading-tight">{role.label}</p>
                      <p className="text-[11px] text-white/65 truncate">{role.email}</p>
                    </div>
                    <ChevronRight className="size-4 text-white/50 group-hover:text-white transition-colors" />
                  </motion.button>
                );
              })}
            </div>

            {onSwitchToRegister && (
              <button
                onClick={onSwitchToRegister}
                className="mt-6 w-full h-11 rounded-full border-2 border-white text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#FF9900] transition-all duration-200"
              >
                Create Account
              </button>
            )}
          </div>
        </div>

        {/* ── MOBILE demo section ── */}
        <div className="lg:hidden px-8 pb-10 space-y-2">
          <p className="text-center text-xs font-medium text-gray-400 mb-3">— Quick Demo Login —</p>
          {demoRoles.map((role) => {
            const Icon = role.icon;
            return (
              <button key={role.email} onClick={() => handleDemo(role)} disabled={isLoading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 text-left hover:border-[#FF9900]/40 hover:bg-[#FF9900]/5 transition-all">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#FF9900]/10">
                  <Icon className="size-3.5" style={{ color: "#FF9900" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">{role.label}</p>
                  <p className="text-[11px] text-gray-400 truncate">{role.email}</p>
                </div>
                <ChevronRight className="size-4 text-gray-300" />
              </button>
            );
          })}
        </div>

      </motion.div>
    </div>
  );
}
