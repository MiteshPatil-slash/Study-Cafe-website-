import React from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../utils/icons';

export default function Toast() {
  const { toasts, removeToast } = useApp();

  const bgMap = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#6366f1',
  };

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          style={{
            background: bgMap[t.type] || bgMap.success,
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 14,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            animation: 'slideInRight 0.3s ease',
            maxWidth: 340,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            pointerEvents: 'all',
            userSelect: 'none',
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {iconMap[t.type] || iconMap.success}
          </span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
