require('dotenv').config();

const { connectDB } = require('./model/database');

console.log(process.env.MONGO_URI);
connectDB();