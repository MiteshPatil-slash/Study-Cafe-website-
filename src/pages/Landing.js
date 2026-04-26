import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';
import { Icons } from '../utils/icons';

const FEATURES = [
  { icon: '📚', title: 'Smart Notes Library',    desc: 'Curated, searchable notes from top professors — organized by subject and semester.' },
  { icon: '📄', title: 'Previous Year Papers',   desc: 'Decade-long archive of exam papers with solutions, filtered by college and exam type.' },
  { icon: '🎬', title: 'Video Lectures',          desc: 'High-quality recorded sessions from expert teachers, accessible anytime.' },
  { icon: '🙋', title: 'Live Doubt Sessions',     desc: 'Book seats in real-time doubt-solving sessions with your college\'s top educators.' },
  { icon: '✅', title: 'Study Routine Tracker',   desc: 'Build consistent study habits with daily task tracking and progress streaks.' },
  { icon: '🏫', title: 'Multi-College Access',   desc: 'Resources from Pune\'s top engineering colleges — all in one unified platform.' },
];

const STATS = [
  ['24K+', 'Students'],
  ['6',    'Top Colleges'],
  ['1,200+', 'Resources'],
  ['98%',  'Satisfaction'],
];

export default function Landing() {
  const { setPage, dark, setDark } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const css = getTheme(dark);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goLogin = () => setPage('login');

  return (
    <div style={{ background: dark ? '#050810' : '#f8f9ff', minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 48px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled
          ? (dark ? 'rgba(5,8,16,0.92)' : 'rgba(248,249,255,0.92)')
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled
          ? `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`
          : 'none',
        transition: 'all 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>☕</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: dark ? '#fff' : '#0f0f23', letterSpacing: '-0.5px' }}>
            Study Cafe
          </span>
        </div>

        {/* Nav right */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => setDark((d) => !d)} style={css.iconBtn}>
            {dark ? <Icons.Sun /> : <Icons.Moon />}
          </button>
          <button onClick={goLogin} style={{ ...css.btnPrimary, fontSize: 14, padding: '8px 24px' }}>
            Login
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '120px 24px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* BG blobs */}
        <div style={{
          position: 'absolute', width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)',
          top: '5%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%)',
          bottom: '10%', right: '10%', pointerEvents: 'none',
        }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 18px', borderRadius: 100,
          background: dark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.3)',
          marginBottom: 32, color: '#818cf8', fontSize: 13, fontWeight: 600,
          animation: 'fadeInUp 0.5s ease forwards',
        }}>
          <span>✨</span> Built for engineering students in Pune
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(40px,7vw,82px)', fontWeight: 800,
          letterSpacing: '-3px', lineHeight: 1.05,
          color: dark ? '#fff' : '#0f0f23',
          maxWidth: 860, marginBottom: 28,
          animation: 'fadeInUp 0.5s 0.1s ease both',
        }}>
          Your academic edge,<br />
          <span className="gradient-text">brewed to perfection.</span>
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: 18, color: dark ? '#94a3b8' : '#64748b',
          maxWidth: 560, lineHeight: 1.7, marginBottom: 48,
          animation: 'fadeInUp 0.5s 0.2s ease both',
        }}>
          Notes, previous papers, video lectures, and live doubt sessions — all in one
          beautiful platform built for Pune's top colleges.
        </p>

        {/* Single Login CTA */}
        <div style={{ animation: 'fadeInUp 0.5s 0.3s ease both' }}>
          <button
            onClick={goLogin}
            style={{
              ...css.btnPrimary,
              fontSize: 16, padding: '14px 48px', borderRadius: 14,
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            Login <Icons.ArrowRight />
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 56, marginTop: 80,
          flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeInUp 0.5s 0.45s ease both',
        }}>
          {STATS.map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: dark ? '#fff' : '#0f0f23', letterSpacing: '-1px' }}>{n}</div>
              <div style={{ fontSize: 13, color: dark ? '#64748b' : '#94a3b8', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '100px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <h2 style={{
            fontSize: 'clamp(28px,4vw,50px)', fontWeight: 800,
            letterSpacing: '-2px', color: dark ? '#fff' : '#0f0f23', marginBottom: 16,
          }}>
            Everything you need to excel
          </h2>
          <p style={{ color: dark ? '#64748b' : '#94a3b8', fontSize: 17 }}>
            One platform. All your academic resources. Zero chaos.
          </p>
        </div>
        <div className="stagger" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 24,
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="card-hover" style={{ ...css.card, padding: 32, borderRadius: 20 }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = dark ? '0 20px 60px rgba(99,102,241,0.12)' : '0 20px 60px rgba(0,0,0,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}
            >
              <div style={{ fontSize: 38, marginBottom: 18 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: dark ? '#f1f5f9' : '#0f0f23', marginBottom: 10, letterSpacing: '-0.4px' }}>{f.title}</h3>
              <p style={{ color: dark ? '#64748b' : '#64748b', fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{
          maxWidth: 660, margin: '0 auto', padding: '72px 56px',
          borderRadius: 28, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 30% 40%,rgba(255,255,255,0.12),transparent 60%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 52, marginBottom: 18 }}>☕</div>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', marginBottom: 14 }}>
              Ready to brew your success?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 36, fontSize: 16 }}>
              Join 24,000+ students already using Study Cafe to ace their exams.
            </p>
            <button
              onClick={goLogin}
              style={{
                background: '#fff', color: '#6366f1', border: 'none',
                padding: '14px 40px', borderRadius: 12,
                fontSize: 16, fontWeight: 800, cursor: 'pointer', letterSpacing: '-0.3px',
              }}
            >
              Login to get started
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '32px 48px',
        borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>☕</span>
          <span style={{ fontWeight: 800, color: dark ? '#fff' : '#0f0f23', fontSize: 16 }}>Study Cafe</span>
        </div>
        <p style={{ color: dark ? '#475569' : '#94a3b8', fontSize: 13 }}>
          © 2024 Study Cafe. Built with ❤️ for students in Pune.
        </p>
        <div style={{ display: 'flex', gap: 20 }}>
          {['About', 'Privacy', 'Terms', 'Contact'].map((l) => (
            <button key={l} style={{
              background: 'none', border: 'none',
              color: dark ? '#475569' : '#94a3b8',
              cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
            }}>{l}</button>
          ))}
        </div>
      </footer>

    </div>
  );
}
