import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getTheme } from '../../utils/theme';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppShell({ children }) {
  const { dark } = useApp();
  const css = getTheme(dark);
  const [sideOpen, setSideOpen] = useState(true);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        ...css.app,
      }}
    >
      <Sidebar open={sideOpen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Header onToggleSidebar={() => setSideOpen((s) => !s)} />
        <main
          style={{
            flex: 1,
            padding: '32px 28px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
