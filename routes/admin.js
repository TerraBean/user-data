const express = require('express');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const pool = require('./db');

dotenv.config();


const router = express.Router();


// Admin Registration route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Check for missing fields
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Hash password before storing
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Insert the new admin into the database
    const client = await pool.query('INSERT INTO admin (username, password) VALUES ($1, $2)', [username, hashedPassword]);

    console.log('Admin inserted successfully');
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Failed to create admin' });
  }
});

// Admin Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Check for missing fields
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Query the database for the admin
    const client = await pool.query('SELECT * FROM admin WHERE username = $1', [username]);
    const foundAdmin = client.rows[0];

    if (!foundAdmin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare the provided password with the hashed password in the database
    const match = await bcrypt.compare(password, foundAdmin.password);

    if (!match) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // If the credentials are valid, send a success response
    res.status(200).json({ message: 'Admin login successful', userId: foundAdmin.id, user: foundAdmin });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ message: 'Failed to login admin.' });
  }
});

module.exports = router;
