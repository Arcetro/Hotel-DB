import { useState, useEffect } from 'react';

function Guests() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    custom_fields: ''
  });

  useEffect(() => {
    fetchGuests();
  }, []);

  const api = import.meta.env.VITE_API_URL;
  const fetchGuests = async () => {
    try {
      const response = await fetch(`${api}/api/guests`);
      const data = await response.json();
      setGuests(data);
    } catch (error) {
      console.error('Error fetching guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingGuest 
        ? `${api}/api/guests/${editingGuest.id}`
        : `${api}/api/guests`;
      
      const method = editingGuest ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingGuest(null);
        setFormData({ name: '', email: '', phone: '', custom_fields: '' });
        fetchGuests();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving guest:', error);
      alert('Error saving guest');
    }
  };

  const handleEdit = (guest) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name,
      email: guest.email || '',
      phone: guest.phone || '',
      custom_fields: guest.custom_fields || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this guest?')) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/guests/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchGuests();
      } else {
        alert('Error deleting guest');
      }
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('Error deleting guest');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingGuest(null);
    setFormData({ name: '', email: '', phone: '', custom_fields: '' });
  };

  if (loading) {
    return <div className="loading">Loading guests...</div>;
  }

  return (
    <div className="guests">
      <div className="guests-header">
        <h2>👥 Guest Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          ➕ Add New Guest
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>{editingGuest ? 'Edit Guest' : 'Add New Guest'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Custom Fields</label>
                <textarea
                  value={formData.custom_fields}
                  onChange={(e) => setFormData({...formData, custom_fields: e.target.value})}
                  placeholder="Additional notes or custom fields..."
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingGuest ? 'Update' : 'Save'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="guests-list">
        {guests.length === 0 ? (
          <p className="no-data">No guests found. Add your first guest!</p>
        ) : (
          <div className="guests-grid">
            {guests.map(guest => (
              <div key={guest.id} className="guest-card">
                <div className="guest-info">
                  <h3>{guest.name}</h3>
                  {guest.email && <p>📧 {guest.email}</p>}
                  {guest.phone && <p>📞 {guest.phone}</p>}
                  {guest.custom_fields && <p>📝 {guest.custom_fields}</p>}
                </div>
                <div className="guest-actions">
                  <button 
                    className="btn btn-small btn-secondary"
                    onClick={() => handleEdit(guest)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(guest.id)}
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

export default Guests; 