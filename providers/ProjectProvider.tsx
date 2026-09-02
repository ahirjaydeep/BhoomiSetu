"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Project } from '@/lib/types/schema';

interface ProjectContextProps {
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  availableProjects: Project[];
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextProps | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [activeProjectId, setActiveProjectId] = useState<string>("NH-44-DELHI-AMRITSAR");
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all projects without orderBy to avoid index issues
    const q = query(collection(db, 'projects'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projects: Project[] = [];
      snapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() } as Project);
      });
      setAvailableProjects(projects);
      setLoading(false);
      
      // Keep "NH-44-DELHI-AMRITSAR" if available, else pick the first one if not set
      if (projects.length > 0) {
        if (!activeProjectId || !projects.find(p => p.id === activeProjectId)) {
          // If the currently active project doesn't exist, fallback to first
          // UNLESS the current one is just NH-44-DELHI-AMRITSAR waiting to be loaded
          const nh44 = projects.find(p => p.id === "NH-44-DELHI-AMRITSAR");
          if (nh44) {
            setActiveProjectId(nh44.id);
          } else {
            setActiveProjectId(projects[0].id);
          }
        }
      }
    }, (error) => {
      console.error("Failed to fetch projects for provider", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeProjectId]);

  return (
    <ProjectContext.Provider value={{ activeProjectId, setActiveProjectId, availableProjects, loading }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
