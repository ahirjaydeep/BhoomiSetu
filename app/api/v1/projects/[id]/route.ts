import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { ensureProjectExists } from "@/lib/firebase/ensureProjectExists";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    // Auto-heal missing records if project does not exist
    await ensureProjectExists(projectId);

    const docRef = doc(db, "projects", projectId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: snap.data() }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/v1/projects/[id] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
