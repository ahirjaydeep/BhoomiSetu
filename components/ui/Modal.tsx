"use client";
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
}

export const Modal = ({ isOpen, onClose, title, children, footer, maxWidthClass = "max-w-2xl" }: ModalProps) => {
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Panel */}
      <div 
        className={`relative bg-white rounded-xl shadow-2xl w-full ${maxWidthClass} max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl shrink-0">
          <h2 id="modal-title" className="text-lg font-bold text-gov-navy m-0">
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-status-red hover:bg-red-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-status-red"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl shrink-0 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
