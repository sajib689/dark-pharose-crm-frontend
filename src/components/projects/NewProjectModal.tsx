"use client";

import { useState } from "react";
import { useCreateProjectMutation, useGetTeamQuery, useGetKpiSettingsQuery } from "@/lib/store/api";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const PHASES = [
  { label: "Discovery", value: "DISCOVERY" },
  { label: "Design", value: "DESIGN" },
  { label: "Development", value: "DEVELOPMENT" },
  { label: "Testing", value: "TESTING" },
  { label: "Deployment", value: "DEPLOYMENT" },
  { label: "Maintenance", value: "MAINTENANCE" },
  { label: "Full Project", value: "FULL" },
  { label: "First Phase", value: "FIRST" },
  { label: "Second Phase", value: "SECOND" },
  { label: "Third Phase", value: "THIRD" },
];
const PLATFORMS = [
  { label: "Fiverr", value: "FIVERR" },
  { label: "Upwork", value: "UPWORK" },
  { label: "Direct Client", value: "DIRECT" },
  { label: "Other", value: "OTHER" },
  { label: "Web Project", value: "WEB" },
  { label: "App Project", value: "APP" },
];
const ROLES = ["FRONTEND_DEV", "UI_UX_DESIGNER", "BACKEND_DEV", "APP_DEV", "PROJECT_MANAGER"];

interface Props { onClose: () => void; }

export default function NewProjectModal({ onClose }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<any>({
    clientName: "", profileName: "", orderId: "", platform: "FIVERR",
    phase: "DEVELOPMENT", priority: "HIGH", status: "NEW_PROJECT",
    incomingDate: new Date().toISOString().split("T")[0],
    deliveryDate: "", totalPayment: "", currentPayment: "0",
    figmaLink: "", docsLink: "", telegramLink: "", remark: "",
    needUpdate: false, isAddOn: false, members: [],
  });
  const [memberInput, setMemberInput] = useState({ userId: "", roleInProject: "FRONTEND_DEV" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: team = [] } = useGetTeamQuery();
  const { data: kpiData } = useGetKpiSettingsQuery();
  const [createProject, { isLoading }] = useCreateProjectMutation();

  const kpiSettings = kpiData?.settings;
  const fePct = kpiSettings?.frontendPct ?? 43;
  const bePct = kpiSettings?.backendPct ?? 32;
  const uiPct = kpiSettings?.uiuxPct ?? 25;
  const appPct = kpiSettings?.appDevPct ?? 0;

  const set = (field: string, value: any) => setForm((prev: any) => ({ ...prev, [field]: value }));

  const validate = (currentStep: number) => {
    const e: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!form.clientName.trim()) e.clientName = "Required";
      if (!form.orderId.trim()) e.orderId = "Required";
      if (!form.deliveryDate) e.deliveryDate = "Required";
    }

    if (currentStep === 2) {
      if (!form.totalPayment || isNaN(+form.totalPayment)) e.totalPayment = "Must be a number";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addMember = () => {
    if (!memberInput.userId) return;
    if (form.members.some((m: any) => m.userId === memberInput.userId)) return;
    set("members", [...form.members, { ...memberInput }]);
    setMemberInput({ userId: "", roleInProject: "FRONTEND_DEV" });
  };

  const removeMember = (id: string) =>
    set("members", form.members.filter((m: any) => m.userId !== id));

  const handleSubmit = async () => {
    // Validate all required steps before final submission
    if (!validate(1) || !validate(2)) return;
    try {
      await createProject(form).unwrap();
      onClose();
    } catch (e: any) {
      alert(e?.data?.message || "Failed to create project");
    }
  };

  const getMemberName = (id: string) =>
    (team as any[]).find((u: any) => u.id === id)?.displayName || id;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-surface-container-low rounded-2xl border border-outline-variant/20 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
          <div>
            <h2 className="text-xl font-bold font-headline text-on-surface">🚀 New Mission Brief</h2>
            <p className="text-xs text-on-surface-variant font-mono mt-0.5">Step {step} of 3 — {["Project Details", "Payment & Links", "Assign Team"][step - 1]}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-surface-container-highest flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">close</span>
          </button>
        </div>

        {/* Step Progress */}
        <div className="flex px-6 pt-4 gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={cn("flex-1 h-1 rounded-full transition-all", s <= step ? "bg-primary" : "bg-surface-container-highest")} />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── STEP 1: Project Details ── */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Client Name *" error={errors.clientName}>
                  <input className={inputCls(errors.clientName)} value={form.clientName} onChange={e => set("clientName", e.target.value)} placeholder="e.g. Vanguard Corp" />
                </Field>
                <Field label="Platform Profile">
                  <input className={inputCls()} value={form.profileName} onChange={e => set("profileName", e.target.value)} placeholder="e.g. vanguard_corp" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Order / Ref ID *" error={errors.orderId}>
                  <input className={inputCls(errors.orderId)} value={form.orderId} onChange={e => set("orderId", e.target.value)} placeholder="e.g. ORD-2026-001" />
                </Field>
                <Field label="Platform">
                  <select className={inputCls()} value={form.platform} onChange={e => set("platform", e.target.value)}>
                    {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Phase">
                  <select className={inputCls()} value={form.phase} onChange={e => set("phase", e.target.value)}>
                    {PHASES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </Field>
                <Field label="Priority">
                  <select className={inputCls()} value={form.priority} onChange={e => set("priority", e.target.value)}>
                    <option value="HIGH">🔴 HIGH</option>
                    <option value="MEDIUM">🟡 MEDIUM</option>
                    <option value="LOW">🟢 LOW</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Incoming Date">
                  <input type="date" className={inputCls()} value={form.incomingDate} onChange={e => set("incomingDate", e.target.value)} />
                </Field>
                <Field label="Delivery Date *" error={errors.deliveryDate}>
                  <input type="date" className={inputCls(errors.deliveryDate)} value={form.deliveryDate} onChange={e => set("deliveryDate", e.target.value)} />
                </Field>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-primary" checked={form.needUpdate} onChange={e => set("needUpdate", e.target.checked)} />
                  <span className="text-sm text-on-surface-variant">Needs Update</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-primary" checked={form.isAddOn} onChange={e => set("isAddOn", e.target.checked)} />
                  <span className="text-sm text-on-surface-variant">Is Add-On</span>
                </label>
              </div>
            </>
          )}

          {/* ── STEP 2: Payment & Links ── */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Total Contract ($) *" error={errors.totalPayment}>
                  <input type="number" className={inputCls(errors.totalPayment)} value={form.totalPayment} onChange={e => set("totalPayment", e.target.value)} placeholder="e.g. 2500" />
                </Field>
                <Field label="Received So Far ($)">
                  <input type="number" className={inputCls()} value={form.currentPayment} onChange={e => set("currentPayment", e.target.value)} placeholder="e.g. 1250" />
                </Field>
              </div>
              <Field label="Figma Link">
                <input className={inputCls()} value={form.figmaLink} onChange={e => set("figmaLink", e.target.value)} placeholder="https://figma.com/..." />
              </Field>
              <Field label="Docs / Drive Link">
                <input className={inputCls()} value={form.docsLink} onChange={e => set("docsLink", e.target.value)} placeholder="https://docs.google.com/..." />
              </Field>
              <Field label="Telegram Group Link">
                <input className={inputCls()} value={form.telegramLink} onChange={e => set("telegramLink", e.target.value)} placeholder="https://t.me/..." />
              </Field>
              <Field label="Remark / Notes">
                <textarea className={cn(inputCls(), "min-h-[80px] resize-none")} value={form.remark} onChange={e => set("remark", e.target.value)} placeholder="Any additional notes..." />
              </Field>
            </>
          )}

          {/* ── STEP 3: Assign Team ── */}
          {step === 3 && (
            <>
              <div className="flex gap-3">
                <div className="flex-1">
                  <select className={inputCls()} value={memberInput.userId} onChange={e => setMemberInput(p => ({ ...p, userId: e.target.value }))}>
                    <option value="">Select team member...</option>
                    {(team as any[]).filter((u: any) => u.isActive).map((u: any) => (
                      <option key={u.id} value={u.id}>{u.displayName} ({u.role.replace(/_/g, " ")})</option>
                    ))}
                  </select>
                </div>
                <select className="bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 outline-none" value={memberInput.roleInProject} onChange={e => setMemberInput(p => ({ ...p, roleInProject: e.target.value }))}>
                  {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
                </select>
                <button onClick={addMember} className="px-4 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors">
                  Add
                </button>
              </div>

              {form.members.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-on-surface-variant font-mono uppercase tracking-widest">Assigned Crew:</p>
                  {form.members.map((m: any) => (
                    <div key={m.userId} className="flex items-center justify-between bg-surface-container rounded-lg px-4 py-3">
                      <div>
                        <p className="text-sm font-bold font-headline">{getMemberName(m.userId)}</p>
                        <p className="text-[10px] font-mono text-primary">{m.roleInProject.replace(/_/g, " ")}</p>
                      </div>
                      <button onClick={() => removeMember(m.userId)} className="text-error/60 hover:text-error transition-colors text-xs">
                        <span className="material-symbols-outlined text-[18px]">remove_circle</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 border border-dashed border-outline-variant/30 rounded-xl text-center text-on-surface-variant text-sm">
                  No team members assigned yet. KPI will be calculated automatically based on roles.
                </div>
              )}

              {/* KPI Preview */}
              {form.totalPayment && form.members.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono font-bold text-primary uppercase tracking-widest">💡 Dynamic KPI Distribution</p>
                    <span className="text-[10px] font-mono text-primary/60 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">System Alpha</span>
                  </div>
                  <div className="space-y-3">
                    {form.members.map((m: any) => {
                      let pct = 0;
                      if (m.roleInProject === "FRONTEND_DEV") pct = fePct;
                      else if (m.roleInProject === "BACKEND_DEV") pct = bePct;
                      else if (m.roleInProject === "UI_UX_DESIGNER") pct = uiPct;
                      else if (m.roleInProject === "APP_DEV") pct = appPct;
                      
                      const amount = (parseFloat(form.totalPayment || "0") * pct) / 100;
                      
                      return (
                        <div key={m.userId} className="flex items-center justify-between border-b border-primary/10 pb-2 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-sm font-bold text-on-surface">{getMemberName(m.userId)}</span>
                            <span className="text-[10px] text-on-surface-variant uppercase font-mono bg-surface-container px-2 py-0.5 rounded-md">{pct}%</span>
                          </div>
                          <span className="font-mono text-sm font-bold text-primary">${amount.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
                    * Amounts are projected based on the <span className="text-primary font-bold">Global Calculation Matrix</span> and will be formally assigned to operative accounts upon deployment.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 border-t border-outline-variant/10">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="px-6 py-2.5 rounded-xl border border-outline-variant/20 text-on-surface-variant text-sm font-bold hover:bg-surface-container transition-colors">
              ← Back
            </button>
          )}
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-on-surface-variant text-sm hover:text-on-surface transition-colors ml-auto">
            Cancel
          </button>
          {step < 3 ? (
            <button
              onClick={() => {
                if (!validate(step)) return;
                setStep((s) => s + 1);
              }}
              className="px-8 py-2.5 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl text-sm font-bold hover:scale-[0.98] transition-all"
            >
              Next →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isLoading} className="px-8 py-2.5 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl text-sm font-bold hover:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {isLoading ? (
                <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Creating...</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">rocket_launch</span> Deploy Mission</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</label>
      {children}
      {error && <p className="text-[11px] text-error font-mono">{error}</p>}
    </div>
  );
}

function inputCls(error?: string) {
  return cn(
    "w-full bg-surface-container border rounded-lg px-3 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 outline-none transition-all",
    error ? "border-error/50 focus:ring-error/30" : "border-outline-variant/20"
  );
}
