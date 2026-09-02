"use client";
import React, { useState } from 'react';
import { GovCard } from '@/components/ui/GovCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Filter } from 'lucide-react';
import { CustomTooltip, chartAxisProps, chartGridProps } from '@/components/ui/ChartTheme';

const SECTORS = ['All Corridors', 'NHAI Highways', 'Indian Railways', 'Industrial Nodes'];

const barData = [
  { 
    name: 'Delhi-Mumbai Exp', 
    'Stage 1 (Prep)': 800, 
    'Stage 2 (SIA)': 1200, 
    'Stage 3 (Sec 11)': 900, 
    'Stage 4 (Sec 15)': 600, 
    'Stage 5 (Sec 19)': 500, 
    'Stage 6 (Award)': 1500, 
    'Stage 7 (Possession)': 3200 
  },
  { 
    name: 'Amritsar-Kolkata Ind.', 
    'Stage 1 (Prep)': 500, 
    'Stage 2 (SIA)': 800, 
    'Stage 3 (Sec 11)': 600, 
    'Stage 4 (Sec 15)': 400, 
    'Stage 5 (Sec 19)': 300, 
    'Stage 6 (Award)': 1100, 
    'Stage 7 (Possession)': 2100 
  },
  { 
    name: 'Dedicated Freight', 
    'Stage 1 (Prep)': 300, 
    'Stage 2 (SIA)': 500, 
    'Stage 3 (Sec 11)': 400, 
    'Stage 4 (Sec 15)': 200, 
    'Stage 5 (Sec 19)': 200, 
    'Stage 6 (Award)': 800, 
    'Stage 7 (Possession)': 1800 
  },
];

const STAGE_COLORS = {
  'Stage 1 (Prep)': '#94a3b8', // slate-400
  'Stage 2 (SIA)': '#64748b', // slate-500
  'Stage 3 (Sec 11)': '#D97706', // gov-accent (amber)
  'Stage 4 (Sec 15)': '#b45309', // amber-700
  'Stage 5 (Sec 19)': '#0f766e', // teal-700
  'Stage 6 (Award)': '#064E3B', // gov-primary (emerald-900)
  'Stage 7 (Possession)': '#059669' // gov-emerald
};

const donutData = [
  { name: 'Gujarat', value: 4500 },
  { name: 'Maharashtra', value: 3800 },
  { name: 'Uttar Pradesh', value: 5200 },
  { name: 'Rajasthan', value: 3100 },
];
// Updated DONUT_COLORS to new tokens
const DONUT_COLORS = ['#064E3B', '#D97706', '#059669', '#0f766e']; 

export const CorridorProgressCharts = () => {
  const [activeSector, setActiveSector] = useState('All Corridors');

  return (
    <GovCard className="w-full">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/50">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 m-0">National Corridor Progress</h2>
          <p className="text-xs text-slate-500 font-normal mt-1">Stage-wise land acquisition breakdown across active mega-projects (in Hectares)</p>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {SECTORS.map((sector) => (
            <button
              key={sector}
              onClick={() => setActiveSector(sector)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeSector === sector
                  ? 'bg-gov-primary text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover-lift'
              }`}
            >
              {sector}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Panel: Stacked Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col min-h-[350px]">
          <h3 className="text-xs font-bold text-slate-700 mb-4 uppercase tracking-wider">Stage Distribution by Project (Ha)</h3>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barGap={2}
                barCategoryGap="20%"
              >
                <defs>
                  {Object.entries(STAGE_COLORS).map(([key, color], idx) => (
                    <linearGradient key={`grad-${idx}`} id={`colorUv-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.9} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.7} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid {...chartGridProps} />
                <XAxis dataKey="name" {...chartAxisProps} />
                <YAxis {...chartAxisProps} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 500, color: '#94a3b8' }} />
                
                {Object.entries(STAGE_COLORS).map(([key, color], idx) => (
                  <Bar 
                    key={key} 
                    dataKey={key} 
                    stackId="a" 
                    fill={`url(#colorUv-${idx})`} 
                    radius={[6, 6, 0, 0]} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Panel: Donut Chart (1 Col) */}
        <div className="flex flex-col min-h-[350px] border-t lg:border-t-0 lg:border-l border-slate-200/50 pt-6 lg:pt-0 lg:pl-8">
          <h3 className="text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">State-wise Acquisition</h3>
          <p className="text-[10px] text-slate-500 mb-4 font-medium">Total Hectares Acquired</p>
          <div className="flex-1 w-full min-h-[250px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius="72%"
                  outerRadius="90%"
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Donut Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
              <span className="text-2xl font-black text-gov-primary mt-0.5 tracking-tight">16.6K</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase">Hectares</span>
            </div>
          </div>
          
          {/* Custom Donut Legend */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            {donutData.map((entry, index) => (
               <div key={entry.name} className="flex items-center gap-2 bg-slate-50 rounded px-2 py-1.5 border border-slate-100">
                <div 
                  className="w-2.5 h-2.5 rounded-sm shrink-0 shadow-sm" 
                  style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                ></div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-bold text-slate-700 truncate">{entry.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono font-medium">{entry.value.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </GovCard>
  );
};
