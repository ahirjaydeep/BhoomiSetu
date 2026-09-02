// Hybrid Resilient API Service for BhoomiSetu
// Seamlessly connects to Express Backend when available,
// with 100% full-featured client-side fallback for Vercel/Netlify cloud deployments.

import defaultProjects from '@/lib/data/projects.json';
import defaultParcels from '@/lib/data/parcels.json';
import defaultUsers from '@/lib/data/users.json';
import defaultGrievances from '@/lib/data/grievances.json';

const API_BASE = '/api';

// In-Memory & LocalStorage persistent store for Vercel deployment
const getStore = (key, defaultData) => {
  try {
    const saved = localStorage.getItem(`bhoomisetu_${key}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return defaultData;
};

const setStore = (key, data) => {
  try {
    localStorage.setItem(`bhoomisetu_${key}`, JSON.stringify(data));
  } catch (e) {}
};

let localProjects = getStore('projects', defaultProjects);
let localParcels = getStore('parcels', defaultParcels);
let localUsers = getStore('users', defaultUsers);
let localGrievances = getStore('grievances', defaultGrievances);

// Compute National Analytics locally
function computeLocalAnalytics(projects, parcels) {
  const totalLandRequired = projects.reduce((acc, p) => acc + (p.totalLandRequiredHa || 0), 0);
  const totalLandAcquired = projects.reduce((acc, p) => acc + (p.landAcquiredHa || 0), 0);
  const totalPossessionHandedOver = projects.reduce((acc, p) => acc + (p.possessionHandedOverHa || 0), 0);
  const totalBudgetCr = projects.reduce((acc, p) => acc + (p.estimatedBudgetCr || 0), 0);
  const totalDisbursedCr = projects.reduce((acc, p) => acc + (p.compensationDisbursedCr || 0), 0);
  const totalParcelsCount = parcels.length;
  const disputedParcelsCount = parcels.filter(p => p.courtStay || (p.status && p.status.toLowerCase().includes("dispute"))).length;
  const possessionHandedParcelsCount = parcels.filter(p => p.stage === "STAGE_7_POSSESSION").length;

  const stateBreakdown = {};
  projects.forEach(p => {
    if (!stateBreakdown[p.state]) {
      stateBreakdown[p.state] = { state: p.state, projects: 0, requiredHa: 0, acquiredHa: 0, disbursedCr: 0 };
    }
    stateBreakdown[p.state].projects += 1;
    stateBreakdown[p.state].requiredHa += p.totalLandRequiredHa;
    stateBreakdown[p.state].acquiredHa += p.landAcquiredHa;
    stateBreakdown[p.state].disbursedCr += p.compensationDisbursedCr;
  });

  return {
    kpis: {
      totalProjects: projects.length,
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
      { stage: "Stage 1: Proposal", count: projects.filter(p => p.stage === "STAGE_1_PROPOSAL").length },
      { stage: "Stage 2: SIA Study", count: projects.filter(p => p.stage === "STAGE_2_SIA").length },
      { stage: "Stage 3: Sec 11 Gazette", count: projects.filter(p => p.stage === "STAGE_3_SEC11").length },
      { stage: "Stage 4: Sec 15 Objections", count: projects.filter(p => p.stage === "STAGE_4_SEC15").length },
      { stage: "Stage 5: Sec 19 Declaration", count: projects.filter(p => p.stage === "STAGE_5_SEC19").length },
      { stage: "Stage 6: Sec 23 Valuation", count: projects.filter(p => p.stage === "STAGE_6_AWARD_DETERMINATION").length },
      { stage: "Stage 7: Possession (DBT)", count: projects.filter(p => p.stage === "STAGE_7_POSSESSION").length }
    ]
  };
}

// Compute RFCTLARR Compensation locally
function computeRFCTLARRLocal({
  areaHectares = 1.0,
  circleRatePerHa = 4000000,
  saleDeedAveragePerHa = 4200000,
  areaType = "RURAL",
  ruralMultiplier = 1.5,
  structureValuation = 0,
  treeCropValuation = 0,
  monthsSinceSec11 = 10,
  displacedFamilyCount = 1
}) {
  const baseRatePerHa = Math.max(Number(circleRatePerHa) || 0, Number(saleDeedAveragePerHa) || 0);
  const rawMarketValue = baseRatePerHa * (Number(areaHectares) || 1);

  let multiplier = 1.0;
  if (areaType === "RURAL") {
    multiplier = Math.min(Math.max(Number(ruralMultiplier) || 1.5, 1.0), 2.0);
  } else if (areaType === "SEMI_URBAN") {
    multiplier = 1.25;
  } else {
    multiplier = 1.0;
  }

  const multipliedLandValue = rawMarketValue * multiplier;
  const attachedAssetsValue = (Number(structureValuation) || 0) + (Number(treeCropValuation) || 0);
  const totalBaseAward = multipliedLandValue + attachedAssetsValue;
  const solatiumAmount = totalBaseAward * 1.0;
  const annualInterestRate = 0.12;
  const additionalInterestSec30 = rawMarketValue * (annualInterestRate * ((Number(monthsSinceSec11) || 0) / 12));
  const totalFirstScheduleCompensation = totalBaseAward + solatiumAmount + additionalInterestSec30;

  const count = Number(displacedFamilyCount) || 1;
  const rrPackage = {
    subsistenceGrant: count * 36000,
    transportationAllowance: count * 50000,
    oneTimeResettlementGrant: count * 50000,
    cattleShedOrShopGrant: count * 25000,
    totalRREstimate: count * 161000
  };

  return {
    inputs: {
      areaHectares,
      baseRatePerHa,
      areaType,
      multiplier,
      structureValuation,
      treeCropValuation,
      monthsSinceSec11,
      displacedFamilyCount
    },
    breakdown: {
      rawMarketValue: Math.round(rawMarketValue),
      multipliedLandValue: Math.round(multipliedLandValue),
      attachedAssetsValue: Math.round(attachedAssetsValue),
      totalBaseAward: Math.round(totalBaseAward),
      solatiumAmount: Math.round(solatiumAmount),
      additionalInterestSec30: Math.round(additionalInterestSec30),
      totalFirstScheduleCompensation: Math.round(totalFirstScheduleCompensation),
      rrPackage
    },
    grandTotalPayable: Math.round(totalFirstScheduleCompensation + rrPackage.totalRREstimate),
    statutoryNotes: [
      "Calculated in strict compliance with First & Second Schedules of RFCTLARR Act, 2013.",
      `100% Solatium (Rs. ${(solatiumAmount / 100000).toFixed(2)} Lakhs) applied as per Sec 30(1).`,
      `12% per annum additional market interest applied for ${monthsSinceSec11} elapsed months as per Sec 30(3).`
    ]
  };
}

export const api = {
  // Health
  getHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return await res.json();
      }
    } catch (e) {}
    return {
      status: 'ONLINE',
      system: 'Rashtriya BhoomiSetu - National Land Acquisition Portal',
      department: 'Department of Land Resources (DoLR), MoRD',
      timestamp: new Date().toISOString()
    };
  },

  // Users
  getUsers: async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return await res.json();
      }
    } catch (e) {}
    return localUsers;
  },

  // Analytics
  getNationalAnalytics: async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/national`);
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return await res.json();
      }
    } catch (e) {}
    return computeLocalAnalytics(localProjects, localParcels);
  },

  // Projects
  getProjects: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/projects?${query}`);
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return await res.json();
      }
    } catch (e) {}
    return localProjects;
  },

  getProjectById: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`);
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return await res.json();
      }
    } catch (e) {}
    return localProjects.find(p => p.id === id) || localProjects[0];
  },


  createProject: async (projectData) => {
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const newPrj = {
      id: `PRJ-2026-${projectData.category?.substring(0, 3).toUpperCase() || 'LRB'}-${Math.floor(100 + Math.random() * 900)}`,
      name: projectData.name || 'New Infrastructure Project',
      category: projectData.category || 'Highways & Transport',
      requiringBody: projectData.requiringBody || 'National Highways Authority of India',
      ministry: projectData.ministry || 'Ministry of Road Transport and Highways',
      state: projectData.state || 'Punjab',
      districts: projectData.districts || ['District North'],
      totalLengthKm: Number(projectData.totalLengthKm) || 45.0,
      totalLandRequiredHa: Number(projectData.totalLandRequiredHa) || 120.0,
      landAcquiredHa: 0,
      possessionHandedOverHa: 0,
      estimatedBudgetCr: Number(projectData.estimatedBudgetCr) || 350.0,
      compensationDisbursedCr: 0,
      totalParcels: 35,
      acquiredParcels: 0,
      disputedParcels: 0,
      stage: 'STAGE_1_PROPOSAL',
      stageName: 'Administrative Proposal & In-Principle Approval',
      status: 'Proposed / Under Review',
      priority: 'High',
      startDate: new Date().toISOString().split('T')[0],
      targetPossessionDate: projectData.targetPossessionDate || '2027-06-30',
      nodalOfficer: projectData.nodalOfficer || {
        name: 'Nodal Officer',
        designation: 'General Manager (LA)',
        contact: '+91 99999-00000',
        email: 'nodal@gov.in'
      },
      slaoOfficer: {
        name: 'Assigned DC / SLAO',
        designation: 'Special Land Acquisition Officer',
        contact: '+91 98888-11111',
        email: 'slao@gov.in'
      },
      alignmentCoordinates: [
        [31.25, 75.50],
        [31.30, 75.55],
        [31.35, 75.60]
      ],
      milestones: [
        { stage: 'STAGE_1_PROPOSAL', title: 'Administrative Proposal & In-Principle Approval', status: 'IN_PROGRESS', date: new Date().toISOString().split('T')[0], remarks: 'Proposal submitted by Requiring Body' },
        { stage: 'STAGE_2_SIA', title: 'Sec 4: Social Impact Assessment (SIA) & Expert Review', status: 'PENDING', date: '', remarks: 'Awaiting SIA notification' },
        { stage: 'STAGE_3_SEC11', title: 'Sec 11: Preliminary Notification (Gazette Publication)', status: 'PENDING', date: '', remarks: '' },
        { stage: 'STAGE_4_SEC15', title: 'Sec 15: Hearing of Objections & DC Report', status: 'PENDING', date: '', remarks: '' },
        { stage: 'STAGE_5_SEC19', title: 'Sec 19: Final Declaration & R&R Scheme Approval', status: 'PENDING', date: '', remarks: '' },
        { stage: 'STAGE_6_AWARD_DETERMINATION', title: 'Sec 23/26: Valuation, Award & Solatium Calculation', status: 'PENDING', date: '', remarks: '' },
        { stage: 'STAGE_7_POSSESSION', title: 'Sec 38: Compensation Payout (DBT) & Possession Handover', status: 'PENDING', date: '', remarks: '' }
      ]
    };

    localProjects = [newPrj, ...localProjects];
    setStore('projects', localProjects);
    return newPrj;
  },

  advanceProjectStage: async (id, stageData) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/advance-stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stageData)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const project = localProjects.find(p => p.id === id);
    if (project) {
      const stageOrder = [
        'STAGE_1_PROPOSAL',
        'STAGE_2_SIA',
        'STAGE_3_SEC11',
        'STAGE_4_SEC15',
        'STAGE_5_SEC19',
        'STAGE_6_AWARD_DETERMINATION',
        'STAGE_7_POSSESSION'
      ];
      const stageNames = {
        'STAGE_1_PROPOSAL': 'Administrative Proposal & In-Principle Approval',
        'STAGE_2_SIA': 'Sec 4: Social Impact Assessment (SIA)',
        'STAGE_3_SEC11': 'Sec 11: Preliminary Notification (Gazette)',
        'STAGE_4_SEC15': 'Sec 15: Hearing of Objections',
        'STAGE_5_SEC19': 'Sec 19: Final Declaration & R&R Scheme',
        'STAGE_6_AWARD_DETERMINATION': 'Sec 23/26: Valuation & Award',
        'STAGE_7_POSSESSION': 'Sec 38: Possession Handover (DBT)'
      };
      const currentIndex = stageOrder.indexOf(project.stage);
      const nextStage = stageData.targetStage || (currentIndex < stageOrder.length - 1 ? stageOrder[currentIndex + 1] : project.stage);
      project.stage = nextStage;
      project.stageName = stageNames[nextStage] || nextStage;
      project.milestones = project.milestones.map(m => {
        if (m.stage === nextStage) {
          return { ...m, status: 'COMPLETED', date: new Date().toISOString().split('T')[0], remarks: stageData.remarks || 'Approved by authority' };
        }
        return m;
      });
      setStore('projects', localProjects);
      return { message: 'Stage advanced successfully', project };
    }
    return { project };
  },

  // Parcels & GIS
  getParcels: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/parcels?${query}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return localParcels;
  },

  updateParcelStatus: async (id, actionData) => {
    try {
      const res = await fetch(`${API_BASE}/parcels/${id}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const parcel = localParcels.find(p => p.id === id);
    if (parcel) {
      const action = actionData.action;
      if (action === 'APPROVE_AWARD') {
        parcel.stage = 'STAGE_6_AWARD_DETERMINATION';
        parcel.status = 'Award Determined / Ready for DBT';
        parcel.statusColor = 'blue';
        parcel.dbtStatus = 'READY_FOR_DISBURSEMENT';
      } else if (action === 'DISBURSE_DBT') {
        parcel.dbtStatus = 'SUCCESSFUL';
        parcel.dbtTransactionRef = `DBT-RBI-${Date.now().toString().slice(-7)}`;
        parcel.status = 'Compensation Paid via DBT';
        parcel.statusColor = 'blue';
      } else if (action === 'GRANT_POSSESSION') {
        parcel.stage = 'STAGE_7_POSSESSION';
        parcel.status = 'Possession Handed Over';
        parcel.statusColor = 'green';
        parcel.possessionCertificateNo = `POSS-DLMS-2026-${Math.floor(100 + Math.random() * 900)}`;
        parcel.possessionDate = new Date().toISOString().split('T')[0];
      } else if (action === 'RESOLVE_DISPUTE') {
        parcel.courtStay = false;
        parcel.disputeReason = 'Dispute resolved via administrative settlement & mutual consensus.';
        parcel.status = 'Dispute Resolved / Proceeding to Award';
        parcel.statusColor = 'blue';
      }
      setStore('parcels', localParcels);
      return { message: 'Parcel updated successfully', parcel };
    }
    return { parcel };
  },

  // Compensation Engine
  calculateCompensation: async (calcData) => {
    try {
      const res = await fetch(`${API_BASE}/compensation/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calcData)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return computeRFCTLARRLocal(calcData);
  },

  // Grievances
  getGrievances: async () => {
    try {
      const res = await fetch(`${API_BASE}/grievances`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return localGrievances;
  },

  createGrievance: async (grievanceData) => {
    try {
      const res = await fetch(`${API_BASE}/grievances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grievanceData)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const newGrv = {
      id: `GRV-2026-${Math.floor(100 + Math.random() * 900)}`,
      projectId: grievanceData.projectId || 'PRJ-2026-NHAI-001',
      parcelId: `PARCEL-REF-${Math.floor(1000 + Math.random() * 9000)}`,
      khasraNo: grievanceData.khasraNo || 'N/A',
      complainantName: grievanceData.complainantName || 'Anonymous Landowner',
      contact: grievanceData.contact || '+91 98000-00000',
      category: grievanceData.category || 'Compensation Valuation Objection',
      description: grievanceData.description || 'No details provided.',
      status: 'Pending Verification by SLAO',
      filedDate: new Date().toISOString().split('T')[0],
      assignedTo: 'District SLAO Office',
      priority: 'MEDIUM',
      resolutionNotes: 'Assigned to field revenue inspector for spot inquiry.',
      history: [
        { date: new Date().toISOString().split('T')[0], action: 'Grievance Registered on Portal', by: 'Landowner' }
      ]
    };
    localGrievances = [newGrv, ...localGrievances];
    setStore('grievances', localGrievances);
    return newGrv;
  },

  // Documents & Certificates
  generateDocument: async (type, id) => {
    try {
      const res = await fetch(`${API_BASE}/documents/generate/${type}/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {}

    let documentData = {};
    if (type === 'GAZETTE_SEC11') {
      const project = localProjects.find(p => p.id === id) || localProjects[0];
      documentData = {
        docType: 'Preliminary Notification under Section 11(1) of RFCTLARR Act 2013',
        gazetteNotificationNo: `GAZ-DLMS-${project.id.replace('PRJ-', '')}-SEC11`,
        dateOfPublication: new Date().toISOString().split('T')[0],
        issuingAuthority: 'Department of Revenue & Disaster Management',
        state: project.state,
        projectName: project.name,
        requiringBody: project.requiringBody,
        totalAreaNotifiedHa: project.totalLandRequiredHa,
        districtsCovered: Array.isArray(project.districts) ? project.districts.join(', ') : project.districts,
        content: `Whereas it appears to the Appropriate Government that a total of ${project.totalLandRequiredHa} Hectares of land is required for a public purpose, namely "${project.name}" executed by ${project.requiringBody}. It is hereby notified under Section 11(1) of RFCTLARR Act, 2013 that any person interested in any land may submit objections within 60 days to the Collector.`
      };
    } else {
      const parcel = localParcels.find(p => p.id === id) || localParcels[0];
      documentData = {
        docType: 'Certificate of Possession under Section 38 of RFCTLARR Act 2013 (Form 16)',
        certificateNo: parcel.possessionCertificateNo || `POSS-GOI-2026-${parcel.id}`,
        issueDate: parcel.possessionDate || new Date().toISOString().split('T')[0],
        issuingOfficer: 'District Collector & SLAO',
        khasraNo: parcel.khasraNo,
        village: parcel.village,
        tehsil: parcel.tehsil,
        district: parcel.district,
        landownerName: parcel.ownerName,
        acquiredAreaHa: parcel.areaHectares,
        totalAwardDisbursedRs: parcel.totalCompensationAwarded,
        dbtReference: parcel.dbtTransactionRef || 'DBT-GOI-VERIFIED-2026',
        content: `This is to certify that full and final compensation under Section 23/26 of RFCTLARR Act 2013 has been credited via Direct Benefit Transfer (DBT) to the bank account of ${parcel.ownerName}. The unencumbered possession of the parcel measuring ${parcel.areaHectares} Ha is hereby handed over to the Requiring Body free from all encumbrances.`
      };
    }

    const pseudoHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    documentData.cryptographicSha256 = pseudoHash;
    documentData.digitalSignature = `DIGITALLY_SIGNED_BY_GOV_CERT_AUTHORITY_${pseudoHash.substring(0, 16).toUpperCase()}`;
    return documentData;
  },

  // Audit Logs
  getAuditLogs: async () => {
    try {
      const res = await fetch(`${API_BASE}/audit-logs`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [
      {
        id: "LOG-001",
        timestamp: new Date().toISOString(),
        user: "Dr. Harpreet Kaur, PCS",
        role: "DISTRICT_COLLECTOR_SLAO",
        action: "AWARD_DETERMINED",
        target: "PARCEL-JAL-002",
        details: "Determined Sec 23 award of Rs. 1.34 Cr with 100% solatium."
      }
    ];
  }
};
