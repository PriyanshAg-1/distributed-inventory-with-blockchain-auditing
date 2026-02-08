const request = require('supertest');
const app = require('../index');

let userCounter = 1;

async function setupBase() {
  const suffix = userCounter++;
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: `Tx User ${suffix}`,
      email: `txuser${suffix}@test.com`,
      password: 'password123'
    });

  const token = registerRes.body.token;

  const supplierRes = await request(app)
    .post('/api/suppliers')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `Tx Supplier ${suffix}`,
      contactInfo: `txsupplier${suffix}@test.com`,
      walletAddress: `0xTXSUP${suffix}`
    });

  const supplierId = supplierRes.body._id;

  const warehouseRes = await request(app)
    .post('/api/warehouses')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `Tx Warehouse ${suffix}`,
      location: 'Test Location',
      supplier: supplierId
    });

  const warehouseId = warehouseRes.body._id;

  const orderRes = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({
      orderType: 'sale',
      warehouseId
    });

  const orderId = orderRes.body.order._id;

  return { token, orderId };
}

describe('Transaction API', () => {
  test('should create a transaction for an order', async () => {
    const { token, orderId } = await setupBase();

    const res = await request(app)
      .post(`/api/orders/${orderId}/transactions`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        transactionHash: '0xTXHASH1',
        status: 'submitted',
        action: 'approved'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.transactionHash).toBe('0xTXHASH1');
    expect(res.body.order).toBe(orderId);
  });

  test('should list transactions for an order', async () => {
    const { token, orderId } = await setupBase();

    await request(app)
      .post(`/api/orders/${orderId}/transactions`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        transactionHash: '0xTXHASH2',
        status: 'submitted',
        action: 'approved'
      });

    await request(app)
      .post(`/api/orders/${orderId}/transactions`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        transactionHash: '0xTXHASH3',
        status: 'confirmed',
        action: 'completed'
      });

    const res = await request(app)
      .get(`/api/orders/${orderId}/transactions`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.transactions)).toBe(true);
    expect(res.body.transactions.length).toBe(2);
  });

  test('should reject duplicate transaction hash', async () => {
    const { token, orderId } = await setupBase();

    await request(app)
      .post(`/api/orders/${orderId}/transactions`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        transactionHash: '0xDUPHASH',
        status: 'submitted',
        action: 'approved'
      });

    const res = await request(app)
      .post(`/api/orders/${orderId}/transactions`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        transactionHash: '0xDUPHASH',
        status: 'submitted',
        action: 'approved'
      });

    expect(res.statusCode).toBe(409);
  });
});
