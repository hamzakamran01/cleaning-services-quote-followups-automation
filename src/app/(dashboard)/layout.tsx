import { AppShell } from "@/components/layout/app-shell";
import { RealtimeListener } from "@/components/dashboard/realtime-listener";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <RealtimeListener />
      {children}
    </AppShell>
  );
}
