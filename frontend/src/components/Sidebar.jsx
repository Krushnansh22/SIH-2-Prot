import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Search, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Sliders, 
  KeyRound, 
  History,
  Lock,
  Binary,
  CheckCircle2
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, metrics, user } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: '1. Dashboard & Metrics',
      icon: LayoutDashboard,
      badge: null,
      desc: 'System health & telemetry'
    },
    {
      id: 'upload',
      label: '2. AI Document Ingest',
      icon: UploadCloud,
      badge: metrics?.pending_ai_review_flags > 0 ? `${metrics.pending_ai_review_flags} Flagged` : null,
      badgeColor: 'bg-white border-[#e7d7a8] text-black',
      desc: 'OCR & entity extraction'
    },
    {
      id: 'vault',
      label: '3. Intelligent Search',
      icon: Search,
      badge: `${metrics?.total_documents || 7} Files`,
      badgeColor: 'bg-white border-[#e7d7a8] text-black',
      desc: 'Semantic & keyword discovery'
    },
    {
      id: 'verify',
      label: '4. Blockchain & Custody',
      icon: ShieldCheck,
      badge: metrics?.tampered_documents_count > 0 ? 'ALERT' : 'Verified',
      badgeColor: metrics?.tampered_documents_count > 0 ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse' : 'bg-white border-[#e7d7a8] text-black',
      desc: 'SHA-256 & tamper proofing'
    },
    {
      id: 'admin',
      label: '5. Admin & Audit Grid',
      icon: History,
      badge: metrics?.unresolved_anomalies_count > 0 ? `${metrics.unresolved_anomalies_count} Anomalies` : null,
      badgeColor: 'bg-white border-[#e7d7a8] text-black',
      desc: 'Immutable logs & anomalies'
    },
    {
      id: 'login',
      label: '6. Auth & MFA Demo',
      icon: KeyRound,
      badge: '2FA Active',
      badgeColor: 'bg-white border-[#e7d7a8] text-black',
      desc: 'OAuth2 / TOTP challenge'
    }
  ];

  return (
    <aside className="w-72 shrink-0 bg-[rgba(255,252,244,0.88)] border-r border-[#ead7a1] p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)] shadow-inner">
      <div className="space-y-6">
        
        {/* Navigation Group */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            System Modules & Views
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                    className={`w-full group text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between gap-2 border ${
                    isActive
                      ? 'bg-gradient-to-r from-[#f8e9ad] via-[#f5d576] to-[#f7f5ee] border-[#e7c86f] text-[#2d241b] shadow-lg shadow-[#f3d98d]/30'
                      : 'border-transparent text-[#4f453d] hover:text-[#2d241b] hover:bg-[#f7f0d6] hover:border-[#ead7a1]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive ? 'bg-[#f4d36c] text-[#2d241b] font-bold' : 'bg-[#f9f1d6] text-[#695d56] group-hover:text-[#8a5d1d]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold tracking-tight truncate">{item.label}</div>
                      <div className="text-[11px] text-[#6d6058] font-normal truncate">{item.desc}</div>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`shrink-0 whitespace-nowrap text-[10px] font-bold leading-4 px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Security & Cryptographic Compliance Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#fffdf7] to-[#f6ebc3] border border-[#ead7a1] text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#433a33] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#b7862b]" />
              Vault Cryptography
            </span>
            <span className="text-[10px] font-mono text-[#5d7d51] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7ca76d] animate-pulse"></span>
              SEC-256GCM
            </span>
          </div>

          <div className="space-y-1 font-mono text-[11px] text-[#6d6058]">
            <div className="flex justify-between">
              <span>Fingerprint:</span>
              <span className="text-[#433a33] truncate max-w-[120px]">SHA-256 Merkle</span>
            </div>
            <div className="flex justify-between">
              <span>Compliance:</span>
              <span className="text-[#8a5d1d] font-semibold">Sec 65B BSA 2023</span>
            </div>
            <div className="flex justify-between">
              <span>Ledger:</span>
              <span className="text-[#5d7d51] font-semibold">Block #{metrics?.blockchain_height || 8}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Active User Session Footer */}
      <div className="pt-4 border-t border-[#ead7a1] text-xs">
        <div className="flex items-center justify-between text-[#6d6058] mb-1.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold">Active Scope</span>
          <span className="text-[#5d7d51] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> RBAC OK
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#fffaf0] border border-[#ead7a1]">
          <div className="font-bold text-[#352d20] truncate">{user.name}</div>
          <div className="text-[11px] text-[#8a5d1d] font-mono">{user.role}</div>
          <div className="text-[11px] text-[#6d6058] truncate mt-0.5">{user.station}</div>
        </div>
      </div>
    </aside>
  );
};
