const Order = require('../model/order.model');

// Create a new order
const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderType, status} = req.body;

        if (!orderType || !status) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const newOrder = new Order({
            user: userId,
            orderType,
            status
        });
        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (err) {
        console.error('Error creating order', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Orders of Logged-in User

const getOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ user: userId });
        res.status(200).json({ orders });
    } catch (err) {
        console.error('Error fetching orders', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Export the controller functions
module.exports = {
    createOrder,
    getOrders
};