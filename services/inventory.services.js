const Inventory = require('../model/inventory.model');
const Supplier = require('../model/supplier.model');
const OrderItem = require('../model/orderitem.model');


const reservedInventoryForOrderItem = async (orderItemId, quantity) => {
    // Find the order item by ID
    const orderItem = await OrderItem.findById(orderItemId);

    // Check if item exist
    if (!orderItem) {
        throw new Error('Order item does not exist');
    }

    // For every item in Order
    for (const item of orderItem){
        const inventory = await Inventory.findOne({
            warehouse: warehouseId,
            product: productId
        });

    // Check if inventory exist
    if (!inventory){
        throw new Error('Inventory record not found');
    }

    // Check if inventory stock is sufficient
    if (inventory.availableQuantity < item.quantity){
        throw new Error('Insufficient Stock');
    }

    // Reserve your inventory
    inventory.availableQuantity -= item.quantity;
    inventory.reservedQuantity += item.quantity;

    // Save inventory in the database 
    await inventory.save();
    }
};

const releaseInventoryForOrderItem = async (orderId, warehouseId) => {
    const orderItem = await OrderItem.findById(orderId);  

    for (const item of orderItem){
        const inventory = await Inventory.findOne({
            warehouse: warehouseId,
            product: productId
        })
        inventory.availableQuantity += item.quantity;
        inventory.reservedQuantity -= item.quantity;
        await inventory.save();
    }
};

const finalizeInventoryForOrderItem = async (orderId, warehouseId) => {
    const orderItem = await OrderItem.findById(orderId);  

    if (!orderItem) {
        throw new Error('Order item does not exist');
    }

    for (const item of orderItem){
        const inventory = await Inventory.findOne({
            warehouse: warehouseId,
            product: productId
        })
        if (!inventory){
            throw new Error('Inventory record not found');
        }

        // Check if inventory stock is sufficient
        if (inventory.availableQuantity < item.quantity){
            throw new Error('Insufficient Stock');
        }
        inventory.reservedQuantity -= item.quantity;
        await inventory.save();
    }
};
// Exported Functions 
module.exports = {
    reservedInventoryForOrderItem,
    releaseInventoryForOrderItem,
    finalizeInventoryForOrderItem
};