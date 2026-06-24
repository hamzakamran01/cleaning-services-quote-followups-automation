import { formatCurrency } from "@/lib/utils";
import type { PipelineColumn } from "@/lib/types/proposal";
import {
  DollarSign,
  Flame,
  FileText,
  Send,
  Eye,
  Trophy,
} from "lucide-react";

interface PipelineOverviewProps {
  columns: PipelineColumn[];
}

const colMeta: Record<
  string,
  {
    icon: typeof Send;
    accentBar: string;
    iconBg: string;
    iconColor: string;
    valueBg: string;
    valueText: string;
    label: string;
  }
> = {
  draft: {
    icon: FileText,
    accentBar: "bg-slate-400",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    valueBg: "bg-slate-50",
    valueText: "text-slate-700",
    label: "Draft",
  },
  sent: {
    icon: Send,
    accentBar: "bg-blue-500",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    valueBg: "bg-blue-50",
    valueText: "text-blue-700",
    label: "Sent",
  },
  opened: {
    icon: Eye,
    accentBar: "bg-indigo-500",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    valueBg: "bg-indigo-50",
    valueText: "text-indigo-700",
    label: "Opened",
  },
  hot_lead: {
    icon: Flame,
    accentBar: "bg-amber-500",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    valueBg: "bg-amber-50",
    valueText: "text-amber-700",
    label: "Hot Lead",
  },
  won: {
    icon: Trophy,
    accentBar: "bg-emerald-500",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    valueBg: "bg-emerald-50",
    valueText: "text-emerald-700",
    label: "Won",
  },
  lost: {
    icon: DollarSign,
    accentBar: "bg-red-400",
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    valueBg: "bg-red-50",
    valueText: "text-red-600",
    label: "Lost",
  },
};

export function PipelineOverview({ columns }: PipelineOverviewProps) {
  const totalValue = columns.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {columns.map((col) => {
        const meta = colMeta[col.status] ?? colMeta.draft;
        const Icon = meta.icon;
        const pct = totalValue > 0 ? Math.round((col.value / totalValue) * 100) : 0;

        return (
          <div key={col.status} className="metric-card group">
            {/* Accent bar */}
            <div className={`metric-card-accent-bar ${meta.accentBar}`} />

            {/* Icon + count */}
            <div className="flex items-start justify-between">
              <div className={`metric-card-icon-wrap ${meta.iconBg}`}>
                <Icon className={`h-5 w-5 ${meta.iconColor}`} />
              </div>
              <span
                className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold ${meta.valueBg} ${meta.valueText}`}
              >
                {col.count}
              </span>
            </div>

            {/* Label + value */}
            <div className="mt-4">
              <p className="metric-label">{meta.label}</p>
              <p className="metric-value mt-1 text-2xl">
                {formatCurrency(col.value)}
              </p>
              <p className="metric-subtext mt-0.5 text-xs">pipeline / mo</p>
            </div>

            {/* Progress bar showing share of total */}
            <div className="mt-4">
              <div className="pipeline-bar-track">
                <div
                  className={`pipeline-bar-fill ${meta.accentBar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-right text-[10px] font-medium text-brand-muted">
                {pct}% of pipeline
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
