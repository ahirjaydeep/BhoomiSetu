"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/services/api';
import {
  UserCheck,
  Search,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Send,
  Building,
  ShieldCheck,
  Scale,
  MapPin,
  Calendar,
  Download,
  AlertCircle,
  FileCheck,
  Gavel,
  ArrowUpRight,
  Landmark,
  BadgeCheck
} from 'lucide-react';

export const CitizenPortal = ({ parcels = [], grievances = [], onGrievanceSubmitted }) => {
  const { currentUser, activeCitizenParcel, setActiveCitizenParcel } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParcel, setSelectedParcel] = useState(parcels[0] || null);

  // Synchronize when activeCitizenParcel changes in context
  useEffect(() => {
    if (activeCitizenParcel) {
      const found = parcels.find(p => p.id === activeCitizenParcel.id || p.khasraNo === activeCitizenParcel.khasraNo);
      if (found) {
        setSelectedParcel(found);
      } else {
        setSelectedParcel(activeCitizenParcel);
      }
    }
  }, [activeCitizenParcel, parcels]);

  // Grievance filing state
  const [complainantName, setComplainantName] = useState(currentUser?.name || '');
  const [contact, setContact] = useState(currentUser?.phone || '+91 94172-88712');
  const [category, setCategory] = useState('Valuation & Solatium Discrepancy');
  const [description, setDescription] = useState('');
  const [attachedDocName, setAttachedDocName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [submittedParcelIds, setSubmittedParcelIds] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (selectedParcel) {
      setComplainantName(selectedParcel.ownerName || currentUser?.name || '');
      setContact(selectedParcel.mobileNumber || selectedParcel.contact || currentUser?.phone || '+91 94172-88712');
    } else if (currentUser?.name && currentUser.role === 'CITIZEN_LANDOWNER') {
      setComplainantName(currentUser.name);
    }
  }, [selectedParcel, currentUser]);

  const filteredParcels = parcels.filter(
    p =>
      p.khasraNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find any active grievance for this parcel
  const activeGrievance = grievances.find(
    g => g.khasraNo === selectedParcel?.khasraNo || g.parcelId === selectedParcel?.id
  );

  const isJustSubmitted = selectedParcel && submittedParcelIds.includes(selectedParcel.id);
  const hasDispute = isJustSubmitted || selectedParcel?.courtStay || selectedParcel?.disputeReason || activeGrievance || selectedParcel?.status?.toLowerCase().includes('dispute');

  const handleSubmitGrievance = async (e) => {
    e.preventDefault();
    if (!selectedParcel) {
      alert('Please select a valid Khasra parcel first.');
      return;
    }
    if (!description || description.trim().length < 10) {
      alert('Please provide detailed grounds for your objection (minimum 10 characters).');
      return;
    }
    
    setSubmitting(true);
    try {
      const newGrv = await onGrievanceSubmitted({
        projectId: selectedParcel?.projectId || '',
        khasraNo: selectedParcel?.khasraNo || '',
        complainantName: complainantName || selectedParcel?.ownerName || '',
        mobileNumber: contact || '',
        category,
        detailedGrounds: `${description} ${attachedDocName ? `[Attached Evidence: ${attachedDocName}]` : ''}`
      });

      const trackingId = newGrv?.id || `GRV-2026-${Math.floor(100 + Math.random() * 900)}`;

      setSuccessReceipt({
        id: trackingId,
        khasraNo: selectedParcel?.khasraNo,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        category
      });
      
      setSubmittedParcelIds(prev => [...prev, selectedParcel.id]);
      setToastMessage(`Success: Objection received! Tracking ID: ${trackingId}`);
      setTimeout(() => setToastMessage(null), 5000);
      
      setDescription('');
      setAttachedDocName('');
    } catch (err) {
      console.error('Failed to submit grievance:', err);
      alert('Failed to submit objection. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate compensation dynamically based on RFCTLARR rules
  let calcMarketValue = 0;
  let calcStructure = 0;
  let calcTree = 0;
  let calcBaseCompensation = 0;
  let calcSolatium = 0;
  let calcInterest = 0;
  let calcFinalAward = 0;
  let circleRate = 0;

  if (selectedParcel) {
    const area = selectedParcel.areaHectares || 0;
    circleRate = selectedParcel.circleRatePerHa || 0;
    
    // Base Market Value = Area * Circle Rate
    calcMarketValue = area * circleRate;
    
    // Property Assets
    calcStructure = selectedParcel.structureValuation || 0;
    calcTree = selectedParcel.treeCropValuation || 0;
    const totalPropertyAssets = calcStructure + calcTree;
    
    // Base Land Compensation
    calcBaseCompensation = calcMarketValue + totalPropertyAssets;
    
    // 100% Solatium markup
    calcSolatium = calcBaseCompensation;
    
    // 12% Per Annum Statutory Interest 
    // Fallback to existing or 1 year calculation
    calcInterest = selectedParcel.additionalInterest12Pct || (calcMarketValue * 0.12);
    
    // Final Total Compensation
    calcFinalAward = calcBaseCompensation + calcSolatium + calcInterest;
  }

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakhs`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-5 relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-lg shadow-xl font-medium text-sm flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-emerald-200 hover:text-white cursor-pointer font-bold">×</button>
        </div>
      )}

      {/* Top Banner with Landowner Verification Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mt-1 m-0">
            Project Affected Landowner & Land Issue Resolution Center
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">
            Inspect statutory compensation award ledgers, track land disputes & DC hearing schedules, and submit formal Section 15 representations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs text-emerald-900 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Aadhaar & PFMS DBT Gateway Active</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs text-blue-900 font-mono">
            <Landmark className="w-3.5 h-3.5 text-blue-700" />
            <span>RFCTLARR Sec 15/23/38</span>
          </div>
        </div>
      </div>

      {/* Prominent Land Issue / Dispute Alert Status Bar */}
      {selectedParcel && (
        <div
          className={`rounded-xl p-4 border transition-all ${
            hasDispute
              ? 'bg-amber-50/80 border-amber-300 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-emerald-500/30 shadow-sm'
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  hasDispute ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {hasDispute ? <Gavel className="w-5 h-5" /> : <BadgeCheck className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {hasDispute ? 'Active Statutory Land Issue / Dispute Case' : 'Clear Title & Award Status'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                      hasDispute
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {hasDispute ? 'Inquiry / Hearing Active' : 'Clear Title - No Encumbrances'}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-900 mt-1 m-0">
                  {selectedParcel.disputeReason ||
                    activeGrievance?.description ||
                    'Land parcel has completed statutory determination and is unencumbered under the RFCTLARR Act 2013.'}
                </p>

                {/* Dispute details metadata */}
                {hasDispute && (
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-700 mt-2">
                    <span className="flex items-center gap-1 font-medium">
                      <Scale className="w-3.5 h-3.5 text-amber-800" /> SLAO Bench: <strong className="text-slate-900">District Collector (DC Court)</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-amber-800" /> Next Hearing: <strong className="text-slate-900">1st Tuesday of Next Month</strong>
                    </span>
                    <span>•</span>
                    <span className="bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded font-mono font-bold">
                      Clause: RFCTLARR Section 15(1)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action in Banner */}
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs font-mono text-slate-600">
                Plot: <strong className="text-slate-900">Khasra {selectedParcel.khasraNo}</strong>
              </span>
            </div>
          </div>

          {/* Stepper Timeline for Dispute / Acquisition Case */}
          <div className="mt-4 pt-3 border-t border-slate-200/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">
              Statutory Case Progression & Redressal Stepper
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="p-2 rounded bg-white border border-emerald-300 text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-[11px]">1. Sec 11 Gazette</span>
              </div>
              <div className={`p-2 rounded border flex items-center gap-1.5 ${hasDispute ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold' : 'bg-white border-emerald-300 text-emerald-900'}`}>
                {hasDispute ? <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                <span className="text-[11px]">2. Sec 15 Objection</span>
              </div>
              <div className={`p-2 rounded border flex items-center gap-1.5 ${hasDispute ? 'bg-white border-slate-300 text-slate-700' : 'bg-white border-emerald-300 text-emerald-900'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${hasDispute ? 'text-slate-400' : 'text-emerald-600'}`} />
                <span className="text-[11px]">3. DC SLAO Hearing</span>
              </div>
              <div className={`p-2 rounded border flex items-center gap-1.5 ${selectedParcel.stage === 'STAGE_7_POSSESSION' ? 'bg-white border-emerald-300 text-emerald-900' : 'bg-white border-slate-300 text-slate-700'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${selectedParcel.stage === 'STAGE_7_POSSESSION' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-[11px]">4. Sec 23 Final Award</span>
              </div>
              <div className={`p-2 rounded border flex items-center gap-1.5 ${selectedParcel.dbtStatus === 'SUCCESSFUL' ? 'bg-white border-emerald-300 text-emerald-900 font-bold' : 'bg-white border-slate-300 text-slate-700'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${selectedParcel.dbtStatus === 'SUCCESSFUL' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-[11px]">5. Sec 38 DBT Payout</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Khasra Search & Passbook vs Objection Filing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Khasra Search & Passbook (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 m-0">
              <Search className="w-3.5 h-3.5 text-[#002b49]" /> Record of Rights & Award Statement
            </h3>
            <span className="text-xs text-slate-500 font-mono">{filteredParcels.length} Verified Land Parcels</span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Khasra No (e.g. 145/1, 142/3/1, 88/1), Landowner Name, or Village..."
              className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded-lg pl-8 pr-3 py-2 outline-none focus:ring-1 focus:ring-[#002b49]"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Quick Select Buttons */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {filteredParcels.length === 0 && (
              <div className="w-full py-8 text-center text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                <Search className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <p>No verified Khasra parcels found matching your search.</p>
              </div>
            )}
            {filteredParcels.map((p) => {
              const isDisputed = p.courtStay || p.disputeReason || p.status?.toLowerCase().includes('dispute');
              const isSelected = selectedParcel?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedParcel(p);
                    if (setActiveCitizenParcel) setActiveCitizenParcel(p);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm font-medium border-transparent font-bold'
                      : isDisputed
                      ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 font-medium'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent font-medium'
                  }`}
                >
                  <span>Khasra {p.khasraNo}</span>
                  <span className="text-[10px] opacity-80">({p.ownerName.split(' ')[0]})</span>
                  {isDisputed && <span className="text-[9px] bg-red-500 text-white px-1 rounded-full">!</span>}
                </button>
              );
            })}
          </div>

          {/* Passbook Card */}
          {!selectedParcel && filteredParcels.length > 0 && (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-3">
              <FileText className="w-8 h-8 text-slate-300" />
              <p className="text-sm text-slate-500">Select a Khasra parcel from the tabs above to view its statutory Record of Rights and compensation award ledger.</p>
            </div>
          )}

          {selectedParcel && (
            <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#002b49] font-bold bg-white px-2 py-0.5 rounded border border-slate-300">
                      Khasra No: {selectedParcel.khasraNo}
                    </span>
                    <span className="text-[10px] text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded font-mono">
                      {selectedParcel.id}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1 m-0">
                    {selectedParcel.ownerName}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    Village {selectedParcel.village}, Tehsil {selectedParcel.tehsil}, {selectedParcel.district}, {selectedParcel.state}
                  </p>
                </div>

                <div>
                  <span
                    className={`inline-block border text-xs font-semibold px-3 py-1 rounded-full ${
                      isJustSubmitted 
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : selectedParcel.stage === 'STAGE_7_POSSESSION'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : selectedParcel.courtStay
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}
                  >
                    {isJustSubmitted ? 'Objection Submitted' : selectedParcel.status}
                  </span>
                </div>
              </div>

              {/* Compensation Banner */}
              <div className="bg-white border border-slate-300 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Total Compensation Awarded (Sec 23/26)
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono mt-0.5">
                    {formatCurrency(calcFinalAward)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Area: <strong className="text-slate-800">{selectedParcel.areaHectares} Ha</strong> ({selectedParcel.areaBigha} Bigha) • Multiplier: {selectedParcel.multiplierFactor}x + 100% Solatium
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">DBT PFMS Status</div>
                  <div
                    className={`text-xs font-mono font-bold mt-0.5 ${
                      selectedParcel.dbtStatus === 'SUCCESSFUL' ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {selectedParcel.dbtStatus}
                  </div>
                  {selectedParcel.dbtTransactionRef ? (
                    <div className="text-[10px] text-slate-500 font-mono">
                      Ref: {selectedParcel.dbtTransactionRef}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic">Pending Bank Escrow Release</div>
                  )}
                </div>
              </div>

              {/* Grid Values */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Base Market Value</span>
                  <span className="font-bold text-slate-800">{formatCurrency(calcMarketValue)}</span>
                  <div className="text-[9px] text-slate-400 mt-0.5">Area × {formatCurrency(circleRate)}/Ha</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Structures (Sec 29)</span>
                  <span className="font-bold text-slate-800">{formatCurrency(calcStructure)}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Trees & Crops</span>
                  <span className="font-bold text-slate-800">{formatCurrency(calcTree)}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Base Land Comp.</span>
                  <span className="font-bold text-slate-800">{formatCurrency(calcBaseCompensation)}</span>
                  <div className="text-[9px] text-slate-400 mt-0.5">Market Val + Assets</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 bg-amber-50/50">
                  <span className="text-slate-500 block text-[10px]">100% Solatium (Sec 30)</span>
                  <span className="font-bold text-amber-900">{formatCurrency(calcSolatium)}</span>
                  <div className="text-[9px] text-slate-400 mt-0.5">Doubling Base Comp.</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 bg-blue-50/50">
                  <span className="text-slate-500 block text-[10px]">12% PA Interest (Sec 34)</span>
                  <span className="font-bold text-blue-900">{formatCurrency(calcInterest)}</span>
                  <div className="text-[9px] text-slate-400 mt-0.5">Statutory Delay Interest</div>
                </div>
              </div>

              {/* Statutory Notice Notes */}
              <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-[11px] text-blue-950 flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span>Statutory Certificate of Land Award (Form 16) issued under Collector Seal.</span>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); alert(`Downloading Official Statutory Form 16 Passbook Certificate for Khasra ${selectedParcel.khasraNo}...`); }}
                  className="text-blue-800 hover:text-blue-950 font-bold hover:underline flex items-center gap-0.5 text-[10px] shrink-0 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Passbook</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Section 15 Online Objection Filing & Receipt (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 m-0">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> File Section 15 Objection {selectedParcel ? `- Khasra ${selectedParcel.khasraNo}` : ''}
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-800 border border-slate-300 px-1.5 py-0.2 rounded font-mono">
                Collector SLAO Bench
              </span>
            </div>

            {/* Success Receipt Modal Banner */}
            {successReceipt && (
              <div className="mt-3 bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-lg text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Section 15 Representation Registered!</span>
                </div>
                <div className="text-[11px] text-slate-700 font-mono">
                  Ticket No: <strong>{successReceipt.id}</strong> • Plot: <strong>Khasra {successReceipt.khasraNo}</strong>
                </div>
                <p className="text-[11px] text-slate-600 m-0 leading-tight">
                  Your objection has been placed before the District Collector SLAO Bench. A hearing summons will be dispatched via SMS.
                </p>
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => setSuccessReceipt(null)}
                    className="text-[10px] text-emerald-800 font-bold hover:underline cursor-pointer"
                  >
                    Dismiss Receipt
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitGrievance} className="mt-3 space-y-2.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 block">
                  Complainant / Khatedar Name:
                </label>
                <input
                  type="text"
                  required
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                  placeholder="e.g. Sardar Gurdeep Singh Sandhu"
                  className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 text-sm rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 block">
                  Mobile Number / SMS Alert:
                </label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="+91 98765-43210"
                  className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 text-sm rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 block">
                  Objection Category:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 text-sm rounded-lg p-2.5"
                >
                  <option value="Valuation & Solatium Discrepancy">Valuation & Solatium Discrepancy</option>
                  <option value="Commercial / Frontage Rate Claim">Commercial / Road Frontage Classification Claim</option>
                  <option value="Joint Ownership & Share Allocation">Joint Ownership & Share Allocation</option>
                  <option value="Unharvested Crop / Borewell Compensation">Unharvested Standing Crop / Borewell Omission</option>
                  <option value="Second Schedule R&R Rehabilitation Entitlement">Second Schedule R&R Rehabilitation Entitlement</option>
                  <option value="Boundary / Khasra Area Demarcation Error">Boundary / Khasra Area Demarcation Error</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 block">
                  Detailed Grounds of Representation:
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="State clearly the grounds of objection before the District Collector (e.g., circle rate discrepancy, omission of borewell, commercial frontage)..."
                  className="w-full h-20 bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 text-sm rounded-lg p-2.5 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 block">
                  Upload Supporting Evidence (Sale Deed / Circle Gazette / Photographs):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={attachedDocName}
                    onChange={(e) => setAttachedDocName(e.target.value)}
                    placeholder="e.g. Commercial_NOC_Registry_2024.pdf"
                    className="flex-1 bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 text-sm rounded-lg p-2.5"
                  />
                  <button
                    type="button"
                    onClick={() => setAttachedDocName(`Evidence_Khasra_${selectedParcel?.khasraNo?.replace('/', '_')}_Deed.pdf`)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 cursor-pointer"
                  >
                    Attach Sample
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting Objection...' : 'Register Section 15 Statutory Objection'}</span>
              </button>
            </form>
          </div>

          <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Directly submitted to District Collector SLAO Bench</span>
            <span>Statutory Acknowledgment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

