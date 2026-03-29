"use client";
export const dynamic = "force-dynamic";

import { useGetReportsSummaryQuery, useGetProjectsQuery } from "@/lib/store/api";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import StatusPill from "@/components/ui/StatusPill";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const STATUS_COLORS: Record<string, string> = {
  WIP: "bg-amber-500",
  COMPLETED: "bg-teal-500",
  DELIVERED: "bg-emerald-500",
  REVISION: "bg-orange-500",
  CANCEL: "bg-red-500",
  PUBLISHING: "bg-blue-400",
  NEW_PROJECT: "bg-violet-500",
};

const PLATFORM_ICONS: Record<string, string> = {
  FIVERR: "💚",
  UPWORK: "🟢",
  DIRECT: "🤝",
  OTHER: "📦",
  WEB: "🌐",
  APP: "📱",
};

export default function ReportsPage() {
  const { data: reportData, isLoading } = useGetReportsSummaryQuery();
  const { data: projectsData } = useGetProjectsQuery({});

  const report = reportData?.summary || {};
  const projects = projectsData?.projects || [];

  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-surface-container-low" />)}
    </div>
  );

  const ov = report?.overview || {};
  const maxStatus = Math.max(...(report?.statusBreakdown || []).map((s: any) => s.count), 1);
  const maxPlatform = Math.max(...(report?.platformBreakdown || []).map((p: any) => p.count), 1);
  const maxRevenue = Math.max(...(report?.monthlyRevenue || []).map((m: any) => m.revenue), 1);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold font-headline tracking-tighter text-on-surface">Mission Analytics</h1>
        <p className="text-sm text-on-surface-variant mt-2 font-medium">
          Comprehensive intelligence report for Pharos Command operations.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Projects", value: ov.totalProjects || 0, icon: "inventory_2", color: "border-primary", subtext: `${ov.activeProjects || 0} active` },
          { label: "Completion Rate", value: `${ov.completionRate || 0}%`, icon: "target", color: "border-teal-500", subtext: `${ov.completedProjects || 0} completed` },
          { label: "Total Revenue", value: `$${(ov.totalRevenue || 0).toLocaleString()}`, icon: "payments", color: "border-emerald-500", subtext: `$${(ov.totalReceived || 0).toLocaleString()} received` },
          { label: "Outstanding", value: `$${(ov.outstandingAmount || 0).toLocaleString()}`, icon: "pending", color: "border-orange-500", subtext: `${ov.overdueCount || 0} overdue projects` },
        ].map(({ label, value, icon, color, subtext }) => (
          <div key={label} className={cn("bg-surface-container rounded-2xl p-6 border-l-4", color)}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] uppercase font-bold text-on-surface-variant tracking-widest">{label}</p>
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">{icon}</span>
            </div>
            <p className="text-3xl font-bold font-mono text-on-surface">{value}</p>
            <p className="text-[11px] font-mono text-on-surface-variant mt-1">{subtext}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/10">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary text-[20px]">donut_large</span>
            <h3 className="text-sm font-bold font-headline uppercase tracking-widest">Status Breakdown</h3>
          </div>
          <div className="space-y-3">
            {[...(report?.statusBreakdown || [])].sort((a: any, b: any) => b.count - a.count).map((s: any) => (
              <div key={s.status}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono text-on-surface-variant">{s.status.replace(/_/g, " ")}</span>
                  <span className="text-xs font-bold font-mono text-on-surface">{s.count}</span>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", STATUS_COLORS[s.status] || "bg-slate-500")}
                    style={{ width: `${(s.count / maxStatus) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {(!report?.statusBreakdown?.length) && (
              <p className="text-sm text-on-surface-variant text-center py-4">No data yet</p>
            )}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/10">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-secondary text-[20px]">hub</span>
            <h3 className="text-sm font-bold font-headline uppercase tracking-widest">Platform Split</h3>
          </div>
          <div className="space-y-3">
            {[...(report?.platformBreakdown || [])].sort((a: any, b: any) => b.count - a.count).map((p: any) => (
              <div key={p.platform}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono text-on-surface-variant">
                    {PLATFORM_ICONS[p.platform] || "📦"} {p.platform}
                  </span>
                  <span className="text-xs font-bold font-mono text-on-surface">{p.count}</span>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary-container to-secondary rounded-full transition-all duration-700"
                    style={{ width: `${(p.count / maxPlatform) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {(!report?.platformBreakdown?.length) && (
              <p className="text-sm text-on-surface-variant text-center py-4">No data yet</p>
            )}
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/10">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">trending_up</span>
            <h3 className="text-sm font-bold font-headline uppercase tracking-widest">Revenue Trend</h3>
          </div>
          <div className="space-y-3">
            {(report?.monthlyRevenue || []).slice(-6).map((m: any) => (
              <div key={m.month}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono text-on-surface-variant">{m.month}</span>
                  <span className="text-xs font-bold font-mono text-emerald-400">${m.revenue.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-700 to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${(m.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {(!report?.monthlyRevenue?.length) && (
              <p className="text-sm text-on-surface-variant text-center py-4">No completed projects yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Clients */}
      {report?.topClients?.length > 0 && (
        <div className="bg-surface-container rounded-2xl border border-outline-variant/10 overflow-hidden">
          <div className="px-6 py-4 bg-surface-container-low flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[20px]">star</span>
            <h3 className="text-sm font-bold font-headline uppercase tracking-widest">Top Clients by Contract Value</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low/50">
                <tr>
                  {["Client", "Platform", "Contract", "Received", "Payment Progress", "Status"].map(h => (
                    <th key={h} className="px-5 py-3 text-[11px] uppercase tracking-widest text-on-surface-variant font-mono">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {report.topClients.map((c: any, i: number) => {
                  const pct = c.totalPayment > 0 ? Math.round((c.currentPayment / c.totalPayment) * 100) : 0;
                  return (
                    <tr key={i} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            #{i + 1}
                          </div>
                          <span className="font-headline font-semibold text-sm">{c.clientName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-on-surface-variant">
                        {PLATFORM_ICONS[c.platform] || "📦"} {c.platform}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold font-mono text-on-surface">
                        ${c.totalPayment.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-sm font-mono text-emerald-400">
                        ${c.currentPayment.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 w-40">
                        <div className="space-y-1">
                          <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[10px] font-mono text-on-surface-variant">{pct}% paid</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill status={c.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Projects Table */}
      <div className="bg-surface-container rounded-2xl border border-outline-variant/10 overflow-hidden">
        <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">table_chart</span>
            <h3 className="text-sm font-bold font-headline uppercase tracking-widest">All Projects</h3>
          </div>
          <span className="text-xs font-mono text-on-surface-variant">{projects.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low/50">
              <tr>
                {["Client", "Order ID", "Phase", "Platform", "Status", "Contract", "Received", "Days Left"].map(h => (
                  <th key={h} className="px-5 py-3 text-[11px] uppercase tracking-widest text-on-surface-variant font-mono whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {projects.map((p: any) => {
                const days = p.daysRemaining ?? 99;
                const daysColor = days < 0 ? "text-error" : days <= 3 ? "text-orange-400" : "text-green-400";
                return (
                  <tr key={p.id} className="hover:bg-surface-container-low transition-colors text-sm">
                    <td className="px-5 py-3 font-headline font-medium text-on-surface">{p.clientName}</td>
                    <td className="px-5 py-3 font-mono text-xs text-violet-400">#{p.orderId}</td>
                    <td className="px-5 py-3 text-xs font-mono text-on-surface-variant">{p.phase?.replace(/_/g, " ")}</td>
                    <td className="px-5 py-3 text-xs font-mono text-on-surface-variant">
                      {PLATFORM_ICONS[p.platform] || "📦"} {p.platform}
                    </td>
                    <td className="px-5 py-3"><StatusPill status={p.status} /></td>
                    <td className="px-5 py-3 font-mono text-xs text-on-surface">${(p.totalPayment || 0).toLocaleString()}</td>
                    <td className="px-5 py-3 font-mono text-xs text-emerald-400">${(p.currentPayment || 0).toLocaleString()}</td>
                    <td className={cn("px-5 py-3 font-mono text-xs", daysColor)}>
                      {days < 0 ? `${Math.abs(days)}d OD` : `${days}d`}
                    </td>
                  </tr>
                );
              })}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-on-surface-variant font-mono text-sm">
                    No projects found. Add your first project to see reports.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
