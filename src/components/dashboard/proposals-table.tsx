"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { STATUS_CONFIG, resolveStatusKey, type StatusKey } from "@/lib/design-tokens";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { DemoProposal } from "@/lib/types/proposal";
import CompanyAvatar from "@/components/ui/clean/CompanyAvatar";
import StatusBadge from "@/components/ui/clean/StatusBadge";
import ProposalIdChip from "@/components/ui/clean/ProposalIdChip";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  MoreHorizontal,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ProposalsTableProps {
  proposals: DemoProposal[];
  onRefresh?: () => void;
}

const PAGE_SIZE = 10;

const FILTER_STATUSES: { value: string; label: StatusKey }[] = [
  { value: "all", label: "Draft" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "opened", label: "Opened" },
  { value: "hot_lead", label: "Hot Lead" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

function StatusFilterDot({ statusKey }: { statusKey: StatusKey }) {
  const config = STATUS_CONFIG[statusKey];
  return (
    <span
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: config.dot }}
    />
  );
}

export function ProposalsTable({ proposals, onRefresh }: ProposalsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [statusOpen, setStatusOpen] = useState(false);

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
      if (statusFilter === "sent") {
        rows = rows.filter((p) => p.status === "sent" || p.status === "not_opened");
      } else if (statusFilter === "opened") {
        rows = rows.filter((p) => p.status === "opened" || p.status === "viewed_pricing");
      } else {
        rows = rows.filter((p) => p.status === statusFilter);
      }
    }
    return rows;
  }, [proposals, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const filterLabel =
    statusFilter === "all"
      ? "All statuses"
      : FILTER_STATUSES.find((s) => s.value === statusFilter)?.label ?? statusFilter;

  return (
    <div className="space-y-4">
      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-[340px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="search"
            placeholder="Search company, contact, proposal #..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-9 w-full rounded-md border border-[#E2E8F0] bg-white pl-9 pr-3 text-[13px] text-[#1A1D23] placeholder:text-[#94A3B8] focus:border-[#00C5A1] focus:outline-none focus:ring-[3px] focus:ring-[rgba(0,197,161,0.15)]"
          />
        </div>

        <DropdownMenu open={statusOpen} onOpenChange={setStatusOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-9 w-[160px] items-center justify-between rounded-md border border-[#E2E8F0] bg-white px-3 text-[13px] text-[#334155] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
            >
              <span className="flex items-center gap-2 truncate">
                {statusFilter !== "all" && (
                  <StatusFilterDot statusKey={resolveStatusKey(statusFilter)} />
                )}
                {filterLabel}
              </span>
              <ChevronRight className="h-4 w-4 rotate-90 text-[#94A3B8]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[160px]">
            <DropdownMenuItem
              onClick={() => {
                setStatusFilter("all");
                setPage(1);
              }}
            >
              All statuses
            </DropdownMenuItem>
            {(["draft", "sent", "opened", "hot_lead", "won", "lost"] as const).map((val) => (
              <DropdownMenuItem
                key={val}
                onClick={() => {
                  setStatusFilter(val);
                  setPage(1);
                }}
                className="flex items-center gap-2"
              >
                <StatusFilterDot statusKey={resolveStatusKey(val)} />
                {resolveStatusKey(val)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-black/[0.07] bg-white">
        <table className="w-full min-w-[960px]">
          <thead>
            <tr className="border-b border-black/[0.06] bg-[#F8F7F4]">
              {[
                "Company",
                "Proposal #",
                "Monthly/Annual",
                "Status",
                "Sent",
                "Last Activity",
                "F/U",
                "Next Action",
                "Actions",
              ].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.04 } },
            }}
          >
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-[#64748B]">
                  No proposals match your filters.
                </td>
              </tr>
            ) : (
              paginated.map((p) => (
                <motion.tr
                  key={p.id}
                  variants={{
                    hidden: { opacity: 0, x: -8 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  className="group border-b border-[#F1F5F9] transition-colors duration-100 last:border-0 hover:bg-[#F8F7F4]"
                  style={{ height: 72 }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <CompanyAvatar companyName={p.companyName} size={32} />
                      <div>
                        <p className="text-sm font-semibold text-[#1A1D23]">{p.companyName}</p>
                        <p className="text-xs text-[#64748B]">{p.contactName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ProposalIdChip id={p.proposalNumber} className="text-xs" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-[#1A1D23]">
                      {formatCurrency(p.monthlyPrice)}
                      <span className="text-xs font-normal text-[#64748B]">/mo</span>
                    </p>
                    <p className="text-xs text-[#94A3B8]">{formatCurrency(p.annualPrice)}/yr</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#64748B]">
                    {p.sentAt ? formatRelativeTime(p.sentAt) : "—"}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#64748B]">
                    {p.lastActivity ? formatRelativeTime(p.lastActivity) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {(p.followUpCount ?? 0) > 0 ? (
                      <span className="inline-flex rounded-full bg-[#FFFBEB] px-2 py-0.5 text-xs font-medium text-[#D97706]">
                        {p.followUpCount}×
                      </span>
                    ) : (
                      <span className="text-[13px] text-[#94A3B8]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.nextAction ? (
                      <span className="inline-flex rounded-md bg-[#F1F5F9] px-2.5 py-1 text-xs font-medium text-[#334155]">
                        {p.nextAction}
                      </span>
                    ) : (
                      <span className="text-[13px] text-[#94A3B8]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <Link
                        href={`/proposals/${p.id}`}
                        className="rounded-md p-2 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1A1D23]"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/proposals/${p.id}`}
                        className="rounded-md p-2 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1A1D23]"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        className="rounded-md p-2 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1A1D23]"
                        title="More"
                        onClick={() => onRefresh?.()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </motion.tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-[#64748B]">
          Showing {rangeStart}–{rangeEnd} of {filtered.length}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-[#E2E8F0] px-2.5 text-[13px] text-[#64748B] disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((n) => n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1)
            .map((n, idx, arr) => (
              <span key={n} className="flex items-center">
                {idx > 0 && arr[idx - 1] !== n - 1 && (
                  <span className="px-1 text-[#94A3B8]">…</span>
                )}
                <button
                  type="button"
                  onClick={() => setPage(n)}
                  className={cn(
                    "flex h-8 min-w-8 items-center justify-center rounded-md text-[13px] font-medium",
                    n === currentPage
                      ? "bg-[#1A1D23] text-white"
                      : "border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8F7F4]"
                  )}
                >
                  {n}
                </button>
              </span>
            ))}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-[#E2E8F0] px-2.5 text-[13px] text-[#64748B] disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
