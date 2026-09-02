import React from 'react';

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg backdrop-blur-md">
        {label && <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color || entry.payload.fill }} />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{entry.name}:</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{entry.value?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const chartAxisProps = {
  tick: { fontSize: 11, fontWeight: 500, fill: '#94a3b8' }, // text-[11px] font-medium fill-slate-400
  axisLine: { stroke: '#e2e8f0', strokeWidth: 1 },
  tickLine: false,
};

export const chartGridProps = {
  stroke: "#334155",
  strokeDasharray: "3 3",
  opacity: 0.3,
  vertical: false,
};
