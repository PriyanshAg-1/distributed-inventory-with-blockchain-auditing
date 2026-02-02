const Warehouse = require('../model/warehouse.model');

// Create a new warehouse
const createWarehouse = async (req, res) => {
    try {
        const warehouse = new Warehouse(req.body);
        await warehouse.save();
        res.status(201).json(warehouse);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all warehouses
const getWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse.find().populate('supplier');
        res.json(warehouses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a warehouse
const updateWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findByIdAndUpdate(req.params.warehouseId, req.body, { new: true }).populate('supplier');
        if (!warehouse) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }
        res.json(warehouse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a warehouse
const deleteWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findByIdAndDelete(req.params.warehouseId).populate('supplier');
        if (!warehouse) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }
        res.json(warehouse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
module.exports = {
    createWarehouse,
    getWarehouses,
    updateWarehouse,
    deleteWarehouse
}