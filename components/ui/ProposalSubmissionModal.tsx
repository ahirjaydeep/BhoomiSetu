"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  FolderPlus,
  Building,
  MapPin,
  IndianRupee,
  Calendar,
  Send,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

export const ProposalSubmissionModal = ({ isOpen, onClose, onProjectCreated }) => {
  const { currentUser } = useAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Highways & Transport');
  const [requiringBody, setRequiringBody] = useState('National Highways Authority of India (NHAI)');
  const [ministry, setMinistry] = useState('Ministry of Road Transport and Highways (MoRTH)');
  const [state, setState] = useState('Punjab');
  const [districts, setDistricts] = useState('Ludhiana, Patiala');
  const [totalLengthKm, setTotalLengthKm] = useState(65.0);
  const [totalLandRequiredHa, setTotalLandRequiredHa] = useState(240.0);
  const [estimatedBudgetCr, setEstimatedBudgetCr] = useState(850.0);
  const [targetPossessionDate, setTargetPossessionDate] = useState('2027-03-31');
  const [nodalOfficerName, setNodalOfficerName] = useState(currentUser?.name || 'Er. S. K. Sharma');
  const [nodalOfficerEmail, setNodalOfficerEmail] = useState('pd.project@nhai.gov.in');

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const districtsArray = districts.split(',').map(d => d.trim());
      await onProjectCreated({
        name,
        category,
        requiringBody,
        ministry,
        state,
        districts: districtsArray,
        totalLengthKm: Number(totalLengthKm),
        totalLandRequiredHa: Number(totalLandRequiredHa),
        estimatedBudgetCr: Number(estimatedBudgetCr),
        targetPossessionDate,
        submittedBy: currentUser?.name,
        nodalOfficer: {
          name: nodalOfficerName,
          designation: 'Project Director / General Manager',
          contact: '+91 98111-22334',
          email: nodalOfficerEmail
        }
      });
      onClose();
    } catch (err) {
      console.error('Failed to create proposal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-lg max-w-2xl w-full p-5 shadow-2xl animate-in zoom-in-95 overflow-y-auto max-h-[90vh] text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-50 text-[#002b49] border border-blue-200">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0">
                Submit Land Acquisition Requisition (LRB)
              </h3>
              <p className="text-[11px] text-slate-500">
                Stage 1 Administrative & In-Principle Approval Submission under RFCTLARR Act
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-0.5 bg-slate-100 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Title / Alignment Name:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ludhiana-Rupnagar Green Expressway Package-II"
              className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#002b49]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Infrastructure Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#002b49]"
              >
                <option value="Highways & Transport">Highways & Expressways (NHAI/MoRTH)</option>
                <option value="Railways & Logistics">Railways & Freight Corridors (DFCCIL/MoR)</option>
                <option value="Renewable Energy">Renewable Energy & Solar Parks (MNRE)</option>
                <option value="Urban Transit">Urban Mass Rapid Transit (Metro)</option>
                <option value="Industrial Corridor">PM GatiShakti Industrial Node (NICDC)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Requiring Body:
              </label>
              <input
                type="text"
                required
                value={requiringBody}
                onChange={(e) => setRequiringBody(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#002b49]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State:
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#002b49]"
              >
                <option value="Punjab">Punjab</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Haryana">Haryana</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Delhi (NCT)">Delhi (NCT)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Affected Districts (Comma-separated):
              </label>
              <input
                type="text"
                required
                value={districts}
                onChange={(e) => setDistricts(e.target.value)}
                placeholder="District 1, District 2"
                className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#002b49]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Length (Km):
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={totalLengthKm}
                onChange={(e) => setTotalLengthKm(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#002b49]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Land Required (Ha):
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={totalLandRequiredHa}
                onChange={(e) => setTotalLandRequiredHa(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#002b49]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Escrow LA Budget (₹ Cr):
              </label>
              <input
                type="number"
                step="10"
                required
                value={estimatedBudgetCr}
                onChange={(e) => setEstimatedBudgetCr(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#002b49]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Possession Date:
              </label>
              <input
                type="date"
                required
                value={targetPossessionDate}
                onChange={(e) => setTargetPossessionDate(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#002b49]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nodal Project Director:
              </label>
              <input
                type="text"
                required
                value={nodalOfficerName}
                onChange={(e) => setNodalOfficerName(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#002b49]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 bg-[#002b49] hover:bg-[#003b66] text-white text-xs font-semibold px-4 py-1.5 rounded transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Requisition to DoLR'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
