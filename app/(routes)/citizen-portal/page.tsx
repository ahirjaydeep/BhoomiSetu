"use client";
import { CitizenPortal } from "@/components/citizen/CitizenPortal";
import { useRealtimeParcels } from "@/hooks/useRealtimeParcels";
import { useRealtimeObjections } from "@/hooks/useRealtimeObjections";

import { useProject } from '@/providers/ProjectProvider';

export default function CitizenPortalRoute() {
  const { activeProjectId: projectId } = useProject();
  const { parcels, loading: parcelsLoading } = useRealtimeParcels(projectId);
  const { objections, loading: objectionsLoading } = useRealtimeObjections(projectId);

  const handleGrievanceSubmitted = async (payload: any) => {
    const res = await fetch('/api/v1/objections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  };

  if (parcelsLoading || objectionsLoading) {
    return <div className="p-10 flex items-center justify-center font-mono text-sm">Loading Citizen Portal...</div>;
  }

  return (
    <CitizenPortal 
      parcels={parcels} 
      grievances={objections} 
      onGrievanceSubmitted={handleGrievanceSubmitted} 
    />
  );
}