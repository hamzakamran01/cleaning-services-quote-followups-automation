"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  FileText,
  Sparkles,
  Shield,
  Zap,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const features = [
  { icon: Zap, text: "Generate proposals in under 3 minutes" },
  { icon: TrendingUp, text: "Automated follow-up sequences" },
  { icon: Shield, text: "Enterprise-grade tracking & analytics" },
];

function HeroDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Dot grid */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.35]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="login-dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#00C5A1" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#login-dots)" />
      </svg>

      {/* Curvy accent lines */}
      <svg
        className="absolute -right-8 top-[12%] h-[55%] w-[70%] opacity-20"
        viewBox="0 0 400 300"
        fill="none"
      >
        <path
          d="M0 280 C80 200, 120 40, 200 80 S320 220, 400 120"
          stroke="#00C5A1"
          strokeWidth="1.5"
        />
        <path
          d="M0 240 C100 160, 140 20, 220 60 S340 200, 400 80"
          stroke="#00C5A1"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>

      <svg
        className="absolute -left-12 bottom-[8%] h-[40%] w-[60%] opacity-15"
        viewBox="0 0 300 200"
        fill="none"
      >
        <path
          d="M300 0 C200 80, 100 120, 0 200"
          stroke="#7C3AED"
          strokeWidth="1.5"
          opacity="0.6"
        />
      </svg>

      {/* Glowing orbs */}
      <div className="absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-[#00C5A1]/10 blur-3xl" />
      <div className="absolute -right-16 bottom-1/4 h-48 w-48 rounded-full bg-[#7C3AED]/10 blur-3xl" />
    </div>
  );
}

function FloatingProposalCard({
  company,
  amount,
  status,
  statusColor,
  delay,
  className,
}: {
  company: string;
  amount: string;
  status: string;
  statusColor: string;
  delay: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`rounded-lg border border-white/[0.08] bg-white/[0.06] p-3 backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00C5A1]/20 text-xs font-bold text-[#00C5A1]">
          {company.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-white">{company}</p>
          <p className="text-[10px] text-slate-400">{amount}/mo</p>
        </div>
      </div>
      <span
        className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
        style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
      >
        {status}
      </span>
    </motion.div>
  );
}

export function LoginHero() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-[#1A1D23] p-10 lg:flex lg:w-[52%] xl:p-14">
      <HeroDecor />

      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00C5A1]/15 ring-1 ring-[#00C5A1]/30">
          <Sparkles className="h-5 w-5 text-[#00C5A1]" />
        </div>
        <div>
          <span
            className="text-lg font-bold text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            CleanProposal
          </span>
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
            Revenue Engine
          </p>
        </div>
      </div>

      <div className="relative z-10 my-8 grid grid-cols-2 gap-8 items-center">
        <div className="max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00C5A1]/25 bg-[#00C5A1]/10 px-3 py-1 text-xs font-medium text-[#00C5A1]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Built for commercial cleaning sales teams
          </div>

          <h1
            className="text-[2.25rem] font-extrabold leading-[1.15] tracking-tight text-white xl:text-[2.75rem]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Turn 90-minute proposals into a{" "}
            <span className="text-[#00C5A1]">3-minute</span> revenue engine
          </h1>

          <p className="text-base leading-relaxed text-slate-400">
            AI-powered proposal generation and intelligent follow-ups — designed
            exclusively for commercial cleaning company owners.
          </p>

          <ul className="space-y-3 pt-2">
            {features.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] ring-1 ring-white/[0.08]">
                  <Icon className="h-4 w-4 text-[#00C5A1]" />
                </div>
                <span className="text-sm font-medium text-slate-300">{text}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Floating proposal cards — creative enterprise visual */}
        <div className="relative hidden xl:block">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-0 top-0 w-[200px]"
          >
            <FloatingProposalCard
              company="Metro Office Group"
              amount="$4,200"
              status="Hot Lead"
              statusColor="#F59E0B"
              delay={0.3}
            />
          </motion.div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute left-4 top-24 w-[200px]"
          >
            <FloatingProposalCard
              company="Summit Medical"
              amount="$8,400"
              status="Won"
              statusColor="#10B981"
              delay={0.5}
            />
          </motion.div>
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute right-8 top-44 w-[200px]"
          >
            <FloatingProposalCard
              company="Harbor Retail LLC"
              amount="$2,800"
              status="Opened"
              statusColor="#7C3AED"
              delay={0.7}
            />
          </motion.div>

          {/* Mini pipeline bar */}
          <div className="mt-52 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Pipeline this month</span>
              <BarChart3 className="h-4 w-4 text-[#00C5A1]" />
            </div>
            <div className="flex gap-1">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-[#00C5A1]/80"
                  style={{ height: `${h * 0.4}px`, opacity: 0.3 + (i * 0.1) }}
                />
              ))}
            </div>
            <p
              className="mt-3 text-2xl font-extrabold text-white"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              $954K
              <span className="text-sm font-normal text-slate-500"> pipeline value</span>
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-white/[0.06] pt-6">
        <p className="text-xs text-slate-500">
          Trusted by commercial cleaning companies nationwide
        </p>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-[#00C5A1]" />
            12 proposals sent this week
          </span>
        </div>
      </div>
    </div>
  );
}

export function LoginForm() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center bg-[#F8F7F4] p-6 lg:p-10">
      {/* Subtle right-side pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <svg className="absolute right-0 top-0 h-full w-1/2 opacity-[0.4]" viewBox="0 0 200 400" fill="none">
          <path d="M200 0 L200 400 Q100 300 100 200 T200 0" fill="#E2E8F0" opacity="0.5" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-[420px]"
      >
        {/* Mobile logo */}
        <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
          <Sparkles className="h-6 w-6 text-[#00C5A1]" />
          <span className="text-lg font-bold text-[#1A1D23]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            CleanProposal
          </span>
        </div>

        <div
          className="rounded-xl border border-black/[0.06] bg-white p-8 shadow-elevated"
        >
          <div className="mb-8 text-center">
            <h2
              className="text-2xl font-bold text-[#1A1D23]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-[#64748B]">
              Sign in to your {APP_NAME} account
            </p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-[#64748B]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                defaultValue="sarah@sparkleclean.com"
                className="h-11 border-[#E2E8F0] bg-white focus-visible:border-[#00C5A1] focus-visible:ring-[#00C5A1]/15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium text-[#64748B]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                defaultValue="demo1234"
                className="h-11 border-[#E2E8F0] bg-white focus-visible:border-[#00C5A1] focus-visible:ring-[#00C5A1]/15"
              />
            </div>

            <Link
              href="/dashboard"
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#00C5A1] text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#009980] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C5A1] focus-visible:ring-offset-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Sign In to Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </form>

          <div className="mt-6 rounded-lg border border-[#00C5A1]/20 bg-[#E6FAF6]/50 px-4 py-3">
            <p className="text-xs font-semibold text-[#009980]">Demo Mode</p>
            <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
              Click sign in to explore the full proposal workflow with sample data — no credentials required.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#94A3B8]">
          Enterprise-grade security · SOC 2 ready infrastructure
        </p>
      </motion.div>
    </div>
  );
}
