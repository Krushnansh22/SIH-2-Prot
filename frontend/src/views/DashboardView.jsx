import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  UploadCloud, 
  Search, 
  History, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Fingerprint,
  Award,
  Sparkles
} from 'lucide-react';

export const DashboardView = () => {
  const { metrics, user, token, setActiveTab, setSelectedDocForPreview } = useAuth();
  const [recentDocs, setRecentDocs] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [docsRes, logsRes] = await Promise.all([
          fetch('https://sih-2-prot.onrender.com/api/documents', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('https://sih-2-prot.onrender.com/api/audit/logs', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (docsRes.ok) {
          const docsData = await docsRes.json();
          setRecentDocs(docsData.slice(0, 5));
        }

        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setRecentLogs(logsData.slice(0, 6));
        }
      } catch (err) {
        console.error('Error fetching dashboard feed', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [token]);

  const isTampered = metrics?.tampered_documents_count > 0;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Welcome Banner with Role & Status */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0e172a] via-[#111e38] to-[#0c162d] border border-[#1e2e4a] shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-[11px] font-semibold text-cyan-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>National Judicial Vault System</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400">Node Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Welcome back, {user.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
              <span className="text-cyan-400 font-mono font-medium">{user.role}</span>
              <span>•</span>
              <span>{user.station}</span>
              <span>•</span>
              <span className="text-slate-300 font-mono">{user.badge}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('upload')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 flex items-center gap-2 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className="px-4 py-2.5 rounded-xl bg-[#172236] hover:bg-[#1e2e4a] border border-[#1e2e4a] text-slate-200 font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <Fingerprint className="w-4 h-4 text-cyan-400" />
              <span>Verify Hashes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Tamper Alert Banner (If triggered) */}
      {isTampered && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/90 via-red-950/80 to-rose-900/60 border border-rose-500/80 text-rose-100 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-900/90 border border-rose-400 text-rose-200">
              <AlertOctagon className="w-6 h-6 text-rose-300" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span>CRITICAL SECURITY ALERT: Cryptographic Integrity Mismatch Detected!</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-800 text-white font-mono uppercase">
                  Tamper Detected
                </span>
              </div>
              <p className="text-xs text-rose-300/90 mt-0.5">
                {metrics?.tampered_documents_count} document(s) in the vault fail SHA-256 match against the immutable blockchain block ledger.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('verify')}
            className="px-4 py-2 rounded-xl bg-white text-rose-950 font-bold text-xs hover:bg-rose-100 transition-colors shrink-0 shadow-lg"
          >
            Investigate Breach
          </button>
        </div>
      )}

      {/* 4 Primary Telemetry Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Documents */}
        <div className="p-5 rounded-2xl bg-[#0d1424] border border-[#1e2e4a] relative overflow-hidden group hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Vault Evidence</span>
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-300">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">{metrics?.total_documents || 7}</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
              <Lock className="w-3 h-3" /> AES-256 Encrypted
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Case Files Committed</span>
            <span className="font-mono text-cyan-400">100% Ingested</span>
          </div>
        </div>

        {/* Pending AI Reviews */}
        <div 
          onClick={() => setActiveTab('upload')}
          className="p-5 rounded-2xl bg-[#0d1424] border border-[#1e2e4a] relative overflow-hidden group hover:border-amber-500/50 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending AI Flags</span>
            <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-300">{metrics?.pending_ai_review_flags || 1}</span>
            <span className="text-xs text-amber-400 font-semibold">Human Review</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Low Confidence (&lt;85%)</span>
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              Review Queue <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Blockchain Ledger Blocks */}
        <div 
          onClick={() => setActiveTab('verify')}
          className="p-5 rounded-2xl bg-[#0d1424] border border-[#1e2e4a] relative overflow-hidden group hover:border-emerald-500/50 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Blockchain Height</span>
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">#{metrics?.blockchain_height || 8}</span>
            <span className="text-xs text-emerald-400 font-semibold">Blocks Mined</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Tamper Status:</span>
            <span className={`font-bold ${isTampered ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isTampered ? 'HASH MISMATCH' : '100% UNBROKEN'}
            </span>
          </div>
        </div>

        {/* Anomalous Security Alerts */}
        <div 
          onClick={() => setActiveTab('admin')}
          className="p-5 rounded-2xl bg-[#0d1424] border border-[#1e2e4a] relative overflow-hidden group hover:border-rose-500/50 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Anomalies</span>
            <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400">{metrics?.unresolved_anomalies_count || 2}</span>
            <span className="text-xs text-rose-400 font-semibold">Flagged Events</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Suspicious Behavior</span>
            <span className="text-rose-400 font-semibold flex items-center gap-1">
              Inspect Alerts <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

      </div>

      {/* Middle Grid: Document Category Distribution & Quick Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Recent Encrypted Documents in Vault */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0c1220] border border-[#1e2e4a] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Recent Case Files & Digital Evidence
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('vault')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Explore All Vault Files</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDocForPreview(doc)}
                className="p-3.5 rounded-2xl bg-white hover:bg-white border border-[#e7d7a8] hover:border-[#d79a2d] transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    doc.is_tampered ? 'bg-rose-950 text-rose-300' : 'bg-white border border-[#e7d7a8] text-black'
                  }`}>
                    {doc.is_tampered ? <AlertOctagon className="w-4 h-4 text-rose-400" /> : <FileText className="w-4 h-4 text-black" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-black group-hover:text-black truncate transition-colors">
                      {doc.title}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-black font-medium">Case: {doc.case_number}</span>
                      <span>•</span>
                      <span>{doc.document_type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#e7d7a8] text-black">
                    Block #{doc.blockchain_block_index}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    doc.is_tampered
                      ? 'bg-rose-950 border-rose-600 text-rose-300'
                      : doc.status === 'PENDING_REVIEW'
                      ? 'bg-amber-950 border-amber-600 text-amber-300'
                      : 'bg-white border-[#e7d7a8] text-black'
                  }`}>
                    {doc.is_tampered ? 'TAMPERED' : doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Immutable System Activity Log */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0c1220] border border-[#1e2e4a] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Live Audit Stream
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('admin')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Full Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-white border border-[#e7d7a8] text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black font-mono text-[11px] flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      log.severity === 'CRITICAL' ? 'bg-rose-500 animate-ping' : log.severity === 'HIGH' ? 'bg-amber-500' : 'bg-black'
                    }`}></span>
                    {log.event_type}
                  </span>
                  <span className="text-[10px] text-black font-mono">{log.timestamp.split(' ')[1]}</span>
                </div>
                <p className="text-[11px] text-black truncate">{log.details}</p>
                <div className="text-[10px] text-black font-mono flex items-center justify-between pt-0.5">
                  <span>Officer: {log.user_badge}</span>
                  <span className="text-black">{log.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
