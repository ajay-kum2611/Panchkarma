const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  age: {
    type: Number,
    min: [1, 'Age must be at least 1'],
    max: [120, 'Age cannot exceed 120']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  location: {
    type: String,
    trim: true
  },
  problems: [{
    type: String,
    trim: true
  }],
  diseases: [{
    type: String,
    trim: true
  }],
  assignedTherapy: {
    type: String,
    trim: true
  },
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center'
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
patientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
patientSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
patientSchema.methods.toJSON = function() {
  const patient = this.toObject();
  delete patient.password;
  return patient;
};

module.exports = mongoose.model('Patient', patientSchema);
