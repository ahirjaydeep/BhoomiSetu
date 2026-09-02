"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
      <Loader2 className="w-8 h-8 text-gov-blue animate-spin mb-4" />
      <div className="text-sm font-bold text-slate-600">Loading GIS Cadastral Data and GeoJSON Layers...</div>
      <div className="text-xs text-slate-400 mt-1">Initializing WebGL rendering engine</div>
    </div>
  ),
});

interface GisMapViewerProps {
  projectId: string;
  onParcelSelect: (parcel: any) => void;
}

export const GisMapViewer = ({ projectId, onParcelSelect }: GisMapViewerProps) => {
  return (
    <div className="w-full h-full relative overflow-hidden rounded-lg shadow-sm border border-slate-200" style={{ minHeight: '600px' }}>
      <MapComponent projectId={projectId} onParcelSelect={onParcelSelect} />
    </div>
  );
};
