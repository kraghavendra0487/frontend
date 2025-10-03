const express = require('express');
const { FinancialTransactionController, upload } = require('../controllers/financialTransactionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ===== ALL ROUTES WITHOUT AUTHENTICATION (for testing purposes) =====

// POST /api/financial-transactions/upload - Upload CSV file and bulk create transactions
router.post('/upload', upload.single('file'), FinancialTransactionController.uploadCSVorXLS);

// GET /api/financial-transactions/export - Export transactions to CSV
router.get('/export', FinancialTransactionController.exportToCSV);

// GET /api/financial-transactions/distinct/:column - Get distinct values for filter dropdowns
router.get('/distinct/:column', FinancialTransactionController.getDistinctValues);

// GET /api/financial-transactions - Get all financial transactions with pagination and filtering
router.get('/', FinancialTransactionController.getAllFinancialTransactions);

// GET /api/financial-transactions/:id - Get single financial transaction by ID
router.get('/:id', FinancialTransactionController.getFinancialTransactionById);

// POST /api/financial-transactions - Create new financial transaction
router.post('/', FinancialTransactionController.createFinancialTransaction);

// PUT /api/financial-transactions/:id - Update financial transaction
router.put('/:id', FinancialTransactionController.updateFinancialTransaction);

// DELETE /api/financial-transactions/:id - Delete financial transaction
router.delete('/:id', FinancialTransactionController.deleteFinancialTransaction);

module.exports = router;
