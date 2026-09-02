import React from 'react';
import { AlertCircle, Clock, ChevronRight } from 'lucide-react';

interface StatutoryAlertBannerProps {
  title: string;
  message: string;
  daysRemaining?: number;
  onActionClick?: () => void;
  actionLabel?: string;
}

export const StatutoryAlertBanner = ({ 
  title, 
  message, 
  daysRemaining, 
  onActionClick, 
  actionLabel = "Review Project" 
}: StatutoryAlertBannerProps) => {
  
  const isCritical = daysRemaining !== undefined && daysRemaining <= 7;
  const bgColor = isCritical ? 'bg-status-red' : 'bg-status-amber';
  const textColor = 'text-white';

  return (
    <div className={`w-full ${bgColor} ${textColor} shadow-md overflow-hidden flex items-center justify-between p-3 px-5 rounded-md`}>
      <div className="flex items-center gap-4">
        <div className="p-1.5 bg-white/20 rounded-full shrink-0">
          <AlertCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight">{title}</span>
          <span className="text-xs text-white/90">{message}</span>
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        {daysRemaining !== undefined && (
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-bold font-mono">{daysRemaining} Days Left</span>
          </div>
        )}
        {onActionClick && (
          <button 
            onClick={onActionClick}
            className="flex items-center gap-1 bg-white text-gov-navy px-4 py-1.5 rounded text-xs font-bold shadow-sm hover:bg-slate-100 transition-colors"
          >
            {actionLabel}
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
