import { useState, useEffect } from 'react';

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    number: '',
    type: '',
    status: 'available',
    price: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/rooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingRoom 
        ? `http://localhost:3001/api/rooms/${editingRoom.id}`
        : 'http://localhost:3001/api/rooms';
      
      const method = editingRoom ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingRoom(null);
        setFormData({ number: '', type: '', status: 'available', price: '' });
        fetchRooms();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Error saving room');
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      number: room.number,
      type: room.type || '',
      status: room.status || 'available',
      price: room.price ? room.price.toString() : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/rooms/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchRooms();
      } else {
        alert('Error deleting room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Error deleting room');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingRoom(null);
    setFormData({ number: '', type: '', status: 'available', price: '' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'status-available';
      case 'occupied': return 'status-occupied';
      case 'maintenance': return 'status-maintenance';
      default: return 'status-unknown';
    }
  };

  if (loading) {
    return <div className="loading">Loading rooms...</div>;
  }

  return (
    <div className="rooms">
      <div className="rooms-header">
        <h2>🏠 Room Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          ➕ Add New Room
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>{editingRoom ? 'Edit Room' : 'Add New Room'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Room Number *</label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({...formData, number: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="">Select type...</option>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="suite">Suite</option>
                  <option value="deluxe">Deluxe</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Price per Night</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingRoom ? 'Update' : 'Save'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="rooms-list">
        {rooms.length === 0 ? (
          <p className="no-data">No rooms found. Add your first room!</p>
        ) : (
          <div className="rooms-grid">
            {rooms.map(room => (
              <div key={room.id} className="room-card">
                <div className="room-info">
                  <h3>🏠 Room {room.number}</h3>
                  {room.type && <p>📋 Type: {room.type}</p>}
                  <p className={`status ${getStatusColor(room.status)}`}>
                    📊 Status: {room.status}
                  </p>
                  {room.price && <p>💰 ${room.price}/night</p>}
                </div>
                <div className="room-actions">
                  <button 
                    className="btn btn-small btn-secondary"
                    onClick={() => handleEdit(room)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(room.id)}
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

export default Rooms; 