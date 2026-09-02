import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/withAuth';
import { adminDb } from '@/lib/firebase/admin';
import { calculateRoWPolygon, findIntersectingParcels } from '@/lib/utils/spatialEngine';
import { CadastralParcel } from '@/types/schema';

async function bufferIntersectionHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { projectId, centerline, rowWidthMeters } = body;

    // Validate incoming GIS parameters
    if (!projectId || !centerline || !rowWidthMeters) {
      return NextResponse.json({ 
        error: 'Missing required parameters: projectId, centerline, or rowWidthMeters' 
      }, { status: 400 });
    }

    // 1. Generate the physical Right-of-Way footprint using Turf.js
    let rowPolygon;
    try {
      rowPolygon = calculateRoWPolygon(centerline, rowWidthMeters);
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Failed to generate RoW buffer' }, { status: 400 });
    }

    // 2. Fetch all Cadastral Parcels associated with this infrastructure project
    const parcelsSnap = await adminDb.collection('parcels')
      .where('project_id', '==', projectId)
      .get();

    const allParcels: CadastralParcel[] = [];
    parcelsSnap.forEach(doc => {
      // Cast the Firestore document to our strict schema
      allParcels.push(doc.data() as CadastralParcel);
    });

    // 3. Find intersecting parcels using the Turf.js spatial intersection engine
    const intersectionResult = findIntersectingParcels(rowPolygon, allParcels);

    // 4. Return the comprehensive GIS report
    return NextResponse.json({
      rowPolygon,
      affectedParcels: intersectionResult.intersectingParcels,
      totalAffectedAreaHa: intersectionResult.totalAffectedAreaHa
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error executing buffer intersection engine:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = withAuth(['central_admin', 'requiring_body', 'slao_district'], bufferIntersectionHandler);
