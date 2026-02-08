require('dotenv').config();
const { connectDB } = require('../model/database');
const Transaction = require('../model/transaction.model');
const Order = require('../model/order.model');
const { reservedInventoryForOrder, finalizeInventoryForOrder } = require('../services/inventory.services');
const { getProvider } = require('../services/blockchain.service');

const reconcileTransactions = async () => {
  const provider = getProvider();
  if (!provider) {
    throw new Error('Missing SEPOLIA_RPC_URL');
  }

  await connectDB();

  const pending = await Transaction.find({ status: 'submitted' }).sort({ createdAt: 1 });
  if (pending.length === 0) {
    return { processed: 0, confirmed: 0, failed: 0, pending: 0 };
  }

  let confirmed = 0;
  let failed = 0;
  let pendingCount = 0;

  for (const tx of pending) {
    try {
      const receipt = await provider.getTransactionReceipt(tx.transactionHash);
      if (!receipt) {
        pendingCount += 1;
        continue;
      }

      if (receipt.status !== 1) {
        tx.status = 'failed';
        await tx.save();
        failed += 1;
        continue;
      }

      const order = await Order.findById(tx.order);
      if (!order) {
        tx.status = 'failed';
        await tx.save();
        failed += 1;
        continue;
      }

      if (tx.action === 'approved') {
        if (order.status !== 'pending') {
          tx.status = 'failed';
          await tx.save();
          failed += 1;
          continue;
        }
        await reservedInventoryForOrder(order._id, order.warehouse);
        order.status = 'approved';
        await order.save();
      }

      if (tx.action === 'completed') {
        if (order.status !== 'approved') {
          tx.status = 'failed';
          await tx.save();
          failed += 1;
          continue;
        }
        await finalizeInventoryForOrder(order._id, order.warehouse);
        order.status = 'completed';
        await order.save();
      }

      tx.status = 'confirmed';
      await tx.save();
      confirmed += 1;
    } catch (err) {
      console.error(`Failed to reconcile ${tx.transactionHash}:`, err.message || err);
    }
  }

  return {
    processed: pending.length,
    confirmed,
    failed,
    pending: pendingCount
  };
};

if (require.main === module) {
  reconcileTransactions()
    .then((summary) => {
      if (summary.processed === 0) {
        console.log('No pending transactions');
      } else {
        console.log('Reconcile summary:', summary);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error(err.message || err);
      process.exit(1);
    });
}

module.exports = { reconcileTransactions };
