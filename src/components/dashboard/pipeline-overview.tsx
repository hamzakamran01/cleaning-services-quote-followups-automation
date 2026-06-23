import { formatCurrency } from "@/lib/utils";
import type { PipelineColumn } from "@/lib/types/proposal";
import { StatCard } from "@/components/ui/stat-card";
import { DollarSign, Flame, Send, Trophy } from "lucide-react";

interface PipelineOverviewProps {
  columns: PipelineColumn[];
}

const columnMeta: Record<
  string,
  { accent: "primary" | "accent" | "warning" | "danger" | "neutral"; icon: typeof Send }
> = {
  draft: { accent: "neutral", icon: Send },
  sent: { accent: "primary", icon: Send },
  opened: { accent: "primary", icon: Send },
  hot_lead: { accent: "warning", icon: Flame },
  won: { accent: "accent", icon: Trophy },
  lost: { accent: "danger", icon: DollarSign },
};

export function PipelineOverview({ columns }: PipelineOverviewProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {columns.map((col) => {
        const meta = columnMeta[col.status] ?? { accent: "neutral" as const, icon: Send };
        return (
          <StatCard
            key={col.status}
            label={col.label}
            value={col.count}
            subtext={`${formatCurrency(col.value)}/mo pipeline`}
            icon={meta.icon}
            accent={meta.accent}
          />
        );
      })}
    </div>
  );
}
