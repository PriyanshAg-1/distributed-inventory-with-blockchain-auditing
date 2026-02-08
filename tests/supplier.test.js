const request = require('supertest');
const app = require('../index');
const Supplier = require('../model/supplier.model');
const User = require('../model/user.model');

describe('Supplier API', () => {
  let userId;
  let token;

  beforeAll(async () => {
    // Register and login for this test suite
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Supplier Test User',
        email: 'suppliertest@test.com',
        password: 'password123'
      });

    userId = registerRes.body.user.id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'suppliertest@test.com',
        password: 'password123'
      });

    token = loginRes.body.token;
    expect(token).toBeDefined();
  });

  it('should create a new supplier', async () => {
    const testSupplier = {
      name: 'Test Supplier',
      contactInfo: 'test@supplier.com',
      walletAddress: '0xSUPPLIER123'
    };

    // Create supplier with user reference
    const supplierData = {
      ...testSupplier,
      user: userId
    };

    const res = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${token}`)
      .send(supplierData);

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe(testSupplier.name);
    expect(res.body.contactInfo).toBe(testSupplier.contactInfo);
    expect(res.body.walletAddress).toBe(testSupplier.walletAddress);
    expect(res.body.user).toBe(userId);
    expect(res.body._id).toBeDefined();
  });

  it('should get all suppliers', async () => {
    // First create a supplier to ensure there's data
    const testSupplier = {
      name: 'Test Supplier for Get',
      contactInfo: 'get@supplier.com',
      walletAddress: '0xSUPPLIERGET123',
      user: userId
    };

    await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${token}`)
      .send(testSupplier);

    const res = await request(app)
      .get('/api/suppliers')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should update a supplier', async () => {
    // First create a supplier
    const testSupplier = {
      name: 'Test Supplier for Update',
      contactInfo: 'update@supplier.com',
      walletAddress: '0xSUPPLIERUPDATE123',
      user: userId
    };

    const createRes = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${token}`)
      .send(testSupplier);

    expect(createRes.statusCode).toBe(201);
    const supplierId = createRes.body._id;

    // Now update the supplier
    const updatedSupplier = {
      name: 'Updated Supplier',
      contactInfo: 'updated@supplier.com',
      walletAddress: '0xUPDATEDSUPPLIER'
    };

    const res = await request(app)
      .put(`/api/suppliers/${supplierId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedSupplier);

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(updatedSupplier.name);
    expect(res.body.contactInfo).toBe(updatedSupplier.contactInfo);
    expect(res.body.walletAddress).toBe(updatedSupplier.walletAddress);
  });

  it('should delete a supplier', async () => {
    // First create a supplier
    const testSupplier = {
      name: 'Test Supplier for Delete',
      contactInfo: 'delete@supplier.com',
      walletAddress: '0xSUPPLIERDELETE123',
      user: userId
    };

    const createRes = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${token}`)
      .send(testSupplier);

    expect(createRes.statusCode).toBe(201);
    const supplierId = createRes.body._id;

    // Now delete the supplier
    const res = await request(app)
      .delete(`/api/suppliers/${supplierId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(testSupplier.name);
  });
});
