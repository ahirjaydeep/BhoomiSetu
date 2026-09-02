"use client";
import React from "react";
import { Download, ChevronRight, FolderGit2 } from "lucide-react";
import Link from "next/link";
import { GovCard } from "@/components/ui/GovCard";
import { StatBadge } from "@/components/ui/StatBadge";
import { LapseRiskBanner } from "@/components/dashboard/LapseRiskBanner";
import { MacroKpiStrip } from "@/components/dashboard/MacroKpiStrip";
import { CorridorProgressCharts } from "@/components/dashboard/CorridorProgressCharts";
import { LiveAuditFeed } from "@/components/dashboard/LiveAuditFeed";

const ACTIVE_PIPELINE = [
  {
    id: "PRJ-MH-2023-089",
    name: "Mumbai-Ahmedabad High Speed Rail (Palghar Section)",
    stage: "Sec 11 Published",
    progress: 35,
    status: "warning",
    target: "Dec 2026",
    hectares: 1240,
  },
  {
    id: "PRJ-UP-2023-112",
    name: "Ganga Expressway (Meerut Phase II)",
    stage: "Form 11 Award",
    progress: 82,
    status: "success",
    target: "Oct 2025",
    hectares: 850,
  },
  {
    id: "PRJ-GJ-2024-041",
    name: "Dholera SIR Industrial Node Connectivity",
    stage: "Sec 19 Declaration",
    progress: 65,
    status: "info",
    target: "Jan 2027",
    hectares: 2100,
  },
  {
    id: "PRJ-RJ-2024-002",
    name: "Amritsar-Jamnagar Expressway (Bikaner)",
    stage: "Possession Complete",
    progress: 100,
    status: "success",
    target: "Jul 2025",
    hectares: 950,
  }
];

export default function HomePage() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gov-navy tracking-tight m-0">
            National Land Acquisition Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Real-time monitoring platform under RFCTLARR Act 2013
          </p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-950 dark:bg-indigo-600 hover:bg-indigo-900 dark:hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-[0.98] focus:ring-2 focus:ring-indigo-500 ring-offset-1">
          <Download className="w-4 h-4" />
          Download National Summary PDF
        </button>
      </div>

      {/* 2. Top Section: Lapse Risk Banner */}
      <LapseRiskBanner />

      {/* 3. Middle Section 1: KPI Strip */}
      <MacroKpiStrip />

      {/* 4. Middle Section 2: Charts */}
      <CorridorProgressCharts />

      {/* 5. Bottom Section: Pipeline & Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Active Project Pipeline */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <GovCard className="h-full flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gov-navy m-0 flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-ashoka-gold" />
                  Active Project Pipeline
                </h3>
                <p className="text-xs text-slate-500 mt-1">Priority corridors currently under acquisition workflows</p>
              </div>
              <Link 
                href="/projects" 
                className="text-xs font-bold text-gov-blue hover:underline flex items-center gap-1"
              >
                View All Projects <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-100/50 dark:bg-slate-900/50">
                    <th className="p-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Project Corridor</th>
                    <th className="p-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Target</th>
                    <th className="p-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Current Stage</th>
                    <th className="p-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-[140px]">Acquisition Progress</th>
                    <th className="p-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {ACTIVE_PIPELINE.map((proj) => (
                    <tr key={proj.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="p-3">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px] md:max-w-[300px]">
                          {proj.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono tabular-nums mt-0.5 flex items-center gap-2">
                          {proj.id} <span className="text-slate-300">•</span> {proj.hectares.toLocaleString()} Ha
                        </div>
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <span className="text-[11px] font-medium tabular-nums text-slate-600">{proj.target}</span>
                      </td>
                      <td className="p-3">
                        <StatBadge 
                          variant={proj.status as any} 
                          label={proj.stage} 
                          showPulse={proj.status === 'warning'} 
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-1.5 rounded-full ${
                                proj.progress === 100 ? 'bg-emerald-600' : 'bg-indigo-600'
                              }`} 
                              style={{ width: `${proj.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-bold tabular-nums text-slate-500 w-6 text-right">
                            {proj.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <Link 
                          href={`/projects/${proj.id}`}
                          className="inline-flex p-1.5 text-slate-400 hover:text-indigo-700 dark:hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all active:scale-[0.98]"
                          title="Open Project Workspace"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GovCard>
        </div>

        {/* Right 1 Col: Live Audit Feed */}
        <div className="flex flex-col h-full min-h-[450px]">
          <LiveAuditFeed />
        </div>

      </div>
    </div>
  );
}