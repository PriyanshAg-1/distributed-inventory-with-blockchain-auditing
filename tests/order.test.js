const request = require('supertest');
const app = require('../index');

describe('Order API', () => {

  test('should reject creating order without token', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ orderType: 'purchase' });

    expect(res.statusCode).toBe(401);
  });

});
