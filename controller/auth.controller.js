const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/user.model');

// Register a new user
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Basic validation
        if(!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Create user
        const user = await User.create({
            name,
            email,
            passwordHash
        });

        // 5. Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // 6. Send response
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login an existing user
const login = async (req, res) => {
    try {
        // 1. Extract email and password from request body
        const { email, password } = req.body;
        
        // 2. Basic validation
        if(!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // 3. Check if user exists
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        // 4. Validate password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if(!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 5. Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // 6. Send response
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Export the controller functions
module.exports = {
  register,
  login
};
