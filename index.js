require('dotenv').config();
const express =  require('express');

// Import route modules
const authRoutes = require('./routes/auth.routes');
const protectedRoutes = require('./routes/protected.routes');
const orderRoutes = require('./routes/order.routes');

// Import database connection
const { connectDB } = require('./model/database');

// Initialize Express app
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Use route modules
app.use('/api/auth', authRoutes);
// app.use('/api/protected', protectedRoutes);
app.use('/api/orders', orderRoutes);

// Start the server
const PORT = process.env.PORT || 5000;

// Debug: Log the MongoDB URI to verify it's loaded correctly
// console.log(process.env.MONGO_URI);

// Connect to the database and start the server
if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('Failed to connect to database', err);
    });
}

module.exports = app; // Export app for testing purposes

