const express = require('express');
const router = express.Router();
const {
        register,
        login,
        me,
        verifyEmail,
        forgotPassword,
        resetPassword,
        resendVerification,
        updateProfile,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../config/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/resend-verification', resendVerification);
router.post('/verify-email', verifyEmail);
router.get('/me', authenticate, me);
router.patch('/profile', authenticate, updateProfile);

module.exports = router;