"use client";
import React, { useState } from 'react';
import { GovCard } from '@/components/ui/GovCard';
import { StatBadge } from '@/components/ui/StatBadge';
import { 
  Search, Download, Map, Users, IndianRupee, 
  ShieldCheck, CheckCircle2, AlertTriangle, FileText
} from 'lucide-react';
import { VillageBreakupTable } from '@/components/projects/VillageBreakupTable';

const MOCK_PARCELS = [
  { id: 'KHS-401', village: 'Ratanpur', owner: 'Ramesh Patel', area: 2.4, rate: 4500000, status: 'SEC11_NOTIFIED' },
  { id: 'KHS-402', village: 'Ratanpur', owner: 'Suresh Kumar', area: 1.1, rate: 4500000, status: 'AWARD_DETERMINED' },
  { id: 'KHS-403', village: 'Paldi', owner: 'Meena Devi', area: 0.8, rate: 6200000, status: 'POSSESSED' },
  { id: 'KHS-404', village: 'Paldi', owner: 'Govt. Land (Gauchar)', area: 4.5, rate: 0, status: 'POSSESSED' },
];

const MOCK_OBJECTIONS = [
  { id: 'OBJ-001', citizen: 'Ramesh Patel', khasra: 'KHS-401', date: '2025-11-12', remark: 'Area measurement discrepancy', status: 'PENDING_HEARING' },
  { id: 'OBJ-002', citizen: 'Vijay Singh', khasra: 'KHS-389', date: '2025-11-05', remark: 'Request for higher valuation based on adjacent highway', status: 'RESOLVED' },
  { id: 'OBJ-003', citizen: 'Meena Devi', khasra: 'KHS-403', date: '2025-10-28', remark: 'Structural damage to remaining property', status: 'COMPENSATION_REVISED' },
];

const MOCK_AUDIT = [
  { id: 'TX-99a', time: '2025-09-01 10:24 AM', event: 'Project Created', user: 'Central Admin', hash: 'e3b0c442' },
  { id: 'TX-99b', time: '2025-10-15 02:15 PM', event: 'Sec 11 Gazette Published', user: 'SLAO Rajkot', hash: '8f3ad91e' },
  { id: 'TX-99c', time: '2025-11-20 11:45 AM', event: 'Objection Hearing Concluded', user: 'Collector Rajkot', hash: '7c2bd80f' },
];

export const FinancialSummaryTab = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <GovCard className="bg-gov-navy text-white border-0">
          <div className="text-sm font-semibold text-blue-200 mb-1">Total Escrow Allocation</div>
          <div className="text-3xl font-black mb-4">₹85.40 Cr</div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1 text-blue-100">
                <span>Disbursed via PFMS</span>
                <span className="font-bold">62%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                <div className="bg-status-green h-1.5 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>
          </div>
        </GovCard>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <h4 className="font-bold text-emerald-900 text-sm mb-3">Statutory Breakup</h4>
          <div className="space-y-2 text-xs text-emerald-800">
            <div className="flex justify-between border-b border-emerald-200/50 pb-1">
              <span>Base Land Value:</span> <span className="font-mono">₹38.20 Cr</span>
            </div>
            <div className="flex justify-between border-b border-emerald-200/50 pb-1">
              <span>Rural Multiplier (x1.5):</span> <span className="font-mono">₹19.10 Cr</span>
            </div>
            <div className="flex justify-between border-b border-emerald-200/50 pb-1">
              <span>100% Solatium:</span> <span className="font-mono">₹28.10 Cr</span>
            </div>
            <div className="flex justify-between font-bold pt-1">
              <span>Total Award:</span> <span className="font-mono">₹85.40 Cr</span>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-2">
        <GovCard className="h-full">
          <h3 className="text-sm font-bold text-gov-navy mb-4">Recent Disbursals</h3>
          <div className="space-y-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-status-green/10 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-status-green" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">PFMS UTR: BKID{Math.floor(Math.random() * 10000000)}</div>
                    <div className="text-xs text-slate-500">Credited to Beneficiary Aadhaar Hash ***892</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">₹{(Math.random() * 50 + 10).toFixed(2)} Lakhs</div>
                  <div className="text-[10px] text-slate-400">Oct {15 + i}, 2025</div>
                </div>
              </div>
            ))}
          </div>
        </GovCard>
      </div>
    </div>
  );
};

export const ObjectionsLedgerTab = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export Ledger
        </button>
      </div>
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-amber-50/50 border-b border-amber-200 text-amber-900 font-semibold">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Citizen</th>
              <th className="px-4 py-3">Khasra Ref</th>
              <th className="px-4 py-3">Hearing Date</th>
              <th className="px-4 py-3">SLAO Remarks</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {MOCK_OBJECTIONS.map((obj) => (
              <tr key={obj.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-mono font-medium text-gov-navy">{obj.id}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{obj.citizen}</td>
                <td className="px-4 py-3 font-mono text-slate-500">{obj.khasra}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(obj.date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-slate-600 text-xs max-w-xs truncate">{obj.remark}</td>
                <td className="px-4 py-3">
                  <StatBadge 
                    variant={obj.status === 'PENDING_HEARING' ? 'danger' : obj.status === 'RESOLVED' ? 'success' : 'info'} 
                    label={obj.status.replace('_', ' ')} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const AuditTrailTab = () => {
  return (
    <div className="space-y-0 p-4 bg-white rounded-lg border border-slate-200">
      {MOCK_AUDIT.map((log, idx) => (
        <div key={log.id} className="flex gap-4 relative">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-gov-blue z-10 ring-4 ring-white mt-1.5"></div>
            {idx !== MOCK_AUDIT.length - 1 && (
              <div className="w-px h-full bg-slate-200 mt-1"></div>
            )}
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 w-full mb-4 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-gov-navy m-0">{log.event}</h4>
                <div className="text-xs text-slate-500 mt-1">Authorized by: <strong className="text-slate-700">{log.user}</strong></div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-600">{log.time}</div>
                <div className="text-[10px] font-mono text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded mt-1 inline-block">
                  Hash: {log.hash}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="flex gap-4 relative mt-2">
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-slate-300 z-10 ring-4 ring-white mt-1.5 animate-pulse"></div>
        </div>
        <div className="w-full pt-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting Next Transition</div>
        </div>
      </div>
    </div>
  );
};

export const DocumentsTab = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-slate-200 text-center">
      <FileText className="w-12 h-12 text-slate-300 mb-4" />
      <h3 className="text-lg font-bold text-slate-700">SLAO Document Repository</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-sm">
        Secure storage for Section 4, 11, 15, and 19 gazette notifications. 
        Pending integration with the State Revenue Document Service.
      </p>
      <button className="mt-6 px-4 py-2 bg-gov-blue text-white rounded-lg text-sm font-bold shadow-sm hover:bg-gov-navy transition-colors">
        Upload Document
      </button>
    </div>
  );
};
