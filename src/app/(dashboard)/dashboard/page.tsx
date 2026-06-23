"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { PipelineOverview } from "@/components/dashboard/pipeline-overview";
import { PipelineKanban } from "@/components/dashboard/pipeline-kanban";
import { StatsPanel } from "@/components/dashboard/stats-panel";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ProposalsTable } from "@/components/dashboard/proposals-table";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { LayoutGrid, List, Plus, RefreshCw, BarChart3, Mail, Target, DollarSign, ArrowUpRight } from "lucide-react";
import type { DashboardStats, PipelineColumn, DemoProposal, ActivityItem } from "@/lib/types/proposal";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [pipeline, setPipeline] = useState<PipelineColumn[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [proposals, setProposals] = useState<DemoProposal[]>([]);
  const [kanbanProposals, setKanbanProposals] = useState<
    { id: string; proposalNumber: string; companyName: string; contactName: string; monthlyPrice: number; status: string; followUpCount?: number; }[]
  >([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, proposalsRes] = await Promise.all([
        fetch("/api/v1/analytics/pipeline"),
        fetch("/api/v1/proposals"),
      ]);
      const analytics = await analyticsRes.json();
      const proposalsData = await proposalsRes.json();

      setPipeline(analytics.pipeline ?? []);
      setStats(analytics.stats ?? null);
      setActivity(analytics.activity ?? []);
      setProposals(proposalsData.proposals ?? []);
      setKanbanProposals(
        (analytics.proposals ?? proposalsData.proposals ?? []).map((p: any) => ({
          id: p.id,
          proposalNumber: p.proposalNumber,
          companyName: p.companyName,
          contactName: p.contactName,
          monthlyPrice: p.monthlyPrice,
          status: p.status,
          followUpCount: p.followUpCount,
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStatusChange = useCallback(async (proposalId: string, newStatus: string) => {
    const res = await fetch(`/api/v1/proposals/${proposalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) throw new Error("Failed to update");
    await load();
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Header title="Pipeline Overview" subtitle="Real-time view of your sales pipeline" />

      {/* KPI Hero Row (Desktop only, hidden on mobile to save space) */}
      {!loading && stats && (
        <section className="hidden border-b border-brand-border/60 bg-white lg:block">
          <div className="grid grid-cols-4 divide-x divide-brand-border/60">
            {[
              {
                label: "Proposals Sent",
                value: stats.proposalsSent,
                icon: Mail,
                color: "text-blue-600",
                bg: "bg-blue-50",
                subtext: "+3 this week",
              },
              {
                label: "Open Rate",
                value: `${stats.openRate}%`,
                icon: BarChart3,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
                subtext: "Above average",
              },
              {
                label: "Conversion",
                value: `${stats.conversionRate}%`,
                icon: Target,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                subtext: "+2% vs last mo.",
              },
              {
                label: "Revenue Won",
                value: formatCurrency(stats.revenueWon),
                icon: DollarSign,
                color: "text-violet-600",
                bg: "bg-violet-50",
                subtext: "On track",
              },
            ].map((kpi, i) => (
              <div key={i} className="p-6 transition-colors hover:bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
                      {kpi.label}
                    </p>
                    <p className="mt-2 text-3xl font-black tracking-tight text-brand-text">
                      {kpi.value}
                    </p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.bg}`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
                <p className="mt-3 flex items-center gap-1 text-sm font-medium text-brand-muted">
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                  {kpi.subtext}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sticky Command Bar */}
      <div className="command-bar">
        <div className="flex items-center gap-2">
          <div className="view-toggle">
            <Button
              variant={view === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("kanban")}
              className={view === "kanban" ? "shadow-sm" : ""}
            >
              <LayoutGrid className="h-4 w-4" /> Kanban
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
              className={view === "list" ? "shadow-sm" : ""}
            >
              <List className="h-4 w-4" /> Summary
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="bg-white">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button size="sm" asChild className="relative overflow-hidden bg-brand-primary font-semibold shadow-md">
            <Link href="/proposals/new">
              <div className="absolute -left-4 -top-8 h-24 w-8 rotate-12 bg-white/20 blur-md" />
              <Plus className="mr-1 h-4 w-4" /> New Proposal
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="p-4 lg:p-6 xl:p-8">
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="animate-fade-in space-y-8">
            <div className="space-y-8">
              {/* Pipeline View (Full Width) */}
              <div className="min-w-0">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="page-section-title">Pipeline View</h2>
                </div>
                {view === "kanban" ? (
                  <PipelineKanban
                    columns={pipeline}
                    proposals={kanbanProposals}
                    onStatusChange={handleStatusChange}
                  />
                ) : (
                  <PipelineOverview columns={pipeline} />
                )}
              </div>

              {/* Stats & Activity Row */}
              <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  {stats && <StatsPanel stats={stats} />}
                </div>
                <div className="lg:col-span-2">
                  <ActivityFeed items={activity} />
                </div>
              </div>
            </div>

            {/* Bottom Row: Full Width Table */}
            <section className="pt-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="page-section-title">All Proposals</h2>
              </div>
              <ProposalsTable proposals={proposals} onRefresh={load} />
            </section>
          </div>
        )}
      </main>
    </>
  );
}

