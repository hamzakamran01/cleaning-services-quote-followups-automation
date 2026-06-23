"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { PROPOSAL_STATUSES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { PipelineColumn } from "@/lib/types/proposal";
import { Badge } from "@/components/ui/badge";
import { Flame, GripVertical } from "lucide-react";

interface KanbanProposal {
  id: string;
  proposalNumber: string;
  companyName: string;
  contactName: string;
  monthlyPrice: number;
  status: string;
  followUpCount?: number;
}

interface PipelineKanbanProps {
  columns: PipelineColumn[];
  proposals: KanbanProposal[];
  onStatusChange?: (proposalId: string, newStatus: string) => Promise<void>;
}

const columnAccent: Record<string, string> = {
  draft: "border-t-slate-400",
  sent: "border-t-blue-500",
  opened: "border-t-indigo-500",
  hot_lead: "border-t-amber-500",
  won: "border-t-emerald-500",
  lost: "border-t-red-400",
};

function statusBadge(status: string) {
  const config = PROPOSAL_STATUSES.find((s) => s.value === status);
  return (
    <Badge className={`text-[10px] ${config?.color ?? "bg-slate-100 text-slate-700"}`}>
      {config?.label ?? status}
    </Badge>
  );
}

function matchesColumn(columnStatus: string, proposalStatus: string) {
  if (columnStatus === "sent") return proposalStatus === "sent" || proposalStatus === "not_opened";
  if (columnStatus === "opened")
    return proposalStatus === "opened" || proposalStatus === "viewed_pricing";
  if (columnStatus === "lost") return proposalStatus === "lost" || proposalStatus === "expired";
  return proposalStatus === columnStatus;
}

function columnToStatus(columnStatus: string): string {
  if (columnStatus === "sent") return "sent";
  if (columnStatus === "opened") return "opened";
  if (columnStatus === "lost") return "lost";
  return columnStatus;
}

export function PipelineKanban({ columns, proposals, onStatusChange }: PipelineKanbanProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const handleDrop = useCallback(
    async (columnStatus: string, proposalId: string) => {
      const proposal = proposals.find((p) => p.id === proposalId);
      if (!proposal || !onStatusChange) return;

      const newStatus = columnToStatus(columnStatus);
      if (matchesColumn(columnStatus, proposal.status)) return;

      try {
        await onStatusChange(proposalId, newStatus);
        toast.success(`Moved to ${columns.find((c) => c.status === columnStatus)?.label ?? newStatus}`);
      } catch {
        toast.error("Failed to update status");
      }
    },
    [columns, onStatusChange, proposals]
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
      {columns.map((col) => {
        const cards = proposals.filter((p) => matchesColumn(col.status, p.status));
        const isDropTarget = dropTarget === col.status;

        return (
          <div
            key={col.status}
            className={`kanban-column border-t-4 ${columnAccent[col.status] ?? "border-t-slate-300"} ${
              isDropTarget ? "ring-2 ring-brand-primary/30" : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDropTarget(col.status);
            }}
            onDragLeave={() => setDropTarget(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDropTarget(null);
              const id = e.dataTransfer.getData("proposalId");
              if (id) handleDrop(col.status, id);
            }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-brand-text">{col.label}</span>
                {col.status === "hot_lead" && (
                  <Flame className="h-4 w-4 animate-pulse-soft text-brand-warning" />
                )}
              </div>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-brand-muted shadow-sm">
                {col.count}
              </span>
            </div>
            <p className="px-4 pb-2 text-xs font-medium text-brand-muted">
              {formatCurrency(col.value)}/mo pipeline
            </p>
            <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-3 scrollbar-thin max-h-[480px]">
              {cards.length === 0 ? (
                <div className="mx-1 rounded-xl border border-dashed border-brand-border/60 px-3 py-8 text-center">
                  <p className="text-xs text-brand-muted">Drop proposals here</p>
                </div>
              ) : (
                cards.slice(0, 12).map((p) => (
                  <Link
                    key={p.id}
                    href={`/proposals/${p.id}`}
                    draggable={!!onStatusChange}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("proposalId", p.id);
                      setDraggingId(p.id);
                    }}
                    onDragEnd={() => setDraggingId(null)}
                    className={`kanban-card group ${
                      draggingId === p.id ? "kanban-card-dragging" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {onStatusChange && (
                        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-brand-text">
                          {p.companyName}
                        </p>
                        <p className="truncate text-xs text-brand-muted">{p.contactName}</p>
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-brand-primary">
                            {formatCurrency(p.monthlyPrice)}
                          </span>
                          {statusBadge(p.status)}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-brand-muted">
                          <span>{p.proposalNumber}</span>
                          {(p.followUpCount ?? 0) > 0 && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5">
                              {p.followUpCount} follow-ups
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
