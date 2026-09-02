import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Lock, 
  Unlock, 
  FileText, 
  CheckCircle2, 
  AlertOctagon, 
  ShieldCheck, 
  Fingerprint, 
  Building2, 
  Calendar, 
  User, 
  Scale, 
  Copy, 
  Download,
  Award
} from 'lucide-react';

export const DocumentDetailModal = () => {
  const { selectedDocForPreview, setSelectedDocForPreview, setSelectedDocForCert, showToast } = useAuth();
  const [showEncryptedPayload, setShowEncryptedPayload] = useState(false);

  if (!selectedDocForPreview) return null;

  const doc = selectedDocForPreview;
  const isTampered = doc.is_tampered;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0d1424] border border-[#1e2e4a] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2e4a] bg-[#111b30]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              isTampered ? 'bg-rose-950/80 border border-rose-600 text-rose-300' : 'bg-cyan-950/80 border border-cyan-600 text-cyan-300'
            }`}>
              {isTampered ? <AlertOctagon className="w-5 h-5 animate-pulse text-rose-400" /> : <FileText className="w-5 h-5 text-cyan-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">{doc.title}</h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  isTampered ? 'bg-rose-950 border-rose-500 text-rose-300' : 'bg-emerald-950 border-emerald-600 text-emerald-300'
                }`}>
                  {isTampered ? 'INTEGRITY TAMPERED' : 'AES-256 ENCRYPTED & VERIFIED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Case #{doc.case_number}</span>
                <span>•</span>
                <span>Type: {doc.document_type}</span>
                <span>•</span>
                <span>Station: {doc.station}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedDocForPreview(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          
          {/* Top Metadata Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Ingested Timestamp
              </div>
              <div className="text-xs font-semibold text-slate-200 mt-1">{doc.upload_timestamp}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-cyan-400" /> Uploading Officer
              </div>
              <div className="text-xs font-semibold text-slate-200 mt-1 truncate">{doc.uploader_name}</div>
              <div className="text-[10px] text-slate-400 font-mono">{doc.uploader_badge}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Blockchain Anchor
              </div>
              <div className="text-xs font-bold text-emerald-400 mt-1 font-mono">Block #{doc.blockchain_block_index}</div>
              <div className="text-[10px] text-slate-400 truncate">Tx: {doc.blockchain_tx_hash?.substring(0, 14)}...</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-amber-400" /> AI Confidence
              </div>
              <div className="text-xs font-bold text-amber-300 mt-1">
                {Math.round((doc.entities?.confidence_score || 0.95) * 100)}% Match
              </div>
              <div className="text-[10px] text-slate-400">OCR Entity Scanned</div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Fingerprint */}
          <div className="p-4 rounded-xl bg-[#090d16] border border-[#1e2e4a] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-cyan-400" /> SHA-256 Cryptographic Fingerprint
              </span>
              <button
                onClick={() => copyToClipboard(doc.sha256_hash, 'SHA-256 Hash')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copy Hash
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-xs text-cyan-300 break-all border border-slate-800">
              {doc.sha256_hash}
            </div>
          </div>

          {/* AI Extracted Legal Entities */}
          {doc.entities && (
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1e2e4a] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>AI Extracted Case Metadata & Penal Provisions</span>
                <span className="text-[10px] text-emerald-400 font-semibold">OCR Neural Classifier v2.0</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Accused / Suspect:</span>
                  <span className="font-semibold text-slate-100">{doc.entities.accused || 'Unknown / Under Investigation'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Complainant / Informant:</span>
                  <span className="font-semibold text-slate-100">{doc.entities.complainant || 'State Informant'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-1.5">Applicable Penal Sections (IPC / BNS / Special Acts):</span>
                <div className="flex flex-wrap gap-1.5">
                  {(doc.entities.penal_sections || []).map((sec, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono">
                      {sec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Document Content / Decrypted Payload Viewer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">Decrypted Evidence Content</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  AES-256-GCM Session Key Decrypted
                </span>
              </div>
              <button
                onClick={() => setShowEncryptedPayload(!showEncryptedPayload)}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
              >
                {showEncryptedPayload ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {showEncryptedPayload ? 'Show Decrypted Text' : 'View Raw Ciphertext'}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
              {showEncryptedPayload ? (
                <div className="text-emerald-400 break-all font-mono">
                  [AES-256-GCM ENCRYPTED PAYLOAD BLOB]<br/><br/>
                  {doc.encrypted_payload || 'b64_AESGCM_Payload_Encrypted...'}
                </div>
              ) : (
                doc.raw_content
              )}
            </div>
          </div>

          {/* Digital Signature Certificate Block */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border border-blue-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-cyan-400" /> Digital Signature Certificate (CCA Validated)
              </div>
              <div className="text-[11px] text-slate-400 font-mono truncate max-w-md">
                Sig: {doc.digital_signature}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Key Fingerprint: {doc.public_key_fingerprint}
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedDocForCert(doc);
              }}
              className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-950/40 flex items-center gap-1.5 transition-all"
            >
              <Award className="w-4 h-4" /> Generate Section 65B Certificate
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
