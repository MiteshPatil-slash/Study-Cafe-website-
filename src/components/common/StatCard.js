import React from 'react';
import { useApp } from '../../context/AppContext';
import { getTheme } from '../../utils/theme';

export default function StatCard({ label, value, icon, color }) {
  const { dark } = useApp();
  const css = getTheme(dark);

  return (
    <div
      style={{
        ...css.card,
        padding: '24px 20px',
        borderRadius: 16,
        animation: 'fadeInUp 0.4s ease forwards',
        opacity: 0,
      }}
    >
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <div>
          <p
            style={{
              fontSize: 13,
              color: dark ? '#64748b' : '#94a3b8',
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: dark ? '#fff' : '#0f0f23',
              letterSpacing: '-1.5px',
              lineHeight: 1,
            }}
          >
            {value}
          </p>
        </div>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
