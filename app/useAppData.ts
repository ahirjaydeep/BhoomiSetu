"use client";
import { useState, useEffect } from 'react';
import { api } from '@/lib/services/api';

import defaultProjects from '@/lib/data/projects.json';
import defaultParcels from '@/lib/data/parcels.json';
import defaultGrievances from '@/lib/data/grievances.json';

export function useAppData() {
  const [projects, setProjects] = useState(defaultProjects);
  const [parcels, setParcels] = useState(defaultParcels);
  const [grievances, setGrievances] = useState(defaultGrievances);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    // Generate fallback analytics
    const totalLandRequired = defaultProjects.reduce((acc, p) => acc + (p.totalLandRequiredHa || 0), 0);
    const totalLandAcquired = defaultProjects.reduce((acc, p) => acc + (p.landAcquiredHa || 0), 0);
    const totalPossessionHandedOver = defaultProjects.reduce((acc, p) => acc + (p.possessionHandedOverHa || 0), 0);
    const totalBudgetCr = defaultProjects.reduce((acc, p) => acc + (p.estimatedBudgetCr || 0), 0);
    const totalDisbursedCr = defaultProjects.reduce((acc, p) => acc + (p.compensationDisbursedCr || 0), 0);
    const totalParcelsCount = defaultParcels.length;
    const disputedParcelsCount = defaultParcels.filter(p => p.courtStay || (p.status && p.status.toLowerCase().includes("dispute"))).length;
    const possessionHandedParcelsCount = defaultParcels.filter(p => p.stage === "STAGE_7_POSSESSION").length;

    const stateBreakdown: any = {};
    defaultProjects.forEach(p => {
      if (!stateBreakdown[p.state]) {
        stateBreakdown[p.state] = { state: p.state, projects: 0, requiredHa: 0, acquiredHa: 0, disbursedCr: 0 };
      }
      stateBreakdown[p.state].projects += 1;
      stateBreakdown[p.state].requiredHa += p.totalLandRequiredHa;
      stateBreakdown[p.state].acquiredHa += p.landAcquiredHa;
      stateBreakdown[p.state].disbursedCr += p.compensationDisbursedCr;
    });

    const fallbackAnalytics = {
      kpis: {
        totalProjects: defaultProjects.length,
        totalLandRequiredHa: Number(totalLandRequired.toFixed(2)),
        totalLandAcquiredHa: Number(totalLandAcquired.toFixed(2)),
        totalPossessionHandedOverHa: Number(totalPossessionHandedOver.toFixed(2)),
        acquisitionProgressPct: Number(((totalLandAcquired / (totalLandRequired || 1)) * 100).toFixed(1)),
        possessionProgressPct: Number(((totalPossessionHandedOver / (totalLandRequired || 1)) * 100).toFixed(1)),
        totalBudgetCr: Number(totalBudgetCr.toFixed(2)),
        totalDisbursedCr: Number(totalDisbursedCr.toFixed(2)),
        disbursedPercentage: Number(((totalDisbursedCr / (totalBudgetCr || 1)) * 100).toFixed(1)),
        totalParcelsCount,
        disputedParcelsCount,
        possessionHandedParcelsCount
      },
      stateBreakdown: Object.values(stateBreakdown),
      stageDistribution: [
        { stage: "Stage 1: Proposal", count: defaultProjects.filter(p => p.stage === "STAGE_1_PROPOSAL").length },
        { stage: "Stage 2: SIA Study", count: defaultProjects.filter(p => p.stage === "STAGE_2_SIA").length },
        { stage: "Stage 3: Sec 11 Gazette", count: defaultProjects.filter(p => p.stage === "STAGE_3_SEC11").length },
        { stage: "Stage 4: Sec 15 Objections", count: defaultProjects.filter(p => p.stage === "STAGE_4_SEC15").length },
        { stage: "Stage 5: Sec 19 Declaration", count: defaultProjects.filter(p => p.stage === "STAGE_5_SEC19").length },
        { stage: "Stage 6: Sec 23 Valuation", count: defaultProjects.filter(p => p.stage === "STAGE_6_AWARD_DETERMINATION").length },
        { stage: "Stage 7: Possession (DBT)", count: defaultProjects.filter(p => p.stage === "STAGE_7_POSSESSION").length }
      ]
    };
    
    setAnalytics(fallbackAnalytics);

    const fetchData = async () => {
      try {
        const [analyticsData, projectsData, parcelsData, grievancesData] = await Promise.all([
          api.getNationalAnalytics().catch(() => null),
          api.getProjects().catch(() => defaultProjects),
          api.getParcels().catch(() => defaultParcels),
          api.getGrievances().catch(() => defaultGrievances)
        ]);

        if (analyticsData) setAnalytics(analyticsData);
        if (projectsData) setProjects(projectsData);
        if (parcelsData) setParcels(parcelsData);
        if (grievancesData) setGrievances(grievancesData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };
    fetchData();
  }, []);

  return { projects, parcels, grievances, analytics, setProjects, setParcels, setGrievances, setAnalytics };
}
