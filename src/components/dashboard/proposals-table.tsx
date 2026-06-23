"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PROPOSAL_STATUSES } from "@/lib/constants";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { DemoProposal } from "@/lib/types/proposal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDown, ArrowUp, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ProposalsTableProps {
  proposals: DemoProposal[];
  onRefresh?: () => void;
}

type SortKey = "companyName" | "monthlyPrice" | "sentAt" | "lastActivity" | "followUpCount";

function getStatusBadge(status: string) {
  const config = PROPOSAL_STATUSES.find((s) => s.value === status);
  return (
    <Badge className={config?.color ?? "bg-slate-100 text-slate-700"}>
      {config?.label ?? status}
    </Badge>
  );
}

export function ProposalsTable({ proposals, onRefresh }: ProposalsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("lastActivity");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let rows = [...proposals];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (p) =>
          p.companyName.toLowerCase().includes(q) ||
          p.contactName.toLowerCase().includes(q) ||
          p.proposalNumber.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      rows = rows.filter((p) => p.status === statusFilter);
    }
    rows.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (typeof av === "number" && typeof bv === "number") {
        return sortAsc ? av - bv : bv - av;
      }
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return rows;
  }, [proposals, search, statusFilter, sortKey, sortAsc]);

  async function handleStatus(id: string, status: "won" | "lost") {
    const res = await fetch(`/api/v1/proposals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(status === "won" ? "Marked as Won" : "Marked as Lost");
      onRefresh?.();
    }
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const SortIcon = sortAsc ? ArrowUp : ArrowDown;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search company, contact, proposal #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PROPOSAL_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-brand-muted">{filtered.length} proposals</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-brand-border/80 bg-white shadow-soft">
        <table className="data-table">
          <thead>
            <tr>
              <th className="px-4 py-3 font-medium text-brand-muted">
                <button type="button" className="flex items-center gap-1" onClick={() => toggleSort("companyName")}>
                  Company {sortKey === "companyName" && <SortIcon className="h-3 w-3" />}
                </button>
              </th>
              <th className="px-4 py-3 font-medium text-brand-muted">Proposal #</th>
              <th className="px-4 py-3 font-medium text-brand-muted">
                <button type="button" className="flex items-center gap-1" onClick={() => toggleSort("monthlyPrice")}>
                  Monthly {sortKey === "monthlyPrice" && <SortIcon className="h-3 w-3" />}
                </button>
              </th>
              <th className="px-4 py-3 font-medium text-brand-muted">Annual</th>
              <th className="px-4 py-3 font-medium text-brand-muted">Status</th>
              <th className="px-4 py-3 font-medium text-brand-muted">
                <button type="button" className="flex items-center gap-1" onClick={() => toggleSort("sentAt")}>
                  Sent {sortKey === "sentAt" && <SortIcon className="h-3 w-3" />}
                </button>
              </th>
              <th className="px-4 py-3 font-medium text-brand-muted">
                <button type="button" className="flex items-center gap-1" onClick={() => toggleSort("lastActivity")}>
                  Last Activity {sortKey === "lastActivity" && <SortIcon className="h-3 w-3" />}
                </button>
              </th>
              <th className="px-4 py-3 font-medium text-brand-muted">
                <button type="button" className="flex items-center gap-1" onClick={() => toggleSort("followUpCount")}>
                  F/U # {sortKey === "followUpCount" && <SortIcon className="h-3 w-3" />}
                </button>
              </th>
              <th className="px-4 py-3 font-medium text-brand-muted">Next Action</th>
              <th className="px-4 py-3 font-medium text-brand-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="group">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-brand-text">{p.companyName}</p>
                    <p className="text-xs text-brand-muted">{p.contactName}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-brand-muted">{p.proposalNumber}</td>
                <td className="px-4 py-3 font-medium">{formatCurrency(p.monthlyPrice)}</td>
                <td className="px-4 py-3 text-brand-muted">{formatCurrency(p.annualPrice)}</td>
                <td className="px-4 py-3">{getStatusBadge(p.status)}</td>
                <td className="px-4 py-3 text-brand-muted">
                  {p.sentAt ? formatRelativeTime(p.sentAt) : "—"}
                </td>
                <td className="px-4 py-3 text-brand-muted">
                  {p.lastActivity ? formatRelativeTime(p.lastActivity) : "—"}
                </td>
                <td className="px-4 py-3 text-center text-brand-muted">{p.followUpCount}</td>
                <td className="px-4 py-3 text-xs text-brand-muted">{p.nextAction ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/proposals/${p.id}`}>View</Link>
                    </Button>
                    {!["won", "lost", "expired"].includes(p.status) && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-600"
                          onClick={() => handleStatus(p.id, "won")}
                          title="Mark Won"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleStatus(p.id, "lost")}
                          title="Mark Lost"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
