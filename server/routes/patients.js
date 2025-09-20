const express = require('express');
const { body, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const Booking = require('../models/Booking');
const Feedback = require('../models/Feedback');
const { verifyToken, requirePatient } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/patients/form
// @desc    Submit health intake form
// @access  Private (Patient)
router.post('/form', verifyToken, requirePatient, [
  body('age').isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('location').trim().isLength({ min: 2 }).withMessage('Location is required'),
  body('problems').isArray().withMessage('Problems must be an array'),
  body('diseases').isArray().withMessage('Diseases must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { age, gender, location, problems, diseases } = req.body;

    // Update patient with health information
    const patient = await Patient.findByIdAndUpdate(
      req.user._id,
      { age, gender, location, problems, diseases },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Health intake form submitted successfully',
      patient
    });
  } catch (error) {
    console.error('Health form error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patients/dashboard/:id
// @desc    Get patient dashboard data
// @access  Private (Patient)
router.get('/dashboard/:id', verifyToken, requirePatient, async (req, res) => {
  try {
    const patientId = req.params.id;

    // Verify patient can only access their own dashboard
    if (req.user._id.toString() !== patientId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get patient with populated bookings
    const patient = await Patient.findById(patientId)
      .populate({
        path: 'bookings',
        populate: [
          { path: 'practitionerId', select: 'name specialization' },
          { path: 'centerId', select: 'name address' },
          { path: 'feedbackId' }
        ]
      });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get upcoming and past sessions
    const now = new Date();
    const upcomingSessions = patient.bookings.filter(booking => 
      booking.sessionDate > now && booking.status !== 'cancelled'
    );
    const pastSessions = patient.bookings.filter(booking => 
      booking.sessionDate <= now || booking.status === 'completed'
    );

    // Calculate progress
    const totalSessions = patient.bookings.length;
    const completedSessions = patient.bookings.filter(booking => 
      booking.status === 'completed'
    ).length;
    const progressPercentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Get feedback data for charts
    const feedbackData = await Feedback.find({ patientId })
      .sort({ sessionNumber: 1 })
      .select('sessionNumber rating energyLevel painLevel sleepQuality mood improvements');

    res.json({
      success: true,
      dashboard: {
        patient: {
          id: patient._id,
          name: patient.name,
          email: patient.email,
          age: patient.age,
          gender: patient.gender,
          location: patient.location,
          assignedTherapy: patient.assignedTherapy,
          problems: patient.problems,
          diseases: patient.diseases
        },
        upcomingSessions,
        pastSessions,
        progress: {
          totalSessions,
          completedSessions,
          progressPercentage: Math.round(progressPercentage)
        },
        feedbackData
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patients/sessions/:id
// @desc    Get patient sessions
// @access  Private (Patient)
router.get('/sessions/:id', verifyToken, requirePatient, async (req, res) => {
  try {
    const patientId = req.params.id;

    if (req.user._id.toString() !== patientId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const sessions = await Booking.find({ patientId })
      .populate('practitionerId', 'name specialization')
      .populate('centerId', 'name address')
      .populate('feedbackId')
      .sort({ sessionDate: 1 });

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patients/progress/:id
// @desc    Get patient progress data
// @access  Private (Patient)
router.get('/progress/:id', verifyToken, requirePatient, async (req, res) => {
  try {
    const patientId = req.params.id;

    if (req.user._id.toString() !== patientId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const feedbackData = await Feedback.find({ patientId })
      .sort({ sessionNumber: 1 })
      .select('sessionNumber rating energyLevel painLevel sleepQuality mood improvements createdAt');

    // Calculate trends
    const trends = {
      rating: feedbackData.map(f => ({ session: f.sessionNumber, value: f.rating })),
      energy: feedbackData.map(f => ({ session: f.sessionNumber, value: f.energyLevel })),
      pain: feedbackData.map(f => ({ session: f.sessionNumber, value: f.painLevel })),
      sleep: feedbackData.map(f => ({ session: f.sessionNumber, value: f.sleepQuality })),
      mood: feedbackData.map(f => ({ session: f.sessionNumber, value: f.mood }))
    };

    res.json({
      success: true,
      progress: {
        feedbackData,
        trends
      }
    });
  } catch (error) {
    console.error('Progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
