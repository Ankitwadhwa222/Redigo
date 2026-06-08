const express = require("express");
const bcrypt = require("bcrypt");
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const {signup , signin} = require("../controllers/authController");
const User = require("../models/User");

const router = express.Router();

// Stricter rate limiting for auth routes: 5 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
});

// Validation rules
const validateSignup = [
  body('name').notEmpty().withMessage('Name is required').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateSignin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post("/signup", authLimiter, validateSignup, handleValidationErrors, signup);
router.post("/signin/email", authLimiter, validateSignin, handleValidationErrors, signin);
router.post("/signin/facebook", signin);

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    path: '/'
  });
  res.json({ message: 'Logged out successfully' });
});

// Check authentication status
router.get("/me", async (req, res) => {
  let token;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        return res.json({ authenticated: true, user });
      }
    } catch (error) {
      console.error('Error verifying token in /auth/me:', error.message);
    }
  }

  res.json({ authenticated: false });
});



module.exports = router;