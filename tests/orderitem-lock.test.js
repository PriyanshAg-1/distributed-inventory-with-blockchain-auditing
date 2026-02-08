const request = require('supertest');
const app = require('../index');

let userCounter = 1;

async function setupBase() {
  const suffix = userCounter++;
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: `Order Item User ${suffix}`,
      email: `orderitem${suffix}@test.com`,
      password: 'password123',
      walletAddress: `0xORDERITEM${suffix}`
    });

  const token = registerRes.body.token;

  const supplierRes = await request(app)
    .post('/api/suppliers')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `Order Item Supplier ${suffix}`,
      contactInfo: `orderitemsupplier${suffix}@test.com`,
      walletAddress: `0xORDERITEMSUP${suffix}`
    });

  const supplierId = supplierRes.body._id;

  const warehouseRes = await request(app)
    .post('/api/warehouses')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `Order Item Warehouse ${suffix}`,
      location: 'Test Location',
      supplier: supplierId
    });

  const warehouseId = warehouseRes.body._id;

  const productRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `Order Item Product ${suffix}`,
      description: 'Test Description',
      category: 'Test Category'
    });

  const productId = productRes.body._id;

  return { token, supplierId, warehouseId, productId };
}

async function createOrderWithItem({ token, supplierId, warehouseId, productId }) {
  await request(app)
    .post('/api/inventory')
    .set('Authorization', `Bearer ${token}`)
    .send({
      warehouseId,
      productId,
      quantity: 50
    });

  const orderRes = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({
      orderType: 'sale',
      warehouseId
    });

  const orderId = orderRes.body.order._id;

  const itemRes = await request(app)
    .post(`/api/orders/${orderId}/items`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      productId,
      quantity: 10
    });

  const itemId = itemRes.body._id;

  await request(app)
    .patch(`/api/orders/${orderId}/assign-supplier`)
    .set('Authorization', `Bearer ${token}`)
    .send({ supplierId });

  return { orderId, itemId };
}

describe('Order item lock rules', () => {
  test('should block item changes after approval', async () => {
    const base = await setupBase();
    const { orderId, itemId } = await createOrderWithItem(base);

    const approveRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${base.token}`)
      .send({ status: 'approved' });

    expect(approveRes.statusCode).toBe(200);

    const addRes = await request(app)
      .post(`/api/orders/${orderId}/items`)
      .set('Authorization', `Bearer ${base.token}`)
      .send({
        productId: base.productId,
        quantity: 5
      });

    expect(addRes.statusCode).toBe(400);

    const updateRes = await request(app)
      .put(`/api/orders/${orderId}/items/${itemId}`)
      .set('Authorization', `Bearer ${base.token}`)
      .send({ quantity: 15 });

    expect(updateRes.statusCode).toBe(400);

    const deleteRes = await request(app)
      .delete(`/api/orders/${orderId}/items/${itemId}`)
      .set('Authorization', `Bearer ${base.token}`);

    expect(deleteRes.statusCode).toBe(400);
  });
});

describe('Order lifecycle invalid transitions', () => {
  test('should reject pending -> completed', async () => {
    const base = await setupBase();

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${base.token}`)
      .send({
        orderType: 'sale',
        warehouseId: base.warehouseId
      });

    const orderId = orderRes.body.order._id;

    await request(app)
      .patch(`/api/orders/${orderId}/assign-supplier`)
      .set('Authorization', `Bearer ${base.token}`)
      .send({ supplierId: base.supplierId });

    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${base.token}`)
      .send({ status: 'completed' });

    expect(res.statusCode).toBe(400);
  });

  test('should reject approved -> rejected', async () => {
    const base = await setupBase();
    const { orderId } = await createOrderWithItem(base);

    const approveRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${base.token}`)
      .send({ status: 'approved' });

    expect(approveRes.statusCode).toBe(200);

    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${base.token}`)
      .send({ status: 'rejected' });

    expect(res.statusCode).toBe(400);
  });
});
