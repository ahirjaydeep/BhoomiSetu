"use client";
import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, LayersControl, ZoomControl, ScaleControl, useMap } from 'react-leaflet';
import { Maximize, RotateCcw, Map as MapIcon } from 'lucide-react';
import L from 'leaflet';
import { CadastralOverlay } from './CadastralOverlay';
import { BufferControlToolbar } from './BufferControlToolbar';

// Fix for default Leaflet icon paths in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

const CENTER: [number, number] = [22.3072, 73.1812];
const DEFAULT_ZOOM = 14;

const MapControls = () => {
  const map = useMap();

  const handleReset = () => {
    map.setView(CENTER, DEFAULT_ZOOM);
  };

  const handleFullscreen = () => {
    const mapElement = map.getContainer();
    if (!document.fullscreenElement) {
      mapElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
      <button 
        onClick={handleFullscreen}
        className="bg-white p-2 rounded shadow-md text-slate-700 hover:text-gov-navy hover:bg-slate-50 transition-colors"
        title="Toggle Fullscreen"
      >
        <Maximize className="w-5 h-5" />
      </button>
      <button 
        onClick={handleReset}
        className="bg-white p-2 rounded shadow-md text-slate-700 hover:text-gov-navy hover:bg-slate-50 transition-colors"
        title="Reset View"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
      <button 
        className="bg-gov-navy text-white p-2 rounded shadow-md hover:bg-[#003b66] transition-colors"
        title="Legend Drawer"
      >
        <MapIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

interface MapComponentProps {
  projectId: string;
  onParcelSelect: (parcel: any) => void;
}

export default function MapComponent({ projectId, onParcelSelect }: MapComponentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Map Engine...</div>;

  return (
    <div className="relative w-full h-full bg-slate-50">
      <MapContainer 
        center={CENTER} 
        zoom={DEFAULT_ZOOM} 
        zoomControl={false} // We will use custom placement
        className="w-full h-full z-0"
      >
        <MapControls />
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" imperial={false} />
        
        {/* Inject Cadastral Overlay */}
        <CadastralOverlay projectId={projectId} onParcelSelect={onParcelSelect} />
        
        {/* Inject Buffer Toolbar */}
        <BufferControlToolbar />

        <LayersControl position="topleft">
          {/* Street Map */}
          <LayersControl.BaseLayer name="Street Map (OSM)">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
          </LayersControl.BaseLayer>

          {/* Satellite Map */}
          <LayersControl.BaseLayer checked name="Satellite Imagery (Esri)">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri"
            />
          </LayersControl.BaseLayer>

          {/* Topo Map */}
          <LayersControl.BaseLayer name="Terrain/Topo (OpenTopo)">
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution='Map data: &copy; OpenStreetMap'
            />
          </LayersControl.BaseLayer>
        </LayersControl>
      </MapContainer>
    </div>
  );
}
