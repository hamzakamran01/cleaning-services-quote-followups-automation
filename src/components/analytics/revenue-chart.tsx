"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { MonthlyAnalytics } from "@/lib/types/proposal";

interface RevenueChartProps {
  data: MonthlyAnalytics[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((d) => ({
    month: d.month.split(" ")[0],
    revenue: d.revenueWon,
  }));

  return (
    <div
      className="rounded-lg bg-white p-6"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <h3
        className="mb-6 text-base font-bold text-[#1A1D23]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Revenue Won Over Time
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              fontSize: 13,
              fontWeight: 500,
            }}
            formatter={(value: number) => [formatCurrency(value), "Revenue Won"]}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#00C5A1"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#FFFFFF", stroke: "#00C5A1", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#00C5A1", stroke: "#FFFFFF", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
