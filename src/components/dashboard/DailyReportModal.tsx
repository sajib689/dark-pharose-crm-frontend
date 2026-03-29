"use client";

import { useState } from "react";
import { useSubmitDailyReportMutation } from "@/lib/store/api";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "SOD" | "EOD";
}

const MOODS = [
  { label: "Focused", icon: "bolt", color: "text-amber-400" },
  { label: "Productive", icon: "rocket_launch", color: "text-emerald-400" },
  { label: "Blocked", icon: "block", color: "text-error" },
  { label: "Learning", icon: "menu_book", color: "text-violet-400" },
  { label: "Relaxed", icon: "sentiment_satisfied", color: "text-blue-400" },
];

export default function DailyReportModal({ isOpen, onClose, type }: DailyReportModalProps) {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("Focused");
  const [submitReport, { isLoading }] = useSubmitDailyReportMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return toast.error("Please provide report content.");

    try {
      await submitReport({ type, content, mood }).unwrap();
      toast.success(`${type} submitted successfully!`);
      setContent("");
      onClose();
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to submit report.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-xl bg-surface-container-low rounded-3xl border border-outline-variant/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container">
          <div>
            <h2 className="text-xl font-bold font-headline text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                {type === "SOD" ? "wb_sunny" : "nights_stay"}
              </span>
              Daily {type} Report
            </h2>
            <p className="text-xs text-on-surface-variant font-mono uppercase tracking-widest mt-1">
              Mission Logging Core v2.0
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-surface-container-highest transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Mood Selector */}
          <div className="space-y-3">
            <label className="text-[11px] font-mono uppercase tracking-[0.2em] text-on-surface-variant/60 ml-1">Current Operative Status</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => setMood(m.label)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-bold",
                    mood === m.label 
                      ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5" 
                      : "bg-surface-container border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-high"
                  )}
                >
                  <span className={cn("material-symbols-outlined text-[18px]", m.color)}>{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-3">
            <label className="text-[11px] font-mono uppercase tracking-[0.2em] text-on-surface-variant/60 ml-1">
              {type === "SOD" ? "Today's Mission Targets" : "Mission Accomplishments"}
            </label>
            <textarea
              required
              rows={5}
              placeholder={type === "SOD" ? "What are your primary objectives for this rotation?" : "Summarize your mission progress and any bottlenecks encountered..."}
              className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/40 transition-all outline-none resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 rounded-2xl bg-surface-container-high text-on-surface font-bold text-sm hover:bg-surface-container-highest transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] px-6 py-3.5 rounded-2xl bg-primary text-on-primary font-bold text-sm hover:translate-y-[-2px] active:translate-y-[0px] shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:translate-y-0"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  Transmitting...
                </div>
              ) : (
                `Submit ${type} Report`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
