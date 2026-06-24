import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import type { ActivityItem } from "@/lib/types/proposal";
import LiveDot from "@/components/ui/clean/LiveDot";
import StatusBadge from "@/components/ui/clean/StatusBadge";
import CompanyAvatar from "@/components/ui/clean/CompanyAvatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Activity, Flame } from "lucide-react";

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div
      className="rounded-lg bg-white p-6"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div className="mb-5 flex items-center gap-2">
        <h3
          className="text-[15px] font-bold text-[#1A1D23]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Recent Activity
        </h3>
        <LiveDot />
        <span className="text-xs font-medium text-[#10B981]">Live</span>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Tracking events will appear here when prospects engage with your proposals."
          className="py-10"
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const isHotLead = item.type === "hot_lead";

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 border-b border-[#F1F5F9] pb-4 last:border-0 last:pb-0"
              >
                {isHotLead ? (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFFBEB]">
                    <Flame className="h-4 w-4 text-[#D97706]" />
                  </div>
                ) : (
                  <CompanyAvatar companyName={item.companyName} size={32} />
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <Link
                      href={item.proposalId ? `/proposals/${item.proposalId}` : "#"}
                      className="font-semibold text-[#1A1D23] hover:text-[#00C5A1] hover:underline"
                    >
                      {item.companyName}
                    </Link>{" "}
                    <span className="text-[13px] text-[#64748B]">{item.message}</span>
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {isHotLead && <StatusBadge status="hot_lead" />}
                    <span className="text-xs text-[#94A3B8]">
                      {formatRelativeTime(item.occurredAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
