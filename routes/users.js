const express = require('express');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const pool = require('./db');

dotenv.config();

const router = express.Router();

// fetch users
router.get('/', async (req, res) => {
  try {
    const client = await pool.query('SELECT * FROM Users');
    const users = client.rows;
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});


// Registration route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Check for missing fields
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Hash password before storing
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // No `pool.acquire()` needed with pg
    const client = await pool.query('INSERT INTO USERS(username, password) VALUES ($1, $2)', [username, hashedPassword]);
    console.log('User inserted successfully');
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Check for missing fields
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // No `pool.acquire()` needed with pg
    const client = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
    const foundUser = client.rows[0];
    if (!foundUser) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const match = await bcrypt.compare(password, foundUser.password);

    if (!match) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.status(200).json({ message: 'Login was a successful', userId: foundUser.id, user: foundUser });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Failed to login user.' });
  }
});

module.exports = router;



