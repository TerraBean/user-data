const express = require('express');
const dotenv = require('dotenv');
const pool = require('./db');

dotenv.config();

const router = express.Router();

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
