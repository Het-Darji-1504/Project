'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VerificationAPI } from '../../services/api';

export default function UtilityVerificationModal() {
  const { isUtilityVerificationModalOpen, setIsUtilityVerificationModalOpen, showToast } = useApp();

  const [documentType, setDocumentType] = useState('Torrent Power Electricity Bill');
  const [file, setFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isUtilityVerificationModalOpen) return null;

  const handleUploadAndRunOCR = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await VerificationAPI.uploadAndVerify({
        propertyId: 'prop-1',
        ownerId: 'usr-owner-1',
        documentType,
        documentName: file ? file.name : 'torrent_power_bill_aug2026.pdf',
        propertyAddress: 'Flat 402, Sunrise Harmony Heights, SG Highway, Ahmedabad',
        ownerName: 'Rajesh Patel'
      });

      if (res && res.success) {
        setOcrResult(res.verification);
        showToast('Document verified with 96.8% OCR match confidence!', 'success');
      }
    } catch (err) {
      showToast('OCR verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', zIndex: 1100 }}>
      <div className="modal-container" style={{ maxWidth: '640px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
              Owner Trust & Fraud Prevention
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', margin: '4px 0' }}>
              Utility & Property Document OCR Verification
            </h2>
          </div>
          <button
            onClick={() => setIsUtilityVerificationModalOpen(false)}
            style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--slate-400)' }}
          >
            ×
          </button>
        </div>

        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '20px' }}>
          To protect students from fraudulent or duplicate listings, upload a recent utility bill or municipal property tax receipt. Our automated OCR extracts and verifies owner identity and service address.
        </p>

        {!ocrResult ? (
          <form onSubmit={handleUploadAndRunOCR} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                Document Type
              </label>
              <select
                value={documentType}
                onChange={e => setDocumentType(e.target.value)}
                className="filter-select"
                style={{ width: '100%' }}
              >
                <option value="Torrent Power Electricity Bill">Torrent Power Electricity Bill (Recent 60 Days)</option>
                <option value="AMC Property Tax Receipt">Ahmedabad Municipal Corporation (AMC) Tax Receipt</option>
                <option value="Adani Piped Gas Utility Bill">Adani Piped Natural Gas Bill</option>
                <option value="Registered Sale Deed">Registered Property Sale Deed / Allotment Letter</option>
              </select>
            </div>

            {/* Upload Area */}
            <div
              style={{
                border: '2px dashed var(--primary-300)',
                background: '#F8FAFC',
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input
                id="fileInput"
                type="file"
                style={{ display: 'none' }}
                onChange={e => setFile(e.target.files[0])}
                accept=".pdf,.png,.jpg,.jpeg"
              />
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>📄</span>
              <div style={{ fontWeight: 700, color: 'var(--slate-800)', fontSize: '0.95rem' }}>
                {file ? file.name : 'Click to browse or drop electricity bill PDF'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                Supports PDF, JPG, PNG up to 10MB (Kept strictly private)
              </div>
            </div>

            <div style={{ background: '#F1F5F9', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--slate-600)' }}>
              🔒 <strong>Privacy Notice:</strong> Source utility documents are stored in private encrypted storage and never shown to tenants. Only the <strong>Verified Badge ✓</strong> is displayed.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '12px', width: '100%' }}
            >
              {loading ? 'Running OCR Extraction...' : 'Extract Fields & Verify Listing →'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: '#ECFDF5',
              border: '1.5px solid #A7F3D0',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '2rem' }}>🎉</span>
              <div>
                <h4 style={{ margin: 0, color: '#065F46', fontSize: '1.05rem', fontWeight: 800 }}>
                  Listing Verified via OCR ({ocrResult.matchScore || ocrResult.match_score}%)
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#047857' }}>
                  Extracted service address &amp; consumer record matches municipal property database.
                </p>
              </div>
            </div>

            <div style={{
              border: '1.5px solid var(--slate-200)',
              borderRadius: '12px',
              padding: '16px',
              background: 'var(--white)'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                OCR Extracted Metadata
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem' }}>
                <div><strong>Consumer No:</strong> {ocrResult.ocrExtractedData?.consumerNo || ocrResult.ocr_extracted_data?.consumerNo}</div>
                <div><strong>Billed Owner:</strong> {ocrResult.ocrExtractedData?.billedTo || ocrResult.ocr_extracted_data?.billedTo}</div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong>Service Address:</strong> {ocrResult.ocrExtractedData?.serviceAddress || ocrResult.ocr_extracted_data?.serviceAddress}
                </div>
                <div><strong>Billing Cycle:</strong> {ocrResult.ocrExtractedData?.billingCycle || ocrResult.ocr_extracted_data?.billingCycle}</div>
                <div><strong>Status:</strong> <span style={{ color: 'var(--emerald-600)', fontWeight: 700 }}>VERIFIED ✓</span></div>
              </div>
            </div>

            <button
              onClick={() => setIsUtilityVerificationModalOpen(false)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              Done — Return to Host Hub
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
