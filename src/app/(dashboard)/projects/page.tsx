"use client";

export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import { useGetProjectsQuery } from "@/lib/store/api";
import ProjectsListClient from "@/components/projects/ProjectsListClient";

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tighter uppercase text-violet-400">Projects Explorer</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Sentinel mission tracking for active operatives
          </p>
        </div>
      </header>

      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      }>
        <ProjectsListClient />
      </Suspense>
    </div>
  );
}

