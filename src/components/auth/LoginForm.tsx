"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials or unauthorized access.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-error/10 border border-error/20 text-error text-xs p-3 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </div>
      )}
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
      <div>
        <label className="block text-[11px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 ml-1">
          Secure Token
        </label>
        <input
          className="w-full bg-[#1A1A2E] border-none rounded-xl py-4 px-5 text-on-surface focus:ring-2 focus:ring-primary/40 placeholder:text-outline/40 transition-all outline-none"
          placeholder="••••••••••••"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center justify-between py-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            className="rounded bg-[#1A1A2E] border-none text-primary focus:ring-0 w-4 h-4"
            type="checkbox"
          />
          <span className="text-xs text-on-surface-variant">Persistent Session</span>
        </label>
        <Link className="text-xs text-primary hover:underline" href="/forgot-password">
          Reset access?
        </Link>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary-container text-white py-4 rounded-xl font-bold font-headline text-lg hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Initializing..." : "Sign in"}
        <span className="material-symbols-outlined">login</span>
      </button>
    </form>
  );
}
