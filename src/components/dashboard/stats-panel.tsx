import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/lib/types/proposal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, DollarSign, Mail, Target, TrendingUp } from "lucide-react";

interface StatsPanelProps {
  stats: DashboardStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const highlights = [
    {
      label: "Proposals Sent",
      value: stats.proposalsSent.toString(),
      icon: Mail,
      accent: "primary" as const,
    },
    {
      label: "Open Rate",
      value: `${stats.openRate}%`,
      icon: BarChart3,
      accent: "primary" as const,
    },
    {
      label: "Conversion",
      value: `${stats.conversionRate}%`,
      icon: Target,
      accent: "accent" as const,
    },
    {
      label: "Revenue Won",
      value: formatCurrency(stats.revenueWon),
      icon: DollarSign,
      accent: "accent" as const,
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-brand-border/40 bg-gradient-to-r from-brand-primary/[0.04] to-transparent pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-primary" />
            <CardTitle className="text-base">This Month</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {highlights.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                  <item.icon className="h-3.5 w-3.5 text-brand-muted" />
                </div>
                <span className="text-sm text-brand-muted">{item.label}</span>
              </div>
              <span className="font-bold text-brand-text">{item.value}</span>
            </div>
          ))}
          <div className="rounded-xl bg-brand-accent/[0.06] p-3">
            <p className="text-xs font-medium text-brand-muted">Pipeline Value</p>
            <p className="mt-1 text-xl font-bold text-brand-accent">
              {formatCurrency(stats.pipelineValue)}
            </p>
          </div>
          {stats.avgDaysToClose && (
            <div className="flex items-center justify-between border-t border-brand-border/40 pt-3">
              <span className="text-sm text-brand-muted">Avg Days to Close</span>
              <span className="font-semibold text-brand-text">{stats.avgDaysToClose} days</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
