// src/pages/WelcomePage.js
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fmtINR } from '../components/UI';

const FEATURES = [
  { icon:'🔐', title:'Role-Based Login', desc:'Admin, Property Manager & Tenant roles with granular permissions.' },
  { icon:'💳', title:'Online Payments', desc:'UPI, Credit Card, Debit Card, Net Banking — receipts auto-generated.' },
  { icon:'📊', title:'Analytics Dashboard', desc:'Real-time revenue charts, occupancy rates, and pending payment tracking.' },
  { icon:'🔔', title:'Smart Reminders', desc:'Automated 7-day, 3-day, and due-date alerts via Email, SMS & WhatsApp.' },
  { icon:'📄', title:'Digital Agreements', desc:'PDF rental agreements auto-generated with tenant and owner details.' },
  { icon:'🛠', title:'Maintenance Tracking', desc:'Raise, assign, and resolve electrical, plumbing, and Wi-Fi requests.' },
  { icon:'📱', title:'QR Code Payments', desc:'Unique QR for every tenant — scan and pay instantly, no app needed.' },
  { icon:'🤖', title:'AI Chatbot', desc:'Tenants ask about dues, rooms, and maintenance — AI answers 24/7.' },
  { icon:'📈', title:'Predictive Analytics', desc:'Forecast vacancies, revenue trends, and identify late payers early.' },
  { icon:'🗺', title:'Property Maps', desc:'Google Maps integration with nearby landmarks and transit distances.' },
  { icon:'📂', title:'Document Vault', desc:'Aadhaar, PAN, Passport, and lease agreements stored securely.' },
  { icon:'💾', title:'Cloud Backup', desc:'Auto-backup to cloud. Export database anytime. One-click restore.' },
];

const STATS = [
  { val:'₹1.6Cr+', lbl:'Monthly rent collected' },
  { val:'84', lbl:'Total units managed' },
  { val:'91%', lbl:'Portfolio occupancy' },
  { val:'6', lbl:'Properties across India' },
];

// Animated counter
function Counter({ target, prefix='', suffix='' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const isNum = typeof target === 'number';
    if (!isNum) return;
    let start = 0; const dur = 1600; const step = 16;
    const inc = target / (dur / step);
    const t = setInterval(() => {
      start += inc;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.round(start));
    }, step);
    return () => clearInterval(t);
  }, [target]);
  return <>{prefix}{typeof target === 'number' ? val.toLocaleString('en-IN') : target}{suffix}</>;
}

export default function WelcomePage() {
  const { setPage, properties } = useApp();
  const totalIncome = properties.reduce((s,p) => s + (p.monthlyIncome||0), 0);

  return (
    <div style={{ overflowX:'hidden' }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{
        minHeight:'100vh', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'80px 28px 60px', textAlign:'center', position:'relative',
        background:'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(14,165,233,0.12) 0%, transparent 70%)',
      }}>
        {/* Floating orbs */}
        {[
          { w:400, h:400, top:'-10%', left:'-8%', color:'rgba(14,165,233,0.06)' },
          { w:300, h:300, bottom:'5%', right:'-5%', color:'rgba(234,179,8,0.05)' },
          { w:200, h:200, top:'40%', left:'5%', color:'rgba(139,92,246,0.05)' },
        ].map((o,i) => (
          <div key={i} style={{
            position:'absolute', width:o.w, height:o.h,
            top:o.top, left:o.left, bottom:o.bottom, right:o.right,
            borderRadius:'50%', background:o.color,
            filter:'blur(60px)', pointerEvents:'none',
          }} />
        ))}

        {/* Eyebrow */}
        <div style={{
          display:'inline-flex', alignItems:'center', gap:8, marginBottom:28,
          background:'rgba(14,165,233,0.08)', border:'1px solid rgba(14,165,233,0.2)',
          borderRadius:20, padding:'6px 18px',
        }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--teal)', boxShadow:'0 0 8px var(--teal)' }} />
          <span style={{ fontSize:12, color:'var(--teal)', letterSpacing:'0.06em', fontWeight:500 }}>
            India's smartest property management platform
          </span>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize:'clamp(40px,7vw,80px)', fontWeight:700, lineHeight:1.06, marginBottom:22, maxWidth:780 }}>
          Manage Rent.{' '}
          <span style={{ background:'linear-gradient(90deg,var(--teal),var(--gold))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
            Effortlessly.
          </span>
        </h1>

        <p style={{ fontSize:'clamp(15px,2vw,19px)', color:'var(--text-secondary)', maxWidth:560, margin:'0 auto 40px', lineHeight:1.7 }}>
          One dashboard for all your properties. Collect rent online, track maintenance,
          manage tenants — powered by AI and real-time analytics.
        </p>

        <div style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center', marginBottom:60 }}>
          <button className="btn btn-teal btn-xl" onClick={() => setPage('properties')}>
            View properties →
          </button>
          <button className="btn btn-xl" onClick={() => setPage('admin')}>
            ⚡ Admin panel
          </button>
        </div>

        {/* Stats strip */}
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',
          gap:1, background:'var(--border)', borderRadius:'var(--r-xl)',
          overflow:'hidden', maxWidth:700, width:'100%',
          border:'1px solid var(--border-glow)', boxShadow:'0 0 40px rgba(14,165,233,0.08)',
        }}>
          {STATS.map(s => (
            <div key={s.lbl} style={{ background:'var(--bg-deep)', padding:'20px 18px', textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:700, fontFamily:'Space Grotesk', color:'var(--teal)', letterSpacing:'-0.02em' }}>{s.val}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROPERTIES PREVIEW ────────────────────────────────────────── */}
      <section style={{ padding:'72px 28px', background:'rgba(14,165,233,0.03)', borderTop:'1px solid var(--border)' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ fontSize:11, color:'var(--teal)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10, fontWeight:600 }}>Portfolio</div>
          <h2 style={{ fontSize:'clamp(26px,4vw,40px)', marginBottom:12 }}>Your 6 properties at a glance</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:15 }}>Click any property to view its full dashboard</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16, maxWidth:1100, margin:'0 auto' }}>
          {properties.map((p, i) => {
            const occ = Math.round((p.occupied/p.totalUnits)*100);
            return (
              <div key={p.id}
                onClick={() => { useApp; }}
                className="glass"
                style={{ cursor:'pointer', padding:22, position:'relative', overflow:'hidden', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.borderColor='var(--border-glow)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='var(--border)'; }}
                onClick_={() => {}}
              >
                {/* Gradient accent */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:p.gradient }} />

                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ fontSize:32 }}>{p.emoji}</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14, fontFamily:'Space Grotesk' }}>{p.name}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>📍 {p.location}</div>
                    </div>
                  </div>
                  <span style={{ fontSize:10, background:'rgba(14,165,233,0.08)', border:'1px solid var(--border)', borderRadius:6, padding:'2px 8px', color:'var(--teal)' }}>{p.type}</span>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
                  {[
                    { val:p.occupied, lbl:'Occupied', c:'var(--green)' },
                    { val:p.vacant, lbl:'Vacant', c:'var(--amber)' },
                    { val:p.maintenance_count, lbl:'Maintenance', c:'var(--red)' },
                  ].map(s => (
                    <div key={s.lbl} style={{ textAlign:'center', background:'rgba(14,165,233,0.04)', borderRadius:8, padding:'8px 4px' }}>
                      <div style={{ fontSize:18, fontWeight:700, color:s.c, fontFamily:'Space Grotesk' }}>{s.val}</div>
                      <div style={{ fontSize:9, color:'var(--text-muted)', marginTop:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom:10 }}>
                  <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${occ}%`, background:p.gradient, borderRadius:2 }} />
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:4, fontSize:10, color:'var(--text-muted)' }}>
                    <span>Occupancy</span><span style={{ color:p.accentColor }}>{occ}%</span>
                  </div>
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:14, paddingTop:12, borderTop:'1px solid var(--border)' }}>
                  <span style={{ fontWeight:700, color:'var(--green)', fontSize:15, fontFamily:'Space Grotesk' }}>{fmtINR(p.monthlyIncome)}<span style={{ fontSize:10, color:'var(--text-muted)', fontWeight:400 }}>/mo</span></span>
                  <span style={{ fontSize:11, color:p.accentColor, cursor:'pointer', fontWeight:500 }}>View dashboard →</span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign:'center', marginTop:32 }}>
          <button className="btn btn-teal" onClick={() => setPage('properties')}>View all properties →</button>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────────── */}
      <section style={{ padding:'72px 28px' }}>
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <div style={{ fontSize:11, color:'var(--gold)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10, fontWeight:600 }}>Features</div>
          <h2 style={{ fontSize:'clamp(26px,4vw,40px)', marginBottom:12 }}>30+ features for modern landlords</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:15 }}>Everything from PGs to commercial complexes — one platform</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:14, maxWidth:1100, margin:'0 auto' }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className="glass-sm" style={{ padding:20, transition:'all 0.2s', cursor:'default' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-glow)'; e.currentTarget.style.background='rgba(14,165,233,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-glass)'; }}>
              <div style={{ fontSize:28, marginBottom:10 }}>{f.icon}</div>
              <h4 style={{ fontFamily:'Space Grotesk', fontSize:14, marginBottom:6, color:'var(--text-primary)' }}>{f.title}</h4>
              <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.55 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section style={{ padding:'72px 28px', background:'rgba(14,165,233,0.03)', borderTop:'1px solid var(--border)' }}>
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <h2 style={{ fontSize:'clamp(26px,4vw,40px)', marginBottom:12 }}>Up and running in 4 steps</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:28, maxWidth:900, margin:'0 auto' }}>
          {[
            { n:'01', icon:'🏢', t:'Add property', d:'Enter name, location, type, floors, and amenities through the admin panel.' },
            { n:'02', icon:'🚪', t:'Set up units', d:'Add rooms or units with floor, rent, deposit, area, and status.' },
            { n:'03', icon:'👤', t:'Onboard tenants', d:'Upload documents, set lease dates, generate digital rental agreements.' },
            { n:'04', icon:'💳', t:'Collect rent', d:'Tenants pay via UPI, card, or banking. Receipts generated instantly.' },
          ].map(s => (
            <div key={s.n} style={{ textAlign:'center' }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,var(--teal),var(--teal-dim))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 16px', boxShadow:'0 0 20px var(--teal-glow)' }}>{s.icon}</div>
              <div style={{ fontSize:10, color:'var(--teal)', fontWeight:700, letterSpacing:'0.1em', marginBottom:6 }}>STEP {s.n}</div>
              <h4 style={{ fontFamily:'Space Grotesk', marginBottom:8 }}>{s.t}</h4>
              <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.55 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section style={{ padding:'80px 28px', textAlign:'center', background:'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(14,165,233,0.1) 0%, transparent 70%)' }}>
        <h2 style={{ fontSize:'clamp(28px,5vw,52px)', marginBottom:16 }}>
          Ready to modernise your{' '}
          <span style={{ background:'linear-gradient(90deg,var(--teal),var(--gold))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>portfolio?</span>
        </h2>
        <p style={{ color:'var(--text-secondary)', fontSize:15, marginBottom:36 }}>Join smart landlords across Bengaluru, Hyderabad, and Chennai</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button className="btn btn-teal btn-xl" onClick={() => setPage('admin')}>Add your first property →</button>
          <button className="btn btn-xl" onClick={() => setPage('properties')}>Browse portfolio</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid var(--border)', padding:'20px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:20 }}>🏠</span>
          <span style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:14 }}>RentEasy</span>
          <span style={{ fontSize:11, color:'var(--text-muted)' }}>v2.0 · Smart Property Management</span>
        </div>
        <div style={{ fontSize:11, color:'var(--text-muted)' }}>© 2026 RentEasy · Rent Easy. Live Easy. · rentease.space</div>
      </footer>
    </div>
  );
}
