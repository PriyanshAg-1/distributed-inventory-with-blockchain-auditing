const Transaction = require('../model/transaction.model');
const Order = require('../model/order.model');

const createTransaction = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { transactionHash, status } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }

        if (!transactionHash || !status) {
            return res.status(400).json({ message: 'Transaction hash and status are required' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const transaction = await Transaction.create({
            order: orderId,
            transactionHash,
            status
        });

        res.status(201).json(transaction);
    } catch (err) {
        if (err && err.code === 11000) {
            return res.status(409).json({ message: 'Transaction hash already exists' });
        }
        console.error('Error creating transaction:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getOrderTransactions = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const transactions = await Transaction.find({ order: orderId }).sort({ createdAt: -1 });
        res.status(200).json({ transactions });
    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createTransaction,
    getOrderTransactions
};
