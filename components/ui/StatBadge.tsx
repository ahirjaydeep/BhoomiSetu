import React from 'react';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'error';

interface StatBadgeProps {
  variant: Variant;
  label: string;
  showPulse?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  danger: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
  error: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
  info: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
  neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
};

const pulseColors: Record<Variant, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  error: 'bg-rose-500',
  info: 'bg-indigo-500',
  neutral: 'bg-slate-500'
};

export const StatBadge = ({ variant = 'neutral', label, showPulse = false, className = '', icon }: StatBadgeProps) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${variantStyles[variant]} ${className}`}>
      {showPulse && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseColors[variant]}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${pulseColors[variant]}`}></span>
        </span>
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </span>
  );
};
