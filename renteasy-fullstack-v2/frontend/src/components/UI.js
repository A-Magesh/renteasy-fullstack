// src/components/UI.js  — reusable atoms
import React from 'react';
import { useApp } from '../context/AppContext';

/* ── Toast ─────────────────────────────────────────────────────────────────── */
export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  const icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
  return (
    <div className="toast">
      <span>{icons[toast.type] || '✅'}</span>
      <span>{toast.msg}</span>
    </div>
  );
}

/* ── Status Badge ────────────────────────────────────────────────────────────*/
const BADGE_MAP = {
  Occupied:'badge-green', Vacant:'badge-amber', 'Under Maintenance':'badge-red',
  Reserved:'badge-purple', Cleaning:'badge-teal',
  Paid:'badge-green', Pending:'badge-amber', Overdue:'badge-red',
  Completed:'badge-green', 'In Progress':'badge-teal',
  Active:'badge-green', 'Expiring soon':'badge-amber', Expired:'badge-red',
  High:'badge-red', Medium:'badge-amber', Low:'badge-teal',
  Inside:'badge-teal', 'Checked Out':'badge-green',
};
export function Badge({ label }) {
  const cls = BADGE_MAP[label] || 'badge-teal';
  return <span className={`badge ${cls}`}>{label}</span>;
}

/* ── KPI card ────────────────────────────────────────────────────────────────*/
export function KPI({ icon, label, value, color = 'var(--teal)', sub }) {
  return (
    <div className="kpi">
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-val" style={{ color }}>{value}</div>
      <div className="kpi-lbl">{label}</div>
      {sub && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{sub}</div>}
    </div>
  );
}

/* ── Section header ──────────────────────────────────────────────────────────*/
export function SectionHead({ title, children }) {
  return (
    <div className="section-head">
      <h3 style={{ fontFamily:'Space Grotesk', fontSize:15 }}>{title}</h3>
      <div style={{ display:'flex', gap:8 }}>{children}</div>
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────────────*/
export function Empty({ icon = '📭', msg = 'Nothing here yet.' }) {
  return (
    <div style={{ textAlign:'center', padding:'48px 20px', color:'var(--text-muted)' }}>
      <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
      <p style={{ fontSize:13 }}>{msg}</p>
    </div>
  );
}

/* ── Confirm modal ───────────────────────────────────────────────────────────*/
export function ConfirmModal({ msg, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth:380 }} onClick={e=>e.stopPropagation()}>
        <p style={{ fontSize:15, marginBottom:20, color:'var(--text-primary)' }}>{msg}</p>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-teal" onClick={onConfirm}>Confirm</button>
          <button className="btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ── Star rating ─────────────────────────────────────────────────────────────*/
export function Stars({ rating }) {
  return (
    <span style={{ color:'var(--gold)', fontSize:13 }}>
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5-Math.floor(rating))}
      <span style={{ color:'var(--text-muted)', fontSize:11, marginLeft:4 }}>{rating}</span>
    </span>
  );
}

/* ── Progress bar ────────────────────────────────────────────────────────────*/
export function ProgressBar({ pct, color = 'var(--teal)' }) {
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width:`${pct}%`, background:color }} />
    </div>
  );
}

/* ── Utility formatting ──────────────────────────────────────────────────────*/
export const fmtINR = (n) => {
  if (!n && n !== 0) return '—';
  if (n >= 100000) return '₹' + (n/100000).toFixed(1) + 'L';
  return '₹' + n.toLocaleString('en-IN');
};
export const fmtFull = (n) => '₹' + (n||0).toLocaleString('en-IN');

export const AVATAR_COLORS = [
  ['#064E3B','#10B981'], ['#312E81','#8B5CF6'],
  ['#7C2D12','#F59E0B'], ['#134E4A','#14B8A6'],
  ['#1E3A5F','#0EA5E9'], ['#4A1942','#EC4899'],
];
export function Avatar({ name, size=38, idx=0 }) {
  const [bg,fg] = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  const initials = (name||'?').split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase();
  return (
    <div className="avatar" style={{ width:size, height:size, background:bg, color:fg, fontSize:size*0.34, border:`1px solid ${fg}30` }}>
      {initials}
    </div>
  );
}
