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
  const { userId } = req.body; // Assuming you're passing the user ID in the request body

  // Check for missing fields
  if (!userId) {
    return res.status(400).json({ message: 'Missing user ID' });
  }

  try {
    // Get the current timestamp
    const clockedInTime = new Date();

    // Insert the time entry into the attendance table
    const client = await pool.query('INSERT INTO attendance (user_id, clocked_in) VALUES ($1, $2)', [userId, clockedInTime]);

    console.log('Time entry inserted successfully');
    res.status(201).json({ message: 'Time entry recorded successfully' });
  } catch (error) {
    console.error('Error recording time entry:', error);
    res.status(500).json({ message: 'Failed to record time entry' });
  }
});

module.exports = router;
