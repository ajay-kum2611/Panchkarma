const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const Practitioner = require('../models/Practitioner');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/signup
// @desc    Register a new patient
// @access  Public
router.post('/signup', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').matches(/^\+?[\d\s-()]+$/).withMessage('Please enter a valid phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('userType').isIn(['patient', 'practitioner']).withMessage('User type must be patient or practitioner')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, password, userType, specialization, centerId } = req.body;

    // Check if user already exists
    const existingUser = await Patient.findOne({ email }) || await Practitioner.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    let user;
    if (userType === 'patient') {
      user = new Patient({ name, email, phone, password });
    } else {
      if (!specialization || !centerId) {
        return res.status(400).json({ message: 'Specialization and center ID are required for practitioners' });
      }
      user = new Practitioner({ name, email, phone, password, specialization, centerId });
    }

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required'),
  body('userType').isIn(['patient', 'practitioner']).withMessage('User type must be patient or practitioner')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, userType } = req.body;

    // Find user based on type
    let user;
    if (userType === 'patient') {
      user = await Patient.findOne({ email, isActive: true });
    } else {
      user = await Practitioner.findOne({ email, isActive: true });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType,
        ...(userType === 'practitioner' && { specialization: user.specialization, role: user.role })
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', verifyToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        userType: req.userType,
        ...(req.userType === 'practitioner' && { 
          specialization: req.user.specialization, 
          role: req.user.role,
          centerId: req.user.centerId
        }),
        ...(req.userType === 'patient' && {
          age: req.user.age,
          gender: req.user.gender,
          location: req.user.location,
          assignedTherapy: req.user.assignedTherapy
        })
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
