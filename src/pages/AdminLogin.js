import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';

export default function AdminLogin() {
  const { adminLogin, setPage, dark } = useApp();
  const css = getTheme(dark);

  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!form.email.trim())    e.email    = 'Email is required';
    if (!form.password.trim()) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handle = async () => {
    if (!validate()) return;
    setLoading(true);
    await adminLogin(form.email, form.password);
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === 'Enter') handle(); };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      background: dark ? '#050810' : '#f8f9ff',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* BG blobs */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(239,68,68,0.1) 0%,transparent 70%)',
        top: '-10%', right: '-10%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(239,68,68,0.07) 0%,transparent 70%)',
        bottom: '5%', left: '5%', pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 420, animation: 'scaleIn 0.35s ease' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18,
            background: 'linear-gradient(135deg,#ef4444,#dc2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 18px',
            boxShadow: '0 12px 32px rgba(239,68,68,0.35)',
          }}>🔐</div>
          <h1 style={{
            fontSize: 28, fontWeight: 800, letterSpacing: '-1px',
            color: dark ? '#fff' : '#0f0f23', marginBottom: 8,
          }}>
            Admin Portal
          </h1>
          <p style={{ color: dark ? '#64748b' : '#94a3b8', fontSize: 14 }}>
            Restricted access — administrators only
          </p>
        </div>

        {/* Form card */}
        <div style={{ ...css.card, padding: 32, borderRadius: 22 }}>

          <Field label="Admin Email" error={errors.email}>
            <input
              type="email"
              placeholder="admin@studycafe.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              onKeyDown={handleKey}
              style={{ ...css.input, borderColor: errors.email ? '#ef4444' : undefined }}
            />
          </Field>

          <Field label="Password" error={errors.password}>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              onKeyDown={handleKey}
              style={{ ...css.input, borderColor: errors.password ? '#ef4444' : undefined }}
            />
          </Field>

          <button
            onClick={handle}
            disabled={loading}
            style={{
              width: '100%', padding: '13px', fontSize: 15, borderRadius: 12,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg,#ef4444,#dc2626)',
              color: '#fff', fontWeight: 700, fontFamily: 'inherit',
              opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 16px rgba(239,68,68,0.3)',
            }}
          >
            {loading
              ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Verifying...</>
              : '🔐 Admin Login →'
            }
          </button>
        </div>

        {/* Back to normal login */}
        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={() => setPage('login')}
            style={{
              background: 'none', border: 'none',
              color: dark ? '#334155' : '#94a3b8',
              cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
            }}
          >
            ← Back to student/teacher login
          </button>
        </p>

      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 13, fontWeight: 600,
        color: error ? '#ef4444' : '#94a3b8', marginBottom: 8,
      }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 5, fontWeight: 500 }}>{error}</p>}
    </div>
  );
}