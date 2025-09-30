const express = require('express');
const CardController = require('../controllers/cardController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Read operations
router.get('/', protect, authorize('admin', 'employee'), CardController.getAllCards);
router.get('/:id', protect, authorize('admin', 'employee'), CardController.getCardById);
router.get('/customer/:customerId', protect, authorize('admin', 'employee'), CardController.getCardByCustomerId);
router.get('/employee/:employeeId', protect, authorize('admin', 'employee'), CardController.getCardsByEmployeeId);

// Write operations: both admin and employee can manage cards
router.post('/', protect, authorize('admin', 'employee'), CardController.createCard);
router.put('/:id', protect, authorize('admin', 'employee'), CardController.updateCard);
router.delete('/:id', protect, authorize('admin', 'employee'), CardController.deleteCard);

module.exports = router;
