import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { Section65BCertificateModal } from './components/Section65BCertificateModal';

import { DashboardView } from './views/DashboardView';
import { UploadView } from './views/UploadView';
import { VaultSearchView } from './views/VaultSearchView';
import { VerificationView } from './views/VerificationView';
import { AdminAuditView } from './views/AdminAuditView';
import { LoginView } from './views/LoginView';

const MainLayout = () => {
  const { activeTab } = useAuth();

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'upload' && <UploadView />}
            {activeTab === 'vault' && <VaultSearchView />}
            {activeTab === 'verify' && <VerificationView />}
            {activeTab === 'admin' && <AdminAuditView />}
            {activeTab === 'login' && <LoginView />}
          </div>
        </main>
      </div>

      <Toast />
      <DocumentDetailModal />
      <Section65BCertificateModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
