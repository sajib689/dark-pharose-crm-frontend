"use client";

import { useGetMyProjectsQuery, useGetMyEarningsQuery, useGetNotificationsQuery } from "@/lib/store/api";
import { useSession } from "next-auth/react";
import StatusPill from "@/components/ui/StatusPill";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export default function MemberDashboard() {
  const { data: session } = useSession();
  const { data: projectsData, isLoading: projLoading } = useGetMyProjectsQuery();
  const { data: earnings } = useGetMyEarningsQuery();
  const { data: notificationsData } = useGetNotificationsQuery();

  const projects = projectsData?.projects || [];
  const notifications = notificationsData?.notifications || [];

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;
  const recentNotifs = notifications.slice(0, 3);

  const activeProjects = projects.filter((p: any) => !["COMPLETED", "CANCEL"].includes(p.status));
  const dueThisWeek = activeProjects.filter((p: any) => {
    const days = p.daysRemaining ?? 99;
    return days >= 0 && days <= 7;
  });

  const name = session?.user?.displayName?.split(" ")[0] || "Operative";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-8">
        {/* Greeting & Brief */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
              {greeting}, {name} 👋
            </h1>
            <p className="text-on-surface-variant text-sm mt-2 font-medium max-w-md">
              Your status is <span className="text-primary font-bold">NOMINAL</span>. 
              {activeProjects.length > 0 
                ? ` System identifies ${activeProjects.length} active project missions requiring your expertise.`
                : " Currently no active missions assigned. Equipment on standby."}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/projects" className="px-4 py-2 bg-surface-container-high rounded-xl border border-outline-variant/10 text-[11px] font-bold uppercase tracking-widest hover:bg-surface-container-highest transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">assignment</span>
              Mission Briefs
            </Link>
            <Link href="/kpi" className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">payments</span>
              Earnings
            </Link>
          </div>
        </div>

        {/* Operational Intelligence Card */}
        <div className="bg-gradient-to-br from-primary/10 via-surface-container-low to-surface-container-low p-6 rounded-2xl border border-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center shrink-0 border border-primary/30">
              <span className="material-symbols-outlined text-primary text-3xl">intelligence_panel</span>
            </div>
            <div>
              <h4 className="text-sm font-bold font-headline uppercase tracking-widest text-primary mb-1">Daily Operational Brief</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {dueThisWeek.length > 0 
                  ? `CRITICAL: You have ${dueThisWeek.length} mission deadline(s) this week. Ensure all assets are deployed. ` 
                  : "All current mission timelines are within standard parameters. "}
                Performance KPI tracking shows <span className="text-on-surface font-bold text-mono">${(earnings?.totalPending || 0).toFixed(0)}</span> in pending clearance.
              </p>
            </div>
            <button className="md:ml-auto px-6 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold font-headline hover:scale-[0.98] transition-all whitespace-nowrap">
              Post Status Update
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Projects", value: String(activeProjects.length).padStart(2, "0"), color: "border-primary", val: "text-primary" },
            { label: "Due This Week", value: String(dueThisWeek.length).padStart(2, "0"), color: "border-error", val: "text-error" },
            { label: "KPI Earnings", value: `$${(earnings?.totalEarned || 0).toFixed(0)}`, color: "border-primary-container", val: "text-primary" },
            { label: "Pending Payout", value: `$${(earnings?.totalPending || 0).toFixed(0)}`, color: "border-outline", val: "text-on-surface" },
          ].map(({ label, value, color, val }) => (
            <div key={label} className={`bg-surface-container p-5 rounded-xl border-l-4 ${color}`}>
              <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-1">{label}</p>
              <p className={`text-2xl font-bold font-mono ${val}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* My Projects Table */}
        <div className="bg-surface rounded-xl overflow-hidden border border-outline-variant/10 shadow-xl">
          <header className="bg-surface-container-low px-6 py-4 flex justify-between items-center">
            <h3 className="text-sm font-bold font-headline uppercase tracking-widest">My Active Projects</h3>
            <Link href="/projects" className="text-[11px] text-primary font-bold hover:underline">View All</Link>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low/50">
                <tr>
                  <th className="px-6 py-3 text-[11px] uppercase tracking-widest text-on-surface-variant font-mono">Project</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-widest text-on-surface-variant font-mono">Phase</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-widest text-on-surface-variant font-mono">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {projLoading && [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={3} className="px-6 py-4"><div className="h-6 rounded bg-surface-container-low" /></td>
                  </tr>
                ))}
                {!projLoading && activeProjects.map((p: any) => {
                  const days = p.daysRemaining ?? 99;
                  const daysColor = days < 0 ? "text-error" : days <= 3 ? "text-orange-400" : "text-green-400";
                  return (
                    <tr key={p.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                          <div>
                            <p className="font-headline font-semibold text-sm text-on-surface">{p.clientName}</p>
                            <StatusPill status={p.status} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-mono text-on-surface-variant">{p.phase}</td>
                      <td className="px-4 py-4">
                        <span className={cn("text-[11px] font-bold font-mono", daysColor)}>
                          {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!projLoading && activeProjects.length === 0 && (
                  <tr><td colSpan={3} className="py-10 text-center text-on-surface-variant font-mono text-sm">No active projects assigned.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-full lg:w-80 space-y-5">
        {/* Earnings Summary */}
        <div className="bg-surface-container-high rounded-xl p-6 border border-outline-variant/10">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
            <h4 className="text-sm font-bold font-headline uppercase tracking-widest">Earnings Summary</h4>
          </div>
          <div className="space-y-3">
            {[
              { label: "Total Earned", value: earnings?.totalEarned || 0, color: "text-on-surface" },
              { label: "Pending Clearance", value: earnings?.totalPending || 0, color: "text-orange-400" },
              { label: "Disbursed", value: earnings?.totalPaid || 0, color: "text-emerald-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/10 flex items-center justify-between">
                <p className="text-[10px] text-slate-500 uppercase font-bold">{label}</p>
                <span className={cn("text-lg font-bold font-mono", color)}>${value.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <Link href="/kpi" className="block w-full mt-5 py-2.5 rounded-xl border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-widest hover:bg-primary/5 transition-all text-center">
            View Full Statement
          </Link>
        </div>

        {/* Recent Notifications */}
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-sm font-bold font-headline uppercase tracking-widest">Notifications</h4>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-primary-container/20 text-primary rounded-full text-[10px] font-bold">{unreadCount} NEW</span>
            )}
          </div>
          <div className="space-y-3">
            {recentNotifs.length === 0 ? (
              <p className="text-sm text-on-surface-variant font-mono text-center py-4">No notifications</p>
            ) : recentNotifs.map((n: any) => (
              <div key={n.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px] text-primary">notifications</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface font-medium leading-tight">{n.title}</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase">
                    {Math.floor((Date.now() - new Date(n.createdAt).getTime()) / 3600000)}h ago
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/notifications" className="block w-full mt-4 text-center text-[10px] font-bold text-slate-500 hover:text-primary transition-all uppercase tracking-widest">
            View All Notifications
          </Link>
        </div>

        {/* System Status */}
        <div className="bg-violet-500/5 backdrop-blur-xl rounded-xl p-4 border border-primary/10 flex items-center gap-4">
          <div className="w-10 h-10 bg-primary-container/30 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-primary animate-pulse text-[20px]">monitoring</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-on-surface uppercase tracking-widest">System Status</p>
            <p className="text-[10px] text-primary/80 font-medium">All nodes operational</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
