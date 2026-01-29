const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();    
router.get('/test', authMiddleware, (req, res) => {
    res.status(200).json({
        message: 'This is a protected route',
        user: req.user
    });
});

module.exports = router;