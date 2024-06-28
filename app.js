const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // for password hashing
const dotenv = require('dotenv');
const { Client } = require('pg'); // Using pg for PostgreSQL

dotenv.config();

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 3000;

// Create a connection pool using the PostgreSQL connection string from .env
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

app.get('/', (req, res) =>{
  res.send('Hello World');
})

app.get('/test', (req, res) =>{
  res.send('Hello Test');
})

// Registration route
app.post('/register', async (req, res) => {
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
app.post('/login', async (req, res) => {
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

    res.status(200).json({ message: 'Login was a successful', userId: foundUser.id, user: foundUser});
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Failed to login user.' });
  }
});

app.post('/timeentry', async (req, res) => {
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


app.post('/admin', async (req, res) => {
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


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
