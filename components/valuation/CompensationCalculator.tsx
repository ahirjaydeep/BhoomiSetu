"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/services/api';
import {
  Calculator,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  IndianRupee,
  Layers,
  Award,
  Users,
  FileSpreadsheet
} from 'lucide-react';

export const CompensationCalculator = () => {
  const [areaHectares, setAreaHectares] = useState(1.5);
  const [circleRatePerHa, setCircleRatePerHa] = useState(4500000);
  const [areaType, setAreaType] = useState('RURAL'); // 'RURAL', 'SEMI_URBAN', 'URBAN'
  const [ruralMultiplier, setRuralMultiplier] = useState(1.5);
  const [structureValuation, setStructureValuation] = useState(400000);
  const [treeCropValuation, setTreeCropValuation] = useState(150000);
  const [monthsSinceSec11, setMonthsSinceSec11] = useState(12);
  const [displacedFamilyCount, setDisplacedFamilyCount] = useState(1);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const data = await api.calculateCompensation({
        areaHectares: Number(areaHectares),
        circleRatePerHa: Number(circleRatePerHa),
        saleDeedAveragePerHa: Number(circleRatePerHa),
        areaType,
        ruralMultiplier: Number(ruralMultiplier),
        structureValuation: Number(structureValuation),
        treeCropValuation: Number(treeCropValuation),
        monthsSinceSec11: Number(monthsSinceSec11),
        displacedFamilyCount: Number(displacedFamilyCount)
      });
      setResult(data);
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [
    areaHectares,
    circleRatePerHa,
    areaType,
    ruralMultiplier,
    structureValuation,
    treeCropValuation,
    monthsSinceSec11,
    displacedFamilyCount
  ]);

  const formatLakhsCr = (amount) => {
    if (!amount) return '₹0';
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(2)} Lakhs`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-blue-50 text-[#002b49] border border-blue-200">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider m-0">
              RFCTLARR Statutory Compensation & Solatium Award Calculator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated First Schedule (Sections 26 to 30) & Second Schedule R&R Package Computation
            </p>
          </div>
        </div>
        <div className="bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          Act 30 of 2013 Compliant
        </div>
      </div>

      {/* Grid Inputs + Live Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Form Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Area & Circle Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Acquired Land Area (Hectares):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.05"
                  value={areaHectares}
                  onChange={(e) => setAreaHectares(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-2 outline-none focus:ring-1 focus:ring-[#002b49]"
                />
                <span className="absolute right-2.5 top-2 text-[11px] text-slate-500">
                  ≈ {(areaHectares * 4).toFixed(1)} Bigha
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Circle / Ready Reckoner Rate (₹ / Ha):
              </label>
              <input
                type="number"
                step="100000"
                value={circleRatePerHa}
                onChange={(e) => setCircleRatePerHa(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-2 outline-none focus:ring-1 focus:ring-[#002b49]"
              />
            </div>
          </div>

          {/* Area Type & Multiplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location Classification (Section 26(2)):
              </label>
              <select
                value={areaType}
                onChange={(e) => {
                  setAreaType(e.target.value);
                  if (e.target.value === 'URBAN') setRuralMultiplier(1.0);
                  if (e.target.value === 'SEMI_URBAN') setRuralMultiplier(1.25);
                  if (e.target.value === 'RURAL') setRuralMultiplier(1.5);
                }}
                className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-2 outline-none focus:ring-1 focus:ring-[#002b49]"
              >
                <option value="RURAL">Rural Area (1.0x to 2.0x Multiplier)</option>
                <option value="SEMI_URBAN">Semi-Urban / Periphery (1.25x Multiplier)</option>
                <option value="URBAN">Urban / Municipal Limit (1.0x Multiplier)</option>
              </select>
            </div>

            {areaType === 'RURAL' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    State Rural Multiplier:
                  </label>
                  <span className="text-xs font-mono font-bold text-[#002b49]">
                    {ruralMultiplier}x
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="2.0"
                  step="0.05"
                  value={ruralMultiplier}
                  onChange={(e) => setRuralMultiplier(e.target.value)}
                  className="w-full accent-[#002b49] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1.0x (Near Urban)</span>
                  <span>2.0x (Remote Rural)</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 29 Assets Attached to Land */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Structure Valuation (₹) - Sec 29:
              </label>
              <input
                type="number"
                step="50000"
                value={structureValuation}
                onChange={(e) => setStructureValuation(e.target.value)}
                placeholder="Houses, Wells, Borewells"
                className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-2 outline-none focus:ring-1 focus:ring-[#002b49]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Timber / Crop Valuation (₹) - Sec 29:
              </label>
              <input
                type="number"
                step="25000"
                value={treeCropValuation}
                onChange={(e) => setTreeCropValuation(e.target.value)}
                placeholder="Fruit Trees, Standing Crops"
                className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-2 outline-none focus:ring-1 focus:ring-[#002b49]"
              />
            </div>
          </div>

          {/* Section 30(3) Timeline & Second Schedule R&R */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Elapsed Months since Sec 11 (12% PA Interest):
              </label>
              <input
                type="number"
                min="0"
                max="36"
                value={monthsSinceSec11}
                onChange={(e) => setMonthsSinceSec11(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-2 outline-none focus:ring-1 focus:ring-[#002b49]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Displaced Families for R&R Entitlements:
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={displacedFamilyCount}
                onChange={(e) => setDisplacedFamilyCount(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-2 outline-none focus:ring-1 focus:ring-[#002b49]"
              />
            </div>
          </div>
        </div>

        {/* Right Output: Official Collector Award Statement (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-300 rounded-lg p-4 flex flex-col justify-between shadow-xs">
          {result && (
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-300">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Collector Award Statement
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  Solatium 100% (Sec 30)
                </span>
              </div>

              {/* Total Card */}
              <div className="mt-3 bg-white border border-slate-300 rounded p-3 text-center shadow-xs">
                <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  Total Statutory Compensation Payable
                </div>
                <div className="text-xl font-bold text-[#002b49] mt-0.5 font-mono">
                  {formatLakhsCr(result.grandTotalPayable)}
                </div>
                <div className="text-[11px] text-slate-600 font-mono">
                  ₹{result.grandTotalPayable.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Line Items Table */}
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Base Land Value (Sec 26):</span>
                  <span className="font-mono text-slate-900 font-medium">
                    {formatLakhsCr(result.breakdown.rawMarketValue)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Multiplied Land Value ({result.inputs.multiplier}x):</span>
                  <span className="font-mono text-slate-900 font-medium">
                    {formatLakhsCr(result.breakdown.multipliedLandValue)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Attached Assets & Trees (Sec 29):</span>
                  <span className="font-mono text-slate-900 font-medium">
                    {formatLakhsCr(result.breakdown.attachedAssetsValue)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 font-semibold pt-1 border-t border-slate-200">
                  <span>Mandatory Solatium (100% - Sec 30(1)):</span>
                  <span className="font-mono text-emerald-800">
                    {formatLakhsCr(result.breakdown.solatiumAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900">
                  <span>Additional 12% Interest (Sec 30(3)):</span>
                  <span className="font-mono text-blue-900">
                    {formatLakhsCr(result.breakdown.additionalInterestSec30)}
                  </span>
                </div>

                {/* Second Schedule R&R */}
                {result.breakdown.rrPackage.totalRREstimate > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-slate-200 text-slate-700">
                    <div className="text-[10px] font-bold text-[#002b49] uppercase flex items-center gap-1 mb-0.5">
                      <Users className="w-3 h-3" /> Second Schedule R&R Package:
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Subsistence, Shifting & Grants:</span>
                      <span className="font-mono text-slate-900">
                        {formatLakhsCr(result.breakdown.rrPackage.totalRREstimate)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Statutory Notes */}
              <div className="mt-3 bg-white rounded p-2.5 border border-slate-200 text-[10px] text-slate-600 space-y-0.5">
                {result.statutoryNotes.map((note, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <span className="text-[#002b49] font-bold">•</span>
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
