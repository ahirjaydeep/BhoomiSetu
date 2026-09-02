"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/services/api';
import {
  FileCheck2,
  Printer,
  ShieldCheck,
  Copy,
  Check,
  FileText
} from 'lucide-react';

export const DocumentVault = ({ projects = [], parcels = [] }) => {
  const [docType, setDocType] = useState('GAZETTE_SEC11'); // 'GAZETTE_SEC11' or 'POSSESSION_CERTIFICATE'
  const [selectedId, setSelectedId] = useState(projects[0]?.id || 'PRJ-2026-NHAI-001');
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchDocument = async () => {
    setLoading(true);
    try {
      const data = await api.generateDocument(docType, selectedId);
      setDocument(data);
    } catch (err) {
      console.error('Failed to generate document:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [docType, selectedId]);

  const handleCopyHash = () => {
    if (document?.cryptographicSha256) {
      navigator.clipboard.writeText(document.cryptographicSha256);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-blue-50 text-[#002b49] border border-blue-200">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider m-0">
              National Digital Gazette & Possession Certificate Repository
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory notifications & Section 38 Possession Certificates with SHA-256 cryptographic verification
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5">
          <select
            value={docType}
            onChange={(e) => {
              setDocType(e.target.value);
              if (e.target.value === 'GAZETTE_SEC11') {
                setSelectedId(projects[0]?.id || 'PRJ-2026-NHAI-001');
              } else {
                setSelectedId(parcels[0]?.id || 'PARCEL-JAL-001');
              }
            }}
            className="bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#002b49]"
          >
            <option value="GAZETTE_SEC11">Section 11 Preliminary Notification Gazette</option>
            <option value="POSSESSION_CERTIFICATE">Section 38 Form 16 Possession Certificate</option>
          </select>

          {docType === 'GAZETTE_SEC11' ? (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#002b49]"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#002b49]"
            >
              {parcels.map((p) => (
                <option key={p.id} value={p.id}>
                  Khasra {p.khasraNo} - {p.ownerName} ({p.village})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded border border-slate-300 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Gazette Official Paper Sheet */}
      {document && (
        <div className="bg-white border-2 border-slate-300 rounded p-8 max-w-4xl mx-auto shadow-sm text-slate-900 font-serif leading-relaxed text-xs">
          {/* Official Emblem Banner */}
          <div className="text-center border-b border-slate-400 pb-4">
            <div className="text-[11px] uppercase tracking-widest text-slate-700 font-bold">
              भारत का राजपत्र | THE GAZETTE OF INDIA (EXTRAORDINARY)
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-1 uppercase tracking-wide">
              {document.docType}
            </h3>
            <div className="text-xs text-slate-600 font-mono mt-0.5">
              Notification Ref No: <strong>{document.gazetteNotificationNo || document.certificateNo}</strong>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-sans">
              Published by Authority • New Delhi & State Revenue Directorate • Date: {document.dateOfPublication || document.issueDate}
            </div>
          </div>

          {/* Legal Body Text */}
          <div className="py-5 space-y-3.5">
            {docType === 'GAZETTE_SEC11' ? (
              <>
                <p>
                  <strong>PART II — Section 3 — Sub-section (ii)</strong>
                </p>
                <p className="text-justify">
                  {document.content}
                </p>
                <div className="bg-slate-50 p-3.5 rounded border border-slate-200 font-sans space-y-1.5 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Project Title:</span>
                      <strong className="text-slate-900">{document.projectName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Requiring Body:</span>
                      <strong className="text-[#002b49]">{document.requiringBody}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Total Area Under Acquisition:</span>
                      <strong className="text-slate-900">{document.totalAreaNotifiedHa} Hectares</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Districts Covered:</span>
                      <strong className="text-slate-900">{document.districtsCovered} ({document.state})</strong>
                    </div>
                  </div>
                </div>
                <p className="text-justify">
                  <strong>Notice under Section 11(4):</strong> No person shall make any transaction or cause any transaction of land specified in this notification or create any encumbrances on such land from the date of publication without prior sanction of the Collector.
                </p>
              </>
            ) : (
              <>
                <p className="text-justify">
                  {document.content}
                </p>
                <div className="bg-slate-50 p-3.5 rounded border border-slate-200 font-sans space-y-1.5 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Khasra / Survey Number:</span>
                      <strong className="text-slate-900">Khasra {document.khasraNo}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Registered Khatedar:</span>
                      <strong className="text-slate-900">{document.landownerName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Village & Tehsil:</span>
                      <strong className="text-slate-900">{document.village}, Tehsil {document.tehsil}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Total Award Disbursed:</span>
                      <strong className="text-emerald-800 font-mono font-bold">
                        ₹{(document.totalAwardDisbursedRs / 100000).toFixed(2)} Lakhs (via DBT PFMS)
                      </strong>
                    </div>
                  </div>
                </div>
                <p className="text-justify">
                  <strong>Declaration of Possession:</strong> The Land Acquiring Authority hereby certifies that full physical possession of the said parcel has been vested absolutely in the Requiring Body free from all encumbrances under Section 38 of the RFCTLARR Act, 2013.
                </p>
              </>
            )}
          </div>

          {/* Cryptographic SHA-256 Hash Box */}
          <div className="pt-4 border-t border-slate-300 font-sans">
            <div className="bg-slate-50 border border-slate-300 rounded p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>Cryptographic Verification Seal (SHA-256)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-mono font-semibold">
                      VERIFIED
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-600 break-all mt-0.5">
                    {document.cryptographicSha256}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCopyHash}
                className="flex items-center gap-1 text-xs text-[#002b49] hover:underline font-semibold cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>

            <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>Signatory: {document.digitalSignature}</span>
              <span>National Land Record Integration Protocol</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
