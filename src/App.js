import React, { useState, useEffect } from 'react';
import Predictions from './components/Predictions';
import TeamPage from './components/TeamPage';
import FormTable from './components/FormTable';
import Results from './components/Results';
import About from './components/About';
import Login from './components/Login';
import './App.css';

const API = 'https://web-production-325b1.up.railway.app';

export { API };

const NAV = [
  { id: 'predictions', label: 'Predictions', icon: '⚡' },
  { id: 'table',       label: 'Form',        icon: '📊' },
  { id: 'results',     label: 'Results',     icon: '✅' },
  { id: 'about',       label: 'About',       icon: '🤖' },
];

const CREDENTIALS = { username: 'dondon', password: 'dd2425' };

export default function App() {
  const [authed,   setAuthed]   = useState(() => sessionStorage.getItem('dd_auth') === 'true');
  const [page,     setPage]     = useState('predictions');
  const [team,     setTeam]     = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.body.classList.toggle('light', !darkMode);
  }, [darkMode]);

  const login = (u, p) => {
    if (u === CREDENTIALS.username && p === CREDENTIALS.password) {
      sessionStorage.setItem('dd_auth', 'true');
      setAuthed(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('dd_auth');
    setAuthed(false);
  };

  const goTeam = (name) => { setTeam(name); setPage('team'); };
  const goBack = ()       => { setTeam(null); setPage('predictions'); };

  if (!authed) return <Login onLogin={login} />;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo" onClick={() => setPage('predictions')}>
            <span className="logo-dd">DD</span>
            <span className="logo-text">PREDICTOR</span>
          </div>
          <div className="header-right">
            <button className="theme-toggle" onClick={() => setDarkMode(d => !d)} aria-label="Toggle theme">
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="main">
        {page === 'predictions' && <Predictions onTeamClick={goTeam} />}
        {page === 'team'        && <TeamPage team={team} onBack={goBack} onTeamClick={goTeam} />}
        {page === 'table'       && <FormTable onTeamClick={goTeam} />}
        {page === 'results'     && <Results onTeamClick={goTeam} />}
        {page === 'about'       && <About />}
      </main>

      {/* Bottom nav */}
      <nav className="bottom-nav">
        {NAV.map(n => (
          <button
            key={n.id}
            className={`nav-btn ${page === n.id || (page === 'team' && n.id === 'predictions') ? 'active' : ''}`}
            onClick={() => { setPage(n.id); setTeam(null); }}
          >
            <span className="nav-icon">{n.icon}</span>
            <span className="nav-label">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
