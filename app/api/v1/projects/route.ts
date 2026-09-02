import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { runFirestoreSeed } from "@/lib/firebase/seedEngine";

export async function GET() {
  try {
    const projectsSnapshot = await adminDb.collection("projects").get();
    
    // Auto-seed if missing data
    if (projectsSnapshot.size < 2) {
      console.log("Projects missing, auto-seeding...");
      await runFirestoreSeed();
      
      // Re-fetch after seeding
      const newSnapshot = await adminDb.collection("projects").get();
      const projects = newSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return NextResponse.json({ data: projects });
    }

    const projects = projectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ data: projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
