import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/lib/types/proposal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  DollarSign,
  Mail,
  Target,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface StatsPanelProps {
  stats: DashboardStats;
}

interface StatRow {
  label: string;
  value: string;
  icon: typeof Mail;
  iconBg: string;
  iconColor: string;
  progress?: number; // 0-100
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const highlights: StatRow[] = [
    {
      label: "Proposals Sent",
      value: stats.proposalsSent.toString(),
      icon: Mail,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      progress: Math.min((stats.proposalsSent / 30) * 100, 100),
      trend: "up",
      trendLabel: "+3 this week",
    },
    {
      label: "Open Rate",
      value: `${stats.openRate}%`,
      icon: BarChart3,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      progress: stats.openRate,
      trend: stats.openRate >= 60 ? "up" : "down",
      trendLabel: stats.openRate >= 60 ? "Above avg" : "Below avg",
    },
    {
      label: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      icon: Target,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      progress: stats.conversionRate,
      trend: "up",
      trendLabel: "+2% vs last mo.",
    },
    {
      label: "Revenue Won",
      value: formatCurrency(stats.revenueWon),
      icon: DollarSign,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      progress: Math.min((stats.revenueWon / 60000) * 100, 100),
      trend: "up",
      trendLabel: "On track",
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-brand-border/70" style={{ boxShadow: "var(--shadow-sm)" }}>
        <CardHeader className="border-b border-brand-border/40 bg-gradient-to-r from-brand-primary/[0.04] to-transparent pb-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-primary" />
              <CardTitle className="text-base">This Month</CardTitle>
            </div>
            <span className="text-xs font-medium text-brand-muted">Live</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          {highlights.map((item) => {
            const Icon = item.icon;
            const TrendIcon = item.trend === "up" ? ArrowUpRight : ArrowDownRight;
            return (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${item.iconBg}`}>
                      <Icon className={`h-3.5 w-3.5 ${item.iconColor}`} />
                    </div>
                    <span className="text-sm text-brand-muted">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.trend && item.trendLabel && (
                      <span
                        className={
                          item.trend === "up"
                            ? "trend-up"
                            : item.trend === "down"
                              ? "trend-down"
                              : "trend-neutral"
                        }
                      >
                        <TrendIcon className="h-3 w-3" />
                        {item.trendLabel}
                      </span>
                    )}
                    <span className="text-sm font-bold text-brand-text">{item.value}</span>
                  </div>
                </div>
                {item.progress !== undefined && (
                  <div className="pipeline-bar-track">
                    <div
                      className="pipeline-bar-fill animate-bar-grow"
                      style={{
                        width: `${item.progress}%`,
                        background:
                          item.trend === "up"
                            ? "linear-gradient(90deg, #1e40af, #3b82f6)"
                            : item.trend === "down"
                              ? "linear-gradient(90deg, #dc2626, #f87171)"
                              : "linear-gradient(90deg, #64748b, #94a3b8)",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Pipeline Value Hero Card */}
          <div
            className="relative overflow-hidden rounded-xl p-4"
            style={{ background: "var(--gradient-accent)" }}
          >
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)"
            }} />
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100">
              Total Pipeline Value
            </p>
            <p className="mt-1 text-2xl font-black text-white">
              {formatCurrency(stats.pipelineValue)}
            </p>
            <p className="mt-0.5 text-xs text-emerald-100">
              Avg {formatCurrency(stats.avgProposalValue ?? 0)} / proposal
            </p>
          </div>

          {stats.avgDaysToClose && (
            <div className="flex items-center justify-between rounded-xl border border-brand-border/40 px-4 py-3">
              <span className="text-sm text-brand-muted">Avg Days to Close</span>
              <span className="font-bold text-brand-text">{stats.avgDaysToClose} days</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
