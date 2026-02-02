const express = require('express');
const router = express.Router();
// Import authentication middleware
const authMiddleware = require('../middleware/auth.middleware');
// Import controller functions
const { createWarehouse, getWarehouses, updateWarehouse, deleteWarehouse } = require('../controller/warehouse.controller');
// Warehouse routes
router.post('/', authMiddleware, createWarehouse);
router.get('/', authMiddleware, getWarehouses);
router.put('/:warehouseId', authMiddleware, updateWarehouse);
router.delete('/:warehouseId', authMiddleware, deleteWarehouse);

// Export the router
module.exports = router;