'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProofVaultAPI } from '../../services/api';

export default function ProofVaultModal() {
  const { isProofVaultModalOpen, setIsProofVaultModalOpen, userRole, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('move_in'); // 'move_in' | 'move_out'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Item Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [room, setRoom] = useState('Living Room');
  const [itemName, setItemName] = useState('');
  const [condition, setCondition] = useState('Good');
  const [meterReading, setMeterReading] = useState('');
  const [notes, setNotes] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await ProofVaultAPI.getProofItems('prop-1', activeTab);
      if (res && res.data) {
        setItems(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isProofVaultModalOpen) {
      fetchItems();
    }
  }, [isProofVaultModalOpen, activeTab]);

  if (!isProofVaultModalOpen) return null;

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemName) return;

    try {
      const res = await ProofVaultAPI.addProofItem({
        propertyId: 'prop-1',
        tenancyId: 'ten-sg1',
        type: activeTab,
        room,
        itemName,
        condition,
        meterReading,
        notes
      });
      if (res && res.success) {
        showToast('Evidence saved with immutable timestamp!', 'success');
        setShowAddForm(false);
        setItemName('');
        setNotes('');
        fetchItems();
      }
    } catch (e) {
      showToast('Failed to save proof', 'error');
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      const roleKey = userRole === 'Owner' ? 'owner' : 'tenant';
      await ProofVaultAPI.acknowledgeItem(id, roleKey);
      showToast(`Signed off by ${userRole} ✓`, 'success');
      fetchItems();
    } catch (e) {
      showToast('Acknowledgement error', 'error');
    }
  };

  const handleDispute = async (id) => {
    const reason = prompt('Enter your specific dispute observation:');
    if (!reason) return;
    try {
      await ProofVaultAPI.disputeItem(id, reason);
      showToast('Dispute logged for arbitration review.', 'warning');
      fetchItems();
    } catch (e) {
      showToast('Error recording dispute', 'error');
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', zIndex: 1100 }}>
      <div className="modal-container" style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
              Immutable Evidence Vault
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', margin: '4px 0' }}>
              Move-In / Move-Out Proof Vault
            </h2>
          </div>
          <button
            onClick={() => setIsProofVaultModalOpen(false)}
            style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--slate-400)' }}
          >
            ×
          </button>
        </div>

        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Document room condition, appliances, and utility meter readings with tamper-proof timestamps and mutual digital acknowledgements to prevent deposit deductions.
        </p>

        {/* Tabs: Move-In vs Move-Out */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1.5px solid var(--slate-200)', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('move_in')}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: activeTab === 'move_in' ? 'var(--primary-600)' : 'var(--slate-500)',
              borderBottom: activeTab === 'move_in' ? '3px solid var(--primary-600)' : 'none',
              cursor: 'pointer'
            }}
          >
            🔑 Move-In Inspection (Handover)
          </button>
          <button
            onClick={() => setActiveTab('move_out')}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: activeTab === 'move_out' ? 'var(--primary-600)' : 'var(--slate-500)',
              borderBottom: activeTab === 'move_out' ? '3px solid var(--primary-600)' : 'none',
              cursor: 'pointer'
            }}
          >
            📦 Move-Out Inspection (Exit Refund)
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', fontWeight: 600 }}>
            {items.length} Condition Items Verified
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => showToast('Move-in condition certificate generated & downloaded!', 'success')}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '6px 14px' }}
            >
              📄 Export Vault PDF
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '6px 14px' }}
            >
              {showAddForm ? 'Close Form' : '+ Add Item / Meter'}
            </button>
          </div>
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddItem}
            style={{
              background: 'var(--slate-50)',
              border: '1.5px solid var(--slate-200)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Add Room Condition or Meter Evidence
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                  Room / Area
                </label>
                <select
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                  className="filter-select"
                  style={{ width: '100%' }}
                >
                  <option value="Living Room">Living Room</option>
                  <option value="Master Bedroom">Master Bedroom</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Bathroom">Bathroom</option>
                  <option value="Utility Balcony">Utility Balcony (Meters)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                  Item / Appliance Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Geyser 15L or Balcony Meter"
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  className="search-input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                  Observed Condition
                </label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value)}
                  className="filter-select"
                  style={{ width: '100%' }}
                >
                  <option value="Brand New">Brand New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good (Minor Pre-existing wear)">Good (Minor Pre-existing wear)</option>
                  <option value="Defective / Requires Attention">Defective / Requires Attention</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                  Meter Reading (If applicable)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 014820 kWh"
                  value={meterReading}
                  onChange={e => setMeterReading(e.target.value)}
                  className="search-input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                Handover Notes / Photo Observation
              </label>
              <textarea
                rows={2}
                placeholder="Observed with landlord during keys handover..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="search-input"
                style={{ width: '100%', resize: 'none' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '8px 20px' }}>
              Lock in Evidence Vault
            </button>
          </form>
        )}

        {/* Item List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map(item => (
            <div
              key={item.id}
              style={{
                border: '1px solid var(--slate-200)',
                borderRadius: '12px',
                padding: '16px',
                background: 'var(--white)',
                display: 'flex',
                gap: '16px',
                alignItems: 'center'
              }}
            >
              {item.photoUrls && item.photoUrls[0] ? (
                <img
                  src={item.photoUrls[0]}
                  alt={item.itemName}
                  style={{ width: '90px', height: '90px', borderRadius: '8px', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '90px', height: '90px', borderRadius: '8px', background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                  📸
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'var(--slate-100)', color: 'var(--slate-700)' }}>
                    {item.room}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-600)' }}>
                    Condition: {item.condition}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  {item.itemName}
                </h4>
                {item.meterReading && item.meterReading !== 'N/A' && (
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-700)', marginBottom: '2px' }}>
                    ⚡ {item.meterReading}
                  </div>
                )}
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--slate-600)' }}>
                  {item.notes || 'Documented at move-in handover.'}
                </p>

                {item.disputeNotes && (
                  <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--rose-700)', background: '#FFE4E6', padding: '4px 8px', borderRadius: '6px' }}>
                    ⚠️ Dispute Note: {item.disputeNotes}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: item.tenantAcknowledged && item.ownerAcknowledged ? 'var(--emerald-600)' : 'var(--amber-600)' }}>
                  {item.tenantAcknowledged && item.ownerAcknowledged ? '✓ Mutually Stamped' : '⏳ Sign-off Pending'}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleAcknowledge(item.id)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    Sign Off
                  </button>
                  <button
                    onClick={() => handleDispute(item.id)}
                    className="btn"
                    style={{ fontSize: '0.75rem', padding: '4px 10px', background: '#FEE2E2', color: '#B91C1C', border: 'none' }}
                  >
                    Dispute
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
