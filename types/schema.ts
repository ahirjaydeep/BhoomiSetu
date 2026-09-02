import { RfctlarrStage, StageTransitionLog } from './workflow';
import { Feature, Polygon } from 'geojson';

export type Role = 'central_admin' | 'state_revenue' | 'slao_district' | 'requiring_body' | 'citizen';

export interface User {
  uid: string;
  email: string;
  role: Role;
  assigned_district?: string;
}

export interface Project {
  id: string;
  title: string;
  lrb_name: string;
  total_budget: number;
  current_stage: RfctlarrStage;
  sec11Date: Date | null;
  sec19Date: Date | null;
  workflowHistory: StageTransitionLog[];
}

export interface CadastralParcel {
  khasra_no: string;
  state: string;
  district: string;
  village: string;
  coordinates: Feature<Polygon>;
  owner_name: string;
  base_circle_rate: number;
  acquisition_status: string;
  project_id: string;
  area?: number;
  is_urban?: boolean;
  distance_to_urban?: number;
}

export interface AuditLog {
  action: string;
  timestamp: any; // e.g., admin.firestore.Timestamp | firebase.firestore.Timestamp | Date
  performed_by: string; // User UID
  entity_id: string;
  grand_total?: number;
}
