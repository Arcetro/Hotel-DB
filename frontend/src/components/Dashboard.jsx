import { useState, useEffect } from 'react';

function Dashboard() {
  const [stats, setStats] = useState({
    guests: 0,
    rooms: 0,
    reservations: 0,
    availableRooms: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [guestsRes, roomsRes, reservationsRes] = await Promise.all([
          fetch('http://localhost:3001/api/guests'),
          fetch('http://localhost:3001/api/rooms'),
          fetch('http://localhost:3001/api/reservations')
        ]);

        const guests = await guestsRes.json();
        const rooms = await roomsRes.json();
        const reservations = await reservationsRes.json();

        const availableRooms = rooms.filter(room => room.status === 'available').length;

        setStats({
          guests: guests.length,
          rooms: rooms.length,
          reservations: reservations.length,
          availableRooms
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h2>📊 Hotel Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>👥 Total Guests</h3>
          <p className="stat-number">{stats.guests}</p>
        </div>
        
        <div className="stat-card">
          <h3>🏠 Total Rooms</h3>
          <p className="stat-number">{stats.rooms}</p>
        </div>
        
        <div className="stat-card">
          <h3>📅 Active Reservations</h3>
          <p className="stat-number">{stats.reservations}</p>
        </div>
        
        <div className="stat-card">
          <h3>✅ Available Rooms</h3>
          <p className="stat-number">{stats.availableRooms}</p>
        </div>
      </div>

      <div className="quick-actions">
        <h3>🚀 Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn">
            ➕ Add New Guest
          </button>
          <button className="action-btn">
            🏠 Add New Room
          </button>
          <button className="action-btn">
            📅 Create Reservation
          </button>
          <button className="action-btn">
            📊 View Reports
          </button>
        </div>
      </div>

      <div className="recent-activity">
        <h3>🕒 Recent Activity</h3>
        <p>No recent activity to display.</p>
      </div>
    </div>
  );
}

export default Dashboard; 