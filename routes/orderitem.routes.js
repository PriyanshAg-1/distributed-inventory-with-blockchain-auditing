const express = require('express');
const router = express.Router();
const { addOrderItem, getOrderItems, updateOrderItem, deleteOrderItem } = require('../controller/orderitem.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Add item to order
router.post('/:orderId/items', authMiddleware, addOrderItem);
// Get items for an order
router.get('/:orderId/items', authMiddleware, getOrderItems);
// Update an order item
router.put('/:orderId/items/:itemId', authMiddleware, updateOrderItem);
// Delete an order item
router.delete('/:orderId/items/:itemId', authMiddleware, deleteOrderItem);

module.exports = router;
