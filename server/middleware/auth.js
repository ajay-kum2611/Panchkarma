const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Practitioner = require('../models/Practitioner');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and is active
    let user = await Patient.findById(decoded.id);
    let userType = 'patient';
    
    if (!user) {
      user = await Practitioner.findById(decoded.id);
      userType = 'practitioner';
    }
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    req.userType = userType;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Check if user is practitioner
const requirePractitioner = (req, res, next) => {
  if (req.userType !== 'practitioner') {
    return res.status(403).json({ message: 'Access denied. Practitioner role required.' });
  }
  next();
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.userType !== 'practitioner' || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// Check if user is patient
const requirePatient = (req, res, next) => {
  if (req.userType !== 'patient') {
    return res.status(403).json({ message: 'Access denied. Patient role required.' });
  }
  next();
};

module.exports = {
  verifyToken,
  requirePractitioner,
  requireAdmin,
  requirePatient
};
