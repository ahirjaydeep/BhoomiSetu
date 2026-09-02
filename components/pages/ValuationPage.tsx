"use client";
import React from 'react';
import { CompensationCalculator } from '@/components/valuation/CompensationCalculator';
import { Layers, ArrowRight } from 'lucide-react';

export const ValuationPage = ({ parcels = [], onSelectParcel, setActiveTab }) => {
  return (
    <div className="space-y-5">
      {/* Top Calculator */}
      <CompensationCalculator />

      {/* Cadastral Award Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-200">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 m-0">
              <Layers className="w-4 h-4 text-[#002b49]" /> Cadastral Valuation & Compensation Award Ledger
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live awards determined under Section 23/26 of RFCTLARR Act across active corridor parcels
            </p>
          </div>
          <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300">
            {parcels.length} Registered Plots
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Plot ID & Khasra</th>
                <th className="py-2.5 px-3">Khatedar / Landowner</th>
                <th className="py-2.5 px-3">Area (Ha)</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Multiplier & Solatium</th>
                <th className="py-2.5 px-3">Total Award (₹)</th>
                <th className="py-2.5 px-3">DBT PFMS Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {parcels.map((parcel) => (
                <tr key={parcel.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-mono font-bold text-[#002b49]">{parcel.id}</div>
                    <div className="text-[11px] text-slate-500 font-medium">Khasra {parcel.khasraNo}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{parcel.ownerName}</div>
                    <div className="text-[11px] text-slate-500">{parcel.village}, {parcel.district}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium">
                    {parcel.areaHectares} Ha
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {parcel.landClassification}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="bg-slate-100 text-slate-800 px-1.5 py-0.2 rounded font-mono font-semibold text-[10px] border border-slate-300">
                      {parcel.multiplierFactor}x + 100%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    ₹{(parcel.totalCompensationAwarded / 100000).toFixed(2)} L
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        parcel.dbtStatus === 'SUCCESSFUL'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {parcel.dbtStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => {
                        onSelectParcel(parcel);
                        setActiveTab('gis-map');
                      }}
                      className="text-xs text-[#002b49] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View on GIS</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
