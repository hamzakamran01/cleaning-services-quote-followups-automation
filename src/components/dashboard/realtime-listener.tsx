"use client";

import { useEffect } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function RealtimeListener() {
    const router = useRouter();

    useEffect(() => {
        if (!isSupabaseConfigured()) return;

        const supabase = createClient();

        // Listen to Proposal Tracking Events (email open, view, etc.)
        const trackingChannel = supabase
            .channel("tracking-events")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "proposal_tracking_events" },
                (payload) => {
                    const { event_type, proposal_id } = payload.new;
                    const messages: Record<string, string> = {
                        email_opened: "📧 A prospect just opened your email!",
                        proposal_viewed: "👀 A prospect is viewing a proposal right now!",
                        proposal_downloaded: "📄 A proposal PDF was downloaded!",
                    };

                    const message = messages[event_type] || "New interaction on your proposal";

                    toast(message, {
                        description: "Real-time tracking event received.",
                        action: {
                            label: "View",
                            onClick: () => router.push(`/dashboard`),
                        },
                    });
                }
            )
            .subscribe();

        // Listen to FollowUp Notifications (Automated engine)
        const notificationChannel = supabase
            .channel("notifications")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "notifications" },
                (payload) => {
                    const { title, message } = payload.new;
                    toast(title, {
                        description: message,
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(trackingChannel);
            supabase.removeChannel(notificationChannel);
        };
    }, [router]);

    return null;
}
