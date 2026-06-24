"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { STATUS_CONFIG, resolveStatusKey } from "@/lib/design-tokens";

interface StatusPieChartProps {
  statusCounts: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  Draft: STATUS_CONFIG.Draft.text,
  Sent: STATUS_CONFIG.Sent.text,
  Opened: STATUS_CONFIG.Opened.text,
  "Hot Lead": STATUS_CONFIG["Hot Lead"].text,
  Won: STATUS_CONFIG.Won.text,
  Lost: STATUS_CONFIG.Lost.text,
};

export function StatusPieChart({ statusCounts }: StatusPieChartProps) {
  const data = statusCounts
    .filter((s) => s.count > 0)
    .map((s) => ({
      name: resolveStatusKey(s.status),
      value: s.count,
      color: STATUS_COLORS[resolveStatusKey(s.status)] ?? "#64748B",
    }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      className="rounded-lg bg-white p-6"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <h3
        className="mb-4 text-base font-bold text-[#1A1D23]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Proposals by Status
      </h3>
      <div className="relative h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "none",
                borderRadius: 8,
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-extrabold text-[#1A1D23]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {total}
          </span>
          <span className="text-xs text-[#64748B]">Total</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
            {d.name} ({d.value})
          </div>
        ))}
      </div>
    </div>
  );
}
