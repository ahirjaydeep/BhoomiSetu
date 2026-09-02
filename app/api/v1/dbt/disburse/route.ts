import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/withAuth';
import { adminDb } from '@/lib/firebase/admin';
import crypto from 'crypto';
import * as admin from 'firebase-admin';
import { RfctlarrStage } from '@/types/workflow';
import { canAdvanceStage } from '@/lib/utils/workflowEngine';

async function dbtDisburseHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { parcelId, projectId, beneficiaryAadhaarHash, amount } = body;

    // Validate parameters
    if (!parcelId || !projectId || !beneficiaryAadhaarHash || amount === undefined || amount <= 0) {
      return NextResponse.json({ 
        error: 'Missing or invalid required parameters: parcelId, projectId, beneficiaryAadhaarHash, or amount' 
      }, { status: 400 });
    }

    const projectRef = adminDb.collection('projects').doc(projectId);
    const parcelRef = adminDb.collection('parcels').doc(parcelId);

    // Fetch the project to verify escrow balance
    const projectSnap = await projectRef.get();
    if (!projectSnap.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const projectData = projectSnap.data();
    const currentBalance = projectData?.escrow_balance || 0;

    // Strict financial check
    if (currentBalance < amount) {
      return NextResponse.json({ error: 'Insufficient escrow funds' }, { status: 400 });
    }

    // Initialize the atomic batch
    const batch = adminDb.batch();

    // 1. Safely deduct the amount from the Project's escrow_balance using an atomic increment operation
    batch.update(projectRef, {
      escrow_balance: admin.firestore.FieldValue.increment(-amount)
    });

    // 2. Update the CadastralParcel's acquisition status to final possession
    batch.update(parcelRef, {
      acquisition_status: 'COMPENSATED_POSSESSED'
    });

    // 3. Create the immutable PFMS DBT Transaction record
    const randomUtrSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    const utrNumber = `UTR-PFMS-${randomUtrSuffix}`;
    const transactionRef = adminDb.collection('dbt_transactions').doc(utrNumber);

    batch.set(transactionRef, {
      utrNumber,
      projectId,
      parcelId,
      beneficiaryAadhaarHash,
      amount,
      status: 'SUCCESS',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      processedBy: req.user.uid
    });

    // Commit the atomic financial transaction
    await batch.commit();

    // 4. Final Stage Transition Hook: Check if ALL parcels are compensated
    const allParcelsSnap = await adminDb.collection('parcels').where('project_id', '==', projectId).get();
    
    let allCompensated = true;
    allParcelsSnap.forEach(doc => {
      // We must check the actual database values, which now include the updated parcel
      if (doc.data().acquisition_status !== 'COMPENSATED_POSSESSED') {
        allCompensated = false;
      }
    });

    if (allCompensated && projectData?.current_stage === RfctlarrStage.STAGE_6_SEC23_AWARD) {
      // Validate transition mathematically
      const validation = canAdvanceStage(projectData.current_stage, RfctlarrStage.STAGE_7_SEC38_POSSESSION);
      
      if (validation.allowed) {
        const stageBatch = adminDb.batch();
        const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();

        stageBatch.update(projectRef, {
          current_stage: RfctlarrStage.STAGE_7_SEC38_POSSESSION,
          workflowHistory: admin.firestore.FieldValue.arrayUnion({
            fromStage: projectData.current_stage,
            toStage: RfctlarrStage.STAGE_7_SEC38_POSSESSION,
            transitionedAt: serverTimestamp,
            transitionedBy: req.user.uid,
            remarks: "All parcel compensations disbursed. Physical possession finalized."
          })
        });

        // Write final entry to audit_logs signifying the complete closure
        const auditLogRef = adminDb.collection('audit_logs').doc();
        stageBatch.set(auditLogRef, {
          action: 'LIFECYCLE_CLOSED_STAGE_7',
          timestamp: serverTimestamp,
          performed_by: 'SYSTEM_HOOK',
          entity_id: projectId,
          details: 'All parcel compensations disbursed. Complete closure of the RFCTLARR land acquisition lifecycle.'
        });

        await stageBatch.commit();
      }
    }

    // Return the generated UTR number back to the client
    return NextResponse.json({
      success: true,
      utrNumber,
      message: 'Direct Benefit Transfer completed successfully'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing PFMS DBT simulation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Secure the route, allowing ONLY the SLAO official to trigger payouts
export const POST = withAuth(['slao_district'], dbtDisburseHandler);
