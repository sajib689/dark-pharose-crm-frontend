import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex selection:bg-primary-container selection:text-white">
      {/* LEFT PANEL (55%) — bg: #0B0B18 */}
      <div className="hidden lg:flex w-[55%] bg-[#0B0B18] relative p-16 flex-col justify-between overflow-hidden">
        {/* Watermark Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-headline text-[120px] font-black text-violet-500/5 select-none leading-none tracking-tighter">
            FSD CRM
          </span>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-white font-black font-headline text-2xl">
              P
            </div>
            <h1 className="text-2xl font-bold tracking-tighter text-slate-100 font-headline">
              Dark Pharos
            </h1>
          </div>
        </div>

        <div className="relative z-10 space-y-12">
          <div className="max-w-md">
            <h2 className="text-5xl font-bold font-headline tracking-tight text-white mb-6">
              Mission Control for Digital Assets
            </h2>
            <p className="text-on-surface-variant text-lg">
              Centralize your high-fidelity output with a sentinel-grade command interface.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 max-w-sm">
            <div className="glass-effect p-6 rounded-2xl flex items-center gap-6">
              <span className="text-4xl font-bold font-mono text-primary">32</span>
              <span className="text-sm uppercase tracking-widest font-headline text-on-surface/80">
                Active Projects
              </span>
            </div>
            <div className="glass-effect p-6 rounded-2xl flex items-center gap-6">
              <span className="text-4xl font-bold font-mono text-tertiary">05</span>
              <span className="text-sm uppercase tracking-widest font-headline text-on-surface/80">
                Team Members
              </span>
            </div>
            <div className="glass-effect p-6 rounded-2xl flex items-center gap-6">
              <span className="text-4xl font-bold font-mono text-secondary">
                14d
              </span>
              <span className="text-sm uppercase tracking-widest font-headline text-on-surface/80">
                Avg Delivery
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[11px] font-mono text-violet-500/40 uppercase tracking-[0.2em]">
          System Version: 4.2.0-Alpha · Protected Access Only
        </div>
      </div>

      {/* RIGHT PANEL (45%) — bg: #12121F */}
      <div className="w-full lg:w-[45%] bg-[#12121F] p-8 lg:p-16 flex flex-col justify-center">
        <div className="max-w-sm mx-auto w-full">
          <div className="mb-10 text-center">
            <span className="px-4 py-1 rounded-full bg-violet-500/10 text-primary text-[10px] font-bold font-mono border border-primary/20">
              DARK PHAROS STUDIO · INTERNAL ACCESS
            </span>
            <h3 className="text-3xl font-bold font-headline text-on-surface mt-6">
              Welcome back
            </h3>
            <p className="text-on-surface-variant text-sm mt-2">
              Enter credentials to initialize session
            </p>
          </div>

          <LoginForm />

          <div className="mt-12 text-center">
            <p className="text-[11px] text-on-surface-variant/40 font-mono">
              © 2026 PHAROS STUDIO. UNAUTHORIZED ACCESS IS LOGGED.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
