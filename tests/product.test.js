const request = require('supertest');
const app = require('../index');
const Product = require('../model/product.model');

describe('Product API', () => {
  let token;

  beforeAll(async () => {
    // Register and login for this test suite
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Product Test User',
        email: 'producttest@test.com',
        password: 'password123'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'producttest@test.com',
        password: 'password123'
      });

    token = loginRes.body.token;
    expect(token).toBeDefined();
  });

  it('should create a new product', async () => {
    const testProduct = {
      name: 'Test Product',
      description: 'A test product for testing',
      category: 'Electronics'
    };

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(testProduct);

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe(testProduct.name);
    expect(res.body.description).toBe(testProduct.description);
    expect(res.body.category).toBe(testProduct.category);
    expect(res.body._id).toBeDefined();
  });

  it('should get a product by ID', async () => {
    // First create a product
    const testProduct = {
      name: 'Test Product for Get',
      description: 'A test product for get testing',
      category: 'Electronics'
    };

    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(testProduct);

    expect(createRes.statusCode).toBe(201);
    const productId = createRes.body._id;

    // Now get the product
    const res = await request(app)
      .get(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(testProduct.name);
    expect(res.body.description).toBe(testProduct.description);
  });

  it('should update a product', async () => {
    // First create a product
    const testProduct = {
      name: 'Test Product for Update',
      description: 'A test product for update testing',
      category: 'Electronics'
    };

    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(testProduct);

    expect(createRes.statusCode).toBe(201);
    const productId = createRes.body._id;

    // Now update the product
    const updatedProduct = {
      name: 'Updated Product',
      description: 'Updated description',
      category: 'Updated Category'
    };

    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedProduct);

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(updatedProduct.name);
    expect(res.body.description).toBe(updatedProduct.description);
    expect(res.body.category).toBe(updatedProduct.category);
  });

  it('should delete a product', async () => {
    // First create a product
    const testProduct = {
      name: 'Test Product for Delete',
      description: 'A test product for delete testing',
      category: 'Electronics'
    };

    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(testProduct);

    expect(createRes.statusCode).toBe(201);
    const productId = createRes.body._id;

    // Now delete the product
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(testProduct.name);
  });

  it('should return 404 for non-existent product', async () => {
    const res = await request(app)
      .get('/api/products/507f1f77bcf86cd799439011') // Random ObjectId
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Product not found');
  });
});
