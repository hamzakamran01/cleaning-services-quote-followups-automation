"use client";

import { cn } from "@/lib/utils";

export interface LiveDotProps {
  className?: string;
}

export default function LiveDot({ className }: LiveDotProps) {
  return (
    <span className={cn("relative inline-flex h-2 w-2", className)}>
      <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-[#10B981] opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
    </span>
  );
}
