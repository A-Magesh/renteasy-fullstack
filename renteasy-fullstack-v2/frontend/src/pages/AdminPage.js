// src/pages/AdminPage.js
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KPI, Badge, SectionHead, Empty, Avatar, fmtINR, fmtFull } from '../components/UI';
import { Topbar } from '../components/Layout';
import { INITIAL_PROPERTIES, MONTHS_LABELS, PROP_TYPES, ROOM_TYPES, MAINTENANCE_CATS } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

function CTip({ active, payload, label }) {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:'#0A1628', border:'1px solid var(--border-glow)', borderRadius:8, padding:'10px 14px', fontSize:12 }}>
      <div style={{ color:'var(--text-muted)', marginBottom:4 }}>{label}</div>
      {payload.map(p=><div key={p.name} style={{ color:p.color||'var(--teal)', fontWeight:600 }}>₹{(p.value||0).toLocaleString('en-IN')}</div>)}
    </div>
  );
}

// ── Overview ─────────────────────────────────────────────────────────────────
function Overview({ notify }) {
  const { properties, auditLog, setAdminSection, setPage } = useApp();
  const totalIncome   = properties.reduce((s,p)=>s+(p.monthlyIncome||0),0);
  const totalUnits    = properties.reduce((s,p)=>s+(p.totalUnits||0),0);
  const totalOccupied = properties.reduce((s,p)=>s+(p.occupied||0),0);
  const totalPending  = properties.reduce((s,p)=>s+(p.pendingDues||0),0);
  const totalExpenses = properties.reduce((s,p)=>s+(p.expenses||[]).reduce((a,e)=>a+e.amount,0),0);
  const totalTenants  = properties.reduce((s,p)=>s+(p.tenants?.length||0),0);

  const combinedRevenue = MONTHS_LABELS.map((m,i) => ({
    month:m,
    total: Math.round(properties.reduce((s,p)=>s+(p.monthlyRevenue?.[i]||0),0)/1000),
  }));

  const propRevenue = properties.map(p => ({
    name: p.name.split(' ')[0],
    value: Math.round((p.monthlyIncome||0)/1000),
    color: p.accentColor,
  }));

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h2 style={{ fontFamily:'Space Grotesk', fontSize:22, marginBottom:4 }}>Portfolio overview</h2>
          <p style={{ color:'var(--text-muted)', fontSize:13 }}>June 2026 · All properties</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-sm" onClick={()=>notify('Report exported!')}>⬇ Export</button>
          <button className="btn btn-gold btn-sm" onClick={()=>setAdminSection('add-property')}>+ Add property</button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:24 }}>
        <KPI icon="🏢" label="Properties"    value={properties.length}       color="var(--teal)" />
        <KPI icon="🚪" label="Total units"   value={totalUnits}              color="var(--text-primary)" />
        <KPI icon="✅" label="Occupied"      value={totalOccupied}           color="var(--green)" />
        <KPI icon="⬜" label="Vacant"        value={totalUnits-totalOccupied} color="var(--amber)" />
        <KPI icon="💰" label="Monthly income" value={fmtINR(totalIncome)}    color="var(--green)" />
        <KPI icon="💸" label="Expenses"      value={fmtINR(totalExpenses)}   color="var(--red)" />
        <KPI icon="📈" label="Net profit"    value={fmtINR(totalIncome-totalExpenses)} color="var(--teal)" />
        <KPI icon="⚠️" label="Pending dues"  value={fmtINR(totalPending)}   color="var(--amber)" />
        <KPI icon="👥" label="Tenants"       value={totalTenants}            color="var(--purple)" />
        <KPI icon="🔧" label="Open maint."   value={properties.reduce((s,p)=>s+(p.maintenance||[]).filter(m=>m.status!=='Completed').length,0)} color="var(--red)" />
        <KPI icon="📋" label="Leases soon"   value={3}                       color="var(--amber)" />
        <KPI icon="⭐" label="Avg rating"    value={'4.6'}                   color="var(--gold)" />
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <div className="glass-sm" style={{ padding:20 }}>
          <h4 style={{ fontFamily:'Space Grotesk', fontSize:13, color:'var(--text-muted)', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.06em' }}>Combined revenue (₹ thousands)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={combinedRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,165,233,0.08)" />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:'#4B6082' }} />
              <YAxis tick={{ fontSize:10, fill:'#4B6082' }} />
              <Tooltip content={<CTip />} />
              <Line type="monotone" dataKey="total" stroke="var(--teal)" strokeWidth={2} dot={{ r:4, fill:'var(--teal)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-sm" style={{ padding:20 }}>
          <h4 style={{ fontFamily:'Space Grotesk', fontSize:13, color:'var(--text-muted)', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.06em' }}>Revenue by property (₹K)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={propRevenue} layout="vertical">
              <XAxis type="number" tick={{ fontSize:9, fill:'#4B6082' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize:10, fill:'#94A3B8' }} width={70} />
              <Tooltip content={<CTip />} />
              <Bar dataKey="value" fill="var(--teal)" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Audit log preview */}
      <div className="glass-sm" style={{ overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontWeight:600, fontSize:13, fontFamily:'Space Grotesk' }}>Recent activity</span>
          <button className="btn btn-ghost btn-sm" onClick={()=>setAdminSection('audit')}>View all →</button>
        </div>
        {auditLog.slice(0,6).map((a,i) => (
          <div key={a.id} style={{ display:'flex', gap:12, padding:'11px 18px', borderBottom:i<5?'1px solid rgba(14,165,233,0.05)':'none', alignItems:'flex-start' }}>
            <span style={{ fontSize:20, flexShrink:0, marginTop:1 }}>{a.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:500 }}>{a.action}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)' }}>{a.detail}</div>
            </div>
            <div style={{ fontSize:11, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{a.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Add Property form ─────────────────────────────────────────────────────────
function AddProperty({ notify }) {
  const { addProperty } = useApp();
  const [form, setForm] = useState({ name:'', type:PROP_TYPES[0], address:'', city:'', pincode:'', floors:'', totalUnits:'', manager:'', managerPhone:'', description:'' });
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const handleSave = () => {
    if (!form.name||!form.address) { notify('Fill in required fields.','error'); return; }
    addProperty(form);
    setForm({ name:'', type:PROP_TYPES[0], address:'', city:'', pincode:'', floors:'', totalUnits:'', manager:'', managerPhone:'', description:'' });
  };
  return (
    <div>
      <h2 style={{ fontFamily:'Space Grotesk', fontSize:22, marginBottom:6 }}>Add new property</h2>
      <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:28 }}>Fill in all details to add the property to your portfolio.</p>
      <div className="form-grid">
        <div className="field"><label>Property name *</label><input type="text" placeholder="e.g. Blue Ridge Apartments" value={form.name} onChange={set('name')} /></div>
        <div className="field"><label>Property type</label><select value={form.type} onChange={set('type')}>{PROP_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
        <div className="field form-full"><label>Full address *</label><input type="text" placeholder="Street, locality, area" value={form.address} onChange={set('address')} /></div>
        <div className="field"><label>City</label><input type="text" placeholder="e.g. Bengaluru" value={form.city} onChange={set('city')} /></div>
        <div className="field"><label>Pincode</label><input type="text" placeholder="560001" maxLength={6} value={form.pincode} onChange={set('pincode')} /></div>
        <div className="field"><label>Number of floors</label><input type="number" placeholder="4" min="1" value={form.floors} onChange={set('floors')} /></div>
        <div className="field"><label>Total units</label><input type="number" placeholder="20" min="1" value={form.totalUnits} onChange={set('totalUnits')} /></div>
        <div className="field"><label>Property manager</label><input type="text" placeholder="Manager's full name" value={form.manager} onChange={set('manager')} /></div>
        <div className="field"><label>Manager phone</label><input type="tel" placeholder="+91 98765 43210" value={form.managerPhone} onChange={set('managerPhone')} /></div>
        <div className="field form-full"><label>Description</label><textarea placeholder="Describe amenities, features, and location highlights…" value={form.description} onChange={set('description')} /></div>
        <div className="field form-full"><label>Amenities (comma-separated)</label><input type="text" placeholder="Parking, Power backup, 24/7 Security, Lift, CCTV" /></div>
      </div>
      <div className="form-actions">
        <button className="btn btn-teal" onClick={handleSave}>Save property</button>
        <button className="btn" onClick={()=>setForm({ name:'', type:PROP_TYPES[0], address:'', city:'', pincode:'', floors:'', totalUnits:'', manager:'', managerPhone:'', description:'' })}>Reset</button>
      </div>
    </div>
  );
}

// ── Add Room form ─────────────────────────────────────────────────────────────
function AddRoom({ notify }) {
  const { properties, addRoom } = useApp();
  const [propId, setPropId] = useState(properties[0]?.id||'');
  const [form, setForm] = useState({ unit:'', type:ROOM_TYPES[0], floor:'', rent:'', deposit:'', area:'', status:'Vacant' });
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const handleSave = () => {
    if (!form.unit) { notify('Enter unit number.','error'); return; }
    addRoom(Number(propId)||propId, { ...form, rent:Number(form.rent), deposit:Number(form.deposit), floor:Number(form.floor), area:Number(form.area) });
    setForm({ unit:'', type:ROOM_TYPES[0], floor:'', rent:'', deposit:'', area:'', status:'Vacant' });
  };
  return (
    <div>
      <h2 style={{ fontFamily:'Space Grotesk', fontSize:22, marginBottom:6 }}>Add room or unit</h2>
      <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:28 }}>Add a room or unit to an existing property.</p>
      <div className="form-grid">
        <div className="field"><label>Property</label><select value={propId} onChange={e=>setPropId(e.target.value)}>{properties.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div className="field"><label>Unit number *</label><input type="text" placeholder="e.g. A-101" value={form.unit} onChange={set('unit')} /></div>
        <div className="field"><label>Room type</label><select value={form.type} onChange={set('type')}>{ROOM_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
        <div className="field"><label>Floor</label><input type="number" placeholder="1" min="0" value={form.floor} onChange={set('floor')} /></div>
        <div className="field"><label>Monthly rent (₹)</label><input type="number" placeholder="18500" value={form.rent} onChange={set('rent')} /></div>
        <div className="field"><label>Security deposit (₹)</label><input type="number" placeholder="55500" value={form.deposit} onChange={set('deposit')} /></div>
        <div className="field"><label>Area (sq ft)</label><input type="number" placeholder="850" value={form.area} onChange={set('area')} /></div>
        <div className="field"><label>Status</label><select value={form.status} onChange={set('status')}>{['Vacant','Occupied','Reserved','Under Maintenance','Cleaning'].map(s=><option key={s}>{s}</option>)}</select></div>
        <div className="field form-full"><label>Amenities</label><input type="text" placeholder="Parking, Attached bath, Balcony, AC" /></div>
      </div>
      <div className="form-actions">
        <button className="btn btn-teal" onClick={handleSave}>Save room</button>
        <button className="btn" onClick={()=>setForm({ unit:'', type:ROOM_TYPES[0], floor:'', rent:'', deposit:'', area:'', status:'Vacant' })}>Reset</button>
      </div>
    </div>
  );
}

// ── Add Tenant form ───────────────────────────────────────────────────────────
function AddTenant({ notify }) {
  const { properties, addTenant } = useApp();
  const [propId, setPropId] = useState(properties[0]?.id||'');
  const [form, setForm] = useState({ name:'', phone:'', email:'', aadhaar:'', pan:'', unit:'', leaseStart:'', leaseEnd:'', rent:'', deposit:'', dueDate:'1st' });
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const prop = properties.find(p=>p.id===Number(propId)||p.id===propId);
  const vacantRooms = (prop?.rooms||[]).filter(r=>r.status==='Vacant');

  const handleSave = () => {
    if (!form.name||!form.phone) { notify('Fill required fields.','error'); return; }
    addTenant(Number(propId)||propId, { ...form, rent:Number(form.rent), deposit:Number(form.deposit) });
    setForm({ name:'', phone:'', email:'', aadhaar:'', pan:'', unit:'', leaseStart:'', leaseEnd:'', rent:'', deposit:'', dueDate:'1st' });
  };

  return (
    <div>
      <h2 style={{ fontFamily:'Space Grotesk', fontSize:22, marginBottom:6 }}>Add new tenant</h2>
      <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:28 }}>Onboard a tenant and auto-generate their rental agreement.</p>
      <div className="form-grid">
        <div className="field"><label>Full name *</label><input type="text" placeholder="Tenant's full name" value={form.name} onChange={set('name')} /></div>
        <div className="field"><label>Phone *</label><input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} /></div>
        <div className="field"><label>Email</label><input type="email" placeholder="tenant@email.com" value={form.email} onChange={set('email')} /></div>
        <div className="field"><label>Aadhaar number</label><input type="text" placeholder="XXXX XXXX XXXX" maxLength={14} value={form.aadhaar} onChange={set('aadhaar')} /></div>
        <div className="field"><label>PAN number</label><input type="text" placeholder="ABCDE1234F" maxLength={10} value={form.pan} onChange={set('pan')} /></div>
        <div className="field"><label>Occupation</label><input type="text" placeholder="Software Engineer, Business owner…" /></div>
        <div className="field"><label>Property</label><select value={propId} onChange={e=>setPropId(e.target.value)}>{properties.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div className="field"><label>Assign unit</label>
          <select value={form.unit} onChange={set('unit')}>
            <option value="">— Select unit —</option>
            {vacantRooms.map(r=><option key={r.id} value={r.unit}>{r.unit} · {r.type} · {fmtFull(r.rent)}/mo</option>)}
          </select>
        </div>
        <div className="field"><label>Lease start *</label><input type="date" value={form.leaseStart} onChange={set('leaseStart')} /></div>
        <div className="field"><label>Lease end *</label><input type="date" value={form.leaseEnd} onChange={set('leaseEnd')} /></div>
        <div className="field"><label>Monthly rent (₹)</label><input type="number" placeholder="18500" value={form.rent} onChange={set('rent')} /></div>
        <div className="field"><label>Security deposit (₹)</label><input type="number" placeholder="55500" value={form.deposit} onChange={set('deposit')} /></div>
        <div className="field"><label>Due date</label><select value={form.dueDate} onChange={set('dueDate')}>{['1st','3rd','5th','10th','15th'].map(d=><option key={d} value={d}>{d} of month</option>)}</select></div>
        <div className="field"><label>Emergency contact</label><input type="text" placeholder="Name & phone" /></div>
        <div className="field form-full"><label>Notes</label><textarea placeholder="Special requirements, notes, or agreements…" /></div>
      </div>
      <div style={{ background:'rgba(14,165,233,0.06)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:'12px 16px', marginTop:16, fontSize:12, color:'var(--teal)' }}>
        💡 A PDF rental agreement will be auto-generated and sent to the tenant's email after saving.
      </div>
      <div className="form-actions">
        <button className="btn btn-teal" onClick={handleSave}>Save & generate agreement</button>
        <button className="btn">Reset</button>
      </div>
    </div>
  );
}

// ── Expenses section ──────────────────────────────────────────────────────────
function Expenses({ notify }) {
  const { properties } = useApp();
  const all = properties.flatMap(p=>(p.expenses||[]).map(e=>({...e, property:p.name})));
  const totalIncome   = properties.reduce((s,p)=>s+(p.monthlyIncome||0),0);
  const totalExpenses = all.reduce((s,e)=>s+e.amount,0);
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div><h2 style={{ fontFamily:'Space Grotesk', fontSize:22, marginBottom:4 }}>Expense tracking</h2><p style={{ color:'var(--text-muted)', fontSize:13 }}>All properties · June 2026</p></div>
        <button className="btn btn-gold btn-sm" onClick={()=>notify('Expense form opened!')}>+ Add expense</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:24 }}>
        <KPI icon="💰" label="Total income"   value={fmtINR(totalIncome)}   color="var(--green)" />
        <KPI icon="💸" label="Total expenses" value={fmtINR(totalExpenses)} color="var(--red)" />
        <KPI icon="📈" label="Net profit"     value={fmtINR(totalIncome-totalExpenses)} color="var(--teal)" />
        <KPI icon="%" label="Profit margin"   value={`${totalIncome?Math.round(((totalIncome-totalExpenses)/totalIncome)*100):0}%`} color="var(--teal)" />
      </div>
      <div className="glass-sm" style={{ overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontWeight:600, fontSize:13, fontFamily:'Space Grotesk' }}>All expenses</span>
          <button className="btn btn-sm" onClick={()=>notify('Exported!')}>⬇ Export</button>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="tbl">
            <thead><tr><th>Date</th><th>Property</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
            <tbody>
              {all.sort((a,b)=>new Date(b.date)-new Date(a.date)).map((e,i)=>(
                <tr key={i}>
                  <td style={{ color:'var(--text-muted)' }}>{e.date}</td>
                  <td style={{ fontWeight:500 }}>{e.property}</td>
                  <td><span style={{ fontSize:11, background:'rgba(14,165,233,0.08)', border:'1px solid var(--border)', borderRadius:4, padding:'2px 8px', color:'var(--teal)' }}>{e.category}</span></td>
                  <td style={{ color:'var(--text-secondary)' }}>{e.description}</td>
                  <td style={{ fontWeight:600, color:'var(--red)' }}>{fmtFull(e.amount)}</td>
                </tr>
              ))}
              <tr style={{ background:'rgba(14,165,233,0.04)', fontWeight:700 }}>
                <td colSpan={4} style={{ textAlign:'right', color:'var(--text-secondary)' }}>Total</td>
                <td style={{ color:'var(--red)' }}>{fmtFull(totalExpenses)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Reports section ───────────────────────────────────────────────────────────
function Reports({ notify }) {
  const REPORTS = [
    { icon:'📊', title:'Monthly income report',   desc:'Rent collected by property, month-wise' },
    { icon:'📅', title:'Annual income report',    desc:'Full year revenue and income summary' },
    { icon:'🏠', title:'Occupancy report',        desc:'Vacant vs occupied across all properties' },
    { icon:'👥', title:'Tenant report',           desc:'Active and past tenants with lease details' },
    { icon:'⚠️', title:'Pending dues report',     desc:'Overdue payments and defaulting tenants' },
    { icon:'💸', title:'Expense report',          desc:'All expenses by property and category' },
    { icon:'🔧', title:'Maintenance report',      desc:'Open, in-progress, and completed requests' },
    { icon:'📋', title:'Lease expiry report',     desc:'Leases expiring in 30/60/90 days' },
  ];
  return (
    <div>
      <h2 style={{ fontFamily:'Space Grotesk', fontSize:22, marginBottom:6 }}>Reports</h2>
      <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:28 }}>Generate and export detailed reports for your portfolio.</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:14 }}>
        {REPORTS.map(r => (
          <div key={r.title} className="glass-sm" style={{ padding:20, cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border-glow)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';}}>
            <div style={{ fontSize:28, marginBottom:10 }}>{r.icon}</div>
            <h4 style={{ fontFamily:'Space Grotesk', fontSize:13, marginBottom:5 }}>{r.title}</h4>
            <p style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.5, marginBottom:14 }}>{r.desc}</p>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-sm" style={{ background:'rgba(14,165,233,0.1)', color:'var(--teal)', borderColor:'var(--teal)44', fontSize:10 }} onClick={()=>notify(`${r.title} (PDF)`)}>⬇ PDF</button>
              <button className="btn btn-sm" style={{ background:'rgba(16,185,129,0.1)', color:'var(--green)', borderColor:'var(--green)44', fontSize:10 }} onClick={()=>notify(`${r.title} (Excel)`)}>⬇ Excel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Reminders section ─────────────────────────────────────────────────────────
function Reminders({ notify }) {
  const { properties } = useApp();
  const tenants = properties.flatMap(p=>(p.tenants||[]).map(t=>({...t,propertyName:p.name})));
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(true);
  const [wa, setWa] = useState(false);

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div><h2 style={{ fontFamily:'Space Grotesk', fontSize:22, marginBottom:4 }}>Rent reminders</h2><p style={{ color:'var(--text-muted)', fontSize:13 }}>Upcoming due dates and notification settings</p></div>
        <button className="btn btn-teal btn-sm" onClick={()=>notify('Reminders sent to all tenants!')}>Send all reminders</button>
      </div>

      <div className="glass-sm" style={{ overflow:'hidden', marginBottom:20 }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)' }}>
          <span style={{ fontWeight:600, fontSize:13, fontFamily:'Space Grotesk' }}>Upcoming due dates</span>
        </div>
        {tenants.slice(0,8).map((t,i)=>(
          <div key={t.id} style={{ display:'flex', gap:12, alignItems:'center', padding:'12px 18px', borderBottom:i<7?'1px solid rgba(14,165,233,0.05)':'none', flexWrap:'wrap' }}>
            <div style={{ width:38, height:38, borderRadius:8, flexShrink:0, background:i===0?'rgba(239,68,68,0.1)':'rgba(245,158,11,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:i===0?'var(--red)':'var(--amber)' }}>{i+1}d</div>
            <Avatar name={t.name} size={32} idx={i} />
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:500, fontSize:13 }}>{t.name}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)' }}>{t.propertyName} · {t.unit} · Due {t.dueDate}</div>
            </div>
            <span style={{ fontWeight:700, color:'var(--green)' }}>{fmtFull(t.rent)}</span>
            <button className="btn btn-sm btn-teal" onClick={()=>notify(`Reminder sent to ${t.name}!`)}>📲 Remind</button>
          </div>
        ))}
      </div>

      <div className="glass-sm" style={{ padding:20 }}>
        <h4 style={{ fontFamily:'Space Grotesk', fontSize:13, marginBottom:16 }}>Notification settings</h4>
        <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
          {['7 days before due date','3 days before due date','On the due date','1 day after due date','Weekly summary to manager'].map(s=>(
            <label key={s} style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, cursor:'pointer', color:'var(--text-secondary)' }}>
              <input type="checkbox" defaultChecked style={{ width:16, height:16, cursor:'pointer', accentColor:'var(--teal)' }} /> {s}
            </label>
          ))}
        </div>
        <div style={{ borderTop:'1px solid var(--border)', paddingTop:16 }}>
          <p style={{ fontSize:12, fontWeight:600, marginBottom:12, color:'var(--text-secondary)' }}>Delivery channels</p>
          <div style={{ display:'flex', gap:20 }}>
            {[['📧 Email',email,setEmail],['💬 SMS',sms,setSms],['📱 WhatsApp',wa,setWa]].map(([l,v,s])=>(
              <label key={l} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer', color:'var(--text-secondary)' }}>
                <input type="checkbox" checked={v} onChange={e=>s(e.target.checked)} style={{ width:16, height:16, cursor:'pointer', accentColor:'var(--teal)' }} /> {l}
              </label>
            ))}
          </div>
        </div>
        <button className="btn btn-teal btn-sm" style={{ marginTop:16 }} onClick={()=>notify('Settings saved!')}>Save settings</button>
      </div>
    </div>
  );
}

// ── Audit Log ────────────────────────────────────────────────────────────────
function AuditLog() {
  const { auditLog } = useApp();
  const [filter, setFilter] = useState('All');
  const types = ['All','payment','tenant','maintenance','lease','property','expense','reminder','document'];
  const filtered = auditLog.filter(a=>filter==='All'||a.type===filter);
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div><h2 style={{ fontFamily:'Space Grotesk', fontSize:22, marginBottom:4 }}>Audit log</h2><p style={{ color:'var(--text-muted)', fontSize:13 }}>Complete history of all actions in your account</p></div>
      </div>
      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
        {types.map(t=>(
          <button key={t} onClick={()=>setFilter(t)} className={filter===t?'btn btn-teal btn-sm':'btn btn-sm'} style={{ fontSize:11, textTransform:'capitalize' }}>{t}</button>
        ))}
      </div>
      <div className="glass-sm" style={{ overflow:'hidden' }}>
        {filtered.length===0 ? <Empty icon="📝" msg="No log entries match this filter." /> :
          filtered.map((a,i)=>(
            <div key={a.id} style={{ display:'flex', gap:14, padding:'12px 20px', borderBottom:i<filtered.length-1?'1px solid rgba(14,165,233,0.05)':'none', alignItems:'flex-start' }}>
              <span style={{ fontSize:22, flexShrink:0, marginTop:1 }}>{a.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{a.action}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{a.detail}</div>
              </div>
              <span style={{ fontSize:10, background:'rgba(14,165,233,0.06)', border:'1px solid var(--border)', borderRadius:4, padding:'2px 8px', color:'var(--teal)', textTransform:'capitalize', flexShrink:0 }}>{a.type}</span>
              <div style={{ fontSize:11, color:'var(--text-muted)', whiteSpace:'nowrap', flexShrink:0 }}>{a.time}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ── Backup ────────────────────────────────────────────────────────────────────
function Backup({ notify }) {
  return (
    <div>
      <h2 style={{ fontFamily:'Space Grotesk', fontSize:22, marginBottom:6 }}>Backup & restore</h2>
      <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:28 }}>Manage database backups and restore points.</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:14 }}>
        {[
          { icon:'📦', title:'Export database',     desc:'Download all data as JSON/CSV backup file.',     action:'Export now',   cls:'btn-teal' },
          { icon:'♻️', title:'Restore backup',      desc:'Restore data from a previously downloaded file.',action:'Choose file', cls:'btn' },
          { icon:'⏰', title:'Scheduled backups',   desc:'Auto-backup: every Sunday 2:00 AM. Last: June 29, 2026.',action:'Configure', cls:'btn' },
          { icon:'☁️', title:'Cloud storage',       desc:'Backups in Google Drive. 3 backups · 7 day retention.',action:'View backups',cls:'btn' },
        ].map(b => (
          <div key={b.title} className="glass-sm" style={{ padding:22 }}>
            <div style={{ fontSize:32, marginBottom:12 }}>{b.icon}</div>
            <h4 style={{ fontFamily:'Space Grotesk', fontSize:13, marginBottom:6 }}>{b.title}</h4>
            <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.55, marginBottom:16 }}>{b.desc}</p>
            <button className={`btn btn-sm ${b.cls}`} onClick={()=>notify(`${b.title} initiated!`)}>{b.action}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── RBAC section ─────────────────────────────────────────────────────────────
function RBAC() {
  const roles = [
    { role:'👨‍💼 Admin', color:'var(--teal)', perms:{ 'Add Property':true,'Add Rooms':true,'View Reports':true,'Pay Rent':false,'Raise Complaint':false,'Manage Tenants':true,'Export Data':true,'Audit Log':true } },
    { role:'🏢 Property Manager', color:'var(--gold)', perms:{ 'Add Property':true,'Add Rooms':true,'View Reports':true,'Pay Rent':false,'Raise Complaint':false,'Manage Tenants':true,'Export Data':false,'Audit Log':false } },
    { role:'👤 Tenant', color:'var(--purple)', perms:{ 'Add Property':false,'Add Rooms':false,'View Reports':false,'Pay Rent':true,'Raise Complaint':true,'Manage Tenants':false,'Export Data':false,'Audit Log':false } },
  ];
  const perms = Object.keys(roles[0].perms);
  return (
    <div>
      <h2 style={{ fontFamily:'Space Grotesk', fontSize:22, marginBottom:6 }}>Role-based access control</h2>
      <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:28 }}>Configure permissions for each user role.</p>
      <div className="glass-sm" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Permission</th>
                {roles.map(r=><th key={r.role} style={{ color:r.color }}>{r.role}</th>)}
              </tr>
            </thead>
            <tbody>
              {perms.map(p=>(
                <tr key={p}>
                  <td style={{ fontWeight:500 }}>{p}</td>
                  {roles.map(r=>(
                    <td key={r.role} style={{ textAlign:'left' }}>
                      {r.perms[p] ? <span style={{ color:'var(--green)', fontSize:18 }}>✅</span> : <span style={{ color:'var(--red)', fontSize:18 }}>❌</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Admin sidebar items ───────────────────────────────────────────────────────
const ADMIN_SECTIONS = [
  { key:'overview',      icon:'📊', label:'Overview' },
  { key:'add-property',  icon:'🏢', label:'Add property' },
  { key:'add-room',      icon:'🚪', label:'Add room' },
  { key:'add-tenant',    icon:'👤', label:'Add tenant' },
  { key:'expenses',      icon:'💸', label:'Expense tracking' },
  { key:'reports',       icon:'📋', label:'Reports' },
  { key:'reminders',     icon:'🔔', label:'Rent reminders' },
  { key:'audit',         icon:'📝', label:'Audit log' },
  { key:'backup',        icon:'💾', label:'Backup & restore' },
  { key:'rbac',          icon:'🔐', label:'Role management' },
];

export default function AdminPage() {
  const { adminSection, setAdminSection, notify } = useApp();

  return (
    <div style={{ display:'flex', minHeight:'calc(100vh - 58px)' }}>
      {/* Admin sub-sidebar */}
      <div style={{ width:210, flexShrink:0, background:'rgba(8,14,28,0.6)', borderRight:'1px solid var(--border)', paddingTop:16 }}>
        <div style={{ padding:'0 14px 10px', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--text-muted)' }}>Admin panel</div>
        {ADMIN_SECTIONS.map(s=>(
          <button key={s.key} className={`nav-item ${adminSection===s.key?'active':''}`} onClick={()=>setAdminSection(s.key)}>
            <span className="nav-icon">{s.icon}</span>{s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
        <Topbar title="Admin panel" subtitle={ADMIN_SECTIONS.find(s=>s.key===adminSection)?.label||''} />
        <div className="page-body">
          {adminSection==='overview'     && <Overview    notify={notify} />}
          {adminSection==='add-property' && <AddProperty notify={notify} />}
          {adminSection==='add-room'     && <AddRoom     notify={notify} />}
          {adminSection==='add-tenant'   && <AddTenant   notify={notify} />}
          {adminSection==='expenses'     && <Expenses    notify={notify} />}
          {adminSection==='reports'      && <Reports     notify={notify} />}
          {adminSection==='reminders'    && <Reminders   notify={notify} />}
          {adminSection==='audit'        && <AuditLog />}
          {adminSection==='backup'       && <Backup      notify={notify} />}
          {adminSection==='rbac'         && <RBAC />}
        </div>
      </div>
    </div>
  );
}
