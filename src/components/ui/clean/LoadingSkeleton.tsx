"use client";

import { cn } from "@/lib/utils";

export interface LoadingSkeletonProps {
  className?: string;
  variant?: "card" | "row" | "text" | "circle";
}

export default function LoadingSkeleton({ className, variant = "text" }: LoadingSkeletonProps) {
  const base = "animate-shimmer bg-gradient-to-r from-[#F1F5F9] via-[#E2E8F0] to-[#F1F5F9] bg-[length:200%_100%]";

  const variants = {
    card: "h-32 w-full rounded-lg",
    row: "h-[72px] w-full rounded-lg",
    text: "h-4 w-full rounded",
    circle: "h-8 w-8 rounded-full",
  };

  return <div className={cn(base, variants[variant], className)} aria-hidden />;
}
