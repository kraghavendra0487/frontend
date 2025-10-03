const express = require('express');
const AuthController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// 🔓 PUBLIC ROUTES
router.post('/login', AuthController.login);

// 🔒 PROTECTED ROUTES (require valid JWT)
router.post('/logout', protect, AuthController.logout);
router.get('/validate-token', protect, AuthController.validateToken);
router.get('/profile', protect, AuthController.getProfile);

// 🔐 ADMIN-ONLY ROUTES (require admin role)
// Example: router.get('/admin/users', protect, authorize('admin'), SomeController.getUsers);

// 👨‍💼 EMPLOYEE ROUTES (require employee role)
// Example: router.get('/employee/profile', protect, authorize('employee'), SomeController.getProfile);

module.exports = router;
