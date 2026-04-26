import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';

export default function Auth() {
  const { setPage, login, dark } = useApp();
  const css = getTheme(dark);

  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!form.email.trim())                        e.email    = 'Email is required';
    if (!form.password || form.password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handle = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    login(form.email, form.password);
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
        background: 'radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)',
        top: '-10%', right: '-10%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%)',
        bottom: '5%', left: '5%', pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 440, animation: 'scaleIn 0.35s ease' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 18px',
            boxShadow: '0 12px 32px rgba(99,102,241,0.35)',
          }}>☕</div>
          <h1 style={{
            fontSize: 30, fontWeight: 800, letterSpacing: '-1px',
            color: dark ? '#fff' : '#0f0f23', marginBottom: 8,
          }}>
            Welcome back
          </h1>
          <p style={{ color: dark ? '#64748b' : '#94a3b8', fontSize: 15 }}>
            Log in to continue your learning
          </p>
        </div>

        {/* ── Form card ── */}
        <div style={{ ...css.card, padding: 32, borderRadius: 22 }}>

          {/* Email */}
          <Field label="Email address" error={errors.email}>
            <input
              type="email"
              placeholder="you@college.edu"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              onKeyDown={handleKey}
              style={{ ...css.input, borderColor: errors.email ? '#ef4444' : undefined }}
            />
          </Field>

          {/* Password */}
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

          {/* Login button */}
          <button
            onClick={handle}
            disabled={loading}
            style={{
              ...css.btnPrimary,
              width: '100%', padding: '13px', fontSize: 15, borderRadius: 12,
              opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading
              ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Please wait...</>
              : 'Log in →'
            }
          </button>

        </div>

        {/* Students can signup — teachers login only */}
        <p style={{
          textAlign: 'center', marginTop: 20,
          color: dark ? '#475569' : '#94a3b8', fontSize: 14,
        }}>
          New student?{' '}
          <button
            onClick={() => setPage('signup')}
            style={{
              background: 'none', border: 'none',
              color: '#818cf8', cursor: 'pointer',
              fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
            }}
          >
            Create account
          </button>
        </p>
        <p style={{
          textAlign: 'center', marginTop: 6,
          color: dark ? '#334155' : '#cbd5e1', fontSize: 12,
        }}>
          👨‍🏫 Teachers — your account is created by admin
        </p>

        {/* Admin login link */}
        <p style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={() => setPage('adminlogin')}
            style={{
              background: 'none', border: 'none',
              color: dark ? '#334155' : '#cbd5e1',
              cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
            }}
          >
            🔐 Admin Portal
          </button>
        </p>

        {/* ── Back to home ── */}
        <p style={{ textAlign: 'center', marginTop: 12 }}>
          <button
            onClick={() => setPage('landing')}
            style={{
              background: 'none', border: 'none',
              color: dark ? '#334155' : '#94a3b8',
              cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
            }}
          >
            ← Back to home
          </button>
        </p>

      </div>
    </div>
  );
}

/* ── Reusable field wrapper ── */
function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 13, fontWeight: 600,
        color: error ? '#ef4444' : '#94a3b8', marginBottom: 8,
      }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 5, fontWeight: 500 }}>{error}</p>}
    </div>
  );
}