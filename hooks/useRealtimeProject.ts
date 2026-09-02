import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Project } from "@/lib/types/schema";
import { useRealtimeSync } from "@/providers/RealtimeSyncProvider";

export function useRealtimeProject(projectId: string) {
  const { registerListener, unregisterListener, updateSyncTime } = useRealtimeSync();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    registerListener();
    setLoading(true);
    const docRef = doc(db, "projects", projectId);

    const unsubscribe = onSnapshot(
      docRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          console.warn(`Project ${projectId} not found. Triggering auto-seed endpoint...`);
          try {
            await fetch("/api/v1/seed", { method: "POST" });
            // Note: We don't need to manually re-read because onSnapshot will 
            // automatically fire again once the seed script creates the document!
          } catch (err: any) {
            console.error("Failed to trigger auto-seed:", err);
            setError(err.message || "Failed to trigger auto-seed");
          }
          return;
        }

        setProject({ id: snapshot.id, ...snapshot.data() } as Project);
        setError(null);
        setLoading(false);
        updateSyncTime();
      },
      (err) => {
        console.error("Realtime project sync error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      unregisterListener();
    };
  }, [projectId]);

  return { project, loading, error };
}
