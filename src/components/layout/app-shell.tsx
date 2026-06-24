import { Sidebar } from "@/components/layout/sidebar";
import PageTransition from "@/components/layout/page-transition";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F8F7F4]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-[240px]">
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}
