const Warehouse = require('../model/warehouse.model');
const Supplier = require('../model/supplier.model');

// Create a new warehouse
const createWarehouse = async (req, res) => {
    try {
        const supplier = await Supplier.findOne({ user: req.user.userId });
        if (!supplier) {
            return res.status(403).json({ message: 'Supplier account required' });
        }
        if (req.body.supplier && req.body.supplier.toString() !== supplier._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to create warehouse for another supplier' });
        }
        const warehouse = new Warehouse({
            ...req.body,
            supplier: supplier._id
        });
        await warehouse.save();
        res.status(201).json(warehouse);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all warehouses
const getWarehouses = async (req, res) => {
    try {
        const supplier = await Supplier.findOne({ user: req.user.userId });
        if (!supplier) {
            return res.status(403).json({ message: 'Supplier account required' });
        }
        const warehouses = await Warehouse.find({ supplier: supplier._id }).populate('supplier');
        res.json(warehouses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a warehouse
const updateWarehouse = async (req, res) => {
    try {
        const supplier = await Supplier.findOne({ user: req.user.userId });
        if (!supplier) {
            return res.status(403).json({ message: 'Supplier account required' });
        }
        const updates = { ...req.body };
        delete updates.supplier;
        const warehouse = await Warehouse.findOneAndUpdate(
            { _id: req.params.warehouseId, supplier: supplier._id },
            updates,
            { new: true }
        ).populate('supplier');
        if (!warehouse) {
            const exists = await Warehouse.findById(req.params.warehouseId);
            if (!exists) {
                return res.status(404).json({ message: 'Warehouse not found' });
            }
            return res.status(403).json({ message: 'Not authorized to update this warehouse' });
        }
        res.json(warehouse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a warehouse
const deleteWarehouse = async (req, res) => {
    try {
        const supplier = await Supplier.findOne({ user: req.user.userId });
        if (!supplier) {
            return res.status(403).json({ message: 'Supplier account required' });
        }
        const warehouse = await Warehouse.findOneAndDelete(
            { _id: req.params.warehouseId, supplier: supplier._id }
        ).populate('supplier');
        if (!warehouse) {
            const exists = await Warehouse.findById(req.params.warehouseId);
            if (!exists) {
                return res.status(404).json({ message: 'Warehouse not found' });
            }
            return res.status(403).json({ message: 'Not authorized to delete this warehouse' });
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
