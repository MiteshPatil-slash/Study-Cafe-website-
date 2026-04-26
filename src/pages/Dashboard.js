import React from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';
import StatCard from '../components/common/StatCard';

const QUICK_ACTIONS = {
  student: [
    { label: 'Browse Colleges', icon: '🏫', page: 'colleges' },
    { label: 'View Resources', icon: '📚', page: 'resources' },
    { label: 'Study Routine', icon: '✅', page: 'routine' },
  ],
  teacher: [
    { label: 'Upload Resource', icon: '📤', page: 'upload' },
    { label: 'Browse Resources', icon: '📚', page: 'resources' },
    { label: 'View Colleges', icon: '🏫', page: 'colleges' },
  ],
  admin: [
    { label: 'Manage Users', icon: '👥', page: 'admin' },
    { label: 'All Resources', icon: '📚', page: 'resources' },
    { label: 'View Colleges', icon: '🏫', page: 'colleges' },
  ],
};

export default function Dashboard() {
  const { user, resources, setPage, dark } = useApp();
  const css = getTheme(dark);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const statsMap = {
    student: [
      { label: 'Resources Accessed', value: '47', icon: '📚', color: '#6366f1' },
      { label: 'Colleges Explored', value: '3', icon: '🏫', color: '#10b981' },
      { label: 'Tasks Done Today', value: '4/7', icon: '✅', color: '#f59e0b' },
      { label: 'Sessions Booked', value: '2', icon: '🙋', color: '#ef4444' },
    ],
    teacher: [
      {
        label: 'Your Uploads',
        value: String(resources.filter((r) => (r.uploadedBy?.name || r.uploadedBy) === user?.name).length),
        icon: '📤',
        color: '#6366f1',
      },
      { label: 'Total Downloads', value: '2.4K', icon: '⬇️', color: '#10b981' },
      { label: 'Sessions Scheduled', value: '6', icon: '📅', color: '#f59e0b' },
      { label: 'Students Reached', value: '840', icon: '👥', color: '#ef4444' },
    ],
    admin: [
      { label: 'Total Users', value: '24,381', icon: '👥', color: '#6366f1' },
      { label: 'Resources', value: String(resources.length), icon: '📚', color: '#10b981' },
      { label: 'Colleges', value: '6', icon: '🏫', color: '#f59e0b' },
      { label: 'Sessions Today', value: '12', icon: '📅', color: '#ef4444' },
    ],
  };

  const stats = statsMap[user?.role] || statsMap.student;
  const actions = QUICK_ACTIONS[user?.role] || QUICK_ACTIONS.student;
  const recent = resources.slice(0, 5);

  const typeIcon = { note: '📄', paper: '📝', video: '🎬', doubt: '🙋' };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gap: 16, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Recent */}
      <div>
        <h3>Recent Resources</h3>

        {recent.map((r) => (
          <div key={r._id}>
            <p>{r.title}</p>

            {/* ✅ FIXED LINE */}
            <p>
              {r.subject} · {r.uploadedBy?.name || r.uploadedBy} · {r.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}