"use client";

import { useGetTeamQuery, useDeleteTeamMemberMutation, useToggleMemberStatusMutation } from "@/lib/store/api";
import { useState } from "react";
import { useSession } from "next-auth/react";
import NewMemberModal from "@/components/team/NewMemberModal";
import MemberProfileModal from "@/components/team/MemberProfileModal";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-primary/15 border-primary/20 text-primary",
  PROJECT_MANAGER: "bg-secondary/15 border-secondary/20 text-secondary",
  FRONTEND_DEV: "bg-tertiary/15 border-tertiary/20 text-tertiary",
  UI_UX_DESIGNER: "bg-on-primary-container/15 border-on-primary-container/20 text-on-primary-container",
  BACKEND_DEV: "bg-error/15 border-error/20 text-error",
  APP_DEV: "bg-indigo-500/15 border-indigo-500/20 text-indigo-400",
};
const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin", PROJECT_MANAGER: "PM",
  FRONTEND_DEV: "Frontend Dev", UI_UX_DESIGNER: "UI/UX", BACKEND_DEV: "Backend Dev", APP_DEV: "App Dev",
};

export default function TeamPage() {
  const { data: session } = useSession();
  const { data: teamData, isLoading, isError } = useGetTeamQuery();
  const [deleteMember] = useDeleteTeamMemberMutation();
  const [toggleStatus] = useToggleMemberStatusMutation();
  const [showInvite, setShowInvite] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const users = teamData?.teams || teamData?.users || [];
  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "PROJECT_MANAGER";

  const handleDeleteMember = async (id: string) => {
    if (window.confirm("⚠️ IRREVERSIBLE ACTION: Purge this operative from the system?")) {
      try {
        await deleteMember(id).unwrap();
      } catch (err) {
        console.error("Failed to delete member:", err);
        alert("CRITICAL ERROR: Failed to purge operative.");
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleStatus({ id, isActive: !currentStatus }).unwrap();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary/20 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </div>
            <span className="text-primary text-[11px] font-mono tracking-widest uppercase font-bold">Live Operative Feed</span>
          </div>
          <h1 className="text-4xl font-bold font-headline tracking-tighter text-on-surface">
            Team Members <span className="text-outline-variant">({users.length})</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3 overflow-hidden">
            {users.slice(0, 3).map((user: any) => (
              <div key={user.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-surface-container-lowest bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                {user.displayName?.charAt(0)}
              </div>
            ))}
            {users.length > 3 && (
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-surface-container-high ring-2 ring-surface-container-lowest text-[10px] font-bold">+{users.length - 3}</div>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowInvite(true)}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold font-headline text-[13px] flex items-center gap-2 hover:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>Invite Member
            </button>
          )}
        </div>
      </header>
      
      {showInvite && <NewMemberModal onClose={() => setShowInvite(false)} />}
      <MemberProfileModal memberId={selectedMemberId} onClose={() => setSelectedMemberId(null)} />

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 rounded-xl bg-surface-container-low border border-outline-variant/10" />)}
        </div>
      )}

      {isError && (
        <div className="rounded-xl bg-error/5 border border-error/20 p-6 text-center">
          <p className="text-error font-mono text-sm">Failed to load team. Make sure the backend is running.</p>
        </div>
      )}

      {!isLoading && !isError && users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant space-y-3">
          <span className="material-symbols-outlined text-5xl">group_off</span>
          <p className="font-headline text-lg">No team members found</p>
        </div>
      )}

      {!isLoading && users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user: any) => (
            <div key={user.id} className={cn("bg-surface border-l-4 rounded-xl overflow-hidden hover:bg-surface-container-low transition-all duration-300", user.isActive ? "border-primary" : "border-error/50 grayscale opacity-70")}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="relative">
                    <div className={cn("w-16 h-16 rounded-2xl ring-4 bg-surface-container-highest flex items-center justify-center text-xl font-bold font-headline", user.isActive ? "ring-primary/10" : "ring-error/5")}>
                      {user.displayName?.charAt(0)}
                    </div>
                    <div className={cn("absolute -bottom-1 -right-1 w-4 h-4 border-2 border-surface rounded-full", user.isActive ? "bg-green-500" : "bg-error")}></div>
                  </div>
                  <div className={cn("px-3 py-1 border rounded-full", user.isActive ? (ROLE_COLORS[user.role] || ROLE_COLORS.FRONTEND_DEV) : "bg-error/15 border-error/20 text-error")}>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{user.isActive ? (ROLE_LABELS[user.role] || user.role) : "Suspended"}</span>
                  </div>
                </div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold font-headline text-on-surface">{user.displayName}</h2>
                  <p className="text-outline text-xs font-mono">@{user.email?.split("@")[0]}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface-container-lowest p-3 rounded-lg text-center">
                    <p className="text-outline text-[10px] uppercase font-bold mb-1">Active</p>
                    <p className={cn("font-mono font-bold text-sm", user.isActive ? "text-primary" : "text-on-surface-variant")}>{user.activeProjects ?? 0}</p>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-lg text-center">
                    <p className="text-outline text-[10px] uppercase font-bold mb-1">Done</p>
                    <p className="font-mono text-on-surface font-bold text-sm">{user.completedProjects ?? 0}</p>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-lg text-center">
                    <p className="text-outline text-[10px] uppercase font-bold mb-1">Status</p>
                    <p className={cn("font-mono font-bold text-sm", user.isActive ? "text-green-400" : "text-error")}>{user.isActive ? "ON" : "OFF"}</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-surface-container-low/50 flex items-center justify-between">
                {user.isActive ? (
                  <button 
                    onClick={() => setSelectedMemberId(user.id)}
                    className="text-primary text-xs font-bold uppercase tracking-widest hover:text-on-surface transition-colors flex items-center gap-2"
                  >
                    View Profile <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                ) : (
                  <span className="text-error text-[10px] font-bold uppercase tracking-widest">Access Revoked</span>
                )}
                
                {isAdmin && session?.user?.email !== user.email && (
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                      className={cn("text-[18px] material-symbols-outlined transition-colors", user.isActive ? "text-orange-400 hover:text-orange-300" : "text-green-400 hover:text-green-300")}
                      title={user.isActive ? "Suspend Operative" : "Activate Operative"}
                    >
                      {user.isActive ? "block" : "check_circle"}
                    </button>
                    <button 
                      onClick={() => handleDeleteMember(user.id)}
                      className="text-error/40 hover:text-error text-[18px] material-symbols-outlined transition-colors"
                      title="Purge Operative"
                    >
                      delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
