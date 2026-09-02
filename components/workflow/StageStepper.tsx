"use client";
import React, { useState } from 'react';
import { Check, Lock, AlertCircle, Calendar, UserCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useRealtimeProject } from '@/hooks/useRealtimeProject';

import { useProject } from '@/providers/ProjectProvider';

interface StageStepperProps {
  projectId?: string;
  onStageClick?: (stageNum: number) => void;
  // allow additional props that were previously ignored to prevent TS errors
  currentStage?: number;
  sec11Date?: any;
  sec19Date?: any;
}

const STAGES = [
  { num: 1, title: 'Sec 4 SIA Study', short: 'Sec 4', tooltip: 'SIA Study & Feasibility. Mandatory social impact assessment under Section 4.' },
  { num: 2, title: 'Sec 11 Gazette', short: 'Sec 11', tooltip: 'Preliminary Gazette Notification. Official publication under Section 11.' },
  { num: 3, title: 'Sec 15 Objections', short: 'Sec 15', tooltip: 'Objections & Collector Hearing. Public hearing under Section 15.' },
  { num: 4, title: 'Sec 19 Declaration', short: 'Sec 19', tooltip: 'Final Acquisition Declaration. Mandatory declaration under Section 19.' },
  { num: 5, title: 'Sec 23 Award', short: 'Sec 23', tooltip: 'Award Determination / Form 11. Final award calculated under Section 23.' },
  { num: 6, title: 'Sec 30 Solatium', short: 'Sec 30', tooltip: 'Solatium & Compensation Computation. 100% Solatium added under Section 30.' },
  { num: 7, title: 'Sec 38 Payout', short: 'Sec 38', tooltip: 'Possession Handover & DBT Payout. Final possession taken under Section 38.' },
];

export const StageStepper = ({ projectId: explicitProjectId, onStageClick }: StageStepperProps) => {
  const { activeProjectId } = useProject();
  const projectId = explicitProjectId || activeProjectId;
  const { project, loading } = useRealtimeProject(projectId);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);

  if (loading || !project) {
    return <div className="w-full h-32 flex items-center justify-center text-slate-400 text-sm animate-pulse">Loading Stage Pipeline...</div>;
  }

  const currentStage = project.currentStage || 1;
  const sec11Date = project.sec11Date || null;
  const sec19Date = project.sec19Date || null;

  let daysRemaining = 365;
  if (sec11Date) {
    const diffTime = Math.abs(new Date().getTime() - new Date(sec11Date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    daysRemaining = 365 - diffDays;
  }

  const isLapseRisk = (currentStage === 1 || currentStage === 2) && daysRemaining < 30;

  const handleNodeClick = (stageNum: number) => {
    if (stageNum <= currentStage) {
      setSelectedStage(stageNum);
      if (onStageClick) onStageClick(stageNum);
    }
  };

  return (
    <div className="w-full py-8 overflow-x-auto relative">
      <div className="min-w-[900px] relative px-6">
        
        {/* Connecting Line Background */}
        <div className="absolute top-5 left-12 right-12 h-1 bg-slate-200 z-0 rounded-full"></div>
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-5 left-12 h-1 bg-status-green z-0 rounded-full transition-all duration-700 ease-in-out" 
          style={{ width: `calc(${Math.min((currentStage - 1) / 6 * 100, 100)}% - 24px)` }}
        ></div>

        <div className="flex justify-between items-start relative z-10">
          {STAGES.map((stage) => {
            const isCompleted = stage.num < currentStage;
            const isActive = stage.num === currentStage;
            const isLocked = stage.num > currentStage;
            const isRiskNode = stage.num === 2 && isLapseRisk;

            return (
              <div 
                key={stage.num} 
                className="flex flex-col items-center group relative cursor-pointer"
                onClick={() => handleNodeClick(stage.num)}
              >
                {/* Stage Node Circle */}
                <div className="relative">
                  {/* Warning Pulse for Risk Nodes */}
                  {isRiskNode && (
                    <div className="absolute -inset-2 bg-status-red/30 rounded-full animate-ping z-0"></div>
                  )}
                  
                  <div className={`
                    relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                    ${isCompleted ? 'bg-status-green border-status-green text-white shadow-sm hover:shadow-md' : ''}
                    ${isActive ? 'bg-white border-ashoka-gold shadow-[0_0_0_4px_rgba(217,119,6,0.1)] hover:shadow-[0_0_0_6px_rgba(217,119,6,0.15)]' : ''}
                    ${isLocked && !isRiskNode ? 'bg-slate-50 border-slate-300 text-slate-400' : ''}
                    ${isLocked && isRiskNode ? 'bg-white border-status-red text-status-red' : ''}
                  `}>
                    {isCompleted && <Check className="w-5 h-5" />}
                    {isActive && <div className="w-3 h-3 bg-ashoka-gold rounded-full animate-pulse"></div>}
                    {isLocked && !isRiskNode && <Lock className="w-4 h-4" />}
                    {isLocked && isRiskNode && <AlertCircle className="w-5 h-5" />}
                  </div>
                </div>

                {/* Text Labels */}
                <div className="mt-3 text-center max-w-[80px]">
                  <div className={`text-xs font-bold transition-colors ${isActive ? 'text-gov-navy' : isCompleted ? 'text-slate-700' : isRiskNode ? 'text-status-red' : 'text-slate-400'}`}>
                    {stage.short}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5 leading-tight hidden sm:block">
                    {stage.title}
                  </div>
                </div>

                {/* Rich Hover Tooltip */}
                <div className="absolute top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] p-2.5 rounded shadow-lg z-50 w-48 text-center pointer-events-none border border-slate-700">
                  <span className="block font-bold mb-1 text-slate-200 uppercase tracking-wider">{stage.title}</span>
                  <span className="text-slate-400">{stage.tooltip}</span>
                  {isRiskNode && <div className="text-status-red font-bold mt-1.5 pt-1.5 border-t border-slate-700">{daysRemaining} Days until Lapse Limit</div>}
                </div>

                {/* Risk Warning visible tag */}
                {isRiskNode && (
                  <div className="absolute top-12 whitespace-nowrap bg-status-red text-white text-[10px] font-bold px-2 py-1 rounded shadow-md mt-1 animate-in slide-in-from-top-1 group-hover:hidden">
                    {daysRemaining} Days to Lapse!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal for Completed/Active Stages */}
      <Modal 
        isOpen={selectedStage !== null} 
        onClose={() => setSelectedStage(null)} 
        title={`Stage ${selectedStage}: ${STAGES.find(s => s.num === selectedStage)?.title}`}
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-4">
            <Calendar className="w-5 h-5 text-gov-blue shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-gov-navy m-0">Transition Timestamp</p>
              <p className="text-xs text-slate-600 mt-1">
                {selectedStage === 1 && sec11Date ? new Date(sec11Date).toLocaleString() : 
                 selectedStage === 2 && sec19Date ? new Date(sec19Date).toLocaleString() : 
                 selectedStage === currentStage ? 'In Progress' : 'Data logged in Vault'}
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-4">
            <UserCheck className="w-5 h-5 text-status-green shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-gov-navy m-0">Authorizing Officer</p>
              <p className="text-xs text-slate-600 mt-1">
                {selectedStage === currentStage ? 'Pending Approval' : 'Verified via e-Sign (SLAO District)'}
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
