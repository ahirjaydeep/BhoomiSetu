"use client";
import React, { useState, useEffect } from 'react';
import { GovCard } from '@/components/ui/GovCard';
import { Calculator, IndianRupee, Map, FileText, ChevronRight } from 'lucide-react';
import { calculateBaseMarketValue } from '@/lib/utils/valuationEngine';

interface MarketValueCalculatorProps {
  areaHectares: number;
  onCalculated: (marketValue: number) => void;
}

export const MarketValueCalculator = ({ areaHectares, onCalculated }: MarketValueCalculatorProps) => {
  // Input States
  const [classification, setClassification] = useState<'urban' | 'rural'>('rural');
  const [multiplier, setMultiplier] = useState<number>(1.5);
  const [circleRate, setCircleRate] = useState<number>(4500000); // 45 Lakh default
  const [saleDeedAvg, setSaleDeedAvg] = useState<number>(4200000);
  const [area, setArea] = useState<number>(areaHectares); // Hectares

  useEffect(() => {
    setArea(areaHectares);
  }, [areaHectares]);

  // Derived States
  const [baseRate, setBaseRate] = useState<number>(0);
  const [marketValue, setMarketValue] = useState<number>(0);

  // Formatting Utility
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Recalculation Engine
  useEffect(() => {
    // Determine effective multiplier
    const effectiveMultiplier = classification === 'urban' ? 1.0 : multiplier;
    if (classification === 'urban' && multiplier !== 1.0) {
      setMultiplier(1.0);
    }

    const { baseRate: calcBase, marketValue: finalValue } = calculateBaseMarketValue(
      area,
      circleRate,
      saleDeedAvg,
      effectiveMultiplier,
      classification === 'urban'
    );

    setBaseRate(calcBase);
    setMarketValue(finalValue);
    
    if (onCalculated) {
      onCalculated(finalValue);
    }
  }, [classification, multiplier, circleRate, saleDeedAvg, area]); // Exclude onCalculated to avoid re-renders if unstable

  return (
    <GovCard className="animate-in fade-in duration-500 shadow-sm border border-slate-200">
      
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-slate-50">
        <div className="w-8 h-8 rounded-full bg-gov-blue/10 flex items-center justify-center text-gov-blue">
          <Calculator className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-black text-gov-navy leading-tight m-0">Sec 26 Market Value Determination</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest m-0">RFCTLARR First Schedule</p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Input Parameters Form */}
        <div className="space-y-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">Parameters</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Classification</label>
              <select 
                value={classification}
                onChange={(e) => setClassification(e.target.value as 'urban' | 'rural')}
                className="w-full bg-slate-50 border border-slate-200 text-sm rounded px-3 py-2 focus:ring-1 focus:ring-gov-navy outline-none"
              >
                <option value="rural">Rural</option>
                <option value="urban">Urban</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Distance Multiplier</label>
              <select 
                value={multiplier}
                onChange={(e) => setMultiplier(Number(e.target.value))}
                disabled={classification === 'urban'}
                className="w-full bg-slate-50 border border-slate-200 text-sm rounded px-3 py-2 focus:ring-1 focus:ring-gov-navy outline-none disabled:opacity-50"
              >
                <option value={1.0}>1.0x (Urban / Near Limit)</option>
                <option value={1.2}>1.2x (10-20 km)</option>
                <option value={1.5}>1.5x (20-30 km)</option>
                <option value={2.0}>2.0x (>30 km Remote)</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
                <Map className="w-3.5 h-3.5 text-slate-400" /> Base Circle Rate (per Ha)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                <input 
                  type="number"
                  value={circleRate}
                  onChange={(e) => setCircleRate(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 text-sm font-mono rounded focus:ring-1 focus:ring-gov-navy outline-none"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Registered Sale Deed Avg (per Ha)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                <input 
                  type="number"
                  value={saleDeedAvg}
                  onChange={(e) => setSaleDeedAvg(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 text-sm font-mono rounded focus:ring-1 focus:ring-gov-navy outline-none"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
                <Map className="w-3.5 h-3.5 text-ashoka-gold" /> Total Affected Area (Ha)
              </label>
              <input 
                type="number"
                step="0.01"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full px-3 py-2 bg-yellow-50/50 border border-yellow-200 text-sm font-mono font-bold text-gov-navy rounded focus:ring-1 focus:ring-gov-navy outline-none"
              />
            </div>
          </div>
        </div>

        {/* Real-time Calculation Output */}
        <div className="space-y-5 flex flex-col h-full">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">Live Calculation Engine</h3>
          
          <div className="flex-1 bg-gov-navy rounded-lg shadow-inner overflow-hidden flex flex-col border border-slate-800">
            <div className="p-5 flex-1 space-y-4 text-white">
              
              <div className="flex justify-between items-end border-b border-white/10 pb-3">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Determined Base Rate</div>
                  <div className="text-xs text-slate-300">Max(Circle Rate, Sale Deed)</div>
                </div>
                <div className="text-lg font-mono font-medium">{formatINR(baseRate)}</div>
              </div>

              <div className="flex justify-between items-end border-b border-white/10 pb-3">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Area Factor</div>
                  <div className="text-xs text-slate-300">Total Hectares Acquired</div>
                </div>
                <div className="text-lg font-mono font-medium text-ashoka-gold">× {area} Ha</div>
              </div>

              <div className="flex justify-between items-end border-b border-white/10 pb-3">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Distance Factor</div>
                  <div className="text-xs text-slate-300">{classification === 'urban' ? 'Urban Area Limit' : 'Rural Area Schedule I'}</div>
                </div>
                <div className="text-lg font-mono font-medium text-blue-300">× {multiplier.toFixed(2)}</div>
              </div>

            </div>

            <div className="bg-[#002845] p-5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Final Market Value</div>
              <div className="text-3xl font-black text-status-green font-mono flex items-center gap-2">
                {formatINR(marketValue)}
              </div>
            </div>
          </div>

        </div>

      </div>
    </GovCard>
  );
};
