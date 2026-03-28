"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import NewProjectModal from "@/components/projects/NewProjectModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showNewProject, setShowNewProject] = useState(false);
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "PROJECT_MANAGER";

  return (
    <div className="flex min-h-screen bg-surface-container-lowest">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-[240px] flex flex-col relative">
        {/* Header */}
        <Header />

        {/* Content */}
        <main className="flex-1 p-8">
          {children}
        </main>

        {/* Floating Action Button (Admin Only) */}
        {isAdmin && (
          <button
            onClick={() => setShowNewProject(true)}
            className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
          >
            <span className="material-symbols-outlined text-[24px]">rocket_launch</span>
            <span className="absolute right-full mr-4 px-3 py-1 bg-surface-container-highest text-[11px] font-bold font-headline rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none">
              QUICK DEPLOY
            </span>
          </button>
        )}
      </div>

      {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} />}

      {/* Background Glow Decorations */}
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-violet-400/5 blur-[100px] rounded-full pointer-events-none z-0"></div>
    </div>
  );
}
