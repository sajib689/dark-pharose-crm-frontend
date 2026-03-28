"use client";

import { useState } from "react";
import { useCreateTeamMemberMutation } from "@/lib/store/api";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface Props { onClose: () => void; }

const ROLES = [
  { label: "Project Manager", value: "PROJECT_MANAGER" },
  { label: "Frontend Dev", value: "FRONTEND_DEV" },
  { label: "UI/UX Designer", value: "UI_UX_DESIGNER" },
  { label: "Backend Dev", value: "BACKEND_DEV" },
];

export default function NewMemberModal({ onClose }: Props) {
  const [form, setForm] = useState({
    email: "",
    displayName: "",
    role: "FRONTEND_DEV",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const [createMember, { isLoading }] = useCreateTeamMemberMutation();

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const pass = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setForm(p => ({ ...p, password: pass }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = "Required";
    if (!form.displayName.trim()) e.displayName = "Required";
    if (form.password.length < 6) e.password = "Min 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await createMember(form).unwrap();
      onClose();
    } catch (err: any) {
      alert(err?.data?.message || "Failed to invite member");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface-container-low rounded-2xl border border-outline-variant/20 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/10">
          <h2 className="text-xl font-bold font-headline text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person_add</span>
            Invite New Operative
          </h2>
          <p className="text-xs text-on-surface-variant font-mono mt-0.5 uppercase tracking-widest">Expansion Protocol engaged</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Display Name</label>
            <input
              className={inputCls(errors.displayName)}
              value={form.displayName}
              onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))}
              placeholder="e.g. John Doe"
            />
            {errors.displayName && <p className="text-[10px] text-error font-mono">{errors.displayName}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Email Address</label>
            <input
              type="email"
              className={inputCls(errors.email)}
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="operative@darkpharos.com"
            />
            {errors.email && <p className="text-[10px] text-error font-mono">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">System Role</label>
            <select
              className={inputCls()}
              value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
            >
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant flex justify-between">
              Initial Password
              <button onClick={generatePassword} className="text-primary hover:underline lowercase font-mono">Generate</button>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={inputCls(errors.password)}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Secure access key"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-error font-mono">{errors.password}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-outline-variant/10 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-outline-variant/20 text-on-surface-variant text-sm font-bold hover:bg-surface-container transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-[2] py-2.5 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl text-sm font-bold hover:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? "Engaging..." : "Invite Agent"}
          </button>
        </div>
      </div>
    </div>
  );
}

function inputCls(error?: string) {
  return cn(
    "w-full bg-surface-container border rounded-lg px-3 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 outline-none transition-all font-mono",
    error ? "border-error/50 focus:ring-error/30" : "border-outline-variant/20"
  );
}
