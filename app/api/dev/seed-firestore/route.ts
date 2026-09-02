import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/withAuth';
import { adminDb } from '@/lib/firebase/admin';
import type { Project, CadastralParcel, GeoJSONPolygon } from '@/types/schema';

async function seedHandler(req: AuthenticatedRequest) {
  try {
    const batch = adminDb.batch();

    // 1. Create Projects
    const proj1Ref = adminDb.collection('projects').doc('proj-1');
    const proj1Data: Project = {
      id: 'proj-1',
      title: 'Delhi-Amritsar-Katra Expressway',
      lrb_name: 'National Highways Authority of India (NHAI)',
      total_budget: 350000000000, // ₹35,000 Crores
      current_stage: 3,
    };
    batch.set(proj1Ref, proj1Data);

    const proj2Ref = adminDb.collection('projects').doc('proj-2');
    const proj2Data: Project = {
      id: 'proj-2',
      title: 'Rewa Ultra Mega Solar Park',
      lrb_name: 'Rewa Ultra Mega Solar Limited',
      total_budget: 45000000000, // ₹4,500 Crores
      current_stage: 6,
    };
    batch.set(proj2Ref, proj2Data);

    // 2. Create 5 Cadastral Parcels linked to proj-1
    const mockStatuses = [
      'SEC11_NOTIFIED',
      'SEC15_DISPUTED',
      'SEC19_FINAL',
      'COMPENSATION_PAID',
      'POSSESSION_TAKEN'
    ];
    
    let parcelCount = 0;

    for (let i = 0; i < 5; i++) {
      const pRef = adminDb.collection('CadastralParcel').doc(`parcel-${i + 1}`);
      
      // Generating realistic-looking Polygon coordinates in Punjab (approx Lat: 31.0, Lng: 75.0)
      const offset = i * 0.001;
      const mockPolygon: GeoJSONPolygon = {
        type: 'Polygon',
        coordinates: [
          [
            [75.0001 + offset, 31.0001 + offset],
            [75.0010 + offset, 31.0001 + offset],
            [75.0010 + offset, 31.0010 + offset],
            [75.0001 + offset, 31.0010 + offset],
            [75.0001 + offset, 31.0001 + offset], // Closing the polygon
          ]
        ]
      };

      const parcelData: CadastralParcel = {
        khasra_no: `402/${i + 1}`,
        state: 'Punjab',
        district: 'Ludhiana',
        village: 'Khanna',
        coordinates: mockPolygon,
        owner_name: `Farmer ${String.fromCharCode(65 + i)}`,
        base_circle_rate: 2500000 + (i * 100000), // ~25-29 Lakhs per hectare
        acquisition_status: mockStatuses[i],
        project_id: 'proj-1'
      };
      
      batch.set(pRef, parcelData);
      parcelCount++;
    }

    // 3. Commit the batch write to Firestore (All-or-Nothing operation)
    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: `Successfully seeded Firestore with 2 Projects and ${parcelCount} Cadastral Parcels.` 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error seeding data:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// Allow both POST and GET to make it easy to trigger from the browser during dev
export const POST = withAuth(['central_admin'], seedHandler);
export const GET = withAuth(['central_admin'], seedHandler);
