import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  UserCheck, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  ArrowRight,
  Fingerprint,
  Cpu,
  Building2,
  Globe2
} from 'lucide-react';

export const LoginView = () => {
  const { demoPresets, user, setUser, setToken, setActiveTab, showToast, fetchMetrics } = useAuth();
  
  const [selectedPreset, setSelectedPreset] = useState(user.key || 'police');
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState('123456');
  const [loading, setLoading] = useState(false);

  const handleSelectPreset = (key) => {
    setSelectedPreset(key);
    const found = demoPresets.find(p => p.key === key);
    if (found) {
      setUser(found);
    }
  };

  const handleInitiateLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMfaStep(true);
      showToast('Step 1 Passed. Enter 6-digit MFA Security Code (Demo: 123456)', 'info');
    }, 400);
  };

  const handleVerifyMFA = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/verify-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          mfa_code: mfaCode
        })
      });

      const data = await res.json();
      if (res.ok) {
        setToken(data.access_token);
        showToast(`MFA Verified! Welcome ${data.user.full_name}`, 'success');
        fetchMetrics();
        setActiveTab('dashboard');
      } else {
        showToast(data.detail || 'MFA Code verification failed', 'error');
      }
    } catch (err) {
      showToast('Failed to reach authentication server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const activePresetObj = demoPresets.find(p => p.key === selectedPreset) || demoPresets[0];

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center p-4 sm:p-6 bg-grid-pattern relative">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl relative z-10 space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            National Police & Judiciary Security Gateway
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
            NyayaVault Access Portal
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            End-to-end encrypted repository with Zero-Trust RBAC/ABAC authorization & Multi-Factor Authentication.
          </p>
        </div>

        {/* Main Authentication Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0c1220]/90 backdrop-blur-xl border border-[#1e2e4a] rounded-3xl p-6 sm:p-8 shadow-2xl">
          
          {/* Left Column: Role Preset Selector */}
          <div className="lg:col-span-6 space-y-4 border-b lg:border-b-0 lg:border-r border-[#1e2e4a] pb-6 lg:pb-0 lg:pr-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Select Officer Role Profile
              </span>
              <span className="text-[11px] text-cyan-400 font-mono">Demo Auto-Fill</span>
            </div>

            <div className="space-y-2.5">
              {demoPresets.map((p) => {
                const isSelected = selectedPreset === p.key;
                return (
                  <div
                    key={p.key}
                    onClick={() => handleSelectPreset(p.key)}
                    className={`p-3.5 rounded-2xl cursor-pointer border transition-all flex items-center gap-3.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/60 border-cyan-500/70 shadow-lg shadow-cyan-950/40 text-white'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className={`w-11 h-11 rounded-xl object-cover border ${
                        isSelected ? 'border-cyan-400 ring-2 ring-cyan-500/30' : 'border-slate-700'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-100 truncate">{p.name}</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300">
                          {p.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-cyan-400 font-medium">{p.role}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{p.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Security Indicator Checklist */}
            <div className="p-3.5 rounded-xl bg-[#080d18] border border-slate-800/80 space-y-2 text-xs">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> Active Security Posture
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> AES-256 Galois Mode
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> SHA-256 Ledger
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> CCA Digital Sig
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> ABAC Jurisdiction
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: MFA & Credentials Form */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
            {!mfaStep ? (
              <form onSubmit={handleInitiateLogin} className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    2. Primary Credentials
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800">
                    OAuth2 / JWT
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Username / Service ID</label>
                  <input
                    type="text"
                    value={activePresetObj.username}
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Password / Biometric PIN</label>
                  <input
                    type="password"
                    value="••••••••••••••••"
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 focus:outline-none focus:border-cyan-500 cursor-not-allowed"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Assigned Police Station:</span>
                    <span className="text-slate-200 font-semibold">{activePresetObj.station}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>District Jurisdiction:</span>
                    <span className="text-slate-200 font-semibold">{activePresetObj.district}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? 'Authenticating...' : (
                    <>
                      <span>Proceed to 2FA MFA Verification</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyMFA} className="space-y-4 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Fingerprint className="w-4 h-4" /> 2. Multi-Factor 2FA Challenge
                  </span>
                  <button
                    type="button"
                    onClick={() => setMfaStep(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    Back
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-300 space-y-1">
                  <span className="font-bold">MFA TOTP Challenge Active:</span>
                  <p className="text-[11px] text-emerald-400/80">
                    A 6-digit cryptographic security code was generated for <strong>{activePresetObj.name}</strong>.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-300">Enter 6-Digit TOTP Code</label>
                    <span className="text-[10px] text-cyan-400 font-mono">Demo Preset: 123456</span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="w-full text-center tracking-[0.5em] text-lg font-mono font-bold py-3 px-4 rounded-xl bg-slate-950 border border-cyan-500/60 text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? 'Verifying MFA Token...' : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Authenticate & Enter Vault</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
