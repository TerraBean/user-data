const express = require('express');
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const router = express.Router();
const pool = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Connect to the database pool (optional, consider connecting at startup)
(async () => {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL database');
  } catch (error) {
    console.error('Connection error:', error);
    process.exit(1); // Exit on connection failure
  }
})();

// Middleware for handling missing fields
const missingFieldsMiddleware = (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  next();
};

// Middleware for handling authentication
const authenticateUser = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const client = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
    const foundUser = client.rows[0];

    if (!foundUser) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const match = await bcrypt.compare(password, foundUser.password);

    if (!match) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    req.user = foundUser; // Attach the user object to the request
    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ message: 'Failed to authenticate user.' });
  }
};

// Middleware for handling admin authentication
const authenticateAdmin = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const client = await pool.query('SELECT * FROM admin WHERE username = $1', [username]);
    const foundAdmin = client.rows[0];

    if (!foundAdmin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const match = await bcrypt.compare(password, foundAdmin.password);

    if (!match) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    req.admin = foundAdmin; // Attach the admin object to the request
    next();
  } catch (error) {
    console.error('Error authenticating admin:', error);
    res.status(500).json({ message: 'Failed to authenticate admin.' });
  }
};

module.exports = {
  missingFieldsMiddleware,
  authenticateUser,
  authenticateAdmin
};
