import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const AppContext = createContext();

const API = 'http://localhost:5000/api';

export function AppProvider({ children }) {

  // ── State ──────────────────────────────────────────────────
  const [page, setPage]                       = useState('landing');
  const [user, setUser]                       = useState(null);
  const [dark, setDark]                       = useState(true);
  const [toasts, setToasts]                   = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [resources, setResources]             = useState([]);
  const [users, setUsers]                     = useState([]);
  const [routineDone, setRoutineDone]         = useState({});
  const toastId = useRef(0);

  // ── Toast ──────────────────────────────────────────────────
  const toast = (msg, type = 'success') => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ── FETCH RESOURCES from backend ──────────────────────────
  // ✅ Backend now filters by user's college automatically (via JWT)
  // No need to pass college param — server reads it from the token
  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API}/resources`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Could not load resources:', err);
    }
  };

  // ── AUTO-FETCH on page load if token exists ────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${API}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data._id) {
          setUser(data);
          setPage('dashboard');
          fetchResources();
        }
      })
      .catch(() => {});
  }, []);

  // ── LOGIN ──────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast(data.message || 'Invalid email or password', 'error');
        return false;
      }

      localStorage.setItem('token', data.token);
      setUser(data.user);
      setPage('dashboard');
      toast(`Welcome back, ${data.user.name.split(' ')[0]}! 👋`);

      // ✅ fetch resources — backend filters by this user's college
      await fetchResources();
      return true;

    } catch (err) {
      toast('Cannot connect to server. Is backend running?', 'error');
      return false;
    }
  };

  // ── ADMIN LOGIN ───────────────────────────────────────────
  const adminLogin = async (email, password) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast(data.message || 'Invalid credentials', 'error');
        return false;
      }

      if (data.user.role !== 'admin') {
        toast('Access denied — admin only', 'error');
        return false;
      }

      localStorage.setItem('adminToken', data.token);
      setUser(data.user);
      setPage('adminpanel');
      toast(`Welcome, ${data.user.name}! 🔐`);
      return true;

    } catch (err) {
      toast('Cannot connect to server. Is backend running?', 'error');
      return false;
    }
  };

  // ── REGISTER ───────────────────────────────────────────────
  const register = async (formData) => {
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        toast(data.message || 'Registration failed', 'error');
        return false;
      }

      setPage('login');
      toast(`Account created! Please log in, ${data.user.name.split(' ')[0]} 🎉`);
      return true;

    } catch (err) {
      toast('Cannot connect to server. Is backend running?', 'error');
      return false;
    }
  };

  // ── LOGOUT ─────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setResources([]);
    setPage('landing');
    setSelectedCollege(null);
    toast('Logged out successfully');
  };

  // ── ADD RESOURCE ───────────────────────────────────────────
  const addResource = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/resources`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        toast(data.message || 'Upload failed', 'error');
        return false;
      }

      setResources((prev) => [data, ...prev]);
      toast('Resource uploaded successfully! 📚');
      return true;

    } catch (err) {
      toast('Network error — is the server running?', 'error');
      return false;
    }
  };

  // ── FETCH ALL USERS — admin only ───────────────────────────
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      toast('Could not fetch users', 'error');
    }
  };

  // ── REMOVE USER — admin only ───────────────────────────────
  const removeUser = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        toast(data.message || 'Could not remove user', 'error');
        return;
      }

      setUsers((prev) => prev.filter((u) => u._id !== id && u.id !== id));
      toast('User removed successfully', 'warning');

    } catch (err) {
      toast('Could not remove user', 'error');
    }
  };

  // ── Context value ──────────────────────────────────────────
  const value = {
    page,
    setPage,
    user,
    setUser,
    dark,
    setDark,
    toast,
    toasts,
    removeToast,
    login,
    adminLogin,
    register,
    logout,
    selectedCollege,
    setSelectedCollege,
    resources,
    setResources,
    addResource,
    fetchResources,
    users,
    setUsers,
    fetchUsers,
    removeUser,
    routineDone,
    setRoutineDone,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}