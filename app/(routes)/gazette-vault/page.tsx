"use client";
import { DocumentsPage } from "@/components/pages/DocumentsPage";
import { useAppData } from "@/app/useAppData";

export default function GazetteVaultRoute() {
  const { projects, parcels } = useAppData();
  return (
    <DocumentsPage 
      projects={projects} 
      parcels={parcels} 
    />
  );
}