"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/proposals", label: "Proposals", icon: FileText, exact: true },
  { href: "/proposals/new", label: "New Proposal", icon: PlusCircle, exact: true },
  { href: "/prospects", label: "Prospects", icon: Users, exact: true },
  { href: "/analytics", label: "Analytics", icon: BarChart3, exact: true },
  { href: "/settings", label: "Settings", icon: Settings, exact: true },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname.startsWith(href);
}

interface SidebarNavProps {
  onNavigate?: () => void;
  className?: string;
}

export function SidebarNav({ onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex-1 space-y-0.5 px-3 py-2", className)}>
      {navItems.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(pathname, href, exact);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150",
              active
                ? "border-l-2 border-[#00C5A1] bg-[rgba(0,197,161,0.12)] text-[#00C5A1]"
                : "border-l-2 border-transparent text-[#94A3B8] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#E2E8F0]"
            )}
          >
            <Icon
              className="h-[18px] w-[18px] shrink-0"
              style={{ color: active ? "#00C5A1" : "#64748B" }}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside className="absolute left-0 top-0 flex h-full w-[240px] flex-col bg-[#1A1D23] shadow-2xl">
        <SidebarBrand onClose={onClose} mobile />
        <SidebarNav onNavigate={onClose} />
        <SidebarUserCard />
      </aside>
    </div>
  );
}

function SidebarBrand({ onClose, mobile }: { onClose?: () => void; mobile?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-5">
      <div className="flex items-center gap-2.5">
        <Sparkles className="h-5 w-5 shrink-0 text-[#00C5A1]" />
        <div>
          <span
            className="text-base font-bold text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            CleanProposal
          </span>
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#64748B]">
            Revenue Engine
          </p>
        </div>
      </div>
      {mobile && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-[#94A3B8] transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function SidebarUserCard() {
  return (
    <div className="mt-auto border-t border-white/[0.08] p-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00C5A1] text-xs font-semibold text-white"
        >
          SC
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#E2E8F0]">Sarah Chen</p>
          <p className="truncate text-xs text-[#64748B]">Sales Owner</p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[240px] flex-col bg-[#1A1D23] lg:flex">
      <SidebarBrand />
      <SidebarNav />
      <SidebarUserCard />
    </aside>
  );
}
