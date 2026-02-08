const request = require('supertest');
const app = require('../index');

let userCounter = 1;

async function setupBase() {
  const suffix = userCounter++;
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: `Inventory Test User ${suffix}`,
      email: `inventory${suffix}@test.com`,
      password: 'password123',
      walletAddress: `0xINVENTORY${suffix}`
    });

  const token = registerRes.body.token;

  const supplierRes = await request(app)
    .post('/api/suppliers')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `Test Supplier ${suffix}`,
      contactInfo: `supplier${suffix}@test.com`,
      walletAddress: `0xSUPPLIER${suffix}`
    });

  const supplierId = supplierRes.body._id;

  const warehouseRes = await request(app)
    .post('/api/warehouses')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `Test Warehouse ${suffix}`,
      location: 'Test Location',
      supplier: supplierId
    });

  const warehouseId = warehouseRes.body._id;

  const productRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `Test Product ${suffix}`,
      description: 'Test Description',
      category: 'Test Category'
    });

  const productId = productRes.body._id;

  return { token, supplierId, warehouseId, productId };
}

describe('Inventory Management API', () => {
  test('should add inventory to warehouse', async () => {
    const { token, warehouseId, productId } = await setupBase();

    const res = await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${token}`)
      .send({
        warehouseId,
        productId,
        quantity: 100
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.inventory.availableQuantity).toBe(100);
    expect(res.body.inventory.reservedQuantity).toBe(0);
  });

  test('should get warehouse inventory', async () => {
    const { token, warehouseId, productId } = await setupBase();

    await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${token}`)
      .send({
        warehouseId,
        productId,
        quantity: 100
      });

    const res = await request(app)
      .get(`/api/inventory/warehouse/${warehouseId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.inventory)).toBe(true);
    expect(res.body.inventory.length).toBeGreaterThan(0);
    expect(res.body.inventory[0].availableQuantity).toBe(100);
  });

  test('should get product inventory across warehouses', async () => {
    const { token, warehouseId, productId } = await setupBase();

    await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${token}`)
      .send({
        warehouseId,
        productId,
        quantity: 100
      });

    const res = await request(app)
      .get(`/api/inventory/product/${productId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.inventory)).toBe(true);
    expect(res.body.inventory[0].availableQuantity).toBe(100);
  });

  test('should update existing inventory when adding more', async () => {
    const { token, warehouseId, productId } = await setupBase();

    await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${token}`)
      .send({
        warehouseId,
        productId,
        quantity: 100
      });

    const res = await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${token}`)
      .send({
        warehouseId,
        productId,
        quantity: 50
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.inventory.availableQuantity).toBe(150);
  });

  test('should remove inventory', async () => {
    const { token, warehouseId, productId } = await setupBase();

    await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${token}`)
      .send({
        warehouseId,
        productId,
        quantity: 100
      });

    const res = await request(app)
      .delete('/api/inventory')
      .set('Authorization', `Bearer ${token}`)
      .send({
        warehouseId,
        productId,
        quantity: 25
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.inventory.availableQuantity).toBe(75);
  });

  test('should reserve inventory when order is approved', async () => {
    const { token, supplierId, warehouseId, productId } = await setupBase();

    await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${token}`)
      .send({
        warehouseId,
        productId,
        quantity: 125
      });

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderType: 'sale',
        warehouseId
      });

    expect(orderRes.statusCode).toBe(201);
    const orderId = orderRes.body.order._id;

    const itemRes = await request(app)
      .post(`/api/orders/${orderId}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId,
        quantity: 10
      });

    expect(itemRes.statusCode).toBe(201);

    const assignRes = await request(app)
      .patch(`/api/orders/${orderId}/assign-supplier`)
      .set('Authorization', `Bearer ${token}`)
      .send({ supplierId });

    expect(assignRes.statusCode).toBe(200);

    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'approved' });

    expect(res.statusCode).toBe(200);

    const inventoryRes = await request(app)
      .get(`/api/inventory/warehouse/${warehouseId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(inventoryRes.body.inventory[0].availableQuantity).toBe(115);
    expect(inventoryRes.body.inventory[0].reservedQuantity).toBe(10);
  });

  test('should allow completion after approval', async () => {
    const { token, supplierId, warehouseId, productId } = await setupBase();

    await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${token}`)
      .send({
        warehouseId,
        productId,
        quantity: 125
      });

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderType: 'sale',
        warehouseId
      });

    const orderId = orderRes.body.order._id;

    await request(app)
      .post(`/api/orders/${orderId}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId,
        quantity: 10
      });

    await request(app)
      .patch(`/api/orders/${orderId}/assign-supplier`)
      .set('Authorization', `Bearer ${token}`)
      .send({ supplierId });

    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'approved' });

    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });

    expect(res.statusCode).toBe(200);

    const inventoryRes = await request(app)
      .get(`/api/inventory/warehouse/${warehouseId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(inventoryRes.body.inventory[0].availableQuantity).toBe(115);
    expect(inventoryRes.body.inventory[0].reservedQuantity).toBe(0);
  });
});
