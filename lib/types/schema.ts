export interface Project {
  id: string; // e.g. "NH-44-DELHI-AMRITSAR"
  name: string;
  ministry: string; // "Ministry of Road Transport & Highways"
  corridorType: string;
  currentStage: number; // 1 to 7 (1: Sec 4, 2: Sec 11, 3: Sec 15, 4: Sec 19, 5: Sec 23, 6: Sec 30, 7: Sec 38)
  activeCorridorsCount: number;
  totalDisbursedCrores: number;
  sec11Date?: any;
  sec19Date?: any;
  projectType?: string;
  risk?: boolean;
  sector?: string;
  district?: string;
  state?: string;
  totalAreaHa?: number;
  khasraCount?: number;
  estimatedBudget?: number;
  updatedAt: string;
}

export interface CadastralParcel {
  id: string; // Document ID, e.g. "KHASRA-142-3-1"
  projectId: string;
  khasraNo: string; // "142/3/1"
  ownerName: string; // "Sardar Gurdeep Singh Sandhu"
  village: string;
  tehsil: string;
  district: string;
  state: string;
  areaHectares: number;
  multiplier: number;
  possessionStatus: "Pending" | "Possession Handed Over" | "Disputed" | "Award Determined" | string;
  totalCompensationLakhs: number;
  dbtStatus: "PENDING" | "PROCESSING" | "SUCCESSFUL" | "FAILED";
  pftsRefNo: string;
  dbtReference?: string;
  compensationBaseValue?: number;
  compensationSolatium?: number;
  compensationTotalAward?: number;
  geoCoordinates: string;
}

export interface Objection {
  id: string;
  projectId: string;
  khasraNo: string;
  complainantName: string;
  mobileNumber: string;
  category: "Valuation & Solatium Discrepancy" | "Ownership Dispute" | "Boundary Overlap";
  detailedGrounds: string;
  status: "Pending" | "Under SLAO Hearing" | "Resolved" | "Rejected";
  createdAt: string;
}

export interface Award {
  id: string;
  parcelId: string;
  khasraNo: string;
  marketRateSec26: number; // in Lakhs
  solatiumSec30: number; // 100% solatium
  interestSec34: number;
  totalAwardAmount: number;
  determinedDate: string;
}

export interface AuditLog {
  id: string;
  projectId: string;
  action: string;
  actor: string;
  timestamp: string;
  previousStage: number;
  newStage: number;
}

export const RFCTLARR_STAGES: Record<number, { title: string; section: string }> = {
  1: { title: "SIA Notification & Feasibility", section: "Sec 4" },
  2: { title: "Preliminary Gazette Notification", section: "Sec 11" },
  3: { title: "Public Objections & Collector Hearing", section: "Sec 15" },
  4: { title: "Final Acquisition Declaration", section: "Sec 19" },
  5: { title: "Award Determination / Form 11", section: "Sec 23" },
  6: { title: "Solatium & Compensation Computation", section: "Sec 30" },
  7: { title: "Possession Handover & DBT Payout", section: "Sec 38" },
};
