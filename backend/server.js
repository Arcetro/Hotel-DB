const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// SQLite database setup
const dbPath = path.resolve(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create tables if they don't exist
const initDb = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS guests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      custom_fields TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT NOT NULL,
      type TEXT,
      status TEXT DEFAULT 'available',
      price REAL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guest_id INTEGER,
      room_id INTEGER,
      check_in TEXT,
      check_out TEXT,
      status TEXT DEFAULT 'active',
      FOREIGN KEY(guest_id) REFERENCES guests(id),
      FOREIGN KEY(room_id) REFERENCES rooms(id)
    )`);
  });
};

initDb();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

// ===== GUESTS ENDPOINTS =====

// GET all guests
app.get('/api/guests', (req, res) => {
  const query = 'SELECT * FROM guests ORDER BY name';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching guests:', err);
      res.status(500).json({ error: 'Failed to fetch guests' });
    } else {
      res.json(rows);
    }
  });
});

// GET single guest
app.get('/api/guests/:id', (req, res) => {
  const query = 'SELECT * FROM guests WHERE id = ?';
  
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      console.error('Error fetching guest:', err);
      res.status(500).json({ error: 'Failed to fetch guest' });
    } else if (!row) {
      res.status(404).json({ error: 'Guest not found' });
    } else {
      res.json(row);
    }
  });
});

// POST new guest
app.post('/api/guests', (req, res) => {
  const { name, email, phone, custom_fields } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const query = 'INSERT INTO guests (name, email, phone, custom_fields) VALUES (?, ?, ?, ?)';
  
  db.run(query, [name, email, phone, custom_fields], function(err) {
    if (err) {
      console.error('Error creating guest:', err);
      res.status(500).json({ error: 'Failed to create guest' });
    } else {
      res.status(201).json({ id: this.lastID, name, email, phone, custom_fields });
    }
  });
});

// PUT update guest
app.put('/api/guests/:id', (req, res) => {
  const { name, email, phone, custom_fields } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const query = 'UPDATE guests SET name = ?, email = ?, phone = ?, custom_fields = ? WHERE id = ?';
  
  db.run(query, [name, email, phone, custom_fields, req.params.id], function(err) {
    if (err) {
      console.error('Error updating guest:', err);
      res.status(500).json({ error: 'Failed to update guest' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Guest not found' });
    } else {
      res.json({ id: req.params.id, name, email, phone, custom_fields });
    }
  });
});

// DELETE guest
app.delete('/api/guests/:id', (req, res) => {
  const query = 'DELETE FROM guests WHERE id = ?';
  
  db.run(query, [req.params.id], function(err) {
    if (err) {
      console.error('Error deleting guest:', err);
      res.status(500).json({ error: 'Failed to delete guest' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Guest not found' });
    } else {
      res.json({ message: 'Guest deleted successfully' });
    }
  });
});

// ===== ROOMS ENDPOINTS =====

// GET all rooms
app.get('/api/rooms', (req, res) => {
  const query = 'SELECT * FROM rooms ORDER BY number';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching rooms:', err);
      res.status(500).json({ error: 'Failed to fetch rooms' });
    } else {
      res.json(rows);
    }
  });
});

// GET single room
app.get('/api/rooms/:id', (req, res) => {
  const query = 'SELECT * FROM rooms WHERE id = ?';
  
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      console.error('Error fetching room:', err);
      res.status(500).json({ error: 'Failed to fetch room' });
    } else if (!row) {
      res.status(404).json({ error: 'Room not found' });
    } else {
      res.json(row);
    }
  });
});

// POST new room
app.post('/api/rooms', (req, res) => {
  const { number, type, status, price } = req.body;
  
  if (!number) {
    return res.status(400).json({ error: 'Room number is required' });
  }
  
  const query = 'INSERT INTO rooms (number, type, status, price) VALUES (?, ?, ?, ?)';
  
  db.run(query, [number, type, status || 'available', price], function(err) {
    if (err) {
      console.error('Error creating room:', err);
      res.status(500).json({ error: 'Failed to create room' });
    } else {
      res.status(201).json({ id: this.lastID, number, type, status: status || 'available', price });
    }
  });
});

// PUT update room
app.put('/api/rooms/:id', (req, res) => {
  const { number, type, status, price } = req.body;
  
  if (!number) {
    return res.status(400).json({ error: 'Room number is required' });
  }
  
  const query = 'UPDATE rooms SET number = ?, type = ?, status = ?, price = ? WHERE id = ?';
  
  db.run(query, [number, type, status, price, req.params.id], function(err) {
    if (err) {
      console.error('Error updating room:', err);
      res.status(500).json({ error: 'Failed to update room' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Room not found' });
    } else {
      res.json({ id: req.params.id, number, type, status, price });
    }
  });
});

// DELETE room
app.delete('/api/rooms/:id', (req, res) => {
  const query = 'DELETE FROM rooms WHERE id = ?';
  
  db.run(query, [req.params.id], function(err) {
    if (err) {
      console.error('Error deleting room:', err);
      res.status(500).json({ error: 'Failed to delete room' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Room not found' });
    } else {
      res.json({ message: 'Room deleted successfully' });
    }
  });
});

// ===== RESERVATIONS ENDPOINTS =====

// GET all reservations with guest and room details
app.get('/api/reservations', (req, res) => {
  const query = `
    SELECT r.*, g.name as guest_name, g.email as guest_email, 
           rm.number as room_number, rm.type as room_type
    FROM reservations r
    LEFT JOIN guests g ON r.guest_id = g.id
    LEFT JOIN rooms rm ON r.room_id = rm.id
    ORDER BY r.check_in DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching reservations:', err);
      res.status(500).json({ error: 'Failed to fetch reservations' });
    } else {
      res.json(rows);
    }
  });
});

// GET single reservation
app.get('/api/reservations/:id', (req, res) => {
  const query = `
    SELECT r.*, g.name as guest_name, g.email as guest_email, 
           rm.number as room_number, rm.type as room_type
    FROM reservations r
    LEFT JOIN guests g ON r.guest_id = g.id
    LEFT JOIN rooms rm ON r.room_id = rm.id
    WHERE r.id = ?
  `;
  
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      console.error('Error fetching reservation:', err);
      res.status(500).json({ error: 'Failed to fetch reservation' });
    } else if (!row) {
      res.status(404).json({ error: 'Reservation not found' });
    } else {
      res.json(row);
    }
  });
});

// POST new reservation
app.post('/api/reservations', (req, res) => {
  const { guest_id, room_id, check_in, check_out, status } = req.body;
  
  if (!guest_id || !room_id || !check_in || !check_out) {
    return res.status(400).json({ error: 'Guest ID, room ID, check-in, and check-out are required' });
  }
  
  const query = 'INSERT INTO reservations (guest_id, room_id, check_in, check_out, status) VALUES (?, ?, ?, ?, ?)';
  
  db.run(query, [guest_id, room_id, check_in, check_out, status || 'active'], function(err) {
    if (err) {
      console.error('Error creating reservation:', err);
      res.status(500).json({ error: 'Failed to create reservation' });
    } else {
      res.status(201).json({ 
        id: this.lastID, 
        guest_id, 
        room_id, 
        check_in, 
        check_out, 
        status: status || 'active' 
      });
    }
  });
});

// PUT update reservation
app.put('/api/reservations/:id', (req, res) => {
  const { guest_id, room_id, check_in, check_out, status } = req.body;
  
  if (!guest_id || !room_id || !check_in || !check_out) {
    return res.status(400).json({ error: 'Guest ID, room ID, check-in, and check-out are required' });
  }
  
  const query = 'UPDATE reservations SET guest_id = ?, room_id = ?, check_in = ?, check_out = ?, status = ? WHERE id = ?';
  
  db.run(query, [guest_id, room_id, check_in, check_out, status, req.params.id], function(err) {
    if (err) {
      console.error('Error updating reservation:', err);
      res.status(500).json({ error: 'Failed to update reservation' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Reservation not found' });
    } else {
      res.json({ id: req.params.id, guest_id, room_id, check_in, check_out, status });
    }
  });
});

// DELETE reservation
app.delete('/api/reservations/:id', (req, res) => {
  const query = 'DELETE FROM reservations WHERE id = ?';
  
  db.run(query, [req.params.id], function(err) {
    if (err) {
      console.error('Error deleting reservation:', err);
      res.status(500).json({ error: 'Failed to delete reservation' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Reservation not found' });
    } else {
      res.json({ message: 'Reservation deleted successfully' });
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
