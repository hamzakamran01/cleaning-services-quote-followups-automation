"use client";

import { STATUS_CONFIG, resolveStatusKey, type StatusKey } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: string;
  className?: string;
  showFire?: boolean;
}

export default function StatusBadge({ status, className, showFire = true }: StatusBadgeProps) {
  const key: StatusKey = resolveStatusKey(status);
  const config = STATUS_CONFIG[key];

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", className)}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: config.dot }} />
      {key}
      {showFire && key === "Hot Lead" && <span aria-hidden>🔥</span>}
    </span>
  );
}
