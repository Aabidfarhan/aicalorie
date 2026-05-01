import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import Meals from './pages/Meals';
import Settings from './pages/Settings';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
      {activePage === 'settings' && <Settings onSaveProfile={() => window.location.reload()} />}
      {activePage === 'progress' && (
        <div className="flex flex-col items-center justify-center h-96 text-center animate-in fade-in">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🚧</span>
          </div>
          <h2 className="text-xl font-bold text-slate-700">Coming Soon</h2>
          <p className="text-slate-500 mt-2 max-w-sm">
            The {activePage} page is currently under construction. Check back later!
          </p>
        </div>
      )}
    </Layout>
  );
}

export default App;
