"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import NewProjectModal from "@/components/projects/NewProjectModal";
import { useSyncProjectsMutation } from "@/lib/store/api";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showNewProject, setShowNewProject] = useState(false);
  const [syncProjects, { isLoading: isSyncing }] = useSyncProjectsMutation();

  const handleSync = async () => {
    try {
      const res = await syncProjects().unwrap();
      alert(res.message);
    } catch (err: any) {
      alert(err?.data?.message || "Sync failed");
    }
  };

  const pageTitle = (() => {
    const map: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/projects": "Projects",
      "/team": "Team Members",
      "/kpi": "KPI & Earnings",
      "/notifications": "Notifications",
      "/member-dashboard": "My Dashboard",
      "/settings": "Settings",
      "/reports": "Reports",
    };
    return map[pathname] || pathname.split("/").filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" / ");
  })();

  const dateStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }).format(new Date());

  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "PROJECT_MANAGER";

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-violet-500/10 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold tracking-tight font-headline text-on-surface">{pageTitle}</h2>
          <span className="px-3 py-1 bg-surface-container-highest rounded-full text-[11px] font-mono text-violet-400 uppercase tracking-wider">
            {dateStr}
          </span>
        </div>

        <div className="flex items-center gap-5">
          <Link href="/notifications" className="relative group cursor-pointer">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
              notifications
            </span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-slate-950 animate-pulse"></span>
          </Link>

          <span className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors cursor-pointer">
            calendar_today
          </span>

          {isAdmin && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-4 py-2 border border-outline-variant/20 rounded-xl text-[12px] font-bold font-headline text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <span className={cn("material-symbols-outlined text-[18px]", isSyncing && "animate-spin")}>
                {isSyncing ? "progress_activity" : "sync"}
              </span>
              Sync Sheets
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setShowNewProject(true)}
              className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2 rounded-xl text-[13px] font-bold font-headline flex items-center gap-2 hover:scale-[0.98] active:scale-95 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Project
            </button>
          )}
        </div>
      </header>

      {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} />}
    </>
  );
}
