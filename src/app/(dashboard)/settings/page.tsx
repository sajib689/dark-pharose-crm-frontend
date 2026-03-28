"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  useUpdateKpiSettingsMutation, 
  useGetKpiSettingsQuery,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation
} from "@/lib/store/api";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export default function SettingsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "SUPER_ADMIN";

  // Profile State
  const { data: profileData } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: profileLoading }] = useUpdateUserProfileMutation();
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileMsg, setProfileMsg] = useState("");

  const handleProfileUpdate = async () => {
    try {
      await updateProfile({ 
        name: name || profileData?.user?.name, 
        displayName: displayName || profileData?.user?.displayName, 
        phone: phone || profileData?.user?.phone 
      }).unwrap();
      setProfileMsg("✅ Profile updated successfully.");
      setTimeout(() => setProfileMsg(""), 3000);
    } catch {
      setProfileMsg("❌ Failed to update profile.");
    }
  };

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

  const user = profileData?.user || session?.user;

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <header>
        <h1 className="text-4xl font-bold font-headline tracking-tighter text-on-surface">System Settings</h1>
        <p className="text-on-surface-variant text-sm mt-2">Configure Pharos Command system parameters.</p>
      </header>

      {/* Profile Info */}
      <section className="bg-surface rounded-3xl border border-outline-variant/10 p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm font-bold font-headline uppercase tracking-[0.2em] flex items-center gap-3 text-primary">
            <span className="material-symbols-outlined text-[24px]">account_circle</span>
            Operative Credentials
          </h2>
          <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-3 py-1 rounded-full border border-outline-variant/10">Permission Level: {user?.role}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono ml-1">Legal Designation</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">badge</span>
              <input
                className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={user?.name || "Full Name"}
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono ml-1">Tactical Callsign</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">alternate_email</span>
              <input
                className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={user?.displayName || "Display Name"}
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono ml-1">Secure Comms Line</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">call</span>
              <input
                className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={user?.phone || "Phone Number"}
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono ml-1">Data Feed Address</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[18px]">lock</span>
              <div className="w-full bg-surface-container-lowest border border-outline-variant/5 rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface-variant/60 cursor-not-allowed">
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between gap-6 border-t border-outline-variant/10 pt-8">
          <p className={cn("text-xs font-mono transition-all duration-500", profileMsg ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4", profileMsg.startsWith("✅") ? "text-teal-400" : "text-error")}>
            {profileMsg}
          </p>
          <button
            onClick={handleProfileUpdate}
            disabled={profileLoading}
            className="px-8 py-3 bg-primary text-on-primary rounded-xl text-xs font-bold font-headline uppercase tracking-widest hover:scale-110 hover:shadow-xl hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            {profileLoading ? "Synchronizing..." : "Update Credentials"}
          </button>
        </div>
      </section>

      {/* KPI Settings — Admin Only */}
      {isAdmin && (
        <section className="bg-surface rounded-2xl border border-outline-variant/10 p-6 space-y-5">
          <h2 className="text-sm font-bold font-headline uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
            KPI Distribution Settings
          </h2>
          <p className="text-xs text-on-surface-variant font-mono">
            Current: FE {kpiSettings?.settings?.frontendPct ?? 43}% / UI/UX {kpiSettings?.settings?.uiuxPct ?? 25}% / BE {kpiSettings?.settings?.backendPct ?? 32}% / APP {kpiSettings?.settings?.appDevPct ?? 0}%
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Frontend (%)", value: frontendPct, onChange: setFrontendPct, placeholder: String(kpiSettings?.settings?.frontendPct ?? 43) },
              { label: "UI/UX (%)", value: uiuxPct, onChange: setUiuxPct, placeholder: String(kpiSettings?.settings?.uiuxPct ?? 25) },
              { label: "Backend (%)", value: backendPct, onChange: setBackendPct, placeholder: String(kpiSettings?.settings?.backendPct ?? 32) },
              { label: "App Dev (%)", value: appDevPct, onChange: setAppDevPct, placeholder: String(kpiSettings?.settings?.appDevPct ?? 0) },
            ].map(({ label, value, onChange, placeholder }) => (
              <div key={label} className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</label>
                <input
                  type="number"
                  min="0" max="100"
                  className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 outline-none"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
          {kpiMsg && (
            <p className={cn("text-xs font-mono", kpiMsg.startsWith("✅") ? "text-teal-400" : "text-error")}>
              {kpiMsg}
            </p>
          )}
          <button
            onClick={handleKpiUpdate}
            disabled={kpiLoading}
            className="px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl text-sm font-bold hover:scale-[0.98] transition-all disabled:opacity-50"
          >
            {kpiLoading ? "Saving..." : "Update KPI Rules"}
          </button>
        </section>
      )}

      {/* System Info */}
      <section className="bg-surface-container rounded-2xl border border-outline-variant/10 p-6 space-y-3">
        <h2 className="text-sm font-bold font-headline uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
          System Information
        </h2>
        <div className="space-y-2 font-mono text-xs text-on-surface-variant">
          <p>Platform: <span className="text-on-surface">Pharos Command FSD CRM</span></p>
          <p>Version: <span className="text-on-surface">v1.0.0-alpha</span></p>
          <p>Backend: <span className="text-on-surface">Express + Prisma + MongoDB</span></p>
          <p>Frontend: <span className="text-on-surface">Next.js 16 + RTK Query + Tailwind v4</span></p>
        </div>
      </section>
    </div>
  );
}
