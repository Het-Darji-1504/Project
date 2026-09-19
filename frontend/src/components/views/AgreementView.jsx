'use client';

import React, { useState, useEffect } from 'react';
import { AgreementAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function AgreementView() {
  const { currentUser, showToast } = useApp();
  const [clauses, setClauses] = useState([]);
  const [signed, setSigned] = useState(false);
  const [signing, setSigning] = useState(false);
  const [clarificationModalOpen, setClarificationModalOpen] = useState(false);
  const [selectedClause, setSelectedClause] = useState(null);
  const [questionText, setQuestionText] = useState('');

  const residentName = currentUser?.fullName || 'Resident';

  useEffect(() => {
    AgreementAPI.getClauses().then(res => {
      if (res && res.data) {
        setClauses(res.data);
      }
    });
  }, []);

  const handleSign = async () => {
    setSigning(true);
    try {
      const res = await AgreementAPI.sign({
        signerName: residentName,
        aadhaarNumber: 'XXXX-XXXX-4892'
      });
      setSigned(true);
      showToast(res.message || 'Agreement eSigned successfully!');
    } catch (e) {
      console.error(e);
    }
    setSigning(false);
  };

  const handleDownload = () => {
    showToast('Preparing legally verified, e-stamped PDF draft for download...');
  };

  const submitClarification = async (e) => {
    e.preventDefault();
    if (!questionText) return;
    try {
      const res = await AgreementAPI.requestClarification({
        clauseId: selectedClause?.id,
        question: questionText
      });
      showToast(res.message || 'Question submitted!');
      setClarificationModalOpen(false);
      setQuestionText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="view-panel active" id="view-agreement">
      <div className="container" style={{ padding: '32px 24px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-verified" style={{ marginBottom: '8px' }}>RADICAL LEGAL TRANSPARENCY</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Plain-English Digital Lease Agreement
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
              Standard archaic legal text translated into transparent, unambiguous terms protecting both tenant and owner.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline" onClick={handleDownload}>
              📄 Download PDF
            </button>
            <button
              className={`btn ${signed ? 'btn-outline' : 'btn-primary'}`}
              onClick={handleSign}
              disabled={signing || signed}
            >
              {signed ? '✓ Stamped & Signed' : (signing ? 'Authenticating Aadhaar...' : 'Aadhaar eSign Deed')}
            </button>
          </div>
        </div>

        {/* Agreement Status Banner */}
        <div className="agreement-status-pill-banner">
          <div>
            <strong>Property:</strong> Palm Grove Luxury Living - Flat 402 • <strong>Host:</strong> Vikrambhai Patel • <strong>Tenant:</strong> {residentName}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="badge badge-emerald">11 Months Lease</span>
            <span className={`badge ${signed ? 'badge-verified' : 'badge-amber'}`}>
              {signed ? '✓ Fully Executed' : 'Awaiting Digital Signature'}
            </span>
          </div>
        </div>

        {/* Clauses List */}
        <div className="clauses-stack">
          {clauses.map((clause, idx) => (
            <div key={clause.id} className="clause-card-box">
              <div className="clause-card-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="clause-number-pill">0{idx + 1}</span>
                  <h3 className="clause-title">{clause.clauseTitle}</h3>
                </div>
                <div className="clause-highlight-badge">{clause.highlightValue}</div>
              </div>

              <div className="clause-columns-grid">
                {/* Archaic Legal Jargon */}
                <div className="clause-legal-col">
                  <div className="clause-col-header legal">Standard Court Legalese</div>
                  <p className="clause-text legal-text">
                    "{clause.standardLegal}"
                  </p>
                </div>

                {/* Plain English Translation */}
                <div className="clause-plain-col">
                  <div className="clause-col-header plain">✨ Nestera Plain-English Guarantee</div>
                  <p className="clause-text plain-text">
                    {clause.plainEnglish}
                  </p>
                </div>
              </div>

              <div className="clause-card-footer">
                <button
                  className="btn btn-sm btn-outline"
                  style={{ fontSize: '0.8rem', padding: '4px 12px' }}
                  onClick={() => {
                    setSelectedClause(clause);
                    setClarificationModalOpen(true);
                  }}
                >
                  ❓ Ask for Clarification on this clause
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Clarification Modal */}
        {clarificationModalOpen && (
          <div className="modal-overlay open" onClick={() => setClarificationModalOpen(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <div className="modal-header">
                <h3>Ask Legal Assist: {selectedClause?.clauseTitle}</h3>
                <button className="modal-close-btn" onClick={() => setClarificationModalOpen(false)}>✕</button>
              </div>
              <form onSubmit={submitClarification} style={{ padding: '20px' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  Our in-house rental advocates will review your query and provide a clear, plain-language answer.
                </p>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Your Question</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="e.g. Can my cousin stay for a week during holidays under this clause?"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Submit Inquiry
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
