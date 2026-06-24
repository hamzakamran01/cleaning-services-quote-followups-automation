"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type TrendDirection = "up" | "down" | "neutral";

export interface TrendChipProps {
  label: string;
  direction?: TrendDirection;
  className?: string;
}

const directionStyles: Record<TrendDirection, string> = {
  up: "bg-[#F0FDF4] text-[#059669]",
  down: "bg-[#FFF1F2] text-[#F43F5E]",
  neutral: "bg-[#F1F5F9] text-[#64748B]",
};

export default function TrendChip({ label, direction = "neutral", className }: TrendChipProps) {
  const Icon = direction === "up" ? ArrowUp : direction === "down" ? ArrowDown : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        directionStyles[direction],
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
