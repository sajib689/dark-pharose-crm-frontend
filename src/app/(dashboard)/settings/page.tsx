"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  useUpdateKpiSettingsMutation, 
  useGetKpiSettingsQuery
} from "@/lib/store/api";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export default function SettingsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "SUPER_ADMIN";

  // KPI Settings State (Admin Only)
  const { data: kpiSettings } = useGetKpiSettingsQuery(undefined, { skip: !isAdmin });
  const [updateKpi, { isLoading: kpiLoading }] = useUpdateKpiSettingsMutation();
  const [frontendPct, setFrontendPct] = useState("");
  const [uiuxPct, setUiuxPct] = useState("");
  const [backendPct, setBackendPct] = useState("");
  const [appDevPct, setAppDevPct] = useState("");
  const [kpiMsg, setKpiMsg] = useState("");

  const handleKpiUpdate = async () => {
    const f = parseFloat(frontendPct || String(kpiSettings?.settings?.frontendPct ?? 43));
    const u = parseFloat(uiuxPct || String(kpiSettings?.settings?.uiuxPct ?? 25));
    const b = parseFloat(backendPct || String(kpiSettings?.settings?.backendPct ?? 32));
    const a = parseFloat(appDevPct || String(kpiSettings?.settings?.appDevPct ?? 0));
    
    if (Math.abs(f + u + b + a - 100) > 0.01) {
      setKpiMsg("Error: Percentages must sum to 100%");
      return;
    }
    try {
      await updateKpi({ frontendPct: f, uiuxPct: u, backendPct: b, appDevPct: a }).unwrap();
      setKpiMsg("✅ KPI settings updated successfully.");
      setTimeout(() => setKpiMsg(""), 3000);
    } catch {
      setKpiMsg("❌ Failed to update KPI settings.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-black font-headline tracking-tighter text-slate-100">System Management</h1>
        <p className="text-violet-400/70 text-sm font-mono mt-2 uppercase tracking-widest">Administrative Hardware Control</p>
      </header>

      {!isAdmin ? (
        <section className="bg-slate-900/50 rounded-[2rem] border border-slate-800 p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <span className="material-symbols-outlined text-[40px]">lock</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-headline text-slate-200">Restricted Access</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              You do not have the required security clearance to modify system-wide parameters. 
              Contact a Super Admin for configuration changes.
            </p>
          </div>
          <p className="text-[10px] font-mono text-violet-500/50 uppercase tracking-[0.3em]">Permission Level Required: SUPER_ADMIN</p>
        </section>
      ) : (
        <div className="space-y-10">
          {/* KPI Settings — Admin Only */}
          <section className="bg-slate-900/50 rounded-[2rem] border border-slate-800 p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors" />
            
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary text-[28px]">analytics</span>
              <h2 className="text-lg font-bold font-headline text-slate-100">KPI Distribution Rules</h2>
            </div>
            
            <p className="text-xs text-slate-400 font-mono mb-8 p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
              Current Allocation: FE <span className="text-primary">{kpiSettings?.settings?.frontendPct ?? 43}%</span> / UI/UX <span className="text-primary">{kpiSettings?.settings?.uiuxPct ?? 25}%</span> / BE <span className="text-primary">{kpiSettings?.settings?.backendPct ?? 32}%</span> / APP <span className="text-primary">{kpiSettings?.settings?.appDevPct ?? 0}%</span>
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Frontend (%)", icon: "code", value: frontendPct, onChange: setFrontendPct, placeholder: String(kpiSettings?.settings?.frontendPct ?? 43) },
                { label: "UI/UX (%)", icon: "brush", value: uiuxPct, onChange: setUiuxPct, placeholder: String(kpiSettings?.settings?.uiuxPct ?? 25) },
                { label: "Backend (%)", icon: "database", value: backendPct, onChange: setBackendPct, placeholder: String(kpiSettings?.settings?.backendPct ?? 32) },
                { label: "App Dev (%)", icon: "smartphone", value: appDevPct, onChange: setAppDevPct, placeholder: String(kpiSettings?.settings?.appDevPct ?? 0) },
              ].map(({ label, icon, value, onChange, placeholder }) => (
                <div key={label} className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-primary/60">{icon}</span>
                    {label}
                  </label>
                  <input
                    type="number"
                    min="0" max="100"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-slate-700"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center justify-between gap-6 border-t border-slate-800/50 pt-8">
              <div className="min-h-[1.5rem]">
                {kpiMsg && (
                  <p className={cn("text-xs font-mono animate-in fade-in duration-300", kpiMsg.startsWith("✅") ? "text-teal-400" : "text-red-400")}>
                    {kpiMsg}
                  </p>
                )}
              </div>
              <button
                onClick={handleKpiUpdate}
                disabled={kpiLoading}
                className="px-8 py-3 bg-primary text-white rounded-xl text-xs font-bold font-headline uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {kpiLoading ? "Saving..." : "Update Distribution"}
              </button>
            </div>
          </section>

          {/* System Info */}
          <section className="bg-slate-900/50 rounded-[2rem] border border-slate-800 p-8 space-y-6">
            <h2 className="text-sm font-bold font-headline uppercase tracking-widest flex items-center gap-2 text-slate-400">
              <span className="material-symbols-outlined text-violet-400 text-[20px]">info</span>
              Core Diagnostics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Platform", val: "Pharos Command FSD CRM" },
                { label: "Version", val: "v1.0.0-alpha" },
                { label: "Core Node", val: "Express + Prisma + MongoDB" },
                { label: "Interface", val: "Next.js 16 + RTK Query" },
              ].map(info => (
                <div key={info.label} className="p-4 bg-slate-950/30 rounded-xl border border-slate-800/50 flex justify-between items-center group/info hover:border-violet-500/20 transition-colors">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{info.label}</span>
                  <span className="text-xs text-slate-300 font-medium group-hover/info:text-violet-400 transition-colors">{info.val}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
