"use client";
import React from 'react';
import { ProjectHeader } from '@/components/workflow/ProjectHeader';
import { StageStepper } from '@/components/workflow/StageStepper';
import { StatutoryCountdownCard } from '@/components/workflow/StatutoryCountdownCard';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Clock, ShieldAlert, FileText } from 'lucide-react';

import { VillageBreakupTable } from '@/components/projects/VillageBreakupTable';
import { FinancialSummaryTab, ObjectionsLedgerTab, AuditTrailTab, DocumentsTab } from '@/components/workflow/ProjectTabs';
import { useProject } from '@/providers/ProjectProvider';
import { useRealtimeProject } from '@/hooks/useRealtimeProject';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const projectId = params.id as string;
  const { setActiveProjectId } = useProject();
  
  React.useEffect(() => {
    if (projectId) setActiveProjectId(projectId);
  }, [projectId, setActiveProjectId]);

  const { project: realtimeData, loading, error } = useRealtimeProject(projectId);
  const [seeding, setSeeding] = React.useState(false);

  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await fetch('/api/v1/seed', { method: 'POST' });
      window.location.reload();
    } catch (e) {
      console.error(e);
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-gov-primary animate-spin" />
      </div>
    );
  }

  if (error || (!loading && !realtimeData)) {
    return (
      <div className="flex flex-col h-64 items-center justify-center space-y-4">
        <div className="text-red-500 font-bold">
          Error loading project data or project not found.
        </div>
      </div>
    );
  }

  const project = realtimeData!;

  const sec11Date = realtimeData?.sec11Date?.seconds 
    ? new Date(realtimeData.sec11Date.seconds * 1000) 
    : (() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 11);
        d.setDate(d.getDate() + 15);
        return d;
      })();

  const sec19Date = realtimeData?.sec19Date?.seconds 
    ? new Date(realtimeData.sec19Date.seconds * 1000) 
    : null;

  const showCountdown = project.currentStage === 3 || project.currentStage === 4 || project.currentStage === 5;

  const TABS = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'villages', label: 'Village Breakup', icon: <Map className="w-4 h-4" /> },
    { id: 'timeline', label: 'Statutory Timeline', icon: <Clock className="w-4 h-4" /> },
    { id: 'disputes', label: 'Disputed Parcels', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'documents', label: 'SLAO Documents', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      


      <div className="px-6 pt-4">
        <Link 
          href="/projects" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-gov-navy transition-colors bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Project Registry
        </Link>
      </div>

      <div className="shadow-sm rounded-lg overflow-hidden border border-slate-200">
        <ProjectHeader project={project} />
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id 
                  ? 'bg-white border-gov-blue text-gov-navy' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <StageStepper 
                  currentStage={project.currentStage} 
                  sec11Date={sec11Date} 
                  sec19Date={null} 
                />
              </div>
              {showCountdown && (
                <StatutoryCountdownCard 
                  currentStage={project.currentStage} 
                  sec11Date={sec11Date} 
                  sec19Date={null} 
                />
              )}
              <FinancialSummaryTab />
            </div>
          )}

          {activeTab === 'villages' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <VillageBreakupTable />
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <AuditTrailTab />
            </div>
          )}

          {activeTab === 'disputes' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <ObjectionsLedgerTab />
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <DocumentsTab />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
