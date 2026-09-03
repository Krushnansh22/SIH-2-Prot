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
    <header className="sticky top-0 z-40 bg-[rgba(255,252,244,0.9)] backdrop-blur-md border-b border-[#ead7a1] px-4 lg:px-8 py-3.5 transition-all shadow-sm">
      <div className="flex items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-[#f4d36c] via-[#f1c654] to-[#d49e2a] p-0.5 shadow-lg shadow-[#f2d17d]/50">
            <div className="w-full h-full bg-[#fffdf7] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#a87422]" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7ca76d] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#5e8d59]"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-[#352d20] via-[#5b4d3a] to-[#b7862b] bg-clip-text text-transparent">
                NyayaVault
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f7ebc9] text-[#7d5b1f] border border-[#e7d7a8] uppercase tracking-wider">
                v2.0 Legal Grid
              </span>
            </div>
            <p className="text-xs text-[#6d6058] flex items-center gap-1.5">
              <span>National Judicial Evidence Vault</span>
              <span className="text-[#b5a48e]">•</span>
              <span className="text-[#6e8f57] flex items-center gap-0.5">
                <Lock className="w-3 h-3" /> AES-256 + SHA-256
              </span>
            </p>
          </div>
        </div>

        {/* Center: Interactive Role Switcher Quick Bar */}
        <div className="hidden xl:flex items-center gap-1.5 p-1 rounded-xl bg-[#fffaf0] border border-[#ead7a1]">
          <span className="text-[11px] font-semibold text-[#6d6058] px-2.5 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-[#b7862b]" />
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
                    ? 'bg-gradient-to-r from-[#f4d36c] to-[#d79a2d] text-[#2d241b] shadow-md shadow-[#f2d17d]/40 font-semibold'
                    : 'text-[#6d6058] hover:text-[#2d241b] hover:bg-[#f6eed7]'
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
                ? 'bg-[#f9e6e2] border-[#d8968d] text-[#8c4f45] hover:bg-[#f4d9d4] animate-pulse'
                : 'bg-[#edf6e7] border-[#b9d3a7] text-[#5d7d51] hover:bg-[#e4f0df]'
            }`}
          >
            {isTampered ? (
              <>
                <AlertOctagon className="w-4 h-4 text-[#a7594d]" />
                <span className="text-xs font-bold">TAMPER ALERT ({metrics?.tampered_documents_count})</span>
              </>
            ) : (
              <>
                <Layers className="w-4 h-4 text-[#5d7d51]" />
                <div className="text-xs">
                  <span className="text-[#6d6058]">Ledger: </span>
                  <span className="font-semibold text-[#5d7d51] font-mono">Block #{metrics?.blockchain_height || 8}</span>
                </div>
              </>
            )}
          </div>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#ead7a1]">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-9 h-9 rounded-xl object-cover border border-[#f1c654]"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-[#352d20] flex items-center gap-1">
                <span>{user.name.split(' ')[0]} {user.name.split(' ')[1]}</span>
                <span className="text-[10px] text-[#8a5d1d] font-mono px-1 rounded bg-[#f7ebc9] border border-[#e7d7a8]">
                  {user.badge}
                </span>
              </div>
              <div className="text-[11px] text-[#6d6058] truncate max-w-[140px]">
                {user.station}
              </div>
            </div>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={fetchMetrics}
            title="Refresh Vault Telemetry"
            className="p-2 rounded-xl text-[#6d6058] hover:text-[#2d241b] hover:bg-[#f6eed7] border border-transparent hover:border-[#e7d7a8] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
