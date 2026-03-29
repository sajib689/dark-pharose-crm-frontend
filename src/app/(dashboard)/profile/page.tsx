"use client";
export const dynamic = 'force-dynamic';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  useGetUserProfileQuery,
  useUpdateUserProfileMutation
} from "@/lib/store/api";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export default function ProfilePage() {
  const { data: session } = useSession();
  const { data: profileData, isLoading: fetchLoading } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: updateLoading }] = useUpdateUserProfileMutation();

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });

  // Sync state with fetched data
  useEffect(() => {
    if (profileData?.user) {
      setName(profileData.user.name || "");
      setDisplayName(profileData.user.displayName || "");
      setPhone(profileData.user.phone || "");
    } else if (session?.user) {
      setName(session.user.name || "");
      setDisplayName(session.user.displayName || "");
      setPhone(session.user.phone || "");
    }
  }, [profileData, session]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ 
        name, 
        displayName, 
        phone 
      }).unwrap();
      setMessage({ text: "✅ Profile synchronization complete.", type: 'success' });
      setTimeout(() => setMessage({ text: '', type: null }), 3000);
    } catch {
      setMessage({ text: "❌ Failed to synchronize profile data.", type: 'error' });
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const user = profileData?.user || session?.user;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-headline tracking-tighter text-slate-100">
            Operative Profile
          </h1>
          <p className="text-violet-400/70 text-sm font-mono mt-2 uppercase tracking-widest">
            Security Clearance: {user?.role?.replace(/_/g, " ")}
          </p>
        </div>
        <div className="flex items-center gap-4 bg-slate-800/40 p-1.5 rounded-full border border-slate-700/50 pr-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {user?.displayName?.charAt(0) || user?.name?.charAt(0) || "?"}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-100">{user?.displayName}</p>
            <p className="text-[10px] font-mono text-violet-400/60 uppercase tracking-tight">Active Duty</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleUpdate} className="bg-slate-900/50 rounded-[2rem] border border-slate-800 p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
            
            <div className="flex items-center gap-3 mb-10">
              <span className="material-symbols-outlined text-primary text-[28px]">shield_person</span>
              <h2 className="text-lg font-bold font-headline text-slate-100">Identity Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono ml-1">Legal Designation</label>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px] group-focus-within/input:text-primary transition-colors">badge</span>
                  <input
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono ml-1">Tactical Callsign</label>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px] group-focus-within/input:text-primary transition-colors">alternate_email</span>
                  <input
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display Name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono ml-1">Secure Comms Line</label>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px] group-focus-within/input:text-primary transition-colors">call</span>
                  <input
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="space-y-2 opacity-60">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono ml-1">Data Feed Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-[20px]">lock</span>
                  <div className="w-full bg-slate-950/30 border border-slate-800/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-500 cursor-not-allowed">
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex items-center justify-between gap-6 border-t border-slate-800/50 pt-8">
              <div className="min-h-[1.5rem]">
                {message.text && (
                  <p className={cn(
                    "text-xs font-mono animate-in slide-in-from-left-4 fade-in duration-300", 
                    message.type === 'success' ? "text-teal-400" : "text-red-400"
                  )}>
                    {message.text}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={updateLoading}
                className="group relative px-10 py-3.5 bg-primary text-white rounded-2xl text-xs font-bold font-headline uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale overflow-hidden shadow-xl shadow-primary/20"
              >
                <span className="relative z-10">{updateLoading ? "Synchronizing..." : "Sync Profile"}</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 rounded-[2rem] border border-slate-800 p-6 shadow-xl space-y-6">
            <h3 className="text-xs font-bold font-headline text-slate-400 uppercase tracking-widest">Account Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">Status</span>
                <span className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-[10px] font-bold uppercase border border-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  Active Operative
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">Member ID</span>
                <span className="text-xs text-slate-300 font-mono">#{user?.id?.slice(-6).toUpperCase() || "PH-001"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">Join Date</span>
                <span className="text-xs text-slate-300">Mar 2026</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all border border-slate-700/50 hover:border-red-500/20">
                <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                Reset Credentials
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-600/20 to-primary/10 rounded-[2rem] border border-violet-500/20 p-6 shadow-xl relative overflow-hidden">
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] text-violet-500/10 -rotate-12">verified_user</span>
            <h3 className="text-xs font-bold font-headline text-violet-300 uppercase tracking-widest mb-2">Secure Node</h3>
            <p className="text-[11px] text-violet-400/80 leading-relaxed">
              Your connection is monitored and encrypted via Pharos Secure Node. Ensure your tactical callsign is kept updated for mission logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
