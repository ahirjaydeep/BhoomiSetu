"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MarketValueCalculator } from '@/components/valuation/MarketValueCalculator';
import { SolatiumInterestCard } from '@/components/valuation/SolatiumInterestCard';
import { LandownerShareTable, Owner } from '@/components/valuation/LandownerShareTable';
import { Form11AwardModal } from '@/components/valuation/Form11AwardModal';
import { Map, Search, FileSignature, Download, RotateCcw, AlertTriangle } from 'lucide-react';
import { useRealtimeParcels } from '@/hooks/useRealtimeParcels';
import { useProject } from '@/providers/ProjectProvider';

export default function ValuationWorkspacePage() {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { activeProjectId } = useProject();
  const { parcels, loading } = useRealtimeParcels(activeProjectId);
  const [selectedParcelId, setSelectedParcelId] = useState<string>('');

  const [marketValue, setMarketValue] = useState(0);
  const [solatium, setSolatium] = useState(0);
  const [interest, setInterest] = useState(0);
  const [grossAward, setGrossAward] = useState(0);

  useEffect(() => {
    if (!selectedParcelId && parcels && parcels.length > 0) {
      setSelectedParcelId(parcels[0].id);
    }
  }, [parcels, selectedParcelId]);

  const selectedParcel = parcels?.find(p => p.id === selectedParcelId) || null;

  // Generate mock dates (in real app these come from project metadata)
  const sec11Date = new Date();
  sec11Date.setMonth(sec11Date.getMonth() - 8);
  const awardDate = new Date();
  
  const role = currentUser?.role || '';
  const canEdit = role === 'SLAO_DISTRICT' || role === 'STATE_REVENUE';

  // Construct owner list from the single ownerName for the table
  const ownerList: Owner[] = selectedParcel ? [
    {
      id: selectedParcel.id + '-owner',
      name: selectedParcel.ownerName,
      sharePercentage: 100,
      aadhaarHash: '***' + Math.floor(1000 + Math.random() * 9000),
      deductions: 0,
      pfmsStatus: 'VERIFIED_DBT_READY'
    }
  ] : [];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] animate-in fade-in duration-500 overflow-hidden bg-slate-50 relative">
      
      {/* Top Selector Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-ashoka-gold/10 flex items-center justify-center">
            <FileSignature className="w-5 h-5 text-ashoka-gold" />
          </div>
          <div>
            <h1 className="text-lg font-black text-gov-navy m-0 leading-tight">Form 11 Valuation Workspace</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest m-0">RFCTLARR Sec 26 & Sec 30 Award Determination</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select disabled className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded px-3 py-2 outline-none disabled:opacity-70">
            <option>{activeProjectId}</option>
          </select>

          <select disabled className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded px-3 py-2 outline-none disabled:opacity-70">
            <option>{selectedParcel?.village || 'Select Village'}</option>
          </select>

          <div className="relative flex items-center gap-2">
            <select 
              value={selectedParcelId}
              onChange={(e) => setSelectedParcelId(e.target.value)}
              disabled={loading || !parcels}
              className="w-48 pl-3 pr-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy outline-none shadow-inner"
            >
              {loading ? (
                <option>Loading Parcels...</option>
              ) : (
                parcels?.map(p => (
                  <option key={p.id} value={p.id}>Khasra {p.khasraNo}</option>
                ))
              )}
            </select>
            {selectedParcel && (
              <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                selectedParcel.possessionStatus === 'Award Determined' ? 'bg-status-green/10 text-status-green border-status-green/20' : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}>
                {selectedParcel.possessionStatus || 'Pending'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        
        {!canEdit && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-800 m-0">View-Only Mode</h4>
              <p className="text-xs text-amber-700 mt-1">
                Your current role ({role || 'Guest'}) does not have SLAO or State Revenue permissions. Valuation fields are disabled.
              </p>
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 xl:grid-cols-12 gap-6 ${!canEdit ? 'pointer-events-none opacity-90' : ''}`}>
          
          {/* Left Column (Calculators) */}
          <div className="xl:col-span-5 space-y-6">
            <MarketValueCalculator 
              areaHectares={selectedParcel?.areaHectares || 0}
              onCalculated={setMarketValue}
            />
            <SolatiumInterestCard 
              adjustedMarketValue={marketValue} 
              sec11Date={sec11Date}
              awardDate={awardDate}
              attachedAssets={{ structureValue: 0, treeValue: 0 }}
              onCalculated={(res) => {
                setSolatium(res.solatium);
                setInterest(res.interest);
                setGrossAward(res.grossAward);
              }}
            />
          </div>

          {/* Right Column (Breakdown & Actions) */}
          <div className="xl:col-span-7 space-y-6 flex flex-col">
            <LandownerShareTable 
              grossAwardAmount={grossAward}
              khasraNo={selectedParcel?.khasraNo || 'N/A'}
              ownersList={ownerList}
            />

            {/* Total Package Award Summary */}
            <div className="bg-gov-primary rounded-lg shadow-xl border border-emerald-900 p-6 flex items-center justify-between mt-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2" />
              
              <div className="relative z-10">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Package Award Value</div>
                <div className="text-sm text-slate-300">Final Form 11 Valuation ready for PFMS submission</div>
              </div>
              <div className="relative z-10 text-right">
                <div className="text-3xl font-black text-status-green font-mono">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(grossAward)}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-20 flex justify-end gap-4 items-center">
        {canEdit && (
          <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded transition-colors flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Recalculate Valuation
          </button>
        )}
        
        <button className="px-4 py-2 text-sm font-bold text-gov-primary border border-slate-300 hover:bg-slate-50 rounded transition-all hover-lift active:scale-[0.98] flex items-center gap-2 shadow-sm">
          <Download className="w-4 h-4" /> Export Draft Calculation Sheet
        </button>
        
        {canEdit && (
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedParcel}
            className="px-6 py-2 text-sm font-bold text-white bg-gov-emerald hover:bg-emerald-700 rounded transition-all hover-lift shadow-md flex items-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            <FileSignature className="w-4 h-4" /> Finalize & Issue Form 11 Award
          </button>
        )}
      </div>

      {/* Approval Modal */}
      {selectedParcel && (
        <Form11AwardModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          valuationData={{
            parcelId: selectedParcel.id,
            khasraNo: selectedParcel.khasraNo,
            village: selectedParcel.village,
            totalArea: selectedParcel.areaHectares,
            grossAward: grossAward,
            beneficiariesCount: 1,
            marketRateSec26: marketValue,
            solatiumSec30: solatium,
            interestSec34: interest
          }}
          onApprove={() => {
            console.log("Award Finalized & Queued for PFMS DBT!");
          }}
        />
      )}

    </div>
  );
}