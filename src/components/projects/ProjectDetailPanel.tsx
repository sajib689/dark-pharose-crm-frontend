"use client";

import { useState } from "react";
import StatusPill from "@/components/ui/StatusPill";
import { useUpdateProjectStatusMutation, useUpdateProjectMutation } from "@/lib/store/api";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import CopyToClipboard from "@/components/ui/CopyToClipboard";

const STATUSES = ["NEW_PROJECT", "WIP", "REVISION", "DELIVERED", "PUBLISHING", "COMPLETED", "CANCEL"];

interface Props { project: any | null; onClose: () => void; }

export default function ProjectDetailPanel({ project: initialProject, onClose }: Props) {
  const [updateStatus, { isLoading: statusLoading }] = useUpdateProjectStatusMutation();
  const [updateProject, { isLoading: updateLoading }] = useUpdateProjectMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<any>(null);

  if (!initialProject) return null;

  const project = isEditing ? editedProject : initialProject;
  const days = project.daysRemaining ?? 0;
  const daysColor = days < 0 ? "text-error" : days <= 3 ? "text-orange-400" : "text-green-400";
  const payPct = project.totalPayment > 0 ? Math.round(((project.currentPayment || 0) / project.totalPayment) * 100) : 0;

  const handleStatusChange = async (status: string) => {
    try { 
      await updateStatus({ id: project.id, status }).unwrap(); 
      toast.success(`Mission status updated to ${status.replace(/_/g, " ")}`);
    }
    catch (e) { 
      toast.error("Failed to reconfigure mission status.");
    }
  };

  const handleStartEdit = () => {
    setEditedProject({ ...initialProject });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateProject({ id: project.id, data: editedProject }).unwrap();
      toast.success("Mission parameters successfully re-synchronized.");
      setIsEditing(false);
    } catch (e) {
      toast.error("Critical error while updating mission payload.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-surface-container-high shadow-2xl z-50 flex flex-col border-l border-outline-variant/20">
        
        {/* Header */}
        <header className="p-7 pb-5 space-y-3 border-b border-outline-variant/10">
          <div className="flex justify-between items-start">
            <div className="space-y-1 flex-1 min-w-0">
              {isEditing ? (
                <input 
                  className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-1 font-headline text-xl font-bold w-full outline-none focus:border-primary"
                  value={editedProject.clientName}
                  onChange={(e) => setEditedProject({ ...editedProject, clientName: e.target.value })}
                />
              ) : (
                <h2 className="font-headline text-2xl font-bold tracking-tighter text-on-surface truncate">{project.clientName}</h2>
              )}
              <CopyToClipboard text={project.orderId}>
                <p className="font-mono text-xs text-violet-400/80 tracking-widest">#{project.orderId}</p>
              </CopyToClipboard>
            </div>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors ml-3 shrink-0">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">close</span>
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <StatusPill status={project.status} />
            <span className={cn("px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1", project.priority === "HIGH" ? "bg-error/15 text-error" : "bg-secondary/15 text-secondary")}>
              {project.priority}
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-7 space-y-7 py-6">
          {isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-outline mb-1 block">Phase</label>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                    value={editedProject.phase}
                    onChange={(e) => setEditedProject({ ...editedProject, phase: e.target.value })}
                  />
                </div>
                <div>
                   <label className="text-[10px] font-bold uppercase text-outline mb-1 block">Platform</label>
                   <select 
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                    value={editedProject.platform}
                    onChange={(e) => setEditedProject({ ...editedProject, platform: e.target.value })}
                  >
                    <option value="WEB">WEB</option>
                    <option value="APP">APP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-outline mb-1 block">Contract Total ($)</label>
                  <input 
                    type="number"
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary font-mono"
                    value={editedProject.totalPayment}
                    onChange={(e) => setEditedProject({ ...editedProject, totalPayment: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-outline mb-1 block">Received ($)</label>
                  <input 
                    type="number"
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary font-mono"
                    value={editedProject.currentPayment}
                    onChange={(e) => setEditedProject({ ...editedProject, currentPayment: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-outline mb-1 block">Delivery Deadline</label>
                <input 
                  type="date"
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  value={editedProject.deliveryDate ? new Date(editedProject.deliveryDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditedProject({ ...editedProject, deliveryDate: e.target.value })}
                />
              </div>

               <div>
                <label className="text-[10px] font-bold uppercase text-outline mb-1 block">Mission Remarks</label>
                <textarea 
                  rows={4}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                  value={editedProject.remark || ''}
                  onChange={(e) => setEditedProject({ ...editedProject, remark: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <>
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

              <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">Mission Resources</h3>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: "Figma Design", value: project.figmaLink, icon: "drawing_flute" },
                    { label: "Mission Docs", value: project.docsLink, icon: "description" },
                    { label: "Telegram Ops", value: project.telegramLink, icon: "send" },
                  ].filter(r => r.value).map(r => (
                    <div key={r.label} className="flex items-center justify-between p-3 bg-surface-container rounded-xl border border-outline-variant/10 group/link">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[18px]">{r.icon}</span>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-on-surface-variant/60">{r.label}</p>
                          <a href={r.value} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary hover:underline truncate max-w-[200px] block">
                            {r.value}
                          </a>
                        </div>
                      </div>
                      <CopyToClipboard text={r.value} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </div>
                  ))}
                  {(!project.figmaLink && !project.docsLink && !project.telegramLink) && (
                    <p className="text-[11px] font-mono text-on-surface-variant/40 italic px-1">No operational links registered.</p>
                  )}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={s === project.status || statusLoading}
                      className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all", s === project.status ? "bg-primary/20 text-primary border border-primary/30" : "bg-surface-container text-on-surface-variant border border-outline-variant/20")}
                    >
                      {s.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-surface p-5 rounded-xl space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase font-medium">Total Contract</p>
                    <CopyToClipboard text={project.totalPayment?.toString()}>
                      <p className="text-2xl font-mono font-medium">${(project.totalPayment || 0).toLocaleString()}</p>
                    </CopyToClipboard>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-orange-400 uppercase font-bold">Remaining</p>
                    <p className="text-sm font-mono text-orange-400">${(project.remainingPayment || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-700" style={{ width: `${payPct}%` }} />
                </div>
              </section>

              {project.remark && (
                <section className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">Remark</p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{project.remark}</p>
                </section>
              )}
            </>
          )}
        </div>

        <footer className="p-6 pt-4 border-t border-outline-variant/10 bg-surface-container-highest flex gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={handleSaveEdit}
                disabled={updateLoading}
                className="flex-1 h-11 bg-emerald-600 text-white rounded-xl font-bold text-sm tracking-tight transition-all active:scale-95 disabled:opacity-50"
              >
                {updateLoading ? "Saving..." : "Commit Changes"}
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 h-11 bg-surface-container-low border border-outline-variant/30 text-on-surface-variant rounded-xl font-bold text-sm"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleStartEdit}
                className="flex-1 h-11 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl font-bold text-sm tracking-tight transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>Edit Mission
              </button>
              <button onClick={onClose} className="px-4 h-11 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface-variant active:scale-95">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </>
          )}
        </footer>
      </div>
    </>
  );
}
