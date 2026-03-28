"use client";

import StatusPill from "@/components/ui/StatusPill";
import { useUpdateProjectStatusMutation } from "@/lib/store/api";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const STATUSES = ["NEW_PROJECT", "WIP", "REVISION", "DELIVERED", "PUBLISHING", "COMPLETED", "CANCEL"];

interface Props { project: any | null; onClose: () => void; }

export default function ProjectDetailPanel({ project, onClose }: Props) {
  const [updateStatus, { isLoading: statusLoading }] = useUpdateProjectStatusMutation();

  if (!project) return null;

  const days = project.daysRemaining ?? 0;
  const daysColor = days < 0 ? "text-error" : days <= 3 ? "text-orange-400" : "text-green-400";
  const payPct = project.totalPayment > 0 ? Math.round(((project.currentPayment || 0) / project.totalPayment) * 100) : 0;

  const handleStatusChange = async (status: string) => {
    try { await updateStatus({ id: project.id, status }).unwrap(); }
    catch (e) { console.error("Failed to update status", e); }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-surface-container-high shadow-2xl z-50 flex flex-col border-l border-outline-variant/20">
        {/* Header */}
        <header className="p-7 pb-5 space-y-3 border-b border-outline-variant/10">
          <div className="flex justify-between items-start">
            <div className="space-y-1 flex-1 min-w-0">
              <h2 className="font-headline text-2xl font-bold tracking-tighter text-on-surface truncate">{project.clientName}</h2>
              <p className="font-mono text-xs text-violet-400/80 tracking-widest">#{project.orderId}</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors ml-3 shrink-0">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">close</span>
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <StatusPill status={project.status} />
            <span className={cn("px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1", project.priority === "HIGH" ? "bg-error/15 text-error" : "bg-secondary/15 text-secondary")}>
              <span className="material-symbols-outlined text-[13px]">{project.priority === "HIGH" ? "priority_high" : "low_priority"}</span>
              {project.priority}
            </span>
            {project.isAddOn && <span className="px-2 py-1 bg-tertiary/15 text-tertiary text-[10px] font-bold rounded-full">ADD-ON</span>}
            {project.needUpdate && <span className="px-2 py-1 bg-orange-500/15 text-orange-400 text-[10px] font-bold rounded-full">NEEDS UPDATE</span>}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-7 space-y-7 py-6">

          {/* Metrics Row */}
          <section className="grid grid-cols-3 gap-3">
            {[
              { label: "Phase", value: project.phase, border: "border-primary" },
              { label: "Delivery", value: new Date(project.deliveryDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }), border: "border-outline-variant/30" },
              { label: "Days Left", value: days < 0 ? `${Math.abs(days)}d OD` : `${days}d`, border: "border-outline-variant/30", valueColor: daysColor },
            ].map(({ label, value, border, valueColor }) => (
              <div key={label} className={cn("bg-surface-container-low p-4 rounded-xl border-l-4", border)}>
                <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-1">{label}</p>
                <p className={cn("text-sm font-semibold font-mono", valueColor)}>{value}</p>
              </div>
            ))}
          </section>

          {/* Status Changer */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">sync_alt</span>Update Status
            </h3>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={s === project.status || statusLoading}
                  className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all", s === project.status ? "bg-primary/20 text-primary border border-primary/30 cursor-default" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant/20 hover:text-on-surface")}
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </section>

          {/* Financial Ledger */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Financial Ledger</h3>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">payments</span>
            </div>
            <div className="bg-surface p-5 rounded-xl space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-medium">Total Contract</p>
                  <p className="text-2xl font-mono font-medium">${(project.totalPayment || 0).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-amber-400 uppercase font-medium">Remaining</p>
                  <p className="text-lg font-mono text-amber-400">${((project.totalPayment || 0) - (project.currentPayment || 0)).toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-container to-primary transition-all duration-700 rounded-full" style={{ width: `${payPct}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-on-surface-variant uppercase">
                  <span>Paid: ${(project.currentPayment || 0).toLocaleString()}</span>
                  <span className="text-primary">{payPct}%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Platform Links */}
          {(project.figmaLink || project.docsLink || project.telegramLink) && (
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Quick Links</h3>
              <div className="flex flex-wrap gap-2">
                {project.figmaLink && <a href={project.figmaLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-low border border-outline-variant/20 rounded-lg text-[11px] font-bold text-primary hover:bg-surface-container transition-colors"><span className="material-symbols-outlined text-[14px]">design_services</span>Figma</a>}
                {project.docsLink && <a href={project.docsLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-low border border-outline-variant/20 rounded-lg text-[11px] font-bold text-tertiary hover:bg-surface-container transition-colors"><span className="material-symbols-outlined text-[14px]">description</span>Docs</a>}
                {project.telegramLink && <a href={project.telegramLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-low border border-outline-variant/20 rounded-lg text-[11px] font-bold text-secondary hover:bg-surface-container transition-colors"><span className="material-symbols-outlined text-[14px]">telegram</span>Telegram</a>}
              </div>
            </section>
          )}

          {/* Team Members */}
          {project.members?.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Assigned Crew</h3>
              <div className="space-y-2">
                {project.members.map((m: any) => (
                  <div key={m.id || m.userId} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant/10">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">
                      {m.user?.displayName?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{m.user?.displayName}</p>
                      <p className="text-[10px] font-mono text-primary">{m.roleInProject?.replace(/_/g, " ")}</p>
                    </div>
                    {m.kpiOverride != null && (
                      <span className="text-[10px] font-mono text-secondary">{m.kpiOverride}%</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Activity Log */}
          {project.activities?.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Mission Logs</h3>
              <div className="relative border-l border-outline-variant/30 ml-2 pl-5 space-y-5">
                {project.activities.slice(0, 5).map((a: any, i: number) => (
                  <div key={a.id || i} className="relative">
                    <span className={cn("absolute -left-[25px] top-1 w-2 h-2 rounded-full", i === 0 ? "bg-primary shadow-[0_0_8px_rgba(124,58,237,0.6)]" : "bg-outline-variant")}></span>
                    <p className="text-xs font-semibold text-on-surface">{a.action}</p>
                    <p className="text-[10px] font-mono text-on-surface-variant uppercase mt-1">
                      {new Date(a.createdAt).toLocaleDateString()} · {a.user?.displayName || "System"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Remark */}
          {project.remark && (
            <section className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
              <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">Remark</p>
              <p className="text-sm text-on-surface-variant leading-relaxed">{project.remark}</p>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="p-6 pt-4 border-t border-outline-variant/10 bg-surface-container-highest flex gap-3">
          <button className="flex-1 h-11 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl font-bold text-sm tracking-tight transition-all active:scale-95 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">edit</span>Edit Project
          </button>
          <button onClick={onClose} className="px-4 h-11 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </footer>
      </div>
    </>
  );
}
