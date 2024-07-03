const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

// Import routers
const userRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const timeEntryRouter = require('./routes/timeentry');
const coordinatesRouter = require('./routes/coordinates');
const { missingFieldsMiddleware, authenticateUser, authenticateAdmin } = require('./middleware/auth');

// Mount routers
app.use('/users', userRouter);
app.use('/admin', adminRouter);
app.use('/timeentry', timeEntryRouter);
app.use('/coordinates', coordinatesRouter);

// Basic routes
app.get('/', (req, res) => {
  res.send('Rollcall....');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
