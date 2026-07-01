// src/components/PaymentModal.js
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fmtFull } from './UI';
import { PAYMENT_METHODS } from '../data/mockData';

export default function PaymentModal({ propId, tenant }) {
  const { setModal, recordPayment, notify, properties } = useApp();
  const [method, setMethod]   = useState('UPI');
  const [upiId, setUpiId]     = useState('');
  const [cardNo, setCardNo]   = useState('');
  const [expiry, setExpiry]   = useState('');
  const [cvv, setCvv]         = useState('');
  const [bank, setBank]       = useState('SBI');
  const [processing, setProcessing] = useState(false);

  // figure out property & tenant
  const prop = propId ? properties.find(p => p.id === propId) : null;
  const selectedTenant = tenant || (prop?.tenants?.[0]) || null;
  const amount = selectedTenant?.rent || 18500;

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      if (prop && selectedTenant) {
        recordPayment(prop.id, { tenantId: selectedTenant.id, tenant: selectedTenant.name, unit: selectedTenant.unit, amount, method, status:'Paid' });
      }
      setProcessing(false);
      setModal(null);
    }, 1800);
  };

  const ICONS = { UPI:'📱', 'Credit Card':'💳', 'Debit Card':'💰', 'Net Banking':'🏦', NEFT:'🏛' };

  return (
    <div className="modal-overlay" onClick={() => setModal(null)}>
      <div className="modal" style={{ maxWidth:480 }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setModal(null)}>✕</button>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <div style={{ fontSize:28 }}>💳</div>
            <div>
              <h3 style={{ fontFamily:'Space Grotesk', fontSize:18, color:'var(--text-primary)' }}>Pay Rent Online</h3>
              <p style={{ fontSize:12, color:'var(--text-muted)' }}>
                {selectedTenant ? `${selectedTenant.name} · ${selectedTenant.unit}` : 'Select a tenant'}
              </p>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div style={{ background:'linear-gradient(135deg,rgba(14,165,233,0.1),rgba(14,165,233,0.05))', border:'1px solid var(--border-glow)', borderRadius:'var(--r-lg)', padding:'16px 20px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Amount Due</div>
            <div style={{ fontSize:28, fontWeight:700, fontFamily:'Space Grotesk', color:'var(--teal)', marginTop:2 }}>{fmtFull(amount)}</div>
          </div>
          <div style={{ fontSize:11, color:'var(--text-secondary)', textAlign:'right' }}>
            <div>Due: {selectedTenant?.dueDate || '1st'} of month</div>
            <div style={{ marginTop:4, color:'var(--green)' }}>✓ No processing fee</div>
          </div>
        </div>

        {/* Method selection */}
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:10 }}>Payment Method</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6 }}>
            {PAYMENT_METHODS.map(m => (
              <button key={m} onClick={() => setMethod(m)}
                style={{
                  padding:'10px 4px', borderRadius:'var(--r-md)', cursor:'pointer',
                  border:`1px solid ${method===m ? 'var(--teal)' : 'var(--border)'}`,
                  background: method===m ? 'rgba(14,165,233,0.12)' : 'var(--bg-input)',
                  color: method===m ? 'var(--teal)' : 'var(--text-secondary)',
                  textAlign:'center', fontSize:10, fontWeight:500, fontFamily:'inherit',
                  transition:'all 0.15s',
                }}>
                <div style={{ fontSize:18, marginBottom:4 }}>{ICONS[m]||'💳'}</div>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic input */}
        {method === 'UPI' && (
          <div className="field" style={{ marginBottom:16 }}>
            <label>UPI ID</label>
            <input type="text" placeholder="yourname@upi" value={upiId} onChange={e=>setUpiId(e.target.value)} />
          </div>
        )}
        {(method === 'Credit Card' || method === 'Debit Card') && (
          <div style={{ marginBottom:16 }}>
            <div className="field" style={{ marginBottom:10 }}>
              <label>Card Number</label>
              <input type="text" placeholder="XXXX XXXX XXXX XXXX" maxLength={19} value={cardNo} onChange={e=>setCardNo(e.target.value)} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div className="field"><label>Expiry</label><input type="text" placeholder="MM/YY" value={expiry} onChange={e=>setExpiry(e.target.value)} /></div>
              <div className="field"><label>CVV</label><input type="text" placeholder="123" maxLength={4} value={cvv} onChange={e=>setCvv(e.target.value)} /></div>
            </div>
          </div>
        )}
        {method === 'Net Banking' && (
          <div className="field" style={{ marginBottom:16 }}>
            <label>Select Bank</label>
            <select value={bank} onChange={e=>setBank(e.target.value)}>
              {['SBI','HDFC','ICICI','Axis','Kotak','PNB','Bank of Baroda'].map(b=><option key={b}>{b}</option>)}
            </select>
          </div>
        )}

        {/* Summary */}
        <div style={{ background:'rgba(14,165,233,0.04)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:'12px 14px', marginBottom:18 }}>
          {[['Rent amount', fmtFull(amount)],['Processing fee','Free ✓'],['GST','₹0']].map(([k,v])=>(
            <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'3px 0', color:'var(--text-secondary)' }}>
              <span>{k}</span><span style={{ color:k==='Processing fee'?'var(--green)':'var(--text-primary)' }}>{v}</span>
            </div>
          ))}
          <div style={{ borderTop:'1px solid var(--border)', marginTop:8, paddingTop:8, display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:15 }}>
            <span style={{ color:'var(--text-primary)' }}>Total</span>
            <span style={{ color:'var(--teal)' }}>{fmtFull(amount)}</span>
          </div>
        </div>

        <button onClick={handlePay} disabled={processing}
          className="btn btn-teal"
          style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:15, fontWeight:600, opacity:processing?0.7:1 }}>
          {processing ? '⏳ Processing...' : `Pay ${fmtFull(amount)} →`}
        </button>
        <p style={{ fontSize:10, color:'var(--text-muted)', textAlign:'center', marginTop:10 }}>
          🔒 256-bit SSL encryption · Secured by Razorpay
        </p>
      </div>
    </div>
  );
}
