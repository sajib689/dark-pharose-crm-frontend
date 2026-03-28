"use client";

import { useGetTeamMemberQuery, useGetKpiEarningsQuery } from "@/lib/store/api";
import StatusPill from "@/components/ui/StatusPill";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface MemberProfileModalProps {
  memberId: string | null;
  onClose: () => void;
}

export default function MemberProfileModal({ memberId, onClose }: MemberProfileModalProps) {
  const { data: memberData, isLoading } = useGetTeamMemberQuery(memberId as string, { skip: !memberId });
  const { data: earningsData } = useGetKpiEarningsQuery({ userId: memberId as string }, { skip: !memberId });

  if (!memberId) return null;

  const user = memberData?.team;
  const earnings = earningsData?.earnings || [];

  return (
    <div className={cn("fixed inset-0 z-[60] flex items-center justify-end transition-opacity duration-300", memberId ? "opacity-100" : "opacity-0 pointer-events-none")}>
      <div className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className={cn("relative w-full max-w-2xl h-full bg-surface border-l border-outline-variant/10 shadow-2xl transform transition-transform duration-500 flex flex-col", memberId ? "translate-x-0" : "translate-x-full")}>
        <header className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/30">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-surface-container-highest flex items-center justify-center transition-all">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 className="text-xl font-bold font-headline tracking-tight">Operative Intelligence Profile</h2>
          </div>
          <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-[0.2em] bg-primary/10 px-3 py-1 rounded-full border border-primary/20 animate-pulse">Sentinel Active</span>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {isLoading ? (
            <div className="space-y-8 animate-pulse">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-surface-container-highest" />
                <div className="space-y-3">
                  <div className="h-8 w-48 bg-surface-container-highest rounded" />
                  <div className="h-4 w-32 bg-surface-container-highest rounded" />
                </div>
              </div>
              <div className="h-64 bg-surface-container-highest rounded-2xl" />
            </div>
          ) : !user ? (
            <div className="h-full flex flex-col items-center justify-center text-on-surface-variant font-mono text-sm gap-2">
               <span className="material-symbols-outlined text-4xl">error</span>
               <span>DATA PURGED OR NOT FOUND</span>
            </div>
          ) : (
            <>
              {/* Header Info */}
              <div className="flex items-start gap-8">
                <div className="relative">
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-4xl font-bold font-headline text-on-primary shadow-xl">
                    {user.displayName?.charAt(0)}
                  </div>
                  <div className={cn("absolute -bottom-2 -right-2 w-6 h-6 border-4 border-surface rounded-full", user.isActive ? "bg-green-500" : "bg-error")}></div>
                </div>
                <div className="space-y-4 py-2 flex-1">
                  <div>
                    <h3 className="text-3xl font-bold font-headline tracking-tighter text-on-surface">{user.displayName}</h3>
                    <p className="text-primary font-mono text-xs uppercase tracking-widest mt-1">{user.role?.replace(/_/g, " ")}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-[12px] font-mono">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">mail</span> {user.email}
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">phone</span> {user.phone || "No secure line"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-3 gap-6">
                 {[
                   { label: "Mission Status", value: user.isActive ? "ACTIVE" : "SUSPENDED", color: user.isActive ? "text-green-400" : "text-error" },
                   { label: "Clearance Level", value: user.role === "SUPER_ADMIN" ? "LEVEL 5" : "LEVEL 3", color: "text-primary" },
                   { label: "Last Sync", value: new Date(user.createdAt).toLocaleDateString(), color: "text-slate-400" },
                 ].map(s => (
                   <div key={s.label} className="bg-surface-container-low border border-outline-variant/10 p-5 rounded-2xl">
                     <p className="text-[10px] uppercase font-bold text-on-surface-variant font-mono mb-2">{s.label}</p>
                     <p className={cn("text-sm font-bold font-headline", s.color)}>{s.value}</p>
                   </div>
                 ))}
              </div>

              {/* Assignments Section */}
              <div className="space-y-5">
                 <h4 className="text-sm font-bold font-headline uppercase tracking-widest flex items-center gap-2">
                   <span className="material-symbols-outlined text-primary text-[18px]">account_tree</span> Assigned Missions
                 </h4>
                 <div className="space-y-3">
                   {user.projectMember?.map((pm: any) => (
                     <div key={pm.project.id} className="bg-surface-container-low border border-outline-variant/10 p-4 rounded-xl flex items-center justify-between group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-xs font-mono font-bold">#{pm.project.orderId?.slice(-3)}</div>
                           <div>
                              <p className="text-[13px] font-bold font-headline">{pm.project.clientName}</p>
                              <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">{pm.roleInProject?.replace(/_/g, " ")}</p>
                           </div>
                        </div>
                        <StatusPill status={pm.project.status} />
                     </div>
                   ))}
                   {(!user.projectMember || user.projectMember.length === 0) && (
                     <div className="py-10 text-center text-on-surface-variant font-mono text-sm border-2 border-dashed border-outline-variant/10 rounded-2xl">
                        NO ACTIVE MISSION ASSIGNMENTS
                     </div>
                   )}
                 </div>
              </div>

              {/* Earnings History */}
              <div className="space-y-5 pb-10">
                 <h4 className="text-sm font-bold font-headline uppercase tracking-widest flex items-center gap-2 text-emerald-400">
                   <span className="material-symbols-outlined text-[18px]">payments</span> KPI Earnings Ledger
                 </h4>
                 <div className="bg-surface rounded-2xl border border-outline-variant/10 overflow-hidden shadow-inner">
                   <table className="w-full text-left">
                     <thead className="bg-surface-container-low">
                       <tr className="text-[10px] uppercase tracking-widest font-mono font-bold text-on-surface-variant">
                         <th className="py-3 px-4">Project</th>
                         <th className="py-3 px-4">Amount</th>
                         <th className="py-3 px-4 text-right">Status</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-outline-variant/10 text-sm">
                       {earnings.map((e: any) => (
                         <tr key={e.id}>
                           <td className="px-4 py-3 font-headline font-semibold text-xs">{e.project?.clientName}</td>
                           <td className="px-4 py-3 font-mono font-bold text-emerald-400">${e.amount?.toFixed(2)}</td>
                           <td className="px-4 py-3 text-right">
                              <span className={cn("text-[10px] font-bold uppercase", e.isPaid ? "text-teal-400" : "text-orange-400")}>
                                {e.isPaid ? "Cleared" : "Pending"}
                              </span>
                           </td>
                         </tr>
                       ))}
                       {earnings.length === 0 && (
                         <tr><td colSpan={3} className="py-10 text-center text-on-surface-variant font-mono text-xs">NO EARNINGS RECORDS LOGGED</td></tr>
                       )}
                     </tbody>
                   </table>
                 </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
