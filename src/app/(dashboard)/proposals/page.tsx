"use client";

import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { ProposalsTable } from "@/components/dashboard/proposals-table";
import LoadingSkeleton from "@/components/ui/clean/LoadingSkeleton";
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
      <Header title="All Proposals" showNewProposal />
      <main className="flex-1 p-6">
        {/* Page header */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2
            className="text-[22px] font-bold text-[#1A1D23]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            All Proposals
          </h2>
          {!loading && (
            <span className="rounded-full bg-[#F1F5F9] px-3 py-1 text-[13px] font-medium text-[#64748B]">
              {proposals.length} proposals
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            <LoadingSkeleton className="h-9 w-[340px]" />
            <LoadingSkeleton variant="row" />
            <LoadingSkeleton variant="row" />
            <LoadingSkeleton variant="row" />
          </div>
        ) : (
          <ProposalsTable proposals={proposals} onRefresh={load} />
        )}
      </main>
    </>
  );
}
