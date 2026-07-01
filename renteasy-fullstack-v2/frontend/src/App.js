// src/App.js
import React, { useState } from 'react';
import './index.css';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar }   from './components/Layout';
import { Toast }     from './components/UI';
import PaymentModal  from './components/PaymentModal';
import WelcomePage       from './pages/WelcomePage';
import PropertiesPage    from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import AdminPage         from './pages/AdminPage';
import { TenantsPage, PaymentsPage, SettingsPage, AIChatbot } from './pages/OtherPages';

function AppInner() {
  const { page, modal, setModal } = useApp();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg-base)' }}>
      {/* Sidebar — hidden on welcome */}
      {page !== 'welcome' && <Sidebar />}

      {/* Main content */}
      <div style={{ flex:1, overflow:'hidden', minWidth:0 }}>
        {page === 'welcome'     && <WelcomePage />}
        {page === 'properties'  && <PropertiesPage />}
        {page === 'property'    && <PropertyDetailPage />}
        {page === 'admin'       && <AdminPage />}
        {page === 'tenants'     && <TenantsPage />}
        {page === 'payments'    && <PaymentsPage />}
        {page === 'settings'    && <SettingsPage />}
        {page === 'reports'     && <AdminPage />}
        {page === 'audit'       && <AdminPage />}
      </div>

      {/* Payment modal */}
      {modal?.type === 'pay' && (
        <PaymentModal propId={modal.propId} tenant={modal.tenant} />
      )}

      {/* Toast */}
      <Toast />

      {/* AI Chatbot FAB */}
      {page !== 'welcome' && (
        <>
          <button
            onClick={() => setChatOpen(o=>!o)}
            style={{
              position:'fixed', bottom:24, right:24, zIndex:300,
              width:52, height:52, borderRadius:'50%',
              background:'linear-gradient(135deg,var(--teal),var(--teal-dim))',
              border:'none', cursor:'pointer', fontSize:24,
              boxShadow:'0 0 24px var(--teal-glow), 0 8px 20px rgba(0,0,0,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'transform 0.2s',
            }}
            onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'}
            onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
            title="AI Assistant"
          >
            {chatOpen ? '✕' : '🤖'}
          </button>
          {chatOpen && <AIChatbot onClose={() => setChatOpen(false)} />}
        </>
      )}

      {/* Ambient background grid */}
      <div style={{
        position:'fixed', inset:0, zIndex:-1, pointerEvents:'none',
        backgroundImage:`
          linear-gradient(rgba(14,165,233,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(14,165,233,0.03) 1px, transparent 1px)
        `,
        backgroundSize:'60px 60px',
      }} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
