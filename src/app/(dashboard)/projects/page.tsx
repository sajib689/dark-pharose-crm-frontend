"use client";

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

      <ProjectsListClient />
    </div>
  );
}

