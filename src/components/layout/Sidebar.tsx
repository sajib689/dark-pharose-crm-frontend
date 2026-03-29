"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const ALL_NAV = [
  { icon: "dashboard", label: "Dashboard", href: "/dashboard", roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] },
  { icon: "person_pin", label: "My Dashboard", href: "/member-dashboard", roles: ["FRONTEND_DEV", "UI_UX_DESIGNER", "BACKEND_DEV", "APP_DEV"] },
  { icon: "inventory_2", label: "Projects", href: "/projects", roles: [] },
  { icon: "group", label: "Team Members", href: "/team", roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] },
  { icon: "payments", label: "KPI Management", href: "/kpi", roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] },
  { icon: "account_balance_wallet", label: "My Earnings", href: "/kpi", roles: ["FRONTEND_DEV", "UI_UX_DESIGNER", "BACKEND_DEV", "APP_DEV"] },
  { icon: "insert_chart", label: "Reports", href: "/reports", roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] },
  { icon: "event_note", label: "Daily Logs", href: "/reports/daily-logs", roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] },
  { icon: "notifications", label: "Notifications", href: "/notifications", roles: [] },
  { icon: "settings", label: "Settings", href: "/settings", roles: [] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role || "";

  const navItems = ALL_NAV.filter(item =>
    item.roles.length === 0 || item.roles.includes(role)
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-slate-900 flex flex-col border-r border-violet-500/5 z-50">
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center text-white font-black font-headline text-xl shadow-lg shadow-primary/20">
            P
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-slate-100 font-headline leading-tight">Pharos Command</h1>
            <p className="text-[10px] font-mono text-violet-400/70 uppercase tracking-widest">FSD CRM</p>
          </div>
        </div>

        {/* User Badge */}
        {session?.user && (
          <div className="mb-4 px-3 py-2.5 bg-slate-800/60 rounded-xl flex items-center gap-3 border border-slate-700/40">
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[11px] font-bold text-primary">
              {session.user.displayName?.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[12px] font-bold text-slate-100 truncate">{session.user.displayName}</p>
                {(session.user as any).employeeId && (
                  <span className="text-[9px] font-mono text-primary/80 font-bold tracking-tighter">#{(session.user as any).employeeId}</span>
                )}
                {(session.user as any).githubUsername && (
                  <a 
                    href={`https://github.com/${(session.user as any).githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                    title={`GitHub: @${(session.user as any).githubUsername}`}
                  >
                    <svg className="w-2.5 h-2.5 fill-violet-400/60 hover:fill-primary transition-colors" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                )}
              </div>
              <p className="text-[9px] font-mono text-violet-400/60 uppercase tracking-wider truncate">{role.replace(/_/g, " ")}</p>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0 shadow-[0_0_6px_rgba(74,222,128,0.6)]"></span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200",
                isActive
                  ? "text-violet-200 bg-violet-500/15 border border-violet-500/20 shadow-[0_0_12px_rgba(124,58,237,0.1)]"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
              )}
            >
              <span className={cn("material-symbols-outlined text-[20px]", isActive ? "text-violet-300" : "")}>
                {item.icon}
              </span>
              <span className="text-[13px] font-medium font-headline">{item.label}</span>
              {isActive && <span className="ml-auto w-1 h-4 rounded-full bg-primary"></span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 space-y-0.5 border-t border-slate-800">
        <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-all duration-200">
          <span className="material-symbols-outlined text-[20px]">account_circle</span>
          <span className="text-[13px] font-medium font-headline">Profile</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-[13px] font-medium font-headline">Logout</span>
        </button>
      </div>
    </aside>
  );
}
