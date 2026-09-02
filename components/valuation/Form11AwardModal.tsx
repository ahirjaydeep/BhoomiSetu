"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, FileText, Download, X, Lock, CheckCircle2 } from 'lucide-react';

interface ValuationData {
  parcelId: string;
  khasraNo: string;
  village: string;
  totalArea: number; // Hectares
  grossAward: number; // INR
  beneficiariesCount: number;
  marketRateSec26: number;
  solatiumSec30: number;
  interestSec34: number;
}

interface Form11AwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  valuationData: ValuationData;
  onApprove: () => void;
}

export const Form11AwardModal = ({ isOpen, onClose, valuationData, onApprove }: Form11AwardModalProps) => {
  const { currentUser } = useAuth();
  const [isSigned, setIsSigned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sealHash, setSealHash] = useState('');

  if (!isOpen) return null;

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/v1/valuation/finalize-award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parcelId: valuationData.parcelId,
          marketRateSec26: valuationData.marketRateSec26 / 100000,
          solatiumSec30: valuationData.solatiumSec30 / 100000,
          interestSec34: valuationData.interestSec34 / 100000,
          totalAwardAmount: valuationData.grossAward
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSealHash(data.sealHash || 'SHA256:0000');
      setIsSuccess(true);
      onApprove();
    } catch (error) {
      console.error(error);
      alert('Failed to finalize award');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[600] flex items-center justify-center p-4 animate-in fade-in duration-300">
      
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-5 flex items-start justify-between relative overflow-hidden">
          {/* Decorative Background Element */}
          <ShieldCheck className="absolute -top-4 -right-4 w-32 h-32 text-slate-200/50 -rotate-12 pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-ashoka-gold/10 rounded-full flex items-center justify-center text-ashoka-gold shrink-0 border border-ashoka-gold/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gov-navy tracking-tight m-0 leading-tight">
                FORM 11 — FINAL AWARD DETERMINATION
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                Under Section 23 of RFCTLARR Act, 2013
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="relative z-10 p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isSuccess ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-status-green/10 text-status-green rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-gov-navy">Award Successfully Frozen</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Form 11 has been cryptographically anchored to the secure vault. Beneficiaries have been queued for PFMS DBT disbursal.
            </p>
            <div className="mt-4 bg-slate-100 p-3 rounded border border-slate-300 w-full text-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cryptographic Seal (SHA-256)</div>
              <div className="font-mono text-xs text-slate-800 break-all">{sealHash}</div>
            </div>
            <button 
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-gov-navy text-white text-sm font-bold rounded shadow hover:bg-gov-navy/90 transition-colors"
            >
              Close Workspace
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            
            {/* Statutory Summary Preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Statutory Summary Preview
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Parcel Details</div>
                  <div className="font-mono text-sm font-bold text-gov-navy">{valuationData.khasraNo}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{valuationData.village}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Total Area</div>
                  <div className="text-sm font-bold text-gov-navy">{valuationData.totalArea} Ha</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Beneficiaries</div>
                  <div className="text-sm font-bold text-gov-navy">{valuationData.beneficiariesCount} Registered Shareholder(s)</div>
                </div>
                
                <div className="col-span-2 md:col-span-3 pt-4 border-t border-slate-200 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Gross Award Valuation</div>
                    <div className="text-xs font-semibold text-ashoka-gold">Includes 100% Mandatory Sec 30 Solatium</div>
                  </div>
                  <div className="text-2xl font-mono font-black text-status-green">
                    {formatINR(valuationData.grossAward)}
                  </div>
                </div>
              </div>
            </div>

            {/* Digital Signing Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input 
                    type="checkbox"
                    checked={isSigned}
                    onChange={(e) => setIsSigned(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-gov-blue appearance-none checked:bg-gov-blue transition-colors cursor-pointer"
                  />
                  {isSigned && <CheckCircle2 className="w-3.5 h-3.5 text-white absolute pointer-events-none" />}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gov-navy leading-tight block">
                    I, {currentUser?.name || '[SLAO Officer Name]'}, District Collector Delegate, hereby certify and finalize this statutory award under the RFCTLARR Act 2013.
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    By checking this box, I confirm that all calculations, schedules, and beneficiary apportionments have been manually verified against standard PWD and Revenue guidelines.
                  </span>
                </div>
              </label>
            </div>

          </div>
        )}

        {/* Actions Footer */}
        {!isSuccess && (
          <div className="bg-slate-50 p-5 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
            <button className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Generate & Download PDF
            </button>
            <div className="flex-1 relative group">
              <button 
                onClick={handleApprove}
                disabled={!isSigned || isProcessing}
                className={`w-full h-full px-4 py-3 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${
                  isSigned && !isProcessing
                    ? 'bg-gov-navy hover:bg-[#003b66] text-white' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <>Processing Cryptographic Hash...</>
                ) : (
                  <><Lock className="w-4 h-4" /> Sign & Freeze Award (Vault)</>
                )}
              </button>
              
              {!isSigned && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-slate-800 text-white text-xs rounded shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="font-bold mb-1 text-amber-400">Action Locked</div>
                  You must check the digital signature verification box before the award can be cryptographically sealed.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
