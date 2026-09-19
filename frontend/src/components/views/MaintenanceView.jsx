'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TicketAPI } from '../../services/api';

export default function MaintenanceView() {
  const { setIsReportIssueModalOpen } = useApp();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    TicketAPI.getTickets().then(res => {
      if (res && res.data) {
        setTickets(res.data);
      }
    });
  }, []);

  return (
    <section className="view-panel active" id="view-maintenance">
      <div className="container" style={{ padding: '32px 24px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '8px' }}>24/7 RAPID DISPATCH</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Maintenance & Repair Hub
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
              Track live service requests with guaranteed SLAs, certified technicians, and digital receipt tracking.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setIsReportIssueModalOpen(true)}
          >
            + Report New Issue
          </button>
        </div>

        {/* Tickets Grid / List */}
        <div className="maintenance-tickets-stack">
          {tickets.map(ticket => (
            <div key={ticket.id} className="ticket-card-box">
              {/* Top Row: Title, Urgency, Status */}
              <div className="ticket-top-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="ticket-category-icon">
                    {ticket.category === 'Plumbing' ? '🔧' : (ticket.category === 'Appliance' ? '❄️' : '💡')}
                  </span>
                  <div>
                    <h3 className="ticket-title">{ticket.title}</h3>
                    <p className="ticket-sub">
                      📍 {ticket.location} • {ticket.reportedAgo}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={`badge ${ticket.urgency === 'High' ? 'badge-rose' : (ticket.urgency === 'Medium' ? 'badge-amber' : 'badge-primary')}`}>
                    {ticket.urgency} Urgency
                  </span>
                  <span className={`badge ${ticket.status === 'Completed' ? 'badge-emerald' : (ticket.status === 'In Progress' ? 'badge-rose' : 'badge-amber')}`}>
                    ● {ticket.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="ticket-desc-text">
                "{ticket.description}"
              </p>

              {/* Technician Info */}
              {ticket.technician && (
                <div className="technician-info-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="tech-avatar-mini">👷</div>
                    <div>
                      <span className="tech-name">{ticket.technician.name}</span>
                      <span className="tech-rating">★ {ticket.technician.rating} Verified Pro</span>
                    </div>
                  </div>
                  <div className="tech-eta">
                    ETA: <strong>{ticket.technician.eta}</strong>
                  </div>
                </div>
              )}

              {/* Step Progress Timeline */}
              <div className="ticket-timeline-container">
                <div className="timeline-steps-track">
                  {ticket.timeline.map((step, idx) => (
                    <div key={idx} className={`timeline-step-point ${step.done ? 'completed' : ''}`}>
                      <div className="step-circle">
                        {step.done ? '✓' : idx + 1}
                      </div>
                      <div className="step-label">{step.label}</div>
                      <div className="step-time">{step.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
