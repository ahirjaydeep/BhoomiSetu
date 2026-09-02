"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, MapPin, Building2, Layers, AlertCircle, ArrowRight } from 'lucide-react';
import { GovCard } from '@/components/ui/GovCard';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { RFCTLARR_STAGES } from '@/lib/types/schema';

import { useProject } from '@/providers/ProjectProvider';

const FILTERS = ['All Projects', 'Critical Lapse Risk', 'Highways', 'Railways', 'Power Grid'];

export default function ProjectsMasterPage() {
  const [activeFilter, setActiveFilter] = useState('All Projects');
  const [search, setSearch] = useState('');
  
  const { availableProjects, loading } = useProject();

  const getCounts = () => {
    const counts: Record<string, number> = {};
    FILTERS.forEach(f => counts[f] = 0);
    
    availableProjects.forEach(p => {
      // Simulate Sec 19 lapse risk (60 days) for UI presentation if real sec11Date is missing
      const risk = p.currentStage <= 3 && (p.sec11Date ? (new Date(p.sec11Date).getTime() + 365*24*60*60*1000 - Date.now()) < 60*24*60*60*1000 : p.id === 'NH-44-DELHI-AMRITSAR');
      
      const typeUpper = (p.corridorType || p.projectType || '').toUpperCase();
      const minUpper = (p.ministry || '').toUpperCase();
      
      let cat = 'Other';
      if (typeUpper.includes('HIGHWAY') || typeUpper.includes('EXPRESSWAY') || typeUpper.includes('ROAD') || minUpper.includes('ROAD')) cat = 'Highways';
      else if (typeUpper.includes('RAIL') || minUpper.includes('RAIL')) cat = 'Railways';
      else if (typeUpper.includes('POWER') || typeUpper.includes('GRID')) cat = 'Power Grid';

      counts['All Projects']++;
      if (risk) counts['Critical Lapse Risk']++;
      if (counts[cat] !== undefined) counts[cat]++;
    });
    return counts;
  };

  const filterCounts = getCounts();

  const filtered = availableProjects.filter(p => {
    // 1. Search Match
    if (search) {
      const s = search.toLowerCase();
      const matchesSearch = 
        (p.name && p.name.toLowerCase().includes(s)) || 
        (p.id && p.id.toLowerCase().includes(s)) ||
        (p.state && p.state.toLowerCase().includes(s)) ||
        (p.districts && p.districts.join(' ').toLowerCase().includes(s));
      if (!matchesSearch) return false;
    }

    // 2. Risk Match
    const risk = p.currentStage <= 3 && (p.sec11Date ? (new Date(p.sec11Date).getTime() + 365*24*60*60*1000 - Date.now()) < 60*24*60*60*1000 : p.id === 'NH-44-DELHI-AMRITSAR');
    p.risk = risk; // Inject for card rendering

    if (activeFilter === 'All Projects') return true;
    if (activeFilter === 'Critical Lapse Risk') return risk;
    
    // 3. Category Match
    const typeUpper = (p.corridorType || p.projectType || '').toUpperCase();
    const minUpper = (p.ministry || '').toUpperCase();
    
    if (activeFilter === 'Highways') {
      return typeUpper.includes('HIGHWAY') || typeUpper.includes('EXPRESSWAY') || typeUpper.includes('ROAD') || minUpper.includes('ROAD');
    }
    if (activeFilter === 'Railways') {
      return typeUpper.includes('RAIL') || minUpper.includes('RAIL');
    }
    if (activeFilter === 'Power Grid') {
      return typeUpper.includes('POWER') || typeUpper.includes('GRID');
    }
    return false;
  });

  if (loading) {
    return <div className="p-10 flex items-center justify-center font-mono text-sm">Loading Master Projects...</div>;
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gov-primary tracking-tight m-0">National Acquisition Registry</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Manage and track statutory workflows across all infrastructure corridors.</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-2 ${
                activeFilter === f 
                  ? f === 'Critical Lapse Risk' ? 'bg-status-red text-white' : 'bg-gov-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeFilter === f ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {filterCounts[f] || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Search by ID or Project Name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-gov-primary outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(proj => (
          <ProjectCard key={proj.id} proj={proj} />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No projects found matching the selected filters.
          </div>
        )}
      </div>

    </div>
  );
}