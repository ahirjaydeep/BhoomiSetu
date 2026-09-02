import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parcelId, marketRateSec26, solatiumSec30, interestSec34, totalAwardAmount } = body;

    if (!parcelId || !totalAwardAmount) {
      return NextResponse.json({ error: "Missing parcel ID or award amount" }, { status: 400 });
    }

    const parcelRef = adminDb.collection("cadastral_parcels").doc(parcelId);
    const parcelSnap = await parcelRef.get();

    if (!parcelSnap.exists) {
      return NextResponse.json({ error: "Land parcel not found" }, { status: 404 });
    }

    // Generate cryptographic hash seal for legal immutability
    const payload = `${parcelId}-${totalAwardAmount}-${Date.now()}`;
    const sha256Hash = crypto.createHash("sha256").update(payload).digest("hex");

    const awardId = `AWD-${parcelId}`;
    const awardRef = adminDb.collection("awards").doc(awardId);

    const awardData = {
      id: awardId,
      parcelId,
      khasraNo: parcelSnap.data()?.khasraNo,
      marketRateSec26,
      solatiumSec30,
      interestSec34,
      totalAwardAmount,
      sha256Hash,
      determinedDate: new Date().toISOString(),
    };

    // Save award document and update parcel compensation in an atomic batch
    const batch = adminDb.batch();
    batch.set(awardRef, awardData, { merge: true });
    
    // Update parcel compensation sum and status
    batch.update(parcelRef, {
      totalCompensationLakhs: totalAwardAmount,
      possessionStatus: "Award Determined",
      dbtStatus: "PROCESSING",
    });
    
    await batch.commit();

    return NextResponse.json({
      success: true,
      award: awardData,
      seal: sha256Hash,
    });
  } catch (error: any) {
    console.error("POST /api/v1/valuation/finalize-award Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
