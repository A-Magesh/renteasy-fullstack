// src/pages/PropertyDetailPage.js
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge, KPI, SectionHead, Empty, Avatar, fmtINR, fmtFull, Stars } from '../components/UI';
import { Topbar } from '../components/Layout';
import { MONTHS_LABELS, MAINTENANCE_CATS, ROOM_STATUSES } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';

const AVATAR_BG = ['#064E3B','#312E81','#7C2D12','#134E4A','#1E3A5F','#4A1942'];

// ── Custom chart tooltip ────────────────────────────────────────────────────
function CTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#0A1628', border:'1px solid var(--border-glow)', borderRadius:8, padding:'10px 14px', fontSize:12 }}>
      <div style={{ color:'var(--text-muted)', marginBottom:4 }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ color:p.color || 'var(--teal)', fontWeight:600 }}>₹{(p.value||0).toLocaleString('en-IN')}</div>)}
    </div>
  );
}

// ── Rooms Tab ────────────────────────────────────────────────────────────────
function RoomsTab({ prop, notify }) {
  const [statusF, setStatusF] = useState('All');
  const rooms = (prop.rooms||[]).filter(r => statusF==='All'||r.status===statusF);

  return (
    <div>
      <SectionHead title={`Rooms & units (${prop.rooms?.length||0} total)`}>
        <div style={{ display:'flex', gap:6 }}>
          {['All',...ROOM_STATUSES].map(s => (
            <button key={s} onClick={() => setStatusF(s)} className={statusF===s?'btn btn-teal btn-sm':'btn btn-sm'} style={{ fontSize:11 }}>{s}</button>
          ))}
        </div>
        <button className="btn btn-gold btn-sm" onClick={() => notify('Add room form opened!')}>+ Add room</button>
      </SectionHead>

      <div className="glass-sm" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                {['Unit','Type','Floor','Area','Status','Tenant','Rent/mo','Deposit','Action'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.length===0 ? (
                <tr><td colSpan={9} style={{ textAlign:'center', padding:'40px 0', color:'var(--text-muted)' }}>No rooms match this filter.</td></tr>
              ) : rooms.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight:600, color:'var(--text-primary)', fontFamily:'Space Grotesk' }}>{r.unit}</td>
                  <td style={{ color:'var(--text-secondary)' }}>{r.type}</td>
                  <td style={{ color:'var(--text-muted)' }}>Floor {r.floor}</td>
                  <td style={{ color:'var(--text-muted)' }}>{r.area} sq ft</td>
                  <td><Badge label={r.status} /></td>
                  <td style={{ color:'var(--text-secondary)' }}>{r.tenant || <span style={{ color:'var(--text-muted)' }}>—</span>}</td>
                  <td style={{ fontWeight:600, color:'var(--green)' }}>{fmtFull(r.rent)}</td>
                  <td style={{ color:'var(--text-secondary)' }}>{fmtFull(r.deposit)}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => notify('Room details opened!')}>View</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => notify('Room updated!')}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Tenants Tab ──────────────────────────────────────────────────────────────
function TenantsTab({ prop, notify, onPayRent }) {
  const [search, setSearch] = useState('');
  const tenants = (prop.tenants||[]).filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) || t.unit.includes(search));

  return (
    <div>
      <SectionHead title={`Tenants (${prop.tenants?.length||0})`}>
        <input type="text" placeholder="Search tenant…" value={search} onChange={e=>setSearch(e.target.value)}
          style={{ background:'var(--bg-input)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:'6px 12px', fontSize:12, color:'var(--text-primary)', outline:'none', fontFamily:'inherit', width:180 }} />
        <button className="btn btn-gold btn-sm" onClick={() => notify('Add tenant form opened!')}>+ Add tenant</button>
      </SectionHead>

      {tenants.length===0 ? <Empty icon="👥" msg="No tenants yet. Add your first tenant." /> :
        tenants.map((t,i) => {
          const daysLeft = Math.round((new Date(t.leaseEnd)-new Date())/86400000);
          const leaseStatus = daysLeft<0?'Expired':daysLeft<30?'Expiring soon':'Active';
          return (
            <div key={t.id} className="glass-sm" style={{ padding:'14px 18px', marginBottom:10, display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
              <Avatar name={t.name} size={42} idx={i} />
              <div style={{ flex:1, minWidth:160 }}>
                <div style={{ fontWeight:600, fontSize:14, fontFamily:'Space Grotesk', marginBottom:2 }}>{t.name}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>Room {t.unit} · 📞 {t.phone} · ✉️ {t.email}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>
                  Lease: {t.leaseStart} → {t.leaseEnd} &nbsp;
                  <Badge label={leaseStatus} />
                </div>
              </div>
              <div style={{ textAlign:'right', minWidth:130 }}>
                <div style={{ fontWeight:700, color:'var(--green)', fontSize:16, fontFamily:'Space Grotesk' }}>{fmtFull(t.rent)}<span style={{ fontSize:10, color:'var(--text-muted)', fontWeight:400 }}>/mo</span></div>
                <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>Deposit: {fmtFull(t.deposit)}</div>
                <div style={{ marginTop:6 }}>
                  <Badge label={t.paidThisMonth ? 'Paid' : 'Pending'} />
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <button className="btn btn-teal btn-sm" onClick={() => onPayRent(t)}>💳 Pay</button>
                <button className="btn btn-sm" onClick={() => notify('Reminder sent to '+t.name)}>🔔 Remind</button>
                <button className="btn btn-sm" onClick={() => notify('Agreement generated!')}>📄 Agreement</button>
              </div>
            </div>
          );
        })
      }
    </div>
  );
}

// ── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab({ prop }) {
  const revData = (prop.monthlyRevenue||[]).map((v,i) => ({ month:MONTHS_LABELS[i], value:v }));
  const expenses = (prop.expenses||[]).reduce((s,e)=>s+e.amount,0);
  const profit   = (prop.monthlyIncome||0) - expenses;
  const pieData  = [
    { name:'Occupied', value:prop.occupied||0, color:'#10B981' },
    { name:'Vacant',   value:prop.vacant||0,   color:'#F59E0B' },
    { name:'Maint.',   value:prop.maintenance_count||0, color:'#EF4444' },
  ].filter(d=>d.value>0);

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:20 }}>
        <KPI icon="💰" label="Monthly income"  value={fmtINR(prop.monthlyIncome)} color="var(--green)" />
        <KPI icon="💸" label="Expenses"        value={fmtINR(expenses)}   color="var(--red)" />
        <KPI icon="📈" label="Net profit"      value={fmtINR(profit)}     color="var(--teal)" />
        <KPI icon="📊" label="Occupancy"       value={`${prop.totalUnits?Math.round((prop.occupied/prop.totalUnits)*100):0}%`} color="var(--teal)" />
        <KPI icon="⚠️" label="Pending dues"    value={fmtINR(prop.pendingDues)} color="var(--amber)" />
        <KPI icon="👥" label="Active tenants"  value={prop.tenants?.length||0} color="var(--purple)" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <div className="glass-sm" style={{ padding:20 }}>
          <h4 style={{ fontFamily:'Space Grotesk', fontSize:13, color:'var(--text-muted)', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.06em' }}>Revenue (6 months)</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revData}>
              <XAxis dataKey="month" tick={{ fontSize:10, fill:'#4B6082' }} />
              <YAxis tick={{ fontSize:10, fill:'#4B6082' }} tickFormatter={v=>`${Math.round(v/1000)}K`} />
              <Tooltip content={<CTip />} />
              <Bar dataKey="value" fill={prop.accentColor||'#0EA5E9'} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-sm" style={{ padding:20 }}>
          <h4 style={{ fontFamily:'Space Grotesk', fontSize:13, color:'var(--text-muted)', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.06em' }}>Unit breakdown</h4>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({name,value})=>`${name}(${value})`} labelLine={false} fontSize={10}>
                {pieData.map((e,i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense table */}
      <div className="glass-sm" style={{ overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h4 style={{ fontFamily:'Space Grotesk', fontSize:13 }}>Expenses — June 2026</h4>
          <button className="btn btn-gold btn-sm" onClick={() => {}}>+ Add expense</button>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="tbl">
            <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
            <tbody>
              {(prop.expenses||[]).length===0 ? (
                <tr><td colSpan={4} style={{ textAlign:'center', padding:24, color:'var(--text-muted)' }}>No expenses recorded.</td></tr>
              ) : (prop.expenses||[]).map(e => (
                <tr key={e.id}>
                  <td style={{ color:'var(--text-muted)' }}>{e.date}</td>
                  <td><span style={{ fontSize:11, background:'rgba(14,165,233,0.08)', border:'1px solid var(--border)', borderRadius:4, padding:'2px 8px', color:'var(--teal)' }}>{e.category}</span></td>
                  <td style={{ color:'var(--text-secondary)' }}>{e.description}</td>
                  <td style={{ fontWeight:600, color:'var(--red)' }}>{fmtFull(e.amount)}</td>
                </tr>
              ))}
              {(prop.expenses||[]).length>0 && (
                <tr style={{ background:'rgba(14,165,233,0.04)' }}>
                  <td colSpan={3} style={{ textAlign:'right', fontWeight:600, color:'var(--text-secondary)' }}>Total expenses</td>
                  <td style={{ fontWeight:700, color:'var(--red)' }}>{fmtFull(expenses)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Maintenance Tab ──────────────────────────────────────────────────────────
function MaintenanceTab({ prop, notify }) {
  const [filter, setFilter] = useState('All');
  const items = (prop.maintenance||[]).filter(m => filter==='All'||m.status===filter);
  const EMOJIS = { Electrical:'⚡', Plumbing:'🚿', 'Wi-Fi':'📶', Cleaning:'🧹', Renovation:'🏗', Other:'🔧' };

  return (
    <div>
      <SectionHead title="Maintenance requests">
        {['All','Pending','In Progress','Completed'].map(s => (
          <button key={s} onClick={()=>setFilter(s)} className={filter===s?'btn btn-teal btn-sm':'btn btn-sm'} style={{ fontSize:11 }}>{s}</button>
        ))}
        <button className="btn btn-gold btn-sm" onClick={()=>notify('Maintenance request opened!')}>+ New request</button>
      </SectionHead>

      {items.length===0 ? <Empty icon="✅" msg="All clear! No maintenance requests." /> :
        items.map(m => (
          <div key={m.id} className="glass-sm" style={{ padding:'14px 18px', marginBottom:10, display:'flex', gap:14, alignItems:'flex-start' }}>
            <div style={{ width:42, height:42, borderRadius:'var(--r-md)', background:'rgba(14,165,233,0.08)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
              {EMOJIS[m.category]||'🔧'}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:14, fontFamily:'Space Grotesk', marginBottom:3 }}>{m.issue}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)' }}>Room {m.room} · {m.tenant} · Reported {m.date}</div>
              <div style={{ display:'flex', gap:6, marginTop:6 }}>
                <Badge label={m.status} />
                <Badge label={m.priority} />
                <span style={{ fontSize:10, background:'rgba(14,165,233,0.06)', border:'1px solid var(--border)', borderRadius:4, padding:'2px 7px', color:'var(--teal)' }}>{m.category}</span>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
              <button className="btn btn-sm" onClick={()=>notify('Status updated!')}>Update</button>
              <button className="btn btn-ghost btn-sm" onClick={()=>notify('Assigned!')}>Assign</button>
            </div>
          </div>
        ))
      }
    </div>
  );
}

// ── Payments Tab ─────────────────────────────────────────────────────────────
function PaymentsTab({ prop, notify, onPayRent }) {
  const paid    = (prop.payments||[]).filter(p=>p.status==='Paid');
  const pending = (prop.payments||[]).filter(p=>p.status!=='Paid');

  return (
    <div>
      <SectionHead title="Payment history">
        <button className="btn btn-teal btn-sm" onClick={()=>onPayRent(null)}>+ Record payment</button>
        <button className="btn btn-sm" onClick={()=>notify('Exported!')}>⬇ Export</button>
      </SectionHead>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:20 }}>
        <KPI icon="✅" label="Collected" value={fmtINR(paid.reduce((s,p)=>s+p.amount,0))} color="var(--green)" />
        <KPI icon="⚠️" label="Pending"   value={fmtINR(pending.reduce((s,p)=>s+p.amount,0))} color="var(--amber)" />
        <KPI icon="📋" label="Paid count" value={paid.length} color="var(--teal)" />
        <KPI icon="⏳" label="Awaiting"   value={pending.length} color="var(--red)" />
      </div>

      <div className="glass-sm" style={{ overflow:'hidden', marginBottom:16 }}>
        <div style={{ overflowX:'auto' }}>
          <table className="tbl">
            <thead><tr><th>Date</th><th>Tenant</th><th>Unit</th><th>Amount</th><th>Method</th><th>Txn ID</th><th>Status</th><th>Receipt</th></tr></thead>
            <tbody>
              {(prop.payments||[]).length===0 ? (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:24, color:'var(--text-muted)' }}>No payments yet.</td></tr>
              ) : (prop.payments||[]).map(p => (
                <tr key={p.id}>
                  <td style={{ color:'var(--text-muted)' }}>{p.date||'—'}</td>
                  <td style={{ fontWeight:500 }}>{p.tenant}</td>
                  <td style={{ color:'var(--text-secondary)' }}>{p.unit}</td>
                  <td style={{ fontWeight:600, color:'var(--green)' }}>{fmtFull(p.amount)}</td>
                  <td style={{ color:'var(--text-secondary)' }}>{p.method||'—'}</td>
                  <td style={{ fontSize:10, fontFamily:'monospace', color:'var(--text-muted)' }}>{p.txnId||'—'}</td>
                  <td><Badge label={p.status} /></td>
                  <td>
                    {p.status==='Paid'
                      ? <button className="btn btn-ghost btn-sm" onClick={()=>notify('Receipt downloaded!')}>⬇ PDF</button>
                      : <button className="btn btn-teal btn-sm" onClick={()=>onPayRent(null)}>Pay</button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR section */}
      <div className="glass-sm" style={{ padding:'16px 20px' }}>
        <div style={{ fontWeight:600, fontSize:13, fontFamily:'Space Grotesk', marginBottom:10 }}>📱 QR Code Payments</div>
        <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:14 }}>Generate a unique QR for each tenant — scan to pay instantly.</p>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {(prop.tenants||[]).slice(0,5).map(t => (
            <button key={t.id} className="btn btn-sm" onClick={()=>notify('QR generated for '+t.name)}>
              🔲 QR · {t.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Documents Tab ────────────────────────────────────────────────────────────
function DocumentsTab({ prop, notify }) {
  const DOC_TYPES = [
    { icon:'📄', name:'Rental agreement', sub:'Auto-generated PDF' },
    { icon:'🪪', name:'Aadhaar card',     sub:'Identity proof' },
    { icon:'🪪', name:'PAN card',         sub:'Tax document' },
    { icon:'🛂', name:'Passport',         sub:'International ID' },
    { icon:'🚗', name:'Driving licence',  sub:'Address proof' },
  ];

  return (
    <div>
      <SectionHead title="Tenant documents">
        <button className="btn btn-gold btn-sm" onClick={()=>notify('Document upload opened!')}>+ Upload document</button>
      </SectionHead>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:20 }}>
        {DOC_TYPES.map((d,i) => (
          <div key={d.name} className="glass-sm" style={{ padding:18, textAlign:'center', cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border-glow)';e.currentTarget.style.background='rgba(14,165,233,0.06)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-glass)';}}
            onClick={()=>notify('Document opened!')}>
            <div style={{ fontSize:36, marginBottom:8 }}>{d.icon}</div>
            <div style={{ fontSize:12, fontWeight:600, marginBottom:3 }}>{d.name}</div>
            <div style={{ fontSize:10, color:'var(--text-muted)' }}>{d.sub}</div>
            <div style={{ marginTop:8 }}><Badge label={i<3?'Verified':'Pending'} /></div>
          </div>
        ))}
        <div className="glass-sm" style={{ padding:18, textAlign:'center', cursor:'pointer', border:'1px dashed var(--border-glow)' }}
          onClick={()=>notify('Upload opened!')}>
          <div style={{ fontSize:36, marginBottom:8, color:'var(--text-muted)' }}>📂</div>
          <div style={{ fontSize:12, color:'var(--text-muted)' }}>Upload new document</div>
        </div>
      </div>

      {/* Lease management */}
      <div className="glass-sm" style={{ overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)' }}>
          <span style={{ fontWeight:600, fontSize:13, fontFamily:'Space Grotesk' }}>Lease management</span>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="tbl">
            <thead><tr><th>Tenant</th><th>Unit</th><th>Start</th><th>End</th><th>Days left</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {(prop.tenants||[]).map(t => {
                const days = Math.round((new Date(t.leaseEnd)-new Date())/86400000);
                const status = days<0?'Expired':days<30?'Expiring soon':'Active';
                return (
                  <tr key={t.id}>
                    <td style={{ fontWeight:500 }}>{t.name}</td>
                    <td style={{ color:'var(--text-secondary)' }}>{t.unit}</td>
                    <td style={{ color:'var(--text-muted)' }}>{t.leaseStart}</td>
                    <td style={{ color:'var(--text-muted)' }}>{t.leaseEnd}</td>
                    <td style={{ fontWeight:600, color:days<30?'var(--red)':'var(--green)' }}>{Math.max(0,days)}d</td>
                    <td><Badge label={status} /></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={()=>notify('Renewal sent!')}>Renew</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Visitors Tab ─────────────────────────────────────────────────────────────
function VisitorsTab({ prop, notify }) {
  return (
    <div>
      <SectionHead title="Visitor management">
        <button className="btn btn-gold btn-sm" onClick={()=>notify('Visitor registered!')}>+ Register visitor</button>
      </SectionHead>
      <div className="glass-sm" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table className="tbl">
            <thead><tr><th>Visitor</th><th>Phone</th><th>Visiting</th><th>Unit</th><th>Check-in</th><th>Check-out</th><th>Purpose</th><th>Status</th></tr></thead>
            <tbody>
              {(prop.visitors||[]).length===0 ? (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:24, color:'var(--text-muted)' }}>No visitors recorded.</td></tr>
              ) : (prop.visitors||[]).map(v => (
                <tr key={v.id}>
                  <td style={{ fontWeight:500 }}>{v.visitorName}</td>
                  <td style={{ color:'var(--text-secondary)' }}>{v.phone}</td>
                  <td style={{ color:'var(--text-secondary)' }}>{v.tenant}</td>
                  <td style={{ color:'var(--text-secondary)' }}>{v.unit}</td>
                  <td style={{ color:'var(--text-muted)', fontSize:12 }}>{v.checkIn}</td>
                  <td style={{ color:'var(--text-muted)', fontSize:12 }}>{v.checkOut}</td>
                  <td style={{ color:'var(--text-secondary)' }}>{v.purpose}</td>
                  <td><Badge label={v.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Feedback Tab ─────────────────────────────────────────────────────────────
function FeedbackTab({ prop, notify }) {
  const cats = ['Cleanliness','Maintenance','Security','Facilities','Overall'];
  const scores = [4.8, 4.2, 4.7, 4.5, 4.6];
  return (
    <div>
      <SectionHead title="Tenant feedback & ratings">
        <button className="btn btn-gold btn-sm" onClick={()=>notify('Feedback form sent!')}>Request feedback</button>
      </SectionHead>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div className="glass-sm" style={{ padding:20 }}>
          <h4 style={{ fontFamily:'Space Grotesk', fontSize:13, color:'var(--text-muted)', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.06em' }}>Ratings breakdown</h4>
          {cats.map((c,i) => (
            <div key={c} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <span style={{ width:90, fontSize:12, color:'var(--text-secondary)' }}>{c}</span>
              <div style={{ flex:1, height:6, background:'rgba(255,255,255,0.06)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${(scores[i]/5)*100}%`, background:prop.gradient, borderRadius:3 }} />
              </div>
              <span style={{ width:30, fontSize:12, fontWeight:600, color:'var(--gold)', textAlign:'right' }}>{scores[i]}</span>
            </div>
          ))}
        </div>
        <div className="glass-sm" style={{ padding:20 }}>
          <h4 style={{ fontFamily:'Space Grotesk', fontSize:13, color:'var(--text-muted)', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.06em' }}>Recent reviews</h4>
          {(prop.tenants||[]).slice(0,3).map((t,i) => (
            <div key={t.id} style={{ marginBottom:14, paddingBottom:14, borderBottom:i<2?'1px solid var(--border)':'' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <Avatar name={t.name} size={28} idx={i} />
                <span style={{ fontSize:12, fontWeight:600 }}>{t.name}</span>
                <span style={{ color:'var(--gold)', fontSize:11 }}>{'★'.repeat(4+i%2)}</span>
              </div>
              <p style={{ fontSize:11, color:'var(--text-secondary)' }}>
                {['Great maintenance response time!','Very clean and well managed property.','Security is excellent, feels very safe.'][i]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const TABS = [
  { key:'rooms',       label:'🚪 Rooms' },
  { key:'tenants',     label:'👥 Tenants' },
  { key:'analytics',   label:'📊 Analytics' },
  { key:'maintenance', label:'🛠 Maintenance' },
  { key:'payments',    label:'💳 Payments' },
  { key:'documents',   label:'📂 Documents' },
  { key:'visitors',    label:'🚶 Visitors' },
  { key:'feedback',    label:'⭐ Feedback' },
];

export default function PropertyDetailPage() {
  const { selectedPropId, properties, setPage, setModal, notify } = useApp();
  const [tab, setTab] = useState('rooms');

  const prop = properties.find(p => p.id === selectedPropId);
  if (!prop) return <div style={{ padding:40, color:'var(--text-muted)' }}>Property not found.</div>;

  const occ = prop.totalUnits ? Math.round((prop.occupied/prop.totalUnits)*100) : 0;

  const openPayment = (tenant) => setModal({ type:'pay', propId:prop.id, tenant });

  return (
    <div>
      <Topbar
        title={prop.name}
        subtitle={`${prop.subtype} · ${prop.location} · ${prop.pincode}`}
      />

      {/* Property hero */}
      <div style={{ background:prop.gradient, padding:'28px 28px 0', position:'relative', overflow:'hidden' }}>
        {/* Subtle texture */}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 100% at 80% 50%, rgba(0,0,0,0.3) 0%, transparent 70%)' }} />

        <div style={{ position:'relative', zIndex:1 }}>
          <button className="btn btn-sm" style={{ background:'rgba(0,0,0,0.25)', border:'1px solid rgba(255,255,255,0.15)', color:'#fff', marginBottom:16 }}
            onClick={() => setPage('properties')}>← Back to portfolio</button>

          <div style={{ display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap', marginBottom:20 }}>
            <div style={{ fontSize:56 }}>{prop.emoji}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:6 }}>
                <h2 style={{ fontFamily:'Space Grotesk', fontSize:26, fontWeight:700, color:'#fff' }}>{prop.name}</h2>
                <span style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:6, padding:'3px 10px', fontSize:11, color:'#fff', fontWeight:600 }}>{prop.type}</span>
              </div>
              <p style={{ color:'rgba(255,255,255,0.75)', fontSize:13, marginBottom:8 }}>📍 {prop.location} &nbsp;·&nbsp; {prop.floors} floors &nbsp;·&nbsp; {prop.totalUnits} units &nbsp;·&nbsp; Manager: {prop.manager}</p>
              <p style={{ color:'rgba(255,255,255,0.65)', fontSize:12, maxWidth:500, lineHeight:1.55, marginBottom:10 }}>{prop.description}</p>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {(prop.amenities||[]).map(a => (
                  <span key={a} style={{ background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:4, padding:'2px 9px', fontSize:10, color:'rgba(255,255,255,0.85)' }}>{a}</span>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:8, flexShrink:0 }}>
              <button className="btn btn-sm" style={{ background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff' }} onClick={()=>notify('Report generated!')}>📊 Report</button>
              <button className="btn btn-sm" style={{ background:'rgba(0,0,0,0.25)', border:'1px solid rgba(255,255,255,0.15)', color:'#fff' }} onClick={()=>openPayment(null)}>💳 Collect rent</button>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:0, paddingBottom:20 }}>
            {[
              { v:prop.occupied,          l:'Occupied',       c:'rgba(16,185,129,0.9)' },
              { v:prop.vacant,            l:'Vacant',         c:'rgba(245,158,11,0.9)' },
              { v:prop.maintenance_count, l:'Maintenance',    c:'rgba(239,68,68,0.9)' },
              { v:fmtINR(prop.monthlyIncome), l:'Monthly income',c:'rgba(255,255,255,0.9)' },
              { v:`${occ}%`,              l:'Occupancy',      c:'rgba(14,165,233,0.9)' },
            ].map(s => (
              <div key={s.l} style={{ background:'rgba(0,0,0,0.2)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'10px 16px', textAlign:'center', minWidth:90 }}>
                <div style={{ fontSize:18, fontWeight:700, color:s.c, fontFamily:'Space Grotesk' }}>{s.v}</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.5)', marginTop:3, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:'var(--bg-deep)', borderBottom:'1px solid var(--border)', padding:'12px 28px' }}>
        <div className="tabs" style={{ width:'fit-content', maxWidth:'100%' }}>
          {TABS.map(t => (
            <button key={t.key} className={`tab-btn ${tab===t.key?'active':''}`} onClick={()=>setTab(t.key)}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="page-body">
        {tab==='rooms'       && <RoomsTab       prop={prop} notify={notify} />}
        {tab==='tenants'     && <TenantsTab     prop={prop} notify={notify} onPayRent={openPayment} />}
        {tab==='analytics'   && <AnalyticsTab   prop={prop} />}
        {tab==='maintenance' && <MaintenanceTab prop={prop} notify={notify} />}
        {tab==='payments'    && <PaymentsTab    prop={prop} notify={notify} onPayRent={openPayment} />}
        {tab==='documents'   && <DocumentsTab   prop={prop} notify={notify} />}
        {tab==='visitors'    && <VisitorsTab    prop={prop} notify={notify} />}
        {tab==='feedback'    && <FeedbackTab    prop={prop} notify={notify} />}
      </div>
    </div>
  );
}
