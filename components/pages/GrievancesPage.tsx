"use client";
import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { db } from '@/lib/firebase/client';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import {
  MessageSquareWarning,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  User,
  MapPin,
  FileCheck,
  ChevronLeft,
  Database,
  IndianRupee
} from 'lucide-react';

export const GrievancesPage = ({ grievances = [], pendingCount = 0, projectId }: any) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('All');
  const [isSeeding, setIsSeeding] = React.useState(false);
  const [resolutionNotes, setResolutionNotes] = React.useState('');
  const [isUpdating, setIsUpdating] = React.useState(false);
  
  const selectedId = searchParams.get('id');
  const selectedGrievance = grievances.find((g: any) => g.id === selectedId) || null;

  React.useEffect(() => {
    if (!selectedId && grievances.length > 0) {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      if (isDesktop) {
        handleSelect(grievances[0]);
      }
    }
  }, [selectedId, grievances]);

  React.useEffect(() => {
    if (selectedGrievance) {
      setResolutionNotes(selectedGrievance.resolutionNotes || '');
    }
  }, [selectedGrievance]);

  const handleSelect = (g: any) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('id', g.id);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleUpdateStatus = async (status: string, actionDesc: string) => {
    if (!selectedGrievance) return;
    setIsUpdating(true);
    try {
      const ref = doc(db, 'objections', selectedGrievance.id);
      
      const newHistory = [...(selectedGrievance.history || [])];
      newHistory.push({
        date: new Date().toLocaleDateString('en-GB'),
        action: actionDesc,
        by: 'SLAO Officer'
      });

      await updateDoc(ref, {
        status,
        resolutionNotes,
        history: newHistory,
      });
    } catch (e) {
      console.error('Error updating objection:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('id');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSeedDemo = async () => {
    if (!projectId) return;
    setIsSeeding(true);
    try {
      const docRef = await addDoc(collection(db, 'objections'), {
        projectId,
        category: 'Boundary Overlap',
        complainantName: 'Ramesh Patel',
        mobileNumber: '9876543210',
        khasraNo: '142/3/1',
        status: 'Pending',
        priority: 'HIGH',
        detailedGrounds: 'The proposed highway alignment overlaps my residential boundary by 4 meters, which was not reflected in the preliminary notification.',
        createdAt: serverTimestamp(),
      });
      const params = new URLSearchParams(searchParams.toString());
      params.set('id', docRef.id);
      router.push(`${pathname}?${params.toString()}`);
    } catch (e) {
      console.error('Error seeding demo objection:', e);
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredGrievances = grievances.filter((g: any) => {
    const searchString = searchQuery.toLowerCase();
    const matchesSearch = 
      (g.id?.toLowerCase().includes(searchString)) ||
      (g.khasraNo?.toLowerCase().includes(searchString)) ||
      (g.complainantName?.toLowerCase().includes(searchString));
      
    const matchesCategory = categoryFilter === 'All' || g.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#002b49] uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              Section 15 Statutory Objection Mechanism
            </span>
          </div>
          <h1 className="text-base font-bold text-slate-900 mt-1 m-0">
            Objection Hearings & Grievance Redressal Workbench
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Public hearing desk for District Collector & Special Land Acquisition Officers (SLAO) under RFCTLARR Act, 2013.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded text-xs font-bold font-mono">
            {pendingCount} Pending
          </span>
          <span className="bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-1 rounded text-xs font-bold font-mono">
            {grievances.length} Active Objections
          </span>
        </div>
      </div>

      {grievances.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-16 flex flex-col items-center justify-center text-center shadow-sm animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">Zero Active Disputes</h2>
          <p className="text-slate-500 max-w-md text-sm mb-8">
            No active Section 15 land disputes are registered for this project. The grievance queue is completely clear.
          </p>
          <button 
            onClick={handleSeedDemo}
            disabled={isSeeding}
            className="flex items-center gap-2 bg-gov-blue hover:bg-gov-navy text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            {isSeeding ? 'Seeding Database...' : 'Seed Demo Objection'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Grid: Objection List + Hearing Investigation Detail */}
        
        {/* Left List (4 Cols - ~35%) */}
        <div className={`lg:col-span-4 space-y-4 ${selectedGrievance ? 'hidden lg:block' : 'block'}`}>
          <div className="flex flex-col gap-3">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-1 flex justify-between items-center">
              <span>Registered Objections ({filteredGrievances.length})</span>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col gap-2">
              <input 
                type="text" 
                placeholder="Search Khasra, ID or Name..." 
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select 
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Boundary Overlap">Boundary Overlap</option>
                <option value="Ownership Dispute">Ownership Title Dispute</option>
                <option value="Valuation & Solatium Discrepancy">Compensation Rate</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 pb-10 custom-scrollbar">
            {filteredGrievances.map((g: any) => {
              const isSelected = selectedGrievance?.id === g.id;
              
              // Map colors for category badge
              const catColor = 
                g.category === 'Ownership Dispute' ? 'bg-red-50 text-red-700 border-red-200' :
                g.category === 'Boundary Overlap' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-blue-50 text-blue-700 border-blue-200';
                
              return (
                <div
                  key={g.id}
                  onClick={() => handleSelect(g)}
                  className={`p-3 rounded border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-500 shadow-sm ring-1 ring-blue-500/50'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold text-[#002b49] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                      {g.id}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        g.status === 'Resolved' ? 'bg-green-100 text-green-800 border-green-300' :
                        g.status === 'Rejected' ? 'bg-slate-100 text-slate-600 border-slate-300' :
                        'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {g.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-1 m-0">
                    {g.complainantName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                      Khasra {g.khasraNo}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${catColor}`}>
                      {g.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-snug">
                    {g.description || g.detailedGrounds}
                  </p>
                </div>
              );
            })}
            
            {filteredGrievances.length === 0 && (
              <div className="text-center p-6 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 text-xs font-semibold">No objections match your filters.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Hearing & Inquiry Detail (8 Cols - ~65%) */}
        <div className={`lg:col-span-8 bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex-col justify-start min-h-[500px] ${selectedGrievance ? 'flex' : 'hidden lg:flex'}`}>
          {selectedGrievance ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Mobile Back Button */}
              <button 
                onClick={handleBack} 
                className="lg:hidden flex items-center gap-1 text-slate-500 mb-2 hover:text-slate-800 font-bold text-xs"
              >
                <ChevronLeft className="w-4 h-4" /> Back to List
              </button>

              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono text-[#002b49] font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                      Ticket: {selectedGrievance.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                      Khasra {selectedGrievance.khasraNo}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 m-0">
                    {selectedGrievance.category}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Filed: {selectedGrievance.createdAt ? new Date(selectedGrievance.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                    <span className="text-xs text-red-600 font-bold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                      <AlertTriangle className="w-3.5 h-3.5" /> 14 Days Remaining (Statutory Limit)
                    </span>
                  </div>
                </div>

                <span className="text-xs font-semibold text-amber-900 bg-amber-100 px-2.5 py-1 rounded border border-amber-300">
                  {selectedGrievance.status}
                </span>
              </div>

              {/* Complainant Card */}
              <div className="bg-slate-50 p-4 rounded border border-slate-200 text-sm space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1.5">
                  Complainant & Representation Record
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 mt-2">
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-0.5">Complainant:</span>
                    <strong className="text-slate-900">{selectedGrievance.complainantName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-0.5">Mobile:</span>
                    <strong className="text-slate-900 font-mono">{selectedGrievance.mobileNumber || selectedGrievance.contact || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-0.5">Assigned SLAO:</span>
                    <strong className="text-[#002b49]">{selectedGrievance.assignedTo || 'DC SLAO Bench'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-0.5">Statutory Clause:</span>
                    <strong className="text-slate-900 font-mono">RFCTLARR Sec 15</strong>
                  </div>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="bg-slate-50 p-4 rounded border border-slate-200 text-sm">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Grievance Claim Breakdown (Detailed Grounds):
                </div>
                <p className="text-slate-800 leading-relaxed m-0 whitespace-pre-wrap">
                  {selectedGrievance.description || selectedGrievance.detailedGrounds}
                </p>
              </div>

              {/* Khasra Boundary & Valuation Comparison */}
              <div className="border border-slate-200 rounded-lg overflow-hidden mt-4">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  SLAO Survey vs Landowner Claim
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-500 text-xs">
                    <tr>
                      <th className="px-4 py-2 font-medium">Parameter</th>
                      <th className="px-4 py-2 font-medium">SLAO Survey Record</th>
                      <th className="px-4 py-2 font-medium text-amber-700">Landowner Claim</th>
                      <th className="px-4 py-2 font-medium">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    <tr>
                      <td className="px-4 py-2 font-medium text-slate-700">Land Area (Ha)</td>
                      <td className="px-4 py-2 font-mono text-slate-600">2.40</td>
                      <td className="px-4 py-2 font-mono text-amber-700 font-semibold">2.85</td>
                      <td className="px-4 py-2 font-mono text-red-600">+0.45 Ha</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium text-slate-700">Circle Rate</td>
                      <td className="px-4 py-2 font-mono text-slate-600">₹45,00,000 / Ha</td>
                      <td className="px-4 py-2 font-mono text-amber-700 font-semibold">₹62,00,000 / Ha</td>
                      <td className="px-4 py-2 font-mono text-red-600">+₹17,00,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Evidence Repository */}
              <div className="space-y-2 mt-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Attached Evidence & Documents
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="border border-slate-200 rounded p-3 flex items-start gap-3 bg-white hover:border-blue-400 cursor-pointer transition-colors group">
                    <div className="bg-blue-50 text-blue-600 p-2 rounded group-hover:bg-blue-100 transition-colors">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-700">Private Survey Map</div>
                      <div className="text-[10px] text-slate-500">PDF • 2.4 MB</div>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded p-3 flex items-start gap-3 bg-white hover:border-blue-400 cursor-pointer transition-colors group">
                    <div className="bg-amber-50 text-amber-600 p-2 rounded group-hover:bg-amber-100 transition-colors">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-700">Title Deed (7/12)</div>
                      <div className="text-[10px] text-slate-500">JPG • 1.1 MB</div>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded p-3 flex items-start gap-3 bg-white hover:border-blue-400 cursor-pointer transition-colors group">
                    <div className="bg-emerald-50 text-emerald-600 p-2 rounded group-hover:bg-emerald-100 transition-colors">
                      <IndianRupee className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-700">Tax Receipt 2025</div>
                      <div className="text-[10px] text-slate-500">PDF • 800 KB</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLAO Adjudication & Action Bar */}
              <div className="pt-4 mt-4 border-t border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-center">
                  <span>SLAO Hearing Notes & Adjudication</span>
                  {isUpdating && <span className="text-blue-500 animate-pulse">Saving...</span>}
                </div>
                
                {selectedGrievance.status === 'Resolved' || selectedGrievance.status === 'Rejected' ? (
                  <div className={`p-4 rounded text-sm ${selectedGrievance.status === 'Resolved' ? 'bg-green-50 border border-green-200 text-green-900' : 'bg-slate-100 border border-slate-200 text-slate-700'}`}>
                    <div className="font-bold flex items-center gap-1.5 mb-1.5 text-xs">
                      <FileCheck className="w-4 h-4" /> Final Decision: {selectedGrievance.status}
                    </div>
                    <p className="leading-relaxed m-0">
                      {selectedGrievance.resolutionNotes || "No specific field notes recorded. Hearing concluded."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea 
                      className="w-full text-sm border border-slate-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                      placeholder="Enter official hearing observations, land survey notes, or justification for rejection here..."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                    />
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <button 
                        onClick={() => handleUpdateStatus('Resolved', 'Approved Compensation Revision')}
                        disabled={isUpdating}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        Approve Compensation Revision
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus('Pending', 'Issued Sec 15(2) Notice')}
                        disabled={isUpdating}
                        className="bg-gov-blue hover:bg-gov-navy text-white px-4 py-2 rounded text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        Issue Sec 15(2) Notice
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus('Rejected', 'Rejected Dispute')}
                        disabled={isUpdating || !resolutionNotes.trim()}
                        className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded text-xs font-bold transition-colors disabled:opacity-50"
                        title={!resolutionNotes.trim() ? "SLAO justification notes required" : ""}
                      >
                        Reject Dispute
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Audit Timeline */}
              {selectedGrievance.history && (
                <div className="pt-2 mt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Inquiry History
                  </div>
                  <div className="space-y-1.5">
                    {selectedGrievance.history.map((h: any, i: number) => (
                      <div key={i} className="text-xs text-slate-600 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                        <span className="font-mono text-[#002b49] text-[11px] font-bold">{h.date}</span>
                        <span>•</span>
                        <span className="text-slate-900 font-medium">{h.action}</span>
                        <span className="text-slate-500 text-[11px]">({h.by})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="m-auto text-center flex flex-col items-center justify-center max-w-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquareWarning className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-slate-700 font-bold mb-1">No Objection Selected</h3>
              <p className="text-slate-500 text-xs">Select an objection from the registry list to inspect details, view complainant records, and log SLAO hearing notes.</p>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};
