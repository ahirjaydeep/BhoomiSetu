"use client";
import React from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useRealtimeParcels } from '@/hooks/useRealtimeParcels';

interface CadastralOverlayProps {
  projectId: string;
  onParcelSelect?: (parcelData: any) => void;
}

export const CadastralOverlay = ({ projectId, onParcelSelect }: CadastralOverlayProps) => {
  const map = useMap();
  const { parcels, geoJsonData, loading } = useRealtimeParcels(projectId);

  // Leaflet Style Callback mapping status to RFCTLARR colors
  const geoJsonStyle = (feature: any) => {
    const status = feature.properties?.possessionStatus || feature.properties?.acquisition_status;
    const dbtStatus = feature.properties?.dbtStatus;
    
    // Determine if it's successfully compensated
    const isSuccess = status === 'Possession Handed Over' || status === 'COMPENSATED_POSSESSED' || dbtStatus === 'SUCCESSFUL';
    const isDisputed = status === 'Disputed' || status === 'OBJECTION_FILED';
    const isAwarded = status === 'Award Determined' || status === 'AWARD_DETERMINED';
    
    if (isDisputed) {
      return { fillColor: '#ef4444', fillOpacity: 0.7, color: '#b91c1c', weight: 2 }; // Red / Crimson
    }
    
    if (isSuccess) {
      return { fillColor: '#10b981', fillOpacity: 0.7, color: '#047857', weight: 2 }; // Emerald / Green
    }
    
    if (isAwarded) {
      return { fillColor: '#6366f1', fillOpacity: 0.6, color: '#4338ca', weight: 2 }; // Blue / Indigo
    }
    
    // Default / Pending / SEC11 / SEC15
    return { fillColor: '#f59e0b', fillOpacity: 0.5, color: '#b45309', weight: 2 }; // Amber / Yellow
  };

  // Interactivity Callback
  const onEachFeature = (feature: any, layer: L.Layer) => {
    // We map both old mock keys and new real keys
    const khasra_no = feature.properties.khasraNo || feature.properties.khasra_no || 'N/A';
    const owner_name = feature.properties.ownerName || feature.properties.owner_name || 'N/A';
    const area_ha = feature.properties.areaHectares || feature.properties.area_ha || 0;
    const acquisition_status = feature.properties.possessionStatus || feature.properties.acquisition_status || 'Pending';

    // Build the tooltip HTML content
    const tooltipContent = `
      <div style="font-family: 'Inter', sans-serif; padding: 4px; min-width: 180px;">
        <div style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">
          RFCTLARR Status
        </div>
        <div style="font-size: 11px; font-weight: bold; color: #0f172a; margin-bottom: 8px;">
          ${acquisition_status.replace('_', ' ')}
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; font-size: 11px; color: #334155;">
          <strong>Khasra No:</strong> ${khasra_no}<br/>
          <strong>Owner:</strong> ${owner_name}<br/>
          <strong>Area:</strong> ${area_ha} Ha
        </div>
      </div>
    `;

    layer.bindTooltip(tooltipContent, {
      sticky: true,
      className: 'cadastral-tooltip',
      opacity: 0.95
    });

    // Hover and Click events
    layer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          weight: 3,
          color: '#ffffff',
          fillOpacity: 0.8
        });
        target.bringToFront();
      },
      mouseout: (e) => {
        // Reset style back to original defined in geoJsonStyle
        const target = e.target;
        target.setStyle(geoJsonStyle(feature));
      },
      click: (e) => {
        if (onParcelSelect) {
          // Pass the unique ID up to the parent page state
          const id = feature.id || feature.properties.id || feature.properties.khasra_no || feature.properties.khasraNo;
          onParcelSelect(id);
        }
        // Smoothly zoom in on the clicked parcel
        map.flyToBounds(e.target.getBounds(), {
          padding: [50, 50],
          duration: 1.5,
          maxZoom: 16
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="absolute inset-0 z-[1000] pointer-events-none flex items-center justify-center bg-slate-900/10 backdrop-blur-[1px]">
        <div className="bg-white px-4 py-2 rounded-full shadow-lg text-sm font-bold text-slate-700 flex items-center gap-2 animate-pulse">
          <div className="w-4 h-4 rounded-full border-2 border-gov-blue border-t-transparent animate-spin"></div>
          Streaming Live Spatial Data...
        </div>
      </div>
    );
  }

  if (!geoJsonData || !geoJsonData.features || geoJsonData.features.length === 0) {
    return null;
  }

  return (
    <GeoJSON 
      key={`cadastral-layer-${projectId}-${parcels.length}`}
      data={geoJsonData} 
      style={geoJsonStyle}
      onEachFeature={onEachFeature}
    />
  );
};
