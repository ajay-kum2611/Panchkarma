const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient ID is required']
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking ID is required']
  },
  sessionNumber: {
    type: Number,
    required: [true, 'Session number is required'],
    min: [1, 'Session number must be at least 1']
  },
  symptoms: {
    type: String,
    required: [true, 'Symptoms description is required'],
    trim: true
  },
  sideEffects: {
    type: String,
    trim: true
  },
  improvements: {
    type: String,
    required: [true, 'Improvements description is required'],
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  energyLevel: {
    type: Number,
    min: [1, 'Energy level must be at least 1'],
    max: [10, 'Energy level cannot exceed 10']
  },
  painLevel: {
    type: Number,
    min: [0, 'Pain level must be at least 0'],
    max: [10, 'Pain level cannot exceed 10']
  },
  sleepQuality: {
    type: Number,
    min: [1, 'Sleep quality must be at least 1'],
    max: [10, 'Sleep quality cannot exceed 10']
  },
  mood: {
    type: Number,
    min: [1, 'Mood must be at least 1'],
    max: [10, 'Mood cannot exceed 10']
  },
  additionalNotes: {
    type: String,
    trim: true
  },
  wouldRecommend: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
feedbackSchema.index({ patientId: 1, sessionNumber: 1 });
feedbackSchema.index({ bookingId: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
