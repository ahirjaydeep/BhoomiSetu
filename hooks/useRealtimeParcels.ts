import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { CadastralParcel } from '@/lib/types/schema';
import { useRealtimeSync } from "@/providers/RealtimeSyncProvider";

export function useRealtimeParcels(projectId: string) {
  const { registerListener, unregisterListener, updateSyncTime } = useRealtimeSync();
  const [parcels, setParcels] = useState<CadastralParcel[]>([]);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    registerListener();
    setLoading(true);
    const parcelsQuery = query(
      collection(db, 'cadastral_parcels'),
      where('projectId', '==', projectId)
    );
    
    const unsubscribe = onSnapshot(
      parcelsQuery,
      (snapshot) => {
        const parsedParcels: CadastralParcel[] = [];
        const features: any[] = [];

        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data() as CadastralParcel;
          const parcelWithId = { id: docSnap.id, ...data };
          parsedParcels.push(parcelWithId);

          let geometry = { type: "Polygon", coordinates: [] };
          if (data.geoCoordinates) {
            try {
              // Parse stringified geoCoordinates workaround
              geometry = typeof data.geoCoordinates === 'string' 
                ? JSON.parse(data.geoCoordinates) 
                : data.geoCoordinates;
            } catch(e) {
              console.warn(`Failed to parse geometry for parcel ${docSnap.id}`);
            }
          }

          features.push({
            type: "Feature",
            id: docSnap.id,
            geometry,
            properties: {
              ...parcelWithId,
              // Map possessionStatus to acquisition_status to preserve backwards compatibility
              // with the legacy CadastralOverlay styling logic
              acquisition_status: data.possessionStatus,
            },
          });
        });

        setParcels(parsedParcels);
        setGeoJsonData({
          type: "FeatureCollection",
          features,
        });
        setError(null);
        setLoading(false);
        updateSyncTime();
      },
      (err) => {
        console.error('Realtime parcels sync error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      unregisterListener();
    };
  }, [projectId]);

  return { parcels, geoJsonData, loading, error };
}
