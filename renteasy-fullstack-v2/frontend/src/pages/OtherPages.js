// src/pages/OtherPages.js  — Tenants, Payments, Reports, Settings, AI Chatbot
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge, KPI, Avatar, fmtINR, fmtFull, Empty } from '../components/UI';
import { Topbar } from '../components/Layout';

// ── All Tenants Page ──────────────────────────────────────────────────────────
export function TenantsPage() {
  const { allTenants, properties } = useApp();
  const [search, setSearch] = useState('');
  const [propFilter, setPropFilter] = useState('All');

  const props = ['All', ...properties.map(p=>p.name)];
  const filtered = allTenants.filter(t =>
    (propFilter==='All'||t.property===propFilter) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) ||
     t.unit?.includes(search) || t.phone?.includes(search))
  );

  const paid    = allTenants.filter(t=>t.paidThisMonth).length;
  const pending = allTenants.filter(t=>!t.paidThisMonth).length;

  return (
    <div>
      <Topbar title="All tenants" subtitle={`${allTenants.length} tenants across ${properties.length} properties`} />
      <div className="page-body">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
          <KPI icon="👥" label="Total tenants" value={allTenants.length} color="var(--teal)" />
          <KPI icon="✅" label="Paid this month" value={paid}    color="var(--green)" />
          <KPI icon="⚠️" label="Payment pending" value={pending} color="var(--amber)" />
          <KPI icon="📋" label="Expiring soon" value={3} color="var(--red)" />
        </div>

        <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
          <input type="text" placeholder="🔍  Search name, unit, phone…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{ background:'var(--bg-input)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:'8px 14px', fontSize:13, color:'var(--text-primary)', outline:'none', fontFamily:'inherit', width:240 }} />
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {props.map(p=>(
              <button key={p} onClick={()=>setPropFilter(p)} className={propFilter===p?'btn btn-teal btn-sm':'btn btn-sm'} style={{ fontSize:11 }}>{p==='All'?'All':p.split(' ')[0]}</button>
            ))}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:12 }}>
          {filtered.length===0 ? <Empty icon="👥" msg="No tenants match your search." /> :
            filtered.map((t,i)=>{
              const daysLeft = Math.round((new Date(t.leaseEnd)-new Date())/86400000);
              const status = daysLeft<0?'Expired':daysLeft<30?'Expiring soon':'Active';
              return (
                <div key={t.id} className="glass-sm" style={{ padding:'16px 18px', display:'flex', gap:12, alignItems:'center' }}>
                  <Avatar name={t.name} size={44} idx={i} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:14, fontFamily:'Space Grotesk', marginBottom:2 }}>{t.name}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{t.property} · {t.unit}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>📞 {t.phone}</div>
                    <div style={{ marginTop:6, display:'flex', gap:5 }}>
                      <Badge label={t.paidThisMonth?'Paid':'Pending'} />
                      <Badge label={status} />
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontWeight:700, color:'var(--green)', fontSize:15, fontFamily:'Space Grotesk' }}>{fmtFull(t.rent)}</div>
                    <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>Due {t.dueDate}</div>
                    <div style={{ fontSize:10, color:daysLeft<30?'var(--red)':'var(--text-muted)', marginTop:2 }}>{Math.max(0,daysLeft)}d left</div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}

// ── Payments Page ─────────────────────────────────────────────────────────────
export function PaymentsPage() {
  const { properties, setModal } = useApp();
  const allPayments = properties.flatMap(p=>(p.payments||[]).map(pmt=>({...pmt,property:p.name})));
  const [statusF, setStatusF] = useState('All');

  const filtered = allPayments.filter(p => statusF==='All'||p.status===statusF);
  const totalCollected = allPayments.filter(p=>p.status==='Paid').reduce((s,p)=>s+p.amount,0);
  const totalPending   = allPayments.filter(p=>p.status!=='Paid').reduce((s,p)=>s+p.amount,0);

  return (
    <div>
      <Topbar title="Payments" subtitle={`${allPayments.length} transactions this month`} />
      <div className="page-body">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:24 }}>
          <KPI icon="✅" label="Collected"  value={fmtINR(totalCollected)} color="var(--green)" />
          <KPI icon="⚠️" label="Pending"    value={fmtINR(totalPending)}   color="var(--amber)" />
          <KPI icon="📋" label="Paid count" value={allPayments.filter(p=>p.status==='Paid').length} color="var(--teal)" />
          <KPI icon="⏳" label="Awaiting"   value={allPayments.filter(p=>p.status!=='Paid').length} color="var(--red)" />
        </div>

        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          {['All','Paid','Pending','Overdue'].map(s=>(
            <button key={s} onClick={()=>setStatusF(s)} className={statusF===s?'btn btn-teal btn-sm':'btn btn-sm'}>{s}</button>
          ))}
          <button className="btn btn-gold btn-sm" style={{ marginLeft:'auto' }} onClick={()=>setModal({type:'pay'})}>+ Record payment</button>
        </div>

        <div className="glass-sm" style={{ overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table className="tbl">
              <thead><tr><th>Date</th><th>Property</th><th>Tenant</th><th>Unit</th><th>Amount</th><th>Method</th><th>Txn ID</th><th>Status</th><th>Receipt</th></tr></thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={9} style={{ textAlign:'center', padding:32, color:'var(--text-muted)' }}>No payments match this filter.</td></tr>
                ) : filtered.map((p,i)=>(
                  <tr key={i}>
                    <td style={{ color:'var(--text-muted)', fontSize:12 }}>{p.date||'—'}</td>
                    <td style={{ fontWeight:500, fontSize:12 }}>{p.property}</td>
                    <td style={{ fontWeight:500 }}>{p.tenant}</td>
                    <td style={{ color:'var(--text-secondary)' }}>{p.unit}</td>
                    <td style={{ fontWeight:700, color:'var(--green)' }}>{fmtFull(p.amount)}</td>
                    <td style={{ color:'var(--text-secondary)', fontSize:12 }}>{p.method||'—'}</td>
                    <td style={{ fontSize:10, fontFamily:'monospace', color:'var(--text-muted)' }}>{p.txnId||'—'}</td>
                    <td><Badge label={p.status} /></td>
                    <td>
                      {p.status==='Paid'
                        ? <button className="btn btn-ghost btn-sm" onClick={()=>{}}>⬇ PDF</button>
                        : <button className="btn btn-teal btn-sm" onClick={()=>setModal({type:'pay'})}>Pay</button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Settings Page ─────────────────────────────────────────────────────────────
export function SettingsPage() {
  const { notify } = useApp();
  return (
    <div>
      <Topbar title="Settings" subtitle="Account preferences and configuration" />
      <div className="page-body">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, maxWidth:860 }}>
          {[
            { title:'Account settings', icon:'👤', fields:['Full name','Email address','Phone number','Organisation name'] },
            { title:'Notification preferences', icon:'🔔', fields:['Email notifications','SMS alerts','WhatsApp messages','In-app alerts'] },
            { title:'Payment settings', icon:'💳', fields:['Razorpay API key','Default payment method','Currency','GST number'] },
            { title:'Security', icon:'🔐', fields:['Change password','Two-factor auth','Session timeout','Login history'] },
          ].map(s=>(
            <div key={s.title} className="glass-sm" style={{ padding:22 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
                <span style={{ fontSize:22 }}>{s.icon}</span>
                <h4 style={{ fontFamily:'Space Grotesk', fontSize:14 }}>{s.title}</h4>
              </div>
              {s.fields.map(f=>(
                <div className="field" style={{ marginBottom:12 }} key={f}>
                  <label>{f}</label>
                  <input type="text" placeholder={`Enter ${f.toLowerCase()}…`} />
                </div>
              ))}
              <button className="btn btn-teal btn-sm" style={{ marginTop:8 }} onClick={()=>notify('Settings saved!')}>Save changes</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── AI Chatbot ─────────────────────────────────────────────────────────────────
const BOT_RESPONSES = {
  'due': 'Your next rent payment of ₹18,500 is due on July 1, 2026. You can pay via UPI, credit card, or net banking from the Payments tab.',
  'rent': 'Current rent breakdown:\n• A-101 (Rahul Sharma): ₹18,500\n• A-102 (Priya Menon): ₹18,500\n• B-202 (Deepa Nair): ₹27,000\n\nTotal collected this month: ₹3.2L',
  'vacant': 'Currently vacant units:\n• Green Meadows A-103 (3BHK · ₹26,000)\n• Sunrise R-03 (AC PG · ₹10,500)\n• Royal Heights 301 (2BHK · ₹24,000)\n• Golden Oak B-1 (3BHK · ₹26,000)',
  'maintenance': 'Open maintenance requests:\n1. Electrical — Green Meadows C-301 (High priority)\n2. Plumbing — Green Meadows A-102 (Medium)\n3. Storeroom — Royal Heights G-1 (Low)\n\nTotal: 3 open requests',
  'income': 'Monthly income summary:\n• Green Meadows: ₹3.2L\n• Sunrise Residency: ₹1.8L\n• Royal Heights: ₹2.1L\n• Lake View Villas: ₹5.2L\n• Golden Oak: ₹1.5L\n• Silver Springs: ₹2.3L\n\n📈 Total: ₹16.1L/month',
  'hello': 'Hello! I\'m your RentEasy AI assistant 🤖\n\nI can help you with:\n• Rent dues and payment status\n• Vacant rooms available\n• Maintenance requests\n• Income reports\n• Tenant information\n\nWhat would you like to know?',
  'help': 'I can answer questions about:\n• "What rent is due?" — pending payments\n• "Show vacant rooms" — available units\n• "Monthly income" — revenue summary\n• "Maintenance status" — open requests\n• "Tenant list" — all tenants\n\nJust ask naturally! 😊',
};

export function AIChatbot({ onClose }) {
  const [msgs, setMsgs] = useState([
    { role:'bot', text:'Hello! I\'m your RentEasy AI assistant 🤖\n\nAsk me about rent dues, vacant rooms, income reports, maintenance, or tenant information.' }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const getReply = (q) => {
    const low = q.toLowerCase();
    for (const [key, ans] of Object.entries(BOT_RESPONSES)) {
      if (low.includes(key)) return ans;
    }
    return `I understand you're asking about "${q}". Let me check your portfolio data...\n\nFor detailed analysis, try asking about: rent, vacant rooms, maintenance, income, or due payments. I'll give you specific data from your 6 properties!`;
  };

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMsgs(m=>[...m,{role:'user',text:userMsg}]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      setMsgs(m=>[...m,{role:'bot',text:getReply(userMsg)}]);
      setThinking(false);
    }, 900);
  };

  const QUICK = ['Rent due?','Vacant rooms','Monthly income','Maintenance status','Tenant list'];

  return (
    <div style={{
      position:'fixed', bottom:24, right:24, width:360, zIndex:400,
      background:'#0A1628', border:'1px solid var(--border-glow)',
      borderRadius:20, boxShadow:'0 0 60px rgba(14,165,233,0.15), 0 24px 48px rgba(0,0,0,0.5)',
      display:'flex', flexDirection:'column', overflow:'hidden',
    }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(90deg,var(--teal),var(--teal-dim))', padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🤖</div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:'#fff', fontFamily:'Space Grotesk' }}>RentEasy AI</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.75)' }}>● Online · Instant answers</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', cursor:'pointer', borderRadius:6, padding:'4px 8px', fontSize:14 }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ height:320, overflowY:'auto', padding:'14px 14px 8px' }}>
        {msgs.map((m,i)=>(
          <div key={i} style={{ marginBottom:12, display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start' }}>
            <div style={{
              maxWidth:'85%',
              background: m.role==='user' ? 'linear-gradient(135deg,var(--teal),var(--teal-dim))' : 'rgba(255,255,255,0.05)',
              border: m.role==='user' ? 'none' : '1px solid var(--border)',
              borderRadius: m.role==='user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding:'10px 14px', fontSize:12, lineHeight:1.6, color:'#fff',
              whiteSpace:'pre-line',
            }}>{m.text}</div>
          </div>
        ))}
        {thinking && (
          <div style={{ display:'flex', gap:6, padding:'8px 14px', marginBottom:8 }}>
            {[0,1,2].map(i=><div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'var(--teal)', animation:`pulse 1.2s ${i*0.3}s infinite` }} />)}
          </div>
        )}
        <style>{`@keyframes pulse{0%,80%,100%{opacity:0.3}40%{opacity:1}}`}</style>
      </div>

      {/* Quick prompts */}
      <div style={{ padding:'0 12px 8px', display:'flex', gap:5, flexWrap:'wrap' }}>
        {QUICK.map(q=>(
          <button key={q} onClick={()=>{setInput(q);setTimeout(()=>document.getElementById('chat-input')?.focus(),50);}}
            style={{ fontSize:10, background:'rgba(14,165,233,0.08)', border:'1px solid var(--border)', borderRadius:10, padding:'3px 8px', color:'var(--teal)', cursor:'pointer', fontFamily:'inherit' }}>{q}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding:'8px 12px 14px', display:'flex', gap:8 }}>
        <input id="chat-input" type="text" placeholder="Ask anything about your properties…" value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&send()}
          style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 12px', fontSize:12, color:'#fff', outline:'none', fontFamily:'inherit' }} />
        <button onClick={send} style={{ background:'var(--teal)', border:'none', borderRadius:10, padding:'8px 14px', color:'#fff', cursor:'pointer', fontWeight:600, fontSize:13, fontFamily:'inherit', boxShadow:'0 0 12px var(--teal-glow)' }}>→</button>
      </div>
    </div>
  );
}
