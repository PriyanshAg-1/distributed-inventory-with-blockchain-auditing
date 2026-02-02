const mongoose = require('mongoose');

const connectDB = async (uri = process.env.MONGO_URI) => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  await mongoose.connect(uri);
};

module.exports = { connectDB };
