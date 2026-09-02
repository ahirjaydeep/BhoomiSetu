"use client";
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface StageAdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentStage: number;
}

export const StageAdvanceModal = ({ isOpen, onClose, projectId, currentStage }: StageAdvanceModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const nextStage = currentStage + 1;

  const handleAdvance = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/v1/workflow/advance-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          newStage: nextStage
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to advance stage');
      
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Advance Statutory Stage">
      <div className="space-y-4">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-sm text-slate-700">
            You are about to advance Project <strong className="font-mono">{projectId}</strong> from <strong>Stage {currentStage}</strong> to <strong>Stage {nextStage}</strong>.
          </p>
          <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="m-0">
              This action will trigger an atomic batch update, cascading the target possession status across all associated land parcels and writing an immutable audit log.
            </p>
          </div>
        </div>
        
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            onClick={handleAdvance}
            disabled={isSubmitting || nextStage > 5}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gov-navy hover:bg-gov-navy/90 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Processing...' : 'Advance Stage'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
