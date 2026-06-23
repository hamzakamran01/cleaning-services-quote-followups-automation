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
import { LayoutGrid, List, Plus, RefreshCw, TrendingUp } from "lucide-react";
import type { DashboardStats, PipelineColumn, DemoProposal, ActivityItem } from "@/lib/types/proposal";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [pipeline, setPipeline] = useState<PipelineColumn[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [proposals, setProposals] = useState<DemoProposal[]>([]);
  const [kanbanProposals, setKanbanProposals] = useState<
    {
      id: string;
      proposalNumber: string;
      companyName: string;
      contactName: string;
      monthlyPrice: number;
      status: string;
      followUpCount?: number;
    }[]
  >([]);

  async function load() {
    setLoading(true);
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
      (analytics.proposals ?? proposalsData.proposals ?? []).map(
        (p: {
          id: string;
          proposalNumber: string;
          companyName: string;
          contactName: string;
          monthlyPrice: number;
          status: string;
          followUpCount?: number;
        }) => ({
          id: p.id,
          proposalNumber: p.proposalNumber,
          companyName: p.companyName,
          contactName: p.contactName,
          monthlyPrice: p.monthlyPrice,
          status: p.status,
          followUpCount: p.followUpCount,
        })
      )
    );
    setLoading(false);
  }

  const handleStatusChange = useCallback(async (proposalId: string, newStatus: string) => {
    const res = await fetch(`/api/v1/proposals/${proposalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) throw new Error("Failed to update");
    await load();
  }, []);

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Header title="Pipeline Overview" subtitle="Real-time view of your sales pipeline" />
      <main className="flex-1 space-y-8 p-4 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 text-brand-primary">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Revenue Pipeline</span>
            </div>
            <p className="mt-1 text-sm text-brand-muted">
              Track proposals from draft to won — drag cards to update status
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="view-toggle">
              <Button
                variant={view === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("kanban")}
              >
                <LayoutGrid className="h-4 w-4" /> Kanban
              </Button>
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("list")}
              >
                <List className="h-4 w-4" /> Summary
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" asChild>
              <Link href="/proposals/new">
                <Plus className="h-4 w-4" /> New Proposal
              </Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-8 animate-fade-in">
            {view === "kanban" ? (
              <PipelineKanban
                columns={pipeline}
                proposals={kanbanProposals}
                onStatusChange={handleStatusChange}
              />
            ) : (
              <PipelineOverview columns={pipeline} />
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ActivityFeed items={activity} />
              </div>
              {stats && <StatsPanel stats={stats} />}
            </div>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="page-section-title">All Proposals</h2>
                <span className="text-sm text-brand-muted">{proposals.length} total</span>
              </div>
              <ProposalsTable proposals={proposals} onRefresh={load} />
            </section>
          </div>
        )}
      </main>
    </>
  );
}
