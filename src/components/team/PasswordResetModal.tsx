"use client";

import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  userName: string;
  isLoading?: boolean;
}

export default function PasswordResetModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isLoading = false
}: Props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const pass = Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setPassword(pass);
    setConfirmPassword(pass);
    setShowPassword(true);
    setError(null);
  };

  const handleConfirm = () => {
    if (password.length < 6) {
      setError("Access code must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Access codes do not match.");
      return;
    }
    onConfirm(password);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-surface-container-low rounded-3xl border border-outline-variant/10 shadow-3xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
        <div className="p-8 border-b border-outline-variant/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">key</span>
            </div>
            <div>
              <h2 className="text-xl font-bold font-headline tracking-tighter text-on-surface">Reset Access Key</h2>
              <p className="text-xs text-on-surface-variant font-mono uppercase tracking-widest mt-0.5">Operative: {userName}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-end mb-1">
                <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">New Access Key</label>
                <button onClick={generatePassword} className="text-[10px] font-mono text-primary font-bold uppercase hover:underline">Auto-Generate</button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-3 text-sm font-mono focus:border-primary outline-none transition-all pr-12"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="Enter secure key..."
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
                >
                  <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest block mb-1">Confirm Access Key</label>
              <input 
                type={showPassword ? "text" : "password"}
                className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-3 text-sm font-mono focus:border-primary outline-none transition-all"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                placeholder="Re-type key..."
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-error animate-in fade-in slide-in-from-top-1">
                <span className="material-symbols-outlined text-sm">error</span>
                <p className="text-[11px] font-bold font-mono uppercase">{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-surface-container-lowest/50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-outline-variant/20 text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-[1.5] py-3 px-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isLoading ? "Updating..." : "Authorize Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
