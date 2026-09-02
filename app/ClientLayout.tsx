"use client";
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ProposalSubmissionModal } from '@/components/ui/ProposalSubmissionModal';
import { useAuth } from '@/context/AuthContext'; // as requested
import { RealtimeSyncProvider } from '@/providers/RealtimeSyncProvider';

import { ProjectProvider } from '@/providers/ProjectProvider';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useAuth(); // AuthContext is available for any layout-level logic
  
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleCitizenLoginNavigate = (parcel: any) => {
    router.push('/citizen-portal');
    showToast(`Logged in as Landowner: ${parcel?.ownerName || 'Verified Citizen'}`);
  };

  return (
    <ProjectProvider>
      <RealtimeSyncProvider>
        <div className="h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 flex flex-col font-sans overflow-hidden">
          {/* Header is fixed on top via flex layout */}
          <Header onCitizenLoginNavigate={handleCitizenLoginNavigate} />
        
        {/* Main Body Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar fixed on the left */}
          <Sidebar />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950 relative">
            {pathname === '/gis-map' || pathname === '/valuation' ? (
              children
            ) : (
              <div className="p-6 max-w-[1600px] mx-auto space-y-6">
                {children}
              </div>
            )}
          </main>
        </div>
        
        <ProposalSubmissionModal 
          isOpen={isProposalModalOpen} 
          onClose={() => setIsProposalModalOpen(false)} 
          onProjectCreated={() => {}} 
        />

        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-gov-navy text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-slate-700 text-sm font-medium animate-in fade-in slide-in-from-bottom-4">
            <div className="w-2.5 h-2.5 rounded-full bg-status-green"></div>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
      </RealtimeSyncProvider>
    </ProjectProvider>
  );
}
