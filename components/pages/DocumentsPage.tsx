"use client";
import React from 'react';
import { DocumentVault } from '@/components/vault/DocumentVault';

export const DocumentsPage = ({ projects = [], parcels = [] }) => {
  return (
    <div className="space-y-4">
      <DocumentVault
        projects={projects}
        parcels={parcels}
      />
    </div>
  );
};
