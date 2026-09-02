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
      badgeColor: 'bg-amber-950/80 border-amber-600 text-amber-300',
      desc: 'OCR & entity extraction'
    },
    {
      id: 'vault',
      label: '3. Intelligent Search',
      icon: Search,
      badge: `${metrics?.total_documents || 7} Files`,
      badgeColor: 'bg-cyan-950/80 border-cyan-800 text-cyan-300',
      desc: 'Semantic & keyword discovery'
    },
    {
      id: 'verify',
      label: '4. Blockchain & Custody',
      icon: ShieldCheck,
      badge: metrics?.tampered_documents_count > 0 ? 'ALERT' : 'Verified',
      badgeColor: metrics?.tampered_documents_count > 0 ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse' : 'bg-emerald-950/80 border-emerald-700 text-emerald-300',
      desc: 'SHA-256 & tamper proofing'
    },
    {
      id: 'admin',
      label: '5. Admin & Audit Grid',
      icon: History,
      badge: metrics?.unresolved_anomalies_count > 0 ? `${metrics.unresolved_anomalies_count} Anomalies` : null,
      badgeColor: 'bg-rose-950/80 border-rose-700 text-rose-300',
      desc: 'Immutable logs & anomalies'
    },
    {
      id: 'login',
      label: '6. Auth & MFA Demo',
      icon: KeyRound,
      badge: '2FA Active',
      badgeColor: 'bg-blue-950/80 border-blue-800 text-blue-300',
      desc: 'OAuth2 / TOTP challenge'
    }
  ];

  return (
    <aside className="w-72 shrink-0 bg-[#0c121e]/90 border-r border-[#1e2e4a] p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)]">
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
                  className={`w-full group text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between border ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/70 via-blue-950/50 to-slate-900 border-cyan-500/50 text-white shadow-lg shadow-cyan-950/30'
                      : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-[#172236] text-slate-400 group-hover:text-cyan-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold tracking-tight">{item.label}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{item.desc}</div>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Security & Cryptographic Compliance Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#111827] to-[#0a1120] border border-[#1e2e4a] text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              Vault Cryptography
            </span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              SEC-256GCM
            </span>
          </div>

          <div className="space-y-1 font-mono text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Fingerprint:</span>
              <span className="text-slate-300 truncate max-w-[120px]">SHA-256 Merkle</span>
            </div>
            <div className="flex justify-between">
              <span>Compliance:</span>
              <span className="text-cyan-400 font-semibold">Sec 65B BSA 2023</span>
            </div>
            <div className="flex justify-between">
              <span>Ledger:</span>
              <span className="text-emerald-400 font-semibold">Block #{metrics?.blockchain_height || 8}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Active User Session Footer */}
      <div className="pt-4 border-t border-[#1e2e4a] text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold">Active Scope</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> RBAC OK
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="font-bold text-slate-200 truncate">{user.name}</div>
          <div className="text-[11px] text-cyan-400 font-mono">{user.role}</div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5">{user.station}</div>
        </div>
      </div>
    </aside>
  );
};
