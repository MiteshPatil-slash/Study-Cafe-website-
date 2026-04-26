import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';
import { ROUTINE_TASKS } from '../data/dummyData';
import { Icons } from '../utils/icons';

export default function Routine() {
  const { routineDone, setRoutineDone, dark } = useApp();
  const css = getTheme(dark);

  const [customTask, setCustomTask] = useState('');
  const [extras, setExtras] = useState([]);

  const allTasks = [...ROUTINE_TASKS, ...extras];

  // FIX: total includes extra tasks so count is always accurate
  const total = allTasks.length;
  const done  = allTasks.filter((t) => routineDone[t.id]).length;
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);

  const toggleTask = (id) =>
    setRoutineDone((p) => ({ ...p, [id]: !p[id] }));

  const addExtra = () => {
    const trimmed = customTask.trim();
    if (!trimmed) return;
    const newId = `extra_${Date.now()}`;
    setExtras((p) => [...p, { id: newId, label: trimmed, time: 'Custom', icon: '⭐' }]);
    setCustomTask('');
  };

  // NEW: delete task
  const deleteTask = (e, id) => {
    e.stopPropagation();
    setExtras((p) => p.filter((t) => t.id !== id));
    setRoutineDone((p) => { const copy = { ...p }; delete copy[id]; return copy; });
  };

  const streakMsg =
  pct === 100
    ? '🏆 All tasks done! Incredible effort!'
    : pct >= 70
    ? '🚀 Great progress, keep pushing!'
    : pct >= 40
    ? '💪 You\'re getting there!'
    : '☕ Start with your first task!';
  return (
    <div className="fade-in" style={{ maxWidth: 580 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-1px', color: dark ? '#fff' : '#0f0f23', marginBottom: 6 }}>
          Daily Study Routine
        </h1>
        <p style={{ color: dark ? '#64748b' : '#94a3b8' }}>
          Build consistency — track your study sessions every day
        </p>
      </div>

      {/* Progress card */}
      <div style={{ ...css.card, padding: 28, borderRadius: 22, marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: dark ? '#64748b' : '#94a3b8', marginBottom: 5 }}>
              Today's Progress
            </p>
            <p style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-2px', color: dark ? '#fff' : '#0f0f23', lineHeight: 1 }}>
              {done}
              <span style={{ fontSize: 24, color: dark ? '#475569' : '#94a3b8', fontWeight: 600 }}>/{total}</span>
            </p>
          </div>

          {/* Circle progress */}
          <div style={{ position: 'relative', width: 80, height: 80 }}>
            <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="40" cy="40" r="34" fill="none" stroke={dark ? '#1e293b' : '#e2e8f0'} strokeWidth="7" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke="url(#grad)" strokeWidth="7"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 800, color: dark ? '#fff' : '#0f0f23',
            }}>
              {pct}%
            </div>
          </div>
        </div>

        {/* Bar */}
        <div style={{ height: 8, borderRadius: 100, background: dark ? '#1e293b' : '#e2e8f0', overflow: 'hidden', marginBottom: 12 }}>
          <div style={{
            width: `${pct}%`, height: '100%', borderRadius: 100,
            background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <p style={{ fontSize: 13, color: dark ? '#64748b' : '#94a3b8', fontWeight: 500 }}>
          {streakMsg}
        </p>
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {allTasks.map((task) => {
          const checked = routineDone[task.id];
          return (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              style={{
                ...css.card,
                padding: '16px 20px',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
                border: `1px solid ${checked ? 'rgba(99,102,241,0.3)' : (dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)')}`,
                background: checked ? 'rgba(99,102,241,0.08)' : (dark ? '#0c1020' : '#fff'),
                transition: 'all 0.2s',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => { if (!checked) e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
              onMouseLeave={(e) => { if (!checked) e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'; }}
            >
              {/* Checkbox */}
              <div style={{
                width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                border: `2px solid ${checked ? '#6366f1' : (dark ? '#334155' : '#cbd5e1')}`,
                background: checked ? '#6366f1' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', transition: 'all 0.2s',
              }}>
                {checked && <Icons.Check />}
              </div>

              {/* Icon */}
              <span style={{ fontSize: 20 }}>{task.icon}</span>

              {/* Label */}
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: 14, fontWeight: 600,
                  color: dark ? '#f1f5f9' : '#0f0f23',
                  textDecoration: checked ? 'line-through' : 'none',
                  opacity: checked ? 0.45 : 1,
                  transition: 'all 0.2s',
                }}>
                  {task.label}
                </p>
                <p style={{ fontSize: 11, color: dark ? '#475569' : '#94a3b8', marginTop: 2 }}>
                  {task.time}
                </p>
              </div>

              {checked && <span style={{ fontSize: 18 }}>✅</span>}

              {/* Delete button */}
              <button
                onClick={(e) => deleteTask(e, task.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 16, padding: '4px 6px', borderRadius: 8,
                  color: dark ? '#475569' : '#94a3b8',
                  opacity: 0.6, transition: 'all 0.15s', flexShrink: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = dark ? '#475569' : '#94a3b8'; e.currentTarget.style.opacity = '0.6'; }}
                title="Delete task"
              >🗑</button>
            </div>
          );
        })}
      </div>

      {/* Add custom task */}
      <div style={{ ...css.card, padding: 20, borderRadius: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: dark ? '#94a3b8' : '#64748b', marginBottom: 12 }}>
          + Add Custom Task
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={customTask}
            onChange={(e) => setCustomTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addExtra()}
            placeholder="e.g. Revise Chapter 5"
            style={{ ...css.input, flex: 1 }}
          />
          <button
            onClick={addExtra}
            style={{ ...css.btnPrimary, padding: '10px 18px', fontSize: 14 }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Completion celebration */}
      {pct === 100 && (
        <div style={{
          marginTop: 20, padding: 28, borderRadius: 18, textAlign: 'center',
          background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15))',
          border: '1px solid rgba(99,102,241,0.3)',
          animation: 'fadeIn 0.4s ease',
        }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🏆</div>
          <p style={{ fontSize: 17, fontWeight: 800, color: dark ? '#f1f5f9' : '#0f0f23', marginBottom: 6 }}>
            Study streak maintained!
          </p>
          <p style={{ fontSize: 13, color: dark ? '#64748b' : '#94a3b8' }}>
            All tasks completed for today. You're on fire!
          </p>
        </div>
      )}
    </div>
  );
}