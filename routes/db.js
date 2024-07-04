// db.js
const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Connect at startup
(async () => {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL database');
  } catch (error) {
    console.error('Connection error:', error);
    process.exit(1); // Exit on connection failure
  }
})();

module.exports = pool; 
