"use client";
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Building2,
  TrendingUp,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  IndianRupee,
  Layers,
  ArrowUpRight,
  FolderPlus,
  FileText
} from 'lucide-react';

export const Dashboard = ({
  analytics,
  projects = [],
  parcels = [],
  onOpenProposalModal,
  onSelectProject,
  setActiveTab
}) => {
  if (!analytics || !analytics.kpis) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-[#002b49] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        Loading National Land Records Telemetry...
      </div>
    );
  }

  const { kpis, stateBreakdown, stageDistribution } = analytics;
  const GOV_CHART_COLORS = ['#002b49', '#1e3a8a', '#0284c7', '#0f766e', '#ca8a04', '#c2410c', '#15803d'];

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#002b49] uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              PM GatiShakti National Master Plan
            </span>
            <span className="text-xs text-slate-500">DoLR National Land Monitoring Cell</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-1 m-0">
            National Land Acquisition & Management Dashboard
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time multi-state monitoring of infrastructure corridors under the RFCTLARR Act, 2013.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('gis-map')}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-md border border-slate-300 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#002b49]" />
            <span>Open Cadastral Map</span>
          </button>

          <button
            onClick={onOpenProposalModal}
            className="flex items-center gap-1.5 bg-[#002b49] hover:bg-[#003b66] text-white text-xs font-semibold px-3.5 py-2 rounded-md transition-colors cursor-pointer shadow-sm"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Submit Proposal (LRB)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Land Required */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Requisitioned Land
            </span>
            <div className="p-1.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {kpis.totalLandRequiredHa.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">Ha</span>
          </div>
          <div className="text-xs text-slate-600 mt-1">
            Across <strong>{kpis.totalProjects}</strong> National Corridors
          </div>
        </div>

        {/* Land Acquired & Possession */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Unencumbered Possession
            </span>
            <div className="p-1.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-800 mt-2 font-mono">
            {kpis.totalPossessionHandedOverHa.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">Ha</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
              <div
                className="bg-emerald-700 h-full rounded-full"
                style={{ width: `${kpis.possessionProgressPct}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-emerald-800 font-mono">
              {kpis.possessionProgressPct}%
            </span>
          </div>
        </div>

        {/* Compensation Disbursed */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Compensation Disbursed (PFMS)
            </span>
            <div className="p-1.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            ₹{kpis.totalDisbursedCr.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">Cr</span>
          </div>
          <div className="text-xs text-slate-600 mt-1">
            Escrow Budget: <strong>₹{kpis.totalBudgetCr} Cr</strong> ({kpis.disbursedPercentage}%)
          </div>
        </div>

        {/* Cadastral Parcels & Disputes */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Cadastral Survey Parcels
            </span>
            <div className="p-1.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {kpis.totalParcelsCount} <span className="text-xs font-normal text-slate-500">Plots</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="text-emerald-700 font-semibold">
              Possessed: {kpis.possessionHandedParcelsCount}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-red-700 font-semibold">
              Under Sec 15 Dispute: {kpis.disputedParcelsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: State Land Acquisition & Disbursement Comparison */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
                State-wise Acquisition Progress (Hectares)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Requisitioned Area vs Actual Possession Handed Over
              </p>
            </div>
            <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              Official DoLR Returns
            </span>
          </div>

          <div className="h-60 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="state" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.375rem', fontSize: '11px', color: '#0f172a' }}
                />
                <Bar dataKey="requiredHa" name="Requisitioned (Ha)" fill="#1e3a8a" radius={[2, 2, 0, 0]} />
                <Bar dataKey="acquiredHa" name="Possessed (Ha)" fill="#15803d" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: RFCTLARR Stage Distribution */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
                RFCTLARR Stage Progression
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Active Projects across 7 Statutory Milestones
              </p>
            </div>
          </div>

          <div className="h-60 mt-3 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageDistribution}
                  dataKey="count"
                  nameKey="stage"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={40}
                  paddingAngle={2}
                >
                  {stageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GOV_CHART_COLORS[index % GOV_CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.375rem', fontSize: '11px' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '10px', color: '#334155' }}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
              Active National Infrastructure Projects
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Click any project to inspect statutory milestones and Section 15 inquiry records
            </p>
          </div>
          <button
            onClick={() => setActiveTab('projects')}
            className="text-xs text-[#002b49] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View All Records ({projects.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {projects.map((project) => {
            const healthScore = project.bottleneckAnalysis?.healthScore || 85;
            return (
              <div
                key={project.id}
                onClick={() => {
                  onSelectProject(project);
                  setActiveTab('projects');
                }}
                className="bg-slate-50 border border-slate-200 hover:border-slate-400 p-3.5 rounded-md transition-colors cursor-pointer flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#002b49] bg-white px-2 py-0.5 rounded border border-slate-300">
                      {project.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        healthScore >= 75
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      SLA Index: {healthScore}%
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2 m-0 leading-snug">
                    {project.name}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {project.requiringBody} • <strong className="text-slate-800">{project.state}</strong>
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-200 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Statutory Milestone:</span>
                    <span className="font-semibold text-blue-900 truncate max-w-[150px]">
                      {project.stageName}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Possession Granted:</span>
                    <span className="font-bold text-emerald-800 font-mono">
                      {project.possessionHandedOverHa} / {project.totalLandRequiredHa} Ha
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
