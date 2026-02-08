const request = require('supertest');
const app = require('../index');

describe('Warehouse API', () => {
  let userId;
  let token;

  beforeAll(async () => {
    // Register and login for this test suite
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Warehouse Test User',
        email: 'warehousetest@test.com',
        password: 'password123'
      });

    userId = registerRes.body.user.id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'warehousetest@test.com',
        password: 'password123'
      });

    token = loginRes.body.token;
    expect(token).toBeDefined();
  });

  it('should create a new warehouse', async () => {
    // Create a supplier first for this test
    const supplierData = {
      name: 'Warehouse Test Supplier',
      contactInfo: 'warehouse@supplier.com',
      walletAddress: '0xWAREHOUSESUPPLIER',
      user: userId
    };

    const supplierRes = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${token}`)
      .send(supplierData);

    expect(supplierRes.statusCode).toBe(201);
    const supplierId = supplierRes.body._id;

    const testWarehouse = {
      location: 'New York, NY',
      name: 'Main Warehouse'
    };

    // Create warehouse with supplier reference
    const warehouseData = {
      ...testWarehouse,
      supplier: supplierId
    };

    const res = await request(app)
      .post('/api/warehouses')
      .set('Authorization', `Bearer ${token}`)
      .send(warehouseData);

    expect(res.statusCode).toBe(201);
    expect(res.body.location).toBe(testWarehouse.location);
    expect(res.body.name).toBe(testWarehouse.name);
    expect(res.body.supplier).toBe(supplierId);
    expect(res.body._id).toBeDefined();
  });

  it('should get all warehouses', async () => {
    // Create a supplier first
    const supplierData = {
      name: 'Warehouse Test Supplier',
      contactInfo: 'warehouse@supplier.com',
      walletAddress: '0xWAREHOUSESUPPLIER',
      user: userId
    };

    const supplierRes = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${token}`)
      .send(supplierData);

    expect(supplierRes.statusCode).toBe(201);
    const supplierId = supplierRes.body._id;

    // First create a warehouse to ensure there's data
    const testWarehouse = {
      location: 'Los Angeles, CA',
      name: 'Secondary Warehouse',
      supplier: supplierId
    };

    const createRes = await request(app)
      .post('/api/warehouses')
      .set('Authorization', `Bearer ${token}`)
      .send(testWarehouse);

    expect(createRes.statusCode).toBe(201);

    const res = await request(app)
      .get('/api/warehouses')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    // Check if supplier is populated - find the warehouse we just created
    const warehouse = res.body.find(w => w._id === createRes.body._id);
    expect(warehouse).toBeDefined();
    expect(warehouse.supplier).toBeDefined();
    expect(warehouse.supplier).toHaveProperty('name', 'Warehouse Test Supplier');
  });

  it('should update a warehouse', async () => {
    // Create a supplier first
    const supplierData = {
      name: 'Warehouse Test Supplier',
      contactInfo: 'warehouse@supplier.com',
      walletAddress: '0xWAREHOUSESUPPLIER',
      user: userId
    };

    const supplierRes = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${token}`)
      .send(supplierData);

    expect(supplierRes.statusCode).toBe(201);
    const supplierId = supplierRes.body._id;

    // First create a warehouse
    const testWarehouse = {
      location: 'Chicago, IL',
      name: 'Test Warehouse for Update',
      supplier: supplierId
    };

    const createRes = await request(app)
      .post('/api/warehouses')
      .set('Authorization', `Bearer ${token}`)
      .send(testWarehouse);

    expect(createRes.statusCode).toBe(201);
    const warehouseId = createRes.body._id;

    // Now update the warehouse
    const updatedWarehouse = {
      location: 'Updated Location, CA',
      name: 'Updated Warehouse'
    };

    const res = await request(app)
      .put(`/api/warehouses/${warehouseId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedWarehouse);

    expect(res.statusCode).toBe(200);
    expect(res.body.location).toBe(updatedWarehouse.location);
    expect(res.body.name).toBe(updatedWarehouse.name);
  });

  it('should delete a warehouse', async () => {
    // Create a supplier first
    const supplierData = {
      name: 'Warehouse Test Supplier',
      contactInfo: 'warehouse@supplier.com',
      walletAddress: '0xWAREHOUSESUPPLIER',
      user: userId
    };

    const supplierRes = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${token}`)
      .send(supplierData);

    expect(supplierRes.statusCode).toBe(201);
    const supplierId = supplierRes.body._id;

    // First create a warehouse
    const testWarehouse = {
      location: 'Miami, FL',
      name: 'Test Warehouse for Delete',
      supplier: supplierId
    };

    const createRes = await request(app)
      .post('/api/warehouses')
      .set('Authorization', `Bearer ${token}`)
      .send(testWarehouse);

    expect(createRes.statusCode).toBe(201);
    const warehouseId = createRes.body._id;

    // Now delete the warehouse
    const res = await request(app)
      .delete(`/api/warehouses/${warehouseId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(testWarehouse.name);
  });
});
