"use client";
import React, { useState, useEffect } from 'react';
import { GovCard } from '@/components/ui/GovCard';
import { StatBadge } from '@/components/ui/StatBadge';
import { TrendingUp, Landmark, AlertTriangle, Clock, ChevronRight } from 'lucide-react';

import { useRealtimeProject } from '@/hooks/useRealtimeProject';
import { useRealtimeAwards } from '@/hooks/useRealtimeAwards';
import { useProject } from '@/providers/ProjectProvider';

export const MacroKpiStrip = () => {
  const { activeProjectId } = useProject();
  const { project, loading: projectLoading } = useRealtimeProject(activeProjectId);
  const { totalPayoutCrores, loading: awardsLoading } = useRealtimeAwards(activeProjectId);

  const isLoading = projectLoading || awardsLoading;

  if (isLoading || !project) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <GovCard key={i} className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-100 rounded w-full mt-4"></div>
          </GovCard>
        ))}
      </div>
    );
  }

  const STAGE_LABELS: Record<number, string> = {
    1: "Section 11 Gazette",
    2: "Section 15 Objections",
    3: "SLAO Hearing",
    4: "Section 23 Award",
    5: "Section 38 Payout"
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Total Active Corridors */}
      <GovCard className="border-l-4 border-l-gov-blue hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Total Active Corridors
            </p>
            <h3 className="text-2xl font-black text-gov-navy tracking-tight m-0">
              {project.activeCorridorsCount} <span className="text-sm text-slate-500 font-bold">Corridors</span>
            </h3>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <MapIcon className="w-5 h-5 text-gov-blue" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-status-green">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+1 this month</span>
        </div>
      </GovCard>

      {/* Disbursed Compensation */}
      <GovCard className="border-l-4 border-l-ashoka-gold hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Disbursed Compensation
            </p>
            <h3 className="text-2xl font-black text-gov-navy tracking-tight m-0">
              ₹{totalPayoutCrores.toLocaleString('en-IN', { maximumFractionDigits: 1 })} <span className="text-lg text-slate-500 font-bold">Cr</span>
            </h3>
          </div>
          <div className="p-2 bg-amber-50 rounded-lg">
            <Landmark className="w-5 h-5 text-ashoka-gold" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-status-green"></span>
            <span>PFMS Verified</span>
          </div>
          <button className="text-[10px] font-bold text-gov-blue hover:underline flex items-center">
            Ledger <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </GovCard>

      {/* Current Statutory Stage */}
      <GovCard className="border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Current Statutory Stage
            </p>
            <h3 className="text-2xl font-black text-indigo-700 tracking-tight m-0">
              Stage {project.currentStage}
            </h3>
          </div>
          <div className="p-2 bg-indigo-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-indigo-500" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <StatBadge variant="primary" label={STAGE_LABELS[project.currentStage] || "Unknown"} />
        </div>
      </GovCard>

      {/* Avg Time to Possession */}
      <GovCard className="border-l-4 border-l-status-green hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Avg. Possession Time
            </p>
            <h3 className="text-2xl font-black text-gov-navy tracking-tight m-0">
              142 <span className="text-sm text-slate-500 font-bold">Days</span>
            </h3>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Clock className="w-5 h-5 text-status-green" />
          </div>
        </div>
        <div className="mt-4 w-full">
          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
            <span>Current: 142d</span>
            <span>Target: &lt;180d</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-status-green h-1.5 rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>
      </GovCard>

    </div>
  );
};

// Helper icon since Map is used in Sidebar
function MapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  );
}
