'use client';

import React, { useState } from 'react';
import { ValuationAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function ValuationView() {
  const { showToast } = useApp();

  const [locality, setLocality] = useState('sg-highway');
  const [bhk, setBhk] = useState(2);
  const [area, setArea] = useState(1150);
  const [furnishing, setFurnishing] = useState('Furnished');
  const [amenities, setAmenities] = useState({
    wifi: true,
    ac: true,
    kitchen: true,
    parking: true,
    powerBackup: true,
    gym: false
  });

  const [result, setResult] = useState({
    fairRent: 18000,
    minRange: 16500,
    maxRange: 19500,
    deposit: 36000,
    fairnessScore: 94,
    marketRentAverage: 20500,
    savingsPerYear: 30000
  });

  const [calculating, setCalculating] = useState(false);

  const toggleAmenity = (key) => {
    setAmenities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setCalculating(true);
    const count = Object.values(amenities).filter(Boolean).length;
    try {
      const res = await ValuationAPI.calculate({
        locality,
        bhk,
        area,
        furnishing,
        amenitiesCount: count
      });
      if (res && res.data) {
        setResult(res.data);
        showToast('Fair market valuation updated!');
      }
    } catch (err) {
      console.error(err);
    }
    setCalculating(false);
  };

  return (
    <section className="view-panel active" id="view-valuation">
      <div className="container" style={{ padding: '32px 24px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>DATA-DRIVEN RENT BENCHMARK</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Fair Rent Valuation Calculator
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '6px' }}>
            Empowering renters and property owners with objective, algorithm-backed rent estimations based on carpet area, neighborhood density, and real amenities.
          </p>
        </div>

        <div className="valuation-grid-layout">
          {/* Form Side */}
          <form className="valuation-form-card" onSubmit={handleCalculate}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Property Details</h3>

            {/* Locality */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Micro-Market / Locality</label>
              <select
                className="form-input"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
              >
                <option value="sg-highway">SG Highway & Nirma University Hub</option>
                <option value="bodakdev">Bodakdev & Judges Bungalow Road</option>
                <option value="prahlad-nagar">Prahlad Nagar & Anandnagar</option>
                <option value="navrangpura">Navrangpura (CEPT & Gujarat Univ)</option>
                <option value="gift-city">GIFT City / Koba Circle</option>
                <option value="gota">Gota / Chandlodiya Corridor</option>
              </select>
            </div>

            {/* BHK & Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Configuration (BHK)</label>
                <select
                  className="form-input"
                  value={bhk}
                  onChange={(e) => {
                    const b = Number(e.target.value);
                    setBhk(b);
                    setArea(b === 1 ? 550 : (b === 2 ? 1150 : 1650));
                  }}
                >
                  <option value={1}>1 BHK / Studio</option>
                  <option value={2}>2 BHK</option>
                  <option value={3}>3 BHK</option>
                  <option value={4}>4 BHK / Penthouse</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Carpet Area (sq.ft)</label>
                <input
                  type="number"
                  className="form-input"
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Furnishing */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Furnishing Status</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {['Unfurnished', 'Semi-Furnished', 'Furnished'].map(f => (
                  <button
                    key={f}
                    type="button"
                    className={`btn btn-sm ${furnishing === f ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFurnishing(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities Included */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Included Amenities</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label className="filter-checkbox-label">
                  <input type="checkbox" checked={amenities.wifi} onChange={() => toggleAmenity('wifi')} />
                  <span>High-Speed Wi-Fi</span>
                </label>
                <label className="filter-checkbox-label">
                  <input type="checkbox" checked={amenities.ac} onChange={() => toggleAmenity('ac')} />
                  <span>Inverter AC</span>
                </label>
                <label className="filter-checkbox-label">
                  <input type="checkbox" checked={amenities.kitchen} onChange={() => toggleAmenity('kitchen')} />
                  <span>Modular Kitchen</span>
                </label>
                <label className="filter-checkbox-label">
                  <input type="checkbox" checked={amenities.parking} onChange={() => toggleAmenity('parking')} />
                  <span>Dedicated Parking</span>
                </label>
                <label className="filter-checkbox-label">
                  <input type="checkbox" checked={amenities.powerBackup} onChange={() => toggleAmenity('powerBackup')} />
                  <span>100% Power Backup</span>
                </label>
                <label className="filter-checkbox-label">
                  <input type="checkbox" checked={amenities.gym} onChange={() => toggleAmenity('gym')} />
                  <span>Society Gym / Pool</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={calculating}>
              {calculating ? 'Analyzing Market Data...' : 'Recalculate Fair Valuation'}
            </button>
          </form>

          {/* Results Side */}
          <div className="valuation-results-col">
            <div className="valuation-output-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-verified">✓ Nestora Fair Index</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Updated Today</span>
              </div>

              <div style={{ margin: '20px 0' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Recommended Fair Rent</div>
                <div className="valuation-huge-rent">
                  ₹{result.fairRent.toLocaleString('en-IN')}
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald-dark)', fontWeight: 600, marginTop: '4px' }}>
                  Fair Market Window: ₹{result.minRange.toLocaleString('en-IN')} – ₹{result.maxRange.toLocaleString('en-IN')}/mo
                </div>
              </div>

              <div className="valuation-breakdown-box">
                <div className="v-row">
                  <span>Estimated Security Deposit:</span>
                  <strong>₹{result.deposit.toLocaleString('en-IN')} (2 Months)</strong>
                </div>
                <div className="v-row">
                  <span>Local Market Average:</span>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                    ₹{result.marketRentAverage.toLocaleString('en-IN')}/mo
                  </span>
                </div>
                <div className="v-row highlight">
                  <span>Your Annual Savings:</span>
                  <strong style={{ color: 'var(--accent-emerald-dark)' }}>
                    +₹{result.savingsPerYear.toLocaleString('en-IN')}/year
                  </strong>
                </div>
              </div>

              <div className="valuation-guarantee-note">
                🛡️ <strong>Zero Brokerage Protection:</strong> If any broker or owner demands more than our fair range, report it for a verified alternate listing guarantee.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
