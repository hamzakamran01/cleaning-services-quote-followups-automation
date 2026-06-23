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
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  ExternalLink,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ProposalsTableProps {
  proposals: DemoProposal[];
  onRefresh?: () => void;
}

type SortKey = "companyName" | "monthlyPrice" | "sentAt" | "lastActivity" | "followUpCount";

const avatarColors = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-indigo-500",
  "bg-teal-500", "bg-orange-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function getStatusBadge(status: string) {
  const config = PROPOSAL_STATUSES.find((s) => s.value === status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config?.color ?? "bg-slate-100 text-slate-700"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {config?.label ?? status}
    </span>
  );
}

function getFollowUpPill(count: number) {
  if (count === 0) return <span className="urgency-none">—</span>;
  if (count <= 2) return <span className="urgency-low">{count}×</span>;
  return <span className="urgency-high">{count}×</span>;
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
      toast.success(status === "won" ? "🏆 Marked as Won" : "Marked as Lost");
      onRefresh?.();
    }
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  }

  const SortIcon = sortAsc ? ArrowUp : ArrowDown;

  function SortBtn({ label, k }: { label: string; k: SortKey }) {
    return (
      <button
        type="button"
        className={`flex items-center gap-1 transition-colors hover:text-brand-primary ${sortKey === k ? "font-bold text-brand-primary" : ""
          }`}
        onClick={() => toggleSort(k)}
      >
        {label}
        {sortKey === k && <SortIcon className="h-3 w-3" />}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter / search bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <Input
            placeholder="Search company, contact, proposal #…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
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
        <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
          <span className="text-xs font-semibold text-brand-muted">{filtered.length}</span>
          <span className="text-xs text-brand-muted">proposals</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-brand-border/80 bg-white" style={{ boxShadow: "var(--shadow-sm)" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th><SortBtn label="Company" k="companyName" /></th>
              <th>Proposal #</th>
              <th><SortBtn label="Monthly / Annual" k="monthlyPrice" /></th>
              <th>Status</th>
              <th><SortBtn label="Sent" k="sentAt" /></th>
              <th><SortBtn label="Last Activity" k="lastActivity" /></th>
              <th><SortBtn label="F/U" k="followUpCount" /></th>
              <th>Next Action</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const initials = getInitials(p.companyName);
              const avatarColor = getAvatarColor(p.companyName);
              return (
                <tr key={p.id} className="group">
                  {/* Company + avatar */}
                  <td>
                    <div className="flex items-center gap-3">
                      <div className={`avatar-chip ${avatarColor}`}>{initials}</div>
                      <div>
                        <p className="font-semibold text-brand-text">{p.companyName}</p>
                        <p className="text-xs text-brand-muted">{p.contactName}</p>
                      </div>
                    </div>
                  </td>

                  {/* Proposal # */}
                  <td>
                    <span className="rounded-md bg-slate-50 px-2 py-1 font-mono text-xs text-brand-muted">
                      {p.proposalNumber}
                    </span>
                  </td>

                  {/* Monthly / Annual */}
                  <td>
                    <p className="font-bold text-brand-text">{formatCurrency(p.monthlyPrice)}<span className="ml-0.5 text-xs font-normal text-brand-muted">/mo</span></p>
                    <p className="text-xs text-brand-muted">{formatCurrency(p.annualPrice)}/yr</p>
                  </td>

                  {/* Status */}
                  <td>{getStatusBadge(p.status)}</td>

                  {/* Sent at */}
                  <td className="text-brand-muted">{p.sentAt ? formatRelativeTime(p.sentAt) : "—"}</td>

                  {/* Last activity */}
                  <td className="text-brand-muted">{p.lastActivity ? formatRelativeTime(p.lastActivity) : "—"}</td>

                  {/* Follow-ups urgency */}
                  <td>{getFollowUpPill(p.followUpCount ?? 0)}</td>

                  {/* Next action */}
                  <td>
                    {p.nextAction ? (
                      <span className="inline-flex rounded-full bg-brand-primary/[0.07] px-2.5 py-1 text-xs font-medium text-brand-primary">
                        {p.nextAction}
                      </span>
                    ) : (
                      <span className="text-xs text-brand-muted">—</span>
                    )}
                  </td>

                  {/* Actions — revealed on row hover */}
                  <td>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="sm" asChild title="View proposal">
                        <Link href={`/proposals/${p.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      {!["won", "lost", "expired"].includes(p.status) && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-emerald-600 hover:bg-emerald-50"
                            onClick={() => handleStatus(p.id, "won")}
                            title="Mark Won"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:bg-red-50"
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
