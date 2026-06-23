import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import type { ActivityItem } from "@/lib/types/proposal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Activity, Flame, Mail, Send, Trophy } from "lucide-react";

const eventConfig: Record<
  string,
  { icon: typeof Mail; bg: string; iconColor: string; label: string; borderColor: string }
> = {
  email_opened: {
    icon: Mail,
    bg: "bg-blue-500",
    iconColor: "text-white",
    label: "Opened",
    borderColor: "border-l-blue-400",
  },
  proposal_viewed: {
    icon: Mail,
    bg: "bg-indigo-500",
    iconColor: "text-white",
    label: "Viewed",
    borderColor: "border-l-indigo-400",
  },
  hot_lead: {
    icon: Flame,
    bg: "bg-amber-500",
    iconColor: "text-white",
    label: "Hot Lead",
    borderColor: "border-l-amber-400",
  },
  won: {
    icon: Trophy,
    bg: "bg-emerald-500",
    iconColor: "text-white",
    label: "Won",
    borderColor: "border-l-emerald-400",
  },
  follow_up: {
    icon: Send,
    bg: "bg-purple-500",
    iconColor: "text-white",
    label: "Follow-up",
    borderColor: "border-l-purple-400",
  },
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="overflow-hidden border-brand-border/70" style={{ boxShadow: "var(--shadow-sm)" }}>
      <CardHeader className="border-b border-brand-border/40 bg-slate-50/60 px-5 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-brand-primary" />
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="pulse-dot" />
            <span className="text-xs font-semibold text-emerald-600">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Tracking events will appear here when prospects engage with your proposals."
            className="py-10"
          />
        ) : (
          <div className="relative divide-y divide-brand-border/40">
            {/* Timeline connector line */}
            <div className="timeline-line" />

            {items.map((item, i) => {
              const config = eventConfig[item.type] ?? eventConfig.proposal_viewed;
              const Icon = config.icon;
              const isFirst = i === 0;

              return (
                <div
                  key={item.id}
                  className={`relative flex gap-4 px-5 py-4 transition-colors hover:bg-slate-50/80 ${config.borderColor
                    } border-l-2`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Timeline node */}
                  <div className={`timeline-node ${config.bg} shrink-0`}>
                    {isFirst ? (
                      <div className="relative">
                        <div className="absolute -inset-1 animate-ping rounded-full bg-current opacity-20" />
                        <Icon className={`relative h-4 w-4 ${config.iconColor}`} />
                      </div>
                    ) : (
                      <Icon className={`h-4 w-4 ${config.iconColor}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm leading-snug text-brand-text">
                      <Link
                        href={item.proposalId ? `/proposals/${item.proposalId}` : "#"}
                        className="font-semibold hover:text-brand-primary hover:underline"
                      >
                        {item.companyName}
                      </Link>{" "}
                      <span className="text-brand-muted">{item.message}</span>
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white ${config.bg}`}
                      >
                        {config.label}
                      </span>
                      <span className="text-xs text-brand-muted">
                        {formatRelativeTime(item.occurredAt)}
                      </span>
                    </div>
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
