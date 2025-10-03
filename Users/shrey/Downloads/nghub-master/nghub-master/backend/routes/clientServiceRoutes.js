const express = require('express');
const ClientServiceController = require('../controllers/clientServiceController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware.protect);

// Admin-only routes
router.use(authMiddleware.authorize('admin'));

// GET /api/client-services - Get all client services with pagination and filtering
router.get('/', ClientServiceController.getAllClientServices);

// ===== STATIC ROUTES (must come before dynamic routes) =====

// GET /api/client-services/service-statuses - Get predefined service statuses for dropdowns
router.get('/service-statuses', ClientServiceController.getServiceStatuses);

// GET /api/client-services/available-services - Get predefined services list for dropdowns
router.get('/available-services', ClientServiceController.getAvailableServices);

// GET /api/client-services/distinct/:column - Get distinct values for filter dropdowns
router.get('/distinct/:column', ClientServiceController.getDistinctValues);

// ===== DYNAMIC ROUTES (must come after static routes) =====

// GET /api/client-services/:id - Get client service by ID
router.get('/:id', ClientServiceController.getClientServiceById);

// POST /api/client-services - Create new client service
router.post('/', ClientServiceController.createClientService);

// PUT /api/client-services/:id - Update client service
router.put('/:id', ClientServiceController.updateClientService);

// DELETE /api/client-services/:id - Delete client service
router.delete('/:id', ClientServiceController.deleteClientService);

// ===== SERVICE ITEM MANAGEMENT ROUTES =====

// GET /api/client-services/:clientServiceId/services - Get all service items for a client
router.get('/:clientServiceId/services', ClientServiceController.getServiceItems);

// POST /api/client-services/:clientServiceId/services - Create new service item
router.post('/:clientServiceId/services', ClientServiceController.createServiceItem);

// PUT /api/client-services/services/:id - Update service item
router.put('/services/:id', ClientServiceController.updateServiceItem);

// DELETE /api/client-services/services/:id - Delete service item
router.delete('/services/:id', ClientServiceController.deleteServiceItem);

module.exports = router;
