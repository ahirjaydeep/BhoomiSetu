"use client";
import React, { useState } from 'react';
import { GeoJSON, Polyline } from 'react-leaflet';
import * as turf from '@turf/turf';
import { Layers, Activity, Ruler, Loader2 } from 'lucide-react';
import { GovCard } from '@/components/ui/GovCard';

// Simulated Highway Centerline coordinates (Lng, Lat for Turf, Lat, Lng for Leaflet)
const CENTERLINE_LNG_LAT = [
  [73.1820, 22.3000],
  [73.1825, 22.3040],
  [73.1830, 22.3080],
  [73.1840, 22.3120]
];

const CENTERLINE_LAT_LNG: [number, number][] = CENTERLINE_LNG_LAT.map(c => [c[1], c[0]]);

export const BufferControlToolbar = () => {
  const [width, setWidth] = useState<number>(45);
  const [showCenterline, setShowCenterline] = useState<boolean>(true);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [bufferGeoJson, setBufferGeoJson] = useState<any>(null);
  const [impactStats, setImpactStats] = useState<{ parcels: number; area: number } | null>(null);

  const handleRecalculate = () => {
    setIsCalculating(true);
    setBufferGeoJson(null);
    setImpactStats(null);

    // Simulate API Call to /api/v1/gis/buffer-intersection
    setTimeout(() => {
      // Actually generate a real buffer using Turf.js!
      const line = turf.lineString(CENTERLINE_LNG_LAT);
      // turf.buffer takes width in kilometers. width state is in meters.
      const buffer = turf.buffer(line, width / 1000, { units: 'kilometers' });

      setBufferGeoJson(buffer);
      // Simulate impact calculation based on width
      setImpactStats({
        parcels: Math.floor(width * 0.8),
        area: Number((width * 0.315).toFixed(2))
      });
      setIsCalculating(false);
    }, 1200);
  };

  return (
    <>
      {/* Absolute Overlays must prevent map dragging when interacting with them */}
      <div 
        className="absolute top-20 right-4 z-[400] w-[300px]"
        onMouseEnter={(e) => {
          // Prevent map interaction while using the toolbar
          e.stopPropagation();
        }}
      >
        <GovCard className="p-4 shadow-lg border-2 border-slate-200">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Ruler className="w-4 h-4 text-gov-blue" />
            <h3 className="text-sm font-bold text-gov-navy m-0">RoW Buffer Analysis</h3>
          </div>

          <div className="space-y-4">
            {/* Width Slider */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs font-bold text-slate-600">
                <span>Buffer Width (Meters)</span>
                <span className="bg-blue-50 text-gov-blue px-2 py-0.5 rounded border border-blue-200 font-mono">
                  {width}m
                </span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="150" 
                step="5"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-gov-navy"
              />
              <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                <span>10m</span>
                <span>150m</span>
              </div>
            </div>

            {/* Toggles */}
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showCenterline}
                onChange={(e) => setShowCenterline(e.target.checked)}
                className="rounded text-gov-blue focus:ring-gov-blue cursor-pointer"
              />
              Show Infrastructure Centerline
            </label>

            {/* Recalculate Button */}
            <button 
              onClick={handleRecalculate}
              disabled={isCalculating}
              className="w-full bg-gov-navy hover:bg-[#003b66] text-white py-2 rounded text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-70"
            >
              {isCalculating ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing Impact...</>
              ) : (
                <><Activity className="w-3.5 h-3.5" /> Recalculate Impact</>
              )}
            </button>
          </div>
        </GovCard>
      </div>

      {/* Floating Summary Chip */}
      {impactStats && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[400] animate-in slide-in-from-bottom-4">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 shadow-2xl rounded-full px-5 py-2.5 flex items-center gap-4">
            <Layers className="w-4 h-4 text-ashoka-gold" />
            <div className="text-white text-xs font-bold tracking-wide">
              Affected Parcels: <span className="text-blue-300 mx-1">{impactStats.parcels}</span> | 
              Total Impact: <span className="text-status-green ml-1">{impactStats.area} Ha</span>
            </div>
          </div>
        </div>
      )}

      {/* Map Layers */}
      {showCenterline && (
        <Polyline 
          positions={CENTERLINE_LAT_LNG} 
          color="#0f172a" 
          weight={3} 
          dashArray="8, 6" 
        />
      )}

      {bufferGeoJson && (
        <GeoJSON 
          key={`buffer-${width}`}
          data={bufferGeoJson} 
          style={{
            fillColor: '#D97706',
            fillOpacity: 0.25,
            color: '#B45309',
            weight: 2,
            dashArray: '5, 5'
          }} 
        />
      )}
    </>
  );
};
