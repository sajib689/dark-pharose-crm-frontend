"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Status = "WIP" | "DELIVERED" | "REVISION" | "CANCEL" | "PUBLISHING" | "COMPLETED" | "NEW_PROJECT";

interface StatusPillProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { pill: string; dot: string; label: string }> = {
  WIP:         { pill: "bg-amber-500/15 text-amber-400",   dot: "bg-amber-400",   label: "WIP" },
  DELIVERED:   { pill: "bg-emerald-500/15 text-emerald-400", dot: "bg-emerald-400", label: "DELIVERED" },
  REVISION:    { pill: "bg-orange-500/15 text-orange-400", dot: "bg-orange-400",   label: "REVISION" },
  CANCEL:      { pill: "bg-red-500/15 text-red-400",       dot: "bg-red-400",     label: "CANCEL" },
  PUBLISHING:  { pill: "bg-blue-500/15 text-blue-400",     dot: "bg-blue-400",    label: "PUBLISHING" },
  COMPLETED:   { pill: "bg-teal-500/15 text-teal-400",     dot: "bg-teal-400",    label: "COMPLETED" },
  NEW_PROJECT: { pill: "bg-violet-500/15 text-violet-400", dot: "bg-violet-400",  label: "NEW PROJECT" },
};

const DEFAULT_CONFIG = { pill: "bg-slate-500/15 text-slate-400", dot: "bg-slate-400", label: "" };

export default function StatusPill({ status, className }: StatusPillProps) {
  const cfg = statusConfig[status] || DEFAULT_CONFIG;
  const label = cfg.label || status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "px-2 py-1 rounded text-[10px] uppercase font-bold tracking-tighter inline-flex items-center gap-1.5",
        cfg.pill,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", cfg.dot)} />
      {label}
    </span>
  );
}
