import React from 'react';
import { useApp } from '../../context/AppContext';
import { getTheme } from '../../utils/theme';
import { Icons } from '../../utils/icons';

const NAV_ITEMS = {
  student: [
    { icon: <Icons.Home />, label: 'Dashboard', page: 'dashboard' },
    { icon: <Icons.Building />, label: 'Colleges', page: 'colleges' },
    { icon: <Icons.Book />, label: 'Resources', page: 'resources' },
    { icon: <Icons.Check />, label: 'Study Routine', page: 'routine' },
  ],
  teacher: [
    { icon: <Icons.Home />, label: 'Dashboard', page: 'dashboard' },
    { icon: <Icons.Building />, label: 'Colleges', page: 'colleges' },
    { icon: <Icons.Book />, label: 'Resources', page: 'resources' },
    { icon: <Icons.Upload />, label: 'Upload', page: 'upload' },
  ],
  admin: [
    { icon: <Icons.Home />, label: 'Dashboard', page: 'dashboard' },
    { icon: <Icons.Building />, label: 'Colleges', page: 'colleges' },
    { icon: <Icons.Book />, label: 'Resources', page: 'resources' },
    { icon: <Icons.Users />, label: 'Admin Panel', page: 'admin' },
  ],
};

export default function Sidebar({ open }) {
  const { user, page, setPage, logout, dark } = useApp();
  const css = getTheme(dark);
  const items = NAV_ITEMS[user?.role] || NAV_ITEMS.student;

  return (
    <aside
      style={{
        width: open ? 240 : 72,
        flexShrink: 0,
        transition: 'width 0.28s cubic-bezier(.4,0,.2,1)',
        ...css.sidebarBg,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
          minHeight: 64,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          ☕
        </div>
        {open && (
          <span
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: dark ? '#fff' : '#0f0f23',
              whiteSpace: 'nowrap',
              letterSpacing: '-0.5px',
            }}
          >
            Study Cafe
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav
        style={{
          flex: 1,
          padding: '12px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          overflowY: 'auto',
        }}
        className="no-scrollbar"
      >
        {items.map((item) => {
          const active = page === item.page;
          return (
            <button
              key={item.page}
              onClick={() => setPage(item.page)}
              title={!open ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: open ? '10px 14px' : '10px',
                justifyContent: open ? 'flex-start' : 'center',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                background: active
                  ? 'rgba(99,102,241,0.15)'
                  : 'transparent',
                color: active
                  ? '#818cf8'
                  : dark
                  ? '#64748b'
                  : '#64748b',
                fontWeight: active ? 600 : 500,
                fontSize: 14,
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                if (!active)
                  e.currentTarget.style.background = dark
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(0,0,0,0.04)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
              {open && item.label}
            </button>
          );
        })}
      </nav>

      {/* User + logout */}
      <div
        style={{
          padding: '12px 8px',
          borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
          flexShrink: 0,
        }}
      >
        {open && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              marginBottom: 4,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {user?.avatar}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: dark ? '#f1f5f9' : '#0f0f23',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#6366f1',
                  textTransform: 'capitalize',
                  fontWeight: 600,
                }}
              >
                {user?.role}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          title={!open ? 'Log out' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: open ? '10px 14px' : '10px',
            justifyContent: open ? 'flex-start' : 'center',
            width: '100%',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            background: 'transparent',
            color: dark ? '#475569' : '#94a3b8',
            fontSize: 14,
            fontWeight: 500,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ef4444';
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = dark ? '#475569' : '#94a3b8';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <span style={{ display: 'flex', flexShrink: 0 }}>
            <Icons.LogOut />
          </span>
          {open && 'Log out'}
        </button>
      </div>
    </aside>
  );
}
