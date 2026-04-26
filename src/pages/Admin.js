import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getTheme, ROLE_COLORS } from '../utils/theme';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';

const API = 'http://localhost:5000/api';
const SUB_TABS = ['users', 'teachers', 'colleges', 'resources'];

export default function Admin() {
  const { users, fetchUsers, removeUser, resources, dark, toast } = useApp();
  const css = getTheme(dark);
  const [tab, setTab] = useState('users');

  const [colleges, setColleges] = useState([]);
  useEffect(() => {
    fetchUsers();
    fetch(`${API}/colleges`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setColleges(data); })
      .catch(() => {});
  }, []);

  const [showForm, setShowForm]       = useState(false);
  const [creating, setCreating]       = useState(false);
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '', college: '' });
  const [formErrors, setFormErrors]   = useState({});

  const validateTeacher = () => {
    const e = {};
    if (!teacherForm.name.trim())            e.name     = 'Name is required';
    if (!teacherForm.email.trim())           e.email    = 'Email is required';
    if (teacherForm.password.length < 8)     e.password = 'Min 8 characters';
    if (!/[A-Z]/.test(teacherForm.password)) e.password = 'Must have uppercase';
    if (!/[0-9]/.test(teacherForm.password)) e.password = 'Must have a number';
    if (!/[!@#$%^&*]/.test(teacherForm.password)) e.password = 'Must have special char (!@#$%^&*)';
    if (!teacherForm.college)                e.college  = 'Select a college';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const createTeacher = async () => {
    if (!validateTeacher()) return;
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...teacherForm, role: 'teacher' }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.message || 'Failed', 'error'); }
      else {
        toast(`Teacher account created for ${teacherForm.name}! 🎉`);
        setTeacherForm({ name: '', email: '', password: '', college: '' });
        setShowForm(false);
        fetchUsers();
      }
    } catch { toast('Network error', 'error'); }
    setCreating(false);
  };

  const stats = [
    { label: 'Total Users',  value: String(users.length),                                 icon: '👥', color: '#6366f1' },
    { label: 'Students',     value: String(users.filter((u) => u.role === 'student').length), icon: '🎓', color: '#8b5cf6' },
    { label: 'Teachers',     value: String(users.filter((u) => u.role === 'teacher').length), icon: '👨‍🏫', color: '#10b981' },
    { label: 'Resources',    value: String(resources.length),                              icon: '📚', color: '#f59e0b' },
  ];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-1px', color: dark ? '#fff' : '#0f0f23', marginBottom: 6 }}>
          Admin Panel
        </h1>
        <p style={{ color: dark ? '#64748b' : '#94a3b8' }}>
          Manage users, content, and platform settings
        </p>
      </div>

      {/* Stats */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 28 }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Sub-tab bar */}
      <div style={{
        display: 'flex', gap: 4, padding: 5, borderRadius: 11,
        background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
        width: 'fit-content', marginBottom: 22,
      }}>
        {SUB_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: tab === t ? (dark ? '#1e293b' : '#fff') : 'transparent',
              color: tab === t ? (dark ? '#f1f5f9' : '#0f0f23') : (dark ? '#64748b' : '#94a3b8'),
              fontWeight: tab === t ? 700 : 500, fontSize: 13, textTransform: 'capitalize',
              fontFamily: 'inherit', transition: 'all 0.15s',
              boxShadow: tab === t ? (dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.07)') : 'none',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Users table */}
      {tab === 'users' && (
        <div style={{ ...css.card, borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: dark ? '#f1f5f9' : '#0f0f23' }}>
              All Users ({users.length})
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['User', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                    <th key={h} style={{
                      padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                      color: dark ? '#475569' : '#94a3b8', letterSpacing: '0.6px',
                      textTransform: 'uppercase', whiteSpace: 'nowrap',
                      borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id || u.id}
                    style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 9,
                          background: `${ROLE_COLORS[u.role]}25`,
                          color: ROLE_COLORS[u.role],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 800, flexShrink: 0,
                        }}>{u.avatar}</div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: dark ? '#f1f5f9' : '#0f0f23', whiteSpace: 'nowrap' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: dark ? '#64748b' : '#94a3b8' }}>{u.email}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <Badge label={u.role} color={ROLE_COLORS[u.role]} />
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: dark ? '#64748b' : '#94a3b8', whiteSpace: 'nowrap' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {u.role !== 'admin' ? (
                        <button
                          onClick={() => removeUser(u._id || u.id)}
                          style={{ ...css.btnDanger, fontSize: 12, padding: '5px 12px' }}
                        >
                          Remove
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: dark ? '#334155' : '#cbd5e1' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TEACHERS TAB ── */}
      {tab === 'teachers' && (
        <div style={{ ...css.card, borderRadius: 18, overflow: 'hidden' }}>
          <div style={{
            padding: '18px 24px',
            borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: dark ? '#f1f5f9' : '#0f0f23' }}>
                Teachers ({users.filter(u => u.role === 'teacher').length})
              </p>
              <p style={{ fontSize: 12, color: dark ? '#475569' : '#94a3b8', marginTop: 2 }}>
                Accounts created by admin only
              </p>
            </div>
            <button onClick={() => setShowForm(p => !p)} style={{
              padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13,
              fontWeight: 700, fontFamily: 'inherit', border: 'none',
              background: showForm ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.15)',
              color: showForm ? '#ef4444' : '#818cf8',
            }}>
              {showForm ? '✕ Cancel' : '+ Create Teacher'}
            </button>
          </div>

          {/* Create Teacher Form */}
          {showForm && (
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              background: dark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)',
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#818cf8', marginBottom: 16 }}>
                👨‍🏫 New Teacher Account
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: formErrors.name ? '#ef4444' : (dark ? '#64748b' : '#94a3b8'), display: 'block', marginBottom: 6 }}>Full Name</label>
                  <input value={teacherForm.name} onChange={e => setTeacherForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Prof. Sharma"
                    style={{ ...css.input, borderColor: formErrors.name ? '#ef4444' : undefined, width: '100%' }} />
                  {formErrors.name && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{formErrors.name}</p>}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: formErrors.email ? '#ef4444' : (dark ? '#64748b' : '#94a3b8'), display: 'block', marginBottom: 6 }}>Email</label>
                  <input type="email" value={teacherForm.email} onChange={e => setTeacherForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="teacher@college.edu"
                    style={{ ...css.input, borderColor: formErrors.email ? '#ef4444' : undefined, width: '100%' }} />
                  {formErrors.email && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{formErrors.email}</p>}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: formErrors.password ? '#ef4444' : (dark ? '#64748b' : '#94a3b8'), display: 'block', marginBottom: 6 }}>Password</label>
                  <input type="password" value={teacherForm.password} onChange={e => setTeacherForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min 8 chars, A-Z, 0-9, symbol"
                    style={{ ...css.input, borderColor: formErrors.password ? '#ef4444' : undefined, width: '100%' }} />
                  {formErrors.password && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{formErrors.password}</p>}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: formErrors.college ? '#ef4444' : (dark ? '#64748b' : '#94a3b8'), display: 'block', marginBottom: 6 }}>College</label>
                  <select value={teacherForm.college} onChange={e => setTeacherForm(p => ({ ...p, college: e.target.value }))}
                    style={{ ...css.input, borderColor: formErrors.college ? '#ef4444' : undefined, width: '100%', cursor: 'pointer' }}>
                    <option value="">— Select college —</option>
                    {colleges.map(c => <option key={c._id} value={c._id}>{c.name} — {c.city}</option>)}
                  </select>
                  {formErrors.college && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{formErrors.college}</p>}
                </div>
              </div>
              <button onClick={createTeacher} disabled={creating} style={{
                ...css.btnPrimary, padding: '10px 24px', fontSize: 13,
                opacity: creating ? 0.7 : 1,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {creating ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Creating...</> : '✓ Create Teacher Account'}
              </button>
            </div>
          )}

          {/* Teachers Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Teacher', 'Email', 'College', 'Joined', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                      color: dark ? '#475569' : '#94a3b8', letterSpacing: '0.6px', textTransform: 'uppercase',
                      borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role === 'teacher').length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: dark ? '#475569' : '#94a3b8', fontSize: 14 }}>
                    No teachers yet — click "+ Create Teacher" above
                  </td></tr>
                ) : users.filter(u => u.role === 'teacher').map(u => (
                  <tr key={u._id || u.id}
                    style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}
                    onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: 'rgba(16,185,129,0.15)', color: '#10b981',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 800,
                        }}>{u.avatar || u.name?.slice(0,2).toUpperCase()}</div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: dark ? '#f1f5f9' : '#0f0f23', margin: 0 }}>{u.name}</p>
                          <p style={{ fontSize: 11, color: '#10b981', margin: 0, fontWeight: 600 }}>👨‍🏫 Teacher</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: dark ? '#64748b' : '#94a3b8' }}>{u.email}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: dark ? '#64748b' : '#94a3b8' }}>{u.college?.name || '—'}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: dark ? '#64748b' : '#94a3b8', whiteSpace: 'nowrap' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button onClick={() => removeUser(u._id || u.id)} style={{ ...css.btnDanger, fontSize: 12, padding: '5px 12px' }}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Colleges grid */}
      {tab === 'colleges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {colleges.map((c) => (
            <div key={c._id || c.id} style={{
              ...css.card, padding: 22, borderRadius: 16,
              borderLeft: `4px solid ${c.color}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c.color, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{c.short}</span>
                  <p style={{ fontSize: 14, fontWeight: 700, color: dark ? '#f1f5f9' : '#0f0f23', marginTop: 4, lineHeight: 1.3 }}>{c.name}</p>
                </div>
                <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>★ {c.rating}</span>
              </div>
              <div style={{ fontSize: 12, color: dark ? '#475569' : '#94a3b8', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span>📍 {c.city} · Est. {c.established}</span>
                <span>👥 {c.students.toLocaleString()} students</span>
                <span>📚 {resources.filter((r) => r.college === c._id || r.college?._id === c._id).length} resources</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 12 }}>
                {c.courses.map((co) => (
                  <span key={co} style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 100,
                    background: `${c.color}15`, color: c.color, fontWeight: 600,
                  }}>{co}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resources table */}
      {tab === 'resources' && (
        <div style={{ ...css.card, borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: dark ? '#f1f5f9' : '#0f0f23' }}>
              All Resources ({resources.length})
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Title', 'Type', 'Subject', 'Uploaded By', 'College', 'Date'].map((h) => (
                    <th key={h} style={{
                      padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                      color: dark ? '#475569' : '#94a3b8', letterSpacing: '0.6px',
                      textTransform: 'uppercase', whiteSpace: 'nowrap',
                      borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resources.map((r) => {
                  const college = r.college;
                  const typeColors = { note: '#6366f1', paper: '#10b981', video: '#f59e0b', doubt: '#ef4444' };
                  return (
                    <tr
                      key={r._id || r.id}
                      style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    >
                      <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 600, color: dark ? '#f1f5f9' : '#0f0f23', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.title}
                      </td>
                      <td style={{ padding: '13px 20px' }}>
                        <Badge label={r.type} color={typeColors[r.type] || '#6366f1'} />
                      </td>
                      <td style={{ padding: '13px 20px', fontSize: 13, color: dark ? '#64748b' : '#94a3b8' }}>{r.subject}</td>
                      <td style={{ padding: '13px 20px', fontSize: 13, color: dark ? '#64748b' : '#94a3b8', whiteSpace: 'nowrap' }}>{r.uploadedBy}</td>
                      <td style={{ padding: '13px 20px', fontSize: 13, color: dark ? '#64748b' : '#94a3b8', whiteSpace: 'nowrap' }}>{college?.short || college?.name || '—'}</td>
                      <td style={{ padding: '13px 20px', fontSize: 13, color: dark ? '#64748b' : '#94a3b8', whiteSpace: 'nowrap' }}>{r.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}