import { buffer, intersect, area } from '@turf/turf';
import { Feature, LineString, Polygon } from 'geojson';
import { CadastralParcel } from '@/types/schema';
import { IntersectionResult } from '@/types/gis';

export function calculateRoWPolygon(centerline: Feature<LineString>, rowWidthMeters: number): Feature<Polygon> {
  // A Right-of-Way width is the total width. The buffer radius from the centerline is half of that.
  const radiusMeters = rowWidthMeters / 2;
  const radiusKm = radiusMeters / 1000;

  // Generate the buffer polygon using Turf
  const rowPolygon = buffer(centerline, radiusKm, { units: 'kilometers' });

  // Error handling
  if (!rowPolygon || !rowPolygon.geometry) {
    throw new Error("Failed to generate RoW buffer");
  }

  // Cast the output strictly to Feature<Polygon> as requested
  return rowPolygon as Feature<Polygon>;
}

export function findIntersectingParcels(rowPolygon: Feature<Polygon>, allParcels: CadastralParcel[]): IntersectionResult {
  const affectedParcels: CadastralParcel[] = [];
  let totalAffectedAreaMeters = 0;

  for (const parcel of allParcels) {
    if (parcel.coordinates && intersect(rowPolygon, parcel.coordinates as any) !== null) {
      affectedParcels.push(parcel);
      totalAffectedAreaMeters += area(parcel.coordinates as any);
    }
  }

  return {
    intersectingParcels: affectedParcels,
    totalAffectedAreaHa: totalAffectedAreaMeters / 10000
  };
}
