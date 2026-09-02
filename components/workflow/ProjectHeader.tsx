"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { 
  ChevronRight, 
  MapPin, 
  Layers, 
  IndianRupee, 
  ShieldAlert, 
  CheckCircle2, 
  Building2,
  FileSignature
} from 'lucide-react';
import Link from 'next/link';
import { useRealtimeObjections } from '@/hooks/useRealtimeObjections';

interface Project {
  id: string;
  name: string;
  sector: string;
  ministry: string;
  district: string;
  state: string;
  totalAreaHa: number;
  khasraCount: number;
  estimatedBudget: number;
  currentStage: number;
}

interface ProjectHeaderProps {
  project: Project;
}

export const ProjectHeader = ({ project }: ProjectHeaderProps) => {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);

  const { objections } = useRealtimeObjections(project.id);
  const activeObjections = objections.filter(o => o.status === 'Pending' || o.status === 'Under SLAO Hearing');
  const boundaryDisputes = activeObjections.filter(o => o.category === 'Boundary Overlap').length;
  const titleDisputes = activeObjections.filter(o => o.category === 'Ownership Dispute').length;
  const compensationDisputes = activeObjections.filter(o => o.category === 'Valuation & Solatium Discrepancy').length;

  const role = currentUser?.role || '';

  // Determine dynamic action based on Role and Stage
  let actionLabel = null;
  let actionIcon = null;
  let isDanger = false;
  let nextStageCode = '';

  if (role === 'SLAO_DISTRICT' && project.currentStage === 3) {
    actionLabel = 'Initiate Sec 15 Public Hearing';
    actionIcon = <FileSignature className="w-4 h-4" />;
    nextStageCode = 'STAGE_4_SEC15';
  } else if (role === 'SLAO_DISTRICT' && project.currentStage === 5) {
    actionLabel = 'Generate Form 11 Valuation Awards';
    actionIcon = <IndianRupee className="w-4 h-4" />;
    nextStageCode = 'STAGE_6_AWARD_DETERMINATION';
  } else if (role === 'STATE_REVENUE' && project.currentStage === 4) {
    actionLabel = 'Approve Sec 19 Declaration Gazette';
    actionIcon = <CheckCircle2 className="w-4 h-4" />;
    nextStageCode = 'STAGE_5_SEC19';
  } else if (role === 'CENTRAL_ADMIN') {
    actionLabel = 'Emergency Escalation / Freeze Proceedings';
    actionIcon = <ShieldAlert className="w-4 h-4" />;
    isDanger = true;
    nextStageCode = 'FREEZE';
  }

  const handleActionClick = () => {
    setIsModalOpen(true);
    setActionSuccess(false);
  };

  const handleConfirmAction = async () => {
    setIsProcessing(true);
    // Simulate API Call to /api/v1/workflow/advance-stage
    setTimeout(() => {
      setIsProcessing(false);
      setActionSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        // Ideally trigger a refresh here
      }, 2000);
    }, 1500);
  };

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        
        {/* Top: Breadcrumbs & Badges */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="hover:text-gov-blue cursor-pointer transition-colors">Projects</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gov-navy truncate max-w-[200px] sm:max-w-none">{project.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 uppercase tracking-wider">
              {project.sector} / {project.ministry}
            </span>
          </div>
        </div>

        {/* Main Title Row & Action Bar */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-gov-navy m-0 tracking-tight">
                {project.name}
              </h1>
              <span className="text-xs font-mono font-bold text-gov-blue bg-blue-50 border border-blue-200 px-2 py-1 rounded">
                {project.id}
              </span>
            </div>

            {/* Metadata Strip */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{project.district}, {project.state}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-ashoka-gold" />
                <span>{(project.totalAreaHa || 0).toLocaleString()} Ha Area</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-gov-blue" />
                <span>{(project.khasraCount || 0).toLocaleString()} Parcels (Khasras)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-status-green" />
                <span>₹{(project.estimatedBudget / 10000000).toFixed(2)} Cr Escrow</span>
              </div>
            </div>

            {/* Active Objections Section */}
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className={`w-5 h-5 ${activeObjections.length > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-lg font-bold text-slate-800">{activeObjections.length}</span>
                    <span className="text-xs text-slate-500 ml-1">Active Objections</span>
                  </div>
                </div>
                
                {activeObjections.length > 0 && (
                  <div className="hidden sm:flex flex-wrap items-center gap-2 text-[10px] font-bold">
                    <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      Boundary/Area: {boundaryDisputes}
                    </span>
                    <span className="px-2 py-1 rounded bg-red-100 text-red-800 border border-red-200">
                      Title/Ownership: {titleDisputes}
                    </span>
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 border border-blue-200">
                      Compensation: {compensationDisputes}
                    </span>
                  </div>
                )}
              </div>
              
              <Link 
                href={`/objections?projectId=${project.id}`}
                className="shrink-0 px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-100 transition-colors inline-flex items-center justify-center gap-1"
              >
                Inspect Objections <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Dynamic Action Bar */}
          {actionLabel && (
            <div className="shrink-0 mt-4 md:mt-0 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 flex items-center group relative">
              <button 
                onClick={handleActionClick}
                disabled={nextStageCode === 'STAGE_5_SEC19' || nextStageCode === 'STAGE_6_AWARD_DETERMINATION' /* Using mock validation flags to demonstrate guardrails */}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 ${
                  isDanger 
                    ? 'bg-status-red hover:bg-red-700 shadow-[0_4px_10px_rgba(220,38,38,0.2)]' 
                    : (nextStageCode === 'STAGE_5_SEC19' || nextStageCode === 'STAGE_6_AWARD_DETERMINATION')
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none hover:translate-y-0'
                      : 'bg-gov-navy hover:bg-[#003b66] shadow-[0_4px_10px_rgba(10,25,47,0.2)]'
                }`}
              >
                {actionIcon}
                {actionLabel}
              </button>

              {/* Tooltip for Guardrails (Mocking missing requirements) */}
              {(nextStageCode === 'STAGE_5_SEC19' || nextStageCode === 'STAGE_6_AWARD_DETERMINATION') && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 text-white text-xs rounded shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="font-bold mb-1 text-amber-400">Action Locked</div>
                  {nextStageCode === 'STAGE_5_SEC19' && "Cannot advance to Stage 5: 2 pending Section 15 objections remaining."}
                  {nextStageCode === 'STAGE_6_AWARD_DETERMINATION' && "Cannot advance to Stage 6: Total calculated market valuation must be non-zero for all affected parcels."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isProcessing && setIsModalOpen(false)}
        title={isDanger ? 'Emergency Escalation Warning' : 'Confirm Workflow Transition'}
      >
        <div className="space-y-4">
          {!actionSuccess ? (
            <>
              <div className={`p-4 rounded-lg border flex items-start gap-3 ${
                isDanger ? 'bg-red-50 border-red-200 text-red-900' : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}>
                {isDanger ? <ShieldAlert className="w-5 h-5 shrink-0" /> : <FileSignature className="w-5 h-5 shrink-0" />}
                <div>
                  <p className="font-bold text-sm m-0">You are about to execute: {actionLabel}</p>
                  <p className="text-xs mt-1 opacity-90">
                    This action will permanently log a cryptographically signed event to the audit trail under your credentials ({currentUser?.name}, {currentUser?.roleTitle}).
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Project:</span>
                  <span className="font-bold text-gov-navy">{project.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target State:</span>
                  <span className="font-mono font-bold text-slate-700">{nextStageCode}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmAction}
                  disabled={isProcessing}
                  className={`px-4 py-2 rounded text-sm font-bold text-white shadow-sm flex items-center gap-2 ${
                    isDanger ? 'bg-status-red hover:bg-red-700' : 'bg-gov-navy hover:bg-[#003b66]'
                  } disabled:opacity-70`}
                >
                  {isProcessing ? 'Processing...' : 'Cryptographically Sign & Proceed'}
                </button>
              </div>
            </>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-10 h-10 text-status-green" />
              </div>
              <h3 className="text-lg font-bold text-gov-navy m-0">Action Logged Successfully</h3>
              <p className="text-sm text-slate-500">
                The transition has been recorded on the immutable ledger. Refreshing workflow...
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
