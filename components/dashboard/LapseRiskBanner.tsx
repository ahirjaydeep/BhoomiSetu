"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatutoryAlertBanner } from '@/components/ui/StatutoryAlertBanner';
import { GovCard } from '@/components/ui/GovCard';
import { AlertCircle, CheckCircle2, ChevronRight, FileWarning } from 'lucide-react';

// Mock data representing a typical response from /api/v1/workflow/bottlenecks
const mockAtRiskProjects = [
  {
    id: 'PRJ-MH-2023-089',
    name: 'Mumbai-Ahmedabad High Speed Rail (Palghar Section)',
    sec11Date: '2023-10-15',
    daysRemaining: 24, // < 30 days is critical
    slaoOfficer: 'Shruti Desai (Palghar District)',
  },
  {
    id: 'PRJ-UP-2023-112',
    name: 'Ganga Expressway (Meerut Phase II)',
    sec11Date: '2023-11-02',
    daysRemaining: 42, // Warning range
    slaoOfficer: 'Rajiv Sharma (Meerut)',
  }
];

export const LapseRiskBanner = ({ simulateEmptyState = false }: { simulateEmptyState?: boolean }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [atRiskProjects, setAtRiskProjects] = useState<typeof mockAtRiskProjects>([]);

  useEffect(() => {
    // Simulate network fetch
    const timer = setTimeout(() => {
      setAtRiskProjects(simulateEmptyState ? [] : mockAtRiskProjects);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [simulateEmptyState]);

  if (isLoading) {
    return (
      <div className="w-full h-24 bg-slate-200 animate-pulse rounded-lg shadow-sm"></div>
    );
  }

  // EMPTY STATE: No projects at risk
  if (atRiskProjects.length === 0) {
    return (
      <div className="w-full bg-status-green/10 border border-status-green/20 p-4 rounded-lg flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-status-green shrink-0" />
        <span className="text-sm font-semibold text-status-green">
          System Status Normal: All 14 active corridors are currently within legal statutory timelines. No imminent Section 19 lapses detected.
        </span>
      </div>
    );
  }

  // AT RISK STATE
  return (
    <GovCard className="w-full border-l-4 border-l-status-red">
      <div className="p-0 border-b border-slate-200">
        <StatutoryAlertBanner 
          title="Statutory Expiry Risk Alert — Action Required"
          message={`${atRiskProjects.length} Corridors are approaching the 365-day legal expiration window for Section 19 Declarations.`}
        />
      </div>

      <div className="p-5">
        <div className="space-y-4">
          {atRiskProjects.map((project) => (
            <div key={project.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-red-50/50 border border-red-100">
              
              <div className="flex items-start gap-3">
                <FileWarning className="w-5 h-5 text-status-red shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gov-navy m-0">{project.name}</h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                      ID: {project.id}
                    </span>
                    <span>Sec 11 Published: <strong className="text-slate-800">{new Date(project.sec11Date).toLocaleDateString()}</strong></span>
                    <span>SLAO: <strong className="text-slate-800">{project.slaoOfficer}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t border-red-100 pt-3 md:pt-0 md:border-0">
                <div className="flex flex-col items-center">
                  <span className={`text-lg font-black ${project.daysRemaining <= 30 ? 'text-status-red' : 'text-status-amber'}`}>
                    {project.daysRemaining}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Days Left
                  </span>
                </div>
                
                <Link 
                  href={`/projects?id=${project.id}`}
                  className="flex items-center gap-1 bg-white hover:bg-slate-50 text-status-red border border-status-red/30 px-3 py-2 rounded text-xs font-bold shadow-sm transition-colors"
                >
                  Review & Issue Sec 19
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      </div>
    </GovCard>
  );
};
