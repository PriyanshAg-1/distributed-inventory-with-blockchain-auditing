const express = require('express');
const router = express.Router();

// Import authentication middleware
const authMiddleware = require('../middleware/auth.middleware');
// Import controller functions
const { createProduct, readProduct, updateProduct, deleteProduct } = require('../controller/product.controller');

// Product routes
router.post('/', authMiddleware, createProduct);
router.get('/:productId', authMiddleware, readProduct);
router.put('/:productId', authMiddleware, updateProduct);
router.delete('/:productId', authMiddleware, deleteProduct);

// Export the router
module.exports = router;