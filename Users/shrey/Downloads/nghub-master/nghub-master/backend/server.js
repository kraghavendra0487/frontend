const express = require('express');
const cors = require('cors');
const path = require('path');
const { runPy } = require('./utils/emailRunner'); // Assuming this is for some email functionality
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for CORS
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3000', // Frontend URL for local dev
      'http://localhost:5173',
      'https://6b974678ec6e.ngrok-free.app',// Vite dev server URL
       process.env.FRONTEND_ORIGIN, // Production URL stored in env
    ].filter(Boolean); // Filters out any falsy values like empty strings
    if (!origin || allowed.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
}));

// JSON parsing middleware - exclude specific upload routes
app.use((req, res, next) => {
  if (req.path === '/api/financial-transactions/upload' && req.method === 'POST') {
    return next(); // Skip JSON parsing for file uploads
  }
  express.json({ limit: '50mb' })(req, res, next);
});

// URL-encoded parsing middleware - exclude specific upload routes
app.use((req, res, next) => {
  if (req.path === '/api/financial-transactions/upload' && req.method === 'POST') {
    return next(); // Skip URL-encoded parsing for file uploads
  }
  express.urlencoded({ extended: true, limit: '50mb' })(req, res, next);
});

// Serve static files from React build (assuming the build is in '../my-app/dist')
// Only serve static files if the dist directory exists
const distPath = path.join(__dirname, '../my-app/dist');
if (require('fs').existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Import and use all API routes
const apiRoutes = require('./routes/index');
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Catch-all handler: send back React's index.html file for any non-API routes
// Only if the dist directory exists
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../my-app/dist/index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: 'Frontend not built. Please run "npm run build" in the my-app directory.',
      message: 'API endpoints are available at /api/*'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend served from: ${path.join(__dirname, '../my-app/dist')}`);
  console.log(`🔗 API endpoints available at: http://localhost:${PORT}/api`);
});

module.exports = app;
