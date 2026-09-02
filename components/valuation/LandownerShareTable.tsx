"use client";
import React, { useState } from 'react';
import { GovCard } from '@/components/ui/GovCard';
import { StatBadge } from '@/components/ui/StatBadge';
import { Users, Edit2, AlertTriangle, ShieldCheck, HelpCircle, FileX } from 'lucide-react';
import { calculateLandownerShare } from '@/lib/utils/valuationEngine';

export interface Owner {
  id: string;
  name: string;
  sharePercentage: number;
  aadhaarHash: string;
  deductions: number;
  pfmsStatus: 'VERIFIED_DBT_READY' | 'NAME_MISMATCH_HOLD' | 'PENDING_VERIFICATION';
}

interface LandownerShareTableProps {
  grossAwardAmount: number;
  khasraNo: string;
  ownersList: Owner[];
}

export const LandownerShareTable = ({ grossAwardAmount, khasraNo, ownersList: initialOwners }: LandownerShareTableProps) => {
  const [owners, setOwners] = useState<Owner[]>(initialOwners);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);

  // Format Utility
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED_DBT_READY': return <ShieldCheck className="w-3.5 h-3.5 text-status-green" />;
      case 'NAME_MISMATCH_HOLD': return <AlertTriangle className="w-3.5 h-3.5 text-status-red" />;
      default: return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'VERIFIED_DBT_READY': return 'success';
      case 'NAME_MISMATCH_HOLD': return 'error';
      case 'PENDING_VERIFICATION': return 'neutral';
      default: return 'neutral';
    }
  };

  return (
    <GovCard className="animate-in fade-in duration-500 shadow-sm border border-slate-200">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gov-blue/10 flex items-center justify-center text-gov-blue">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight m-0">Landowner Share Apportionment</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest m-0">Khasra {khasraNo}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest m-0">Total Award Amount</div>
          <div className="text-base font-black text-slate-900 dark:text-slate-100 font-mono tabular-nums leading-tight">{formatINR(grossAwardAmount)}</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="p-4 py-3">Landowner Details</th>
              <th className="p-4 py-3">Ownership Share</th>
              <th className="p-4 py-3 text-right">Gross Payout</th>
              <th className="p-4 py-3 text-right">TDS / Deductions</th>
              <th className="p-4 py-3 text-right">Net Payable</th>
              <th className="p-4 py-3">PFMS Bank Status</th>
              <th className="p-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-transparent">
            {owners.map((owner) => {
              const { grossPayout, netPayable } = calculateLandownerShare(
                grossAwardAmount,
                owner.sharePercentage,
                owner.deductions
              );

              return (
                <tr key={owner.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{owner.name}</div>
                    <div className="text-[10px] font-mono tabular-nums text-slate-500 flex items-center gap-1 mt-0.5">
                      Aadhaar: {owner.aadhaarHash}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-mono tabular-nums font-bold text-sm px-2 py-1 rounded">
                      {owner.sharePercentage}%
                    </div>
                  </td>
                  
                  <td className="p-4 text-right font-mono tabular-nums text-sm text-slate-700 dark:text-slate-300">
                    {formatINR(grossPayout)}
                  </td>
                  
                  <td className="p-4 text-right font-mono tabular-nums text-xs text-rose-600 dark:text-rose-400">
                    - {formatINR(owner.deductions)}
                  </td>
                  
                  <td className="p-4 text-right">
                    <div className="font-mono tabular-nums font-black text-sm text-emerald-600 dark:text-emerald-400">
                      {formatINR(netPayable)}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <StatBadge 
                      variant={getStatusVariant(owner.pfmsStatus) as any}
                      label={owner.pfmsStatus.replace(/_/g, ' ')}
                      icon={getStatusIcon(owner.pfmsStatus)}
                    />
                  </td>
                  
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => setSelectedOwner(owner)}
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-all active:scale-[0.98] ring-offset-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      title="Adjust Shares or Flag Dispute"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Warning if shares don't equal 100% */}
      {owners.reduce((sum, o) => sum + o.sharePercentage, 0) !== 100 && (
        <div className="bg-amber-500/10 border-t border-amber-500/20 p-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 m-0">Share Apportionment Mismatch</h4>
            <p className="text-xs text-amber-800/80 dark:text-amber-400/80 mt-1">
              The total ownership shares do not equal 100%. Please adjust the share distribution before generating the final Form 11 award.
            </p>
          </div>
        </div>
      )}

      {/* Mock Edit Modal Overlay */}
      {selectedOwner && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[600] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm">Adjust Ownership Share</h3>
              <button onClick={() => setSelectedOwner(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <FileX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Landowner</label>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded">{selectedOwner.name}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">New Share Percentage (%)</label>
                <input 
                  type="number" 
                  defaultValue={selectedOwner.sharePercentage} 
                  className="w-full border border-slate-300 dark:border-slate-700 bg-transparent rounded px-3 py-2 font-mono tabular-nums text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button 
                  onClick={() => setSelectedOwner(null)}
                  className="flex-1 px-4 py-2 bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98] outline-none focus:ring-2 focus:ring-slate-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setSelectedOwner(null)}
                  className="flex-1 px-4 py-2 bg-indigo-950 dark:bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-900 dark:hover:bg-indigo-500 transition-all active:scale-[0.98] outline-none focus:ring-2 focus:ring-indigo-500 ring-offset-1"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </GovCard>
  );
};
