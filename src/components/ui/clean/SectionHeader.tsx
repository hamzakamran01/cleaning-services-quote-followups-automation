"use client";

import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  title: string;
  accent?: boolean;
  className?: string;
}

export default function SectionHeader({ title, accent = false, className }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]",
        accent && "border-l-[3px] border-[#00C5A1] pl-3 font-display text-[15px] font-bold normal-case tracking-normal text-[#1A1D23]",
        className
      )}
      style={accent ? { fontFamily: "'Plus Jakarta Sans', sans-serif" } : undefined}
    >
      {title}
    </div>
  );
}
