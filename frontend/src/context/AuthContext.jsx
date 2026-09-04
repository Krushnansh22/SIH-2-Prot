import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const DEMO_PRESETS = [
  {
    key: 'police',
    username: 'sharma_police',
    name: 'Inspector Ramesh Sharma',
    badge: 'POL-4920',
    role: 'POLICE_OFFICER',
    station: 'Central Cyber Crime PS',
    district: 'Mumbai Central Division',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    desc: 'Investigating Officer - Case Files & FIR Management'
  },
  {
    key: 'forensic',
    username: 'ananya_fsl',
    name: 'Dr. Ananya Roy (Senior Officer)',
    badge: 'FSL-8190',
    role: 'FORENSIC_OFFICER',
    station: 'State Forensic Science Lab',
    district: 'Ballistics & Chemical Division',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    desc: 'FSL Scientist - Ballistics & Chemical Verification'
  },
  {
    key: 'senior',
    username: 'verma_sp',
    name: 'SP Rajesh Verma, IPS',
    badge: 'IPS-1044',
    role: 'SENIOR_OFFICER',
    station: 'District Police Headquarters',
    district: 'Mumbai Metropolitan Zone',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    desc: 'Superintendent of Police - Cross-Station Review & AI Overrides'
  },
  {
    key: 'admin',
    username: 'admin_vikram',
    name: 'Vikram Aditya (Cyber Director)',
    badge: 'ADM-007',
    role: 'ADMINISTRATOR',
    station: 'Central Police IT Command',
    district: 'State Cyber Security Grid',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    desc: 'System Administrator - Audit Logs & Tamper Monitor'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(DEMO_PRESETS[0]);
  const [token, setToken] = useState('demo-token-police-4920');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState(null);
  const [selectedDocForCert, setSelectedDocForCert] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch('http://sih-2-prot.onrender.com/api/dashboard/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (e) {
      console.error('Failed to fetch metrics', e);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, [user, token]);

  const switchDemoRole = async (roleKey) => {
    const found = DEMO_PRESETS.find(p => p.key === roleKey) || DEMO_PRESETS[0];
    setUser(found);
    setToken(`demo-token-${found.key}-${found.badge}`);
    showToast(`Switched active session to ${found.name} (${found.role})`, 'success');
    fetchMetrics();
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      token,
      setToken,
      activeTab,
      setActiveTab,
      demoPresets: DEMO_PRESETS,
      switchDemoRole,
      metrics,
      fetchMetrics,
      toast,
      showToast,
      selectedDocForPreview,
      setSelectedDocForPreview,
      selectedDocForCert,
      setSelectedDocForCert
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
