const mongoose = require('mongoose');
const User = require('../model/user.model');

describe('Database connection', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should connect and fetch users', async () => {
    const users = await User.find();
    expect(users).toBeDefined();
  });
});
