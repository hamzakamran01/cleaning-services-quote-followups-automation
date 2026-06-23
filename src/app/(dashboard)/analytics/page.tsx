"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  DollarSign,
  Mail,
  Target,
  TrendingUp,
} from "lucide-react";
import type { DashboardStats, MonthlyAnalytics } from "@/lib/types/proposal";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthly, setMonthly] = useState<MonthlyAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/analytics/pipeline").then((r) => r.json()),
      fetch("/api/v1/analytics/monthly?months=6").then((r) => r.json()),
    ]).then(([pipeline, monthlyData]) => {
      setStats(pipeline.stats ?? null);
      setMonthly(monthlyData.months ?? []);
      setLoading(false);
    });
  }, []);

  const kpiCards = stats
    ? [
        { label: "Open Rate", value: `${stats.openRate}%`, icon: Mail, accent: "primary" as const },
        { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: Target, accent: "accent" as const },
        { label: "Pipeline Value", value: formatCurrency(stats.pipelineValue), icon: TrendingUp, accent: "primary" as const },
        { label: "Avg Proposal Value", value: formatCurrency(stats.avgProposalValue), icon: BarChart3, accent: "neutral" as const },
        { label: "Revenue Won (MTD)", value: formatCurrency(stats.revenueWon), icon: DollarSign, accent: "accent" as const },
        { label: "Proposals Sent (MTD)", value: String(stats.proposalsSent), icon: Mail, accent: "primary" as const },
        ...(stats.avgDaysToClose
          ? [{ label: "Avg Days to Close", value: `${stats.avgDaysToClose} days`, icon: Calendar, accent: "neutral" as const }]
          : []),
      ]
    : [];

  return (
    <>
      <Header title="Analytics" subtitle="Performance metrics and conversion insights" />
      <main className="flex-1 space-y-8 p-4 lg:p-8">
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {kpiCards.map((item) => (
                <StatCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  icon={item.icon}
                  accent={item.accent}
                />
              ))}
            </div>

            <Card>
              <CardHeader className="border-b border-brand-border/40 bg-gradient-to-r from-brand-primary/[0.04] to-transparent">
                <CardTitle className="text-base">Monthly Performance (6 months)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Sent</th>
                        <th>Won</th>
                        <th>Revenue</th>
                        <th>Open Rate</th>
                        <th>Conversion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthly.map((row) => (
                        <tr key={row.month}>
                          <td className="font-semibold text-brand-text">{row.month}</td>
                          <td>{row.proposalsSent}</td>
                          <td>{row.proposalsWon}</td>
                          <td className="font-medium text-brand-accent">{formatCurrency(row.revenueWon)}</td>
                          <td>{row.openRate}%</td>
                          <td>{row.conversionRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </>
  );
}
