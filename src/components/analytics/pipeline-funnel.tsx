"use client";

import { STATUS_CONFIG } from "@/lib/design-tokens";
import type { PipelineColumn } from "@/lib/types/proposal";

interface PipelineFunnelProps {
  columns: PipelineColumn[];
}

const FUNNEL_STAGES = [
  { key: "sent", label: "Sent", color: STATUS_CONFIG.Sent.text },
  { key: "opened", label: "Opened", color: STATUS_CONFIG.Opened.text },
  { key: "hot_lead", label: "Hot Lead", color: STATUS_CONFIG["Hot Lead"].text },
  { key: "won", label: "Won", color: STATUS_CONFIG.Won.text },
];

export function PipelineFunnel({ columns }: PipelineFunnelProps) {
  const counts = FUNNEL_STAGES.map((stage) => ({
    ...stage,
    count: columns.find((c) => c.status === stage.key)?.count ?? 0,
  }));

  const maxCount = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div
      className="rounded-lg bg-white p-6"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <h3
        className="mb-6 text-base font-bold text-[#1A1D23]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Pipeline Funnel
      </h3>
      <div className="space-y-4">
        {counts.map((stage, i) => {
          const widthPct = (stage.count / maxCount) * 100;
          const prevCount = i > 0 ? counts[i - 1].count : null;
          const conversion =
            prevCount && prevCount > 0
              ? Math.round((stage.count / prevCount) * 100)
              : null;

          return (
            <div key={stage.key}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-[#334155]">{stage.label}</span>
                <div className="flex items-center gap-2">
                  {conversion !== null && (
                    <span className="text-xs text-[#64748B]">{conversion}% conv.</span>
                  )}
                  <span className="font-bold text-[#1A1D23]">{stage.count}</span>
                </div>
              </div>
              <div className="h-8 overflow-hidden rounded-md bg-[#F1F5F9]">
                <div
                  className="flex h-full items-center rounded-md px-3 text-xs font-semibold text-white transition-all duration-700"
                  style={{
                    width: `${Math.max(widthPct, stage.count > 0 ? 8 : 0)}%`,
                    backgroundColor: stage.color,
                  }}
                >
                  {stage.count > 0 && stage.count}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
