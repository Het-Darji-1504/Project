'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { OwnerAPI } from '../../services/api';

export default function OwnerView() {
  const { setIsAddPropertyModalOpen } = useApp();
  const [data, setData] = useState(null);

  const loadDashboard = () => {
    OwnerAPI.getDashboard().then(res => {
      if (res && res.data) {
        setData(res.data);
      }
    });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = data?.stats || {
    activeProperties: 8,
    occupiedUnits: 7,
    occupancyRate: '87.5%',
    monthlyRevenue: 142000,
    pendingMaintenance: 2,
    onTimePayments: '94%'
  };

  const properties = data?.properties || [];

  return (
    <section className="view-panel active" id="view-owner">
      <div className="container" style={{ padding: '32px 24px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>LANDLORD & HOST HUB</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Property Portfolio & Yield Overview
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
              Direct oversight of units, tenant KYC status, automated rent payouts, and scheduled maintenance.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setIsAddPropertyModalOpen(true)}
          >
            + List New Property
          </button>
        </div>

        {/* Stats Grid */}
        <div className="tenant-kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Active Portfolio Units</div>
            <div className="kpi-value">{stats.activeProperties} Units</div>
            <div className="kpi-subtext" style={{ color: 'var(--accent-emerald-dark)' }}>
              {stats.occupiedUnits} Currently Occupied
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Portfolio Occupancy</div>
            <div className="kpi-value">{stats.occupancyRate}</div>
            <div className="kpi-subtext">Avg time to lease: 6 days</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Monthly Gross Revenue</div>
            <div className="kpi-value" style={{ color: 'var(--primary)' }}>
              ₹{Number(stats.monthlyRevenue).toLocaleString('en-IN')}
            </div>
            <div className="kpi-subtext">Automated direct bank payout</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">On-Time Rent Rate</div>
            <div className="kpi-value" style={{ color: 'var(--accent-emerald-dark)' }}>
              {stats.onTimePayments}
            </div>
            <div className="kpi-subtext">Backed by Nestora guarantee</div>
          </div>
        </div>

        {/* Properties Table */}
        <div className="owner-table-card" style={{ marginTop: '36px' }}>
          <div className="owner-table-header">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Managed Living Units</h3>
          </div>

          <div className="table-responsive">
            <table className="owner-table">
              <thead>
                <tr>
                  <th>Property / Unit</th>
                  <th>Locality</th>
                  <th>Tenant</th>
                  <th>Rent / Mo</th>
                  <th>Unit Status</th>
                  <th>Rent Collection</th>
                  <th>Maintenance</th>
                  <th>Lease Expiry</th>
                </tr>
              </thead>
              <tbody>
                {properties.map(p => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.title}</strong>
                    </td>
                    <td>{p.locality}</td>
                    <td>{p.tenant}</td>
                    <td>
                      <strong>₹{p.rent?.toLocaleString('en-IN')}</strong>
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'Occupied' ? 'badge-emerald' : 'badge-amber'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.paymentStatus?.includes('Paid') ? 'badge-verified' : 'badge-rose'}`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td>{p.maintenanceStatus}</td>
                    <td>{p.leaseExpiry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
