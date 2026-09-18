'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OwnerAPI } from '../../services/api';

export default function AddPropertyModal() {
  const {
    isAddPropertyModalOpen,
    setIsAddPropertyModalOpen,
    showToast
  } = useApp();

  const [title, setTitle] = useState('');
  const [rent, setRent] = useState('');
  const [locality, setLocality] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAddPropertyModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !rent) return;

    setSubmitting(true);
    try {
      const res = await OwnerAPI.addProperty({
        title,
        rent: Number(rent),
        locality: locality || 'SG Highway, Ahmedabad'
      });
      showToast(res.message || 'Property listed!');
      setIsAddPropertyModalOpen(false);
      setTitle('');
      setRent('');
      setLocality('');
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay open" onClick={() => setIsAddPropertyModalOpen(false)}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>List a New Living Unit</h3>
          <button className="modal-close-btn" onClick={() => setIsAddPropertyModalOpen(false)}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Property Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Palm Grove Luxury Living - Flat 504"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Monthly Expected Rent (₹)</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 18000"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Locality / Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. SG Highway, Bodakdev, Ahmedabad"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
            />
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            🔒 All listings undergo 24-hour physical verification by the Nestora on-ground team to ensure zero misrepresentation.
          </p>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={submitting}
          >
            {submitting ? 'Listing...' : 'List Property with Nestora Protection'}
          </button>
        </form>
      </div>
    </div>
  );
}
