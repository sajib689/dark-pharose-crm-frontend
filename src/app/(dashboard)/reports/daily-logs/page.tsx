"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useGetDailyReportsQuery, useGetTeamQuery } from "@/lib/store/api";
import { cn } from "@/lib/utils";
import CopyToClipboard from "@/components/ui/CopyToClipboard";

export default function DailyLogsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedUser, setSelectedUser] = useState("");

  const { data: reportsData, isLoading: reportsLoading } = useGetDailyReportsQuery({
    date: selectedDate,
    userId: selectedUser || undefined
  });

  const { data: teamData } = useGetTeamQuery();
  const reports = reportsData?.reports || [];
  const members = teamData || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Daily Mission Logs</h1>
          <p className="text-on-surface-variant text-sm mt-2 font-medium">Monitoring real-time team status and objective progress.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-surface-container-low p-2 rounded-2xl border border-outline-variant/10 shadow-sm">
          <div className="flex flex-col px-3">
            <span className="text-[10px] font-bold uppercase text-primary font-mono mb-1">Target Date</span>
            <input 
              type="date" 
              className="bg-transparent text-sm font-bold text-on-surface outline-none border-none p-0 cursor-pointer"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="w-[1px] h-8 bg-outline-variant/20" />
          <div className="flex flex-col px-3 min-w-[160px]">
            <span className="text-[10px] font-bold uppercase text-primary font-mono mb-1">Operative</span>
            <select 
              className="bg-transparent text-sm font-bold text-on-surface outline-none border-none p-0 cursor-pointer"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">All Operatives</option>
              {members.map((m: any) => (
                <option key={m.id} value={m.id}>{m.displayName || m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reportsLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-surface-container rounded-2xl animate-pulse" />
          ))
        ) : reports.length === 0 ? (
          <div className="py-24 text-center space-y-4 bg-surface-container-low rounded-3xl border border-dashed border-outline-variant/20">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20">event_busy</span>
            <p className="text-on-surface-variant font-headline text-lg">No mission reports filed for this rotation.</p>
          </div>
        ) : (
          reports.map((report: any) => (
            <div 
              key={report.id} 
              className="group bg-surface-container-low rounded-3xl border border-outline-variant/10 p-6 hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5 flex flex-col md:flex-row gap-6 relative overflow-hidden"
            >
              {/* Type Indicator */}
              <div className={cn(
                "absolute top-0 left-0 w-1.5 h-full",
                report.type === "SOD" ? "bg-amber-400" : "bg-primary"
              )} />

              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-highest flex items-center justify-center border border-outline-variant/10 text-xl font-bold font-mono text-primary group-hover:scale-110 transition-transform">
                  {report.user?.displayName?.charAt(0) || report.user?.name?.charAt(0)}
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  report.type === "SOD" ? "bg-amber-400/10 text-amber-400" : "bg-primary/10 text-primary"
                )}>
                  {report.type}
                </span>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                       <h3 className="text-lg font-bold font-headline text-on-surface">{report.user?.displayName || report.user?.name}</h3>
                       {report.user?.employeeId && (
                         <span className="text-[10px] font-mono font-bold text-primary/60">#{report.user.employeeId}</span>
                       )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-mono text-on-surface-variant uppercase bg-surface-container px-2 py-0.5 rounded border border-outline-variant/5">
                        {report.user?.role?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-on-surface-variant/60 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {report.user?.githubUsername && (
                        <a 
                          href={`https://github.com/${report.user.githubUsername}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono text-primary/60 hover:text-primary flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">link</span>
                          @{report.user.githubUsername}
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {report.mood && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-high border border-outline-variant/10">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Status:</span>
                      <span className="text-xs font-bold text-primary">{report.mood}</span>
                    </div>
                  )}
                </div>

                <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/5 relative group/content">
                  <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">{report.content}</p>
                  <CopyToClipboard 
                    text={report.content} 
                    className="absolute top-4 right-4 opacity-0 group-hover/content:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
