'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TicketAPI } from '../../services/api';

export default function ReportIssueModal() {
  const {
    isReportIssueModalOpen,
    setIsReportIssueModalOpen,
    showToast
  } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [urgency, setUrgency] = useState('High');
  const [location, setLocation] = useState('Master Bathroom');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isReportIssueModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    setSubmitting(true);
    try {
      const res = await TicketAPI.createTicket({
        title,
        category,
        urgency,
        location,
        description
      });
      showToast(res.message || 'Maintenance ticket created!');
      setIsReportIssueModalOpen(false);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay open" onClick={() => setIsReportIssueModalOpen(false)}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Report Maintenance Issue</h3>
          <button className="modal-close-btn" onClick={() => setIsReportIssueModalOpen(false)}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Issue Summary</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Master Bathroom Mixer Tap Dripping"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div className="form-group">
              <label className="form-label">Trade / Category</label>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Plumbing">🔧 Plumbing</option>
                <option value="Electrical">💡 Electrical</option>
                <option value="Appliance">❄️ AC / Appliance</option>
                <option value="Carpentry">🚪 Carpentry / Locks</option>
                <option value="Painting">🎨 Seepage / Wall Paint</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Urgency Level</label>
              <select
                className="form-input"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
              >
                <option value="High">🔴 High (Within 4 hrs)</option>
                <option value="Medium">🟡 Medium (Within 24 hrs)</option>
                <option value="Low">🟢 Low (Routine repair)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Specific Location Inside Flat</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Master Bedroom Ensuite"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Detailed Notes for Vendor</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Please mention any specific access timings or severity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ background: 'var(--accent-emerald-light)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--accent-emerald-dark)', marginBottom: '18px' }}>
            ✓ <strong>Lease SLA Protection:</strong> Per clause 5 of your agreement, structural & mainline plumbing fixes are 100% borne by the property owner.
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={submitting}
          >
            {submitting ? 'Dispatching...' : 'Dispatch Verified Technician'}
          </button>
        </form>
      </div>
    </div>
  );
}
