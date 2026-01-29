const mongoose = require('mongoose');
const InventorySchema = new mongoose.Schema({
    warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    availableQuantity: {
        type: Number,
        default: 0
    },
    reservedQuantity: {
        type: Number,
        default: 0
    }
});
InventorySchema.index(
    { warehouse: 1, product: 1 },
    { unique: true }
);
module.exports = mongoose.model("Inventory", InventorySchema);