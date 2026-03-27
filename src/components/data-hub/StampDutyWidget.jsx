import React, { useState } from 'react';
import { dataHubService } from '../../services/dataHubService';

const fmt = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

const StampDutyWidget = () => {
  const [form, setForm] = useState({ property_value: '', buyer_type: 'male', sector: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!form.property_value) return;
    setLoading(true);
    try {
      const data = await dataHubService.calculateStampDuty({
        property_value: Number(form.property_value),
        buyer_type: form.buyer_type,
        sector: form.sector || undefined,
      });
      setResult(data);
    } catch (e) {
      console.error('Stamp duty calculation failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 15 }}>Stamp Duty Calculator</h4>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <input type="number" placeholder="Property Value (₹)" value={form.property_value}
          onChange={(e) => setForm((f) => ({ ...f, property_value: e.target.value }))}
          style={{ flex: 2, minWidth: 160, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6 }} />
        <select value={form.buyer_type} onChange={(e) => setForm((f) => ({ ...f, buyer_type: e.target.value }))}
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6 }}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="joint">Joint</option>
        </select>
        <button onClick={calculate} disabled={loading || !form.property_value}
          style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          {loading ? '...' : 'Calculate'}
        </button>
      </div>
      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {[
            ['Stamp Duty', `${result.stamp_duty_rate}%`, result.stamp_duty_amount],
            ['Reg. Fee', '1%', result.registration_fee],
            ['Total Cost', '', result.total_cost],
            ['Home Loan Rate', '', result.current_bank_rate ? `${result.current_bank_rate}% p.a.` : null],
          ].map(([label, rate, val]) => val ? (
            <div key={label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: 10 }}>
              <span style={{ fontSize: 11, color: '#6b7280' }}>{label}{rate ? ` (${rate})` : ''}</span>
              <p style={{ margin: 0, fontWeight: 700 }}>{typeof val === 'string' ? val : fmt(val)}</p>
            </div>
          ) : null)}
        </div>
      )}
    </div>
  );
};

export default StampDutyWidget;
