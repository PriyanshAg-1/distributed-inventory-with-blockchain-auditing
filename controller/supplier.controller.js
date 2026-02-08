const Supplier = require('../model/supplier.model');

// Create a new supplier
const createSupplier = async (req, res) => {
    try {
        const userId = req.user.userId;
        const supplier = new Supplier({
            ...req.body,
            user: userId
        });
        await supplier.save();
        res.status(201).json(supplier);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all suppliers
const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a supplier
const updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(req.params.supplierId, req.body, { new: true });
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.json(supplier);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a supplier
const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.supplierId);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.json(supplier);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
module.exports = {
    createSupplier,
    getSuppliers,
    updateSupplier,
    deleteSupplier
}