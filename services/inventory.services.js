const Inventory = require('../model/inventory.model');
const OrderItem = require('../model/orderitem.model');

// Reserve inventory for all items in an order
const reservedInventoryForOrder = async (orderId, warehouseId) => {
    // Find all order items for this order
    const orderItems = await OrderItem.find({ order: orderId });

    if (!orderItems || orderItems.length === 0) {
        throw new Error('No order items found for this order');
    }

    // Process each order item
    for (const orderItem of orderItems) {
        const inventory = await Inventory.findOne({
            warehouse: warehouseId,
            product: orderItem.product
        });

        if (!inventory) {
            throw new Error(`Inventory record not found for product ${orderItem.product}`);
        }

        // Check if inventory stock is sufficient
        if (inventory.availableQuantity < orderItem.quantity) {
            throw new Error(`Insufficient stock for product ${orderItem.product}`);
        }

        // Reserve the inventory
        inventory.availableQuantity -= orderItem.quantity;
        inventory.reservedQuantity += orderItem.quantity;

        // Save inventory in the database
        await inventory.save();
    }
};

// Release reserved inventory for all items in an order (when order is rejected)
const releaseInventoryForOrder = async (orderId, warehouseId) => {
    // Find all order items for this order
    const orderItems = await OrderItem.find({ order: orderId });

    if (!orderItems || orderItems.length === 0) {
        throw new Error('No order items found for this order');
    }

    // Process each order item
    for (const orderItem of orderItems) {
        const inventory = await Inventory.findOne({
            warehouse: warehouseId,
            product: orderItem.product
        });

        if (!inventory) {
            throw new Error(`Inventory record not found for product ${orderItem.product}`);
        }

        // Release the reserved inventory
        inventory.availableQuantity += orderItem.quantity;
        inventory.reservedQuantity -= orderItem.quantity;

        // Ensure reserved quantity doesn't go negative
        if (inventory.reservedQuantity < 0) {
            inventory.reservedQuantity = 0;
        }

        await inventory.save();
    }
};

// Finalize inventory for all items in an order (when order is completed)
const finalizeInventoryForOrder = async (orderId, warehouseId) => {
    // Find all order items for this order
    const orderItems = await OrderItem.find({ order: orderId });

    if (!orderItems || orderItems.length === 0) {
        throw new Error('No order items found for this order');
    }

    // Process each order item
    for (const orderItem of orderItems) {
        const inventory = await Inventory.findOne({
            warehouse: warehouseId,
            product: orderItem.product
        });

        if (!inventory) {
            throw new Error(`Inventory record not found for product ${orderItem.product}`);
        }

        // Remove from reserved (item is now sold/delivered)
        inventory.reservedQuantity -= orderItem.quantity;

        // Ensure reserved quantity doesn't go negative
        if (inventory.reservedQuantity < 0) {
            inventory.reservedQuantity = 0;
        }

        await inventory.save();
    }
};
// Exported Functions
module.exports = {
    reservedInventoryForOrder,
    releaseInventoryForOrder,
    finalizeInventoryForOrder
};