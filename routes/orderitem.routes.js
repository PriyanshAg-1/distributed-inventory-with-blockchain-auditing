const express = require('express');
const router = express.Router();
const { addOrderItem } = require('../controller/orderitem.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Add item to order
router.post('/:orderId/items', authMiddleware, addOrderItem);

module.exports = router;