"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  FileCheck,
  Check
} from 'lucide-react';

export const WorkflowTimeline = ({ project, onStageAdvanced }) => {
  const { currentUser } = useAuth();
  const [advancing, setAdvancing] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [showModal, setShowModal] = useState(false);

  if (!project) return null;

  const stages = [
    {
      id: 'STAGE_1_PROPOSAL',
      code: 'Stage 1',
      title: 'Administrative Requisition',
      desc: 'Project alignment submission & in-principle administrative approval by Requiring Body (NHAI/Railways).',
      section: 'RFCTLARR Sec 3'
    },
    {
      id: 'STAGE_2_SIA',
      code: 'Stage 2',
      title: 'Social Impact Assessment (SIA)',
      desc: 'Mandatory SIA study, public consultations & Multi-Disciplinary Expert Group appraisal.',
      section: 'RFCTLARR Sec 4-7'
    },
    {
      id: 'STAGE_3_SEC11',
      code: 'Stage 3',
      title: 'Preliminary Notification',
      desc: 'Official Gazette publication, land transaction freeze & Joint Measurement Survey (JMS).',
      section: 'RFCTLARR Sec 11'
    },
    {
      id: 'STAGE_4_SEC15',
      code: 'Stage 4',
      title: 'Hearing of Objections',
      desc: '60-day statutory window for affected landowners to file objections before District Collector.',
      section: 'RFCTLARR Sec 15'
    },
    {
      id: 'STAGE_5_SEC19',
      code: 'Stage 5',
      title: 'Final Declaration & R&R Scheme',
      desc: 'Publication of acquisition declaration. Must be completed within 12 months of Sec 11 to avoid lapse.',
      section: 'RFCTLARR Sec 19'
    },
    {
      id: 'STAGE_6_AWARD_DETERMINATION',
      code: 'Stage 6',
      title: 'Valuation & Award Inquiry',
      desc: 'Collector determines land value with rural multiplier, 100% solatium & 12% interest.',
      section: 'RFCTLARR Sec 23/26'
    },
    {
      id: 'STAGE_7_POSSESSION',
      code: 'Stage 7',
      title: 'Possession & DBT Disbursal',
      desc: '100% compensation deposited via Direct Benefit Transfer; unencumbered possession granted.',
      section: 'RFCTLARR Sec 38'
    }
  ];

  const currentStageIndex = stages.findIndex(s => s.id === project.stage);

  const handleAdvance = async () => {
    setAdvancing(true);
    try {
      const nextIndex = Math.min(currentStageIndex + 1, stages.length - 1);
      const nextStage = stages[nextIndex].id;

      await onStageAdvanced(project.id, {
        targetStage: nextStage,
        remarks: remarks || `Approved by ${currentUser?.name} (${currentUser?.roleTitle})`,
        approvedBy: currentUser?.name,
        role: currentUser?.role
      });
      setShowModal(false);
      setRemarks('');
    } catch (err) {
      console.error('Failed to advance stage:', err);
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[#002b49] bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              {project.id}
            </span>
            <span className="text-xs text-slate-500">
              Requiring Body: <strong className="text-slate-800">{project.requiringBody}</strong>
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1 m-0">
            {project.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            RFCTLARR Act 2013 Statutory Lifecycle Progression • Priority: <span className="text-slate-800 font-semibold">{project.priority}</span>
          </p>
        </div>

        {/* Action Button */}
        {currentStageIndex < stages.length - 1 && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-[#002b49] hover:bg-[#003b66] text-white text-xs font-semibold px-3.5 py-2 rounded-md transition-colors cursor-pointer shadow-sm"
          >
            <span>Advance to Next Stage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Statutory Countdown Box */}
      {(project.stage === 'STAGE_3_SEC11' || project.stage === 'STAGE_4_SEC15') && (
        <div className="bg-amber-50 border border-amber-300 rounded p-3 flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-900">
              Statutory 12-Month Expiry Countdown Active (RFCTLARR Sec 19(7))
            </div>
            <p className="text-amber-800 mt-0.5 leading-snug m-0">
              Under statutory rules, the Section 19 final declaration must be published within 12 months of Section 11 preliminary notification. Current elapsed duration: <strong>7 months</strong> (5 months remaining).
            </p>
          </div>
        </div>
      )}

      {/* Stepper Timeline */}
      <div className="space-y-2.5">
        {stages.map((stage, idx) => {
          const isPassed = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const isUpcoming = idx > currentStageIndex;
          const milestone = project.milestones?.find(m => m.stage === stage.id);

          return (
            <div
              key={stage.id}
              className={`p-3 rounded border transition-colors ${
                isCurrent
                  ? 'bg-blue-50/70 border-blue-400'
                  : isPassed
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : 'bg-white border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isPassed
                        ? 'bg-emerald-700 text-white'
                        : isCurrent
                        ? 'bg-[#002b49] text-white ring-2 ring-blue-200'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isPassed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#002b49] bg-white px-1.5 py-0.2 rounded border border-slate-300">
                        {stage.section}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {stage.title}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] bg-blue-100 text-blue-900 border border-blue-300 px-1.5 py-0.2 rounded font-semibold uppercase">
                          Current Stage
                        </span>
                      )}
                      {isPassed && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-snug m-0">
                      {stage.desc}
                    </p>

                    {milestone?.date && (
                      <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-2">
                        <span>Recorded Date: <strong className="text-slate-700">{milestone.date}</strong></span>
                        {milestone.remarks && (
                          <>
                            <span>•</span>
                            <span>Remarks: <em>{milestone.remarks}</em></span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="hidden md:block text-right shrink-0">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">
                    Designated SLAO
                  </div>
                  <div className="text-xs text-slate-700 font-medium">
                    {project.slaoOfficer?.name || 'SLAO Jalandhar'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg max-w-lg w-full p-5 shadow-2xl animate-in zoom-in-95 text-slate-900">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 m-0">
                Advance RFCTLARR Acquisition Stage
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-3">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs text-slate-700">
                <div>Current Stage: <strong>{project.stageName}</strong></div>
                <div className="mt-1">
                  Next Milestone: <strong className="text-[#002b49]">{stages[currentStageIndex + 1]?.title}</strong>
                </div>
                <div className="mt-1 text-slate-500">
                  Statutory Rule: <em>{stages[currentStageIndex + 1]?.section}</em>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Officer Remarks / Gazette Notification Reference:
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Published in Gazette notification; No pending Section 15 objections."
                  className="w-full h-20 bg-white text-slate-900 text-xs border border-slate-300 rounded p-2.5 focus:ring-1 focus:ring-[#002b49] outline-none resize-none"
                />
              </div>

              <div className="text-[11px] text-slate-600 bg-blue-50 border border-blue-200 p-2 rounded flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-900 shrink-0" />
                <span>Signed electronically by: <strong>{currentUser?.name}</strong></span>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAdvance}
                disabled={advancing}
                className="px-4 py-1.5 rounded text-xs font-bold bg-[#002b49] hover:bg-[#003b66] text-white shadow-sm transition-colors cursor-pointer"
              >
                {advancing ? 'Processing...' : 'Confirm Stage Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
