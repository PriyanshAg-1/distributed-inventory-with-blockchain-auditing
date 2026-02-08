const mongoose = require('mongoose');
const TransactionSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    transactionHash: {
        type: String,
        required: true,
        unique: true
    },
    action: {
        type: String,
        enum: ['approved', 'completed'],
        required: true
    },
    status: {
        type: String,
        enum: ['submitted', 'confirmed', 'failed'],
        default: 'submitted',
        required: true
    },
},
{ timestamps: true }
);
module.exports = mongoose.model("Transaction", TransactionSchema);
