import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Objection } from '@/lib/types/schema';
import { useRealtimeSync } from "@/providers/RealtimeSyncProvider";

export function useRealtimeObjections(projectId: string) {
  const { registerListener, unregisterListener, updateSyncTime } = useRealtimeSync();
  const [objections, setObjections] = useState<Objection[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    registerListener();
    setLoading(true);
    // Note: This compound query requires a composite index in Firestore.
    // (projectId ASC, createdAt DESC)
    const objectionsQuery = query(
      collection(db, 'objections'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      objectionsQuery,
      (snapshot) => {
        const parsedObjections: Objection[] = [];
        let pending = 0;

        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data() as Objection;
          const objectionWithId = { id: docSnap.id, ...data };
          parsedObjections.push(objectionWithId);

          if (data.status === 'Pending') {
            pending++;
          }
        });

        setObjections(parsedObjections);
        setPendingCount(pending);
        setError(null);
        setLoading(false);
        updateSyncTime();
      },
      (err) => {
        console.error('Realtime objections sync error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      unregisterListener();
    };
  }, [projectId]);

  return { objections, pendingCount, loading, error };
}
