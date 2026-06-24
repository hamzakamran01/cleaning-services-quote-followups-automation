"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import StatCard from "@/components/ui/clean/StatCard";
import LoadingSkeleton from "@/components/ui/clean/LoadingSkeleton";
import { RevenueChart } from "@/components/analytics/revenue-chart";
import { PipelineFunnel } from "@/components/analytics/pipeline-funnel";
import { StatusPieChart } from "@/components/analytics/status-pie-chart";
import { MonthlyBarChart } from "@/components/analytics/monthly-bar-chart";
import { DollarSign, Target, TrendingUp, Clock } from "lucide-react";
import type { DashboardStats, MonthlyAnalytics, PipelineColumn } from "@/lib/types/proposal";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthly, setMonthly] = useState<MonthlyAnalytics[]>([]);
  const [pipeline, setPipeline] = useState<PipelineColumn[]>([]);
  const [proposals, setProposals] = useState<{ status: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/analytics/pipeline").then((r) => r.json()),
      fetch("/api/v1/analytics/monthly?months=6").then((r) => r.json()),
      fetch("/api/v1/proposals").then((r) => r.json()),
    ]).then(([pipelineData, monthlyData, proposalsData]) => {
      setStats(pipelineData.stats ?? null);
      setPipeline(pipelineData.pipeline ?? []);
      setMonthly(monthlyData.months ?? []);
      setProposals(proposalsData.proposals ?? []);
      setLoading(false);
    });
  }, []);

  const statusCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of proposals) {
      map.set(p.status, (map.get(p.status) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
  }, [proposals]);

  return (
    <>
      <Header title="Analytics" subtitle="Performance metrics and conversion insights" />
      <main className="flex-1 space-y-8 p-6">
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <LoadingSkeleton key={i} variant="card" />
              ))}
            </div>
            <LoadingSkeleton variant="card" className="h-72" />
          </div>
        ) : (
          stats && (
            <div className="space-y-8">
              {/* Top metrics 2x2 */}
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard
                  label="Total Pipeline Value"
                  value={stats.pipelineValue}
                  icon={TrendingUp}
                  iconColor="#00C5A1"
                  prefix="$"
                  trend={{ label: "Active pipeline", direction: "up" }}
                />
                <StatCard
                  label="Avg Deal Size"
                  value={stats.avgProposalValue}
                  icon={DollarSign}
                  iconColor="#3B82F6"
                  prefix="$"
                  trend={{ label: "Per proposal", direction: "neutral" }}
                />
                <StatCard
                  label="Win Rate"
                  value={stats.conversionRate}
                  icon={Target}
                  iconColor="#7C3AED"
                  isPercentage
                  trend={{ label: "Conversion rate", direction: "up" }}
                />
                <StatCard
                  label="Avg Time to Close"
                  value={stats.avgDaysToClose ?? 0}
                  icon={Clock}
                  iconColor="#F59E0B"
                  suffix=" days"
                  trend={{
                    label: stats.avgDaysToClose ? "Historical avg" : "No data yet",
                    direction: "neutral",
                  }}
                />
              </section>

              {/* Revenue line chart */}
              <RevenueChart data={monthly} />

              {/* Pipeline funnel */}
              <PipelineFunnel columns={pipeline} />

              {/* Bottom row */}
              <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <StatusPieChart statusCounts={statusCounts} />
                <MonthlyBarChart data={monthly} />
              </section>
            </div>
          )
        )}
      </main>
    </>
  );
}
