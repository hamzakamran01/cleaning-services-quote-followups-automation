"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { ProposalsTable } from "@/components/dashboard/proposals-table";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { FileText, Plus } from "lucide-react";
import type { DemoProposal } from "@/lib/types/proposal";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<DemoProposal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/v1/proposals")
      .then((r) => r.json())
      .then((d) => {
        setProposals(d.proposals ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Header title="Proposals" subtitle="Manage and track all proposals" showNewProposal={false} />
      <main className="flex-1 space-y-6 p-4 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10">
              <FileText className="h-5 w-5 text-brand-primary" />
            </div>
            <div>
              <p className="font-semibold text-brand-text">{proposals.length} proposals</p>
              <p className="text-sm text-brand-muted">Search, filter, and manage your pipeline</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/proposals/new">
              <Plus className="h-4 w-4" /> New Proposal
            </Link>
          </Button>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="animate-fade-in">
            <ProposalsTable proposals={proposals} onRefresh={load} />
          </div>
        )}
      </main>
    </>
  );
}
