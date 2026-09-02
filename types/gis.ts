import { Feature, LineString, Polygon } from 'geojson';
import { CadastralParcel } from './schema';

export interface CorridorAlignment {
  projectId: string;
  centerline: Feature<LineString>;
  rowWidthMeters: number;
}

export interface IntersectionResult {
  intersectingParcels: CadastralParcel[];
  totalAffectedAreaHa: number;
}
