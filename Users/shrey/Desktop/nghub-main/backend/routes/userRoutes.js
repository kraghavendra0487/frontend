const express = require('express');
const UserController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes (legacy - prefer /api/auth)
router.post('/login', UserController.loginUser);

// Protected session helpers
router.get('/validate-token', protect, UserController.validateToken);
router.post('/logout', protect, UserController.logoutUser);

// Secure user management with role checks
router.get('/', protect, authorize('admin'), UserController.getAllUsers);
router.get('/employees', protect, authorize('admin', 'employee'), UserController.getEmployees);
router.post('/', protect, authorize('admin'), UserController.createUser);
router.get('/:id', protect, authorize('admin', 'employee'), UserController.getUserById);
router.put('/:id', protect, authorize('admin'), UserController.updateUser);
router.delete('/:id', protect, authorize('admin'), UserController.deleteUser);

module.exports = router;
