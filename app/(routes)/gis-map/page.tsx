"use client";
import React, { useState } from 'react';
import { GisMapViewer } from '@/components/gis/GisMapViewer';
import { KhasraDetailDrawer } from '@/components/gis/KhasraDetailDrawer';
import { Filter, Search, Map, Layers } from 'lucide-react';
import { useProject } from '@/providers/ProjectProvider';
import { ProjectSelector } from '@/components/navigation/ProjectSelector';

const DISTRICTS = ['All Districts', 'Vadodara', 'Ahmedabad', 'Surat'];

export default function GisMapPage() {
  const { activeProjectId } = useProject();
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const [districtFilter, setDistrictFilter] = useState(DISTRICTS[0]);
  const [viewToggle, setViewToggle] = useState('All Parcels');

  const handleParcelSelect = (parcelId: string) => {
    setSelectedParcelId(parcelId);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] animate-in fade-in duration-500 overflow-hidden relative">
      
      {/* Top Filter Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm z-10 shrink-0">
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gov-blue/10 flex items-center justify-center">
              <Map className="w-4 h-4 text-gov-blue" />
            </div>
            <div>
              <h1 className="text-sm font-black text-gov-navy m-0 leading-tight">National GIS Cadastral Portal</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest m-0">Spatial Analytics Engine</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Project Dropdown using global context component */}
          <ProjectSelector />

          {/* District Dropdown */}
          <div className="relative">
            <select 
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-gov-navy"
            >
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Quick View Toggles */}
          <div className="flex bg-slate-100 p-1 rounded border border-slate-200">
            {['All Parcels', 'Only Affected', 'High Risk'].map(view => (
              <button
                key={view}
                onClick={() => setViewToggle(view)}
                className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${
                  viewToggle === view 
                    ? 'bg-white shadow-sm text-gov-navy' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 relative bg-slate-100 z-0 h-full w-full">
        <GisMapViewer 
          projectId={activeProjectId} 
          onParcelSelect={handleParcelSelect} 
        />
      </div>

      {/* Slide-out Drawer Component */}
      <KhasraDetailDrawer 
        selectedParcelId={selectedParcelId} 
        onClose={() => setSelectedParcelId(null)} 
      />

    </div>
  );
}