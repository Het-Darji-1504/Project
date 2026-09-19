'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';

export default function RoommateModal() {
  const {
    selectedRoommate,
    isRoommateModalOpen,
    closeRoommateProfile,
    triggerMatchCelebration,
    getProfileAvatar
  } = useApp();

  if (!isRoommateModalOpen || !selectedRoommate) return null;

  const r = selectedRoommate;

  return (
    <div className="modal-overlay open" onClick={closeRoommateProfile}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div>
            <span className="badge badge-emerald">Verified Profile</span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '4px' }}>
              {r.name}, {r.age}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {r.role} • {r.institution}
            </p>
          </div>
          <button className="modal-close-btn" onClick={closeRoommateProfile}>✕</button>
        </div>

        <div className="modal-body-scroll">
          {/* Avatar & Header */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
            <img
              src={getProfileAvatar ? getProfileAvatar(r) : r.avatar}
              alt={r.name}
              style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }}
            />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                ⚡ {r.compatibility}% Lifestyle Compatibility
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                Budget: <strong>{r.budget}</strong> • Move-in: <strong>{r.moveInDate}</strong>
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                Preferred: {r.preferredLocations?.join(', ')}
              </p>
            </div>
          </div>

          {/* About */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>About Me</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              "{r.about}"
            </p>
          </div>

          {/* Compatibility Breakdown Bars */}
          <div style={{ marginBottom: '24px', background: 'var(--bg-body)', padding: '16px', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>Compatibility Breakdown</h4>
            <div className="transparency-meters-grid">
              <div className="trans-meter">
                <div className="meter-label">Daily Routines ({r.compatibilityBreakdown?.lifestyle}%)</div>
                <div className="meter-bar"><div className="meter-fill" style={{ width: `${r.compatibilityBreakdown?.lifestyle}%` }}></div></div>
              </div>
              <div className="trans-meter">
                <div className="meter-label">Budget Alignment ({r.compatibilityBreakdown?.budget}%)</div>
                <div className="meter-bar"><div className="meter-fill" style={{ width: `${r.compatibilityBreakdown?.budget}%` }}></div></div>
              </div>
              <div className="trans-meter">
                <div className="meter-label">Location Fit ({r.compatibilityBreakdown?.location}%)</div>
                <div className="meter-bar"><div className="meter-fill" style={{ width: `${r.compatibilityBreakdown?.location}%` }}></div></div>
              </div>
              <div className="trans-meter">
                <div className="meter-label">Move-in Date ({r.compatibilityBreakdown?.moveInDate}%)</div>
                <div className="meter-bar"><div className="meter-fill" style={{ width: `${r.compatibilityBreakdown?.moveInDate}%` }}></div></div>
              </div>
            </div>
          </div>

          {/* Lifestyle Habits Grid */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>Living Habits</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
              <div>⏰ <strong>Schedule:</strong> {r.lifestyle.schedule}</div>
              <div>🧹 <strong>Cleanliness:</strong> {r.lifestyle.cleanliness}</div>
              <div>💼 <strong>Work Style:</strong> {r.lifestyle.workStyle}</div>
              <div>🥗 <strong>Diet:</strong> {r.lifestyle.food}</div>
              <div>🚭 <strong>Smoking:</strong> {r.lifestyle.smoking}</div>
              <div>🐾 <strong>Pets:</strong> {r.lifestyle.pets}</div>
            </div>
          </div>

          {/* Why You're Compatible */}
          <div style={{ background: 'rgba(79, 70, 229, 0.05)', border: '1.5px solid rgba(79, 70, 229, 0.15)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>❤️</span>
              <span>Why You Match ({r.compatibility}% Compatibility)</span>
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 10px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(r.matchedFactors || r.whyCompatible || [
                'Both prefer quiet evening study sessions',
                'High cleanliness standards match',
                'Similar campus commute times'
              ]).map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.86rem', color: '#065F46', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '6px 10px', borderRadius: '6px' }}>
                  <span>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {r.differences && r.differences.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.04em' }}>
                  Possible Differences
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {r.differences.map((diff, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.86rem', color: '#92400E', background: '#FEF3C7', border: '1px solid #FDE68A', padding: '6px 10px', borderRadius: '6px' }}>
                      <span>•</span>
                      <span>{diff}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="modal-footer-actions">
          <button className="btn btn-outline" onClick={closeRoommateProfile}>
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              closeRoommateProfile();
              triggerMatchCelebration(r);
            }}
          >
            Connect &amp; Chat →
          </button>
        </div>

      </div>
    </div>
  );
}
