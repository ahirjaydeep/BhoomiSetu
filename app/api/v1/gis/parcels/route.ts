import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") || "NH-44-DELHI-AMRITSAR";

    const snapshot = await adminDb
      .collection("cadastral_parcels")
      .where("projectId", "==", projectId)
      .get();

    const features = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      
      let geometry = { type: "Polygon", coordinates: [] };
      if (data.geoCoordinates) {
        try {
          // Parse stringified geoCoordinates if needed to support our nested array workaround
          geometry = typeof data.geoCoordinates === 'string' 
            ? JSON.parse(data.geoCoordinates) 
            : data.geoCoordinates;
        } catch(e) {
          console.warn(`Failed to parse geometry for parcel ${docSnap.id}`);
        }
      }

      return {
        type: "Feature",
        id: docSnap.id,
        geometry,
        properties: {
          id: docSnap.id,
          khasraNo: data.khasraNo,
          ownerName: data.ownerName,
          village: data.village,
          areaHectares: data.areaHectares,
          possessionStatus: data.possessionStatus,
          totalCompensationLakhs: data.totalCompensationLakhs,
          dbtStatus: data.dbtStatus,
        },
      };
    });

    const geoJson = {
      type: "FeatureCollection",
      features,
    };

    return NextResponse.json(geoJson, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/v1/gis/parcels Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
