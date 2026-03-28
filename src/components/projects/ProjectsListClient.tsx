"use client";

import { useState } from "react";
import StatusPill from "@/components/ui/StatusPill";
import ProjectDetailPanel from "@/components/projects/ProjectDetailPanel";
import { useGetProjectsQuery, useDeleteProjectMutation } from "@/lib/store/api";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const FILTERS = ["ALL", "OVERDUE", "WIP", "DELIVERED", "REVISION", "COMPLETED", "PUBLISHING", "CANCEL"];

export default function ProjectsListClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading } = useGetProjectsQuery({
    search: searchTerm,
    status: activeFilter,
    page,
    limit,
    startDate,
    endDate,
  });

  const [deleteProject] = useDeleteProjectMutation();

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("⚠️ IRREVERSIBLE ACTION: Purge mission data for this record?")) {
      try {
        await deleteProject(id).unwrap();
      } catch (err) {
        console.error("Failed to delete mission:", err);
        alert("CRITICAL ERROR: Failed to purge mission. Check logs.");
      }
    }
  };

  const projects = data?.projects || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search by client or order ID..."
              className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/40 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset to first page on search
              }}
            />
          </div>
          
          {/* Date Range Filter */}
          <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl border border-outline-variant/5">
            <div className="flex items-center gap-2 px-3">
              <span className="text-[10px] font-bold uppercase text-on-surface-variant font-mono">From:</span>
              <input 
                type="date" 
                className="bg-transparent text-xs text-on-surface outline-none border-none p-1"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-[1px] h-4 bg-outline-variant/20" />
            <div className="flex items-center gap-2 px-3">
              <span className="text-[10px] font-bold uppercase text-on-surface-variant font-mono">To:</span>
              <input 
                type="date" 
                className="bg-transparent text-xs text-on-surface outline-none border-none p-1"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(""); setEndDate(""); setPage(1); }}
                className="p-1 hover:text-error transition-colors"
                title="Clear dates"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setPage(1);
              }}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold font-headline transition-all",
                activeFilter === filter
                  ? "bg-primary text-on-primary ring-4 ring-primary/20"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-surface rounded-2xl overflow-hidden border border-outline-variant/10 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low">
            <tr>
              {["Client", "Phase", "Status", "Contract", "Received", "Remaining", "Deadline", "Actions"].map((h, i) => (
                <th key={h} className={cn("px-4 py-4 text-[11px] uppercase tracking-widest text-on-surface-variant font-mono whitespace-nowrap", i === 0 && "px-6", i === 7 && "text-right")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10 text-[13px]">
            {isLoading && [...Array(5)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                {[...Array(8)].map((__, j) => (
                  <td key={j} className="px-4 py-5">
                    <div className="h-5 rounded bg-surface-container-low" />
                  </td>
                ))}
              </tr>
            ))}
            {!isLoading && projects.map((project: any) => {
              const days = project.daysRemaining ?? 99;
              const daysColor = days < 0 ? "text-error" : days <= 3 ? "text-orange-400" : "text-green-400";
              const daysLabel = days < 0 ? `${Math.abs(days)}d Overdue` : `${days}d Left`;
              return (
                <tr
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="hover:bg-surface-container-high transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-[14px] font-mono border border-outline-variant/10">
                        {project.clientName?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-bold font-headline group-hover:text-primary transition-colors">{project.clientName}</p>
                          {project.isAddOn && (
                            <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[9px] font-bold uppercase tracking-widest border border-violet-500/20">Add-On</span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-on-surface-variant uppercase tracking-widest">#{project.orderId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 font-mono text-violet-300/80 text-xs">{project.phase}</td>
                  <td className="px-4 py-5"><StatusPill status={project.status} /></td>
                  <td className="px-4 py-5 font-mono text-on-surface font-bold text-xs">${(project.totalPayment || 0).toLocaleString()}</td>
                  <td className="px-4 py-5 font-mono text-emerald-400 font-bold text-xs">${(project.currentPayment || 0).toLocaleString()}</td>
                  <td className="px-4 py-5 font-mono text-orange-400 font-bold text-xs">${(project.remainingPayment || 0).toLocaleString()}</td>
                  <td className="px-4 py-5">
                    <div className="flex flex-col">
                      <span className="font-mono text-[12px]">{project.deliveryDate ? new Date(project.deliveryDate).toLocaleDateString() : 'N/A'}</span>
                      <span className={cn("text-[10px] font-bold uppercase tracking-tighter", daysColor)}>{daysLabel}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-right">
                    <button 
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="w-8 h-8 rounded-full hover:bg-error/10 transition-colors text-error/40 hover:text-error flex items-center justify-center ml-auto"
                      title="Purge Mission"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-t border-outline-variant/10">
          <p className="text-[11px] font-mono text-on-surface-variant uppercase tracking-widest">
            Showing <span className="text-on-surface font-bold">{projects.length}</span> of <span className="text-on-surface font-bold">{pagination.total}</span> missions
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1 || isLoading}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg hover:bg-surface-container-high disabled:opacity-30 transition-all"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="text-xs font-bold font-headline px-4 bg-surface-container rounded-lg py-2">
              Page {page} of {pagination.totalPages}
            </span>
            <button 
              disabled={page === pagination.totalPages || isLoading}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg hover:bg-surface-container-high disabled:opacity-30 transition-all"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {!isLoading && projects.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <span className="material-symbols-outlined text-6xl text-slate-700">inventory_2</span>
            <p className="text-on-surface-variant font-headline text-lg">No missions matching your telemetry.</p>
          </div>
        )}
      </div>

      <ProjectDetailPanel project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
}

