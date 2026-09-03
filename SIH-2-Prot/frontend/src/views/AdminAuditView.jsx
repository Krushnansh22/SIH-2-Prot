import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  History, 
  AlertTriangle, 
  AlertOctagon, 
  ShieldCheck, 
  UserCheck, 
  Filter, 
  Download, 
  Lock, 
  CheckCircle2, 
  Layers, 
  Building2, 
  Calendar, 
  Clock, 
  Globe2, 
  Cpu,
  RefreshCw,
  Search
} from 'lucide-react';

const PERMISSION_MATRIX = [
  { module: 'Upload Case Evidence (FIR / Statements)', police: true, forensic: false, senior: true, admin: true },
  { module: 'Upload Forensic & Ballistics Reports', police: false, forensic: true, senior: true, admin: true },
  { module: 'Decrypt AES-256 Vault Records', police: true, forensic: true, senior: true, admin: true },
  { module: 'Recalculate SHA-256 & Verify Ledger', police: true, forensic: true, senior: true, admin: true },
  { module: 'Approve Low-Confidence AI Flagged Scans', police: false, forensic: false, senior: true, admin: true },
  { module: 'Cross-Station District Case Overview', police: false, forensic: false, senior: true, admin: true },
  { module: 'Export Immutable Audit & Sec 65B Certs', police: true, forensic: true, senior: true, admin: true },
  { module: 'System Ledger Maintenance & Tamper Override', police: false, forensic: false, senior: false, admin: true }
];

export const AdminAuditView = () => {
  const { user, token, showToast } = useAuth();
  
  const [activeTab, setActiveTab] = useState('logs'); // 'logs', 'anomalies', 'rbac_matrix'
  const [auditLogs, setAuditLogs] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [eventFilter, setEventFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsRes, anomaliesRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/audit/logs', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://127.0.0.1:8000/api/admin/anomalies', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAuditLogs(logsData);
      }

      if (anomaliesRes.ok) {
        const anomaliesData = await anomaliesRes.json();
        setAnomalies(anomaliesData);
      }
    } catch (e) {
      console.error(e);
      showToast('Error loading audit data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleResolveAnomaly = (anomalyId) => {
    setAnomalies(anomalies.map(a => a.id === anomalyId ? { ...a, is_resolved: true } : a));
    showToast(`Security Anomaly ${anomalyId} marked as resolved!`, 'success');
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Log ID', 'Timestamp', 'Event Type', 'User Badge', 'User Name', 'IP Address', 'Severity', 'Details'],
      ...auditLogs.map(l => [l.id, l.timestamp, l.event_type, l.user_badge, l.user_name, l.ip_address, l.severity, `"${l.details}"`])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NyayaVault_Audit_Trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    showToast('Audit Trail exported as CSV!', 'success');
  };

  const filteredLogs = auditLogs.filter(log => {
    if (severityFilter !== 'ALL' && log.severity.toLowerCase() !== severityFilter.toLowerCase()) return false;
    if (eventFilter !== 'ALL' && log.event_type.toLowerCase() !== eventFilter.toLowerCase()) return false;
    if (searchTerm) {
      const corpus = `${log.details} ${log.user_name} ${log.user_badge} ${log.event_type}`.toLowerCase();
      if (!corpus.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0c1220] border border-[#1e2e4a]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-[11px] font-semibold text-cyan-300">
            <History className="w-3.5 h-3.5" />
            <span>Cyber Command & Forensic Audit Engine</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
            Admin & Security Audit Center
          </h2>
          <p className="text-xs text-slate-400">
            Immutable system activity logging, AI-driven anomalous threat detection, and RBAC authorization matrices.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'logs' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Immutable Audit Trail
          </button>
          <button
            onClick={() => setActiveTab('anomalies')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'anomalies' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Anomalous Alerts</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-950 text-[10px] text-rose-200 font-mono font-bold">
              {anomalies.filter(a => !a.is_resolved).length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('rbac_matrix')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'rbac_matrix' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            RBAC Matrix
          </button>
        </div>
      </div>

      {activeTab === 'logs' && (
        <div className="p-6 rounded-3xl bg-[#0c1220] border border-[#1e2e4a] space-y-4">
          
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Search in logs */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter logs by keyword or badge..."
                  className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-64"
                />
              </div>

              {/* Severity Filter */}
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical Alerts</option>
                <option value="HIGH">High Severity</option>
                <option value="INFO">Informational</option>
              </select>

              {/* Event Type Filter */}
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Action Events</option>
                <option value="UPLOAD">Upload & Ingest</option>
                <option value="VIEW">Decrypted View</option>
                <option value="VERIFICATION">Hash Verification</option>
                <option value="TAMPER_ALERT">Tamper Alerts</option>
                <option value="MFA_LOGIN">MFA Logins</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit CSV</span>
            </button>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Event ID</th>
                  <th className="p-3">Timestamp (IST)</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">Officer / Badge</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Network IP / Node</th>
                  <th className="p-3">Description & Hash Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredLogs.map((log) => {
                  const isCrit = log.severity === 'CRITICAL';
                  const isHigh = log.severity === 'HIGH';
                  return (
                    <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 text-cyan-400 font-bold">{log.id}</td>
                      <td className="p-3 text-slate-300 whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-200">{log.event_type}</span>
                      </td>
                      <td className="p-3 text-slate-300 whitespace-nowrap">
                        <span className="font-semibold text-slate-200">{log.user_name}</span>
                        <span className="text-[10px] text-slate-400 block">{log.user_badge}</span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isCrit
                            ? 'bg-rose-950 border-rose-500 text-rose-300'
                            : isHigh
                            ? 'bg-amber-950 border-amber-500 text-amber-300'
                            : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px] truncate max-w-[140px]">{log.ip_address}</td>
                      <td className="p-3 text-slate-300 font-sans">{log.details}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {activeTab === 'anomalies' && (
        <div className="p-6 rounded-3xl bg-[#0c1220] border border-[#1e2e4a] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100">
                AI Anomalous Threat & Suspicious Behavior Detection
              </h3>
              <p className="text-xs text-slate-400">
                Heuristic rules detecting out-of-hours queries, bulk export surges, and cryptographic hash alterations.
              </p>
            </div>
            <button onClick={fetchData} className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3.5">
            {anomalies.map((alert) => (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border space-y-3 transition-all ${
                  alert.is_resolved
                    ? 'bg-slate-900/40 border-slate-800 opacity-60'
                    : alert.severity === 'CRITICAL'
                    ? 'bg-rose-950/30 border-rose-500/60 text-rose-100'
                    : 'bg-amber-950/30 border-amber-500/60 text-amber-100'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-900/80 text-rose-200' : 'bg-amber-900/80 text-amber-200'
                    }`}>
                      <AlertOctagon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-cyan-300">{alert.id}</span>
                        <span className="text-sm font-bold text-slate-100">{alert.alert_type.replace(/_/g, ' ')}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          alert.severity === 'CRITICAL' ? 'bg-rose-950 border-rose-500 text-rose-300' : 'bg-amber-950 border-amber-500 text-amber-300'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Triggered at {alert.timestamp} by {alert.user_name} ({alert.user_badge})
                      </div>
                    </div>
                  </div>

                  {!alert.is_resolved ? (
                    <button
                      onClick={() => handleResolveAnomaly(alert.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all shrink-0 border border-slate-700"
                    >
                      Acknowledge & Resolve
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Resolved
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">{alert.description}</p>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] flex items-center justify-between">
                  <span className="text-slate-400">Recommended Action:</span>
                  <span className="font-semibold text-cyan-300 font-mono">{alert.suggested_action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'rbac_matrix' && (
        <div className="p-6 rounded-3xl bg-[#0c1220] border border-[#1e2e4a] space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Zero-Trust RBAC & ABAC Access Control Permissions
            </h3>
            <p className="text-xs text-slate-400">
              Strict compartmentalization enforced across Police Stations, Forensic Labs, District SP Command, and Judicial Registry.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">System Module / Action Scope</th>
                  <th className="p-3 text-center">Police Officer</th>
                  <th className="p-3 text-center">Forensic Officer</th>
                  <th className="p-3 text-center">Senior SP</th>
                  <th className="p-3 text-center">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {PERMISSION_MATRIX.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-3.5 font-semibold text-slate-200">{row.module}</td>
                    <td className="p-3.5 text-center">
                      {row.police ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="p-3.5 text-center">
                      {row.forensic ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="p-3.5 text-center">
                      {row.senior ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="p-3.5 text-center">
                      {row.admin ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-slate-600">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
