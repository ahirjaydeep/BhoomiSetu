import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/withAuth';
import { adminDb } from '@/lib/firebase/admin';
import { calculateFirstSchedule, calculateSecondSchedule } from '@/lib/utils/valuationEngine';
import type { StatutoryAwardForm11 } from '@/types/valuation';
import type { CadastralParcel, Project } from '@/types/schema';

async function calculateAwardHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { 
      parcelId, 
      avgSaleDeed, 
      attachedAssets, 
      losesHouse, 
      hasCattle, 
      isArtisan 
    } = body;

    if (!parcelId) {
      return NextResponse.json({ error: 'Missing parcelId in request body.' }, { status: 400 });
    }

    // 1. Fetch CadastralParcel Document
    const parcelRef = adminDb.collection('CadastralParcel').doc(parcelId);
    const parcelSnap = await parcelRef.get();
    if (!parcelSnap.exists) {
      return NextResponse.json({ error: `CadastralParcel with ID ${parcelId} not found.` }, { status: 404 });
    }
    const parcelData = parcelSnap.data() as CadastralParcel;

    // Use default values for missing data assuming dummy seeds might lack them
    const area = parcelData.area || 1.0; 
    const circleRate = parcelData.base_circle_rate;
    const isUrban = parcelData.is_urban || false;
    const distanceToUrban = parcelData.distance_to_urban || 0;
    const projectId = parcelData.project_id;

    // 2. Fetch Parent Project Document
    const projectRef = adminDb.collection('projects').doc(projectId);
    const projectSnap = await projectRef.get();
    if (!projectSnap.exists) {
      return NextResponse.json({ error: `Associated Project ID ${projectId} not found.` }, { status: 404 });
    }
    const projectData = projectSnap.data() as Project;

    // Safely parse sec11Date from Firestore Timestamp or string
    let sec11Date: Date;
    if (projectData.sec11Date) {
      sec11Date = projectData.sec11Date.toDate ? projectData.sec11Date.toDate() : new Date(projectData.sec11Date);
    } else {
      // Fallback: If dummy data has no date, assume 1 year prior to today to demonstrate interest calc
      sec11Date = new Date();
      sec11Date.setFullYear(sec11Date.getFullYear() - 1);
    }
    
    const awardDate = new Date();

    // 3. Compute the First Schedule Award
    const firstSchedule = calculateFirstSchedule(
      area,
      circleRate,
      Number(avgSaleDeed || 0),
      isUrban,
      distanceToUrban,
      Number(attachedAssets || 0),
      sec11Date,
      awardDate
    );

    // 4. Compute the Second Schedule (R&R) Award
    const secondSchedule = calculateSecondSchedule(
      Boolean(losesHouse),
      Boolean(hasCattle),
      Boolean(isArtisan)
    );

    // 5. Combine into StatutoryAwardForm11 structure
    const grandTotal = firstSchedule.finalFirstScheduleTotal + secondSchedule.totalRnR;
    const statutoryAward: StatutoryAwardForm11 = {
      khasra_no: parcelData.khasra_no,
      calculatedAt: awardDate,
      firstSchedule,
      secondSchedule,
      grandTotal,
    };

    // 6. Perform Atomic Batch Write (Save Award + Update Status + Audit Log)
    const batch = adminDb.batch();
    
    // Save to 'awards' collection under the same parcelId for 1-1 relational mapping
    const awardRef = adminDb.collection('awards').doc(parcelId);
    batch.set(awardRef, statutoryAward);

    // Update the parcel acquisition status
    batch.update(parcelRef, { acquisition_status: 'AWARD_DETERMINED' });

    // Create the Audit Log entry
    const auditLogRef = adminDb.collection('audit_logs').doc(); // Auto-generated ID
    const auditLogData = {
      action: 'SEC_23_AWARD_GENERATED',
      timestamp: new Date(),
      performed_by: req.user.uid,
      entity_id: parcelId,
      grand_total: grandTotal
    };
    batch.set(auditLogRef, auditLogData);

    await batch.commit();

    // 7. Return the award to the client
    return NextResponse.json({ 
      success: true, 
      message: 'Statutory Award successfully generated and saved.',
      award: statutoryAward 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Calculate Award Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// 8. Wrap with slao_district authorization role
export const POST = withAuth(['slao_district'], calculateAwardHandler);
