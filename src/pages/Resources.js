import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getTheme, STATUS_COLORS } from '../utils/theme';
import { Icons } from '../utils/icons';

const API = 'http://localhost:5000';

const TABS = [
  { key: 'note',  label: 'Notes',         icon: '📄' },
  { key: 'paper', label: 'Papers',         icon: '📝' },
  { key: 'video', label: 'Videos',         icon: '🎬' },
  { key: 'doubt', label: 'Doubt Sessions', icon: '🙋' },
];

const SUBJECTS = ['all', 'CS', 'IT', 'Mechanical', 'Electronics', 'Civil', 'Chemical', 'MATH', 'Physics'];

export default function Resources() {
  const { resources, setResources, selectedCollege, dark, user, toast, fetchResources } = useApp();
  const css = getTheme(dark);

  const [tab,     setTab]     = useState('note');
  const [search,  setSearch]  = useState('');
  const [subject, setSubject] = useState('all');
  const [loading, setLoading] = useState(false);

  // Refresh resources every time page mounts
  useEffect(() => {
    if (fetchResources) fetchResources();
  }, []);

  // ── Filter resources ──
  const filtered = resources.filter((r) => {
    const matchType    = r.type === tab;
    const matchSearch  = r.title?.toLowerCase().includes(search.toLowerCase()) ||
                         r.subject?.toLowerCase().includes(search.toLowerCase());
    const matchSubject = subject === 'all' || r.subject === subject;

    // College matching — handles all cases: ObjectId, numeric id, name, short, collegeName field
    const matchCollege = !selectedCollege || (() => {
      const sc = selectedCollege;

      // Match by stored collegeName or collegeShort (most reliable for new uploads)
      if (r.collegeName  && r.collegeName  === sc.name)  return true;
      if (r.collegeShort && r.collegeShort === sc.short) return true;

      // No college set → show to all
      if (!r.college) return true;

      const rId = r.college?._id || r.college;
      if (String(rId) === String(sc._id))                return true; // MongoDB _id
      if (String(rId) === String(sc.id))                 return true; // dummy numeric id
      if (r.college?.short && r.college.short === sc.short) return true;
      if (r.college?.name  && r.college.name  === sc.name)  return true;

      return false;
    })();

    return matchType && matchSearch && matchSubject && matchCollege;
  });

  // ── Delete resource (teacher only) ──
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/resources/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r._id !== id && r.id !== id));
        toast('Resource deleted successfully', 'warning');
      } else {
        const data = await res.json();
        toast(data.message || 'Delete failed', 'error');
      }
    } catch (err) {
      toast('Could not delete resource', 'error');
    }
  };

  // ── Download / view ──
  const handleDownload = async (r) => {
    if (r.fileUrl) {
      window.open(`${API}${r.fileUrl}`, '_blank');
      // increment download count
      fetch(`${API}/api/resources/${r._id}/download`, { method: 'PUT' }).catch(() => {});
    } else if (r.ytLink) {
      window.open(r.ytLink, '_blank');
    }
  };

  return (
    <div className="fade-in">

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-1px', color: dark ? '#fff' : '#0f0f23', marginBottom: 4 }}>
          {selectedCollege ? `${selectedCollege.short} Resources` : 'All Resources'}
        </h1>
        <p style={{ color: dark ? '#64748b' : '#94a3b8', fontSize: 14 }}>
          {selectedCollege ? selectedCollege.name : 'Browse all study materials across colleges'}
        </p>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex', gap: 4, padding: 6, borderRadius: 13,
        background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
        marginBottom: 20, width: 'fit-content', flexWrap: 'wrap',
      }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: tab === t.key ? (dark ? '#1e293b' : '#fff') : 'transparent',
            color: tab === t.key ? (dark ? '#f1f5f9' : '#0f0f23') : (dark ? '#64748b' : '#94a3b8'),
            fontWeight: tab === t.key ? 700 : 500, fontSize: 13, fontFamily: 'inherit',
            boxShadow: tab === t.key ? (dark ? '0 2px 10px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)') : 'none',
            transition: 'all 0.15s',
          }}>
            {t.icon} {t.label}
            {/* count badge */}
            <span style={{
              fontSize: 11, padding: '1px 7px', borderRadius: 100, fontWeight: 700,
              background: tab === t.key ? 'rgba(99,102,241,0.2)' : 'transparent',
              color: tab === t.key ? '#818cf8' : 'transparent',
            }}>
              {resources.filter(r => r.type === t.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 340 }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: dark ? '#475569' : '#94a3b8', pointerEvents: 'none', display: 'flex',
          }}>
            <Icons.Search />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            style={{ ...css.input, paddingLeft: 42 }}
          />
        </div>

        {/* Subject filter */}
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ ...css.input, width: 'auto', minWidth: 150 }}
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'All Subjects' : s}</option>
          ))}
        </select>

        {/* Result count */}
        <span style={{ fontSize: 13, color: dark ? '#475569' : '#94a3b8' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '72px 0', color: dark ? '#475569' : '#94a3b8' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>
            {tab === 'note' ? '📄' : tab === 'paper' ? '📝' : tab === 'video' ? '🎬' : '🙋'}
          </div>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No {tab}s found</p>
          <p style={{ fontSize: 13 }}>
            {user?.role === 'teacher'
              ? 'Upload your first resource using the Upload page'
              : 'No resources available yet — check back later'}
          </p>
        </div>
      )}

      {/* ── Cards ── */}
      {filtered.length > 0 && (
        tab === 'doubt' ? (
          // Doubt sessions — full width list
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((r) => (
              <DoubtCard
                key={r._id || r.id}
                r={r}
                user={user}
                dark={dark}
                css={css}
                onDelete={handleDelete}
                toast={toast}
              />
            ))}
          </div>
        ) : (
          // Notes / Papers / Videos — grid
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 18,
          }}>
            {filtered.map((r) => (
              <ResourceCard
                key={r._id || r.id}
                r={r}
                tab={tab}
                user={user}
                dark={dark}
                css={css}
                onDelete={handleDelete}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ─── RESOURCE CARD (note / paper / video) ────────────────────
function ResourceCard({ r, tab, user, dark, css, onDelete, onDownload }) {
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const isOwner   = r.uploadedBy?._id === user?.id || r.uploadedBy?.name === user?.name;

  return (
    <div style={{
      ...css.card, padding: 22, borderRadius: 18,
      display: 'flex', flexDirection: 'column', gap: 0,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = dark ? '0 14px 40px rgba(0,0,0,0.4)' : '0 14px 40px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Video thumbnail */}
      {tab === 'video' && (
        <div style={{
          height: 120, borderRadius: 12, marginBottom: 16,
          background: 'linear-gradient(135deg,#0f0f23,#1a1a3e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden', fontSize: 48,
        }}>
          🎬
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(99,102,241,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 16,
            }}>▶</div>
          </div>
          {r.duration && (
            <span style={{
              position: 'absolute', bottom: 8, right: 8,
              fontSize: 11, padding: '2px 8px', borderRadius: 6,
              background: 'rgba(0,0,0,0.75)', color: '#fff', fontWeight: 700,
            }}>{r.duration}</span>
          )}
        </div>
      )}

      {/* Badges */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: 600 }}>
          {r.subject}
        </span>
        {r.exam && (
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: 'rgba(16,185,129,0.15)', color: '#34d399', fontWeight: 600 }}>
            {r.exam}
          </span>
        )}
        {r.year && (
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontWeight: 600 }}>
            {r.year}
          </span>
        )}
        {/* College */}
        {r.college?.short && (
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: dark ? '#94a3b8' : '#64748b', fontWeight: 500 }}>
            {r.college.short}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: dark ? '#f1f5f9' : '#0f0f23', lineHeight: 1.35, marginBottom: 7 }}>
        {r.title}
      </h3>

      {/* Meta */}
      <p style={{ fontSize: 12, color: dark ? '#475569' : '#94a3b8', marginBottom: 12 }}>
        👤 {r.uploadedBy?.name || r.uploadedBy || 'Teacher'} &nbsp;·&nbsp; 📅 {r.date || (r.createdAt ? r.createdAt.slice(0, 10) : '')}
        {r.size ? ` · ${r.size}` : ''}
        {r.pages ? ` · ${r.pages} pages` : ''}
      </p>

      {/* Tags */}
      {r.tags && r.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
          {r.tags.map((tag) => (
            <span key={tag} style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 6,
              background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              color: dark ? '#64748b' : '#94a3b8',
            }}>#{tag}</span>
          ))}
        </div>
      )}

      {/* Footer — buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12, borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
        <span style={{ fontSize: 12, color: dark ? '#334155' : '#94a3b8' }}>
          {r.downloads != null && `⬇ ${r.downloads}`}
          {r.views != null && ` 👁 ${r.views}`}
        </span>

        <div style={{ display: 'flex', gap: 8 }}>
          {/* View/Download button — everyone */}
          {(r.fileUrl || r.ytLink) && (
            <button
              onClick={() => onDownload(r)}
              style={{
                ...css.btnPrimary, fontSize: 12, padding: '7px 14px',
                display: 'flex', alignItems: 'center', gap: 5, borderRadius: 9,
              }}
            >
              {tab === 'video' ? '▶ Watch' : '⬇ Download'}
            </button>
          )}

          {/* Delete button — teacher only (own uploads) or admin */}
          {(isTeacher && (isOwner || user?.role === 'admin')) && (
            <button
              onClick={() => onDelete(r._id || r.id)}
              style={{
                fontSize: 12, padding: '7px 12px', borderRadius: 9, cursor: 'pointer',
                border: '1px solid rgba(239,68,68,0.35)',
                background: 'rgba(239,68,68,0.1)',
                color: '#ef4444', fontFamily: 'inherit', fontWeight: 600,
              }}
            >
              🗑 Delete
            </button>
          )}
        </div>
      </div>

      {/* File info pill — shows filename instead of broken iframe */}
      {r.fileUrl && tab !== 'video' && (
        <div style={{
          marginTop: 10, padding: '8px 12px', borderRadius: 9,
          background: dark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)',
          border: `1px solid rgba(99,102,241,0.2)`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 18 }}>📎</span>
          <span style={{ fontSize: 12, color: dark ? '#94a3b8' : '#64748b', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {r.fileUrl.split('/').pop()}
          </span>
          <span style={{ fontSize: 11, color: '#818cf8', fontWeight: 600 }}>
            {r.fileUrl.split('.').pop().toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── DOUBT SESSION CARD ───────────────────────────────────────
function DoubtCard({ r, user, dark, css, onDelete, toast }) {
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const isOwner   = r.uploadedBy?._id === user?.id || r.uploadedBy?.name === user?.name;
  const pct       = r.seats ? Math.round((r.registered / r.seats) * 100) : 0;

  const statusColor = {
    upcoming:  '#10b981',
    full:      '#ef4444',
    completed: '#64748b',
  }[r.status] || '#64748b';

  const handleRegister = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/resources/${r._id}/register`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) toast('Session registered! 🎉');
      else toast(data.message || 'Registration failed', 'error');
    } catch (err) {
      toast('Could not register', 'error');
    }
  };

  return (
    <div style={{ ...css.card, padding: 24, borderRadius: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(99,102,241,0.14)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, flexShrink: 0,
        }}>🙋</div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: dark ? '#f1f5f9' : '#0f0f23' }}>
              {r.title}
            </h3>
            {/* Status badge */}
            <span style={{
              fontSize: 11, padding: '2px 10px', borderRadius: 100,
              background: `${statusColor}20`, color: statusColor,
              fontWeight: 700, textTransform: 'capitalize',
            }}>{r.status}</span>
            {/* Subject badge */}
            <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 100, background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: 600 }}>
              {r.subject}
            </span>
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: dark ? '#64748b' : '#94a3b8', flexWrap: 'wrap', marginBottom: 10 }}>
            <span>📅 {r.date}</span>
            <span>⏰ {r.time}</span>
            <span>⏱ {r.duration}</span>
            <span>👤 {r.uploadedBy?.name || r.uploadedBy || 'Teacher'}</span>
          </div>

          {/* Seat progress bar */}
          {r.seats && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: dark ? '#475569' : '#94a3b8' }}>
                  {r.registered || 0}/{r.seats} seats filled
                </span>
                <span style={{ fontSize: 11, color: statusColor, fontWeight: 600 }}>{pct}%</span>
              </div>
              <div style={{ height: 5, borderRadius: 100, background: dark ? '#1e293b' : '#e2e8f0', overflow: 'hidden' }}>
                <div style={{
                  width: `${pct}%`, height: '100%', borderRadius: 100,
                  background: pct >= 100 ? '#ef4444' : 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          {/* Register button — student only */}
          {user?.role === 'student' && r.status === 'upcoming' && (
            <button onClick={handleRegister} style={{
              ...css.btnPrimary, fontSize: 13, padding: '10px 20px', borderRadius: 10,
            }}>
              Register
            </button>
          )}

          {r.status === 'full' && (
            <span style={{
              fontSize: 13, padding: '10px 20px', borderRadius: 10,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', fontWeight: 600,
            }}>Full</span>
          )}

          {r.status === 'completed' && (
            <span style={{ fontSize: 13, color: dark ? '#475569' : '#94a3b8' }}>Completed ✓</span>
          )}

          {/* Delete — teacher/admin */}
          {(isTeacher && (isOwner || user?.role === 'admin')) && (
            <button onClick={() => onDelete(r._id || r.id)} style={{
              fontSize: 13, padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
              border: '1px solid rgba(239,68,68,0.35)',
              background: 'rgba(239,68,68,0.1)',
              color: '#ef4444', fontFamily: 'inherit', fontWeight: 600,
            }}>
              🗑 Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}