const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

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
