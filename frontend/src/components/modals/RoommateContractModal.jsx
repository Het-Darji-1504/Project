'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RoommateContractAPI } from '../../services/api';

export default function RoommateContractModal() {
  const { isRoommateContractModalOpen, setIsRoommateContractModalOpen, currentUser, showToast } = useApp();

  const [contracts, setContracts] = useState([]);
  const [activeView, setActiveView] = useState('generator'); // 'generator' | 'active'
  const [loading, setLoading] = useState(false);

  const residentName = currentUser?.fullName || 'Resident';

  // Form State
  const [roommateName, setRoommateName] = useState('Aarav Sharma');
  const [rentSplitA, setRentSplitA] = useState(50);
  const [quietHours, setQuietHours] = useState('11:00 PM – 7:00 AM (Weekdays)');
  const [choresSchedule, setChoresSchedule] = useState('Alternating weekly kitchen and washroom cleaning');
  const [guestPolicy, setGuestPolicy] = useState('Overnight guests allowed with 24h advance WhatsApp notification');
  const [utilities, setUtilities] = useState('Torrent Power electricity and 200Mbps Wi-Fi split 50/50 via Nestera');
  const [noticePeriod, setNoticePeriod] = useState('30 Days written notice prior to departure');

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await RoommateContractAPI.getContracts();
      if (res && res.data) {
        setContracts(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isRoommateContractModalOpen) {
      fetchContracts();
    }
  }, [isRoommateContractModalOpen]);

  if (!isRoommateContractModalOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const res = await RoommateContractAPI.generateContract({
        propertyName: 'Sunrise Harmony Heights (Flat 402)',
        roommates: [residentName, roommateName],
        rentSplit: { [residentName]: `${rentSplitA}%`, [roommateName]: `${100 - rentSplitA}%` },
        utilities,
        choresSchedule,
        quietHours,
        guestPolicy
      });
      if (res && res.success) {
        showToast('House Constitution created! Countersignature invite sent.', 'success');
        fetchContracts();
        setActiveView('active');
      }
    } catch (e) {
      showToast('Error generating contract', 'error');
    }
  };

  const handleSign = async (id) => {
    try {
      await RoommateContractAPI.signContract(id, roommateName);
      showToast(`House Constitution verified and signed by ${roommateName}!`, 'success');
      fetchContracts();
    } catch (e) {
      showToast('Error signing document', 'error');
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', zIndex: 1100 }}>
      <div className="modal-container" style={{ maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
              Student Housing Cohabitation Framework
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', margin: '4px 0' }}>
              Roommate Contract Generator
            </h2>
          </div>
          <button
            onClick={() => setIsRoommateContractModalOpen(false)}
            style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--slate-400)' }}
          >
            ×
          </button>
        </div>

        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Draft a transparent, mutual &quot;House Constitution&quot; to prevent roommate misunderstandings over utilities, cleaning rotations, quiet study hours, and overnight visitors.
        </p>

        {/* View Switcher */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1.5px solid var(--slate-200)', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveView('generator')}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: activeView === 'generator' ? 'var(--primary-600)' : 'var(--slate-500)',
              borderBottom: activeView === 'generator' ? '3px solid var(--primary-600)' : 'none',
              cursor: 'pointer'
            }}
          >
            📝 Generate House Constitution
          </button>
          <button
            onClick={() => setActiveView('active')}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: activeView === 'active' ? 'var(--primary-600)' : 'var(--slate-500)',
              borderBottom: activeView === 'active' ? '3px solid var(--primary-600)' : 'none',
              cursor: 'pointer'
            }}
          >
            📜 Active Cohabitation Agreements ({contracts.length})
          </button>
        </div>

        {activeView === 'generator' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '24px' }}>
            {/* Guided Questionnaire Form */}
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                  Roommate Name / Co-Signer
                </label>
                <input
                  type="text"
                  required
                  value={roommateName}
                  onChange={e => setRoommateName(e.target.value)}
                  className="search-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                    Rent Split: You ({rentSplitA}%) | Roommate ({100 - rentSplitA}%)
                  </label>
                </div>
                <input
                  type="range"
                  min="30"
                  max="70"
                  value={rentSplitA}
                  onChange={e => setRentSplitA(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary-600)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                  Quiet Study & Sleeping Hours
                </label>
                <select
                  value={quietHours}
                  onChange={e => setQuietHours(e.target.value)}
                  className="filter-select"
                  style={{ width: '100%' }}
                >
                  <option value="11:00 PM – 7:00 AM (Weekdays)">11:00 PM – 7:00 AM (Weekdays)</option>
                  <option value="10:00 PM – 6:00 AM (Strict Study Zone)">10:00 PM – 6:00 AM (Strict Study Zone)</option>
                  <option value="12:00 AM – 8:00 AM (Night Owl Friendly)">12:00 AM – 8:00 AM (Night Owl Friendly)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                  Chores & Cleaning Rotation
                </label>
                <input
                  type="text"
                  value={choresSchedule}
                  onChange={e => setChoresSchedule(e.target.value)}
                  className="search-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                  Overnight Guest Policy
                </label>
                <input
                  type="text"
                  value={guestPolicy}
                  onChange={e => setGuestPolicy(e.target.value)}
                  className="search-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                  Shared Utilities (Electricity, Wi-Fi, LPG)
                </label>
                <input
                  type="text"
                  value={utilities}
                  onChange={e => setUtilities(e.target.value)}
                  className="search-input"
                  style={{ width: '100%' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '6px' }}>
                Generate & Request Countersignatures →
              </button>
            </form>

            {/* Live Document Preview */}
            <div style={{
              background: '#FAFBFD',
              border: '1.5px solid var(--slate-200)',
              borderRadius: '16px',
              padding: '24px',
              fontFamily: 'monospace',
              fontSize: '0.82rem',
              lineHeight: 1.6,
              color: 'var(--slate-800)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ borderBottom: '1px solid var(--slate-300)', paddingBottom: '8px', marginBottom: '12px', fontWeight: 800, textAlign: 'center' }}>
                  HOUSE CONSTITUTION v1.0 (PROVISIONAL)
                </div>
                <p><strong>Property:</strong> Sunrise Harmony Heights (Flat 402)</p>
                <p><strong>Parties:</strong> {residentName} &amp; {roommateName}</p>
                <p><strong>1. Rent Allocation:</strong> ₹8,250 ({rentSplitA}%) / ₹8,250 ({100 - rentSplitA}%) due on 5th of each calendar month.</p>
                <p><strong>2. Utility Protocol:</strong> {utilities}.</p>
                <p><strong>3. Cleaning Roster:</strong> {choresSchedule}.</p>
                <p><strong>4. Study &amp; Quiet Hours:</strong> {quietHours}.</p>
                <p><strong>5. Visitors &amp; Guests:</strong> {guestPolicy}.</p>
                <p><strong>6. Departure Notice:</strong> {noticePeriod}.</p>
              </div>

              <div style={{ borderTop: '1px dashed var(--slate-300)', paddingTop: '12px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: 'var(--emerald-600)', fontWeight: 800 }}>✓ {residentName} (Signed)</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Aadhaar Stamped</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--amber-600)', fontWeight: 800 }}>⏳ {roommateName}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Invite Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {contracts.map(c => (
              <div
                key={c.id}
                style={{
                  border: '1.5px solid var(--slate-200)',
                  borderRadius: '16px',
                  padding: '20px',
                  background: 'var(--white)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                        {c.propertyName || c.property_name}
                      </h4>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: c.status === 'active' ? '#DCFCE7' : '#FEF3C7',
                        color: c.status === 'active' ? '#166534' : '#92400E'
                      }}>
                        {c.status === 'active' ? '✓ ACTIVE & BINDING' : '⏳ PENDING SIGNATURES'}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                      Roommates: {(c.roommates || []).join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => showToast('House Constitution PDF downloaded!', 'success')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                  >
                    📥 Download PDF
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: 'var(--slate-50)', padding: '12px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '14px' }}>
                  <div><strong>Quiet Hours:</strong> {c.quietHours || c.quiet_hours}</div>
                  <div><strong>Cleaning:</strong> {c.choresSchedule || c.chores_schedule}</div>
                  <div><strong>Guests:</strong> {c.guestPolicy || c.guest_policy}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
                    {(c.signatures || []).map((sig, idx) => (
                      <span key={idx} style={{ color: sig.signed ? 'var(--emerald-600)' : 'var(--slate-400)', fontWeight: 600 }}>
                        {sig.signed ? '✓' : '○'} {sig.name} ({sig.signed ? 'Signed' : 'Pending'})
                      </span>
                    ))}
                  </div>

                  {c.status !== 'active' && (
                    <button
                      onClick={() => handleSign(c.id)}
                      className="btn btn-primary"
                      style={{ fontSize: '0.82rem', padding: '6px 16px' }}
                    >
                      E-Sign as Roommate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
