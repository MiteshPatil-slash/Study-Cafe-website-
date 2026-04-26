import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';

export default function Signup() {
  const { setPage, register, dark } = useApp();
  const css = getTheme(dark);

  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'student', college: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  // ✅ NEW: fetch colleges from backend for dropdown
  const [colleges, setColleges]         = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/colleges')
      .then((r) => r.json())
      .then((data) => { setColleges(data); setCollegesLoading(false); })
      .catch(() => setCollegesLoading(false));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                          e.name     = 'Name is required';
    if (!form.email.trim())                         e.email    = 'Email is required';
    if (!form.password || form.password.length < 8) e.password = 'Minimum 8 characters';
    if (!/[A-Z]/.test(form.password))               e.password = 'Must include an uppercase letter';
    if (!/[0-9]/.test(form.password))               e.password = 'Must include a number';
    if (!/[!@#$%^&*]/.test(form.password))          e.password = 'Must include a special character';
    // ✅ NEW: college required for students
    if (form.role === 'student' && !form.college)   e.college  = 'Please select your college';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handle = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    register(form);
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
            Create account
          </h1>
          <p style={{ color: dark ? '#64748b' : '#94a3b8', fontSize: 15 }}>
            Start your academic journey today
          </p>
        </div>

        {/* ── Form card ── */}
        <div style={{ ...css.card, padding: 32, borderRadius: 22 }}>

          {/* Full Name */}
          <Field label="Full Name" error={errors.name}>
            <input
              placeholder="e.g. Arjun Mehta"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              onKeyDown={handleKey}
              style={{ ...css.input, borderColor: errors.name ? '#ef4444' : undefined }}
            />
          </Field>

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
              placeholder="Min 8 chars, uppercase, number, symbol"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              onKeyDown={handleKey}
              style={{ ...css.input, borderColor: errors.password ? '#ef4444' : undefined }}
            />
          </Field>

          {/* Students only — teachers are created by admin */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              padding: '12px 16px', borderRadius: 12,
              background: 'rgba(99,102,241,0.08)',
              border: '2px solid rgba(99,102,241,0.25)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>🎓</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#818cf8', margin: 0 }}>Student Account</p>
                <p style={{ fontSize: 12, color: dark ? '#64748b' : '#94a3b8', margin: 0, marginTop: 2 }}>
                  Teacher accounts are created by the admin only
                </p>
              </div>
            </div>
          </div>

          {/* ✅ NEW: College dropdown — only shown for students */}
          {form.role === 'student' && (
            <Field label="Your College" error={errors.college}>
              <select
                value={form.college}
                onChange={(e) => setForm((p) => ({ ...p, college: e.target.value }))}
                style={{
                  ...css.input,
                  borderColor: errors.college ? '#ef4444' : undefined,
                  cursor: 'pointer',
                }}
              >
                <option value="">
                  {collegesLoading ? 'Loading colleges...' : '— Select your college —'}
                </option>
                {colleges.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} — {c.city}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {/* Submit button */}
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
              : 'Create account →'
            }
          </button>

        </div>

        {/* ── Already have account ── */}
        <p style={{
          textAlign: 'center', marginTop: 20,
          color: dark ? '#475569' : '#94a3b8', fontSize: 14,
        }}>
          Already have an account?{' '}
          <button
            onClick={() => setPage('login')}
            style={{
              background: 'none', border: 'none',
              color: '#818cf8', cursor: 'pointer',
              fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
            }}
          >
            Log in
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