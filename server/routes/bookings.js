const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Center = require('../models/Center');
const Patient = require('../models/Patient');
const Practitioner = require('../models/Practitioner');
const { verifyToken, requirePatient, requirePractitioner } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/bookings/create
// @desc    Create a new booking
// @access  Private (Patient)
router.post('/create', verifyToken, requirePatient, [
  body('centerId').isMongoId().withMessage('Valid center ID is required'),
  body('therapyType').trim().isLength({ min: 2 }).withMessage('Therapy type is required'),
  body('sessionDate').isISO8601().withMessage('Valid session date is required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required'),
  body('totalSessions').isInt({ min: 1 }).withMessage('Total sessions must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      centerId,
      therapyType,
      sessionDate,
      startTime,
      endTime,
      totalSessions,
      notes
    } = req.body;

    // Check if center exists and is active
    const center = await Center.findById(centerId);
    if (!center || !center.isActive) {
      return res.status(404).json({ message: 'Center not found or inactive' });
    }

    // Find available practitioner at the center
    const practitioner = await Practitioner.findOne({
      centerId,
      isActive: true
    });

    if (!practitioner) {
      return res.status(400).json({ message: 'No available practitioner at this center' });
    }

    // Check if slot is available
    const sessionDateTime = new Date(sessionDate);
    const centerSlot = center.availableSlots.find(slot => {
      const slotDate = new Date(slot.date);
      return slotDate.toDateString() === sessionDateTime.toDateString();
    });

    if (!centerSlot) {
      return res.status(400).json({ message: 'No slots available for this date' });
    }

    const timeSlot = centerSlot.timeSlots.find(slot => 
      slot.startTime === startTime && 
      slot.endTime === endTime && 
      slot.isAvailable
    );

    if (!timeSlot) {
      return res.status(400).json({ message: 'Time slot not available' });
    }

    // Get next session number for this patient
    const existingBookings = await Booking.find({ patientId: req.user._id });
    const sessionNumber = existingBookings.length + 1;

    // Create booking
    const booking = new Booking({
      patientId: req.user._id,
      practitionerId: practitioner._id,
      centerId,
      therapyType,
      sessionDate: sessionDateTime,
      startTime,
      endTime,
      sessionNumber,
      totalSessions,
      notes,
      status: 'scheduled'
    });

    await booking.save();

    // Update center slot availability
    timeSlot.isAvailable = false;
    timeSlot.practitionerId = practitioner._id;
    await center.save();

    // Update patient's assigned therapy and center
    await Patient.findByIdAndUpdate(req.user._id, {
      assignedTherapy: therapyType,
      centerId,
      $push: { bookings: booking._id }
    });

    // Populate booking data for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('practitionerId', 'name specialization')
      .populate('centerId', 'name address phone');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get booking details
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate('practitionerId', 'name specialization')
      .populate('centerId', 'name address phone')
      .populate('feedbackId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has access to this booking
    const hasAccess = req.user._id.toString() === booking.patientId._id.toString() ||
                     (req.userType === 'practitioner' && req.user._id.toString() === booking.practitionerId._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update/reschedule booking
// @access  Private (Practitioner or Patient)
router.put('/:id', verifyToken, [
  body('sessionDate').optional().isISO8601().withMessage('Valid session date is required'),
  body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
  body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required'),
  body('status').optional().isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rescheduled']).withMessage('Invalid status'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has access to update this booking
    const hasAccess = req.user._id.toString() === booking.patientId.toString() ||
                     (req.userType === 'practitioner' && req.user._id.toString() === booking.practitionerId.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If rescheduling, update center slot availability
    if (req.body.sessionDate || req.body.startTime || req.body.endTime) {
      const center = await Center.findById(booking.centerId);
      
      // Free up old slot
      const oldSlot = center.availableSlots.find(slot => {
        const slotDate = new Date(slot.date);
        return slotDate.toDateString() === booking.sessionDate.toDateString();
      });

      if (oldSlot) {
        const oldTimeSlot = oldSlot.timeSlots.find(slot => 
          slot.startTime === booking.startTime && slot.endTime === booking.endTime
        );
        if (oldTimeSlot) {
          oldTimeSlot.isAvailable = true;
          oldTimeSlot.practitionerId = undefined;
        }
      }

      // Reserve new slot
      const newSessionDate = req.body.sessionDate ? new Date(req.body.sessionDate) : booking.sessionDate;
      const newStartTime = req.body.startTime || booking.startTime;
      const newEndTime = req.body.endTime || booking.endTime;

      const newSlot = center.availableSlots.find(slot => {
        const slotDate = new Date(slot.date);
        return slotDate.toDateString() === newSessionDate.toDateString();
      });

      if (newSlot) {
        const newTimeSlot = newSlot.timeSlots.find(slot => 
          slot.startTime === newStartTime && slot.endTime === newEndTime
        );
        if (newTimeSlot && newTimeSlot.isAvailable) {
          newTimeSlot.isAvailable = false;
          newTimeSlot.practitionerId = booking.practitionerId;
        } else {
          return res.status(400).json({ message: 'New time slot not available' });
        }
      } else {
        return res.status(400).json({ message: 'No slots available for new date' });
      }

      await center.save();
    }

    // Update booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { ...req.body, status: req.body.status || 'rescheduled' },
      { new: true, runValidators: true }
    )
    .populate('patientId', 'name email phone')
    .populate('practitionerId', 'name specialization')
    .populate('centerId', 'name address phone');

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/patient/:patientId
// @desc    Get all bookings for a patient
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

    const bookings = await Booking.find({ patientId })
      .populate('practitionerId', 'name specialization')
      .populate('centerId', 'name address')
      .populate('feedbackId')
      .sort({ sessionDate: 1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Get patient bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/practitioner/:practitionerId
// @desc    Get all bookings for a practitioner
// @access  Private (Practitioner)
router.get('/practitioner/:practitionerId', verifyToken, requirePractitioner, async (req, res) => {
  try {
    const { practitionerId } = req.params;
    
    if (req.user._id.toString() !== practitionerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bookings = await Booking.find({ practitionerId })
      .populate('patientId', 'name email phone age gender')
      .populate('centerId', 'name address')
      .populate('feedbackId')
      .sort({ sessionDate: 1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Get practitioner bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
