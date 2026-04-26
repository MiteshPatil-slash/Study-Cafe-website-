import React from 'react';
import { useApp } from '../../context/AppContext';
import { getTheme } from '../../utils/theme';
import { Icons } from '../../utils/icons';

export default function SearchBar({ value, onChange, placeholder = 'Search...', maxWidth = 400 }) {
  const { dark } = useApp();
  const css = getTheme(dark);

  return (
    <div style={{ position: 'relative', maxWidth, width: '100%' }}>
      <span
        style={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          color: dark ? '#475569' : '#94a3b8',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Icons.Search />
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...css.input, paddingLeft: 44 }}
      />
    </div>
  );
}
