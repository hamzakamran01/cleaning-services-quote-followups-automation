"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { PROPOSAL_STATUSES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { PipelineColumn } from "@/lib/types/proposal";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Flame, GripVertical, Send, Trophy, DollarSign } from "lucide-react";

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

const colConfig: Record<
  string,
  { accentClass: string; headerBg: string; iconBg: string; iconColor: string; icon: typeof Send }
> = {
  draft: { accentClass: "border-t-slate-400", headerBg: "from-slate-50", iconBg: "bg-slate-200", iconColor: "text-slate-600", icon: FileText },
  sent: { accentClass: "border-t-blue-500", headerBg: "from-blue-50", iconBg: "bg-blue-200", iconColor: "text-blue-700", icon: Send },
  opened: { accentClass: "border-t-indigo-500", headerBg: "from-indigo-50", iconBg: "bg-indigo-200", iconColor: "text-indigo-700", icon: Eye },
  hot_lead: { accentClass: "border-t-amber-500", headerBg: "from-amber-50", iconBg: "bg-amber-200", iconColor: "text-amber-700", icon: Flame },
  won: { accentClass: "border-t-emerald-500", headerBg: "from-emerald-50", iconBg: "bg-emerald-200", iconColor: "text-emerald-700", icon: Trophy },
  lost: { accentClass: "border-t-red-400", headerBg: "from-red-50", iconBg: "bg-red-200", iconColor: "text-red-700", icon: DollarSign },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

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

function matchesColumn(columnStatus: string, proposalStatus: string) {
  if (columnStatus === "sent") return proposalStatus === "sent" || proposalStatus === "not_opened";
  if (columnStatus === "opened") return proposalStatus === "opened" || proposalStatus === "viewed_pricing";
  if (columnStatus === "lost") return proposalStatus === "lost" || proposalStatus === "expired";
  return proposalStatus === columnStatus;
}

function columnToStatus(columnStatus: string): string {
  if (columnStatus === "sent") return "sent";
  if (columnStatus === "opened") return "opened";
  if (columnStatus === "lost") return "lost";
  return columnStatus;
}

function statusBadge(status: string) {
  const config = PROPOSAL_STATUSES.find((s) => s.value === status);
  return (
    <Badge className={`text-[10px] ${config?.color ?? "bg-slate-100 text-slate-700"}`}>
      {config?.label ?? status}
    </Badge>
  );
}

function followUpUrgency(count: number) {
  if (count === 0) return null;
  const cls = count >= 3 ? "urgency-high" : "urgency-low";
  return (
    <span className={cls}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {count} F/U
    </span>
  );
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
    <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scroll-smooth snap-x snap-mandatory px-1 pt-1 -mx-1">
      {columns.map((col) => {
        const cards = proposals.filter((p) => matchesColumn(col.status, p.status));
        const cfg = colConfig[col.status] ?? colConfig.draft;
        const Icon = cfg.icon;
        const isDropTarget = dropTarget === col.status;
        const colValue = cards.reduce((s, p) => s + p.monthlyPrice, 0);

        return (
          <div
            key={col.status}
            className={`kanban-column snap-start border-t-4 ${cfg.accentClass} ${isDropTarget ? "kanban-drop-active" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDropTarget(col.status); }}
            onDragLeave={() => setDropTarget(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDropTarget(null);
              const id = e.dataTransfer.getData("proposalId");
              if (id) handleDrop(col.status, id);
            }}
          >
            {/* Column header */}
            <div className={`bg-gradient-to-b ${cfg.headerBg} to-transparent px-5 py-4 border-b border-brand-border/40`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${cfg.iconBg}`}>
                    <Icon className={`h-4 w-4 ${cfg.iconColor}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tracking-tight text-brand-text">{col.label}</span>
                      {col.status === "hot_lead" && (
                        <Flame className="h-4 w-4 animate-pulse text-amber-500" />
                      )}
                    </div>
                    {cards.length > 0 && (
                      <p className="mt-0.5 text-xs font-semibold text-brand-muted">
                        {formatCurrency(colValue)}/mo
                      </p>
                    )}
                  </div>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-primary shadow-sm border border-brand-border/40">
                  {col.count}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/20 p-3 scrollbar-thin max-h-[380px]">
              {cards.length === 0 ? (
                <div
                  className={`mx-1 rounded-xl border-2 border-dashed px-3 py-10 text-center transition-colors ${isDropTarget ? "border-brand-primary/40 bg-brand-primary/[0.03]" : "border-brand-border/50"
                    }`}
                >
                  <p className="text-sm font-medium text-brand-muted">Drop proposals here</p>
                </div>
              ) : (
                cards.map((p) => {
                  const initials = getInitials(p.companyName);
                  const avatarColor = getAvatarColor(p.companyName);
                  return (
                    <Link
                      key={p.id}
                      href={`/proposals/${p.id}`}
                      draggable={!!onStatusChange}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("proposalId", p.id);
                        setDraggingId(p.id);
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      className={`kanban-card group flex items-start gap-3 ${draggingId === p.id ? "kanban-card-dragging" : ""}`}
                    >
                      {/* Drag Handle */}
                      {onStatusChange && (
                        <div className="-ml-1 flex h-full cursor-grab flex-col items-center justify-center text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
                          <GripVertical className="h-5 w-5" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`avatar-chip ${avatarColor} h-6 w-6 text-[10px]`}>{initials}</div>
                            <p className="truncate text-sm font-bold text-brand-text">
                              {p.companyName}
                            </p>
                          </div>
                          {statusBadge(p.status)}
                        </div>

                        <p className="mt-2 truncate text-sm text-brand-muted">{p.contactName}</p>

                        <div className="mt-3 flex items-center justify-between border-t border-brand-border/50 pt-3">
                          <span className="text-[10px] font-mono font-medium text-slate-500 rounded bg-slate-100 px-1.5 py-0.5">
                            {p.proposalNumber}
                          </span>
                          <span className="text-sm font-black tracking-tight text-brand-primary">
                            {formatCurrency(p.monthlyPrice)}
                            <span className="text-xs font-normal text-brand-muted">/mo</span>
                          </span>
                        </div>

                        {p.followUpCount !== undefined && p.followUpCount > 0 && (
                          <div className="mt-2 text-right">
                            {followUpUrgency(p.followUpCount)}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
