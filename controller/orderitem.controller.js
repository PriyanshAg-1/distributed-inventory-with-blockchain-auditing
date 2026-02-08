const OrderItem = require('../model/orderitem.model');
const Order = require('../model/order.model');
const Product = require('../model/product.model');
const Supplier = require('../model/supplier.model');

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
        if (order.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to modify items for this order' });
        }
        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Order items can only be modified while order is pending' });
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

const getOrderItems = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const isOwner = order.createdBy.toString() === req.user.userId;
        let isAssignedSupplier = false;
        if (order.supplier) {
            const supplier = await Supplier.findById(order.supplier);
            isAssignedSupplier = supplier && supplier.user.toString() === req.user.userId;
        }
        if (!isOwner && !isAssignedSupplier) {
            return res.status(403).json({ message: 'Not authorized to view items for this order' });
        }

        const items = await OrderItem.find({ order: orderId }).populate('product', 'name description category');
        res.status(200).json({ items });
    } catch (err) {
        console.error('Error fetching order items:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateOrderItem = async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { quantity } = req.body;

        if (!orderId || !itemId) {
            return res.status(400).json({ message: 'Order ID and item ID are required' });
        }

        if (quantity == null) {
            return res.status(400).json({ message: 'Quantity is required' });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be a positive integer' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (order.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to modify items for this order' });
        }
        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Order items can only be modified while order is pending' });
        }

        const orderItem = await OrderItem.findOne({ _id: itemId, order: orderId });
        if (!orderItem) {
            return res.status(404).json({ message: 'Order item not found' });
        }

        orderItem.quantity = quantity;
        await orderItem.save();

        res.status(200).json(orderItem);
    } catch (err) {
        console.error('Error updating order item:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteOrderItem = async (req, res) => {
    try {
        const { orderId, itemId } = req.params;

        if (!orderId || !itemId) {
            return res.status(400).json({ message: 'Order ID and item ID are required' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (order.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to modify items for this order' });
        }
        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Order items can only be modified while order is pending' });
        }

        const orderItem = await OrderItem.findOneAndDelete({ _id: itemId, order: orderId });
        if (!orderItem) {
            return res.status(404).json({ message: 'Order item not found' });
        }

        res.status(200).json(orderItem);
    } catch (err) {
        console.error('Error deleting order item:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addOrderItem,
    getOrderItems,
    updateOrderItem,
    deleteOrderItem
};
