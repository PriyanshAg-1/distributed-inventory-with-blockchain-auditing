const express = require('express');
const router = express.Router();
const {
    addInventory,
    getWarehouseInventory,
    getProductInventory,
    removeInventory
} = require('../controller/inventory.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Add or update inventory
router.post('/', authMiddleware, addInventory);

// Remove inventory
router.delete('/', authMiddleware, removeInventory);

// Get inventory for a warehouse
router.get('/warehouse/:warehouseId', authMiddleware, getWarehouseInventory);

// Get inventory for a product across all warehouses
router.get('/product/:productId', authMiddleware, getProductInventory);

module.exports = router;