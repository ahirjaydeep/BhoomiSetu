"use client";

import React from 'react';
import { useProject } from "@/providers/ProjectProvider";
import { useRealtimeProjectsList } from "@/hooks/useRealtimeProjectsList";
import { FolderArchive, ChevronDown } from "lucide-react";

export function ProjectSelector() {
  const { activeProjectId, setActiveProjectId } = useProject();
  const { projects, loading } = useRealtimeProjectsList();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-lg animate-pulse text-xs text-slate-400">
        <FolderArchive className="w-3.5 h-3.5" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-lg shadow-sm transition-colors hover:bg-slate-800 relative group cursor-pointer">
      <FolderArchive className="w-4 h-4 text-emerald-400 shrink-0" />
      <div className="flex flex-col relative w-48">
        <select
          value={activeProjectId}
          onChange={(e) => setActiveProjectId(e.target.value)}
          className="bg-transparent border-0 text-xs font-bold text-white cursor-pointer focus:ring-0 p-0 hover:text-emerald-300 transition-colors appearance-none pr-6 w-full truncate outline-none"
          style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
        >
          {projects.map((proj) => (
            <option key={proj.id} value={proj.id} className="bg-slate-900 text-white">
              {proj.name} ({proj.id})
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-slate-300 transition-colors" />
      </div>
    </div>
  );
}
