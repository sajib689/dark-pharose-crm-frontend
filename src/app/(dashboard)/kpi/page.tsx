"use client";

import { useSession } from "next-auth/react";
import {
  useGetKpiSettingsQuery,
  useGetTeamQuery,
  useMarkEarningPaidMutation,
  useGetKpiEarningsQuery,
  useGetMyEarningsQuery,
} from "@/lib/store/api";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export default function KPIPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "PROJECT_MANAGER";

  // Admin queries
  const { data: kpiSettings } = useGetKpiSettingsQuery(undefined, { skip: !isAdmin });
  const { data: teamData = [], isLoading: teamLoading } = useGetTeamQuery(undefined, { skip: !isAdmin });
  const { data: earningsData } = useGetKpiEarningsQuery({}, { skip: !isAdmin });
  const [markPaid] = useMarkEarningPaidMutation();

  // Member queries
  const { data: myEarnings } = useGetMyEarningsQuery(undefined, { skip: isAdmin });

  if (!isAdmin) {
    return <MemberEarningsView earnings={myEarnings} />;
  }

  const activeUsers = Array.isArray(teamData) ? teamData.filter((u: any) => u.isActive) : [];
  const summary = earningsData?.summary || [];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center w-full">
        <h1 className="text-xl font-bold tracking-tighter text-violet-400 uppercase font-headline">KPI &amp; Earnings</h1>
      </header>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-2xl p-6 border-l-4 border-primary shadow-lg hover:bg-surface-container-low transition-colors group cursor-default">
          <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-[0.2em] font-headline mb-3">Total Project Volume</p>
          <p className="text-3xl font-bold font-mono text-on-surface tracking-tighter">${earningsData?.earnings?.reduce((acc: number, e: any) => acc + (e.project?.totalPayment || 0), 0).toLocaleString() ?? '0'}</p>
        </div>
        <div className="bg-surface rounded-2xl p-6 border-l-4 border-orange-500 shadow-lg hover:bg-surface-container-low transition-colors group cursor-default">
          <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-[0.2em] font-headline mb-3">Outstanding Payouts</p>
          <p className="text-3xl font-bold font-mono text-orange-400 tracking-tighter">${earningsData?.earnings?.filter((e: any) => !e.isPaid).reduce((acc: number, e: any) => acc + (e.amount || 0), 0).toLocaleString() ?? '0'}</p>
        </div>
        <div className="bg-surface rounded-2xl p-6 border-l-4 border-teal-500 shadow-lg hover:bg-surface-container-low transition-colors group cursor-default">
          <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-[0.2em] font-headline mb-3">Successfully Cleared</p>
          <p className="text-3xl font-bold font-mono text-teal-400 tracking-tighter">${earningsData?.earnings?.filter((e: any) => e.isPaid).reduce((acc: number, e: any) => acc + (e.amount || 0), 0).toLocaleString() ?? '0'}</p>
        </div>
      </div>

      {/* KPI Distribution Card */}
      <section className="bg-surface rounded-2xl p-6 border border-outline-variant/10 shadow-xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-lg font-headline font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">analytics</span>KPI Rules Distribution
            </h3>
            <p className="text-sm text-slate-400 mt-1">Weighting allocation across engineering departments</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              { label: `FE (${kpiSettings?.frontendPct ?? 43}%)`, color: "bg-primary" },
              { label: `BE (${kpiSettings?.backendPct ?? 32}%)`, color: "bg-secondary" },
              { label: `UI/UX (${kpiSettings?.uiuxPct ?? 25}%)`, color: "bg-tertiary" },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${color}`}></span>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-tighter">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-10 w-full bg-surface-container-lowest rounded-full overflow-hidden flex shadow-inner">
          <div className="h-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-700" style={{ width: `${kpiSettings?.frontendPct ?? 43}%` }}>
            <span className="text-[10px] font-bold text-white flex items-center justify-center h-full">FE</span>
          </div>
          <div className="h-full bg-gradient-to-r from-secondary-container to-secondary transition-all duration-700" style={{ width: `${kpiSettings?.backendPct ?? 32}%` }}>
            <span className="text-[10px] font-bold text-white flex items-center justify-center h-full">BE</span>
          </div>
          <div className="h-full bg-gradient-to-r from-tertiary-container to-tertiary transition-all duration-700" style={{ width: `${kpiSettings?.uiuxPct ?? 25}%` }}>
            <span className="text-[10px] font-bold flex items-center justify-center h-full">UI</span>
          </div>
        </div>
      </section>

      {/* Member Earnings Table */}
      <section className="bg-surface rounded-2xl border border-outline-variant/10 shadow-xl overflow-hidden">
        <div className="px-6 py-5 flex justify-between items-center border-b border-outline-variant/5">
          <h3 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">payments</span>Member Earnings Management
          </h3>
          <button className="bg-surface-container-highest px-4 py-2 rounded-lg text-xs font-bold font-headline hover:bg-surface-bright transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2 px-4">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                <th className="py-4 px-4">Member</th>
                <th className="py-4 px-4">Role</th>
                <th className="py-4 px-4">Projects</th>
                <th className="py-4 px-4">Total Earned</th>
                <th className="py-4 px-4 text-orange-400">Pending</th>
                <th className="py-4 px-4 text-emerald-400">Paid</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {teamLoading && [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="py-4 px-4"><div className="h-8 rounded-lg bg-surface-container-low" /></td>
                </tr>
              ))}
              {!teamLoading && activeUsers.map((user: any) => {
                const userSummary = summary.find((s: any) => s.user?.id === user.id);
                const pending = userSummary?.totalPending ?? 0;
                return (
                  <tr key={user.id} className="bg-surface-container-low hover:bg-surface-container transition-colors rounded-xl">
                    <td className="py-4 px-4 rounded-l-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/30">
                          {user.displayName?.charAt(0)}
                        </div>
                        <span className="font-semibold text-on-surface">{user.displayName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-violet-500/10 text-violet-400 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {user.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-400">{userSummary?.projectCount ?? "--"}</td>
                    <td className="py-4 px-4 font-mono text-on-surface font-medium">${(userSummary?.totalEarned ?? 0).toFixed(2)}</td>
                    <td className="py-4 px-4 font-mono text-orange-400/80">${(userSummary?.totalPending ?? 0).toFixed(2)}</td>
                    <td className="py-4 px-4 font-mono text-emerald-400/80">${(userSummary?.totalPaid ?? 0).toFixed(2)}</td>
                    <td className="py-4 px-4 text-right rounded-r-xl">
                      {pending > 0 && (
                        <button
                          onClick={async () => {
                            if (window.confirm(`Clear pending payout of $${pending.toFixed(2)} for ${user.displayName}?`)) {
                              // Find all unpaid earnings for this user and mark them paid
                              const unpaid = earningsData?.earnings?.filter((e: any) => e.userId === user.id && !e.isPaid) || [];
                              for (const earning of unpaid) {
                                await markPaid(earning.id);
                              }
                            }
                          }}
                          className="text-[11px] font-bold text-emerald-400 hover:text-on-primary hover:bg-emerald-500 transition-all border border-emerald-400/20 px-3 py-1.5 rounded-lg font-headline uppercase tracking-tighter"
                        >
                          Settle Payout
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!teamLoading && activeUsers.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-on-surface-variant font-mono text-sm">No active team members.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Live Telemetry Pulse */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3 bg-surface-container-high px-4 py-2 rounded-full border border-primary/20 shadow-2xl z-50">
        <div className="relative flex items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary/20 animate-ping"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface font-mono">Live Telemetry Active</span>
      </div>
    </div>
  );
}

function MemberEarningsView({ earnings }: { earnings: any }) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-bold tracking-tighter text-violet-400 uppercase font-headline">My Earnings</h1>
        <p className="text-on-surface-variant text-sm mt-1">Your KPI earnings summary</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Earned", value: earnings?.totalEarned ?? 0, color: "border-primary", textColor: "text-primary" },
          { label: "Pending Clearance", value: earnings?.totalPending ?? 0, color: "border-orange-500", textColor: "text-orange-400" },
          { label: "Disbursed", value: earnings?.totalPaid ?? 0, color: "border-teal-500", textColor: "text-teal-400" },
        ].map(({ label, value, color, textColor }) => (
          <div key={label} className={cn("bg-surface-container rounded-2xl p-6 border-l-4", color)}>
            <p className="text-[11px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">{label}</p>
            <p className={cn("text-3xl font-bold font-mono", textColor)}>${value.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Earnings Table */}
      <div className="bg-surface rounded-2xl border border-outline-variant/10 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/10">
          <h3 className="text-sm font-bold font-headline uppercase tracking-widest">Earnings History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                <th className="py-3 px-5">Project</th>
                <th className="py-3 px-5">Role</th>
                <th className="py-3 px-5">% Share</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-sm">
              {(earnings?.earnings || []).map((e: any) => (
                <tr key={e.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-5 py-4 font-headline font-medium">{e.project?.clientName}</td>
                  <td className="px-5 py-4 text-xs font-mono text-violet-400">{e.roleInProject?.replace(/_/g, " ")}</td>
                  <td className="px-5 py-4 font-mono text-on-surface-variant">{e.percentage?.toFixed(1)}%</td>
                  <td className="px-5 py-4 font-mono font-bold text-on-surface">${e.amount?.toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase", e.isPaid ? "bg-teal-500/15 text-teal-400" : "bg-orange-500/15 text-orange-400")}>
                      {e.isPaid ? "Paid" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
              {(!earnings?.earnings?.length) && (
                <tr><td colSpan={5} className="py-16 text-center text-on-surface-variant font-mono text-sm">No earnings yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
