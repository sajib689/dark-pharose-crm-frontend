"use client";

import { useState } from "react";
import { useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation, useDismissNotificationMutation } from "@/lib/store/api";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const TYPE_CONFIG: Record<string, { icon: string; color: string; iconColor: string; border: string }> = {
  PROJECT_ASSIGNED: { icon: "assignment", color: "bg-primary/5", iconColor: "bg-primary/10 text-primary", border: "border-primary" },
  STATUS_CHANGED:   { icon: "sync_alt",  color: "bg-secondary/5", iconColor: "bg-secondary/10 text-secondary", border: "border-secondary" },
  OVERDUE:          { icon: "emergency", color: "bg-error/5", iconColor: "bg-error/10 text-error", border: "border-error" },
  DEADLINE_APPROACHING: { icon: "alarm", color: "bg-orange-500/5", iconColor: "bg-orange-500/10 text-orange-400", border: "border-orange-500/50" },
  KPI_PAID:         { icon: "payments", color: "bg-emerald-500/5", iconColor: "bg-emerald-500/10 text-emerald-400", border: "border-emerald-500/50" },
  DEFAULT:          { icon: "info",     color: "bg-surface-container/40", iconColor: "bg-surface-container-highest/40 text-on-surface-variant", border: "border-outline-variant/40" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function groupByDay(notifications: any[]) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const groups: Record<string, any[]> = { Today: [], Yesterday: [], Earlier: [] };
  for (const n of notifications) {
    const d = new Date(n.createdAt); d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) groups.Today.push(n);
    else if (d.getTime() === yesterday.getTime()) groups.Yesterday.push(n);
    else groups.Earlier.push(n);
  }
  return groups;
}

const FILTERS = ["All", "Unread", "Project", "Payment", "Deadline"];
const FILTER_TYPES: Record<string, string[]> = {
  Project: ["PROJECT_ASSIGNED", "STATUS_CHANGED"],
  Payment: ["KPI_PAID"],
  Deadline: ["OVERDUE", "DEADLINE_APPROACHING"],
};

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const { data: notificationsData, isLoading } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [dismiss] = useDismissNotificationMutation();

  const data = notificationsData?.notifications || [];

  const filtered = data.filter((n: any) => {
    if (activeFilter === "Unread") return !n.isRead;
    if (FILTER_TYPES[activeFilter]) return FILTER_TYPES[activeFilter].includes(n.type);
    return true;
  });

  const unreadCount = data.filter((n: any) => !n.isRead).length;
  const groups = groupByDay(filtered);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-bold font-headline tracking-tighter text-on-surface">Notification Center</h1>
          <p className="text-on-surface-variant text-sm mt-2 font-medium">Manage your mission-critical updates and system alerts.</p>
        </div>
        <button
          onClick={() => markAllRead()}
          className="flex items-center gap-2 bg-surface-container-high border border-outline-variant/20 px-5 py-2.5 rounded-xl text-primary font-bold font-headline text-xs hover:bg-surface-container-highest transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">done_all</span>
          Mark all read
        </button>
      </header>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f, i) => (
            <button
              key={f} onClick={() => setActiveFilter(f)}
              className={cn("px-5 py-1.5 rounded-full text-xs font-bold font-headline transition-all", activeFilter === f ? "bg-primary text-on-primary ring-4 ring-primary/20" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high")}
            >{f}</button>
          ))}
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(210,187,255,0.6)]"></span>
            <span className="text-[11px] font-mono font-bold text-primary uppercase">{unreadCount} Unread Alert{unreadCount !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-surface-container-low border border-outline-variant/10" />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="py-20 text-center space-y-3">
          <span className="material-symbols-outlined text-6xl text-outline-variant">notifications_off</span>
          <p className="font-headline text-xl text-on-surface">All clear, operative</p>
          <p className="text-on-surface-variant text-sm">No notifications matching this filter.</p>
        </div>
      )}

      {/* Notification Groups */}
      {!isLoading && (
        <div className="space-y-10">
          {Object.entries(groups).map(([label, items]) => items.length === 0 ? null : (
            <section key={label} className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] font-bold">{label}</span>
                <div className="h-px flex-1 bg-outline-variant/20"></div>
              </div>
              <div className="space-y-3">
                {items.map((n: any) => {
                  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.DEFAULT;
                  return (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && markRead(n.id)}
                      className={cn(
                        "relative rounded-xl border-l-4 transition-all duration-300 flex items-start gap-4 p-5 cursor-pointer group",
                        cfg.color, cfg.border,
                        !n.isRead ? "shadow-[0_0_20px_rgba(124,58,237,0.05)]" : "opacity-70"
                      )}
                    >
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", cfg.iconColor)}>
                        <span className="material-symbols-outlined text-[22px]">{cfg.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-3">
                          <h4 className="text-[14px] font-bold font-headline text-on-surface leading-tight">{n.title}</h4>
                          <span className="text-[10px] font-mono text-on-surface-variant/60 uppercase shrink-0">{timeAgo(n.createdAt)}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed mt-1">{n.message}</p>
                        {n.project && (
                          <p className="text-[10px] font-mono text-primary/60 mt-1">#{n.project.orderId} — {n.project.clientName}</p>
                        )}
                        <div className="flex gap-4 pt-3">
                          {!n.isRead && (
                            <button
                              onClick={e => { e.stopPropagation(); markRead(n.id); }}
                              className="text-[11px] font-bold font-headline text-primary uppercase tracking-widest hover:underline transition-all"
                            >
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                            className="text-[11px] font-bold font-headline text-on-surface-variant uppercase tracking-widest hover:text-error transition-all"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                      {!n.isRead && (
                        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(210,187,255,0.6)]"></span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="text-center pt-8">
        <p className="text-[11px] font-mono text-on-surface-variant/40 uppercase tracking-[0.2em]">
          End of Feed · Continuous Monitoring Enabled
        </p>
      </div>
    </div>
  );
}
