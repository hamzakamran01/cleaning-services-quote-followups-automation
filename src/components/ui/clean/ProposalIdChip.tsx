"use client";

import { cn } from "@/lib/utils";

export interface ProposalIdChipProps {
  id: string;
  className?: string;
}

export default function ProposalIdChip({ id, className }: ProposalIdChipProps) {
  return (
    <span
      className={cn(
        "inline-block rounded border border-[#E2E8F0] bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[11px] text-[#94A3B8]",
        className
      )}
    >
      {id}
    </span>
  );
}
