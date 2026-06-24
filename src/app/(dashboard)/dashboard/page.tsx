"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { PipelineOverview } from "@/components/dashboard/pipeline-overview";
import { PipelineKanban } from "@/components/dashboard/pipeline-kanban";
import { StatsPanel } from "@/components/dashboard/stats-panel";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import StatCard from "@/components/ui/clean/StatCard";
import LoadingSkeleton from "@/components/ui/clean/LoadingSkeleton";
import { LayoutGrid, List, Plus, RefreshCw, Send, Eye, Target, DollarSign } from "lucide-react";
import type { DashboardStats, PipelineColumn, ActivityItem } from "@/lib/types/proposal";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [pipeline, setPipeline] = useState<PipelineColumn[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
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
      setKanbanProposals(
        (analytics.proposals ?? proposalsData.proposals ?? []).map((p: {
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
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStatusChange = useCallback(
    async (proposalId: string, newStatus: string) => {
      const res = await fetch(`/api/v1/proposals/${proposalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await load();
    },
    [load]
  );

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Header title="Dashboard" />

      <main className="flex-1 p-6">
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <LoadingSkeleton key={i} variant="card" />
              ))}
            </div>
            <LoadingSkeleton variant="card" className="h-64" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Section 1 — Stats Row */}
            {stats && (
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Proposals Sent"
                  value={stats.proposalsSent}
                  icon={Send}
                  iconColor="#3B82F6"
                  trend={{ label: "+3 this week", direction: "up" }}
                />
                <StatCard
                  label="Open Rate"
                  value={stats.openRate}
                  icon={Eye}
                  iconColor="#7C3AED"
                  isPercentage
                  trend={{ label: "Above average", direction: "up" }}
                />
                <StatCard
                  label="Conversion"
                  value={stats.conversionRate}
                  icon={Target}
                  iconColor="#00C5A1"
                  isPercentage
                  trend={{ label: "+2% vs last mo.", direction: "up" }}
                />
                <StatCard
                  label="Revenue Won"
                  value={stats.revenueWon}
                  icon={DollarSign}
                  iconColor="#F59E0B"
                  prefix="$"
                  trend={{ label: "On track", direction: "up" }}
                />
              </section>
            )}

            {/* Section 2 — Pipeline Kanban */}
            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2
                  className="text-base font-bold text-[#1A1D23]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Pipeline View
                </h2>

                <div className="flex items-center gap-1 rounded-md border border-black/[0.07] bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setView("kanban")}
                    className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                      view === "kanban"
                        ? "bg-[#1A1D23] text-white"
                        : "text-[#64748B] hover:text-[#1A1D23]"
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" /> Kanban
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                      view === "list"
                        ? "bg-[#1A1D23] text-white"
                        : "text-[#64748B] hover:text-[#1A1D23]"
                    }`}
                  >
                    <List className="h-4 w-4" /> Summary
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={load}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm font-medium text-[#334155] transition-colors hover:bg-[#F8F7F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/proposals/new"
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#00C5A1] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#009980]"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      <Plus className="h-4 w-4" /> New Proposal
                    </Link>
                  </motion.div>
                </div>
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
            </section>

            {/* Section 3 — Bottom Two-Column Row */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {stats && <StatsPanel stats={stats} />}
              <ActivityFeed items={activity} />
            </section>
          </div>
        )}
      </main>
    </>
  );
}
