// src/components/Layout.js
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const SIDEBAR_SECTIONS = [
  {
    label: 'Main',
    items: [
      { key:'welcome',    icon:'🏠', label:'Home' },
      { key:'properties', icon:'🏢', label:'Properties' },
    ]
  },
  {
    label: 'Management',
    items: [
      { key:'admin',    icon:'⚡', label:'Admin panel' },
      { key:'tenants',  icon:'👥', label:'All tenants' },
      { key:'payments', icon:'💳', label:'Payments' },
      { key:'reports',  icon:'📊', label:'Reports' },
    ]
  },
  {
    label: 'System',
    items: [
      { key:'audit',    icon:'📝', label:'Audit log' },
      { key:'settings', icon:'⚙️', label:'Settings' },
    ]
  }
];

export function Sidebar() {
  const { page, setPage, selectedPropId, openProperty, properties } = useApp();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding:'20px 18px 8px', borderBottom:'1px solid var(--border)', marginBottom:8 }}>
        <button onClick={() => setPage('welcome')}
          style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', width:'100%' }}>
          <div style={{
            width:34, height:34, borderRadius:10,
            background:'linear-gradient(135deg,#0EA5E9,#0284C7)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:18, boxShadow:'0 0 16px rgba(14,165,233,0.4)',
          }}>🏠</div>
          <div style={{ textAlign:'left' }}>
            <div style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:15, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>RentEasy</div>
            <div style={{ fontSize:9, color:'var(--teal)', letterSpacing:'0.08em', textTransform:'uppercase' }}>Smart PM v2.0</div>
          </div>
        </button>
      </div>

      {/* Nav sections */}
      {SIDEBAR_SECTIONS.map(sec => (
        <div className="nav-section" key={sec.label}>
          <div className="nav-label">{sec.label}</div>
          {sec.items.map(item => (
            <button key={item.key} className={`nav-item ${page===item.key?'active':''}`}
              onClick={() => setPage(item.key)}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      ))}

      {/* Properties quick links */}
      {properties.length > 0 && (
        <div className="nav-section">
          <div className="nav-label">Properties</div>
          {properties.map(p => (
            <button key={p.id}
              className={`nav-item ${page==='property' && selectedPropId===p.id ? 'active' : ''}`}
              onClick={() => openProperty(p.id)}
              style={{ fontSize:12 }}
            >
              <span className="nav-icon">{p.emoji}</span>
              <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</span>
              {p.maintenance_count > 0 && <span className="nav-badge">{p.maintenance_count}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Bottom user */}
      <div style={{ marginTop:'auto', padding:'16px 18px', borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#EAB308,#CA8A04)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>👑</div>
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>Admin</div>
            <div style={{ fontSize:10, color:'var(--text-muted)' }}>admin@renteasy.in</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function Topbar({ title, subtitle }) {
  const { setModal, notify } = useApp();
  return (
    <div className="topbar">
      <div>
        <div style={{ fontFamily:'Space Grotesk', fontWeight:600, fontSize:16 }}>{title}</div>
        {subtitle && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:1 }}>{subtitle}</div>}
      </div>
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <button className="btn btn-sm" onClick={() => notify('Searching...','info')}>🔍 Search</button>
        <button className="btn btn-sm btn-teal" onClick={() => setModal({ type:'pay' })}>💳 Pay rent</button>
        <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#0EA5E9,#0284C7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, cursor:'pointer' }}>👑</div>
      </div>
    </div>
  );
}
