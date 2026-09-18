'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RoommateAPI } from '../../services/api';

export default function RoommatesView() {
  const { openRoommateProfile, triggerMatchCelebration, showToast } = useApp();
  const [roommates, setRoommates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState('swiper'); // 'swiper' | 'grid'
  const [swipeFeedback, setSwipeFeedback] = useState(null); // 'match' | 'pass'

  useEffect(() => {
    RoommateAPI.getRoommates().then(res => {
      if (res && res.data) {
        setRoommates(res.data);
      }
    });
  }, []);

  const handleSwipe = async (action) => {
    if (currentIndex >= roommates.length) return;
    const current = roommates[currentIndex];

    setSwipeFeedback(action);
    setTimeout(() => setSwipeFeedback(null), 400);

    try {
      await RoommateAPI.swipe(current.id, action);
    } catch (e) {
      console.error(e);
    }

    if (action === 'match') {
      triggerMatchCelebration(current);
    } else {
      showToast(`Passed profile: ${current.name}`);
    }

    setCurrentIndex(prev => prev + 1);
  };

  const currentRoommate = roommates[currentIndex];

  return (
    <section className="view-panel active" id="view-roommates">
      <div className="container" style={{ padding: '32px 24px 80px' }}>
        {/* Header & Mode Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '8px' }}>AI COMPATIBILITY MATCHING</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Find Compatible Roommates
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
              Matched according to sleep schedules, cleanliness benchmarks, budget, and college/work habits.
            </p>
          </div>

          <div className="view-toggle-pills">
            <button
              className={`view-pill-btn ${viewMode === 'swiper' ? 'active' : ''}`}
              onClick={() => setViewMode('swiper')}
            >
              Swipe Deck
            </button>
            <button
              className={`view-pill-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Browse All ({roommates.length})
            </button>
          </div>
        </div>

        {/* SWIPER MODE */}
        {viewMode === 'swiper' && (
          <div className="swiper-container-wrap">
            {currentRoommate ? (
              <div className="roommate-swipe-card animate-fade-in">
                {/* Visual Image & Overlays */}
                <div className="roommate-swipe-img-wrap">
                  <img
                    src={currentRoommate.avatar}
                    alt={currentRoommate.name}
                    className="roommate-swipe-img"
                  />
                  <div className="swipe-compat-pill">
                    ⚡ {currentRoommate.compatibility}% Compatibility
                  </div>

                  {swipeFeedback && (
                    <div className={`swipe-overlay-stamp ${swipeFeedback}`}>
                      {swipeFeedback === 'match' ? 'MATCH ❤️' : 'PASS ✕'}
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="roommate-swipe-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                      {currentRoommate.name}, {currentRoommate.age}
                    </h3>
                    <span className="badge badge-emerald">Budget: {currentRoommate.budget}</span>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                    💼 {currentRoommate.role} • {currentRoommate.institution}
                  </p>

                  <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', margin: '14px 0', lineHeight: 1.5 }}>
                    "{currentRoommate.about}"
                  </p>

                  {/* Habit Tags */}
                  <div className="roommate-lifestyle-tags">
                    <span className="lifestyle-tag">⏰ {currentRoommate.lifestyle.schedule}</span>
                    <span className="lifestyle-tag">🧹 {currentRoommate.lifestyle.cleanliness}</span>
                    <span className="lifestyle-tag">🥗 {currentRoommate.lifestyle.food}</span>
                    <span className="lifestyle-tag">🚭 {currentRoommate.lifestyle.smoking}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="swipe-action-controls">
                    <button
                      className="swipe-action-btn btn-pass"
                      onClick={() => handleSwipe('pass')}
                      title="Pass"
                    >
                      ✕
                    </button>
                    <button
                      className="swipe-action-btn btn-info"
                      onClick={() => openRoommateProfile(currentRoommate)}
                      title="View full profile"
                    >
                      ℹ
                    </button>
                    <button
                      className="swipe-action-btn btn-match"
                      onClick={() => handleSwipe('match')}
                      title="Match"
                    >
                      ♥
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-swiper-card" style={{ padding: '60px 24px', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: '24px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>You've reviewed all roommate profiles!</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.95rem' }}>
                  New compatible students & young professionals join Nestora daily.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentIndex(0)}
                  style={{ marginTop: '20px' }}
                >
                  Start Over
                </button>
              </div>
            )}
          </div>
        )}

        {/* GRID MODE */}
        {viewMode === 'grid' && (
          <div className="roommates-grid">
            {roommates.map(r => (
              <div key={r.id} className="roommate-grid-card">
                <div className="grid-card-img-wrap">
                  <img src={r.avatar} alt={r.name} className="grid-card-img" />
                  <span className="swipe-compat-pill" style={{ top: '12px', right: '12px', bottom: 'auto' }}>
                    {r.compatibility}% Match
                  </span>
                </div>
                <div className="grid-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{r.name}, {r.age}</h3>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>{r.budget}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {r.institution}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '10px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {r.about}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      className="btn btn-sm btn-outline"
                      style={{ flex: 1 }}
                      onClick={() => openRoommateProfile(r)}
                    >
                      View Profile
                    </button>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => triggerMatchCelebration(r)}
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
