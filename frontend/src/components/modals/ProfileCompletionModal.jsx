'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuthAPI } from '../../services/api';

export default function ProfileCompletionModal() {
  const { isProfileCompletionOpen, setIsProfileCompletionOpen, currentUser, updateCurrentUser, showToast } = useApp();

  const [gender, setGender] = useState(currentUser?.gender || '');
  const [dateOfBirth, setDateOfBirth] = useState(currentUser?.dateOfBirth || currentUser?.date_of_birth || '');
  const [loading, setLoading] = useState(false);

  if (!isProfileCompletionOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSave = async (e) => {
    e.preventDefault();
    if (!gender) {
      showToast('Please select your gender', 'error');
      return;
    }
    if (!dateOfBirth || dateOfBirth > todayStr) {
      showToast('Date of Birth cannot be in the future', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await AuthAPI.updateProfile({
        userId: currentUser?.id,
        email: currentUser?.email,
        gender,
        dateOfBirth,
        date_of_birth: dateOfBirth
      });

      if (res && res.success) {
        updateCurrentUser({
          gender,
          dateOfBirth,
          date_of_birth: dateOfBirth
        });
        showToast('Profile completed successfully! Your roommate compatibility has been updated.', 'success');
        setIsProfileCompletionOpen(false);
      } else {
        showToast('Could not save profile details', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', zIndex: 1150 }}>
      <div className="modal-container" style={{ maxWidth: '440px', padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
            Complete Your Profile
          </span>
          <button
            onClick={() => setIsProfileCompletionOpen(false)}
            style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--slate-400)' }}
          >
            ×
          </button>
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)', margin: '4px 0 6px 0' }}>
          Welcome, {currentUser?.fullName || 'Resident'}! 👋
        </h3>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.88rem', marginBottom: '18px', lineHeight: 1.45 }}>
          Add your Gender and Date of Birth to optimize your personalized roommate matches and trust score.
        </p>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
              Gender
            </label>
            <select
              required
              value={gender}
              onChange={e => setGender(e.target.value)}
              className="search-input"
              style={{ width: '100%', padding: '10px 14px' }}
            >
              <option value="" disabled>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
              Date of Birth
            </label>
            <input
              type="date"
              required
              max={todayStr}
              value={dateOfBirth}
              onChange={e => setDateOfBirth(e.target.value)}
              className="search-input"
              style={{ width: '100%', padding: '10px 14px' }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: '2px', display: 'block' }}>
              Cannot be in the future.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ flex: 1, padding: '10px' }}
              onClick={() => setIsProfileCompletionOpen(false)}
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 1, padding: '10px' }}
            >
              {loading ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
