const OrderItem = require('../model/orderitem.model');
const Order = require('../model/order.model');
const Product = require('../model/product.model');

const addOrderItem = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { productId, quantity } = req.body;

        if (!orderId || !productId || quantity == null) {
            return res.status(400).json({ message: 'Order ID, Product ID, and quantity are required' });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be a positive integer' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const orderItem = new OrderItem({
            order: orderId,
            product: productId,
            quantity: quantity
        });
        await orderItem.save();
        res.status(201).json(orderItem);
    } catch (err) {
        console.error('Error adding order item:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addOrderItem
};
