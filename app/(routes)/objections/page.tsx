"use client";
import { GrievancesPage } from "@/components/pages/GrievancesPage";
import { useRealtimeObjections } from "@/hooks/useRealtimeObjections";
import { useProject } from '@/providers/ProjectProvider';

export default function ObjectionsRoute() {
  const { activeProjectId: projectId } = useProject();
  const { objections, pendingCount, loading } = useRealtimeObjections(projectId);

  if (loading) {
    return <div className="p-10 flex items-center justify-center font-mono text-sm">Loading Objections Dashboard...</div>;
  }

  return (
    <GrievancesPage 
      grievances={objections} 
      pendingCount={pendingCount} 
      projectId={projectId}
    />
  );
}