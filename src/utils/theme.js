// Returns inline style objects based on dark/light mode
export function getTheme(dark) {
  return {
    app: {
      background: dark ? '#050810' : '#f1f5f9',
      color: dark ? '#f1f5f9' : '#0f0f23',
    },
    card: {
      background: dark ? '#0c1020' : '#ffffff',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
    },
    cardHover: {
      boxShadow: dark
        ? '0 20px 60px rgba(0,0,0,0.4)'
        : '0 20px 60px rgba(0,0,0,0.12)',
    },
    input: {
      width: '100%',
      padding: '11px 14px',
      borderRadius: 10,
      fontSize: 14,
      border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
      background: dark ? '#0a0f1e' : '#f8f9ff',
      color: dark ? '#f1f5f9' : '#0f0f23',
      outline: 'none',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
    },
    label: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: dark ? '#94a3b8' : '#64748b',
      marginBottom: 8,
    },
    btnPrimary: {
      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      color: '#fff',
      border: 'none',
      borderRadius: 10,
      fontWeight: 700,
      cursor: 'pointer',
      letterSpacing: '-0.2px',
      fontFamily: 'inherit',
    },
    btnOutline: {
      background: 'transparent',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
      color: dark ? '#f1f5f9' : '#0f0f23',
      borderRadius: 10,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit',
    },
    btnDanger: {
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.3)',
      color: '#ef4444',
      borderRadius: 8,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit',
    },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 10,
      border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      background: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: dark ? '#64748b' : '#94a3b8',
    },
    tableHeader: {
      padding: '14px 20px',
      textAlign: 'left',
      fontSize: 12,
      fontWeight: 600,
      color: dark ? '#64748b' : '#94a3b8',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
    },
    tableRow: {
      borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
    },
    tableCell: {
      padding: '13px 20px',
      fontSize: 13,
    },
    subText: {
      color: dark ? '#64748b' : '#94a3b8',
    },
    heading: {
      color: dark ? '#ffffff' : '#0f0f23',
    },
    bodyText: {
      color: dark ? '#f1f5f9' : '#0f0f23',
    },
    mutedText: {
      color: dark ? '#475569' : '#94a3b8',
    },
    divider: {
      borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    },
    sidebarBg: {
      background: dark ? '#0c1020' : '#ffffff',
      borderRight: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
    },
    navActive: {
      background: 'rgba(99,102,241,0.15)',
      color: '#818cf8',
    },
    navInactive: {
      background: 'transparent',
      color: dark ? '#64748b' : '#64748b',
    },
    badge: (color) => ({
      fontSize: 11,
      padding: '3px 10px',
      borderRadius: 100,
      background: `${color}20`,
      color: color,
      fontWeight: 600,
    }),
  };
}

export const ROLE_COLORS = {
  student: '#6366f1',
  teacher: '#10b981',
  admin: '#f59e0b',
};

export const STATUS_COLORS = {
  upcoming: '#10b981',
  full: '#ef4444',
  completed: '#64748b',
};
