const express = require('express');
const { body, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const Booking = require('../models/Booking');
const { verifyToken, requirePatient, requirePractitioner } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/feedback
// @desc    Submit session feedback
// @access  Private (Patient)
router.post('/', verifyToken, requirePatient, [
  body('bookingId').isMongoId().withMessage('Valid booking ID is required'),
  body('sessionNumber').isInt({ min: 1 }).withMessage('Session number must be at least 1'),
  body('symptoms').trim().isLength({ min: 10 }).withMessage('Symptoms description is required (min 10 characters)'),
  body('improvements').trim().isLength({ min: 10 }).withMessage('Improvements description is required (min 10 characters)'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('energyLevel').optional().isInt({ min: 1, max: 10 }).withMessage('Energy level must be between 1 and 10'),
  body('painLevel').optional().isInt({ min: 0, max: 10 }).withMessage('Pain level must be between 0 and 10'),
  body('sleepQuality').optional().isInt({ min: 1, max: 10 }).withMessage('Sleep quality must be between 1 and 10'),
  body('mood').optional().isInt({ min: 1, max: 10 }).withMessage('Mood must be between 1 and 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      bookingId,
      sessionNumber,
      symptoms,
      sideEffects,
      improvements,
      rating,
      energyLevel,
      painLevel,
      sleepQuality,
      mood,
      additionalNotes,
      wouldRecommend
    } = req.body;

    // Check if booking exists and belongs to the patient
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if feedback already exists for this booking
    const existingFeedback = await Feedback.findOne({ bookingId });
    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already submitted for this session' });
    }

    // Create feedback
    const feedback = new Feedback({
      patientId: req.user._id,
      bookingId,
      sessionNumber,
      symptoms,
      sideEffects,
      improvements,
      rating,
      energyLevel,
      painLevel,
      sleepQuality,
      mood,
      additionalNotes,
      wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : true
    });

    await feedback.save();

    // Update booking with feedback reference
    await Booking.findByIdAndUpdate(bookingId, { feedbackId: feedback._id });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/feedback/:bookingId
// @desc    Get feedback for a specific booking
// @access  Private
router.get('/:bookingId', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check access
    const hasAccess = req.user._id.toString() === booking.patientId.toString() ||
                     (req.userType === 'practitioner' && req.user._id.toString() === booking.practitionerId.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const feedback = await Feedback.findOne({ bookingId })
      .populate('patientId', 'name email')
      .populate('bookingId');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/feedback/patient/:patientId
// @desc    Get all feedback for a patient
// @access  Private
router.get('/patient/:patientId', verifyToken, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check access
    const hasAccess = req.user._id.toString() === patientId ||
                     (req.userType === 'practitioner');

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const feedback = await Feedback.find({ patientId })
      .populate('bookingId', 'therapyType sessionDate sessionNumber')
      .sort({ sessionNumber: 1 });

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error('Get patient feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/feedback/practitioner/:practitionerId
// @desc    Get all feedback for patients of a practitioner
// @access  Private (Practitioner)
router.get('/practitioner/:practitionerId', verifyToken, requirePractitioner, async (req, res) => {
  try {
    const { practitionerId } = req.params;

    if (req.user._id.toString() !== practitionerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all bookings for this practitioner
    const bookings = await Booking.find({ practitionerId }).select('_id');
    const bookingIds = bookings.map(booking => booking._id);

    const feedback = await Feedback.find({ bookingId: { $in: bookingIds } })
      .populate('patientId', 'name email age gender')
      .populate('bookingId', 'therapyType sessionDate sessionNumber')
      .sort({ sessionNumber: 1 });

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error('Get practitioner feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/feedback/:id
// @desc    Update feedback
// @access  Private (Patient)
router.put('/:id', verifyToken, requirePatient, [
  body('symptoms').optional().trim().isLength({ min: 10 }).withMessage('Symptoms description must be at least 10 characters'),
  body('improvements').optional().trim().isLength({ min: 10 }).withMessage('Improvements description must be at least 10 characters'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('energyLevel').optional().isInt({ min: 1, max: 10 }).withMessage('Energy level must be between 1 and 10'),
  body('painLevel').optional().isInt({ min: 0, max: 10 }).withMessage('Pain level must be between 0 and 10'),
  body('sleepQuality').optional().isInt({ min: 1, max: 10 }).withMessage('Sleep quality must be between 1 and 10'),
  body('mood').optional().isInt({ min: 1, max: 10 }).withMessage('Mood must be between 1 and 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if feedback belongs to the patient
    if (feedback.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update feedback
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback: updatedFeedback
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/feedback/analytics/:patientId
// @desc    Get feedback analytics for a patient
// @access  Private
router.get('/analytics/:patientId', verifyToken, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check access
    const hasAccess = req.user._id.toString() === patientId ||
                     (req.userType === 'practitioner');

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const feedback = await Feedback.find({ patientId })
      .sort({ sessionNumber: 1 })
      .select('sessionNumber rating energyLevel painLevel sleepQuality mood improvements createdAt');

    // Calculate analytics
    const analytics = {
      totalSessions: feedback.length,
      averageRating: feedback.length > 0 ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length : 0,
      averageEnergy: feedback.length > 0 ? feedback.reduce((sum, f) => sum + (f.energyLevel || 0), 0) / feedback.length : 0,
      averagePain: feedback.length > 0 ? feedback.reduce((sum, f) => sum + (f.painLevel || 0), 0) / feedback.length : 0,
      averageSleep: feedback.length > 0 ? feedback.reduce((sum, f) => sum + (f.sleepQuality || 0), 0) / feedback.length : 0,
      averageMood: feedback.length > 0 ? feedback.reduce((sum, f) => sum + (f.mood || 0), 0) / feedback.length : 0,
      trends: {
        rating: feedback.map(f => ({ session: f.sessionNumber, value: f.rating })),
        energy: feedback.map(f => ({ session: f.sessionNumber, value: f.energyLevel || 0 })),
        pain: feedback.map(f => ({ session: f.sessionNumber, value: f.painLevel || 0 })),
        sleep: feedback.map(f => ({ session: f.sessionNumber, value: f.sleepQuality || 0 })),
        mood: feedback.map(f => ({ session: f.sessionNumber, value: f.mood || 0 }))
      }
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get feedback analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
