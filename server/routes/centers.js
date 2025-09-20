const express = require('express');
const { body, validationResult } = require('express-validator');
const Center = require('../models/Center');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/centers
// @desc    Get all centers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, state, therapy } = req.query;
    
    let query = { isActive: true };
    
    if (city) {
      query.city = new RegExp(city, 'i');
    }
    
    if (state) {
      query.state = new RegExp(state, 'i');
    }
    
    if (therapy) {
      query.therapies = new RegExp(therapy, 'i');
    }

    const centers = await Center.find(query)
      .select('-availableSlots') // Exclude detailed slot information for list view
      .sort({ name: 1 });

    res.json({
      success: true,
      centers
    });
  } catch (error) {
    console.error('Get centers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/centers/:id
// @desc    Get center by ID with available slots
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const center = await Center.findById(req.params.id);
    
    if (!center || !center.isActive) {
      return res.status(404).json({ message: 'Center not found' });
    }

    // Filter available slots for the next 30 days
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    const availableSlots = center.availableSlots.filter(slot => {
      const slotDate = new Date(slot.date);
      return slotDate >= now && slotDate <= thirtyDaysFromNow;
    });

    res.json({
      success: true,
      center: {
        ...center.toObject(),
        availableSlots
      }
    });
  } catch (error) {
    console.error('Get center error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/centers/nearby
// @desc    Get centers near a location
// @access  Public
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const centers = await Center.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    })
    .select('-availableSlots')
    .limit(10);

    res.json({
      success: true,
      centers
    });
  } catch (error) {
    console.error('Get nearby centers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/centers
// @desc    Create a new center (Admin only)
// @access  Private (Admin)
router.post('/', verifyToken, [
  body('name').trim().isLength({ min: 2 }).withMessage('Center name is required'),
  body('address').trim().isLength({ min: 10 }).withMessage('Address is required'),
  body('city').trim().isLength({ min: 2 }).withMessage('City is required'),
  body('state').trim().isLength({ min: 2 }).withMessage('State is required'),
  body('pincode').matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
  body('phone').matches(/^\+?[\d\s-()]+$/).withMessage('Valid phone number is required'),
  body('coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [lng, lat] array'),
  body('therapies').isArray().withMessage('Therapies must be an array')
], async (req, res) => {
  try {
    // Check if user is admin (this would need to be implemented in auth middleware)
    if (req.userType !== 'practitioner' || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      coordinates,
      therapies,
      facilities
    } = req.body;

    const center = new Center({
      name,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      location: {
        type: 'Point',
        coordinates: [coordinates[0], coordinates[1]]
      },
      therapies: therapies || [],
      facilities: facilities || []
    });

    await center.save();

    res.status(201).json({
      success: true,
      message: 'Center created successfully',
      center
    });
  } catch (error) {
    console.error('Create center error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/centers/:id
// @desc    Update center
// @access  Private (Admin)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.userType !== 'practitioner' || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const center = await Center.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }

    res.json({
      success: true,
      message: 'Center updated successfully',
      center
    });
  } catch (error) {
    console.error('Update center error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
