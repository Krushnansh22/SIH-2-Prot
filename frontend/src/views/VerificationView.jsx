import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Fingerprint, 
  Layers, 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  FileText, 
  Building2, 
  User, 
  Award, 
  Calendar, 
  Scale, 
  RefreshCw,
  Flame,
  Undo2,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VerificationView = () => {
  const { user, token, metrics, fetchMetrics, setSelectedDocForCert, showToast } = useAuth();
  
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [custodyTrail, setCustodyTrail] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tamperLoading, setTamperLoading] = useState(false);

  const fetchDocs = async () => {
    try {
      const res = await fetch('http://sih-2-prot.onrender.com/api/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
        if (data.length > 0 && !selectedDocId) {
          setSelectedDocId(data[0].id);
          runVerification(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [token]);

  const runVerification = async (docId = selectedDocId) => {
    if (!docId) return;
    setLoading(true);
    try {
      const [verifyRes, custodyRes] = await Promise.all([
        fetch('http://sih-2-prot.onrender.com/api/blockchain/verify-hash', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ document_id: docId })
        }),
        fetch(`http://sih-2-prot.onrender.com/api/documents/${docId}/custody`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        setVerificationResult(verifyData);
        if (verifyData.is_valid) {
          confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
        }
      }

      if (custodyRes.ok) {
        const custodyData = await custodyRes.json();
        setCustodyTrail(custodyData.custody_trail || []);
      }
    } catch (e) {
      showToast('Verification query failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateTamper = async (actionType) => {
    if (!selectedDocId) return;
    setTamperLoading(true);
    try {
      const res = await fetch('http://sih-2-prot.onrender.com/api/documents/simulate-tamper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          document_id: selectedDocId,
          tamper_type: actionType
        })
      });

      if (res.ok) {
        const data = await res.json();
        showToast(data.message, actionType === 'REVERT_ORIGINAL' ? 'success' : 'alert');
        fetchMetrics();
        fetchDocs();
        runVerification(selectedDocId);
      }
    } catch (e) {
      showToast('Failed to execute tamper simulation', 'error');
    } finally {
      setTamperLoading(false);
    }
  };

  const selectedDocObj = documents.find(d => d.id === selectedDocId);
  const isCurrentlyTampered = selectedDocObj?.is_tampered || verificationResult?.status === 'TAMPERED_HASH_MISMATCH';

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#0c1220] border border-[#1e2e4a] space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-[11px] font-semibold text-cyan-300">
          <Fingerprint className="w-3.5 h-3.5" />
          <span>Cryptographic Hash Recalculator & Tamper Proofing</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          Evidence Verification & Blockchain Chain of Custody
        </h2>
        <p className="text-xs text-slate-400">
          Recalculate SHA-256 document checksums, cross-examine against decentralized blockchain block headers, and inspect evidentiary custody.
        </p>
      </div>

      {/* Main Verification & Tamper Simulation Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Document Selector & Verification Console */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-[#0c1220] border border-[#1e2e4a] space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Select Document To Verify
              </span>
              <button
                onClick={() => runVerification(selectedDocId)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Re-Verify Now</span>
              </button>
            </div>

            {/* Document Select Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Target Digital Vault Asset</label>
              <select
                value={selectedDocId}
                onChange={(e) => {
                  setSelectedDocId(e.target.value);
                  runVerification(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.case_number} - {doc.title} {doc.is_tampered ? '⚠️ [TAMPERED]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Verification Result Card */}
            {verificationResult && (
              <div className={`p-5 rounded-2xl border space-y-4 animate-in fade-in zoom-in duration-200 ${
                isCurrentlyTampered
                  ? 'bg-rose-950/40 border-rose-500/70 text-rose-100 shadow-xl shadow-rose-950/40'
                  : 'bg-emerald-950/30 border-emerald-500/60 text-emerald-100 shadow-xl shadow-emerald-950/30'
              }`}>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {isCurrentlyTampered ? (
                      <AlertOctagon className="w-6 h-6 text-rose-400 animate-pulse" />
                    ) : (
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    )}
                    <div>
                      <div className="text-sm font-bold">
                        {isCurrentlyTampered ? 'TAMPER ALERT: HASH MISMATCH' : 'CRYPTOGRAPHICALLY VERIFIED AUTHENTIC'}
                      </div>
                      <div className="text-[11px] opacity-80 font-mono">
                        Validated at {verificationResult.matched_at}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isCurrentlyTampered
                      ? 'bg-rose-900 border-rose-400 text-rose-200'
                      : 'bg-emerald-900 border-emerald-400 text-emerald-200'
                  }`}>
                    {verificationResult.status}
                  </span>
                </div>

                {/* Hash Comparison Matrix */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans font-bold">
                      Calculated Document Checksum (Current File Payload):
                    </span>
                    <span className={`break-all ${isCurrentlyTampered ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                      {verificationResult.calculated_sha256}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans font-bold">
                      Immutable Blockchain Commitment (Block #{verificationResult.blockchain_block_index}):
                    </span>
                    <span className="break-all text-cyan-300">
                      {verificationResult.blockchain_recorded_sha256}
                    </span>
                  </div>
                </div>

                {/* Warning message if tampered */}
                {isCurrentlyTampered && (
                  <div className="p-3 rounded-xl bg-rose-900/40 border border-rose-500/50 text-xs text-rose-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <p>
                      The file payload has been altered since it was anchored on the blockchain. The digital signature is invalidated and the record is inadmissible until resolved.
                    </p>
                  </div>
                )}

              </div>
            )}

            {/* Interactive Tamper Injection Simulation Sandbox */}
            <div className="p-5 rounded-2xl bg-[#080d18] border border-[#1e2e4a] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" /> Tamper Simulation Sandbox
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Demo Testing Tool</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Demonstrate tamper detection to judicial or forensic evaluators. Altering this file will immediately fail SHA-256 cross-checks with the ledger.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {!isCurrentlyTampered ? (
                  <button
                    onClick={() => handleSimulateTamper('ALTER_TEXT')}
                    disabled={tamperLoading}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-all"
                  >
                    <Flame className="w-4 h-4" />
                    <span>{tamperLoading ? 'Simulating...' : 'Simulate File Tampering'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSimulateTamper('REVERT_ORIGINAL')}
                    disabled={tamperLoading}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
                  >
                    <Undo2 className="w-4 h-4" />
                    <span>{tamperLoading ? 'Restoring...' : 'Restore Original Blockchain State'}</span>
                  </button>
                )}

                {selectedDocObj && (
                  <button
                    onClick={() => setSelectedDocForCert(selectedDocObj)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-all border border-slate-700"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>View Section 65B Certificate</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right: Chronological Chain of Custody Timeline */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-[#0c1220] border border-[#1e2e4a] space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Court-Admissible Chain of Custody
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300">
                {custodyTrail.length} Custody Stages
              </span>
            </div>

            {/* Timeline Flow */}
            <div className="relative pl-6 space-y-6 before:absolute before:inset-y-2 before:left-2.5 before:w-0.5 before:bg-[#1e2e4a]">
              {custodyTrail.map((event, idx) => (
                <div key={event.id || idx} className="relative space-y-1.5 group">
                  
                  {/* Timeline Dot */}
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-cyan-500 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 group-hover:border-cyan-500/40 transition-all space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="text-xs font-bold text-slate-100">
                        {event.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400">{event.timestamp}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{event.notes}</p>

                    <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Custodian / Officer:</span>
                        <span className="text-slate-200 font-semibold">{event.actor_name} ({event.actor_badge})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Location:</span>
                        <span className="text-slate-300 truncate">{event.location}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono truncate">
                      Tx Anchor: {event.blockchain_tx_hash}
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
