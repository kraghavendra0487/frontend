const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const customerRoutes = require('./customerRoutes');
const campRoutes = require('./campRoutes');
const cardRoutes = require('./cardRoutes');
const claimRoutes = require('./claimRoutes');
const meesevaRoutes = require('./meesevaRoutes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/camps', campRoutes);
router.use('/cards', cardRoutes);
router.use('/claims', claimRoutes);
router.use('/meeseva', meesevaRoutes);

// Legacy endpoints for backward compatibility
router.get('/profile', require('../middleware/authMiddleware').protect, (req, res) => {
  res.json({ user: req.user });
});

router.get('/employees', require('../middleware/authMiddleware').protect, require('../middleware/authMiddleware').authorize('admin'), require('../controllers/userController').getEmployees);
router.get('/customers', require('../middleware/authMiddleware').protect, require('../middleware/authMiddleware').authorize('admin'), require('../controllers/customerController').getAllCustomers);
router.get('/camps', require('../middleware/authMiddleware').protect, require('../middleware/authMiddleware').authorize('admin'), require('../controllers/campController').getAllCamps);
router.get('/cards', require('../middleware/authMiddleware').protect, require('../middleware/authMiddleware').authorize('admin'), require('../controllers/cardController').getAllCards);
router.get('/claims', require('../middleware/authMiddleware').protect, require('../middleware/authMiddleware').authorize('admin'), require('../controllers/claimController').getAllClaims);

module.exports = router;
