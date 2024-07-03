const express = require('express');
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

router.post('/', async (req, res) => {
  const { adminid, longitude, latitude, radius } = req.body;

  // Check for missing fields
  if (!adminid || !longitude || !latitude || !radius) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Insert the new coordinate entry into the database
    const client = await pool.query('INSERT INTO coordinates (adminid, longitude, latitude, radius) VALUES ($1, $2, $3, $4)', [adminid, longitude, latitude, radius]);

    console.log('Coordinate entry inserted successfully');
    res.status(201).json({ message: 'Coordinate entry created successfully' });
  } catch (error) {
    console.error('Error creating coordinate entry:', error);
    res.status(500).json({ message: 'Failed to create coordinate entry' });
  }
});

module.exports = router;
