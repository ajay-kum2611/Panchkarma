const mongoose = require('mongoose');

const centerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Center name is required'],
    trim: true,
    maxlength: [100, 'Center name cannot exceed 100 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    match: [/^\d{6}$/, 'Pincode must be 6 digits']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  availableSlots: [{
    date: {
      type: Date,
      required: true
    },
    timeSlots: [{
      startTime: {
        type: String,
        required: true
      },
      endTime: {
        type: String,
        required: true
      },
      isAvailable: {
        type: Boolean,
        default: true
      },
      practitionerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Practitioner'
      }
    }]
  }],
  therapies: [{
    type: String,
    trim: true
  }],
  facilities: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
centerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Center', centerSchema);
