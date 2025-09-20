const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient ID is required']
  },
  practitionerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner',
    required: [true, 'Practitioner ID is required']
  },
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center',
    required: [true, 'Center ID is required']
  },
  therapyType: {
    type: String,
    required: [true, 'Therapy type is required'],
    trim: true
  },
  sessionDate: {
    type: Date,
    required: [true, 'Session date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  sessionNumber: {
    type: Number,
    required: [true, 'Session number is required'],
    min: [1, 'Session number must be at least 1']
  },
  totalSessions: {
    type: Number,
    required: [true, 'Total sessions is required'],
    min: [1, 'Total sessions must be at least 1']
  },
  notes: {
    type: String,
    trim: true
  },
  feedbackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  followUpSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
bookingSchema.index({ patientId: 1, sessionDate: 1 });
bookingSchema.index({ practitionerId: 1, sessionDate: 1 });
bookingSchema.index({ centerId: 1, sessionDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
