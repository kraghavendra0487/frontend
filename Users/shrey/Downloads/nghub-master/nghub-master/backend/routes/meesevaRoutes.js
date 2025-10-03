const express = require('express');
const router = express.Router();
const {
  getAllMeeseva,
  getMeesevaById,
  createMeeseva,
  updateMeeseva,
  deleteMeeseva
} = require('../controllers/meesevaController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication and admin authorization
router.use(protect);
router.use(authorize('admin'));

// GET /api/meeseva - Get all meeseva records
router.get('/', getAllMeeseva);

// GET /api/meeseva/:id - Get meeseva record by ID
router.get('/:id', getMeesevaById);

// POST /api/meeseva - Create new meeseva record
router.post('/', createMeeseva);

// PUT /api/meeseva/:id - Update meeseva record
router.put('/:id', updateMeeseva);

// DELETE /api/meeseva/:id - Delete meeseva record
router.delete('/:id', deleteMeeseva);

module.exports = router;
