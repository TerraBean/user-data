const express = require('express');
const dotenv = require('dotenv');
const pool = require('./db');

dotenv.config();

const router = express.Router();


// get all time entries based on current date

router.get('/', async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  try {
    const client = await pool.query(
      'SELECT * FROM attendance WHERE clocked_in >= $1 AND clocked_in <= $2',
      [startOfDay, endOfDay]
    );
    const timeEntries = client.rows;
    res.status(200).json(timeEntries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    res.status(500).json({ message: 'Failed to fetch time entries' });
  }
});

router.post('/record-time', async (req, res) => {
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
