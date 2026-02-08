const express = require('express');
const router = express.Router();
const { createTransaction, getOrderTransactions } = require('../controller/transaction.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Order transactions
router.post('/:orderId/transactions', authMiddleware, createTransaction);
router.get('/:orderId/transactions', authMiddleware, getOrderTransactions);

module.exports = router;
