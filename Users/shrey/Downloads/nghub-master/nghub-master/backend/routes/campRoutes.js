const express = require('express');
const CampController = require('../controllers/campController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Read operations for authenticated users
router.get('/', protect, authorize('admin', 'employee'), CampController.getAllCamps);
router.get('/search', protect, authorize('admin', 'employee'), CampController.searchCamps);
router.get('/status/:status', protect, authorize('admin', 'employee'), CampController.getCampsByStatus);
router.get('/employee/:employeeId', protect, authorize('admin', 'employee'), CampController.getCampsByEmployeeId);
router.get('/:id', protect, authorize('admin', 'employee'), CampController.getCampById);

// Write operations for admins and employees
router.post('/', protect, authorize('admin', 'employee'), CampController.createCamp);
router.put('/:id', protect, authorize('admin'), CampController.updateCamp);
router.delete('/:id', protect, authorize('admin'), CampController.deleteCamp);

module.exports = router;
