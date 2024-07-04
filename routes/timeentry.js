const express = require('express');
const dotenv = require('dotenv');
const pool = require('./db');

dotenv.config();

const router = express.Router();


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
