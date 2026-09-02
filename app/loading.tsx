import React from 'react';

export default function Loading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
      {/* Branded Loading Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-gov-blue border-t-transparent animate-spin"></div>
        {/* Subtle inner pulse */}
        <div className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-ashoka-gold animate-pulse"></div>
      </div>
      
      {/* Loading Text */}
      <div className="flex flex-col items-center">
        <h3 className="text-gov-navy font-bold text-lg m-0">BhoomiSetu | OSLAOP</h3>
        <p className="text-sm text-slate-500 mt-1 font-medium animate-pulse">
          Fetching GatiShakti Spatial & Valuation Records...
        </p>
      </div>
    </div>
  );
}
