require('dotenv').config();
const { submitTransaction } = require('../services/blockchain.service');

const run = async () => {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.SEPOLIA_PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    console.error('Missing SEPOLIA_RPC_URL or SEPOLIA_PRIVATE_KEY in .env');
    process.exit(1);
  }

  const payload = {
    type: 'integration-test',
    timestamp: new Date().toISOString()
  };

  try {
    const result = await submitTransaction({ transactionHash: '', payload });
    if (result.source !== 'sepolia') {
      console.error('Did not submit to Sepolia. Source:', result.source);
      process.exit(1);
    }
    console.log('Transaction hash:', result.transactionHash);
    console.log('Explorer:', `https://sepolia.etherscan.io/tx/${result.transactionHash}`);
  } catch (err) {
    console.error('Transaction failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
};

run();
