'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div id="toast-container" className="toast-container">
      {toasts.map(t => (
        <div
          key={t.id}
          className="toast"
          onClick={() => removeToast(t.id)}
          style={{ cursor: 'pointer' }}
        >
          <span style={{ color: t.type === 'error' ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
            ●
          </span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
