'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PropertyAPI } from '../../services/api';

export default function PropertyDetailsModal() {
  const {
    selectedProperty,
    isPropertyModalOpen,
    closePropertyDetails,
    openAccommodationCheckout,
    currentUser,
    navigateTo,
    showToast
  } = useApp();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [customElectricity, setCustomElectricity] = useState(null);

  if (!isPropertyModalOpen || !selectedProperty) return null;

  const prop = selectedProperty;
  const currentElectricity = customElectricity !== null ? customElectricity : (prop.costBreakdown?.electricity || 1200);

  const totalLivingCost = (prop.costBreakdown?.rent || prop.rent) +
    currentElectricity +
    (prop.costBreakdown?.internet || 600) +
    (prop.costBreakdown?.maintenance || 800) +
    (prop.costBreakdown?.water || 200) +
    (prop.costBreakdown?.other || 500);

  const handleScheduleVisit = async () => {
    try {
      const res = await PropertyAPI.scheduleVisit({ propertyId: prop.id });
      showToast(res.message || 'Visit booked!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleApply = () => {
    closePropertyDetails();
    openAccommodationCheckout(prop);
  };

  const handleContactOwner = async () => {
    try {
      const res = await PropertyAPI.contactOwner({ propertyId: prop.id, message: 'Interested in this unit' });
      showToast(res.message || 'Inquiry sent to landlord');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="modal-overlay open" onClick={closePropertyDetails}>
      <div className="modal-box modal-large" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="card-type-tag">{prop.type}</span>
            <h2 className="modal-prop-title" style={{ marginTop: '4px', fontSize: '1.4rem' }}>{prop.title}</h2>
            <p className="modal-prop-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              📍 {prop.locality}, {prop.city} • {prop.distance}
            </p>
          </div>
          <button className="modal-close-btn" onClick={closePropertyDetails}>✕</button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-body-scroll">
          {/* Gallery */}
          <div className="modal-gallery">
            <div className="gallery-main-wrap">
              <img
                src={prop.images[activeImageIndex] || prop.images[0]}
                alt={prop.title}
                className="gallery-main-img"
              />
            </div>
            <div className="gallery-thumbs-row">
              {prop.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`View ${idx + 1}`}
                  className={`gallery-thumb ${activeImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                />
              ))}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="prop-quick-specs-grid">
            <div className="quick-spec-item">
              <span className="spec-icon">🛏️</span>
              <div>
                <div className="spec-val">{prop.specs.bedrooms} BHK</div>
                <div className="spec-lbl">Configuration</div>
              </div>
            </div>
            <div className="quick-spec-item">
              <span className="spec-icon">📐</span>
              <div>
                <div className="spec-val">{prop.specs.area}</div>
                <div className="spec-lbl">Carpet Area</div>
              </div>
            </div>
            <div className="quick-spec-item">
              <span className="spec-icon">🛋️</span>
              <div>
                <div className="spec-val">{prop.specs.furnishing}</div>
                <div className="spec-lbl">Furnishing</div>
              </div>
            </div>
            <div className="quick-spec-item">
              <span className="spec-icon">📅</span>
              <div>
                <div className="spec-val">{prop.minMonths || 2}–{prop.maxMonths || 12} Mos</div>
                <div className="spec-lbl">Stay Duration</div>
              </div>
            </div>
            <div className="quick-spec-item">
              <span className="spec-icon">🎓</span>
              <div>
                <div className="spec-val">{prop.campusDistances?.['Nirma University'] || '1.2 km (4m)'}</div>
                <div className="spec-lbl">Near Nirma Univ</div>
              </div>
            </div>
          </div>

          {/* Dynamic Living Cost Simulator */}
          <div className="cost-breakdown-card">
            <div className="cost-card-header">
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>💡 Radical Living Cost Simulator</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Unlike typical brokers who hide electricity & society charges, see your exact monthly expense.
                </p>
              </div>
              <div className="total-cost-badge">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Monthly Total</span>
                <div className="total-cost-num">₹{totalLivingCost.toLocaleString('en-IN')}/mo</div>
              </div>
            </div>

            {/* Slider */}
            <div className="cost-slider-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span>Simulate Your Monthly AC / Electricity Usage:</span>
                <strong>₹{currentElectricity.toLocaleString('en-IN')}</strong>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={currentElectricity}
                onChange={(e) => setCustomElectricity(Number(e.target.value))}
                className="range-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span>Mild usage (₹500)</span>
                <span>Heavy Summer AC (₹5,000)</span>
              </div>
            </div>

            {/* Items Grid */}
            <div className="cost-items-grid">
              <div className="cost-item">
                <span>Base Rent:</span>
                <strong>₹{prop.rent.toLocaleString('en-IN')}</strong>
              </div>
              <div className="cost-item">
                <span>Electricity (est.):</span>
                <strong>₹{currentElectricity.toLocaleString('en-IN')}</strong>
              </div>
              <div className="cost-item">
                <span>High-Speed Wi-Fi:</span>
                <strong>₹{(prop.costBreakdown?.internet || 600).toLocaleString('en-IN')}</strong>
              </div>
              <div className="cost-item">
                <span>Society Maintenance:</span>
                <strong>₹{(prop.costBreakdown?.maintenance || 800).toLocaleString('en-IN')}</strong>
              </div>
              <div className="cost-item">
                <span>Drinking Water (RO):</span>
                <strong>₹{(prop.costBreakdown?.water || 200).toLocaleString('en-IN')}</strong>
              </div>
              <div className="cost-item">
                <span>Household Misc:</span>
                <strong>₹{(prop.costBreakdown?.other || 500).toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

          {/* Transparency Score Breakdown */}
          <div className="transparency-breakdown-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                🛡️ Transparency Score: {prop.transparencyScore}/100
              </h3>
              <span className="badge badge-verified">Verified Listing</span>
            </div>

            <div className="transparency-meters-grid">
              <div className="trans-meter">
                <div className="meter-label">Pricing Honesty ({prop.transparencyBreakdown?.pricing}%)</div>
                <div className="meter-bar"><div className="meter-fill" style={{ width: `${prop.transparencyBreakdown?.pricing}%` }}></div></div>
              </div>
              <div className="trans-meter">
                <div className="meter-label">Agreement Clarity ({prop.transparencyBreakdown?.agreement}%)</div>
                <div className="meter-bar"><div className="meter-fill" style={{ width: `${prop.transparencyBreakdown?.agreement}%` }}></div></div>
              </div>
              <div className="trans-meter">
                <div className="meter-label">Owner Track Record ({prop.transparencyBreakdown?.owner}%)</div>
                <div className="meter-bar"><div className="meter-fill" style={{ width: `${prop.transparencyBreakdown?.owner}%` }}></div></div>
              </div>
              <div className="trans-meter">
                <div className="meter-label">Physical Inspection ({prop.transparencyBreakdown?.physical}%)</div>
                <div className="meter-bar"><div className="meter-fill" style={{ width: `${prop.transparencyBreakdown?.physical}%` }}></div></div>
              </div>
            </div>
          </div>

          {/* Amenities Chips */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>Amenities & Features</h3>
            <div className="amenities-chips-wrap">
              {prop.amenities.map(a => (
                <span key={a} className="amenity-chip">✓ {a}</span>
              ))}
            </div>
          </div>

          {/* Owner Box */}
          <div className="host-info-card" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="host-avatar">👤</div>
              <div>
                <h4 style={{ fontWeight: 700 }}>Hosted by {prop.owner.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {prop.owner.experience} • Response time {prop.owner.responseTime} ({prop.owner.responseRate})
                </p>
              </div>
            </div>
            <button className="btn btn-sm btn-outline" onClick={handleContactOwner}>
              Contact Host
            </button>
          </div>

          {/* Simplified Agreement Preview */}
          <div className="agreement-preview-box" style={{ marginTop: '24px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px' }}>
              📄 Key Rental Agreement Terms (Zero Hidden Clauses)
            </h4>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.6 }}>
              <li><strong>Rent:</strong> {prop.simplifiedAgreement?.rentAmount}</li>
              <li><strong>Deposit:</strong> {prop.simplifiedAgreement?.depositRefund}</li>
              <li><strong>Notice Period:</strong> {prop.simplifiedAgreement?.noticePeriod}</li>
              <li><strong>Repairs:</strong> {prop.simplifiedAgreement?.maintenanceRule}</li>
            </ul>
            <button
              className="btn btn-sm btn-outline"
              style={{ marginTop: '12px', width: '100%' }}
              onClick={() => {
                closePropertyDetails();
                navigateTo('agreement');
              }}
            >
              View Full Plain-English Lease Deed →
            </button>
          </div>
        </div>

        {/* Modal Sticky Bottom Action Bar */}
        <div className="modal-footer-actions">
          <button className="btn btn-outline" onClick={handleScheduleVisit}>
            📅 Schedule In-Person Tour
          </button>
          <button className="btn btn-primary" onClick={handleApply}>
            Book Accommodation (Zero Brokerage) →
          </button>
        </div>
      </div>
    </div>
  );
}
