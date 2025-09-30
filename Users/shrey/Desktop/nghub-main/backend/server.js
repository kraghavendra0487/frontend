const express = require('express');
const cors = require('cors');
const path = require('path');
const { runPy } = require('./utils/emailRunner');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.FRONTEND_ORIGIN
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) return callback(null, true);
    return callback(null, true); // fallback allow for local mixed origins
  },
  credentials: true
}));
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../my-app/dist')));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const customerRoutes = require('./routes/customerRoutes');
const campRoutes = require('./routes/campRoutes');
const cardRoutes = require('./routes/cardRoutes');
const claimRoutes = require('./routes/claimRoutes');
const meesevaRoutes = require('./routes/meesevaRoutes');

// Use routes
app.use('/api/auth', authRoutes);           // 🔑 New auth routes
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/camps', campRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/meeseva', meesevaRoutes);

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../my-app/dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend served from: ${path.join(__dirname, '../my-app/dist')}`);
  console.log(`🔗 API endpoints available at: http://localhost:${PORT}/api`);
});

module.exports = app;
