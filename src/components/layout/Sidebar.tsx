"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const ALL_NAV = [
  { icon: "dashboard", label: "Dashboard", href: "/dashboard", roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] },
  { icon: "person_pin", label: "My Dashboard", href: "/member-dashboard", roles: ["FRONTEND_DEV", "UI_UX_DESIGNER", "BACKEND_DEV"] },
  { icon: "inventory_2", label: "Projects", href: "/projects", roles: [] },
  { icon: "group", label: "Team Members", href: "/team", roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] },
  { icon: "payments", label: "KPI Management", href: "/kpi", roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] },
  { icon: "account_balance_wallet", label: "My Earnings", href: "/kpi", roles: ["FRONTEND_DEV", "UI_UX_DESIGNER", "BACKEND_DEV"] },
  { icon: "insert_chart", label: "Reports", href: "/reports", roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] },
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
              <p className="text-[12px] font-bold text-slate-100 truncate">{session.user.displayName}</p>
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
