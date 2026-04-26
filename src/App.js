import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Toast from './components/common/Toast';
import AppShell from './components/layout/AppShell';

// Pages
import Landing   from './pages/Landing';
import Auth      from './pages/Auth';
import Signup    from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Colleges  from './pages/Colleges';
import Resources from './pages/Resources';
import Upload    from './pages/Upload';
import Routine   from './pages/Routine';
import Admin       from './pages/Admin';
import AdminLogin  from './pages/AdminLogin';
import AdminPanel  from './pages/AdminPanel';

function Router() {
  const { page, user } = useApp();

  // Public routes
  if (page === 'landing')    return <Landing />;
  if (page === 'adminlogin') return <AdminLogin />;
  if (page === 'login')   return <Auth />;
  if (page === 'signup')  return <Signup />;

  // Protected — require login
  if (!user) return <Landing />;

  const withShell = (children) => <AppShell>{children}</AppShell>;

  if (page === 'dashboard') return withShell(<Dashboard />);
  if (page === 'colleges')  return withShell(<Colleges />);
  if (page === 'resources') return withShell(<Resources />);
  if (page === 'routine' && user.role === 'student') return withShell(<Routine />);
  if (page === 'upload'  && user.role === 'teacher') return withShell(<Upload />);
  if (page === 'admin'   && user.role === 'admin')   return withShell(<Admin />);
  if (page === 'adminpanel' && user.role === 'admin')  return <AdminPanel />;

  // Fallback
  return withShell(<Dashboard />);
}

export default function App() {
  return (
    <AppProvider>
      <Router />
      <Toast />
    </AppProvider>
  );
}