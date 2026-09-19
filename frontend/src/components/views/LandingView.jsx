'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PropertyAPI } from '../../services/api';

export default function LandingView() {
  const { navigateTo, openPropertyDetails, startOnboarding } = useApp();
  const [city, setCity] = useState('Ahmedabad');
  const [type, setType] = useState('All Types');
  const [budgetRange, setBudgetRange] = useState('all');
  const [showcaseProperties, setShowcaseProperties] = useState([]);

  useEffect(() => {
    PropertyAPI.getProperties().then(res => {
      if (res && res.data) {
        setShowcaseProperties(res.data.slice(0, 3));
      }
    });
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    navigateTo('discovery', { city, type, budgetRange });
  };

  return (
    <section className="view-panel active" id="view-landing">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container hero-content">
          <div className="hero-eyebrow">
            <span>✨ The Transparent Living Platform</span>
            <span style={{ marginLeft: '12px' }}>• Zero Brokerage Guarantee</span>
          </div>
          <h1 className="hero-title">
            Find a place that fits your life — <br />
            <span className="text-gradient">and your budget.</span>
          </h1>
          <p className="hero-subtitle">
            Discover verified spaces, compatible roommates, transparent costs and smarter rental management — all in one place.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
            <button
              onClick={startOnboarding}
              className="btn btn-primary"
              style={{ padding: '14px 32px', fontSize: '1.05rem', fontWeight: 800, borderRadius: '30px', boxShadow: '0 8px 20px rgba(79, 70, 229, 0.35)' }}
            >
              🚀 Get Started — Choose Your Role
            </button>
            <button
              onClick={() => navigateTo('discovery')}
              className="btn btn-secondary"
              style={{ padding: '14px 24px', fontSize: '1rem', fontWeight: 700, borderRadius: '30px' }}
            >
              Browse Nearest Hostels →
            </button>
          </div>

          {/* Search Component */}
          <form className="hero-search-box" onSubmit={handleHeroSearch}>
            <div className="search-fields-grid">
              {/* Location Field */}
              <div className="search-field">
                <label className="search-label">Location</label>
                <select
                  className="search-select"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="Ahmedabad">Ahmedabad (SG Highway, Bodakdev)</option>
                  <option value="Gandhinagar">Gandhinagar (GIFT City, PDPU)</option>
                  <option value="Vadodara">Vadodara</option>
                  <option value="Surat">Surat</option>
                  <option value="Mumbai">Mumbai (Bandra, Andheri)</option>
                  <option value="Bengaluru">Bengaluru (HSR, Koramangala)</option>
                  <option value="Pune">Pune (Kothrud, Viman Nagar)</option>
                  <option value="Delhi">Delhi NCR (Gurugram, Noida)</option>
                </select>
              </div>

              {/* Property Type Field */}
              <div className="search-field">
                <label className="search-label">Property Type</label>
                <select
                  className="search-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="All Types">All Property Types</option>
                  <option value="Apartment">Apartment (1/2/3 BHK)</option>
                  <option value="PG">PG / Student Hostel</option>
                  <option value="Shared Apartment">Shared Apartment</option>
                  <option value="Studio">Studio Apartment</option>
                  <option value="Co-working">Co-working Space</option>
                  <option value="Office">Office</option>
                  <option value="Commercial Space">Commercial Space</option>
                </select>
              </div>

              {/* Budget Range Field */}
              <div className="search-field">
                <label className="search-label">Budget</label>
                <select
                  className="search-select"
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                >
                  <option value="all">Any Budget</option>
                  <option value="under-15k">Under ₹15,000/mo</option>
                  <option value="15k-25k">₹15,000 – ₹25,000/mo</option>
                  <option value="above-25k">Above ₹25,000/mo</option>
                </select>
              </div>

              {/* Submit CTA */}
              <div className="search-field search-action">
                <button type="submit" className="btn btn-primary hero-search-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <span>Search Spaces</span>
                </button>
              </div>
            </div>
          </form>

          {/* Highlights Row */}
          <div className="hero-trust-badges">
            <div className="trust-item">
              <span className="trust-icon">🛡️</span>
              <span>100% Aadhaar & DigiLocker Verified</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">💡</span>
              <span>Full Utility Cost Transparency</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🤝</span>
              <span>AI Lifestyle Roommate Match</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Showcase Section */}
      <div className="container" style={{ padding: '60px 24px' }}>
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>CURATED SELECTION</span>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Top Transparent Spaces in Gujarat
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.95rem' }}>
              Every listing includes real living cost estimates and verified owner track records.
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => navigateTo('discovery')}>
            Explore All Spaces →
          </button>
        </div>

        {/* Showcase Grid */}
        <div className="showcase-grid">
          {showcaseProperties.map(prop => (
            <div
              key={prop.id}
              className="showcase-card"
              onClick={() => openPropertyDetails(prop)}
              style={{ cursor: 'pointer' }}
            >
              <div className="showcase-img-wrap">
                <img src={prop.images[0]} alt={prop.title} className="showcase-img" loading="lazy" />
                <span className="badge badge-verified showcase-badge-top">✓ Verified</span>
                <span className="showcase-score-top">{prop.transparencyScore}/100 Transparency</span>
              </div>
              <div className="showcase-body">
                <span className="card-type-tag">{prop.type}</span>
                <h3 className="showcase-title">{prop.title}</h3>
                <p className="showcase-locality">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {prop.locality}, {prop.city}
                </p>
                <div className="showcase-pricing-row">
                  <div>
                    <div className="showcase-rent-num">
                      ₹{prop.rent?.toLocaleString('en-IN')}
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span>
                    </div>
                    <div className="deposit-info">Deposit: ₹{prop.deposit?.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="cost-est-pill">
                      ₹{prop.estimatedLivingCost?.toLocaleString('en-IN')}/mo total
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Zero hidden charges
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
