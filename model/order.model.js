const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
    orderType: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    }
});

module.exports = mongoose.model("Order", OrderSchema);