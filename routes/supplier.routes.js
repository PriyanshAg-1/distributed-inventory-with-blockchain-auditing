const express = require('express');
const router = express.Router();

// Import authentication middleware
const authMiddleware = require('../middleware/auth.middleware');
// Import controller functions
const { createSupplier, getSuppliers, updateSupplier, deleteSupplier } = require('../controller/supplier.controller');

// Supplier routes
router.post('/', authMiddleware, createSupplier);
router.get('/', authMiddleware, getSuppliers);
router.put('/:supplierId', authMiddleware, updateSupplier);
router.delete('/:supplierId', authMiddleware, deleteSupplier);

// Export the router
module.exports = router;