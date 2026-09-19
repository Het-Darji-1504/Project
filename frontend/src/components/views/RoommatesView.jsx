'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RoommateAPI } from '../../services/api';
import { calculateCompatibility } from '../../services/compatibilityEngine';
import RoommateQuizModal from '../modals/RoommateQuizModal';

function getStableFallbackMatch(r) {
  if (!r) return 85;
  const raw = typeof r.compatibility === 'number' ? r.compatibility : parseInt(r.compatibility, 10);
  if (!isNaN(raw) && raw >= 61 && raw <= 98) {
    return raw;
  }
  const str = String(r.id || '') + String(r.name || '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return 61 + (Math.abs(hash) % 38);
}

export default function RoommatesView() {
  const { openRoommateProfile, triggerMatchCelebration, showToast, getProfileAvatar } = useApp();
  const [roommates, setRoommates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState('swiper'); // 'swiper' | 'grid'
  const [swipeFeedback, setSwipeFeedback] = useState(null); // 'match' | 'pass'
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [userPreferences, setUserPreferences] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const p = localStorage.getItem('nestera_user_roommate_preferences');
      return p ? JSON.parse(p) : null;
    } catch (e) {
      return null;
    }
  });

  const [acceptedRoommates, setAcceptedRoommates] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const s = localStorage.getItem('nestera_accepted_roommates') || localStorage.getItem('nestora_accepted_roommates');
      return s ? JSON.parse(s) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    RoommateAPI.getRoommates().then(res => {
      if (res && res.data) {
        setRoommates(res.data);
      }
    });

    // Try fetching preferences from backend
    fetch('http://localhost:5000/api/roommates/preferences')
      .then(res => res.json())
      .then(body => {
        if (body && body.data) {
          setUserPreferences(body.data);
          try {
            localStorage.setItem('nestera_user_roommate_preferences', JSON.stringify(body.data));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  const getScoreData = (mate) => {
    if (!mate) return { score: 85, isPersonalized: false, matchedFactors: [], differences: [] };
    if (userPreferences && userPreferences.quiz_completed) {
      const calc = calculateCompatibility(userPreferences, mate);
      return {
        score: calc.percentage,
        isPersonalized: true,
        matchedFactors: calc.matchedFactors,
        differences: calc.differences
      };
    }
    return {
      score: getStableFallbackMatch(mate),
      isPersonalized: false,
      matchedFactors: mate.whyCompatible || [],
      differences: []
    };
  };

  const handleConnect = (mate) => {
    if (!mate) return;
    const { score } = getScoreData(mate);
    if (!acceptedRoommates.includes(mate.id)) {
      const next = [...acceptedRoommates, mate.id];
      setAcceptedRoommates(next);
      try {
        localStorage.setItem('nestera_accepted_roommates', JSON.stringify(next));
      } catch (e) {}
    }
    showToast(`🎉 It's a ${score}% Match with ${mate.name}! Status: Connected / Accepted.`, 'success');
    triggerMatchCelebration({
      ...mate,
      compatibility: score
    });
  };

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
      handleConnect(current);
    } else {
      showToast(`Passed profile: ${current.name}`);
    }

    setCurrentIndex(prev => prev + 1);
  };

  const currentRoommate = roommates[currentIndex];
  const isCurrentAccepted = currentRoommate && acceptedRoommates.includes(currentRoommate.id);
  const currentScoreData = currentRoommate ? getScoreData(currentRoommate) : { score: 85, isPersonalized: false };
  const hasCompletedQuiz = Boolean(userPreferences && userPreferences.quiz_completed);

  return (
    <section className="view-panel active" id="view-roommates">
      <div className="container" style={{ padding: '32px 24px 80px' }}>
        {/* Header & Mode Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
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

        {/* Compatibility Quiz CTA Hero Banner */}
        <div className="quiz-hero-card" style={{ marginBottom: '32px' }}>
          <div className="quiz-hero-badge">
            <span className={`quiz-pulse-dot ${hasCompletedQuiz ? 'dot-completed' : ''}`} />
            <span>{hasCompletedQuiz ? '✓ Preferences Active' : 'Quiz Not Completed'}</span>
          </div>
          <div className="quiz-hero-body">
            <div className="quiz-hero-text">
              <h3 className="quiz-hero-title">
                {hasCompletedQuiz ? 'Retake Compatibility Quiz' : 'Take Compatibility Quiz'}
              </h3>
              <p className="quiz-hero-sub">
                {hasCompletedQuiz
                  ? 'Your answers are calculating personalized match scores across all roommate profiles.'
                  : 'Answer a few questions about your lifestyle and preferences to find roommates who match you better.'}
              </p>
              {hasCompletedQuiz && (
                <div className="quiz-hero-uptodate">
                  <span>✓ Your preferences are up to date</span>
                </div>
              )}
            </div>
            <div className="quiz-hero-action">
              <button className="btn btn-primary btn-quiz-cta" onClick={() => setIsQuizOpen(true)}>
                {hasCompletedQuiz ? 'Retake Quiz ↻' : 'Take the Quiz →'}
              </button>
            </div>
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
                    src={getProfileAvatar ? getProfileAvatar(currentRoommate) : currentRoommate.avatar}
                    alt={currentRoommate.name}
                    className="roommate-swipe-img"
                  />
                  <div className={`swipe-compat-pill ${!hasCompletedQuiz ? 'compat-badge-demo' : ''}`}>
                    ⚡ {currentScoreData.score}% {hasCompletedQuiz ? 'Compatibility' : '(Demo)'}
                  </div>


                  {isCurrentAccepted && (
                    <div className="badge badge-emerald" style={{ position: 'absolute', bottom: '14px', left: '14px', zIndex: 10, fontSize: '0.85rem' }}>
                      ✓ Connected / Accepted
                    </div>
                  )}

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
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {isCurrentAccepted && <span className="badge badge-emerald">✓ Connected</span>}
                      <span className="badge badge-emerald">Budget: {currentRoommate.budget}</span>
                    </div>
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
                      onClick={() => openRoommateProfile({
                        ...currentRoommate,
                        compatibility: currentScoreData.score,
                        matchedFactors: currentScoreData.matchedFactors,
                        differences: currentScoreData.differences,
                        isPersonalized: currentScoreData.isPersonalized
                      })}
                      title="View full profile"
                    >
                      ℹ
                    </button>
                    <button
                      className="swipe-action-btn btn-match"
                      onClick={() => handleSwipe('match')}
                      title={isCurrentAccepted ? 'Already Connected' : 'Match & Connect'}
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
                  New compatible students & young professionals join Nestera daily.
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
            {roommates.map(r => {
              const scoreData = getScoreData(r);
              const isAccepted = acceptedRoommates.includes(r.id);

              return (
                <div key={r.id} className="roommate-grid-card">
                  <div className="grid-card-img-wrap">
                    <img src={getProfileAvatar ? getProfileAvatar(r) : r.avatar} alt={r.name} className="grid-card-img" />
                    <span className={`swipe-compat-pill ${!scoreData.isPersonalized ? 'compat-badge-demo' : ''}`} style={{ top: '12px', right: '12px', bottom: 'auto' }}>
                      ⚡ {scoreData.score}% {scoreData.isPersonalized ? 'Match' : '(Demo)'}
                    </span>
                    {isAccepted && (
                      <span className="badge badge-emerald" style={{ position: 'absolute', bottom: '10px', left: '12px', zIndex: 5 }}>
                        ✓ Connected
                      </span>
                    )}
                  </div>
                  <div className="grid-card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{r.name}, {r.age}</h3>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>{r.budget}</span>
                    </div>
                    {isAccepted && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald-dark)', fontWeight: 800, marginTop: '2px' }}>
                        Status: ✓ Connected / Accepted
                      </div>
                    )}
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
                        onClick={() => openRoommateProfile({
                          ...r,
                          compatibility: scoreData.score,
                          matchedFactors: scoreData.matchedFactors,
                          differences: scoreData.differences,
                          isPersonalized: scoreData.isPersonalized
                        })}
                      >
                        View Profile
                      </button>
                      {isAccepted ? (
                        <button
                          className="btn btn-sm"
                          style={{ flex: 1, background: '#ECFDF5', color: '#065F46', border: '1.5px solid #A7F3D0', fontWeight: 700, cursor: 'default' }}
                          disabled
                          title="Roommate connected and accepted"
                        >
                          ✓ Connected
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-primary"
                          style={{ flex: 1 }}
                          onClick={() => handleConnect(r)}
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Roommate Compatibility Quiz Modal */}
        <RoommateQuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          currentPreferences={userPreferences}
          onCompleted={(newPrefs) => {
            setUserPreferences(newPrefs);
            try {
              localStorage.setItem('nestera_user_roommate_preferences', JSON.stringify(newPrefs));
            } catch (e) {}
          }}
        />
      </div>
    </section>
  );
}


