"use client";
import React, { useState, useEffect } from 'react';
import { GovCard } from '@/components/ui/GovCard';
import { Scale, FileSignature, Home, Leaf, CalendarClock, IndianRupee } from 'lucide-react';

interface AttachedAssets {
  structureValue: number;
  treeValue: number;
}

interface SolatiumInterestCardProps {
  adjustedMarketValue: number;
  sec11Date: Date;
  awardDate: Date;
  attachedAssets?: AttachedAssets;
  onCalculated: (details: { solatium: number; interest: number; grossAward: number }) => void;
}

import { calculateSolatiumAndInterest } from '@/lib/utils/valuationEngine';

export const SolatiumInterestCard = ({ 
  adjustedMarketValue = 0, 
  sec11Date, 
  awardDate, 
  attachedAssets = { structureValue: 0, treeValue: 0 },
  onCalculated
}: SolatiumInterestCardProps) => {

  // Local state for assets allowing officer override if needed
  const [structureValue, setStructureValue] = useState<number>(attachedAssets.structureValue);
  const [treeValue, setTreeValue] = useState<number>(attachedAssets.treeValue);

  // Formatting Utility
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const {
    totalBaseCompensation,
    solatium,
    interest: additionalInterest,
    grossAward,
    daysElapsed
  } = calculateSolatiumAndInterest(
    adjustedMarketValue,
    structureValue,
    treeValue,
    sec11Date,
    awardDate
  );

  useEffect(() => {
    if (onCalculated) {
      onCalculated({ solatium, interest: additionalInterest, grossAward });
    }
  }, [adjustedMarketValue, structureValue, treeValue, sec11Date, awardDate]); // Excluding onCalculated

  return (
    <GovCard className="animate-in fade-in duration-500 shadow-sm border border-slate-200">
      
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-slate-50">
        <div className="w-8 h-8 rounded-full bg-ashoka-gold/10 flex items-center justify-center text-ashoka-gold">
          <Scale className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-black text-gov-navy leading-tight m-0">Sec 30 Solatium & Interest</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest m-0">Statutory Rights & Benefits</p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Asset Overrides and Time Config */}
        <div className="space-y-6">
          
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100 mb-4">
              Attached Assets (Sec 29)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-2"><Home className="w-3.5 h-3.5 text-gov-blue" /> Structure/Building Value</span>
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">PWD Evaluated</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                  <input 
                    type="number"
                    value={structureValue}
                    onChange={(e) => setStructureValue(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 text-sm font-mono rounded focus:ring-1 focus:ring-gov-navy outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-2"><Leaf className="w-3.5 h-3.5 text-status-green" /> Trees/Crops Value</span>
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Forest Dept Evaluated</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                  <input 
                    type="number"
                    value={treeValue}
                    onChange={(e) => setTreeValue(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 text-sm font-mono rounded focus:ring-1 focus:ring-gov-navy outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100 mb-4">
              Timeline (Sec 30)
            </h3>
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 text-slate-600 font-semibold"><CalendarClock className="w-3.5 h-3.5 text-gov-blue" /> Sec 11 Publication</span>
                <span className="font-mono text-gov-navy font-bold">{sec11Date.toLocaleDateString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 text-slate-600 font-semibold"><FileSignature className="w-3.5 h-3.5 text-gov-blue" /> Target Award Date</span>
                <span className="font-mono text-gov-navy font-bold">{awardDate.toLocaleDateString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-blue-200/60 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Days Elapsed</span>
                <span className="text-sm font-black text-gov-blue bg-white px-2 py-0.5 rounded shadow-sm border border-blue-100">
                  {daysElapsed} Days
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Final Output Summary */}
        <div className="space-y-6 flex flex-col h-full">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
            Comprehensive Award Summary
          </h3>

          <div className="flex-1 bg-slate-900 rounded-lg shadow-inner overflow-hidden flex flex-col">
            
            <div className="p-5 flex-1 space-y-4 text-white">
              <div className="flex justify-between items-end border-b border-white/10 pb-3">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Adjusted Market Value</div>
                  <div className="text-xs text-slate-300">(From Sec 26 Calculator)</div>
                </div>
                <div className="text-sm font-mono font-medium">{formatINR(adjustedMarketValue)}</div>
              </div>

              <div className="flex justify-between items-end border-b border-white/10 pb-3">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Base Compensation</div>
                  <div className="text-xs text-slate-300">Market Value + Attached Assets</div>
                </div>
                <div className="text-base font-mono font-bold text-blue-300">{formatINR(totalBaseCompensation)}</div>
              </div>

              <div className="flex justify-between items-end border-b border-white/10 pb-3">
                <div>
                  <div className="text-[10px] font-bold text-ashoka-gold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Scale className="w-3 h-3" /> Sec 30(1) Solatium
                  </div>
                  <div className="text-xs text-slate-300">100% of Base Compensation</div>
                </div>
                <div className="text-base font-mono font-bold text-ashoka-gold">+{formatINR(solatium)}</div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[10px] font-bold text-gov-blue uppercase tracking-wider mb-1 flex items-center gap-1">
                    <IndianRupee className="w-3 h-3" /> Sec 30(2) Interest
                  </div>
                  <div className="text-xs text-slate-300">12% p.a. from Sec 11 to Award</div>
                </div>
                <div className="text-base font-mono font-bold text-gov-blue">+{formatINR(additionalInterest)}</div>
              </div>
            </div>

            <div className="bg-[#001f33] border-t border-white/10 p-5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Final Award</span>
                <span className="text-[10px] font-bold text-slate-500">Base + Solatium + Interest</span>
              </div>
              <div className="text-3xl font-black text-white font-mono flex items-center gap-2">
                {formatINR(grossAward)}
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </GovCard>
  );
};
