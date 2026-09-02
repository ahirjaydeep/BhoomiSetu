"use client";
import React from 'react';
import {
  AlertTriangle,
  Clock,
  ShieldAlert,
  Zap,
  TrendingDown,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';

export const BottleneckAlerts = ({ projects = [] }) => {
  const allIssues = [];
  const allWarnings = [];

  projects.forEach((p) => {
    if (p.bottleneckAnalysis) {
      p.bottleneckAnalysis.issues?.forEach((issue) => {
        allIssues.push({ ...issue, project: p });
      });
      p.bottleneckAnalysis.warnings?.forEach((warn) => {
        allWarnings.push({ ...warn, project: p });
      });
    }
  });

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-amber-50 text-amber-900 border border-amber-200">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider m-0">
              Statutory SLA Compliance & Bottleneck Early Warning System
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated monitors for Section 19 lapse prevention & Right-of-Way risk mitigation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded font-bold font-mono">
            {allIssues.length} Critical Alerts
          </span>
          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold font-mono">
            {allWarnings.length} Statutory Clocks
          </span>
        </div>
      </div>

      {/* Grid of Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Statutory Warnings */}
        {allWarnings.map((warn, i) => (
          <div
            key={i}
            className="bg-amber-50/70 border border-amber-300 rounded p-3.5 flex flex-col justify-between space-y-2 text-slate-900"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                  {warn.type}
                </span>
                <span className="text-[10px] text-amber-800 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> RFCTLARR Sec 19(7) SLA
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 mt-1 m-0">
                {warn.title}
              </h3>
              <p className="text-xs text-slate-700 mt-0.5 leading-snug m-0">
                {warn.description}
              </p>
              <div className="text-[11px] text-slate-600 mt-1">
                Project: <strong className="text-slate-900">{warn.project.name}</strong> ({warn.project.state})
              </div>
            </div>

            <div className="bg-white p-2.5 rounded border border-amber-200 text-xs text-amber-950">
              <strong>Recommended Action:</strong> {warn.recommendedAction}
            </div>
          </div>
        ))}

        {/* Bottleneck Issues */}
        {allIssues.map((issue, i) => (
          <div
            key={i}
            className="bg-red-50/70 border border-red-300 rounded p-3.5 flex flex-col justify-between space-y-2 text-slate-900"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold text-red-900 bg-red-100 px-1.5 py-0.2 rounded border border-red-300">
                  {issue.type}
                </span>
                <span className="text-[9px] bg-red-700 text-white px-1.5 py-0.2 rounded font-bold uppercase">
                  {issue.severity}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 mt-1 m-0">
                {issue.title}
              </h3>
              <p className="text-xs text-slate-700 mt-0.5 leading-snug m-0">
                {issue.description}
              </p>
              <div className="text-[11px] text-slate-600 mt-1">
                Project: <strong className="text-slate-900">{issue.project.name}</strong>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded border border-red-200 text-xs text-red-950">
              <strong>Recommended Action:</strong> {issue.recommendedAction}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
