"use client";
import React from 'react';
import { GovCard } from '@/components/ui/GovCard';
import { Clock, ShieldAlert, CheckCircle2, ShieldCheck, Timer } from 'lucide-react';

interface StatutoryCountdownCardProps {
  sec11Date: string | Date;
  sec19Date: string | Date | null;
  currentStage: number;
}

export const StatutoryCountdownCard = ({ sec11Date, sec19Date, currentStage }: StatutoryCountdownCardProps) => {
  const s11Date = new Date(sec11Date);
  const now = new Date();
  
  // SEC 15: 60 Days Window
  const sec15Deadline = new Date(s11Date);
  sec15Deadline.setDate(sec15Deadline.getDate() + 60);
  
  const sec15TotalMs = sec15Deadline.getTime() - s11Date.getTime();
  const sec15ElapsedMs = now.getTime() - s11Date.getTime();
  const sec15RemainingMs = sec15Deadline.getTime() - now.getTime();
  
  let sec15RemainingDays = Math.ceil(sec15RemainingMs / (1000 * 60 * 60 * 24));
  let sec15Progress = (sec15ElapsedMs / sec15TotalMs) * 100;
  
  if (sec15RemainingDays < 0) sec15RemainingDays = 0;
  if (sec15Progress > 100) sec15Progress = 100;

  // SEC 19(7): 365 Days Window
  const sec19Deadline = new Date(s11Date);
  sec19Deadline.setDate(sec19Deadline.getDate() + 365);
  
  const sec19RemainingMs = sec19Deadline.getTime() - now.getTime();
  let sec19RemainingDays = Math.ceil(sec19RemainingMs / (1000 * 60 * 60 * 24));
  
  const sec19ElapsedMs = now.getTime() - s11Date.getTime();
  let sec19ElapsedDays = Math.floor(sec19ElapsedMs / (1000 * 60 * 60 * 24));
  if (sec19ElapsedDays < 0) sec19ElapsedDays = 0;
  
  if (sec19RemainingDays < 0) sec19RemainingDays = 0;

  // Colors for Sec 19 Expiration
  let s19ColorClass = 'bg-gov-blue';
  let s19TextClass = 'text-gov-blue';
  let s19BorderClass = 'border-gov-blue bg-slate-50/50';
  
  if (sec19RemainingDays <= 30) {
    s19ColorClass = 'bg-status-red';
    s19TextClass = 'text-status-red';
    s19BorderClass = 'border-status-red bg-red-50/30';
  } else if (sec19RemainingDays <= 60) {
    s19ColorClass = 'bg-status-amber';
    s19TextClass = 'text-status-amber';
    s19BorderClass = 'border-status-amber bg-amber-50/30';
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* CARD A: Sec 15 Hearing Window */}
      <GovCard className="h-full border-l-4 border-l-gov-blue">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-gov-blue mb-3">
            <Timer className="w-5 h-5" />
            <h3 className="font-bold text-sm m-0">Sec 15 Hearing Window</h3>
          </div>
          {sec15RemainingDays === 0 ? (
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">Closed</span>
          ) : (
            <span className="text-[10px] font-bold bg-blue-50 text-gov-blue px-2 py-0.5 rounded uppercase animate-pulse">Open</span>
          )}
        </div>

        <div className="mt-1 flex items-end justify-between">
          <div>
            <div className="text-2xl font-black text-slate-900 leading-none">
              {sec15RemainingDays}
            </div>
            <div className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
              Days Remaining
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-medium text-right">
            Deadline:<br/>
            <strong className="text-slate-600">{sec15Deadline.toLocaleDateString()}</strong>
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${sec15RemainingDays === 0 ? 'bg-slate-400' : 'bg-gov-blue'}`}
              style={{ width: `${sec15Progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1.5 text-[9px] font-bold text-slate-400">
            <span>0 Days</span>
            <span>60 Days</span>
          </div>
        </div>
      </GovCard>

    {/* CARD B: Sec 19 Legal Expiration Clock */}
      <GovCard className={`h-full border-l-4 ${sec19Date ? 'border-l-status-green' : s19BorderClass}`}>
        <div className="flex items-start justify-between">
          <div className={`flex items-center gap-2 mb-3 ${sec19Date ? 'text-status-green' : s19TextClass}`}>
            {sec19Date ? (
              <ShieldCheck className="w-5 h-5" />
            ) : sec19RemainingDays <= 30 ? (
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
            <h3 className="font-bold text-sm m-0">Sec 19(7) Statutory Clock</h3>
          </div>
        </div>

        {sec19Date ? (
          <div className="flex flex-col items-center justify-center text-center py-2 h-[80px]">
            <CheckCircle2 className="w-8 h-8 text-status-green mb-2" />
            <div className="text-xs font-bold text-status-green">
              Section 19 Notification Issued on {new Date(sec19Date).toLocaleDateString()}
            </div>
            <div className="text-[10px] font-semibold text-emerald-700 mt-1 uppercase tracking-widest">
              Risk Neutralized
            </div>
          </div>
        ) : (
          <>
            <div className="mt-1 flex items-end justify-between">
              <div>
                <div className={`text-2xl font-black leading-none ${s19TextClass}`}>
                  {sec19RemainingDays}
                </div>
                <div className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                  Days to Expiration
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-medium text-right">
                <span className="text-slate-500 font-bold">{sec19ElapsedDays} days elapsed</span> since Sec 11<br/>
                Lapse Date: <strong className="text-slate-600">{sec19Deadline.toLocaleDateString()}</strong>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${s19ColorClass} ${sec19RemainingDays <= 30 ? 'animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]' : ''}`}
                  style={{ width: `${Math.min(((365 - sec19RemainingDays) / 365) * 100, 100)}%` }}
                ></div>
              </div>
              <p className={`text-[10px] font-medium mt-2 leading-tight ${sec19RemainingDays <= 30 ? 'text-status-red font-bold' : 'text-slate-500'}`}>
                {sec19RemainingDays <= 30 
                  ? "CRITICAL ALERT: Acquisition will legally lapse if Sec 19 is not published immediately." 
                  : "If Sec 19 is not published within 12 months of Sec 11, the acquisition process automatically lapses."}
              </p>
            </div>
          </>
        )}
      </GovCard>
    </div>
  );
};
