import React from 'react';
import Link from 'next/link';
import { MapPin, Layers, AlertCircle, ArrowRight } from 'lucide-react';
import { GovCard } from '@/components/ui/GovCard';
import { RFCTLARR_STAGES } from '@/lib/types/schema';
import { useRealtimeParcels } from '@/hooks/useRealtimeParcels';

export const ProjectCard = ({ proj }: { proj: any }) => {
  const { parcels, loading } = useRealtimeParcels(proj.id);
  
  // Aggregate Metrics
  let totalArea = 0;
  let khasraCount = 0;
  let totalCompensation = 0;

  if (parcels && parcels.length > 0) {
    khasraCount = parcels.length;
    parcels.forEach((p) => {
      totalArea += Number(p.areaHectares) || 0;
      totalCompensation += Number(p.totalCompensationLakhs) || 0;
    });
  }

  const getCategoryTheme = (type: string) => {
    const normalized = (type || 'HIGHWAYS').toUpperCase();
    if (normalized.includes('RAIL')) {
      return { label: 'Railways', classes: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30' };
    }
    if (normalized.includes('INDUSTRIAL') || normalized.includes('NODE')) {
      return { label: 'Industrial Node', classes: 'bg-amber-500/10 text-amber-600 border-amber-500/30' };
    }
    if (normalized.includes('POWER') || normalized.includes('GRID')) {
      return { label: 'Power Grid', classes: 'bg-purple-500/10 text-purple-600 border-purple-500/30' };
    }
    return { label: 'Highways', classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' };
  };

  const categoryTheme = getCategoryTheme(proj.projectType || proj.category || proj.corridorType);

  const stageNum = proj.currentStage || 1;
  const stagePct = Math.round((stageNum / 7) * 100);
  
  let stageBg = 'bg-amber-500';
  let stageText = 'text-amber-600';
  if (stageNum >= 3 && stageNum <= 6) {
    stageBg = 'bg-gov-blue';
    stageText = 'text-gov-blue';
  }
  if (stageNum === 7) {
    stageBg = 'bg-emerald-500';
    stageText = 'text-emerald-600';
  }

  return (
    <GovCard className={`flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden ${proj.risk ? 'border-status-red/50 shadow-[0_0_10px_rgba(220,38,38,0.1)]' : ''}`}>
      {/* Risk Indicator Ribbon */}
      {proj.risk && (
        <div className="absolute top-0 right-0 bg-status-red text-white text-[9px] font-bold px-2 py-1 uppercase tracking-widest flex items-center gap-1 rounded-bl-lg z-10 shadow-sm animate-pulse">
          <AlertCircle className="w-3 h-3" /> Lapse Risk
        </div>
      )}

      <div className="mb-4 pt-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-500/10 border border-slate-500/20 px-1.5 py-0.5 rounded">
            {proj.id}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${categoryTheme.classes}`}>
            {categoryTheme.label}
          </span>
        </div>
        <h3 className="text-sm font-bold text-gov-primary leading-tight line-clamp-2 min-h-[40px]">{proj.name}</h3>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{proj.districts?.join(', ') || 'Various'}, {proj.state || 'India'}</span>
        </div>
        <div className="flex flex-col gap-1.5 mt-2">
          {loading ? (
            <div className="animate-pulse flex flex-col gap-2 pl-5 pt-1">
              <div className="h-3 bg-slate-200 rounded w-24"></div>
              <div className="h-3 bg-slate-200 rounded w-32"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Layers className="w-3.5 h-3.5 text-ashoka-gold" />
                <span>
                  <strong className="text-slate-800">{totalArea > 0 ? totalArea.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' Hectares' : 'Pending Survey'}</strong>
                  {khasraCount > 0 && (
                    <>
                      <span className="text-slate-400 mx-1">•</span>
                      {khasraCount} Khasras
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-3.5 h-3.5 text-emerald-600 font-bold flex items-center justify-center">₹</span>
                <span>
                  Escrow: <strong className="text-slate-800">{totalCompensation > 0 ? `₹${(totalCompensation / 100).toFixed(2)} Cr` : 'Pending Valuation'}</strong>
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Stage {stageNum} of 7 · {RFCTLARR_STAGES[stageNum]?.section}
            </span>
            <span className={`text-[10px] font-bold ${stageText}`}>
              {stagePct}%
            </span>
          </div>
          <div className="text-[11px] text-slate-700 font-medium mb-2 truncate">
            {RFCTLARR_STAGES[stageNum]?.title}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${stageBg}`}
              style={{ width: `${stagePct}%` }}
            ></div>
          </div>
        </div>

        <Link 
          href={`/projects/${proj.id}`}
          className="w-full flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-gov-primary hover:text-white text-gov-primary border border-slate-200 rounded text-xs font-bold transition-all hover-lift active:scale-[0.98] group"
        >
          Open Statutory Workspace <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </GovCard>
  );
};
