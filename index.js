require('dotenv').config();
const express =  require('express');

const authRoutes = require('./routes/auth.routes');
const protectedRoutes = require('./routes/protected.routes');
const { connectDB } = require('./model/database');

const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
const PORT = process.env.PORT || 5000;

console.log(process.env.MONGO_URI);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to the database', err);
});

