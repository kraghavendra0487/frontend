const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const customerRoutes = require('./customerRoutes');
const campRoutes = require('./campRoutes');
const cardRoutes = require('./cardRoutes');
const claimRoutes = require('./claimRoutes');
const meesevaRoutes = require('./meesevaRoutes');
const clientServiceRoutes = require('./clientServiceRoutes');
const financialTransactionRoutes = require('./financialTransactionRoutes');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'OK',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      database: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Database connection failed' });
  }
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/camps', campRoutes);
router.use('/cards', cardRoutes);
router.use('/claims', claimRoutes);
router.use('/meeseva', meesevaRoutes);
router.use('/client-services', clientServiceRoutes);
router.use('/financial-transactions', financialTransactionRoutes);

// Legacy endpoints for backward compatibility
router.get('/profile', authMiddleware.protect, (req, res) => {
  res.json({ user: req.user });
});

router.get('/employees', authMiddleware.protect, authMiddleware.authorize('admin'), require('../controllers/userController').getEmployees);
router.get('/customers', authMiddleware.protect, authMiddleware.authorize('admin'), require('../controllers/customerController').getAllCustomers);
router.get('/camps', authMiddleware.protect, authMiddleware.authorize('admin'), require('../controllers/campController').getAllCamps);
router.get('/cards', authMiddleware.protect, authMiddleware.authorize('admin'), require('../controllers/cardController').getAllCards);
router.get('/claims', authMiddleware.protect, authMiddleware.authorize('admin'), require('../controllers/claimController').getAllClaims);

module.exports = router;
