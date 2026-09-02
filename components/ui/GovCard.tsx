import React from 'react';

interface GovCardProps {
  title?: string;
  subtitle?: string;
  actionButtons?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerSubBar?: React.ReactNode;
  accentBar?: boolean; // New prop to optionally disable the accent bar
}

export const GovCard = ({ title, subtitle, actionButtons, children, className = '', headerSubBar, accentBar = true }: GovCardProps) => {
  return (
    <div className={`glass-panel rounded-lg overflow-hidden transition-all duration-200 ease-in-out hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md relative ${className}`}>
      
      {accentBar && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-600 to-amber-500" />
      )}

      {(title || actionButtons) && (
        <div className={`px-5 py-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 ${accentBar ? 'pt-5' : ''}`}>
          <div>
            {title && <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100 m-0">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 font-normal m-0 mt-0.5">{subtitle}</p>}
          </div>
          {actionButtons && <div className="flex items-center gap-2">{actionButtons}</div>}
        </div>
      )}
      
      {headerSubBar && (
        <div className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200/50 dark:border-slate-800/50 px-5 py-2 text-xs">
          {headerSubBar}
        </div>
      )}
      
      {/* If the consumer component passes its own padding, we might not want to force it, but retaining default p-5 for backward compatibility unless consumer overrides it */}
      <div className={className.includes('p-') ? '' : 'p-5'}>
        {children}
      </div>
    </div>
  );
};
