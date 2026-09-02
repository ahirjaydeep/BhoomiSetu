"use client";
import React, { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StatBadge } from '@/components/ui/StatBadge';
import { 
  X, MapPin, User, Hash, AlertTriangle, 
  IndianRupee, Scale, ShieldCheck, ChevronRight, FileSignature
} from 'lucide-react';
import Link from 'next/link';
import { useProject } from '@/providers/ProjectProvider';
import { useRealtimeParcels } from '@/hooks/useRealtimeParcels';
import { useRouter } from 'next/navigation';

interface KhasraDetailDrawerProps {
  selectedParcelId: string | null;
  onClose: () => void;
}

export const KhasraDetailDrawer = ({ selectedParcelId, onClose }: KhasraDetailDrawerProps) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || '';
  const { activeProjectId } = useProject();
  const { parcels, loading } = useRealtimeParcels(activeProjectId);
  const router = useRouter();

  const selectedParcel = useMemo(() => {
    if (!selectedParcelId || !parcels) return null;
    return parcels.find(p => p.id === selectedParcelId) || null;
  }, [selectedParcelId, parcels]);

  if (!selectedParcelId || (!selectedParcel && !loading)) return null;

  if (loading && !selectedParcel) {
    return (
      <div className="absolute top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-[510] animate-in slide-in-from-right duration-300 flex items-center justify-center">
        <div className="animate-pulse text-slate-500 font-bold flex flex-col items-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-gov-blue animate-spin mb-4"></div>
          Loading Parcel Data...
        </div>
      </div>
    );
  }

  if (!selectedParcel) return null;

  const khasra_no = selectedParcel.khasraNo || selectedParcel.id;
  const owner_name = selectedParcel.ownerName || 'Unknown Owner';
  const area_ha = selectedParcel.areaHectares || 0;
  const acquisition_status = selectedParcel.possessionStatus || 'Pending';
  const village = selectedParcel.village || 'Unknown Village';
  const district = selectedParcel.district || 'Unknown District';
  const dbtStatus = selectedParcel.dbtStatus || 'Pending';
  const dbtReference = selectedParcel.dbtReference || 'N/A';
  
  const baseValue = selectedParcel.compensationBaseValue || (area_ha * 4500000);
  const calculatedSolatium = selectedParcel.compensationSolatium || baseValue; 
  const totalAward = selectedParcel.compensationTotalAward || (baseValue + calculatedSolatium);

  const isSec11 = acquisition_status === 'SEC11_NOTIFIED' || acquisition_status === 'Pending';
  const isAward = acquisition_status === 'AWARD_DETERMINED' || acquisition_status === 'Award Determined';
  const isPossessed = acquisition_status === 'COMPENSATED_POSSESSED' || acquisition_status === 'Possession Handed Over';
  const isDisputed = acquisition_status === 'Disputed' || acquisition_status === 'OBJECTION_FILED';

  const getStatusVariant = (status: string) => {
    if (isDisputed) return 'error';
    if (isPossessed) return 'success';
    if (isAward) return 'info';
    return 'warning';
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-[500] transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Drawer Panel */}
      <div className="absolute top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-[510] animate-in slide-in-from-right duration-300 flex flex-col border-l border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold text-gov-blue bg-blue-50 border border-blue-200 px-2 py-1 rounded">
                {khasra_no}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {village}, {district}
              </span>
            </div>
            <h2 className="text-xl font-black text-gov-navy m-0">Land Parcel Details</h2>
            <div className="mt-2 flex gap-2">
              <StatBadge 
                variant={getStatusVariant(acquisition_status)} 
                label={acquisition_status.replace('_', ' ')} 
                showPulse={isSec11 || isAward}
              />
              {dbtStatus === 'SUCCESSFUL' && (
                <StatBadge variant="success" label="DBT Successful" />
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Landowner Card */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Ownership Records (Bhoomi)</h3>
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-gov-navy">{owner_name}</div>
                  <div className="text-xs text-slate-500">Primary Title Holder</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-slate-400 mb-1 flex items-center gap-1"><Hash className="w-3 h-3" /> Area (Ha)</div>
                  <div className="font-mono font-medium text-slate-700">{area_ha} Ha</div>
                </div>
                <div>
                  <div className="text-slate-400 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Status</div>
                  <div className={`font-medium ${isDisputed ? 'text-status-amber' : 'text-status-green'}`}>
                    {isDisputed ? 'Disputed / Objection' : 'Clear Title'}
                  </div>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-100">
                  <div className="text-slate-400 mb-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> DBT / PFTS Ref</div>
                  <div className="font-bold text-slate-700 font-mono">
                    {dbtReference}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Valuation Card */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Statutory Valuation (RFCTLARR)</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-slate-700">Area Analyzed</span>
                <span className="text-sm font-black text-gov-navy">{area_ha} Hectares</span>
              </div>
              
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between pb-1 border-b border-slate-200/60">
                  <span>Calculated Land Value</span>
                  <span className="font-mono">₹{baseValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-200/60">
                  <span>100% Solatium (Sec 30)</span>
                  <span className="font-mono text-ashoka-gold">+₹{calculatedSolatium.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-bold text-sm text-gov-navy">Total Final Award</span>
                  <span className="font-black text-lg text-status-green font-mono">
                    ₹{(totalAward / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className="p-5 border-t border-slate-200 bg-white space-y-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
          
          {(role === 'SLAO_DISTRICT' || role === 'STATE_REVENUE' || true) && (
            <div className="w-full relative group">
              <button 
                onClick={() => router.push(`/valuation?khasra=${khasra_no}`)}
                className="w-full flex items-center justify-center gap-2 bg-gov-navy hover:bg-[#003b66] text-white py-3 px-4 rounded-lg text-sm font-bold shadow-sm transition-all"
              >
                <FileSignature className="w-4 h-4" /> Calculate Valuation
              </button>
            </div>
          )}

          {role === 'SLAO_DISTRICT' && (
            <div className="w-full relative group">
              <button 
                disabled={!isAward}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold shadow-sm transition-all ${
                  isAward 
                    ? 'bg-status-green hover:bg-emerald-700 text-white animate-pulse' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <IndianRupee className="w-4 h-4" /> 
                {isAward ? 'Initiate PFMS DBT Disbursal' : 'PFMS DBT (Requires Seal)'}
              </button>
              
              {!isAward && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-slate-800 text-white text-xs rounded shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="font-bold mb-1 text-amber-400">Action Locked</div>
                  DBT Disbursal requires a finalized Stage 6 Award with cryptographic seal.
                </div>
              )}
            </div>
          )}

          {isPossessed && (
            <button className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-gov-navy border border-slate-300 py-3 px-4 rounded-lg text-sm font-bold shadow-sm transition-all">
              <ShieldCheck className="w-4 h-4" /> View Vault Certificate
            </button>
          )}

          <button 
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Close Details
          </button>
        </div>

      </div>
    </>
  );
};
