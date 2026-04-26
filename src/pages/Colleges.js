import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';
import { Icons } from '../utils/icons';
import SearchBar from '../components/common/SearchBar';

export default function Colleges() {
  const { setSelectedCollege, setPage, dark, resources, user } = useApp();
  const css = getTheme(dark);
  const [search, setSearch] = useState('');
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/colleges')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setColleges(data); })
      .catch(() => {});
  }, []);

  // ✅ FIXED: show only logged-in student's college
  const visibleColleges =
    user?.role === 'student' && user?.college
      ? colleges.filter(
          (c) =>
            String(c._id) ===
            String(user.college?._id || user.college)
        )
      : colleges;

  const filtered = visibleColleges.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.short.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-1px', color: dark ? '#fff' : '#0f0f23', marginBottom: 6 }}>
          Select Your College
        </h1>
        <p style={{ color: dark ? '#64748b' : '#94a3b8' }}>
          Browse resources from Pune's leading engineering institutions
        </p>
      </div>

      <div style={{ marginBottom: 28 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search colleges by name or city..." maxWidth={420} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: dark ? '#475569' : '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No colleges found</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Try a different search term</p>
        </div>
      ) : (
        <div
          className="stagger"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}
        >
          {filtered.map((c) => {
            const resCount = resources.filter((r) => r.college === c._id || r.college?._id === c._id).length;
            return (
              <div
                key={c._id || c.id}
                className="card-hover"
                onClick={() => { setSelectedCollege({ ...c, id: c._id }); setPage('resources'); }}
                style={{
                  ...css.card,
                  borderRadius: 20,
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = dark ? '0 16px 48px rgba(0,0,0,0.45)' : '0 16px 48px rgba(0,0,0,0.13)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}
              >
                <div style={{ height: 5, background: c.color }} />

                <div style={{ padding: 26 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background: `${c.color}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 26,
                      }}
                    >
                      🏫
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontSize: 13, fontWeight: 700 }}>
                      <Icons.Star /> {c.rating}
                    </div>
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 700, color: c.color, marginBottom: 6 }}>
                    {c.short}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: dark ? '#f1f5f9' : '#0f0f23', marginBottom: 8 }}>
                    {c.name}
                  </h3>
                  <p style={{ fontSize: 13, marginBottom: 6 }}>
                    📍 {c.city} · Est. {c.established}
                  </p>
                  <p style={{ fontSize: 13, marginBottom: 18 }}>
                    👥 {(c.students || 0).toLocaleString()} · 📚 {resCount} resources
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                    {c.courses.map((course) => (
                      <span key={course} style={{ fontSize: 11 }}>
                        {course}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>View resources</span>
                    <span style={{ color: c.color }}>→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}