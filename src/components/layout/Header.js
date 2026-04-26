import React from 'react';
import { useApp } from '../../context/AppContext';
import { getTheme } from '../../utils/theme';
import { Icons } from '../../utils/icons';

export default function Header({ onToggleSidebar }) {
  const { dark, setDark } = useApp();
  const css = getTheme(dark);

  return (
    <header
      style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        background: dark ? 'rgba(5,8,16,0.85)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      <button onClick={onToggleSidebar} style={css.iconBtn}>
        <Icons.Menu />
      </button>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          onClick={() => setDark((d) => !d)}
          style={css.iconBtn}
          title="Toggle theme"
        >
          {dark ? <Icons.Sun /> : <Icons.Moon />}
        </button>
        <button style={css.iconBtn} title="Notifications">
          <Icons.Bell />
        </button>
      </div>
    </header>
  );
}
