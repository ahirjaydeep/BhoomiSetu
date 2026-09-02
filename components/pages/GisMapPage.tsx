"use client";
import React from 'react';
import { GisMapViewer } from '@/components/gis/GisMapViewer';

export const GisMapPage = ({ projects = [], parcels = [], onSelectParcel }) => {
  return (
    <div className="space-y-4">
      <GisMapViewer
        projects={projects}
        parcels={parcels}
        onSelectParcel={onSelectParcel}
      />
    </div>
  );
};
