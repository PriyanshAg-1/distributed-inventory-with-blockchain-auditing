const Inventory = require('../model/inventory.model');
const Warehouse = require('../model/warehouse.model');
const Product = require('../model/product.model');
const mongoose = require('mongoose');

// Add or update inventory for a product in a warehouse
const addInventory = async (req, res) => {
    console.log('addInventory called with:', req.body);
    try {
        const { warehouseId, productId, quantity } = req.body;

        // Validate inputs
        if (!warehouseId || !productId || quantity === undefined) {
            return res.status(400).json({ message: 'Warehouse ID, Product ID, and quantity are required' });
        }

        if (quantity < 0) {
            return res.status(400).json({ message: 'Quantity cannot be negative' });
        }

        // Check if warehouse exists
        console.log('Looking for warehouse:', warehouseId);
        console.log('Mongoose connection state:', mongoose.connection.readyState);
        const warehouse = await Warehouse.findById(warehouseId);
        console.log('Warehouse query result:', warehouse);
        console.log('Warehouse found:', !!warehouse);
        if (!warehouse) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        console.log('Product found:', !!product);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find or create inventory record
        let inventory = await Inventory.findOne({ warehouse: warehouseId, product: productId });

        if (inventory) {
            // Update existing inventory
            inventory.availableQuantity += quantity;
        } else {
            // Create new inventory record
            inventory = new Inventory({
                warehouse: warehouseId,
                product: productId,
                availableQuantity: quantity,
                reservedQuantity: 0
            });
        }

        await inventory.save();
        console.log('Inventory saved successfully');
        res.status(200).json({
            message: 'Inventory updated successfully',
            inventory
        });

    } catch (err) {
        console.error('Error adding inventory:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get inventory for a specific warehouse
const getWarehouseInventory = async (req, res) => {
    try {
        const { warehouseId } = req.params;

        // Check if warehouse exists
        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }

        // Get all inventory for this warehouse
        const inventory = await Inventory.find({ warehouse: warehouseId })
            .populate('product', 'name description')
            .populate('warehouse', 'name location');

        res.status(200).json({ inventory });

    } catch (err) {
        console.error('Error fetching warehouse inventory:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get inventory for a specific product across all warehouses
const getProductInventory = async (req, res) => {
    try {
        const { productId } = req.params;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Get all inventory for this product
        const inventory = await Inventory.find({ product: productId })
            .populate('product', 'name description')
            .populate('warehouse', 'name location');

        res.status(200).json({ inventory });

    } catch (err) {
        console.error('Error fetching product inventory:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Remove inventory (reduce stock)
const removeInventory = async (req, res) => {
    try {
        const { warehouseId, productId, quantity } = req.body;

        // Validate inputs
        if (!warehouseId || !productId || quantity === undefined) {
            return res.status(400).json({ message: 'Warehouse ID, Product ID, and quantity are required' });
        }

        if (quantity < 0) {
            return res.status(400).json({ message: 'Quantity cannot be negative' });
        }

        // Find inventory record
        const inventory = await Inventory.findOne({ warehouse: warehouseId, product: productId });

        if (!inventory) {
            return res.status(404).json({ message: 'Inventory record not found' });
        }

        // Check if there's enough available quantity
        if (inventory.availableQuantity < quantity) {
            return res.status(400).json({
                message: 'Insufficient available quantity',
                available: inventory.availableQuantity,
                requested: quantity
            });
        }

        // Reduce inventory
        inventory.availableQuantity -= quantity;

        // If quantity becomes 0, we could optionally delete the record
        // For now, we'll keep it for historical purposes

        await inventory.save();
        res.status(200).json({
            message: 'Inventory reduced successfully',
            inventory
        });

    } catch (err) {
        console.error('Error removing inventory:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addInventory,
    getWarehouseInventory,
    getProductInventory,
    removeInventory
};