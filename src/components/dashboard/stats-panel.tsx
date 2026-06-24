"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/lib/types/proposal";
import TrendChip from "@/components/ui/clean/TrendChip";
import {
  BarChart3,
  DollarSign,
  Mail,
  Target,
} from "lucide-react";

interface StatsPanelProps {
  stats: DashboardStats;
}

interface StatRow {
  label: string;
  value: string;
  icon: typeof Mail;
  iconColor: string;
  progress: number;
  fillColor: string;
  trend: "up" | "down" | "neutral";
  trendLabel: string;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const highlights: StatRow[] = [
    {
      label: "Proposals Sent",
      value: stats.proposalsSent.toString(),
      icon: Mail,
      iconColor: "#3B82F6",
      progress: Math.min((stats.proposalsSent / 30) * 100, 100),
      fillColor: "#00C5A1",
      trend: "up",
      trendLabel: "+3 this week",
    },
    {
      label: "Open Rate",
      value: `${stats.openRate}%`,
      icon: BarChart3,
      iconColor: "#7C3AED",
      progress: stats.openRate,
      fillColor: "#F43F5E",
      trend: stats.openRate >= 50 ? "up" : "down",
      trendLabel: stats.openRate >= 50 ? "Above average" : "Below average",
    },
    {
      label: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      icon: Target,
      iconColor: "#00C5A1",
      progress: stats.conversionRate,
      fillColor: "#00C5A1",
      trend: "up",
      trendLabel: "+2% vs last mo.",
    },
    {
      label: "Revenue Won",
      value: formatCurrency(stats.revenueWon),
      icon: DollarSign,
      iconColor: "#F59E0B",
      progress: Math.min((stats.revenueWon / 60000) * 100, 100),
      fillColor: "#00C5A1",
      trend: "up",
      trendLabel: "On track",
    },
  ];

  return (
    <div
      className="rounded-lg bg-white p-6"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <h3 className="text-[15px] font-bold text-[#1A1D23]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        This Month
      </h3>

      <div className="mt-5 space-y-5">
        {highlights.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Icon className="h-[18px] w-[18px]" style={{ color: item.iconColor }} />
                  <span className="text-[13px] font-medium text-[#64748B]">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendChip label={item.trendLabel} direction={item.trend} />
                  <span className="text-base font-bold text-[#1A1D23]">{item.value}</span>
                </div>
              </div>
              <div className="h-1 overflow-hidden rounded-lg bg-[#F1F5F9]">
                <motion.div
                  className="h-full rounded-lg"
                  style={{ backgroundColor: item.fillColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg bg-[#059669] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/90">
          Total Pipeline Value
        </p>
        <p
          className="mt-1 text-[28px] font-extrabold text-white"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {formatCurrency(stats.pipelineValue)}
        </p>
      </div>
    </div>
  );
}
