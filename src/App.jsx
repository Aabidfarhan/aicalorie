import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import Meals from './pages/Meals';
import Settings from './pages/Settings';
import Coach from './pages/Coach';
import Progress from './pages/Progress';
import Auth from './pages/Auth';
import { SessionProvider, useSessionContext } from './context/SessionContext';

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const { isAnonymous, authReady } = useSessionContext();

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Wait for Supabase to resolve session before rendering
  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show auth page if not logged in with a real account
  if (isAnonymous) {
    return <Auth />;
  }

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
      darkMode={darkMode}
      toggleDarkMode={() => setDarkMode(!darkMode)}
    >
      {activePage === 'dashboard' && <Dashboard />}
      {activePage === 'chatbot' && <Chatbot />}
      {activePage === 'meals' && <Meals />}
      {activePage === 'settings' && <Settings />}
      {activePage === 'coach' && <Coach />}
      {activePage === 'progress' && <Progress />}
    </Layout>
  );
}

function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}

export default App;
