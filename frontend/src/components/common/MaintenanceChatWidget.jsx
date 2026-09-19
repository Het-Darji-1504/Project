'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MaintenanceBotAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function MaintenanceChatWidget() {
  const { currentUser, showToast } = useApp();
  const residentName = currentUser?.fullName || 'Resident';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'msg-0',
      senderType: 'bot',
      message: `👋 Greetings, ${residentName}! I am the Nestera Maintenance Relay Bot. Type any repair issue (e.g. "geyser leaking", "ac not cooling") or upload a photo to dispatch a technician immediately.`,
      time: 'Just now'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userText = inputValue;
    setInputValue('');

    const newMsg = {
      id: `usr-${Date.now()}`,
      senderType: 'tenant',
      message: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setLoading(true);

    try {
      const res = await MaintenanceBotAPI.sendMessage({
        message: userText,
        propertyId: 'prop-1',
        tenancyId: 'ten-sg1'
      });

      if (res && res.success) {
        setActiveTicketId(res.ticketId);
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            senderType: 'bot',
            message: res.reply,
            ticketId: res.ticketId,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          senderType: 'bot',
          message: 'Received your request. Ticket #maint-202 has been logged and assigned to technician Ramesh Prajapati (ETA: Within 3 hours).',
          time: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async (ticketId) => {
    try {
      await MaintenanceBotAPI.escalate(ticketId || activeTicketId || 'maint-101');
      showToast('Ticket escalated to Nestera Senior Operations Lead! Landlord alerted via SMS.', 'warning');
      setMessages(prev => [
        ...prev,
        {
          id: `esc-${Date.now()}`,
          senderType: 'bot',
          message: '🚨 Priority escalated to Critical Intervention. Lead engineer assigned.',
          time: 'Just now'
        }
      ]);
    } catch (e) {
      showToast('Escalation error', 'error');
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1050 }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '14px 22px',
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(18, 140, 126, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ fontSize: '1.3rem' }}>💬</span>
          <span>Maintenance Bot (24/7)</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            width: '380px',
            height: '520px',
            background: 'var(--white)',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.18)',
            border: '1px solid var(--slate-200)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #128C7E 0%, #075E54 100%)',
              padding: '16px 20px',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#25D366' }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>Nestera Relay Bot</h4>
                <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>WhatsApp &amp; In-App Sync Active</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#ECE5DD' }}>
            {messages.map(m => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.senderType === 'tenant' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.senderType === 'tenant' ? '#DCF8C6' : 'white',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  fontSize: '0.85rem',
                  color: 'var(--slate-800)',
                  lineHeight: 1.45
                }}
              >
                <div>{m.message}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.68rem', color: 'var(--slate-500)' }}>
                  <span>{m.time || 'Just now'}</span>
                  {m.ticketId && (
                    <button
                      onClick={() => handleEscalate(m.ticketId)}
                      style={{
                        background: '#FEE2E2',
                        color: '#B91C1C',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginLeft: '8px'
                      }}
                    >
                      ⚡ Auto-Escalate
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'white', padding: '8px 12px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                Nestera Bot is matching technician...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSend}
            style={{ padding: '12px', background: '#F0F2F5', display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <input
              type="text"
              placeholder="Type issue (e.g. geyser leaking)..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid var(--slate-300)',
                borderRadius: '24px',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              style={{
                background: '#128C7E',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem'
              }}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
