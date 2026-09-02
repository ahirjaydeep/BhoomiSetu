import { RfctlarrStage } from '@/types/workflow';
import { adminDb } from '@/lib/firebase/admin';

export const stageToParcelStatus = (stage: number): string | null => {
  switch (stage) {
    case RfctlarrStage.STAGE_1_PROPOSAL:
      return 'PROPOSED';
    case RfctlarrStage.STAGE_2_SIA_APPROVAL:
      return 'SIA_IN_PROGRESS';
    case RfctlarrStage.STAGE_3_SEC11_GAZETTE:
      return 'SEC11_NOTIFIED';
    case RfctlarrStage.STAGE_4_SEC15_HEARING:
      return 'SEC15_HEARING';
    case RfctlarrStage.STAGE_5_SEC19_DECLARATION:
      return 'SEC19_DECLARED';
    case RfctlarrStage.STAGE_6_SEC23_AWARD:
      return 'AWARD_DETERMINED';
    case RfctlarrStage.STAGE_7_SEC38_POSSESSION:
      return 'COMPENSATED_POSSESSED';
    default:
      return null;
  }
};

export async function verifyProjectParcelsSync(projectId: string) {
  try {
    const projectRef = adminDb.collection('projects').doc(projectId);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      throw new Error(`Project ${projectId} not found.`);
    }

    const currentStage = projectSnap.data()?.current_stage || RfctlarrStage.STAGE_1_PROPOSAL;
    const expectedStatus = stageToParcelStatus(currentStage);

    if (!expectedStatus) {
      throw new Error(`No mapped parcel status for stage ${currentStage}.`);
    }

    const parcelsRef = projectRef.collection('parcels');
    const parcelsSnap = await parcelsRef.get();

    const batch = adminDb.batch();
    let updatedCount = 0;

    parcelsSnap.docs.forEach(doc => {
      if (doc.data().acquisition_status !== expectedStatus) {
        batch.update(doc.ref, { acquisition_status: expectedStatus });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
    }

    return { success: true, fixedCount: updatedCount, targetStatus: expectedStatus };
  } catch (error: any) {
    console.error('Sync verification failed:', error);
    return { success: false, error: error.message };
  }
}
