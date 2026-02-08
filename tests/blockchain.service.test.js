jest.mock('ethers', () => {
  const sendTransaction = jest.fn().mockResolvedValue({ hash: '0xtesthash' });
  const mockWallet = { address: '0xMockWallet', sendTransaction };

  const Wallet = jest.fn(() => mockWallet);
  const JsonRpcProvider = jest.fn(() => ({}));
  const keccak256 = jest.fn(() => '0xpayloadhash');
  const toUtf8Bytes = jest.fn(() => new Uint8Array([1, 2, 3]));

  return {
    ethers: {
      Wallet,
      JsonRpcProvider,
      keccak256,
      toUtf8Bytes
    }
  };
});

const { submitTransaction } = require('../services/blockchain.service');

describe('blockchain.service', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  test('returns client hash when provided', async () => {
    const res = await submitTransaction({
      transactionHash: '0xclienthash',
      payload: { orderId: '1' }
    });

    expect(res).toEqual({ transactionHash: '0xclienthash', source: 'client' });
  });

  test('returns stub hash when no env configured', async () => {
    delete process.env.SEPOLIA_RPC_URL;
    delete process.env.SEPOLIA_PRIVATE_KEY;

    const res = await submitTransaction({
      transactionHash: '',
      payload: { orderId: '2' }
    });

    expect(res.source).toBe('stub');
    expect(res.transactionHash).toMatch(/^0x[0-9a-f]{64}$/);
  });

  test('submits sepolia transaction when env configured', async () => {
    process.env.SEPOLIA_RPC_URL = 'https://sepolia.example';
    process.env.SEPOLIA_PRIVATE_KEY = '0xprivatekey';

    const res = await submitTransaction({
      transactionHash: '',
      payload: { orderId: '3', status: 'submitted' }
    });

    const { ethers } = require('ethers');
    const wallet = ethers.Wallet.mock.results[0].value;

    expect(ethers.JsonRpcProvider).toHaveBeenCalledWith('https://sepolia.example');
    expect(ethers.Wallet).toHaveBeenCalledWith('0xprivatekey', expect.anything());
    expect(wallet.sendTransaction).toHaveBeenCalledWith({
      to: wallet.address,
      value: 0n,
      data: '0xpayloadhash'
    });
    expect(res).toEqual({ transactionHash: '0xtesthash', source: 'sepolia' });
  });
});
