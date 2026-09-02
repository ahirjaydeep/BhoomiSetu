import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Award } from '@/lib/types/schema';
import { useRealtimeSync } from "@/providers/RealtimeSyncProvider";

export function useRealtimeAwards(projectId: string) {
  const { registerListener, unregisterListener, updateSyncTime } = useRealtimeSync();
  const [awards, setAwards] = useState<Award[]>([]);
  const [totalPayoutCrores, setTotalPayoutCrores] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    registerListener();
    setLoading(true);
    
    // Note: Since 'projectId' isn't explicitly stored on the Award schema yet, 
    // we listen to the entire collection for the demo aggregate metrics. 
    // In production, add 'where("projectId", "==", projectId)' after adding the field.
    const awardsQuery = collection(db, 'awards');
    
    const unsubscribe = onSnapshot(
      awardsQuery,
      (snapshot) => {
        const parsedAwards: Award[] = [];
        let sumLakhs = 0;

        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data() as Award;
          parsedAwards.push({ id: docSnap.id, ...data });
          
          if (data.totalAwardAmount) {
            sumLakhs += data.totalAwardAmount;
          }
        });

        setAwards(parsedAwards);
        
        // Convert Lakhs to Crores (1 Crore = 100 Lakhs)
        const crores = sumLakhs / 100;
        setTotalPayoutCrores(crores);
        
        setError(null);
        setLoading(false);
        updateSyncTime();
      },
      (err) => {
        console.error('Realtime awards sync error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      unregisterListener();
    };
  }, [projectId]);

  return { awards, totalPayoutCrores, loading, error };
}
