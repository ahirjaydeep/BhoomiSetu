import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Project } from "@/lib/types/schema";

export const useRealtimeProjectsList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all projects without orderBy to avoid index issues.
    // If you add an index later, you can restore `orderBy('updatedAt', 'desc')`.
    const q = query(collection(db, "projects"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Project)
        );
        setProjects(fetched);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching projects list:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { projects, loading, error };
};
