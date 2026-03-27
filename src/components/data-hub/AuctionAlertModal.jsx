import React, { useState } from 'react';
import { useDataHubStore } from '../../store/dataHubStore';

const AuctionAlertModal = ({ isOpen, onClose, initialData = {} }) => {
  const { addAlert, updateAlert } = useDataHubStore();
  const [form, setForm] = useState({
    bank_name: initialData.bank_name || '',
    property_type: initialData.property_type || '',
    min_price: initialData.min_price || '',
    max_price: initialData.max_price || '',
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        bank_name: form.bank_name || null,
        property_type: form.property_type || null,
        min_price: form.min_price ? Number(form.min_price) : null,
        max_price: form.max_price ? Number(form.max_price) : null,
      };
      if (initialData.id) {
        await updateAlert(initialData.id, data);
      } else {
        await addAlert(data);
      }
      onClose();
    } catch (e) {
      console.error('Failed to save alert', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: 400, maxWidth: '90vw' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 18 }}>{initialData.id ? 'Edit Alert' : 'Set Auction Alert'}</h3>
        {[
          { label: 'Bank Name (optional)', key: 'bank_name', type: 'text', placeholder: 'e.g. SBI' },
          { label: 'Property Type (optional)', key: 'property_type', type: 'text', placeholder: 'e.g. residential' },
          { label: 'Min Price (₹)', key: 'min_price', type: 'number', placeholder: '0' },
          { label: 'Max Price (₹)', key: 'max_price', type: 'number', placeholder: '10000000' },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: '#374151' }}>{label}</label>
            <input
              type={type} value={form[key]} placeholder={placeholder}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            {saving ? 'Saving...' : 'Save Alert'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuctionAlertModal;
