import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

const STAGE_PARCEL_STATUS_MAP: Record<number, string> = {
  1: "Pending",
  2: "Pending",
  3: "Pending",
  4: "Award Determined",
  5: "Possession Handed Over",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, newStage, userActor = "SLAO_DISTRICT_OFFICER" } = body;

    if (!projectId || !newStage) {
      return NextResponse.json({ error: "Missing projectId or newStage" }, { status: 400 });
    }

    const projectRef = adminDb.collection("projects").doc(projectId);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const currentStage = projectSnap.data()?.currentStage;
    const batch = adminDb.batch();

    // 1. Advance project stage
    batch.update(projectRef, {
      currentStage: newStage,
      updatedAt: new Date().toISOString(),
    });

    // 2. Cascade parcel statuses
    const parcelsSnap = await adminDb
      .collection("cadastral_parcels")
      .where("projectId", "==", projectId)
      .get();

    const targetStatus = STAGE_PARCEL_STATUS_MAP[newStage] || "Pending";
    parcelsSnap.docs.forEach((parcelDoc) => {
      batch.update(parcelDoc.ref, {
        possessionStatus: targetStatus,
      });
    });

    // 3. Log audit event
    const auditRef = adminDb.collection("audit_logs").doc();
    batch.set(auditRef, {
      projectId,
      action: `ADVANCE_STAGE_TO_${newStage}`,
      actor: userActor,
      previousStage: currentStage,
      newStage,
      timestamp: new Date().toISOString(),
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Project advanced to Stage ${newStage}. Synced ${parcelsSnap.size} child parcels.`,
    });
  } catch (error: any) {
    console.error("POST /api/v1/workflow/advance-stage Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
