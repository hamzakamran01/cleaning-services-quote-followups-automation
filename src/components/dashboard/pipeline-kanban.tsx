"use client";

import Link from "next/link";
import { useCallback } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { PIPELINE_COLUMN_COLORS } from "@/lib/design-tokens";
import { formatCurrency } from "@/lib/utils";
import type { PipelineColumn } from "@/lib/types/proposal";
import CompanyAvatar from "@/components/ui/clean/CompanyAvatar";
import StatusBadge from "@/components/ui/clean/StatusBadge";
import ProposalIdChip from "@/components/ui/clean/ProposalIdChip";
import { Eye, FileText, Flame, Send, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

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

const colIcons: Record<string, typeof Send> = {
  draft: FileText,
  sent: Send,
  opened: Eye,
  hot_lead: Flame,
  won: Trophy,
};

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

export function PipelineKanban({ columns, proposals, onStatusChange }: PipelineKanbanProps) {
  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination || !onStatusChange) return;
      const proposalId = result.draggableId;
      const newColumn = result.destination.droppableId;
      const proposal = proposals.find((p) => p.id === proposalId);
      if (!proposal || matchesColumn(newColumn, proposal.status)) return;

      const newStatus = columnToStatus(newColumn);
      try {
        await onStatusChange(proposalId, newStatus);
        toast.success(`Moved to ${columns.find((c) => c.status === newColumn)?.label ?? newStatus}`);
      } catch {
        toast.error("Failed to update status");
      }
    },
    [columns, onStatusChange, proposals]
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {columns
          .filter((col) => col.status !== "lost")
          .map((col) => {
            const cards = proposals.filter((p) => matchesColumn(col.status, p.status));
            const Icon = colIcons[col.status] ?? FileText;
            const accent = PIPELINE_COLUMN_COLORS[col.status] ?? "#94A3B8";
            const colValue = cards.reduce((s, p) => s + p.monthlyPrice, 0);

            return (
              <div
                key={col.status}
                className="flex w-[300px] min-w-[300px] shrink-0 flex-col"
              >
                {/* Column header */}
                <div
                  className="mb-3 flex items-center justify-between border-l-[3px] pl-3"
                  style={{ borderColor: accent }}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" style={{ color: accent }} />
                    <span className="text-sm font-medium text-[#1A1D23]">{col.label}</span>
                    <span className="text-[13px] font-medium text-[#64748B]">
                      {cards.length > 0 ? `${formatCurrency(colValue)}/mo` : ""}
                    </span>
                  </div>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-[#CBD5E1] bg-white px-1.5 text-xs font-medium text-[#64748B]">
                    {col.count}
                  </span>
                </div>

                <Droppable droppableId={col.status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex min-h-[200px] flex-1 flex-col gap-3 rounded-lg p-1 transition-colors",
                        snapshot.isDraggingOver && "bg-[#00C5A1]/5"
                      )}
                    >
                      {cards.map((p, index) => (
                        <Draggable
                          key={p.id}
                          draggableId={p.id}
                          index={index}
                          isDragDisabled={!onStatusChange}
                        >
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={cn(
                                "rounded-lg border border-black/[0.08] bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-elevated",
                                p.status === "hot_lead" && "animate-hot-glow",
                                dragSnapshot.isDragging && "shadow-lg"
                              )}
                            >
                              <Link href={`/proposals/${p.id}`} className="block">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <CompanyAvatar companyName={p.companyName} size={32} />
                                    <p className="truncate text-sm font-semibold text-[#1A1D23]">
                                      {p.companyName}
                                    </p>
                                  </div>
                                  <StatusBadge status={p.status} />
                                </div>

                                <p className="mt-2 truncate text-[13px] text-[#64748B]">
                                  {p.contactName}
                                </p>

                                <div className="mt-3 flex items-center justify-between">
                                  <ProposalIdChip id={p.proposalNumber} />
                                  <span
                                    className="text-sm font-bold text-[#1A1D23]"
                                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                                  >
                                    {formatCurrency(p.monthlyPrice)}
                                  </span>
                                </div>

                                {p.followUpCount !== undefined && p.followUpCount > 0 && (
                                  <div className="mt-2 flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                                    <span className="text-[11px] font-medium text-[#D97706]">
                                      {p.followUpCount} F/U
                                    </span>
                                  </div>
                                )}
                              </Link>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {cards.length === 0 && (
                        <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-[#E2E8F0] py-10">
                          <p className="text-sm text-[#94A3B8]">Drop proposals here</p>
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
      </div>
    </DragDropContext>
  );
}
