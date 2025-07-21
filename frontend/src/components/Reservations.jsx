import { useState, useEffect } from 'react';

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [formData, setFormData] = useState({
    guest_id: '',
    room_id: '',
    check_in: '',
    check_out: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const api = import.meta.env.VITE_API_URL;
  const fetchData = async () => {
    try {
      const [reservationsRes, guestsRes, roomsRes] = await Promise.all([
        fetch(`${api}/api/reservations`),
        fetch(`${api}/api/guests`),
        fetch(`${api}/api/rooms`)
      ]);

      const reservationsData = await reservationsRes.json();
      const guestsData = await guestsRes.json();
      const roomsData = await roomsRes.json();

      setReservations(reservationsData);
      setGuests(guestsData);
      setRooms(roomsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingReservation 
        ? `${api}/api/reservations/${editingReservation.id}`
        : `${api}/api/reservations`;
      
      const method = editingReservation ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          guest_id: parseInt(formData.guest_id),
          room_id: parseInt(formData.room_id)
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingReservation(null);
        setFormData({ guest_id: '', room_id: '', check_in: '', check_out: '', status: 'active' });
        fetchData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving reservation:', error);
      alert('Error saving reservation');
    }
  };

  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    setFormData({
      guest_id: reservation.guest_id.toString(),
      room_id: reservation.room_id.toString(),
      check_in: reservation.check_in,
      check_out: reservation.check_out,
      status: reservation.status || 'active'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this reservation?')) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/reservations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      } else {
        alert('Error deleting reservation');
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
      alert('Error deleting reservation');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingReservation(null);
    setFormData({ guest_id: '', room_id: '', check_in: '', check_out: '', status: 'active' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-unknown';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading reservations...</div>;
  }

  return (
    <div className="reservations">
      <div className="reservations-header">
        <h2>📅 Reservation Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          ➕ Add New Reservation
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>{editingReservation ? 'Edit Reservation' : 'Add New Reservation'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Guest *</label>
                <select
                  value={formData.guest_id}
                  onChange={(e) => setFormData({...formData, guest_id: e.target.value})}
                  required
                >
                  <option value="">Select guest...</option>
                  {guests.map(guest => (
                    <option key={guest.id} value={guest.id}>
                      {guest.name} {guest.email ? `(${guest.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Room *</label>
                <select
                  value={formData.room_id}
                  onChange={(e) => setFormData({...formData, room_id: e.target.value})}
                  required
                >
                  <option value="">Select room...</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      Room {room.number} ({room.type || 'N/A'}) - ${room.price || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Check-in Date *</label>
                <input
                  type="date"
                  value={formData.check_in}
                  onChange={(e) => setFormData({...formData, check_in: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Check-out Date *</label>
                <input
                  type="date"
                  value={formData.check_out}
                  onChange={(e) => setFormData({...formData, check_out: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingReservation ? 'Update' : 'Save'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="reservations-list">
        {reservations.length === 0 ? (
          <p className="no-data">No reservations found. Add your first reservation!</p>
        ) : (
          <div className="reservations-grid">
            {reservations.map(reservation => (
              <div key={reservation.id} className="reservation-card">
                <div className="reservation-info">
                  <h3>📅 Reservation #{reservation.id}</h3>
                  <p>👤 Guest: {reservation.guest_name || 'Unknown'}</p>
                  <p>🏠 Room: {reservation.room_number || 'Unknown'}</p>
                  <p>📅 Check-in: {formatDate(reservation.check_in)}</p>
                  <p>📅 Check-out: {formatDate(reservation.check_out)}</p>
                  <p className={`status ${getStatusColor(reservation.status)}`}>
                    📊 Status: {reservation.status}
                  </p>
                </div>
                <div className="reservation-actions">
                  <button 
                    className="btn btn-small btn-secondary"
                    onClick={() => handleEdit(reservation)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(reservation.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reservations; 