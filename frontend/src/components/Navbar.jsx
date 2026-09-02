import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  Layers, 
  Bell, 
  UserCheck, 
  FileCheck2, 
  AlertOctagon, 
  ChevronDown,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const Navbar = () => {
  const { user, demoPresets, switchDemoRole, metrics, fetchMetrics, setActiveTab } = useAuth();

  const isTampered = metrics?.tampered_documents_count > 0;

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-md border-b border-[#1e2e4a] px-4 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-900/30">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                NyayaVault
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 uppercase tracking-wider">
                v2.0 Legal Grid
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>National Judicial Evidence Vault</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 flex items-center gap-0.5">
                <Lock className="w-3 h-3" /> AES-256 + SHA-256
              </span>
            </p>
          </div>
        </div>

        {/* Center: Interactive Role Switcher Quick Bar */}
        <div className="hidden xl:flex items-center gap-1.5 p-1 rounded-xl bg-[#111827]/90 border border-[#1e2e4a]">
          <span className="text-[11px] font-semibold text-slate-400 px-2.5 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            Demo Role:
          </span>
          {demoPresets.map((p) => {
            const isActive = user.role === p.role;
            return (
              <button
                key={p.key}
                onClick={() => switchDemoRole(p.key)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{p.role.replace('_', ' ')}</span>
              </button>
            );
          })}
        </div>

        {/* Right Action & Security Indicators */}
        <div className="flex items-center gap-3">
          
          {/* Blockchain & Tamper Health Pill */}
          <div 
            onClick={() => setActiveTab('verify')}
            className={`cursor-pointer px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${
              isTampered
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-300 hover:bg-rose-950/60 animate-pulse'
                : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/50'
            }`}
          >
            {isTampered ? (
              <>
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold">TAMPER ALERT ({metrics?.tampered_documents_count})</span>
              </>
            ) : (
              <>
                <Layers className="w-4 h-4 text-emerald-400" />
                <div className="text-xs">
                  <span className="text-slate-400">Ledger: </span>
                  <span className="font-semibold text-emerald-400 font-mono">Block #{metrics?.blockchain_height || 8}</span>
                </div>
              </>
            )}
          </div>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-9 h-9 rounded-xl object-cover border border-cyan-500/40"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1">
                <span>{user.name.split(' ')[0]} {user.name.split(' ')[1]}</span>
                <span className="text-[10px] text-cyan-400 font-mono px-1 rounded bg-cyan-950/60 border border-cyan-800/40">
                  {user.badge}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                {user.station}
              </div>
            </div>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={fetchMetrics}
            title="Refresh Vault Telemetry"
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 border border-transparent hover:border-slate-700 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
