"use client";
import React, { useState, useMemo } from 'react';
import { Search, Map, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { useRealtimeParcels } from '@/hooks/useRealtimeParcels';
import { useProject } from '@/providers/ProjectProvider';

export const VillageBreakupTable = () => {
  const { activeProjectId } = useProject();
  const { parcels, loading } = useRealtimeParcels(activeProjectId);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const villageData = useMemo(() => {
    if (!parcels) return [];
    
    // Grouping by village
    const grouped: Record<string, any> = {};
    
    parcels.forEach(p => {
      const v = p.village || 'Unknown Village';
      if (!grouped[v]) {
        grouped[v] = {
          village: v,
          totalArea: 0,
          circleRate: (p as any).base_circle_rate, // Will keep the first one found, or we could average
          landowners: new Set(),
          disputes: 0,
          khasras: []
        };
      }
      
      const area = Number(p.areaHectares);
      if (!isNaN(area)) grouped[v].totalArea += area;
      
      if ((p as any).base_circle_rate && !grouped[v].circleRate) {
        grouped[v].circleRate = (p as any).base_circle_rate;
      }

      if (p.ownerName) grouped[v].landowners.add(p.ownerName);
      if ((p as any).courtStay || (p as any).disputeReason || p.possessionStatus?.toLowerCase().includes('dispute')) {
        grouped[v].disputes += 1;
      }
      if (p.khasraNo) grouped[v].khasras.push(p.khasraNo);
    });

    let rows = Object.values(grouped).map(g => ({
      ...g,
      landownerCount: g.landowners.size
    }));

    // Filter rows based on search
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(r => 
        r.village.toLowerCase().includes(s) || 
        r.khasras.some((k: string) => k.toLowerCase().includes(s))
      );
    }

    // Sort safely
    if (sortConfig) {
      rows.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        // Strict null-checks for sorting
        if (valA === null || valA === undefined || isNaN(valA as number)) valA = -999999999;
        if (valB === null || valB === undefined || isNaN(valB as number)) valB = -999999999;

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return rows;
  }, [parcels, search, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatCurrency = (val: any) => {
    if (val === null || val === undefined || isNaN(Number(val))) return null;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) {
    return <div className="p-4 flex justify-center text-slate-500 text-sm animate-pulse">Loading Cadastral Village Data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <input 
            type="text" 
            placeholder="Search by Village Name, Survey Number, or Khasra Ref..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-gov-navy outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>
      
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('village')}>
                <div className="flex items-center gap-1">Village <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('circleRate')}>
                <div className="flex items-center gap-1">Circle Rate <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('totalArea')}>
                <div className="flex items-center gap-1">Total Area (Ha) <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('landownerCount')}>
                <div className="flex items-center gap-1">Khatedar Count <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('disputes')}>
                <div className="flex items-center gap-1">Disputes <ArrowUpDown className="w-3 h-3" /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {villageData.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-slate-500">No villages match the criteria.</td>
              </tr>
            ) : (
              villageData.map((row) => (
                <tr key={row.village} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.village}</td>
                  <td className="px-4 py-3 font-mono">
                    {row.circleRate ? (
                      <span className="text-slate-700">{formatCurrency(row.circleRate)} / Ha</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase">Circle Rate Unset</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-mono">
                    {row.totalArea > 0 ? (
                      `${row.totalArea.toFixed(2)} Ha`
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 uppercase">Pending Survey</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <div className="flex items-center gap-1.5">
                      {row.landownerCount}
                      <span className="text-[10px] text-slate-400 font-normal">Owners</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {row.disputes > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> {row.disputes} Active
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
