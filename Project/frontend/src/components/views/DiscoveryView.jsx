'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PropertyAPI } from '../../services/api';

export default function DiscoveryView() {
  const {
    searchPayload,
    openPropertyDetails,
    savedProperties,
    toggleSaveProperty,
    showToast
  } = useApp();

  const [city, setCity] = useState(searchPayload?.city || 'Ahmedabad');
  const [selectedType, setSelectedType] = useState(searchPayload?.type || 'All Types');
  const [budgetRange, setBudgetRange] = useState(searchPayload?.budgetRange || 'all');
  const [furnishedOnly, setFurnishedOnly] = useState(false);
  const [roommatesAllowedOnly, setRoommatesAllowedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [hoveredPinId, setHoveredPinId] = useState(null);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync with payload if navigated from Hero
  useEffect(() => {
    if (searchPayload) {
      if (searchPayload.city) setCity(searchPayload.city);
      if (searchPayload.type) setSelectedType(searchPayload.type);
      if (searchPayload.budgetRange) setBudgetRange(searchPayload.budgetRange);
    }
  }, [searchPayload]);

  // Load properties based on filters
  useEffect(() => {
    setLoading(true);
    PropertyAPI.getProperties({
      city,
      type: selectedType,
      budgetRange,
      furnished: furnishedOnly,
      roommatesAllowed: roommatesAllowedOnly,
      sortBy
    }).then(res => {
      if (res && res.data) {
        setProperties(res.data);
      }
      setLoading(false);
    });
  }, [city, selectedType, budgetRange, furnishedOnly, roommatesAllowedOnly, sortBy]);

  const chipOptions = [
    'All Types',
    'Apartment',
    'PG',
    'Shared Apartment',
    'Studio',
    'Co-working'
  ];

  const resetFilters = () => {
    setCity('Ahmedabad');
    setSelectedType('All Types');
    setBudgetRange('all');
    setFurnishedOnly(false);
    setRoommatesAllowedOnly(false);
    setSortBy('recommended');
    showToast('Filters reset to default');
  };

  return (
    <section className="view-panel active" id="view-discovery">
      {/* Top Filter Strip */}
      <div className="discovery-filter-bar">
        <div className="container">
          <div className="filter-controls-row">
            {/* City Dropdown */}
            <div className="filter-control-item">
              <label className="filter-mini-label">City / Hub</label>
              <select
                className="filter-select-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Gandhinagar">Gandhinagar</option>
                <option value="Vadodara">Vadodara</option>
                <option value="Surat">Surat</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Pune">Pune</option>
                <option value="Delhi">Delhi NCR</option>
              </select>
            </div>

            {/* Budget Range */}
            <div className="filter-control-item">
              <label className="filter-mini-label">Budget</label>
              <select
                className="filter-select-input"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
              >
                <option value="all">Any Price</option>
                <option value="under-15k">&lt; ₹15,000</option>
                <option value="15k-25k">₹15k – ₹25k</option>
                <option value="above-25k">&gt; ₹25,000</option>
              </select>
            </div>

            {/* Checkbox: Furnished */}
            <label className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={furnishedOnly}
                onChange={(e) => setFurnishedOnly(e.target.checked)}
              />
              <span>Furnished Only</span>
            </label>

            {/* Checkbox: Roommates */}
            <label className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={roommatesAllowedOnly}
                onChange={(e) => setRoommatesAllowedOnly(e.target.checked)}
              />
              <span>Roommates Friendly</span>
            </label>

            {/* Reset */}
            <button className="btn btn-sm btn-outline" onClick={resetFilters} style={{ marginLeft: 'auto' }}>
              Reset Filters
            </button>
          </div>

          {/* Quick Category Chips */}
          <div className="filter-chips-scroll">
            {chipOptions.map(chip => (
              <button
                key={chip}
                className={`filter-chip ${selectedType === chip ? 'active' : ''}`}
                onClick={() => setSelectedType(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Discovery Body: Grid + Interactive Map Pin Section */}
      <div className="container" style={{ padding: '32px 24px 80px' }}>
        {/* Results Header & Sort */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Verified Spaces in {city}
            </h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Showing {properties.length} transparent properties with zero brokerage
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sort By:</span>
            <select
              className="filter-select-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="transparency">Transparency Score</option>
              <option value="rating">User Rating</option>
            </select>
          </div>
        </div>

        {/* Discovery Layout */}
        <div className="discovery-layout-grid">
          {/* Properties Cards List */}
          <div className="discovery-cards-col">
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading verified spaces...
              </div>
            ) : properties.length === 0 ? (
              <div className="empty-state-card" style={{ padding: '48px', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px dashed var(--border-medium)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏡</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No properties match this filter</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
                  Try resetting filters or expanding your budget range.
                </p>
                <button className="btn btn-sm btn-primary" onClick={resetFilters} style={{ marginTop: '16px' }}>
                  Reset Filters
                </button>
              </div>
            ) : (
              properties.map(prop => (
                <div
                  key={prop.id}
                  className={`property-card-row ${hoveredPinId === prop.id ? 'highlighted-row' : ''}`}
                  onMouseEnter={() => setHoveredPinId(prop.id)}
                  onMouseLeave={() => setHoveredPinId(null)}
                >
                  <div className="prop-row-img-wrap" onClick={() => openPropertyDetails(prop)}>
                    <img src={prop.images[0]} alt={prop.title} className="prop-row-img" loading="lazy" />
                    <button
                      className={`bookmark-btn ${savedProperties.has(prop.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveProperty(prop.id);
                      }}
                      title="Save property"
                    >
                      ♥
                    </button>
                    <span className="badge badge-verified" style={{ position: 'absolute', bottom: '8px', left: '8px' }}>
                      ✓ Verified
                    </span>
                  </div>

                  <div className="prop-row-body" onClick={() => openPropertyDetails(prop)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="card-type-tag">{prop.type}</span>
                      <div className="score-pill-mini">
                        ★ {prop.rating} ({prop.reviewsCount}) • {prop.transparencyScore}/100 Transparency
                      </div>
                    </div>

                    <h3 className="prop-row-title">{prop.title}</h3>
                    <p className="prop-row-locality">
                      📍 {prop.locality}, {prop.city} • {prop.distance}
                    </p>

                    <div className="prop-row-specs">
                      <span>{prop.specs.bedrooms} BHK</span>
                      <span>•</span>
                      <span>{prop.specs.area}</span>
                      <span>•</span>
                      <span>{prop.specs.furnishing}</span>
                    </div>

                    <div className="prop-row-footer">
                      <div>
                        <div className="prop-row-rent">
                          ₹{prop.rent.toLocaleString('en-IN')}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/mo</span>
                        </div>
                        <div className="deposit-info">Deposit: ₹{prop.deposit.toLocaleString('en-IN')}</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span className="cost-est-pill">
                            ₹{prop.estimatedLivingCost.toLocaleString('en-IN')}/mo total
                          </span>
                        </div>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPropertyDetails(prop);
                          }}
                        >
                          View Breakdown
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Interactive Map Visualizer */}
          <div className="discovery-map-col">
            <div className="interactive-map-card">
              <div className="map-card-header">
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Interactive Neighborhood Map</span>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{city}</span>
              </div>
              <div className="map-visual-container">
                {/* SVG Simulated Map Roads */}
                <svg className="map-svg-background" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 0,25 Q 40,30 100,20" stroke="#CBD5E1" strokeWidth="2.5" fill="none" />
                  <path d="M 0,55 Q 50,60 100,50" stroke="#CBD5E1" strokeWidth="2.5" fill="none" />
                  <path d="M 35,0 Q 40,50 35,100" stroke="#CBD5E1" strokeWidth="3" fill="none" />
                  <path d="M 65,0 Q 70,50 65,100" stroke="#CBD5E1" strokeWidth="2.5" fill="none" />
                  <circle cx="50" cy="50" r="12" fill="rgba(79, 70, 229, 0.05)" />
                </svg>

                {/* Property Pins */}
                {properties.map(prop => (
                  <div
                    key={prop.id}
                    className={`map-pin ${hoveredPinId === prop.id ? 'active' : ''}`}
                    style={{
                      left: `${prop.coordinates?.x || 50}%`,
                      top: `${prop.coordinates?.y || 50}%`
                    }}
                    onMouseEnter={() => setHoveredPinId(prop.id)}
                    onMouseLeave={() => setHoveredPinId(null)}
                    onClick={() => openPropertyDetails(prop)}
                    title={`${prop.title} - ₹${prop.rent}/mo`}
                  >
                    <div className="map-pin-pill">₹{Math.round(prop.rent / 1000)}k</div>
                  </div>
                ))}
              </div>
              <div className="map-card-footer">
                <span>💡 Hover over pins to inspect rent & location</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
