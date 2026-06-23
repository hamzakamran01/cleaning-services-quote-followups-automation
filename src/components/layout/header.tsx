"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "@/components/layout/sidebar";
import { formatRelativeTime } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showNewProposal?: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  proposalId?: string;
}

export function Header({ title, subtitle, showNewProposal = true }: HeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  async function loadNotifications() {
    try {
      const res = await fetch("/api/v1/notifications?unread=true");
      const d = await res.json();
      setNotifications(d.notifications ?? []);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    }
    if (showPanel) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPanel]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    await fetch("/api/v1/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: notifications.map((n) => n.id) }),
    });
    setNotifications([]);
    setShowPanel(false);
  }

  return (
    <>
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <header className="sticky top-0 z-40 border-b border-brand-border/60 bg-white/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl p-2 transition-colors hover:bg-slate-100 lg:hidden"
              aria-label="Menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5 text-brand-muted" />
            </button>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-brand-text">{title}</h1>
              {subtitle && <p className="text-sm text-brand-muted">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative" ref={panelRef}>
              <button
                className="relative rounded-xl p-2.5 transition-colors hover:bg-slate-100"
                aria-label="Notifications"
                aria-expanded={showPanel}
                onClick={() => setShowPanel(!showPanel)}
              >
                <Bell className="h-5 w-5 text-brand-muted" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-warning text-[9px] font-bold text-white ring-2 ring-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showPanel && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-brand-border/80 bg-white shadow-elevated animate-fade-in">
                  <div className="flex items-center justify-between border-b border-brand-border/60 bg-slate-50/50 px-4 py-3">
                    <span className="text-sm font-semibold text-brand-text">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        className="text-xs font-medium text-brand-primary hover:underline"
                        onClick={markAllRead}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="mx-auto h-8 w-8 text-slate-300" />
                        <p className="mt-2 text-sm text-brand-muted">All caught up</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.proposalId ? `/proposals/${n.proposalId}` : "#"}
                          className="block border-b border-brand-border/40 px-4 py-3 transition-colors hover:bg-brand-primary/[0.03] last:border-0"
                          onClick={() => setShowPanel(false)}
                        >
                          <p className="text-sm font-semibold text-brand-text">{n.title}</p>
                          <p className="mt-0.5 text-xs text-brand-muted">{n.message}</p>
                          <p className="mt-1.5 text-[11px] text-brand-muted/80">
                            {formatRelativeTime(n.createdAt)}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {showNewProposal && (
              <Button size="sm" className="hidden sm:inline-flex" asChild>
                <Link href="/proposals/new">
                  <Plus className="h-4 w-4" />
                  New Proposal
                </Link>
              </Button>
            )}

            <div className="flex items-center gap-2 rounded-xl border border-brand-border/60 bg-slate-50/80 py-1 pl-1 pr-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary to-brand-primary-light text-xs font-bold text-white shadow-soft">
                SC
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-brand-text">Sarah Chen</p>
                <p className="text-[10px] text-brand-muted">Sales Owner</p>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
