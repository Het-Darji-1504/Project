'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuthAPI } from '../../services/api';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode, selectedPreRole, loginUser, showToast, navigateTo } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const isDobValid = dateOfBirth && dateOfBirth <= todayStr;

  const isSignupValid =
    fullName.trim().length >= 2 &&
    email.includes('@') &&
    password.length >= 6 &&
    password === confirmPassword &&
    Boolean(gender) &&
    Boolean(isDobValid) &&
    termsConsent;

  const isLoginValid = email.includes('@') && password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'signup') {
        if (!gender) {
          showToast('Please select your gender', 'error');
          setLoading(false);
          return;
        }
        if (!dateOfBirth || dateOfBirth > todayStr) {
          showToast('Please select a valid Date of Birth (cannot be in the future)', 'error');
          setLoading(false);
          return;
        }

        const res = await AuthAPI.register({
          fullName,
          email,
          phone,
          password,
          role: selectedPreRole || 'tenant',
          gender,
          dateOfBirth,
          date_of_birth: dateOfBirth
        });

        if (res && res.success) {
          loginUser(res.user);
          setIsAuthModalOpen(false);
          if (res.user.role === 'owner') navigateTo('owner');
          else navigateTo('discovery');
        } else {
          showToast(res.message || 'Registration failed', 'error');
        }
      } else {
        const res = await AuthAPI.login(email, password);
        if (res && res.success) {
          loginUser(res.user);
          setIsAuthModalOpen(false);
          if (res.user.role === 'owner') navigateTo('owner');
          else navigateTo('discovery');
        } else {
          showToast(res.message || 'Login failed', 'error');
        }
      }
    } catch (err) {
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', zIndex: 1100 }}>
      <div className="modal-container" style={{ maxWidth: '480px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
            {authMode === 'signup' ? 'Step 2: Permanent Registration' : 'Account Access'}
          </span>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--slate-400)' }}
          >
            ×
          </button>
        </div>

        {authMode === 'signup' ? (
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '6px' }}>
              Create your Nestera account
            </h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Find your space. Find your people. Live smarter.
            </p>

            {/* Read-Only Permanent Role Context */}
            <div style={{
              background: '#EEF2FF',
              border: '1.5px solid var(--primary-200)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-800)', textTransform: 'uppercase' }}>
                  Assigned Permanent Role:
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                  {selectedPreRole === 'owner' ? '🏢 Property Owner' : '🏠 Student / Youth Tenant'}
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', background: 'var(--white)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--slate-200)' }}>
                🔒 Read-Only
              </span>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aman Singh"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', padding: '10px 14px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. aman.singh@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', padding: '10px 14px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98250 XXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', padding: '10px 14px' }}
                />
              </div>

              {/* Gender (Signup only) */}
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

              {/* Date of Birth (Signup only) */}
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
                <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '2px', display: 'block' }}>
                  Must be in the past. Used for age-based roommate compatibility.
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)' }}>Password</label>
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ fontSize: '0.8rem', color: 'var(--primary-600)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </span>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', padding: '10px 14px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', padding: '10px 14px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '4px 0' }}>
                <input
                  type="checkbox"
                  id="termsConsent"
                  checked={termsConsent}
                  onChange={e => setTermsConsent(e.target.checked)}
                  style={{ marginTop: '3px' }}
                />
                <label htmlFor="termsConsent" style={{ fontSize: '0.82rem', color: 'var(--slate-600)', lineHeight: 1.4 }}>
                  I agree to Nestera&apos;s <strong>Terms of Service</strong> and <strong>Privacy Policy</strong> with zero brokerage guarantee.
                </label>
              </div>

              <button
                type="submit"
                disabled={!isSignupValid || loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '8px',
                  opacity: isSignupValid ? 1 : 0.5,
                  cursor: isSignupValid ? 'pointer' : 'not-allowed'
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                Already have an account?{' '}
                <span
                  onClick={() => setAuthMode('login')}
                  style={{ color: 'var(--primary-600)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Sign In
                </span>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '6px' }}>
              Welcome back 👋
            </h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Sign in to continue to your Nestera account.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. aman.singh@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', padding: '10px 14px' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)' }}>Password</label>
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ fontSize: '0.8rem', color: 'var(--primary-600)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </span>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', padding: '10px 14px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--slate-600)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={e => setRememberSession(e.target.checked)}
                  />
                  Remember session
                </label>
                <span
                  onClick={() => showToast('Password reset link sent to your registered email.', 'info')}
                  style={{ color: 'var(--primary-600)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Forgot password?
                </span>
              </div>

              <button
                type="submit"
                disabled={!isLoginValid || loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '6px',
                  opacity: isLoginValid ? 1 : 0.5,
                  cursor: isLoginValid ? 'pointer' : 'not-allowed'
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                Don&apos;t have an account?{' '}
                <span
                  onClick={() => setAuthMode('signup')}
                  style={{ color: 'var(--primary-600)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Create one
                </span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
