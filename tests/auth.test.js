const request = require('supertest');
const app = require('../index'); // export app (important)

describe('Auth API', () => {
  let testUser = {
    name: 'Test User',
    email: 'testuser@test.com',
    password: 'password123',
    walletAddress: '0xTEST123'
  };

  it('should register a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it('should login a user', async () => {
    // First register the user
    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    // Then try to login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
