'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const QUIZ_STEPS_META = [
  { step: 1, tag: 'Step 1 of 7 • Food & Dining', title: 'Food & Dining Preferences' },
  { step: 2, tag: 'Step 2 of 7 • Habits & Living', title: 'Habits & Social Living' },
  { step: 3, tag: 'Step 3 of 7 • Monthly Budget', title: 'Monthly Budget Calibrator' },
  { step: 4, tag: 'Step 4 of 7 • Personality & Goals', title: 'Personality, Study & Boundaries' },
  { step: 5, tag: 'Step 5 of 7 • Sleep & Noise', title: 'Sleep Hours & Sound Environment' },
  { step: 6, tag: 'Step 6 of 7 • Roommate Preferences', title: 'Roommate Age, Gender & Role' },
  { step: 7, tag: 'Step 7 of 7 • Cleanliness, Space & Pets', title: 'Pets, Tidiness & Personal Space' },
  { step: 8, tag: 'Step 8 • Review & Submit', title: 'Review & Compatibility Engine' }
];

export default function RoommateQuizModal({ isOpen, onClose, onCompleted, currentPreferences }) {
  const { currentUser, showToast } = useApp();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState(() => {
    return currentPreferences || {
      food_preference: 'Pure Vegetarian',
      food_preference_flexibility: 'No',
      smoking_frequency: 'Not at all',
      drinking_frequency: 'Not at all',
      eating_out_frequency: 'Occasionally',
      monthly_budget: 12000,
      personality_type: 'Ambivert',
      relationship_status: 'Single',
      roommate_relationship_preference: 'Friendly but independent',
      biggest_roommate_concern: 'Poor cleanliness',
      study_location_preference: 'In the room',
      sleep_schedule: '11 PM–12 AM',
      sleep_environment_preference: 'A little bit of noise is fine.',
      roommate_gender_preference: 'Any',
      roommate_age_preference: '17–25',
      occupation: 'Student',
      pet_preference: "Doesn't matter",
      cleanliness_level: 'Reasonably tidy',
      personal_space_importance: 'Quite important'
    };
  });

  if (!isOpen) return null;

  const handleSelect = (field, value) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    const requiredByStep = {
      1: ['food_preference', 'food_preference_flexibility', 'eating_out_frequency'],
      2: ['smoking_frequency', 'drinking_frequency'],
      3: ['monthly_budget'],
      4: ['personality_type', 'relationship_status', 'roommate_relationship_preference', 'biggest_roommate_concern', 'study_location_preference'],
      5: ['sleep_schedule', 'sleep_environment_preference'],
      6: ['roommate_gender_preference', 'roommate_age_preference', 'occupation'],
      7: ['pet_preference', 'cleanliness_level', 'personal_space_importance']
    };

    const fields = requiredByStep[step] || [];
    for (const f of fields) {
      if (answers[f] === undefined || answers[f] === null || answers[f] === '') {
        showToast('Please select an option for every question in this step.', 'warning');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(prev => Math.min(8, prev + 1));
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    showToast('Calculating your roommate matches...');

    const payload = {
      ...answers,
      user_id: currentUser?.id || null,
      monthly_budget: Number(answers.monthly_budget) || 12000,
      quiz_completed: true,
      updated_at: new Date().toISOString()
    };

    try {
      localStorage.setItem('nestera_user_roommate_preferences', JSON.stringify(payload));
    } catch (e) {}

    try {
      await fetch('http://localhost:5000/api/roommates/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Backend sync note (persisted locally):', err);
    }

    if (onCompleted) onCompleted(payload);
    showToast('Your compatibility matches are ready!', 'success');
    onClose();
  };

  const currentMeta = QUIZ_STEPS_META.find(m => m.step === step) || QUIZ_STEPS_META[0];

  return (
    <div className="modal-overlay open" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="quiz-modal-header" style={{ borderBottom: '1px solid var(--border-subtle)', padding: '24px 28px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="quiz-step-tag" style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)' }}>
                {currentMeta.tag}
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 12px' }}>
                {currentMeta.title}
              </h2>
            </div>
            <button className="modal-close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="quiz-progress-track" style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              className="quiz-progress-fill"
              style={{
                height: '100%',
                width: `${Math.round((step / 8) * 100)}%`,
                background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 50%, #10B981 100%)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>

          {/* STEP 1: FOOD */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.98rem', marginBottom: '8px' }}>
                  Q1. What are your food preferences?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['Pure Vegetarian', 'Non Vegetarian', 'Eggitarian', 'Pure Jain'].map(opt => (
                    <div
                      key={opt}
                      onClick={() => handleSelect('food_preference', opt)}
                      style={{
                        padding: '12px 16px',
                        border: `2px solid ${answers.food_preference === opt ? 'var(--primary)' : 'var(--border-medium)'}`,
                        background: answers.food_preference === opt ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    >
                      {opt === 'Pure Vegetarian' && '🥗 '}
                      {opt === 'Non Vegetarian' && '🍗 '}
                      {opt === 'Eggitarian' && '🍳 '}
                      {opt === 'Pure Jain' && '🌱 '}
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.98rem', marginBottom: '8px' }}>
                  Q2. Do you have any objection if your roommate has different food preferences?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { val: 'No', label: '🟢 No (More flexible)' },
                    { val: 'Yes', label: '🔴 Yes (Strict about matching)' }
                  ].map(item => (
                    <div
                      key={item.val}
                      onClick={() => handleSelect('food_preference_flexibility', item.val)}
                      style={{
                        padding: '12px 16px',
                        border: `2px solid ${answers.food_preference_flexibility === item.val ? 'var(--primary)' : 'var(--border-medium)'}`,
                        background: answers.food_preference_flexibility === item.val ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.98rem', marginBottom: '8px' }}>
                  Q5. How much do you order food from outside or eat out?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['Very frequently', 'Occasionally', 'Once in a blue moon', 'Depends on your mood'].map(opt => (
                    <div
                      key={opt}
                      onClick={() => handleSelect('eating_out_frequency', opt)}
                      style={{
                        padding: '12px 16px',
                        border: `2px solid ${answers.eating_out_frequency === opt ? 'var(--primary)' : 'var(--border-medium)'}`,
                        background: answers.eating_out_frequency === opt ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: HABITS */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.98rem', marginBottom: '8px' }}>
                  Q3. How much do you smoke?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['Not at all', 'Occasionally', 'Often', 'Regularly'].map(opt => (
                    <div
                      key={opt}
                      onClick={() => handleSelect('smoking_frequency', opt)}
                      style={{
                        padding: '12px 16px',
                        border: `2px solid ${answers.smoking_frequency === opt ? 'var(--primary)' : 'var(--border-medium)'}`,
                        background: answers.smoking_frequency === opt ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    >
                      {opt === 'Not at all' ? '🚭 Not at all' : opt}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.98rem', marginBottom: '8px' }}>
                  Q4. How much do you drink?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['Not at all', 'Occasionally', 'Often', 'Regularly'].map(opt => (
                    <div
                      key={opt}
                      onClick={() => handleSelect('drinking_frequency', opt)}
                      style={{
                        padding: '12px 16px',
                        border: `2px solid ${answers.drinking_frequency === opt ? 'var(--primary)' : 'var(--border-medium)'}`,
                        background: answers.drinking_frequency === opt ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    >
                      {opt === 'Not at all' ? '🥤 Not at all' : opt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FINANCES */}
          {step === 3 && (
            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.98rem', marginBottom: '8px' }}>
                Q6. What is your monthly budget?
              </label>
              <div style={{ background: 'var(--bg-surface-secondary)', padding: '28px', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '6px' }}>
                  Monthly Budget: ₹{Number(answers.monthly_budget || 12000).toLocaleString('en-IN')}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Slide to indicate your target monthly rent share (₹0 – ₹20,000)
                </p>
                <input
                  type="range"
                  min="0"
                  max="20000"
                  step="500"
                  value={answers.monthly_budget || 12000}
                  onChange={(e) => handleSelect('monthly_budget', Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', height: '8px', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '8px' }}>
                  <span>₹0 (Minimal)</span>
                  <span>₹10,000 (Standard)</span>
                  <span>₹20,000 (Premium)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PERSONALITY */}
          {step === 4 && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.95rem', marginBottom: '6px' }}>
                  Q7. What type of person are you?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['Extrovert', 'Ambivert', 'Introvert'].map(opt => (
                    <div
                      key={opt}
                      onClick={() => handleSelect('personality_type', opt)}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'center',
                        border: `2px solid ${answers.personality_type === opt ? 'var(--primary)' : 'var(--border-medium)'}`,
                        background: answers.personality_type === opt ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.88rem'
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.95rem', marginBottom: '6px' }}>
                  Q8. What is your relationship status?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['Single', 'Committed'].map(opt => (
                    <div
                      key={opt}
                      onClick={() => handleSelect('relationship_status', opt)}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'center',
                        border: `2px solid ${answers.relationship_status === opt ? 'var(--primary)' : 'var(--border-medium)'}`,
                        background: answers.relationship_status === opt ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.88rem'
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.95rem', marginBottom: '6px' }}>
                  Q9. What kind of relationship do you want with your roommate?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['Very close friends', 'Friendly and social', 'Friendly but independent', 'Mostly just roommates'].map(opt => (
                    <div
                      key={opt}
                      onClick={() => handleSelect('roommate_relationship_preference', opt)}
                      style={{
                        padding: '10px 12px',
                        border: `2px solid ${answers.roommate_relationship_preference === opt ? 'var(--primary)' : 'var(--border-medium)'}`,
                        background: answers.roommate_relationship_preference === opt ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.95rem', marginBottom: '6px' }}>
                  Q10. Which would bother you the MOST in a roommate?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['Poor cleanliness', 'Excessive noise', 'Lack of privacy', 'Dominating in nature'].map(opt => (
                    <div
                      key={opt}
                      onClick={() => handleSelect('biggest_roommate_concern', opt)}
                      style={{
                        padding: '10px 12px',
                        border: `2px solid ${answers.biggest_roommate_concern === opt ? 'var(--primary)' : 'var(--border-medium)'}`,
                        background: answers.biggest_roommate_concern === opt ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.95rem', marginBottom: '6px' }}>
                  Q11. Where would you prefer to study/work most of the time?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['In the room', 'Library', 'Other campus spaces', 'Depends on the day'].map(opt => (
                    <div
                      key={opt}
                      onClick={() => handleSelect('study_location_preference', opt)}
                      style={{
                        padding: '10px 12px',
                        border: `2px solid ${answers.study_location_preference === opt ? 'var(--primary)' : 'var(--border-medium)'}`,
                        background: answers.study_location_preference === opt ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SLEEP & ENVIRONMENT */}
          {step === 5 && (
            <div>
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.98rem', marginBottom: '8px' }}>
                  Q12. What time do you usually sleep on college/work days?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['Before 11 PM', '11 PM–12 AM', '12–1 AM', 'After 1 AM'].map(opt => (
                    <div
                      key={opt}
                      onClick={() => handleSelect('sleep_schedule', opt)}
                      style={{
                        padding: '12px 16px',
                        border: `2px solid ${answers.sleep_schedule === opt ? 'var(--primary)' : 'var(--border-medium)'}`,
                        background: answers.sleep_schedule === opt ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.98rem', marginBottom: '8px' }}>
                  Q13. How do your surroundings affect your sleep?
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    'I want a completely quiet environment.',
                    'A little bit of noise is fine.',
                    "I really don't care about my surroundings.",
                    'Depends on the time of the day.'
                  ].map(opt => (
                    <div
                      key={opt}
                      onClick={() => handleSelect('sleep_environment_preference', opt)}
                      style={{
                        padding: '12px 16px',
                        border: `2px solid ${answers.sleep_environment_preference === opt ? 'var(--primary)' : 'var(--border-medium)'}`,
                        background: answers.sleep_environment_preference === opt ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: ROOMMATE PREFERENCES */}
          {step === 6 && (
            <div>
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.98rem', marginBottom: '8px' }}>
                  Q14. Gender preference of your roommate
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {['Male', 'Female', 'Any'].map(opt => (
                    <div
                      key={opt}
                      onClick={() => handleSelect('roommate_gender_preference', opt)}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'center',
                        border: `2px solid ${answers.roommate_gender_preference === opt ? 'var(--primary)' : 'var(--border-medium)'}`,
                        background: answers.roommate_gender_preference === opt ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    >
                      {opt === 'Any' ? '🌈 Any' : opt}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.98rem', marginBottom: '8px' }}>
                  Q15. Age preference of your roommate
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['17–25', '25–35', '35–45', '45+'].map(opt => (
                    <div
                      key={opt}
                      onClick={() => handleSelect('roommate_age_preference', opt)}
                      style={{
                        padding: '12px 16px',
                        border: `2px solid ${answers.roommate_age_preference === opt ? 'var(--primary)' : 'var(--border-medium)'}`,
                        background: answers.roommate_age_preference === opt ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.98rem', marginBottom: '8px' }}>
                  Q16. Occupation
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['Student', 'Business', 'Job', 'Freelancer'].map(opt => (
                    <div
                      key={opt}
                      onClick={() => handleSelect('occupation', opt)}
                      style={{
                        padding: '12px 16px',
                        border: `2px solid ${answers.occupation === opt ? 'var(--primary)' : 'var(--border-medium)'}`,
                        background: answers.occupation === opt ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: PETS, CLEANLINESS & SPACE */}
          {step === 7 && (
            <div>
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.98rem', marginBottom: '8px' }}>
                  Q17. What do you prefer regarding pets?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['0 Pet tolerance', "Doesn't matter", 'Even I have a pet', 'As long as boundaries are maintained'].map(opt => (
                    <div
                      key={opt}
                      onClick={() => handleSelect('pet_preference', opt)}
                      style={{
                        padding: '12px 16px',
                        border: `2px solid ${answers.pet_preference === opt ? 'var(--primary)' : 'var(--border-medium)'}`,
                        background: answers.pet_preference === opt ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.88rem'
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.98rem', marginBottom: '8px' }}>
                  Q18. How tidy do you normally keep the room?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['Very tidy and organized', 'Reasonably tidy', 'A little messy is fine', "Mess doesn't bother me"].map(opt => (
                    <div
                      key={opt}
                      onClick={() => handleSelect('cleanliness_level', opt)}
                      style={{
                        padding: '12px 16px',
                        border: `2px solid ${answers.cleanliness_level === opt ? 'var(--primary)' : 'var(--border-medium)'}`,
                        background: answers.cleanliness_level === opt ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.88rem'
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.98rem', marginBottom: '8px' }}>
                  Q19. How important is personal space to you?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['Extremely important', 'Quite important', 'Somewhat important', 'Not very important'].map(opt => (
                    <div
                      key={opt}
                      onClick={() => handleSelect('personal_space_importance', opt)}
                      style={{
                        padding: '12px 16px',
                        border: `2px solid ${answers.personal_space_importance === opt ? 'var(--primary)' : 'var(--border-medium)'}`,
                        background: answers.personal_space_importance === opt ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.88rem'
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: REVIEW & SUBMIT */}
          {step === 8 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '2.4rem' }}>🎯</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '6px 0' }}>Review Your Profile</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Your answers will dynamically calibrate your match percentages against each roommate.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: 'Diet', val: `${answers.food_preference} (${answers.food_preference_flexibility === 'Yes' ? 'Strict' : 'Flexible'})` },
                  { label: 'Monthly Budget', val: `₹${Number(answers.monthly_budget).toLocaleString('en-IN')}` },
                  { label: 'Smoking', val: answers.smoking_frequency },
                  { label: 'Drinking', val: answers.drinking_frequency },
                  { label: 'Personality', val: `${answers.personality_type} • ${answers.relationship_status}` },
                  { label: 'Sleep Hours', val: answers.sleep_schedule },
                  { label: 'Tidiness', val: answers.cleanliness_level },
                  { label: 'Personal Space', val: answers.personal_space_importance }
                ].map(item => (
                  <div key={item.label} style={{ background: 'var(--bg-surface-secondary)', padding: '10px 14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>{item.label}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {step > 1 ? (
            <button className="btn btn-secondary" onClick={handleBack}>
              ← Back
            </button>
          ) : <div />}

          {step < 8 ? (
            <button className="btn btn-primary" onClick={handleNext}>
              Next Step →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit} style={{ background: '#10B981', borderColor: '#059669' }}>
              Complete Quiz &amp; Calculate Matches 🎯
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
