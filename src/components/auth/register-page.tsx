"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
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

/* ─── Kam Logo ─── */

function KamRegisterLogo() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex size-12 shrink-0 items-center justify-center rounded-[16px] text-white font-bold shadow-lg text-xl"
        style={{ background: "#FF9900" }}
      >
        <span className="relative z-10">K</span>
      </div>
      <span className="font-bold tracking-tight text-white text-3xl">
        <span style={{ color: "#FF9900" }}>K</span><span style={{ color: "#0066CC" }}>am</span>
      </span>
    </div>
  );
}

/* ─── Main RegistrationPage Component ─── */

export function RegistrationPage({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { login } = useAppStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      setError("");

      // Validate
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError("Please enter a valid email address.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Call the registration API
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            phone: phone.trim() || undefined,
          }),
        });

        const data = await res.json();

        if (data.success) {
          setRegistered(true);
          // Auto-login after registration
          setTimeout(async () => {
            const success = await login(email.trim().toLowerCase(), password);
            if (!success) {
              setError("Registration succeeded but auto-login failed. Please login manually.");
            }
          }, 1500);
        } else {
          setError(data.error || "Registration failed. Please try again.");
        }
      } catch {
        setError("Network error. Please try again.");
      }

      setIsLoading(false);
    },
    [name, email, phone, password, confirmPassword, login]
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
        style={{ background: "linear-gradient(180deg, #0a0a0b 0%, #1a1a1c 100%)" }}
      >
        {/* Decorative glow */}
        <div
          className="absolute top-1/4 -left-20 size-80 rounded-full blur-[120px] pointer-events-none"
          style={{ background: "rgba(139, 92, 246, 0.08)" }}
        />
        <div
          className="absolute bottom-1/4 -right-20 size-60 rounded-full blur-[100px] pointer-events-none"
          style={{ background: "rgba(200, 224, 86, 0.05)" }}
        />

        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-12">
          <div>
            <KamRegisterLogo />
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 0.8, 0.22, 1] }}
              className="mt-5 text-base leading-relaxed"
              style={{ color: "rgba(255, 255, 255, 0.55)" }}
            >
              Join the talent network — apply to positions, track your applications, and land your dream role.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-semibold text-white">What you get as a candidate:</h3>
            <div className="space-y-3">
              {[
                { icon: Briefcase, text: "AI-powered job matching & recommendations" },
                { icon: CheckCircle2, text: "Real-time application status tracking" },
                { icon: Mail, text: "Interview scheduling & notifications" },
                { icon: User, text: "Profile completeness scoring for better matches" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon className="size-4" style={{ color: "#8b5cf6" }} />
                  <span className="text-sm" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full" style={{ background: "#22c55e" }} />
            <span className="text-xs" style={{ color: "rgba(255, 255, 255, 0.35)" }}>
              No API keys needed — runs 100% locally
            </span>
          </div>
        </div>
      </div>

      {/* ─── Right Registration Form Panel ─── */}
      <div className="flex flex-1 flex-col min-h-screen" style={{ background: "var(--saptta-bg)" }}>
        {/* Mobile Brand Header */}
        <div
          className="lg:hidden flex items-center gap-3 px-6 py-5"
          style={{ background: "linear-gradient(180deg, #0a0a0b 0%, #141416 100%)" }}
        >
          <KamRegisterLogo />
        </div>

        {/* Form Area */}
        <div className="flex flex-1 items-start justify-center px-5 py-8 sm:px-8 md:px-12 lg:items-center lg:py-0">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full max-w-[440px]"
          >
            {registered ? (
              <motion.div variants={staggerItem} className="text-center space-y-4">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-green-50 mx-auto">
                  <CheckCircle2 className="size-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--saptta-ink)]">Registration Successful!</h2>
                <p className="text-sm text-[var(--saptta-mute)]">
                  Your applicant account has been created. Logging you in automatically...
                </p>
                <div className="flex justify-center">
                  <Loader2 className="size-6 animate-spin text-[var(--saptta-accent)]" />
                </div>
              </motion.div>
            ) : (
              <>
                {/* Welcome Text */}
                <motion.div variants={staggerItem} className="mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--saptta-ink)]">
                    Create Account
                  </h1>
                  <p className="mt-2 text-sm text-[var(--saptta-mute)]">
                    Register as a job applicant to start applying for positions
                  </p>
                </motion.div>

                {/* Registration Form */}
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

                  {/* Full Name */}
                  <div className="space-y-2">
                    <label htmlFor="reg-name" className="text-xs font-semibold tracking-wide uppercase text-[var(--saptta-ink-2)]">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--saptta-mute)]" />
                      <Input
                        id="reg-name"
                        type="text"
                        placeholder="Arun Venkatesh"
                        value={name}
                        onChange={(e) => { setName(e.target.value); if (error) setError(""); }}
                        disabled={isLoading}
                        className="h-11 pl-10 rounded-[16px] border text-sm"
                        style={{ borderColor: "var(--saptta-line)", background: "var(--saptta-bg)" }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="reg-email" className="text-xs font-semibold tracking-wide uppercase text-[var(--saptta-ink-2)]">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--saptta-mute)]" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="you@gmail.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                        disabled={isLoading}
                        className="h-11 pl-10 rounded-[16px] border text-sm"
                        style={{ borderColor: "var(--saptta-line)", background: "var(--saptta-bg)" }}
                      />
                    </div>
                  </div>

                  {/* Phone (Optional) */}
                  <div className="space-y-2">
                    <label htmlFor="reg-phone" className="text-xs font-semibold tracking-wide uppercase text-[var(--saptta-ink-2)]">
                      Phone <span className="text-[var(--saptta-mute)] normal-case">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--saptta-mute)]" />
                      <Input
                        id="reg-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isLoading}
                        className="h-11 pl-10 rounded-[16px] border text-sm"
                        style={{ borderColor: "var(--saptta-line)", background: "var(--saptta-bg)" }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label htmlFor="reg-password" className="text-xs font-semibold tracking-wide uppercase text-[var(--saptta-ink-2)]">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--saptta-mute)]" />
                      <Input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
                        disabled={isLoading}
                        className="h-11 pl-10 pr-11 rounded-[16px] border text-sm"
                        style={{ borderColor: "var(--saptta-line)", background: "var(--saptta-bg)" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-[var(--saptta-mute)]"
                        tabIndex={0}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label htmlFor="reg-confirm" className="text-xs font-semibold tracking-wide uppercase text-[var(--saptta-ink-2)]">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--saptta-mute)]" />
                      <Input
                        id="reg-confirm"
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(""); }}
                        disabled={isLoading}
                        className="h-11 pl-10 rounded-[16px] border text-sm"
                        style={{ borderColor: "var(--saptta-line)", background: "var(--saptta-bg)" }}
                      />
                    </div>
                  </div>

                  {/* Register Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="relative h-11 w-full rounded-[999px] text-sm font-semibold text-white shadow-lg overflow-hidden group"
                    style={{
                      background: "#FF9900",
                      boxShadow: "0 4px 20px rgba(255, 153, 0, 0.3)",
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Applicant Account
                          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </>
                      )}
                    </span>
                  </Button>
                </motion.form>

                {/* Switch to Login */}
                <motion.div variants={staggerItem} className="mt-6 text-center">
                  <p className="text-sm text-[var(--saptta-mute)]">
                    Already have an account?{" "}
                    <button
                      onClick={onSwitchToLogin}
                      className="font-medium text-[var(--saptta-accent)] hover:underline"
                    >
                      Sign in instead
                    </button>
                  </p>
                </motion.div>

                {/* Bottom note */}
                <motion.p
                  variants={staggerItem}
                  className="mt-6 text-center text-[11px] leading-relaxed text-[var(--saptta-mute)]"
                >
                  By creating an account, you agree to our{" "}
                  <span className="font-medium underline underline-offset-2 cursor-pointer text-[var(--saptta-accent)]">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="font-medium underline underline-offset-2 cursor-pointer text-[var(--saptta-accent)]">
                    Privacy Policy
                  </span>
                </motion.p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
