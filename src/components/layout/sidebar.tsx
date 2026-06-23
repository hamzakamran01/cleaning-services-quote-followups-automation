"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/proposals", label: "Proposals", icon: FileText, exact: true },
  { href: "/proposals/new", label: "New Proposal", icon: Sparkles, exact: true, highlight: true },
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
    <nav className={cn("flex-1 space-y-1 p-3", className)}>
      {navItems.map(({ href, label, icon: Icon, exact, highlight }) => {
        const active = isActive(pathname, href, exact);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active && "nav-item-active",
              !active && "text-brand-muted hover:bg-slate-50 hover:text-brand-text",
              highlight && !active && "text-brand-primary hover:bg-brand-primary/[0.06]"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                active && "bg-brand-primary text-white shadow-soft",
                !active && "bg-slate-100 text-brand-muted group-hover:bg-brand-primary/10 group-hover:text-brand-primary",
                highlight && !active && "bg-brand-primary/10 text-brand-primary"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
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
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-2xl animate-slide-in">
        <SidebarBrand onClose={onClose} mobile />
        <SidebarNav onNavigate={onClose} />
        <SidebarFooter />
      </aside>
    </div>
  );
}

function SidebarBrand({ onClose, mobile }: { onClose?: () => void; mobile?: boolean }) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-brand-border/60 px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-primary-light text-white shadow-glow">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <span className="font-bold tracking-tight text-brand-text">{APP_NAME}</span>
          <p className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
            Revenue Engine
          </p>
        </div>
      </div>
      {mobile && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-2 text-brand-muted transition-colors hover:bg-slate-100"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function SidebarFooter() {
  return (
    <div className="border-t border-brand-border/60 p-4">
      <div className="rounded-xl bg-gradient-to-br from-brand-primary/[0.06] to-brand-accent/[0.06] p-3">
        <p className="text-xs font-semibold text-brand-text">Demo Mode Active</p>
        <p className="mt-1 text-[11px] leading-relaxed text-brand-muted">
          Full proposal workflow with AI generation & follow-ups
        </p>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-[272px] flex-col border-r border-brand-border/60 bg-white lg:flex">
      <SidebarBrand />
      <SidebarNav />
      <SidebarFooter />
    </aside>
  );
}
