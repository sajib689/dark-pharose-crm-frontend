"use client";

import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP.");
      
      setMessage("OTP sent to your email. Please check your inbox.");
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password.");

      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#12121F] flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center text-white font-black font-headline text-3xl mx-auto mb-6">
            P
          </div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">
            {step === 1 ? "Forgot Access?" : "Reset Access"}
          </h1>
          <p className="text-on-surface-variant text-sm mt-2">
            {step === 1 
              ? "Enter your work email to initialize recovery" 
              : "Verify security token and enter new credentials"}
          </p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error text-xs p-4 rounded-xl flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        {message && (
          <div className="bg-primary/10 border border-primary/20 text-primary text-xs p-4 rounded-xl flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            {message}
          </div>
        )}

        {step === 1 ? (
          <form className="space-y-6" onSubmit={handleRequestOtp}>
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 ml-1">
                Work Email
              </label>
              <input
                className="w-full bg-[#1A1A2E] border-none rounded-xl py-4 px-5 text-on-surface focus:ring-2 focus:ring-primary/40 placeholder:text-outline/40 transition-all outline-none"
                placeholder="name@pharos.studio"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-container text-white py-4 rounded-xl font-bold font-headline text-lg hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Request Token"}
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 ml-1">
                Security Token (OTP)
              </label>
              <input
                className="w-full bg-[#1A1A2E] border-none rounded-xl py-4 px-5 text-center text-2xl font-mono tracking-widest text-on-surface focus:ring-2 focus:ring-primary/40 placeholder:text-outline/40 transition-all outline-none"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 ml-1">
                  New Secure Token
                </label>
                <input
                  className="w-full bg-[#1A1A2E] border-none rounded-xl py-4 px-5 text-on-surface focus:ring-2 focus:ring-primary/40 placeholder:text-outline/40 transition-all outline-none"
                  placeholder="••••••••••••"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 ml-1">
                  Confirm Token
                </label>
                <input
                  className="w-full bg-[#1A1A2E] border-none rounded-xl py-4 px-5 text-on-surface focus:ring-2 focus:ring-primary/40 placeholder:text-outline/40 transition-all outline-none"
                  placeholder="••••••••••••"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-container text-white py-4 rounded-xl font-bold font-headline text-lg hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? "Resetting..." : "Update Credentials"}
              <span className="material-symbols-outlined">lock_reset</span>
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/login" className="text-xs text-primary hover:underline flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Command Login
          </Link>
        </div>
      </div>
    </main>
  );
}
