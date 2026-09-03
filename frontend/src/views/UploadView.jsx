import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Lock, 
  Scan, 
  ShieldCheck, 
  Building2, 
  User, 
  Scale, 
  Calendar, 
  Eye, 
  ArrowRight,
  Check,
  X,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_DOCS = [
  {
    name: 'Sample 1: FIR Cyber Extortion (Clean 96%)',
    case: 'CR-2024-9401',
    content: `FIRST INFORMATION REPORT (U/S 154 CrPC)
Police Station: Central Cyber Crime PS | District: Mumbai Central
FIR No: 9401/2024 | Date of Incident: 22-05-2024
Complainant: Aditya Singhania, Managing Director, Nova Tech
Accused: Rajesh 'Kunal' Rawat & Darknet accomplices
Sections: IPC 420 (Cheating), IPC 384 (Extortion), IT ACT 66D, IT ACT 43

Facts of Case:
The complainant reported unauthorized intrusion into cloud ERP database and extortion demand of 2.8 BTC. Investigating officer secured memory image and IP logs.

Investigating Officer: Inspector Ramesh Sharma`
  },
  {
    name: 'Sample 2: FSL Ballistics 9mm Report (95%)',
    case: 'CR-2024-9102',
    content: `STATE FORENSIC SCIENCE LABORATORY (FSL)
BALLISTICS DIVISION EXAMINATION REPORT
Case Ref: CR-2024-9102 | Police Station: Indiranagar PS
Date: 24-05-2024

Exhibits Received:
One fired 9mm spent cartridge case (Marked Ex-B1) and one 9mm semi-automatic pistol.
Examination & Microscopic Striation Findings:
Comparison microscope examination reveals 6 lands and 6 grooves with right-hand twist. Striation marks match test fired bullets.
Applicable Laws: ARMS ACT SEC 25/27, IPC 307

Conclusion:
Ex-B1 was fired from the seized weapon.
Forensic Examiner: Dr. Ananya Roy, SSO Ballistics`
  },
  {
    name: 'Sample 3: Smudged Handwritten Scan (Low Confidence 72% -> Review Queue)',
    case: 'CR-2024-7721',
    content: `[ROUGH HANDWRITTEN POLICE COMPLAINT - SCAN SMUDGED]
To, Station House Officer, Dharavi PS, Mumbai.
Date: 26-05-2024
Subject: Complaint of bag snatching and robbery.

Sir,
I, [unclear smudge] state that near 90 Feet Road two boys on motorcycle intercepted me and snatched gold chain and purse. Suspect name mentioned as [unclear / smudged: Bablu...].
Sections: IPC 392 (Robbery), IPC 34`
  }
];

export const UploadView = () => {
  const { user, token, showToast, fetchMetrics, setSelectedDocForPreview } = useAuth();
  
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'review_queue'
  const [rawText, setRawText] = useState(SAMPLE_DOCS[0].content);
  const [docTitle, setDocTitle] = useState('FIR - Cyber Extortion (Case #CR-2024-9401)');
  const [caseNumber, setCaseNumber] = useState('CR-2024-9401');
  const [isScanning, setIsScanning] = useState(false);
  const [extractionResult, setExtractionResult] = useState(null);
  const [flagForReviewOverride, setFlagForReviewOverride] = useState(false);
  const [pendingReviewDocs, setPendingReviewDocs] = useState([]);
  const [selectedFileObj, setSelectedFileObj] = useState(null);

  const fetchPendingQueue = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/documents?flagged_only=true', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingReviewDocs(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPendingQueue();
  }, [token, activeTab]);

  const loadSample = (sample) => {
    setRawText(sample.content);
    setCaseNumber(sample.case);
    setDocTitle(sample.name.split(' (')[0]);
    setSelectedFileObj(null);
    setExtractionResult(null);
    showToast(`Loaded ${sample.name.split(' (')[0]}`, 'info');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileObj(file);
      setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawText(event.target.result);
      };
      reader.readAsText(file);
      showToast(`Selected file: ${file.name}`, 'info');
    }
  };

  const handleRunAIIntelligence = () => {
    if (!rawText.trim()) {
      showToast('Please provide document text or upload a file', 'warning');
      return;
    }

    setIsScanning(true);
    setTimeout(() => {
      // Simulate live AI OCR Extraction
      const isSmudged = rawText.toLowerCase().includes('smudged') || rawText.toLowerCase().includes('unclear');
      const confidence = isSmudged ? 0.72 : 0.96;
      const flagged = isSmudged || confidence < 0.85;

      const detected = {
        detected_type: rawText.toLowerCase().includes('ballistic') ? 'BALLISTICS_REPORT' : 'FIR',
        confidence_score: confidence,
        flagged_for_review: flagged,
        review_reason: flagged ? 'Low OCR clarity and ambiguous handwriting detected.' : null,
        extracted_entities: {
          case_number: caseNumber,
          police_station: rawText.toLowerCase().includes('dharavi') ? 'Dharavi Police Station' : 'Central Cyber Crime PS',
          incident_date: '2024-05-22',
          complainant: 'Aditya Singhania',
          accused: isSmudged ? 'Bablu @ Unknown' : 'Rajesh Rawat',
          penal_sections: ['IPC 420', 'IPC 384', 'IT ACT 66D'],
          investigating_officer: user.name
        }
      };

      setExtractionResult(detected);
      setFlagForReviewOverride(flagged);
      setIsScanning(false);
      showToast(`AI OCR Analysis Completed (Confidence: ${Math.round(confidence * 100)}%)`, flagged ? 'warning' : 'success');
    }, 900);
  };

  const handleCommitToVault = async () => {
    if (!rawText.trim()) {
      showToast('No document content to ingest', 'warning');
      return;
    }

    setIsScanning(true);
    try {
      const formData = new FormData();
      if (selectedFileObj) {
        formData.append('file', selectedFileObj);
      } else {
        formData.append('raw_text', rawText);
      }
      formData.append('title', docTitle);
      formData.append('case_number', caseNumber);
      formData.append('confidentiality', 'CONFIDENTIAL');

      const res = await fetch('http://127.0.0.1:8000/api/documents/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        showToast(`Document anchored to Blockchain (Block #${data.blockchain_block.index})!`, 'success');
        fetchMetrics();
        fetchPendingQueue();
        setExtractionResult(null);
        setRawText('');
      } else {
        showToast(data.detail || 'Upload failed', 'error');
      }
    } catch (e) {
      showToast('Error uploading document to vault', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleReviewAction = async (docId, action) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/review-flagged', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          document_id: docId,
          action: action,
          notes: `${action} by ${user.name} (${user.role})`
        })
      });

      if (res.ok) {
        showToast(`Document ${action === 'APPROVE' ? 'Approved & Committed' : 'Rejected'}!`, 'success');
        fetchMetrics();
        fetchPendingQueue();
      }
    } catch (e) {
      showToast('Failed to submit review decision', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0c1220] border border-[#1e2e4a]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-[11px] font-semibold text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            AI Document Intelligence & Ingestion Pipeline
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
            Evidence Ingestion & Human-in-the-Loop Studio
          </h2>
          <p className="text-xs text-slate-400">
            Auto-extract legal entities, verify confidence metrics, and anchor SHA-256 fingerprints to the ledger.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload & AI Scanner
          </button>
          <button
            onClick={() => setActiveTab('review_queue')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'review_queue'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Review Queue</span>
            {pendingReviewDocs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-950 border border-amber-400 text-[10px] text-amber-200 font-mono font-bold">
                {pendingReviewDocs.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'upload' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Document Input, Samples, Drag-Drop */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Quick Sample Selector */}
            <div className="p-4 rounded-2xl bg-[#0c1220] border border-[#1e2e4a] space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Quick Test Samples:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {SAMPLE_DOCS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadSample(sample)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-cyan-500/40 text-xs text-slate-300 flex items-center justify-between transition-all"
                  >
                    <span className="font-semibold">{sample.name}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">Load</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Document Form & Drag-and-Drop Area */}
            <div className="p-6 rounded-3xl bg-[#0c1220] border border-[#1e2e4a] space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Document Title</label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. FIR #8842 - Cyber Extortion"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Case Reference Number</label>
                  <input
                    type="text"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    placeholder="e.g. CR-2024-9401"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Drag-and-Drop / File input box */}
              <div className="relative border-2 border-dashed border-[#1e2e4a] hover:border-cyan-500/50 rounded-2xl p-6 text-center bg-[#090d16]/50 transition-colors">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-400">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200">
                      {selectedFileObj ? selectedFileObj.name : 'Click or Drag & Drop PDF / Document File'}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Accepts PDF, TXT, OCR Scans (AES-256 Encrypted on Ingestion)
                    </p>
                  </div>
                </div>
              </div>

              {/* Text Payload / OCR Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Document Text Payload / OCR Stream</label>
                  <span className="text-[10px] text-slate-500 font-mono">{rawText.length} characters</span>
                </div>
                <textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste or view scanned document content here..."
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleRunAIIntelligence}
                  disabled={isScanning}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#172236] hover:bg-[#1e2e4a] border border-[#1e2e4a] hover:border-cyan-500/50 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Scan className="w-4 h-4" />
                  <span>{isScanning ? 'Extracting OCR Entities...' : 'Run AI OCR Extraction'}</span>
                </button>

                <button
                  onClick={handleCommitToVault}
                  disabled={isScanning || !rawText.trim()}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/40"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Commit to Vault & Blockchain</span>
                </button>
              </div>

            </div>
          </div>

          {/* Right: Live AI Extraction Preview & Confidence Meter */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-[#0c1220] border border-[#1e2e4a] space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-black" />
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    AI Extraction & Classification Result
                  </h3>
                </div>
                {extractionResult && (
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    extractionResult.confidence_score >= 0.85
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-amber-950 border-amber-500 text-amber-300'
                  }`}>
                    {Math.round(extractionResult.confidence_score * 100)}% Confidence
                  </span>
                )}
              </div>

              {/* Scanning Laser Animation placeholder */}
              {isScanning && (
                <div className="p-8 rounded-2xl bg-slate-950 border border-cyan-500/40 relative overflow-hidden text-center space-y-2">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan"></div>
                  <div className="text-xs font-mono font-bold text-cyan-300">
                    Executing PaddleOCR & Entity Recognition Pipeline...
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Extracting Case No, Station, Sections, Complainant & Accused vectors
                  </p>
                </div>
              )}

              {/* Extracted Entity Cards */}
              {extractionResult ? (
                <div className="space-y-4 animate-in fade-in zoom-in duration-200">
                  
                  {/* Warning if Flagged for Review */}
                  {extractionResult.flagged_for_review && (
                    <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/60 text-amber-200 space-y-1 text-xs">
                      <div className="font-bold flex items-center gap-1.5 text-amber-300">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Flagged for Senior Officer Review (&lt; 85% Confidence)</span>
                      </div>
                      <p className="text-[11px] text-amber-300/80">
                        {extractionResult.review_reason}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Classified Document Type:</span>
                      <span className="font-bold text-cyan-300 font-mono">{extractionResult.detected_type}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Police Station:</span>
                      <span className="font-semibold text-slate-200">{extractionResult.extracted_entities.police_station}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Accused / Suspect:</span>
                      <span className="font-semibold text-slate-100">{extractionResult.extracted_entities.accused}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Complainant:</span>
                      <span className="font-semibold text-slate-100">{extractionResult.extracted_entities.complainant}</span>
                    </div>
                  </div>

                  {/* Extracted Sections */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <span className="text-[11px] text-slate-400 font-semibold block">
                      Extracted Legal Sections (IPC / BNS):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {extractionResult.extracted_entities.penal_sections.map((sec, idx) => (
                        <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Ingestion Security Guarantee */}
                  <div className="p-4 rounded-xl bg-[#080d18] border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span>Encryption Protocol:</span>
                      <span className="text-emerald-400 font-bold">AES-256-GCM AEAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ledger Anchor Target:</span>
                      <span className="text-cyan-400 font-bold">Block Header SHA-256</span>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs space-y-2">
                  <Scan className="w-8 h-8 mx-auto text-slate-600" />
                  <p>Click "Run AI OCR Extraction" to inspect entity extraction and confidence score prior to vault anchoring.</p>
                </div>
              )}

            </div>
          </div>

        </div>
      ) : (
        /* Human-in-the-Loop Review Queue View */
        <div className="p-6 rounded-3xl bg-[#0c1220] border border-[#1e2e4a] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Human-in-the-Loop Review Queue
              </h3>
              <p className="text-xs text-slate-400">
                Authorized Senior Officers (SP / DSP) review low-confidence document classifications and ambiguous entities.
              </p>
            </div>
            <button
              onClick={fetchPendingQueue}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {pendingReviewDocs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p>All ingested documents have passed high confidence thresholds! Review queue is clear.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReviewDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/40 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-600 text-amber-300">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-100">{doc.title}</div>
                        <div className="text-[11px] text-slate-400">Case: {doc.case_number} • Station: {doc.station}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDocForPreview(doc)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect Scan
                      </button>
                      <button
                        onClick={() => handleReviewAction(doc.id, 'APPROVE')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-950/40"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve & Commit
                      </button>
                      <button
                        onClick={() => handleReviewAction(doc.id, 'REJECT')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 text-xs text-amber-300/90 font-mono">
                    Review Reason: {doc.entities?.review_reason || 'Confidence score < 85%'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
