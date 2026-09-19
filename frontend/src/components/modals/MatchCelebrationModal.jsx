'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { MOCK_DATA } from '../../services/mockData';

export default function MatchCelebrationModal() {
  const {
    matchedRoommate,
    isMatchCelebrationOpen,
    setIsMatchCelebrationOpen,
    showToast,
    currentUser,
    getProfileAvatar
  } = useApp();

  if (!isMatchCelebrationOpen || !matchedRoommate) return null;

  const user = MOCK_DATA.currentUser;
  const partner = matchedRoommate;

  return (
    <div className="modal-overlay open" onClick={() => setIsMatchCelebrationOpen(false)}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', textAlign: 'center', padding: '36px 24px', position: 'relative' }}
      >
        <button
          className="modal-close-btn"
          style={{ position: 'absolute', top: '16px', right: '16px' }}
          onClick={() => setIsMatchCelebrationOpen(false)}
        >
          ✕
        </button>

        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🎉</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
          It's a Match!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          You and <strong>{partner.name}</strong> share a {partner.compatibility}% lifestyle compatibility score!
        </p>

        {/* Dual Avatars */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', margin: '28px 0' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={getProfileAvatar(currentUser)}
              alt={currentUser?.fullName || user.name}
              style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--primary)' }}
            />
            <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '4px' }}>You</div>
          </div>

          <div style={{ fontSize: '1.8rem', color: 'var(--accent-rose)' }}>❤️</div>

          <div style={{ position: 'relative' }}>
            <img
              src={getProfileAvatar(partner)}
              alt={partner.name}
              style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--accent-emerald)' }}
            />
            <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '4px' }}>{partner.name.split(' ')[0]}</div>
          </div>
        </div>

        {/* Mutual traits */}
        <div style={{ background: 'var(--bg-body)', padding: '14px', borderRadius: '12px', textAlign: 'left', marginBottom: '24px', fontSize: '0.85rem' }}>
          <div style={{ fontWeight: 700, marginBottom: '6px' }}>✨ Shared Preferences:</div>
          <div style={{ color: 'var(--text-secondary)' }}>• Both respect quiet hours post 11:00 PM</div>
          <div style={{ color: 'var(--text-secondary)' }}>• Aligned budget: {partner.budget}</div>
          <div style={{ color: 'var(--text-secondary)' }}>• Non-smoking & clean household preference</div>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '10px' }}
          onClick={() => {
            setIsMatchCelebrationOpen(false);
            showToast(`Conversation request dispatched to ${partner.name} via WhatsApp`);
          }}
        >
          Send WhatsApp & In-App Greeting →
        </button>

        <button
          className="btn btn-outline"
          style={{ width: '100%' }}
          onClick={() => setIsMatchCelebrationOpen(false)}
        >
          Keep Swiping
        </button>
      </div>
    </div>
  );
}
