import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  accent?: "primary" | "accent" | "warning" | "danger" | "neutral";
  className?: string;
}

const accentStyles = {
  primary: "from-brand-primary/10 to-brand-primary/5 text-brand-primary",
  accent: "from-brand-accent/10 to-brand-accent/5 text-brand-accent",
  warning: "from-brand-warning/10 to-brand-warning/5 text-brand-warning",
  danger: "from-brand-danger/10 to-brand-danger/5 text-brand-danger",
  neutral: "from-slate-100 to-slate-50 text-brand-muted",
};

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  accent = "neutral",
  className,
}: StatCardProps) {
  return (
    <div className={cn("stat-card group", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-brand-text">{value}</p>
          {subtext && <p className="mt-1 text-sm text-brand-muted">{subtext}</p>}
          {trend && (
            <p
              className={cn(
                "mt-2 text-xs font-medium",
                trend.positive ? "text-brand-accent" : "text-brand-muted"
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
              accentStyles[accent]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
