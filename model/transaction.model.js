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
    status: {
        type: String,
        required: true
    },
},
{ timestamps: true }
);
module.exports = mongoose.model("Transaction", TransactionSchema);