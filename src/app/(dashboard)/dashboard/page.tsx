"use client";

import { useGetDashboardStatsQuery, useGetProjectsQuery } from "@/lib/store/api";
import StatusPill from "@/components/ui/StatusPill";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export default function DashboardPage() {
  const { data: dashboardData, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: projectsData, isLoading: projLoading } = useGetProjectsQuery({});
  
  const allProjects = projectsData?.projects || [];
  const now = new Date();
  
  // Real-time calculations from project list to ensure UI matches data exactly
  const total = allProjects.filter((p: any) => p.status !== 'CANCEL').length;
  const completed = allProjects.filter((p: any) => p.status === 'COMPLETED').length;
  const overdue = allProjects.filter((p: any) => 
    !['COMPLETED', 'CANCEL'].includes(p.status) && 
    p.deliveryDate && new Date(p.deliveryDate) < now
  ).length;
  const onTrack = allProjects.filter((p: any) => 
    !['COMPLETED', 'CANCEL'].includes(p.status) && 
    (!p.deliveryDate || new Date(p.deliveryDate) >= now)
  ).length;

  const safeStats = dashboardData?.stats || { 
    totalCount: total, 
    activeProjectsCount: onTrack + overdue, 
    wipOnTrackCount: onTrack, 
    completedCount: completed, 
    overdueCount: overdue, 
    totalRevenue: 0, 
    teamMembersCount: 0, 
    avgDeliveryDays: 0 
  };
  const recentProjects = allProjects.slice(0, 5);

  if (statsLoading || projLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-surface-container-low border border-outline-variant/10" />
          ))}
        </div>
        <div className="h-80 rounded-2xl bg-surface-container-low border border-outline-variant/10" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {safeStats.overdueCount > 0 && (
        <div className="bg-error/10 border border-error/20 rounded-2xl p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center text-error">
              <span className="material-symbols-outlined">report</span>
            </div>
            <div>
              <h4 className="text-sm font-bold font-headline text-error uppercase tracking-tight">Overdue Alerts</h4>
              <p className="text-[12px] font-mono text-error/80">
                <span className="font-bold">{safeStats.overdueCount} project(s)</span> overdue — Immediate action required
              </p>
            </div>
          </div>
          <Link href="/projects?status=OVERDUE" className="bg-error text-on-error px-4 py-1.5 rounded-lg text-[11px] font-bold font-headline uppercase tracking-widest hover:scale-95 transition-all">
            Review Missions
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="ACTIVE PROJECTS" value={String(safeStats.activeProjectsCount).padStart(2, "0")} trend="+12% vs last month" icon="trending_up" color="border-primary" textColor="text-primary" />
        <StatsCard title="TOTAL REVENUE" value={`$${(safeStats.totalRevenue || 0).toLocaleString()}`} trend="Q1 Projection met" icon="account_balance_wallet" color="border-tertiary" textColor="text-tertiary" />
        <StatsCard title="TEAM MEMBERS" value={String(safeStats.teamMembersCount).padStart(2, "0")} trend="Operatives online" icon="group_add" color="border-secondary" textColor="text-secondary" />
        <StatsCard title="AVG DELIVERY" value={`${safeStats.avgDeliveryDays || 0}d`} trend="Based on completed" icon="speed" color="border-error" textColor="text-error" />
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-headline text-on-surface tracking-tight">Recent Projects</h3>
            <Link href="/projects" className="text-[13px] text-primary hover:underline transition-all">View full list</Link>
          </div>
          <div className="bg-surface rounded-2xl overflow-hidden border border-outline-variant/10">
            {recentProjects.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant font-mono text-sm">No projects yet.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low">
                  <tr>
                    {["Client", "Phase", "Status", "Priority", "Payment"].map(h => (
                      <th key={h} className="px-4 py-4 text-[11px] uppercase tracking-widest text-on-surface-variant font-mono first:px-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {recentProjects.map((p: any) => (
                    <tr key={p.id} className="hover:bg-surface-container-high transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-[12px] font-mono">{p.clientName?.charAt(0)}</div>
                          <div>
                            <p className="text-[13px] font-bold font-headline">{p.clientName}</p>
                            <p className="text-[11px] font-mono text-on-surface-variant">#{p.orderId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[12px] font-mono">{p.phase}</td>
                      <td className="px-4 py-4"><StatusPill status={p.status} /></td>
                      <td className="px-4 py-4">
                        <div className={cn("flex items-center gap-1", p.priority === "HIGH" ? "text-error" : "text-secondary")}>
                          <span className="material-symbols-outlined text-[14px]">{p.priority === "HIGH" ? "priority_high" : "low_priority"}</span>
                          <span className="text-[11px] font-bold">{p.priority}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-[13px]">${(p.totalPayment || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-surface rounded-2xl p-6 border border-outline-variant/10">
            <h4 className="text-sm font-bold font-headline mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>Status Breakdown
            </h4>
            <div className="flex items-center justify-between">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-surface-container-highest" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="10" />
                  <circle 
                    className="text-primary transition-all duration-1000 ease-out" 
                    cx="64" cy="64" 
                    fill="transparent" r="58" 
                    stroke="currentColor" strokeWidth="10"
                    strokeDasharray="364.4"
                    strokeDashoffset={364.4 - (364.4 * (safeStats.activeProjectsCount / (safeStats.totalCount || 1)))}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-mono">{safeStats.totalCount}</span>
                  <span className="text-[9px] uppercase tracking-tighter text-on-surface-variant">Total</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: "On Track", color: "bg-primary", count: safeStats.wipOnTrackCount },
                  { label: "Overdue", color: "bg-error", count: safeStats.overdueCount },
                  { label: "Completed", color: "bg-tertiary", count: safeStats.completedCount },
                ].map(({ label, color, count }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${color}`}></span>
                    <span className="text-[11px] font-mono">{label}: <span className="text-on-surface font-bold">{count}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-6 border border-outline-variant/10">
            <h4 className="text-sm font-bold font-headline mb-4 text-error flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">report</span>Overdue Alerts
            </h4>
            {safeStats.overdueCount > 0 ? (
              <div className="p-3 bg-error/5 border border-error/10 rounded-xl flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-error flex-shrink-0"></div>
                <div>
                  <p className="text-[12px] font-bold font-headline">{safeStats.overdueCount} project(s) overdue</p>
                  <p className="text-[10px] font-mono text-error">Immediate action required</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl">
                <p className="text-[12px] font-mono text-primary">✓ All projects on schedule</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatsCard({ title, value, trend, icon, color, textColor }: any) {
  return (
    <div className={cn("bg-surface rounded-2xl p-6 border-l-4 hover:bg-surface-container-low transition-colors duration-300 group", color)}>
      <p className="text-xs text-on-surface-variant uppercase tracking-widest font-headline mb-2">{title}</p>
      <h3 className="text-3xl font-bold font-mono text-on-surface">{value}</h3>
      <div className={cn("mt-4 flex items-center gap-2 text-[11px]", textColor)}>
        <span className="material-symbols-outlined text-[14px]">{icon}</span>
        <span className="font-mono">{trend}</span>
      </div>
    </div>
  );
}
