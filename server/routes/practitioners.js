const express = require('express');
const { body, validationResult } = require('express-validator');
const Practitioner = require('../models/Practitioner');
const Booking = require('../models/Booking');
const Patient = require('../models/Patient');
const Feedback = require('../models/Feedback');
const { verifyToken, requirePractitioner } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/practitioners/dashboard/:id
// @desc    Get practitioner dashboard data
// @access  Private (Practitioner)
router.get('/dashboard/:id', verifyToken, requirePractitioner, async (req, res) => {
  try {
    const practitionerId = req.params.id;

    // Verify practitioner can only access their own dashboard
    if (req.user._id.toString() !== practitionerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const practitioner = await Practitioner.findById(practitionerId)
      .populate('centerId', 'name address');

    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner not found' });
    }

    // Get all bookings for this practitioner
    const bookings = await Booking.find({ practitionerId })
      .populate('patientId', 'name email phone age gender')
      .populate('centerId', 'name address')
      .populate('feedbackId')
      .sort({ sessionDate: 1 });

    // Get upcoming and past sessions
    const now = new Date();
    const upcomingSessions = bookings.filter(booking => 
      booking.sessionDate > now && booking.status !== 'cancelled'
    );
    const pastSessions = bookings.filter(booking => 
      booking.sessionDate <= now || booking.status === 'completed'
    );

    // Get unique patients
    const uniquePatients = [...new Set(bookings.map(booking => booking.patientId._id.toString()))];
    const patientCount = uniquePatients.length;

    // Get completed sessions count
    const completedSessions = bookings.filter(booking => booking.status === 'completed').length;

    // Get feedback data for analytics
    const feedbackData = await Feedback.find({
      bookingId: { $in: bookings.map(b => b._id) }
    }).populate('bookingId', 'therapyType sessionDate');

    // Calculate average ratings by therapy type
    const therapyRatings = {};
    feedbackData.forEach(feedback => {
      const therapyType = feedback.bookingId.therapyType;
      if (!therapyRatings[therapyType]) {
        therapyRatings[therapyType] = { total: 0, count: 0, ratings: [] };
      }
      therapyRatings[therapyType].total += feedback.rating;
      therapyRatings[therapyType].count += 1;
      therapyRatings[therapyType].ratings.push(feedback.rating);
    });

    // Calculate averages
    Object.keys(therapyRatings).forEach(therapy => {
      therapyRatings[therapy].average = therapyRatings[therapy].total / therapyRatings[therapy].count;
    });

    res.json({
      success: true,
      dashboard: {
        practitioner: {
          id: practitioner._id,
          name: practitioner.name,
          email: practitioner.email,
          specialization: practitioner.specialization,
          center: practitioner.centerId,
          role: practitioner.role
        },
        stats: {
          totalPatients: patientCount,
          totalSessions: bookings.length,
          completedSessions,
          upcomingSessions: upcomingSessions.length,
          averageRating: feedbackData.length > 0 ? 
            feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length : 0
        },
        upcomingSessions,
        pastSessions,
        therapyRatings,
        recentFeedback: feedbackData.slice(-5).reverse()
      }
    });
  } catch (error) {
    console.error('Practitioner dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/practitioners/patients/:id
// @desc    Get all patients for a practitioner
// @access  Private (Practitioner)
router.get('/patients/:id', verifyToken, requirePractitioner, async (req, res) => {
  try {
    const practitionerId = req.params.id;

    if (req.user._id.toString() !== practitionerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all bookings for this practitioner
    const bookings = await Booking.find({ practitionerId })
      .populate('patientId', 'name email phone age gender location problems diseases')
      .populate('feedbackId')
      .sort({ sessionDate: -1 });

    // Group by patient
    const patientsMap = new Map();
    bookings.forEach(booking => {
      const patientId = booking.patientId._id.toString();
      if (!patientsMap.has(patientId)) {
        patientsMap.set(patientId, {
          patient: booking.patientId,
          bookings: [],
          totalSessions: 0,
          completedSessions: 0,
          lastSession: null,
          averageRating: 0
        });
      }
      
      const patientData = patientsMap.get(patientId);
      patientData.bookings.push(booking);
      patientData.totalSessions += 1;
      
      if (booking.status === 'completed') {
        patientData.completedSessions += 1;
      }
      
      if (!patientData.lastSession || booking.sessionDate > patientData.lastSession) {
        patientData.lastSession = booking.sessionDate;
      }
    });

    // Calculate average ratings
    patientsMap.forEach((patientData, patientId) => {
      const feedbacks = patientData.bookings
        .filter(booking => booking.feedbackId)
        .map(booking => booking.feedbackId.rating);
      
      if (feedbacks.length > 0) {
        patientData.averageRating = feedbacks.reduce((sum, rating) => sum + rating, 0) / feedbacks.length;
      }
    });

    const patients = Array.from(patientsMap.values());

    res.json({
      success: true,
      patients
    });
  } catch (error) {
    console.error('Get practitioner patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/practitioners/schedule/:id
// @desc    Get practitioner schedule
// @access  Private (Practitioner)
router.get('/schedule/:id', verifyToken, requirePractitioner, async (req, res) => {
  try {
    const practitionerId = req.params.id;
    const { startDate, endDate } = req.query;

    if (req.user._id.toString() !== practitionerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = { practitionerId };
    
    if (startDate && endDate) {
      query.sessionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const schedule = await Booking.find(query)
      .populate('patientId', 'name email phone')
      .populate('centerId', 'name address')
      .sort({ sessionDate: 1, startTime: 1 });

    res.json({
      success: true,
      schedule
    });
  } catch (error) {
    console.error('Get practitioner schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/practitioners/analytics/:id
// @desc    Get practitioner analytics
// @access  Private (Practitioner)
router.get('/analytics/:id', verifyToken, requirePractitioner, async (req, res) => {
  try {
    const practitionerId = req.params.id;
    const { period = '30' } = req.query; // days

    if (req.user._id.toString() !== practitionerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get bookings in the specified period
    const bookings = await Booking.find({
      practitionerId,
      sessionDate: { $gte: startDate }
    }).populate('feedbackId');

    // Get feedback data
    const feedbackData = bookings.filter(booking => booking.feedbackId);

    // Calculate analytics
    const analytics = {
      period: `${period} days`,
      totalSessions: bookings.length,
      completedSessions: bookings.filter(b => b.status === 'completed').length,
      cancelledSessions: bookings.filter(b => b.status === 'cancelled').length,
      averageRating: feedbackData.length > 0 ? 
        feedbackData.reduce((sum, booking) => sum + booking.feedbackId.rating, 0) / feedbackData.length : 0,
      therapyBreakdown: {},
      monthlyTrends: {},
      patientSatisfaction: {
        excellent: feedbackData.filter(b => b.feedbackId.rating >= 4.5).length,
        good: feedbackData.filter(b => b.feedbackId.rating >= 3.5 && b.feedbackId.rating < 4.5).length,
        average: feedbackData.filter(b => b.feedbackId.rating >= 2.5 && b.feedbackId.rating < 3.5).length,
        poor: feedbackData.filter(b => b.feedbackId.rating < 2.5).length
      }
    };

    // Therapy breakdown
    bookings.forEach(booking => {
      if (!analytics.therapyBreakdown[booking.therapyType]) {
        analytics.therapyBreakdown[booking.therapyType] = 0;
      }
      analytics.therapyBreakdown[booking.therapyType] += 1;
    });

    // Monthly trends (last 6 months)
    const monthlyData = {};
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
      monthlyData[monthKey] = {
        sessions: 0,
        rating: 0,
        ratingCount: 0
      };
    }

    bookings.forEach(booking => {
      const monthKey = booking.sessionDate.toISOString().substring(0, 7);
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].sessions += 1;
        if (booking.feedbackId) {
          monthlyData[monthKey].rating += booking.feedbackId.rating;
          monthlyData[monthKey].ratingCount += 1;
        }
      }
    });

    // Calculate average ratings for each month
    Object.keys(monthlyData).forEach(month => {
      if (monthlyData[month].ratingCount > 0) {
        monthlyData[month].averageRating = monthlyData[month].rating / monthlyData[month].ratingCount;
      }
    });

    analytics.monthlyTrends = monthlyData;

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get practitioner analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/practitioners/profile/:id
// @desc    Update practitioner profile
// @access  Private (Practitioner)
router.put('/profile/:id', verifyToken, requirePractitioner, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().matches(/^\+?[\d\s-()]+$/).withMessage('Valid phone number is required'),
  body('specialization').optional().trim().isLength({ min: 2 }).withMessage('Specialization is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const practitionerId = req.params.id;

    if (req.user._id.toString() !== practitionerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedPractitioner = await Practitioner.findByIdAndUpdate(
      practitionerId,
      req.body,
      { new: true, runValidators: true }
    ).populate('centerId', 'name address');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      practitioner: updatedPractitioner
    });
  } catch (error) {
    console.error('Update practitioner profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
