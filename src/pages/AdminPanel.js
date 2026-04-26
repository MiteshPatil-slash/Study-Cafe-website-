import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';

const API = 'http://localhost:5000/api';

export default function AdminPanel() {
  const { user, logout, dark, toast, users, fetchUsers, removeUser } = useApp();
  const css = getTheme(dark);
  const [tab, setTab] = useState('teachers');

  // ── Colleges from backend ──────────────────────────────────
  const [colleges, setColleges] = useState([]);
  useEffect(() => {
    fetchUsers();
    fetch(`${API}/colleges`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setColleges(data); })
      .catch(() => {});
  }, []);

  // ── Create Teacher form ────────────────────────────────────
  const [showForm, setShowForm]       = useState(false);
  const [creating, setCreating]       = useState(false);
  const [form, setForm]               = useState({ name: '', email: '', password: '', college: '' });
  const [formErrors, setFormErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())            e.name     = 'Name is required';
    if (!form.email.trim())           e.email    = 'Email is required';
    if (form.password.length < 8)     e.password = 'Min 8 characters';
    if (!/[A-Z]/.test(form.password)) e.password = 'Must have uppercase letter';
    if (!/[0-9]/.test(form.password)) e.password = 'Must have a number';
    if (!/[!@#$%^&*]/.test(form.password)) e.password = 'Must have special char (!@#$%^&*)';
    if (!form.college)                e.college  = 'Select a college';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const createTeacher = async () => {
    if (!validate()) return;
    setCreating(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, role: 'teacher' }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.message || 'Failed to create teacher', 'error');
      } else {
        toast(`✅ Teacher account created for ${form.name}!`);
        setForm({ name: '', email: '', password: '', college: '' });
        setShowForm(false);
        fetchUsers();
      }
    } catch {
      toast('Network error — is server running?', 'error');
    }
    setCreating(false);
  };

  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');

  return (
    <div style={{
      minHeight: '100vh',
      background: dark ? '#050810' : '#f8f9ff',
      fontFamily: 'inherit',
    }}>

      {/* Top bar */}
      <div style={{
        background: dark ? '#0c1020' : '#fff',
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
        padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64, position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#ef4444,#dc2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🔐</div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: dark ? '#fff' : '#0f0f23', margin: 0 }}>
              Admin Panel
            </p>
            <p style={{ fontSize: 11, color: '#ef4444', margin: 0, fontWeight: 600 }}>
              Study Cafe — Administrator
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: dark ? '#64748b' : '#94a3b8' }}>
            👋 {user?.name}
          </span>
          <button
            onClick={logout}
            style={{
              padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'rgba(239,68,68,0.12)', color: '#ef4444',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
            }}
          >
            Log out
          </button>
        </div>
      </div>

      <div style={{ padding: '32px' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Teachers', value: teachers.length, icon: '👨‍🏫', color: '#10b981' },
            { label: 'Total Students', value: students.length, icon: '🎓', color: '#6366f1' },
            { label: 'Total Colleges', value: colleges.length, icon: '🏫', color: '#f59e0b' },
          ].map((s) => (
            <div key={s.label} style={{
              ...css.card, padding: '20px 24px', borderRadius: 16,
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${s.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
              }}>{s.icon}</div>
              <div>
                <p style={{ fontSize: 28, fontWeight: 800, color: dark ? '#fff' : '#0f0f23', margin: 0, lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: 13, color: dark ? '#64748b' : '#94a3b8', margin: 0, marginTop: 4 }}>
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: 4, padding: 5, borderRadius: 11,
          background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
          width: 'fit-content', marginBottom: 24,
        }}>
          {[
            { key: 'teachers', label: '👨‍🏫 Teachers' },
            { key: 'students', label: '🎓 Students' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: tab === t.key ? (dark ? '#1e293b' : '#fff') : 'transparent',
              color: tab === t.key ? (dark ? '#f1f5f9' : '#0f0f23') : (dark ? '#64748b' : '#94a3b8'),
              fontWeight: tab === t.key ? 700 : 500, fontSize: 13,
              fontFamily: 'inherit', transition: 'all 0.15s',
              boxShadow: tab === t.key ? (dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.07)') : 'none',
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── TEACHERS TAB ── */}
        {tab === 'teachers' && (
          <div style={{ ...css.card, borderRadius: 18, overflow: 'hidden' }}>

            {/* Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: dark ? '#f1f5f9' : '#0f0f23', margin: 0 }}>
                  Teacher Accounts ({teachers.length})
                </p>
                <p style={{ fontSize: 12, color: dark ? '#475569' : '#94a3b8', margin: 0, marginTop: 3 }}>
                  Only admin can create teacher accounts
                </p>
              </div>
              <button onClick={() => { setShowForm(p => !p); setFormErrors({}); }} style={{
                padding: '9px 18px', borderRadius: 10, cursor: 'pointer', fontSize: 13,
                fontWeight: 700, fontFamily: 'inherit', border: 'none',
                background: showForm ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                color: showForm ? '#ef4444' : '#10b981',
              }}>
                {showForm ? '✕ Cancel' : '+ Create Teacher'}
              </button>
            </div>

            {/* Create Teacher Form */}
            {showForm && (
              <div style={{
                padding: '24px',
                borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                background: dark ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.03)',
              }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#10b981', marginBottom: 20 }}>
                  👨‍🏫 New Teacher Account
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: formErrors.name ? '#ef4444' : (dark ? '#64748b' : '#94a3b8'), display: 'block', marginBottom: 6 }}>
                      Full Name *
                    </label>
                    <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Prof. Sharma"
                      style={{ ...css.input, borderColor: formErrors.name ? '#ef4444' : undefined, width: '100%' }} />
                    {formErrors.name && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{formErrors.name}</p>}
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: formErrors.email ? '#ef4444' : (dark ? '#64748b' : '#94a3b8'), display: 'block', marginBottom: 6 }}>
                      Email *
                    </label>
                    <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="teacher@college.edu"
                      style={{ ...css.input, borderColor: formErrors.email ? '#ef4444' : undefined, width: '100%' }} />
                    {formErrors.email && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{formErrors.email}</p>}
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: formErrors.password ? '#ef4444' : (dark ? '#64748b' : '#94a3b8'), display: 'block', marginBottom: 6 }}>
                      Password *
                    </label>
                    <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      placeholder="Min 8 chars, A-Z, 0-9, !@#$"
                      style={{ ...css.input, borderColor: formErrors.password ? '#ef4444' : undefined, width: '100%' }} />
                    {formErrors.password && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{formErrors.password}</p>}
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: formErrors.college ? '#ef4444' : (dark ? '#64748b' : '#94a3b8'), display: 'block', marginBottom: 6 }}>
                      College *
                    </label>
                    <select value={form.college} onChange={e => setForm(p => ({ ...p, college: e.target.value }))}
                      style={{ ...css.input, borderColor: formErrors.college ? '#ef4444' : undefined, width: '100%', cursor: 'pointer' }}>
                      <option value="">— Select college —</option>
                      {colleges.map(c => <option key={c._id} value={c._id}>{c.name} — {c.city}</option>)}
                    </select>
                    {formErrors.college && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{formErrors.college}</p>}
                  </div>
                </div>
                <button onClick={createTeacher} disabled={creating} style={{
                  padding: '11px 28px', borderRadius: 10, border: 'none', cursor: creating ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg,#10b981,#059669)',
                  color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                  opacity: creating ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                }}>
                  {creating
                    ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Creating...</>
                    : '✓ Create Teacher Account'
                  }
                </button>
              </div>
            )}

            {/* Teachers Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Teacher', 'Email', 'College', 'Created On', 'Action'].map(h => (
                      <th key={h} style={{
                        padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                        color: dark ? '#475569' : '#94a3b8', letterSpacing: '0.6px', textTransform: 'uppercase',
                        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teachers.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '56px 20px', textAlign: 'center', color: dark ? '#475569' : '#94a3b8' }}>
                      <div style={{ fontSize: 36, marginBottom: 10 }}>👨‍🏫</div>
                      <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>No teachers yet</p>
                      <p style={{ fontSize: 13, marginTop: 6, color: dark ? '#334155' : '#cbd5e1' }}>
                        Click "+ Create Teacher" above to add one
                      </p>
                    </td></tr>
                  ) : teachers.map(u => (
                    <tr key={u._id}
                      style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}
                      onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: 'rgba(16,185,129,0.15)', color: '#10b981',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 800,
                          }}>{u.avatar || u.name?.slice(0,2).toUpperCase()}</div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: dark ? '#f1f5f9' : '#0f0f23', margin: 0 }}>{u.name}</p>
                            <p style={{ fontSize: 11, color: '#10b981', margin: 0, fontWeight: 600 }}>Teacher</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: dark ? '#64748b' : '#94a3b8' }}>{u.email}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: dark ? '#64748b' : '#94a3b8' }}>
                        {u.college?.name || '—'}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: dark ? '#64748b' : '#94a3b8', whiteSpace: 'nowrap' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <button onClick={() => removeUser(u._id)} style={{
                          padding: '5px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                          background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                          fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                        }}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── STUDENTS TAB ── */}
        {tab === 'students' && (
          <div style={{ ...css.card, borderRadius: 18, overflow: 'hidden' }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: dark ? '#f1f5f9' : '#0f0f23', margin: 0 }}>
                Students ({students.length})
              </p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Student', 'Email', 'College', 'Joined', 'Action'].map(h => (
                      <th key={h} style={{
                        padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                        color: dark ? '#475569' : '#94a3b8', letterSpacing: '0.6px', textTransform: 'uppercase',
                        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: dark ? '#475569' : '#94a3b8' }}>
                      No students yet
                    </td></tr>
                  ) : students.map(u => (
                    <tr key={u._id}
                      style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}
                      onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: 'rgba(99,102,241,0.15)', color: '#818cf8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 800,
                          }}>{u.avatar || u.name?.slice(0,2).toUpperCase()}</div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: dark ? '#f1f5f9' : '#0f0f23', margin: 0 }}>{u.name}</p>
                            <p style={{ fontSize: 11, color: '#818cf8', margin: 0, fontWeight: 600 }}>Student</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: dark ? '#64748b' : '#94a3b8' }}>{u.email}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: dark ? '#64748b' : '#94a3b8' }}>
                        {u.college?.name || '—'}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: dark ? '#64748b' : '#94a3b8', whiteSpace: 'nowrap' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <button onClick={() => removeUser(u._id)} style={{
                          padding: '5px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                          background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                          fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                        }}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}