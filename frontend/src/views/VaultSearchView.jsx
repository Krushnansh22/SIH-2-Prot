import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Sparkles, 
  FileText, 
  Filter, 
  Lock, 
  ShieldCheck, 
  Layers, 
  Eye, 
  Fingerprint, 
  Award, 
  AlertOctagon, 
  SlidersHorizontal,
  Scale,
  Calendar,
  Building2,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

const PRESET_QUERIES = [
  { label: '🎯 Ballistics 9mm Striations', query: 'ballistic trajectory 9mm spent cartridge striation rifling marks' },
  { label: '💰 Crypto Extortion Wallet', query: 'ransomware darknet bitcoin cold wallet ip trace' },
  { label: '🩺 Post-Mortem Asphyxia', query: 'post mortem ligature strangulation cause of death' },
  { label: '🔫 Weapon Seizure Panchnama', query: 'seizure memo pistol magazine recovery mithi river' },
  { label: '📜 Charge Sheet IPC 420', query: 'charge sheet 173 CrPC Vicky Malhotra cheating' }
];

export const VaultSearchView = () => {
  const { user, token, setSelectedDocForPreview, setSelectedDocForCert, setActiveTab, showToast } = useAuth();
  
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState('ALL'); // 'ALL', 'SEMANTIC', 'KEYWORD'
  const [docTypeFilter, setDocTypeFilter] = useState('ALL');
  const [caseFilter, setCaseFilter] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async (searchQuery = query, mode = searchMode) => {
    setLoading(true);
    try {
      const res = await fetch('http://sih-2-prot.onrender.com/api/documents/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          query: searchQuery,
          search_type: mode,
          document_type: docTypeFilter,
          case_number: caseFilter || null,
          limit: 20
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (e) {
      console.error(e);
      showToast('Search execution error', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [docTypeFilter, caseFilter, token]);

  const handlePresetClick = (q) => {
    setQuery(q);
    performSearch(q);
    showToast(`Executing AI Semantic Query: "${q}"`, 'info');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#0c1220] border border-[#1e2e4a] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-[11px] font-semibold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Neural Vector & Keyword Hybrid Search</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
              Intelligent Search & Vault Explorer
            </h2>
            <p className="text-xs text-slate-400">
              Query millions of forensic evidence pages using semantic natural language context or exact case identifiers.
            </p>
          </div>

          {/* Role Scope Restriction Indicator */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Active Search Scope:</span>
              <span className="font-bold text-slate-200 font-mono text-xs">{user.role}</span>
              <div className="text-[10px] text-emerald-400">ABAC Clearance Verified</div>
            </div>
          </div>
        </div>

        {/* Main Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5 text-cyan-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keyword or natural context (e.g. 'weapon recovered near river bank', 'ransomware bitcoin trace', 'CR-2024-8842')..."
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-[#080d18] border border-[#1e2e4a] focus:border-cyan-500 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute inset-y-1.5 right-1.5 px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-950/40 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? 'Searching...' : 'Search Vault'}</span>
            </button>
          </div>

          {/* Quick Preset Query Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Try Prompts:
            </span>
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetClick(preset.query)}
                className="shrink-0 px-3 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 transition-all font-medium"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Mode Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setSearchMode('ALL'); performSearch(query, 'ALL'); }}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    searchMode === 'ALL' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Hybrid
                </button>
                <button
                  type="button"
                  onClick={() => { setSearchMode('SEMANTIC'); performSearch(query, 'SEMANTIC'); }}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    searchMode === 'SEMANTIC' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  AI Semantic
                </button>
                <button
                  type="button"
                  onClick={() => { setSearchMode('KEYWORD'); performSearch(query, 'KEYWORD'); }}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    searchMode === 'KEYWORD' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Exact Keyword
                </button>
              </div>

              {/* Document Type Dropdown */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={docTypeFilter}
                  onChange={(e) => setDocTypeFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">All Document Types</option>
                  <option value="FIR">FIR (First Info Report)</option>
                  <option value="FORENSIC_REPORT">Forensic FSL Report</option>
                  <option value="BALLISTICS_REPORT">Ballistics Report</option>
                  <option value="CHARGE_SHEET">Charge Sheet</option>
                  <option value="SEIZURE_MEMO">Seizure Memo</option>
                  <option value="POST_MORTEM">Post-Mortem Report</option>
                </select>
              </div>

            </div>

            <div className="text-slate-400 font-mono text-[11px]">
              Found <strong className="text-cyan-400">{results.length}</strong> matching electronic records
            </div>
          </div>

        </form>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {results.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-[#0c1220] border border-[#1e2e4a] text-slate-500 text-xs space-y-2">
            <Search className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">No matching electronic records found</p>
            <p className="text-slate-500">Try broadening your search query or selecting "All Document Types".</p>
          </div>
        ) : (
          results.map(({ document: doc, relevance_score, match_type, snippet }) => {
            const isTampered = doc.is_tampered;
            return (
              <div
                key={doc.id}
                className="p-5 rounded-3xl bg-[#0c1220] hover:bg-[#0f172a] border border-[#1e2e4a] hover:border-cyan-500/40 transition-all space-y-3.5 group shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${
                      isTampered ? 'bg-rose-950/80 border border-rose-600 text-rose-300' : 'bg-cyan-950/80 border border-cyan-800 text-cyan-300'
                    }`}>
                      {isTampered ? <AlertOctagon className="w-5 h-5 text-rose-400" /> : <FileText className="w-5 h-5 text-cyan-400" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 
                          onClick={() => setSelectedDocForPreview(doc)}
                          className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 cursor-pointer transition-colors"
                        >
                          {doc.title}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isTampered ? 'bg-rose-950 border-rose-600 text-rose-300' : 'bg-emerald-950 border-emerald-600 text-emerald-300'
                        }`}>
                          {isTampered ? 'TAMPER ALERT' : 'AES-256 GCM'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-cyan-400 font-semibold">Case: {doc.case_number}</span>
                        <span>•</span>
                        <span>{doc.station}</span>
                        <span>•</span>
                        <span>{doc.upload_timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Match Type & Relevance Badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 flex items-center gap-1 font-mono">
                      <Sparkles className="w-3 h-3" />
                      {Math.round(relevance_score * 100)}% Match ({match_type.replace('_', ' ')})
                    </span>
                  </div>
                </div>

                {/* Extracted Snippet */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
                  {snippet}
                </div>

                {/* Footer Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" /> Block #{doc.blockchain_block_index}
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">SHA-256: {doc.sha256_hash.substring(0, 16)}...</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDocForPreview(doc)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" /> Inspect & Decrypt
                    </button>
                    <button
                      onClick={() => setSelectedDocForCert(doc)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" /> Sec 65B Cert
                    </button>
                    <button
                      onClick={() => setActiveTab('verify')}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-cyan-950/40 transition-all"
                    >
                      <Fingerprint className="w-3.5 h-3.5" /> Verify On Ledger
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
