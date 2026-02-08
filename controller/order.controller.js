const Order = require('../model/order.model');
const Supplier = require('../model/supplier.model');
const Warehouse = require('../model/warehouse.model');
const {reservedInventoryForOrder, releaseInventoryForOrder, finalizeInventoryForOrder} = require('../services/inventory.services');


// Create a new order
const createOrder = async (req, res) => {
    try {
        // Get user ID from the authenticated request
        const userId = req.user.userId;
        const { orderType, warehouseId} = req.body;

        // Check if Order Type is provided
        if (!orderType) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse){
            return res.status(404).json({ message: 'Warehouse not found'});
        }
        // Create and save the new order
        const newOrder = new Order({
            orderType,
            createdBy: userId,
            warehouse: warehouseId
        });
        await newOrder.save();

        // Respond with the created order
        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (err) {
        console.error('Error creating order', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Orders of Logged-in User

const getOrders = async (req, res) => {
    try {
        // Get user ID from the authenticated request
        const userId = req.user.userId;

        // Fetch orders created by the logged-in user
        const orders = await Order.find({ createdBy: userId });

        // Respond with the fetched orders
        res.status(200).json({ orders });
    } catch (err) {
        console.error('Error fetching orders', err);
        res.status(500).json({ message: 'Server error' });
    }
};


const assignSupplierToOrder = async (req, res) => {
    try {
        // Extract orderId and supplierId from request body
        const { orderId } = req.params;
        const { supplierId } = req.body;

        // Validate input
        if (!orderId || !supplierId) {
            return res.status(400).json({ message: 'Order ID and Supplier ID are required' });
        }
        
        // Find the order by ID
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'pending'){
            return res.status(400).json({ message: 'Supplier can only be assigned to pending orders'});
        }
        const supplier = await Supplier.findById(supplierId);
        if (!supplier){
            return res.status(404).json({ message: 'Supplier not found'});
        }
        // Assign the supplier to the order
        order.supplier = supplierId;
        await order.save();

        // Send response
        res.status(200).json({ message: 'Successfully assigned supplier to the order'});

    } catch (err) {
        console.error('Error assigning supplier to order', err);
        res.status(500).json({ message: 'Server error' });
    }
};


const updateOrderStatus = async (req, res) => {
    try {
        // Extract supplierId from authenticated user and orderId, status from request body
        const supplierId = req.user.userId;
        const { orderId } = req.params;
        const {status} = req.body;

        // Validate input
        if (!['approved', 'rejected', 'completed'].includes(status)){
            return res.status(400).json({message: 'Status must be approved, rejected, or completed'});
        }

        // Find the order by ID
        const order = await Order.findById(orderId);
        if (!order){
            return res.status(404).json({message: 'Order not found'});
        }

        // Check if the supplier is assigned to the order
        if (!order.supplier){
            return res.status(400).json({message: 'No supplier assigned'});
        }

        const supplier = await Supplier.findById(order.supplier);
        // Check if the supplier is authorized to update this order
        if (!supplier || supplier.user.toString() !== supplierId){
            return res.status(403).json({message: 'Not authorized for this order'});
        }

        // Check if the order is already processed
        if (order.status !== 'pending'){
            return res.status(400).json({message: 'Order is already processed'});
        }

        if (status === 'approved'){
            await reservedInventoryForOrder(order._id, order.warehouse);
        }
        if (status === 'rejected'){
            // Logic for releasing inventory can be added here if needed
            await releaseInventoryForOrder(order._id, order.warehouse);
        }
        if (status === 'completed'){
            await finalizeInventoryForOrder(order._id, order.warehouse);
        }
        // Update the order status
        order.status = status;
        await order.save();

        // Send response
        res.status(200).json({
            message: `Order ${status} successfully`,
            order
        });

    } catch (err) {
        console.error('Update order status error:',err);
        res.status(500).json({ message: 'Server error' });
    }
};
// Export the controller functions
module.exports = {
    createOrder,
    getOrders,
    assignSupplierToOrder,
    updateOrderStatus
};