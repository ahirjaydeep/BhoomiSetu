"use client";
import React, { useState } from 'react';
import { GovCard } from '@/components/ui/GovCard';
import { FileText, Scale, IndianRupee, Lock, Activity, Filter } from 'lucide-react';

type EventType = 'gazette' | 'award' | 'financial' | 'security' | 'objection';

interface AuditEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  timestamp: string;
  hash?: string;
}

const mockEvents: AuditEvent[] = [
  {
    id: 'evt-1',
    type: 'gazette',
    title: 'Gazette Notification Published',
    description: 'Sec 11(1) issued for NH-48 Vadodara Expansion (Khasra #102–145)',
    timestamp: '10 mins ago',
  },
  {
    id: 'evt-2',
    type: 'award',
    title: 'Award Determined',
    description: 'Form 11 Award finalized for Parcel #45, District Rajkot — ₹1.24 Cr',
    timestamp: '2 hours ago',
  },
  {
    id: 'evt-3',
    type: 'financial',
    title: 'DBT Payout Complete',
    description: 'PFMS Disbursed ₹42,50,000 to Beneficiary Aadhaar Hash ***892',
    timestamp: '3 hours ago',
  },
  {
    id: 'evt-4',
    type: 'security',
    title: 'Cryptographic Seal Generated',
    description: 'Form 16 Possession Certificate anchored to Vault',
    timestamp: '5 hours ago',
    hash: '8f3a...d91e'
  },
  {
    id: 'evt-5',
    type: 'objection',
    title: 'Section 15 Objection Filed',
    description: 'New citizen hearing requested for Parcel #89, Delhi-Mumbai Corridor',
    timestamp: '8 hours ago',
  }
];

const FILTERS = [
  { label: 'All Events', value: 'all' },
  { label: 'Gazette Notices', value: 'gazette' },
  { label: 'Financial Disbursals', value: 'financial' },
  { label: 'Objections', value: 'objection' }
];

export const LiveAuditFeed = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'gazette': return <FileText className="w-4 h-4 text-gov-blue" />;
      case 'award': return <Scale className="w-4 h-4 text-ashoka-gold" />;
      case 'financial': return <IndianRupee className="w-4 h-4 text-status-green" />;
      case 'security': return <Lock className="w-4 h-4 text-slate-600" />;
      case 'objection': return <Scale className="w-4 h-4 text-status-amber" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const getEventBg = (type: EventType) => {
    switch (type) {
      case 'gazette': return 'bg-blue-50 border-blue-200';
      case 'award': return 'bg-amber-50 border-amber-200';
      case 'financial': return 'bg-emerald-50 border-emerald-200';
      case 'security': return 'bg-slate-100 border-slate-300';
      case 'objection': return 'bg-amber-50 border-amber-300';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const filteredEvents = mockEvents.filter(evt => 
    activeFilter === 'all' || evt.type === activeFilter
  );

  return (
    <GovCard className="h-full flex flex-col">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gov-navy m-0 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gov-blue" />
            National Activity Log
          </h2>
          <p className="text-xs text-slate-500 mt-1">Real-time system audit & transaction trail</p>
        </div>
        
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-100 rounded-full shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-red opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-status-red"></span>
          </span>
          <span className="text-[10px] font-bold text-status-red uppercase tracking-wider">Live - Auto Refresh</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar border-b border-slate-100">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-3 py-1 rounded text-[10px] font-bold whitespace-nowrap transition-colors ${
              activeFilter === f.value
                ? 'bg-gov-navy text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 mt-2 max-h-[400px]">
        {filteredEvents.map((evt, idx) => (
          <div key={evt.id} className="relative pl-6 pb-2">
            
            {/* Timeline Line (except last item) */}
            {idx !== filteredEvents.length - 1 && (
              <div className="absolute left-2.5 top-5 bottom-[-10px] w-px bg-slate-200"></div>
            )}
            
            {/* Event Content Box */}
            <div className={`p-3 rounded-lg border ${getEventBg(evt.type)} relative group hover:shadow-sm transition-shadow`}>
              
              {/* Timeline Dot/Icon */}
              <div className="absolute -left-6 top-2 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm z-10">
                {getEventIcon(evt.type)}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-bold text-gov-navy">{evt.title}</span>
                  <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap bg-white/50 px-1.5 py-0.5 rounded border border-slate-200/50">
                    {evt.timestamp}
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-700 m-0 leading-tight">
                  {evt.description}
                </p>

                {evt.hash && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Tx Hash:</span>
                    <span className="text-[10px] font-mono font-medium text-slate-600 bg-slate-200/50 px-1.5 py-0.5 rounded">
                      {evt.hash}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-xs font-medium">
            No events match the selected filter.
          </div>
        )}
      </div>
    </GovCard>
  );
};
