import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Award, 
  Printer, 
  Copy, 
  CheckCircle2, 
  ShieldCheck, 
  Scale, 
  FileCheck, 
  Lock,
  Download
} from 'lucide-react';

export const Section65BCertificateModal = () => {
  const { selectedDocForCert, setSelectedDocForCert, token, showToast } = useAuth();
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedDocForCert) {
      setCertData(null);
      return;
    }

    const fetchCert = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/documents/${selectedDocForCert.id}/section65b`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCertData(data);
        }
      } catch (err) {
        console.error('Error fetching Section 65B certificate', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCert();
  }, [selectedDocForCert, token]);

  if (!selectedDocForCert) return null;

  const handleCopy = () => {
    if (certData?.certificate_body) {
      navigator.clipboard.writeText(certData.certificate_body);
      showToast('Section 65B Certificate copied to clipboard!', 'success');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#0c1220] border border-[#1e2e4a] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2e4a] bg-gradient-to-r from-[#111c33] to-[#0d1629]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-600 text-amber-300">
              <Award className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  Section 65B Electronic Evidence Certificate
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300">
                  BSA 2023 COMPLIANT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Statutory Certificate for admissibility of digital records in Court of Law
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Copy Certificate Text"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" /> Copy
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-md shadow-cyan-950/40"
              title="Print for Court Production"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={() => setSelectedDocForCert(null)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body Container */}
        <div className="p-6 overflow-y-auto max-h-[calc(92vh-130px)] space-y-4">
          
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-mono text-xs animate-pulse">
              Generating Cryptographically Signed Section 65B Certificate...
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-[#070b14] border border-[#1e2e4a] shadow-inner font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {certData?.certificate_body}
            </div>
          )}

          {/* Legal Compliance Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
            <Scale className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-300">Evidentiary Admissibility Note:</span>
              <p>
                This electronic certificate satisfies the mandates of the Supreme Court of India in <em>Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal (2020)</em> and Section 63 of Bharatiya Sakshya Adhiniyam (BSA), 2023. Cryptographic hash is synchronized with the NyayaVault tamper-evident blockchain ledger.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
