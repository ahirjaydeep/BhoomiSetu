"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface RealtimeSyncContextProps {
  isOnline: boolean;
  activeListenersCount: number;
  lastSyncedAt: string | null;
  registerListener: () => void;
  unregisterListener: () => void;
  updateSyncTime: () => void;
}

const RealtimeSyncContext = createContext<RealtimeSyncContextProps | undefined>(undefined);

export function RealtimeSyncProvider({ children }: { children: ReactNode }) {
  const { isOnline } = useNetworkStatus();
  const [activeListenersCount, setActiveListenersCount] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const registerListener = () => setActiveListenersCount(prev => prev + 1);
  const unregisterListener = () => setActiveListenersCount(prev => Math.max(0, prev - 1));
  const updateSyncTime = () => setLastSyncedAt(new Date().toISOString());

  return (
    <RealtimeSyncContext.Provider value={{
      isOnline,
      activeListenersCount,
      lastSyncedAt,
      registerListener,
      unregisterListener,
      updateSyncTime
    }}>
      {children}
      
    </RealtimeSyncContext.Provider>
  );
}

export function useRealtimeSync() {
  const context = useContext(RealtimeSyncContext);
  if (context === undefined) {
    throw new Error("useRealtimeSync must be used within a RealtimeSyncProvider");
  }
  return context;
}
