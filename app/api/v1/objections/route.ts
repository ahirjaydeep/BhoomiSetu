import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") || "NH-44-DELHI-AMRITSAR";

    const snapshot = await adminDb
      .collection("objections")
      .where("projectId", "==", projectId)
      .get();

    const objections = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json({ success: true, data: objections }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, khasraNo, complainantName, mobileNumber, category, detailedGrounds } = body;

    if (!projectId || !khasraNo || !complainantName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const docRef = await adminDb.collection("objections").add({
      projectId,
      khasraNo,
      complainantName,
      mobileNumber: mobileNumber || "",
      category: category || "Valuation & Solatium Discrepancy",
      detailedGrounds: detailedGrounds || "",
      status: "Pending",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: docRef.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
