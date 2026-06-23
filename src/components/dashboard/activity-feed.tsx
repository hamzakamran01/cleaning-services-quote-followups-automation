import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import type { ActivityItem } from "@/lib/types/proposal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Activity, Flame, Mail, Send, Trophy } from "lucide-react";

const iconMap = {
  email_opened: { icon: Mail, color: "bg-blue-100 text-blue-600" },
  proposal_viewed: { icon: Mail, color: "bg-indigo-100 text-indigo-600" },
  hot_lead: { icon: Flame, color: "bg-amber-100 text-amber-600" },
  won: { icon: Trophy, color: "bg-emerald-100 text-emerald-600" },
  follow_up: { icon: Send, color: "bg-purple-100 text-purple-600" },
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-brand-primary" />
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-brand-muted">
          Live
        </span>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Tracking events will appear here when prospects engage with your proposals."
            className="py-10"
          />
        ) : (
          <div className="space-y-1">
            {items.map((item, i) => {
              const config = iconMap[item.type] ?? iconMap.proposal_viewed;
              const Icon = config.icon;
              return (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50/80"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-brand-text">
                      <Link
                        href={item.proposalId ? `/proposals/${item.proposalId}` : "#"}
                        className="font-semibold hover:text-brand-primary hover:underline"
                      >
                        {item.companyName}
                      </Link>{" "}
                      <span className="text-brand-muted">{item.message}</span>
                    </p>
                    <p className="mt-1 text-xs text-brand-muted">
                      {formatRelativeTime(item.occurredAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
