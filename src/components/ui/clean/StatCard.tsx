"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import TrendChip, { type TrendDirection } from "./TrendChip";

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconColor: string;
  trend?: { label: string; direction?: TrendDirection };
  prefix?: string;
  suffix?: string;
  isPercentage?: boolean;
  className?: string;
}

function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  isPercentage = false,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  isPercentage?: boolean;
}) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 60, damping: 15 });
  const display = useTransform(spring, (v) => {
    const rounded = Math.round(v);
    if (isPercentage) return `${rounded}%`;
    if (prefix === "$") return `${prefix}${rounded.toLocaleString()}`;
    return `${rounded.toLocaleString()}${suffix}`;
  });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return (
    <motion.span
      className="font-display text-[32px] font-extrabold tracking-[-0.03em] text-[#1A1D23]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {display}
    </motion.span>
  );
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  trend,
  prefix = "",
  suffix = "",
  isPercentage = false,
  className,
}: StatCardProps) {
  const numericValue = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const isNumeric = typeof value === "number" || !isNaN(numericValue);

  return (
    <motion.div
      className={cn(
        "rounded-lg border border-black/[0.07] bg-white px-6 py-5",
        className
      )}
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      whileHover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#64748B]">
          {label}
        </p>
        <Icon className="h-[18px] w-[18px]" style={{ color: iconColor }} />
      </div>

      <div className="mt-2">
        {isNumeric && typeof value === "number" ? (
          <AnimatedNumber
            value={value}
            prefix={prefix}
            suffix={suffix}
            isPercentage={isPercentage}
          />
        ) : (
          <span
            className="font-display text-[32px] font-extrabold tracking-[-0.03em] text-[#1A1D23]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {value}
          </span>
        )}
      </div>

      {trend && (
        <div className="mt-3">
          <TrendChip label={trend.label} direction={trend.direction ?? "up"} />
        </div>
      )}
    </motion.div>
  );
}
