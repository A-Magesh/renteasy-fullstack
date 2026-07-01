// src/pages/PropertiesPage.js
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fmtINR, KPI, ProgressBar, Stars } from '../components/UI';
import { Topbar } from '../components/Layout';

export default function PropertiesPage() {
  const { properties, openProperty, setPage, setAdminSection } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sort, setSort] = useState('name');

  const types = ['All', ...new Set(properties.map(p => p.type))];

  const totalIncome   = properties.reduce((s,p) => s+(p.monthlyIncome||0), 0);
  const totalUnits    = properties.reduce((s,p) => s+(p.totalUnits||0), 0);
  const totalOccupied = properties.reduce((s,p) => s+(p.occupied||0), 0);
  const totalVacant   = properties.reduce((s,p) => s+(p.vacant||0), 0);
  const totalPending  = properties.reduce((s,p) => s+(p.pendingDues||0), 0);
  const totalTenants  = properties.reduce((s,p) => s+(p.tenants?.length||0), 0);
  const occupancyPct  = totalUnits ? Math.round((totalOccupied/totalUnits)*100) : 0;

  const filtered = properties
    .filter(p => (typeFilter==='All'||p.type===typeFilter) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
       p.location.toLowerCase().includes(search.toLowerCase())))
    .sort((a,b) => sort==='income' ? b.monthlyIncome-a.monthlyIncome :
                   sort==='occ' ? b.occupied-a.occupied :
                   a.name.localeCompare(b.name));

  return (
    <div>
      <Topbar title="Portfolio" subtitle={`${properties.length} properties · ${totalOccupied} of ${totalUnits} units occupied`} />

      <div className="page-body">
        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:28 }}>
          <KPI icon="🏢" label="Properties" value={properties.length} color="var(--teal)" />
          <KPI icon="🚪" label="Total units"  value={totalUnits}    color="var(--text-primary)" />
          <KPI icon="✅" label="Occupied"     value={totalOccupied} color="var(--green)" />
          <KPI icon="⬜" label="Vacant"       value={totalVacant}   color="var(--amber)" />
          <KPI icon="💰" label="Monthly income" value={fmtINR(totalIncome)} color="var(--green)" />
          <KPI icon="⚠️" label="Pending dues"  value={fmtINR(totalPending)} color="var(--red)" />
          <KPI icon="👥" label="Active tenants" value={totalTenants} color="var(--purple)" />
          <KPI icon="📈" label="Occupancy"     value={`${occupancyPct}%`} color="var(--teal)" />
        </div>

        {/* Filter bar */}
        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:20, flexWrap:'wrap' }}>
          <input type="text" placeholder="🔍  Search property or location…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{ background:'var(--bg-input)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:'8px 14px', fontSize:13, color:'var(--text-primary)', outline:'none', fontFamily:'inherit', width:240 }} />
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {types.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={typeFilter===t ? 'btn btn-teal btn-sm' : 'btn btn-sm'}>{t}</button>
            ))}
          </div>
          <select value={sort} onChange={e=>setSort(e.target.value)}
            style={{ background:'var(--bg-input)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:'7px 12px', fontSize:12, color:'var(--text-secondary)', outline:'none', fontFamily:'inherit', marginLeft:'auto' }}>
            <option value="name">Sort: Name</option>
            <option value="income">Sort: Income</option>
            <option value="occ">Sort: Occupancy</option>
          </select>
          <button className="btn btn-gold btn-sm" onClick={() => { setPage('admin'); setAdminSection('add-property'); }}>+ Add property</button>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🏚</div>
            <p>No properties match your search.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(310px,1fr))', gap:16 }}>
            {filtered.map((p,i) => {
              const occ = p.totalUnits ? Math.round((p.occupied/p.totalUnits)*100) : 0;
              const expenses = (p.expenses||[]).reduce((s,e)=>s+e.amount,0);
              return (
                <div key={p.id} className="glass" style={{ cursor:'pointer', overflow:'hidden', transition:'all 0.22s', position:'relative' }}
                  onClick={() => openProperty(p.id)}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor='var(--border-glow)';e.currentTarget.style.boxShadow='0 8px 32px rgba(14,165,233,0.12)';}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='none';}}>

                  {/* Top gradient bar */}
                  <div style={{ height:4, background:p.gradient }} />

                  <div style={{ padding:22 }}>
                    {/* Header */}
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ fontSize:38, lineHeight:1 }}>{p.emoji}</div>
                        <div>
                          <h3 style={{ fontFamily:'Space Grotesk', fontSize:15, marginBottom:2 }}>{p.name}</h3>
                          <div style={{ fontSize:11, color:'var(--text-muted)' }}>📍 {p.location}</div>
                          <Stars rating={p.rating||4.5} />
                        </div>
                      </div>
                      <span style={{ background:'rgba(14,165,233,0.08)', border:'1px solid var(--border)', borderRadius:6, padding:'3px 9px', fontSize:10, color:'var(--teal)', fontWeight:600 }}>{p.type}</span>
                    </div>

                    {/* Stats grid */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 }}>
                      {[
                        { v:p.occupied,   l:'Occupied',    c:'var(--green)' },
                        { v:p.vacant,     l:'Vacant',      c:'var(--amber)' },
                        { v:p.maintenance_count, l:'Maint.', c:'var(--red)' },
                      ].map(s=>(
                        <div key={s.l} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 6px', textAlign:'center' }}>
                          <div style={{ fontSize:20, fontWeight:700, color:s.c, fontFamily:'Space Grotesk' }}>{s.v}</div>
                          <div style={{ fontSize:9, color:'var(--text-muted)', marginTop:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.l}</div>
                        </div>
                      ))}
                    </div>

                    {/* Occupancy bar */}
                    <div style={{ marginBottom:16 }}>
                      <ProgressBar pct={occ} color={p.accentColor} />
                      <div style={{ display:'flex', justifyContent:'space-between', marginTop:5, fontSize:10, color:'var(--text-muted)' }}>
                        <span>Occupancy rate</span>
                        <span style={{ color:p.accentColor, fontWeight:600 }}>{occ}%</span>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:16 }}>
                      {(p.amenities||[]).slice(0,4).map(a => (
                        <span key={a} style={{ fontSize:10, background:'rgba(14,165,233,0.06)', border:'1px solid var(--border)', borderRadius:4, padding:'2px 7px', color:'var(--text-secondary)' }}>{a}</span>
                      ))}
                      {(p.amenities||[]).length > 4 && <span style={{ fontSize:10, color:'var(--text-muted)' }}>+{(p.amenities||[]).length-4} more</span>}
                    </div>

                    {/* Footer */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:14, borderTop:'1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize:18, fontWeight:700, color:'var(--green)', fontFamily:'Space Grotesk' }}>{fmtINR(p.monthlyIncome)}<span style={{ fontSize:10, color:'var(--text-muted)', fontWeight:400 }}>/mo</span></div>
                        {expenses>0 && <div style={{ fontSize:10, color:'var(--text-muted)' }}>Expenses: {fmtINR(expenses)}</div>}
                      </div>
                      <button className="btn btn-sm" style={{ color:p.accentColor, borderColor:p.accentColor+'44', background:`${p.accentColor}0D` }}
                        onClick={e => { e.stopPropagation(); openProperty(p.id); }}>
                        Open dashboard →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
