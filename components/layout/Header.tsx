"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRealtimeProject } from '@/hooks/useRealtimeProject';
import { useRealtimeObjections } from '@/hooks/useRealtimeObjections';
import { useRouter } from 'next/navigation';
import defaultParcels from '@/lib/data/parcels.json';
import defaultGrievances from '@/lib/data/grievances.json';
import {
  Building2,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  Globe,
  Lock,
  Search,
  KeyRound,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  Layers,
  Sparkles,
  HelpCircle,
  LogOut,
  MapPin,
  FileText
} from 'lucide-react';

import { useProject } from '@/providers/ProjectProvider';
import { ProjectSelector } from '@/components/navigation/ProjectSelector';

export const Header = ({ onCitizenLoginNavigate }) => {
  const { users, currentUser, switchUser, loginAsCitizen, activeCitizenParcel, setActiveCitizenParcel } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authTab, setAuthTab] = useState(currentUser?.role === 'CITIZEN_LANDOWNER' ? 'citizen' : 'officer');
  const [language, setLanguage] = useState('EN');

  const { activeProjectId } = useProject();
  const { project } = useRealtimeProject(activeProjectId);
  const { objections } = useRealtimeObjections(activeProjectId);
  const router = useRouter();

  // Citizen Login Search & OTP States
  const [searchKhasra, setSearchKhasra] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [dropdownOpen]);

  // Synchronize auth tab when user role changes
  useEffect(() => {
    if (currentUser?.role === 'CITIZEN_LANDOWNER') {
      setAuthTab('citizen');
    } else {
      setAuthTab('officer');
    }
  }, [currentUser]);

  // Sync Health State
  const [syncHealth, setSyncHealth] = useState(100);
  const [syncChecking, setSyncChecking] = useState(false);
  
  // Real-time tick & network status
  const [tick, setTick] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const interval = setInterval(() => setTick(t => t + 1), 10000); // Check every 10s
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const getRelativeTime = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Waiting for sync...';
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 10) return 'Just Now';
    if (diffInSeconds < 60) return `${diffInSeconds} secs ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch('/api/v1/admin/sync-health');
        if (res.ok) {
          const data = await res.json();
          setSyncHealth(data.healthScore);
        }
      } catch (err) {
        console.error('Failed to fetch sync health', err);
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const handleResync = async () => {
    setSyncChecking(true);
    try {
      const res = await fetch('/api/v1/admin/sync-health', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSyncHealth(data.healthScore);
      }
    } catch (err) {
      console.error(err);
    }
    setSyncChecking(false);
  };

  const filteredCitizenParcels = defaultParcels.filter(p =>
    p.khasraNo.toLowerCase().includes(searchKhasra.toLowerCase()) ||
    p.ownerName.toLowerCase().includes(searchKhasra.toLowerCase()) ||
    p.village.toLowerCase().includes(searchKhasra.toLowerCase()) ||
    p.id.toLowerCase().includes(searchKhasra.toLowerCase())
  );

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number or Aadhaar.');
      return;
    }
    setOtpError('');
    setOtpSent(true);
    // Pre-fill simulated OTP for effortless testing
    setEnteredOtp('8421');
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (enteredOtp !== '8421') {
      setOtpError('Invalid OTP. Please enter 8421 for verification.');
      return;
    }

    // Find parcel matching or fallback to Sardar Gurdeep Singh / Ramesh Kumar
    const matched = defaultParcels.find(p => p.contact?.includes(mobileNumber.slice(-4))) || defaultParcels[0];
    const citizenUser = loginAsCitizen({
      name: matched.ownerName,
      phone: mobileNumber,
      khasraNo: matched.khasraNo,
      jurisdiction: `Khasra ${matched.khasraNo}, ${matched.village} (${matched.district})`
    }, matched);

    setOtpSuccess(true);
    setTimeout(() => {
      setOtpSuccess(false);
      setOtpSent(false);
      setDropdownOpen(false);
      if (onCitizenLoginNavigate) onCitizenLoginNavigate(matched);
    }, 600);
  };

  const handleSelectLandownerPreset = (parcel) => {
    loginAsCitizen({
      name: parcel.ownerName,
      phone: parcel.contact,
      khasraNo: parcel.khasraNo,
      jurisdiction: `Khasra ${parcel.khasraNo}, ${parcel.village} (${parcel.district})`
    }, parcel);

    setDropdownOpen(false);
    if (onCitizenLoginNavigate) onCitizenLoginNavigate(parcel);
  };

  const isCitizen = currentUser?.role === 'CITIZEN_LANDOWNER';

  return (
    <header className="sticky top-0 shrink-0 z-50 h-16 w-full bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center shadow-sm">
      <div className="w-full mx-auto flex items-center justify-between gap-4 lg:gap-8">
        
        {/* Left: Emblem & Branding */}
        <div className="flex items-center shrink-0">
          <div className="flex items-center justify-center shrink-0 mr-2 sm:mr-3">
            <svg viewBox="0 0 100 100" className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-current">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" />
              <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
              <path d="M50,8 L50,92 M8,50 L92,50 M20,20 L80,80 M20,80 L80,20 M29,12 L71,88 M12,29 L88,71 M12,71 L88,29 M29,88 L71,12" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div className="flex items-center">
            <span className="text-sm sm:text-base font-bold text-white tracking-tight font-serif">BhoomiSetu</span>
            <div className="border-r border-slate-700 h-4 mx-2 sm:mx-3 hidden sm:block"></div>
            <span className="text-xs font-medium text-slate-400 hidden xl:inline-block truncate">OSLAOP</span>
            <div className="border-r border-slate-700 h-4 mx-3 hidden xl:block"></div>
            <div className="hidden sm:block">
              <ProjectSelector />
            </div>
          </div>
        </div>

        {/* Center: Live Status Ticker & Sync Health */}
        <div className="hidden lg:flex items-center justify-center gap-3 xl:gap-4 flex-1">
          <div className="bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-full text-xs text-slate-300 flex items-center shrink-0 truncate max-w-[200px] xl:max-w-[300px]">
            {/* Visual Network Health Indicator */}
            <span className="relative flex h-2 w-2 shrink-0 mr-2" title={isOnline ? 'Live Synced' : 'Reconnecting...'}>
              {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>

            {project ? (
              <span className="truncate">Updated: <span className="text-white font-medium">{getRelativeTime(project.updatedAt)}</span></span>
            ) : (
              <span className="truncate">Connecting to stream...</span>
            )}
          </div>

          {/* Sync Health Indicator */}
          {currentUser?.role === 'CENTRAL_ADMIN' && (
            <button
              onClick={syncHealth < 100 ? handleResync : undefined}
              disabled={syncChecking}
              className={`hidden xl:flex items-center gap-2 border rounded-full px-3 py-1.5 shadow-inner transition-all shrink-0 ${
                syncHealth === 100
                  ? 'bg-emerald-900/40 border-emerald-500/50 cursor-default'
                  : 'bg-amber-900/40 border-amber-500/50 cursor-pointer hover:bg-amber-800/60'
              }`}
              title={syncHealth === 100 ? "Pipeline Fully Synchronized" : "State Drift Detected — Click to Resync"}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                {syncHealth < 100 && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${syncHealth === 100 ? 'bg-status-green' : 'bg-status-amber'}`}></span>
              </span>
              <span className={`text-[10px] font-bold truncate ${syncHealth === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {syncChecking ? 'Resyncing...' : `Sync: ${syncHealth}%`}
              </span>
            </button>
          )}
        </div>

        {/* Right Controls: Bilingual Switcher, Quick Check, Persona Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
          
          {/* Bilingual Segmented Switcher */}
          <div className="hidden md:flex items-center bg-slate-800/80 p-0.5 rounded-full border border-slate-700/60 shrink-0 shadow-inner">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLanguage('EN');
              }}
              className={`flex items-center justify-center px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                language === 'EN'
                  ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              EN
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLanguage('HI');
              }}
              className={`flex items-center justify-center px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                language === 'HI'
                  ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Reactive Land Dispute Ticker Badge */}
          <button
            onClick={() => router.push('/objections')}
            className={`hidden sm:flex items-center gap-2 border px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-colors cursor-pointer shrink-0 ${
              objections?.length > 0
                ? 'bg-amber-900/40 border-amber-500/50 hover:bg-amber-800/60 text-amber-100'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60'
            }`}
          >
            {objections?.length > 0 ? (
              <>
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="hidden lg:inline">{objections.length} Land Dispute{objections.length === 1 ? '' : 's'} Active</span>
                <span className="lg:hidden text-amber-400">{objections.length} Active</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="hidden lg:inline">No Active Disputes</span>
              </>
            )}
          </button>

          {/* Persona Switcher & User Profile Dropdown */}
          <div className="relative flex items-center h-full shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-2 sm:px-3 py-1.5 rounded-full border text-left transition-all cursor-pointer shadow-sm bg-slate-800 hover:bg-slate-700/80 text-slate-200 border-slate-700"
            >
              <div
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isCitizen ? 'bg-amber-900 text-amber-200' : 'bg-slate-600 text-white'
                }`}
              >
                {isCitizen ? '🌾' : currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block">
                <div className="flex flex-col items-start">
                  <span className="text-xs font-semibold truncate max-w-[80px] lg:max-w-[120px]">
                    {currentUser?.name || 'Authorized User'}
                  </span>
                  {currentUser?.roleTitle && !isCitizen && (
                    <span className="text-[9px] text-slate-400 truncate max-w-[80px] lg:max-w-[120px]">
                      {currentUser.roleTitle}
                    </span>
                  )}
                  {isCitizen && (
                    <span className="text-[9px] text-amber-400 truncate max-w-[80px] lg:max-w-[120px]">
                      Landowner
                    </span>
                  )}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
            </button>

            {/* Dropdown Menu & Authentication Modal */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-96 sm:w-[420px] bg-white border border-slate-300 rounded-xl shadow-2xl z-50 overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                
                {/* User Profile Summary */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm border ${
                    isCitizen ? 'bg-amber-100 text-amber-900 border-amber-200' : 'bg-[#002b49] text-white border-slate-700'
                  }`}>
                    {isCitizen ? '🌾' : currentUser?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">{currentUser?.name || 'Authorized User'}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{currentUser?.designation || currentUser?.roleTitle || (isCitizen ? 'Citizen Landowner' : 'System User')}</div>
                  </div>
                </div>

                {/* Profile Actions */}
                <div className="py-1.5 border-b border-slate-200 bg-white">
                  <button onClick={() => setDropdownOpen(false)} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-2 cursor-pointer transition-colors">
                    <User className="w-4 h-4 text-slate-400" />
                    Official Profile
                  </button>
                  <button onClick={() => setDropdownOpen(false)} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-2 cursor-pointer transition-colors">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    Jurisdiction Settings
                  </button>
                  <button onClick={() => setDropdownOpen(false)} className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 cursor-pointer transition-colors">
                    <LogOut className="w-4 h-4 text-red-500" />
                    Sign Out
                  </button>
                </div>

                {/* Modal Header */}
                <div className="p-3.5 bg-[#002b49] text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-amber-400" /> BhoomiSetu Access Desk
                    </span>
                    <span className="text-[10px] bg-white/15 text-white border border-white/20 px-2 py-0.5 rounded font-mono font-medium">
                      RBAC & Citizen Login
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Select a designated officer role or log in as a citizen landowner to track statutory land issues.
                  </p>

                  {/* Dual Mode Switcher Tabs */}
                  <div className="grid grid-cols-2 gap-1.5 mt-3 bg-[#001f35] p-1 rounded-lg border border-slate-700">
                    <button
                      onClick={() => setAuthTab('officer')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                        authTab === 'officer'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Officer Roles</span>
                    </button>
                    <button
                      onClick={() => setAuthTab('citizen')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                        authTab === 'citizen'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Citizen / Landowner</span>
                    </button>
                  </div>
                </div>

                {/* Tab 1: Department Officers RBAC */}
                {authTab === 'officer' && (
                  <div className="p-3 bg-slate-50 max-h-[380px] overflow-y-auto space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1 mb-1">
                      Statutory Officer Personas (RFCTLARR Act)
                    </div>
                    {users.map((user) => {
                      const isActive = currentUser?.id === user.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            switchUser(user.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-lg flex items-start gap-2.5 text-left transition-all cursor-pointer border ${
                            isActive
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs'
                              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-[#002b49] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {user.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold truncate">{user.name}</span>
                              {isActive ? (
                                <span className="text-[9px] bg-[#002b49] text-white px-1.5 py-0.2 rounded font-semibold shrink-0">
                                  ACTIVE
                                </span>
                              ) : (
                                <span className="text-[9px] text-slate-400 group-hover:text-slate-600">Switch</span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#002b49] font-medium truncate m-0">
                              {user.designation || user.roleTitle}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                              <span className="truncate">{user.department?.split(',')[0]}</span>
                              <span>•</span>
                              <span className="font-semibold text-slate-700 truncate">{user.jurisdiction}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Tab 2: Citizen & Landowner Login / Land Issue Lookup */}
                {authTab === 'citizen' && (
                  <div className="p-3 bg-slate-50 max-h-[440px] overflow-y-auto space-y-3">
                    {/* Option 1: Direct Mobile OTP Verification */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-[#002b49]" /> Quick Mobile / Aadhaar Login
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold font-mono">
                          Instant OTP
                        </span>
                      </div>

                      {!otpSent ? (
                        <form onSubmit={handleSendOtp} className="space-y-2">
                          <div className="relative">
                            <input
                              type="text"
                              value={mobileNumber}
                              onChange={(e) => setMobileNumber(e.target.value)}
                              placeholder="Enter Mobile No. or Masked Aadhaar..."
                              className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-1.5 pl-7 outline-none focus:ring-1 focus:ring-[#002b49]"
                            />
                            <Smartphone className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                          </div>
                          {otpError && <p className="text-[11px] text-red-600 m-0">{otpError}</p>}
                          <button
                            type="submit"
                            className="w-full bg-[#002b49] hover:bg-[#003b66] text-white text-xs font-bold py-1.5 rounded transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>Send 4-Digit Verification OTP</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-2 animate-in fade-in">
                          <div className="text-[11px] text-slate-600">
                            OTP sent to <span className="font-bold text-slate-900">{mobileNumber}</span>. (Demo code: <span className="font-mono font-bold text-[#002b49]">8421</span>)
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              maxLength={4}
                              value={enteredOtp}
                              onChange={(e) => setEnteredOtp(e.target.value)}
                              placeholder="Enter 4-Digit OTP"
                              className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-1.5 pl-7 font-mono font-bold tracking-widest outline-none focus:ring-1 focus:ring-[#002b49]"
                            />
                            <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                          </div>
                          {otpError && <p className="text-[11px] text-red-600 m-0">{otpError}</p>}
                          {otpSuccess && (
                            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 m-0">
                              <CheckCircle2 className="w-3 h-3" /> Landowner identity verified! Redirecting...
                            </p>
                          )}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setOtpSent(false)}
                              className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1.5 rounded transition-colors cursor-pointer"
                            >
                              Back
                            </button>
                            <button
                              type="submit"
                              className="w-2/3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-1.5 rounded transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verify & Check Land</span>
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    {/* Option 2: Search Khasra & One-Click Land Issue Presets */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5 text-amber-700" /> Search Khasra / Land Dispute
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">1-Click Login</span>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={searchKhasra}
                          onChange={(e) => setSearchKhasra(e.target.value)}
                          placeholder="Search Khasra (145/1), Name, Village..."
                          className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded px-2.5 py-1.5 pl-7 outline-none focus:ring-1 focus:ring-amber-600"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                      </div>

                      {/* Landowner Cards List */}
                      <div className="space-y-1.5 pt-1">
                        {filteredCitizenParcels.slice(0, 4).map((parcel) => {
                          const hasDispute = parcel.courtStay || parcel.disputeReason || parcel.status?.toLowerCase().includes('dispute');
                          return (
                            <button
                              key={parcel.id}
                              onClick={() => handleSelectLandownerPreset(parcel)}
                              className="w-full text-left p-2 rounded-md border border-slate-200 bg-slate-50 hover:bg-amber-50/60 hover:border-amber-300 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-slate-900 group-hover:text-amber-900">
                                  {parcel.ownerName}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                    hasDispute
                                      ? 'bg-red-50 text-red-700 border-red-200'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}
                                >
                                  {hasDispute ? '⚠️ Land Dispute Active' : '✅ Award Disbursed'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                                <span>
                                  Khasra <strong className="text-slate-800 font-mono">{parcel.khasraNo}</strong> • {parcel.village} ({parcel.district})
                                </span>
                                <span className="font-mono text-slate-700">
                                  ₹{(parcel.totalCompensationAwarded / 100000).toFixed(1)}L
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Bar */}
                <div className="p-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center gap-1 text-[10px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Aadhaar & Digilocker Verified
                  </span>
                  <button
                    onClick={() => setDropdownOpen(false)}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

