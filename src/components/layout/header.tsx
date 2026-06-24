"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Menu, Plus } from "lucide-react";
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
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-black/[0.06] bg-white px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md p-2 transition-colors hover:bg-[#F8F7F4] lg:hidden"
            aria-label="Menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5 text-[#64748B]" />
          </button>
          <div>
            <h1
              className="text-lg font-bold text-[#1A1D23]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="hidden text-xs text-[#64748B] sm:block">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={panelRef}>
            <button
              className="relative rounded-md p-2 transition-colors hover:bg-[#F8F7F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
              aria-label="Notifications"
              aria-expanded={showPanel}
              onClick={() => setShowPanel(!showPanel)}
            >
              <Bell className="h-5 w-5 text-[#64748B]" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F59E0B] px-1 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showPanel && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-black/[0.07] bg-white shadow-elevated">
                <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
                  <span className="text-sm font-semibold text-[#1A1D23]">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      className="text-xs font-medium text-[#00C5A1] hover:underline"
                      onClick={markAllRead}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="mx-auto h-8 w-8 text-[#CBD5E1]" />
                      <p className="mt-2 text-sm text-[#64748B]">All caught up</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.proposalId ? `/proposals/${n.proposalId}` : "#"}
                        className="block border-b border-[#F1F5F9] px-4 py-3 transition-colors hover:bg-[#F8F7F4] last:border-0"
                        onClick={() => setShowPanel(false)}
                      >
                        <p className="text-sm font-semibold text-[#1A1D23]">{n.title}</p>
                        <p className="mt-0.5 text-xs text-[#64748B]">{n.message}</p>
                        <p className="mt-1.5 text-[11px] text-[#94A3B8]">
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
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/proposals/new"
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#00C5A1] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#009980] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Proposal</span>
              </Link>
            </motion.div>
          )}
        </div>
      </header>
    </>
  );
}
