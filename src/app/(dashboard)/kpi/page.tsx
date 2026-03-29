"use client";

import { useSession } from "next-auth/react";
import {
  useGetKpiSettingsQuery,
  useGetTeamQuery,
  useMarkEarningPaidMutation,
  useGetKpiEarningsQuery,
  useGetMyEarningsQuery,
  useUpdateEarningMutation,
} from "@/lib/store/api";
import { useState } from "react";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export default function KPIPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "PROJECT_MANAGER";

  // Admin state & queries
  const [page, setPage] = useState(1);
  const { data: kpiSettings } = useGetKpiSettingsQuery(undefined, { skip: !isAdmin });
  const { data: teamData = [], isLoading: teamLoading } = useGetTeamQuery(undefined, { skip: !isAdmin });
  const { data: earningsData } = useGetKpiEarningsQuery({ page, limit: 10 }, { skip: !isAdmin });
  const [markPaid, { isLoading: isMarkingPaid }] = useMarkEarningPaidMutation();
  const [updateEarning] = useUpdateEarningMutation();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // Settle modal state
  const [settleMember, setSettleMember] = useState<any>(null);

  // Member queries
  const { data: myEarnings } = useGetMyEarningsQuery(undefined, { skip: isAdmin });

  if (!isAdmin) {
    return <MemberEarningsView earnings={myEarnings} />;
  }

  const summary = earningsData?.summary || [];
  const pagination = earningsData?.pagination || { page: 1, totalPages: 1 };

  const handleSettlePayout = async () => {
    if (!settleMember) return;
    try {
      const unpaid = earningsData?.earnings?.filter((e: any) => e.userId === settleMember.user.id && !e.isPaid) || [];
      if (unpaid.length === 0) {
        toast.error("No pending payouts found for this operative.");
        setSettleMember(null);
        return;
      }
      
      const promise = Promise.all(unpaid.map((e: any) => markPaid(e.id).unwrap()));
      await toast.promise(promise, {
        loading: `Clearing ${unpaid.length} payouts for ${settleMember.user.displayName}...`,
        success: `Total $${settleMember.totalPending.toFixed(2)} disbursed to ${settleMember.user.displayName}.`,
        error: "Failed to settle all payouts. Please try again.",
      });
      
      setSettleMember(null);
    } catch (err) {
      console.error("Settlement failure:", err);
    }
  };

  const handleUpdateEarning = async (id: string, data: any) => {
    try {
      await updateEarning({ id, data }).unwrap();
      toast.success("Earning record updated.");
    } catch (err) {
      toast.error("Manual distribution update failed.");
    }
  };

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

      <ConfirmModal 
        isOpen={!!settleMember}
        onClose={() => setSettleMember(null)}
        onConfirm={handleSettlePayout}
        title="Disburse Payouts?"
        message={`Clear all pending payouts ($${settleMember?.totalPending.toFixed(2)}) for ${settleMember?.user.displayName}?`}
        variant="primary"
        confirmText="Authorize Payout"
        isLoading={isMarkingPaid}
      />

      {/* KPI Rules Card */}
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
              { label: `APP (${kpiSettings?.appDevPct ?? 0}%)`, color: "bg-indigo-500" },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${color}`}></span>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-tighter">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-10 w-full bg-surface-container-lowest rounded-full overflow-hidden flex shadow-inner">
          <div className="h-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-700" style={{ width: `${kpiSettings?.frontendPct ?? 43}%` }}></div>
          <div className="h-full bg-gradient-to-r from-secondary-container to-secondary transition-all duration-700" style={{ width: `${kpiSettings?.backendPct ?? 32}%` }}></div>
          <div className="h-full bg-gradient-to-r from-tertiary-container to-tertiary transition-all duration-700" style={{ width: `${kpiSettings?.uiuxPct ?? 25}%` }}></div>
          <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-700" style={{ width: `${kpiSettings?.appDevPct ?? 0}%` }}></div>
        </div>
      </section>

      {/* Member Earnings Table */}
      <section className="bg-surface rounded-2xl border border-outline-variant/10 shadow-xl overflow-hidden">
        <div className="px-6 py-5 flex justify-between items-center border-b border-outline-variant/5">
          <h3 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">payments</span>Member Earnings Management
          </h3>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg">
              <button 
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1 disabled:opacity-30 hover:bg-surface-container transition-colors rounded"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <span className="text-[11px] font-mono font-bold px-2">PAGE {page} / {pagination.totalPages}</span>
              <button 
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1 disabled:opacity-30 hover:bg-surface-container transition-colors rounded"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
            <button className="bg-surface-container-highest px-4 py-2 rounded-lg text-xs font-bold font-headline hover:bg-surface-bright transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">download</span>Export CSV
            </button>
          </div>
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
              {!teamLoading && summary.map((sum: any) => (
                <tr key={sum.user.id} className="bg-surface-container-low hover:bg-surface-container transition-colors rounded-xl">
                  <td className="py-4 px-4 rounded-l-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/30">
                        {sum.user.displayName?.charAt(0)}
                      </div>
                      <span className="font-semibold text-on-surface">{sum.user.displayName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-outline uppercase text-[10px] font-bold tracking-widest">{sum.user.role?.replace(/_/g, " ")}</td>
                  <td className="py-4 px-4 font-mono text-slate-400">{sum.projectCount}</td>
                  <td className="py-4 px-4 font-mono text-on-surface font-medium">${sum.totalEarned.toFixed(2)}</td>
                  <td className="py-4 px-4 font-mono text-orange-400">${sum.totalPending.toFixed(2)}</td>
                  <td className="py-4 px-4 font-mono text-emerald-400">${sum.totalPaid.toFixed(2)}</td>
                  <td className="py-4 px-4 text-right rounded-r-xl">
                    <div className="flex items-center justify-end gap-2">
                       <button
                        onClick={() => setEditingUserId(sum.user.id)}
                        className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-primary hover:text-on-primary transition-all uppercase tracking-tighter"
                      >
                        Distribution
                      </button>
                      {sum.totalPending > 0 && (
                        <button
                          onClick={() => setSettleMember(sum)}
                          className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-tighter"
                        >
                          Settle
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editingUserId && (
        <DistributionModal 
          userId={editingUserId} 
          onClose={() => setEditingUserId(null)} 
          earnings={earningsData?.earnings?.filter((e: any) => e.userId === editingUserId) || []}
          onUpdate={handleUpdateEarning}
        />
      )}
    </div>
  );
}

function DistributionModal({ onClose, earnings, onUpdate }: any) {
  const user = earnings[0]?.user;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
       <div className="bg-surface w-full max-w-4xl max-h-[85vh] rounded-3xl border border-outline-variant/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-8 py-6 border-b border-outline-variant/5 flex justify-between items-center bg-surface-container-low/30">
          <div>
            <h2 className="text-2xl font-bold font-headline tracking-tighter text-on-surface">KPI Distribution Control</h2>
            <p className="text-sm text-outline text-mono uppercase tracking-widest mt-1">OPERATIVE: {user?.displayName} • {user?.role}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold text-outline uppercase tracking-widest border-b border-outline-variant/5">
                <th className="pb-4">Project</th>
                <th className="pb-4">Contract</th>
                <th className="pb-4">KPI (%)</th>
                <th className="pb-4">Manual Distribution ($)</th>
                <th className="pb-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {earnings.map((e: any) => (
                <tr key={e.id} className="group transition-colors border-b border-outline-variant/5">
                  <td className="py-5 font-headline font-bold text-violet-300">{e.project?.clientName}</td>
                  <td className="py-5 font-mono text-sm text-outline">${e.project?.totalPayment?.toLocaleString()}</td>
                  <td className="py-5">
                    <input 
                      type="number"
                      defaultValue={e.percentage}
                      onBlur={(el) => onUpdate(e.id, { percentage: parseFloat(el.target.value) })}
                      className="bg-surface-container-lowest border border-outline-variant/10 rounded px-2 py-1 w-16 font-mono text-sm focus:border-primary outline-none transition-colors"
                    />
                    <span className="text-xs ml-2 text-outline">%</span>
                  </td>
                  <td className="py-5">
                    <input 
                      type="number"
                      defaultValue={e.amount}
                      onBlur={(el) => onUpdate(e.id, { amount: parseFloat(el.target.value) })}
                      className="bg-surface-container-lowest border border-outline-variant/10 rounded px-2 py-1 w-24 font-mono text-sm font-bold text-emerald-400 focus:border-emerald-500 outline-none transition-colors"
                    />
                  </td>
                  <td className="py-5 text-right">
                    <label className="flex items-center justify-end gap-2 cursor-pointer">
                      <span className={cn("text-[10px] font-bold uppercase tracking-tighter", e.isPaid ? "text-emerald-400" : "text-orange-400")}>
                        {e.isPaid ? "Disbursed" : "Pending"}
                      </span>
                      <input 
                        type="checkbox" 
                        checked={e.isPaid} 
                        onChange={() => onUpdate(e.id, { isPaid: !e.isPaid })}
                        className="w-4 h-4 rounded border-outline-variant accent-primary"
                      />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
