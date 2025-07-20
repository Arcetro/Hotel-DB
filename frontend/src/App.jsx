import { useState, useEffect } from 'react';
import './App.css';

// Components
import Guests from './components/Guests';
import Rooms from './components/Rooms';
import Reservations from './components/Reservations';
import Dashboard from './components/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState('Checking...');

  useEffect(() => {
    // Check backend connection
    fetch('http://localhost:3001/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus('Connected'))
      .catch(() => setBackendStatus('Disconnected'));
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'guests':
        return <Guests />;
      case 'rooms':
        return <Rooms />;
      case 'reservations':
        return <Reservations />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏨 Hotel Management System</h1>
        <div className="status-indicator">
          <span className={`status-dot ${backendStatus === 'Connected' ? 'connected' : 'disconnected'}`}></span>
          Backend: {backendStatus}
        </div>
      </header>

      <nav className="app-nav">
        <button 
          className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`nav-btn ${currentView === 'guests' ? 'active' : ''}`}
          onClick={() => setCurrentView('guests')}
        >
          👥 Guests
        </button>
        <button 
          className={`nav-btn ${currentView === 'rooms' ? 'active' : ''}`}
          onClick={() => setCurrentView('rooms')}
        >
          🏠 Rooms
        </button>
        <button 
          className={`nav-btn ${currentView === 'reservations' ? 'active' : ''}`}
          onClick={() => setCurrentView('reservations')}
        >
          📅 Reservations
        </button>
      </nav>

      <main className="app-main">
        {renderView()}
      </main>
    </div>
  );
}

export default App;