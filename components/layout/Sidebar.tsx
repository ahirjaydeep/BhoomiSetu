"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRealtimeSync } from '@/providers/RealtimeSyncProvider';
import {
  LayoutDashboard,
  FolderGit2,
  Map,
  Calculator,
  FileCheck2,
  MessageSquareWarning,
  User,
  ChevronRight,
  ChevronLeft,
  Menu,
  Database
} from 'lucide-react';

export const Sidebar = () => {
  const { currentUser } = useAuth();
  const { isOnline, activeListenersCount } = useRealtimeSync();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const role = currentUser?.role || '';
  const isCitizen = role === 'CITIZEN_LANDOWNER';

  // Define navigation items with their visibility logic and badges
  const navItems = [
    {
      id: 'dashboard',
      label: 'Macro Dashboard',
      subtitle: 'Analytics & KPIs',
      icon: LayoutDashboard,
      href: '/',
      visible: true, // Visible to all
    },
    {
      id: 'projects',
      label: 'Project Corridors',
      subtitle: 'RFCTLARR Lifecycle',
      icon: FolderGit2,
      href: '/projects',
      visible: !isCitizen, // Usually officers see this
      badge: '14 Active',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
    },
    {
      id: 'gis-map',
      label: 'Cadastral GIS Map',
      subtitle: 'Corridors & Khasra',
      icon: Map,
      href: '/gis-map',
      visible: !isCitizen,
      badge: 'Live GeoJSON',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
    },
    {
      id: 'valuation',
      label: 'Valuation & Award',
      subtitle: 'Compensation Engine',
      icon: Calculator,
      href: '/valuation',
      visible: ['SLAO_DISTRICT', 'STATE_REVENUE'].includes(role)
    },
    {
      id: 'grievances',
      label: 'Objections & Hearings',
      subtitle: 'Sec 15 Public Desk',
      icon: MessageSquareWarning,
      href: '/objections',
      visible: !isCitizen,
      badge: '3 Pending',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
    },
    {
      id: 'documents',
      label: 'Cryptographic Vault',
      subtitle: 'Verified Certificates',
      icon: FileCheck2,
      href: '/gazette-vault',
      visible: ['CENTRAL_ADMIN', 'SLAO_DISTRICT'].includes(role)
    },
    {
      id: 'citizen-portal',
      label: 'Citizen DBT Portal',
      subtitle: 'Passbook & Status',
      icon: User,
      href: '/citizen-portal',
      visible: true // Visible to all so officers can demo it, or specifically to citizens
    }
  ];

  // Filter based on visibility
  const filteredNav = navItems.filter(item => item.visible);

  return (
    <aside 
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } flex flex-col h-screen bg-slate-950 border-r border-slate-800 text-slate-200 shrink-0 shadow-inner transition-all duration-300 ease-in-out relative z-10`}
    >
      {/* Active Designation Info Card */}
      {!collapsed && (
        <div className="p-3.5 border-b border-slate-800 bg-slate-900/50 shrink-0">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
            Active Jurisdiction
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-status-green"></div>
            <span className="text-xs font-bold text-white truncate">
              {currentUser?.jurisdiction || 'National Apex (DoLR)'}
            </span>
          </div>
          <div className="text-[11px] text-ashoka-gold font-medium mt-0.5 truncate">
            {currentUser?.roleTitle || 'Citizen / Stakeholder'}
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className={`flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar ${collapsed ? 'mt-4' : ''}`}>
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const isCitizenHighlight = item.id === 'citizen-portal' && isCitizen;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-md text-left transition-colors cursor-pointer border-l-4 ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold border-emerald-500'
                  : isCitizenHighlight
                  ? 'bg-amber-900/40 text-amber-200 border-amber-600 hover:bg-amber-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors'
              } ${collapsed ? 'justify-center px-0 py-3' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} min-w-0 w-full`}>
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-ashoka-gold' : 'text-slate-400 group-hover:text-slate-300'}`} />
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate leading-snug">{item.label}</div>
                    <div className={`text-[10px] truncate ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>
                      {item.subtitle}
                    </div>
                  </div>
                )}
              </div>

              {/* Badges / Indicators */}
              {!collapsed && (
                <div className="flex items-center gap-2 shrink-0">
                  {item.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && !item.badge && <ChevronRight className="w-4 h-4 text-white opacity-50" />}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="p-3 border-t border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center justify-center w-full shrink-0"
        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        {!collapsed && <span className="text-xs font-medium ml-2 mr-auto">Collapse Sidebar</span>}
      </button>

      {/* System Status Footer & Popover */}
      <div className={`group relative py-3 bg-slate-900/50 border-t border-slate-800/80 flex items-center shrink-0 ${collapsed ? 'justify-center px-0' : 'px-4 justify-between'} text-xs text-slate-400 cursor-help`}>
        
        {/* Hover Popover Card */}
        {!collapsed && (
          <div className="absolute bottom-full left-2 mb-2 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden transform group-hover:-translate-y-1 translate-y-0">
            <div className="px-4 py-3 border-b border-slate-700 bg-slate-900/80 flex items-center gap-2">
               <FileCheck2 className="w-4 h-4 text-emerald-400" />
               <h4 className="font-bold text-slate-200 text-xs tracking-wide">RFCTLARR Act Statutory Audit Status</h4>
            </div>
            <div className="p-4 space-y-4">
               {/* Section 1 */}
               <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                     <Calculator className="w-3.5 h-3.5 text-ashoka-gold" /> 1st Schedule Compliance
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed m-0">
                     Market Value, 100% Solatium & Section 34 Interest calculation rules verified.
                  </p>
               </div>
               
               {/* Section 2 */}
               <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                     <User className="w-3.5 h-3.5 text-blue-400" /> 2nd Schedule Compliance
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed m-0">
                     Rehabilitation & Resettlement (R&R) entitlement checks active.
                  </p>
               </div>
               
               {/* Section 3 */}
               <div className="pt-3 border-t border-slate-700/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                     <Database className="w-3.5 h-3.5 text-emerald-400" /> Real-time Database Socket
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/50 px-2.5 py-1.5 rounded border border-slate-700">
                     <span className="text-[10px] text-slate-400 font-mono">Node: wss-ap-south-1</span>
                     <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                       12ms
                     </span>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Footer Bar Trigger */}
        <div className="flex items-center gap-2" title={isOnline ? "Live Synced" : "Reconnecting"}>
          <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0 ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
          {!collapsed && (
            <span className="font-medium text-slate-300">
              {isOnline ? `Live Synced (${activeListenersCount})` : 'Reconnecting...'}
            </span>
          )}
        </div>
        {!collapsed && (
          <span className="text-[9px] uppercase tracking-wider font-bold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">
            RFCTLARR Compliant
          </span>
        )}
      </div>
    </aside>
  );
};
