const { ethers } = require('ethers');
const crypto = require('crypto');

const generateStubHash = () => `0x${crypto.randomBytes(32).toString('hex')}`;

const getProvider = () => {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || '';
  if (!rpcUrl) {
    return null;
  }
  return new ethers.JsonRpcProvider(rpcUrl);
};

const getWallet = () => {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || '';
  const privateKey = process.env.SEPOLIA_PRIVATE_KEY || '';
  if (!rpcUrl || !privateKey) {
    return null;
  }
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return new ethers.Wallet(privateKey, provider);
};

const submitTransaction = async ({ transactionHash, payload }) => {
  if (transactionHash) {
    return { transactionHash, source: 'client' };
  }

  const wallet = getWallet();
  if (!wallet) {
    return { transactionHash: generateStubHash(payload), source: 'stub' };
  }

  const payloadHash = ethers.keccak256(
    ethers.toUtf8Bytes(JSON.stringify(payload || {}))
  );

  const tx = await wallet.sendTransaction({
    to: wallet.address,
    value: 0n,
    data: payloadHash
  });

  return { transactionHash: tx.hash, source: 'sepolia' };
};

module.exports = {
  submitTransaction,
  getProvider
};
