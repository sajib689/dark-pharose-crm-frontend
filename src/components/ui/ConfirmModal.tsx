"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "warning";
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false
}: Props) {
  if (!isOpen) return null;

  const colors = {
    danger: "from-error to-error/80 text-white shadow-error/20",
    primary: "from-primary to-primary-container text-on-primary shadow-primary/20",
    warning: "from-orange-500 to-orange-400 text-white shadow-orange-500/20",
  };

  const icon = {
    danger: "error",
    primary: "help",
    warning: "warning",
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-surface-container-low rounded-3xl border border-outline-variant/10 shadow-3xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
        <div className="p-8 text-center space-y-4">
          <div className={cn("w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-gradient-to-br mb-6", colors[variant])}>
            <span className="material-symbols-outlined text-3xl">{icon[variant]}</span>
          </div>
          
          <h2 className="text-xl font-bold font-headline tracking-tight text-on-surface">{title}</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed px-2">{message}</p>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-outline-variant/20 text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "flex-[1.5] py-3 px-4 rounded-xl bg-gradient-to-br font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2",
              colors[variant],
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
