"use client";
import React, { useState } from 'react';
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline';
import { BottleneckAlerts } from '@/components/dashboard/BottleneckAlerts';
import {
  FolderGit2,
  Search,
  FolderPlus,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';

export const ProjectsPage = ({
  projects = [],
  parcels = [],
  selectedProject,
  onSelectProject,
  onStageAdvanced,
  onOpenProposalModal
}) => {
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredProjects = projects.filter((p) => {
    if (stateFilter !== 'ALL' && p.state !== stateFilter) return false;
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(s) ||
        p.id.toLowerCase().includes(s) ||
        p.requiringBody.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const activeProject = selectedProject || filteredProjects[0] || projects[0];

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#002b49] uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              RFCTLARR Statutory Pipeline
            </span>
          </div>
          <h1 className="text-base font-bold text-slate-900 mt-1 m-0">
            Infrastructure Projects & Acquisition Workflows
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end statutory tracking from Requisition to Section 38 Possession Handover.
          </p>
        </div>

        <button
          onClick={onOpenProposalModal}
          className="flex items-center gap-1.5 bg-[#002b49] hover:bg-[#003b66] text-white text-xs font-semibold px-3.5 py-2 rounded-md transition-colors cursor-pointer shadow-sm"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>New Acquisition Requisition</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex-1 min-w-[220px] relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by ID, Name, or Requiring Body..."
            className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded pl-8 pr-3 py-1.5 outline-none focus:ring-1 focus:ring-[#002b49]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#002b49]"
          >
            <option value="ALL">All States</option>
            <option value="Punjab">Punjab</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Delhi (NCT)">Delhi (NCT)</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#002b49]"
          >
            <option value="ALL">All Categories</option>
            <option value="Highways & Transport">Highways & Transport</option>
            <option value="Railways & Logistics">Railways & Logistics</option>
            <option value="Renewable Energy">Renewable Energy</option>
            <option value="Urban Transit">Urban Transit</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Project List Tabs + Active Project Stepper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Project Selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-1">
            Projects ({filteredProjects.length})
          </div>

          <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
            {filteredProjects.map((p) => {
              const isSelected = activeProject?.id === p.id;
              const possessionPct = p.totalLandRequiredHa > 0
                ? ((p.possessionHandedOverHa / p.totalLandRequiredHa) * 100).toFixed(0)
                : 0;

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className={`p-3 rounded border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#002b49] bg-slate-100 px-1.5 py-0.2 rounded border border-slate-300">
                      {p.id}
                    </span>
                    <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                      {p.state}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2 m-0 leading-snug">
                    {p.name}
                  </h3>

                  <div className="mt-2 pt-1.5 border-t border-slate-200 flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 truncate max-w-[130px]">
                      {p.stageName}
                    </span>
                    <span className="text-emerald-800 font-bold font-mono">
                      {possessionPct}% Possession
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Active Project Detailed Workflow (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {activeProject ? (
            <>
              <WorkflowTimeline
                project={activeProject}
                onStageAdvanced={onStageAdvanced}
              />

              {/* Project Bottleneck Inspector */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 m-0">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> Decision Support & Risk Analysis
                  </h3>
                  <span className="text-xs text-slate-500">
                    SLA Compliance Score: <strong className="text-emerald-800">{activeProject.bottleneckAnalysis?.healthScore || 85}%</strong>
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeProject.bottleneckAnalysis?.issues?.map((issue, idx) => (
                    <div
                      key={idx}
                      className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-900"
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{issue.title}</span>
                        <span className="text-[9px] bg-red-700 text-white px-1.5 py-0.2 rounded font-bold uppercase">
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-red-800 mt-0.5 m-0">{issue.description}</p>
                      <div className="mt-1.5 text-amber-900 bg-white p-2 rounded border border-red-200">
                        <strong>Action:</strong> {issue.recommendedAction}
                      </div>
                    </div>
                  ))}

                  {(!activeProject.bottleneckAnalysis?.issues || activeProject.bottleneckAnalysis.issues.length === 0) && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>No statutory bottlenecks detected. Project proceeding within RFCTLARR SLA timelines.</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500">
              Select a project from the left to view its statutory workflow.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
