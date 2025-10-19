const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('../db/db'); // Correct path
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' })); // Allow React frontend
app.use(express.json()); // Parse JSON request bodies

// Routes
app.get('/', (req, res) => res.send('Backend Server is Running!'));

// Signup Route
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required.' });
  }

  try {
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await db.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING user_id, email, created_at',
      [email, passwordHash]
    );

    res.status(201).json({
      message: 'User created successfully!',
      user: newUser.rows[0], // Send back user info (excluding hash)
    });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error during signup.' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});