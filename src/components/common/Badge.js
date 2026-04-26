import React from 'react';

export default function Badge({ label, color = '#6366f1', size = 'sm' }) {
  const padding = size === 'xs' ? '2px 8px' : '3px 10px';
  const fontSize = size === 'xs' ? 10 : 11;

  return (
    <span
      style={{
        fontSize,
        padding,
        borderRadius: 100,
        background: `${color}20`,
        color: color,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}
