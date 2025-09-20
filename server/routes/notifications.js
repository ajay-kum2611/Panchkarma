const express = require('express');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const Booking = require('../models/Booking');
const Patient = require('../models/Patient');
const Practitioner = require('../models/Practitioner');
const Center = require('../models/Center');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Initialize Twilio client
let twilioClient = null;
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;


if (twilioSid && twilioToken) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(twilioSid, twilioToken);
    console.log('Twilio client initialized.');
  } catch (err) {
    console.warn('Twilio init failed:', err.message);
    twilioClient = null;
  }
} else {
  console.warn('TWILIO not configured: SMS will be disabled.');
}

// --- Email transporter helper (fixed createTransport typo) ---
const createEmailTransporter = () => {
  // If you plan to use Gmail you might need an app password or OAuth setup
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};


// Email transporter configuration
// const createEmailTransporter = () => {
//   return nodemailer.createTransporter({
//     service: 'gmail', // You can change this to SendGrid or other services
//     auth: {
//       user: process.env.EMAIL_USER || 'your-email@gmail.com',
//       pass: process.env.EMAIL_PASS || 'your-app-password'
//     }
//   });
// };

// @route   POST /api/notifications/send
// @desc    Send notification (Email, SMS, or both)
// @access  Private
router.post('/send', verifyToken, [
  body('type').isIn(['email', 'sms', 'both']).withMessage('Type must be email, sms, or both'),
  body('recipientId').isMongoId().withMessage('Valid recipient ID is required'),
  body('template').isIn(['booking_confirmation', 'reminder_24h', 'reminder_1h', 'post_session', 'reschedule', 'cancellation']).withMessage('Valid template is required'),
  body('bookingId').optional().isMongoId().withMessage('Valid booking ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, recipientId, template, bookingId, customMessage } = req.body;

    // Get recipient information
    let recipient = await Patient.findById(recipientId);
    let recipientType = 'patient';
    
    if (!recipient) {
      recipient = await Practitioner.findById(recipientId);
      recipientType = 'practitioner';
    }

    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Get booking information if provided
    let booking = null;
    let practitioner = null;
    let center = null;

    if (bookingId) {
      booking = await Booking.findById(bookingId)
        .populate('practitionerId', 'name specialization')
        .populate('centerId', 'name address phone');
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      practitioner = booking.practitionerId;
      center = booking.centerId;
    }

    // Generate message content based on template
    const messageContent = generateMessageContent(template, {
      recipient,
      booking,
      practitioner,
      center,
      customMessage
    });

    const results = {};

    // Send email
    if (type === 'email' || type === 'both') {
      try {
        const transporter = createEmailTransporter();
        
        const mailOptions = {
          from: process.env.FROM_EMAIL || 'noreply@panchkarma.com',
          to: recipient.email,
          subject: messageContent.subject,
          html: messageContent.emailBody
        };

        await transporter.sendMail(mailOptions);
        results.email = { success: true, message: 'Email sent successfully' };
      } catch (error) {
        console.error('Email sending error:', error);
        results.email = { success: false, message: 'Failed to send email' };
      }
    }

    // Send SMS
    if (type === 'sms' || type === 'both') {
      try {
        await twilioClient.messages.create({
          body: messageContent.smsBody,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: recipient.phone
        });
        results.sms = { success: true, message: 'SMS sent successfully' };
      } catch (error) {
        console.error('SMS sending error:', error);
        results.sms = { success: false, message: 'Failed to send SMS' };
      }
    }

    res.json({
      success: true,
      message: 'Notifications sent',
      results
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notifications/reminder
// @desc    Send reminder notifications for upcoming sessions
// @access  Private (Admin/Practitioner)
router.post('/reminder', verifyToken, async (req, res) => {
  try {
    const { hours = 24 } = req.body;

    // Find bookings that need reminders
    const reminderTime = new Date();
    reminderTime.setHours(reminderTime.getHours() + parseInt(hours));

    const upcomingBookings = await Booking.find({
      sessionDate: {
        $gte: new Date(),
        $lte: reminderTime
      },
      status: { $in: ['scheduled', 'confirmed'] },
      reminderSent: false
    })
    .populate('patientId', 'name email phone')
    .populate('practitionerId', 'name specialization')
    .populate('centerId', 'name address phone');

    const results = [];

    for (const booking of upcomingBookings) {
      try {
        // Send email reminder
        const transporter = createEmailTransporter();
        const messageContent = generateMessageContent('reminder_24h', {
          recipient: booking.patientId,
          booking,
          practitioner: booking.practitionerId,
          center: booking.centerId
        });

        await transporter.sendMail({
          from: process.env.FROM_EMAIL || 'noreply@panchkarma.com',
          to: booking.patientId.email,
          subject: messageContent.subject,
          html: messageContent.emailBody
        });

        // Send SMS reminder
        await twilioClient.messages.create({
          body: messageContent.smsBody,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: booking.patientId.phone
        });

        // Mark reminder as sent
        await Booking.findByIdAndUpdate(booking._id, { reminderSent: true });

        results.push({
          bookingId: booking._id,
          patientName: booking.patientId.name,
          success: true
        });
      } catch (error) {
        console.error(`Reminder error for booking ${booking._id}:`, error);
        results.push({
          bookingId: booking._id,
          patientName: booking.patientId.name,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${upcomingBookings.length} reminders`,
      results
    });
  } catch (error) {
    console.error('Reminder processing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notifications/followup
// @desc    Send follow-up notifications after completed sessions
// @access  Private (Admin/Practitioner)
router.post('/followup', verifyToken, async (req, res) => {
  try {
    // Find completed bookings that need follow-up
    const followupBookings = await Booking.find({
      status: 'completed',
      followUpSent: false,
      sessionDate: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        $lte: new Date()
      }
    })
    .populate('patientId', 'name email phone')
    .populate('practitionerId', 'name specialization')
    .populate('centerId', 'name address phone');

    const results = [];

    for (const booking of followupBookings) {
      try {
        // Send follow-up email
        const transporter = createEmailTransporter();
        const messageContent = generateMessageContent('post_session', {
          recipient: booking.patientId,
          booking,
          practitioner: booking.practitionerId,
          center: booking.centerId
        });

        await transporter.sendMail({
          from: process.env.FROM_EMAIL || 'noreply@panchkarma.com',
          to: booking.patientId.email,
          subject: messageContent.subject,
          html: messageContent.emailBody
        });

        // Mark follow-up as sent
        await Booking.findByIdAndUpdate(booking._id, { followUpSent: true });

        results.push({
          bookingId: booking._id,
          patientName: booking.patientId.name,
          success: true
        });
      } catch (error) {
        console.error(`Follow-up error for booking ${booking._id}:`, error);
        results.push({
          bookingId: booking._id,
          patientName: booking.patientId.name,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${followupBookings.length} follow-ups`,
      results
    });
  } catch (error) {
    console.error('Follow-up processing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate message content based on template
const generateMessageContent = (template, data) => {
  const { recipient, booking, practitioner, center, customMessage } = data;

  const templates = {
    booking_confirmation: {
      subject: 'Booking Confirmation - Panchkarma Therapy',
      emailBody: `
        <h2>Booking Confirmed!</h2>
        <p>Dear ${recipient.name},</p>
        <p>Your Panchkarma therapy session has been confirmed.</p>
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3>Session Details:</h3>
          <p><strong>Date:</strong> ${booking.sessionDate.toDateString()}</p>
          <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p><strong>Therapy:</strong> ${booking.therapyType}</p>
          <p><strong>Practitioner:</strong> ${practitioner.name}</p>
          <p><strong>Center:</strong> ${center.name}</p>
          <p><strong>Address:</strong> ${center.address}</p>
        </div>
        <p>Please arrive 15 minutes before your scheduled time.</p>
        <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
        <p>Best regards,<br>Panchkarma Team</p>
      `,
      smsBody: `Hi ${recipient.name}! Your ${booking.therapyType} session is confirmed for ${booking.sessionDate.toDateString()} at ${booking.startTime}. Center: ${center.name}. Please arrive 15 mins early.`
    },
    reminder_24h: {
      subject: 'Reminder: Your Panchkarma Session Tomorrow',
      emailBody: `
        <h2>Session Reminder</h2>
        <p>Dear ${recipient.name},</p>
        <p>This is a friendly reminder about your upcoming Panchkarma therapy session.</p>
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3>Session Details:</h3>
          <p><strong>Date:</strong> ${booking.sessionDate.toDateString()}</p>
          <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p><strong>Therapy:</strong> ${booking.therapyType}</p>
          <p><strong>Practitioner:</strong> ${practitioner.name}</p>
          <p><strong>Center:</strong> ${center.name}</p>
        </div>
        <p><strong>Important Reminders:</strong></p>
        <ul>
          <li>Arrive 15 minutes before your scheduled time</li>
          <li>Wear comfortable, loose-fitting clothing</li>
          <li>Bring a water bottle</li>
          <li>Inform us of any health changes</li>
        </ul>
        <p>Best regards,<br>Panchkarma Team</p>
      `,
      smsBody: `Reminder: Your ${booking.therapyType} session is tomorrow at ${booking.startTime}. Please arrive 15 mins early. Center: ${center.name}.`
    },
    reminder_1h: {
      subject: 'Reminder: Your Panchkarma Session in 1 Hour',
      emailBody: `
        <h2>Session Starting Soon!</h2>
        <p>Dear ${recipient.name},</p>
        <p>Your Panchkarma therapy session starts in 1 hour.</p>
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3>Session Details:</h3>
          <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p><strong>Therapy:</strong> ${booking.therapyType}</p>
          <p><strong>Center:</strong> ${center.name}</p>
        </div>
        <p>Please arrive on time. Safe travels!</p>
        <p>Best regards,<br>Panchkarma Team</p>
      `,
      smsBody: `Your ${booking.therapyType} session starts in 1 hour at ${booking.startTime}. Please arrive on time.`
    },
    post_session: {
      subject: 'Thank You for Your Panchkarma Session',
      emailBody: `
        <h2>Session Completed!</h2>
        <p>Dear ${recipient.name},</p>
        <p>Thank you for completing your Panchkarma therapy session.</p>
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3>Session Details:</h3>
          <p><strong>Date:</strong> ${booking.sessionDate.toDateString()}</p>
          <p><strong>Therapy:</strong> ${booking.therapyType}</p>
          <p><strong>Practitioner:</strong> ${practitioner.name}</p>
        </div>
        <p><strong>Post-Session Care:</strong></p>
        <ul>
          <li>Rest for the remainder of the day</li>
          <li>Drink plenty of warm water</li>
          <li>Eat light, easily digestible food</li>
          <li>Avoid cold drinks and heavy meals</li>
          <li>Take a warm shower after 2-3 hours</li>
        </ul>
        <p>Please provide your feedback about the session in your dashboard.</p>
        <p>Best regards,<br>Panchkarma Team</p>
      `,
      smsBody: `Thank you for your ${booking.therapyType} session! Please rest, drink warm water, and provide feedback in your dashboard.`
    },
    reschedule: {
      subject: 'Session Rescheduled - Panchkarma Therapy',
      emailBody: `
        <h2>Session Rescheduled</h2>
        <p>Dear ${recipient.name},</p>
        <p>Your Panchkarma therapy session has been rescheduled.</p>
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3>New Session Details:</h3>
          <p><strong>Date:</strong> ${booking.sessionDate.toDateString()}</p>
          <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p><strong>Therapy:</strong> ${booking.therapyType}</p>
          <p><strong>Practitioner:</strong> ${practitioner.name}</p>
          <p><strong>Center:</strong> ${center.name}</p>
        </div>
        <p>If you have any questions, please contact us.</p>
        <p>Best regards,<br>Panchkarma Team</p>
      `,
      smsBody: `Your ${booking.therapyType} session has been rescheduled to ${booking.sessionDate.toDateString()} at ${booking.startTime}.`
    },
    cancellation: {
      subject: 'Session Cancelled - Panchkarma Therapy',
      emailBody: `
        <h2>Session Cancelled</h2>
        <p>Dear ${recipient.name},</p>
        <p>Your Panchkarma therapy session has been cancelled.</p>
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3>Cancelled Session Details:</h3>
          <p><strong>Date:</strong> ${booking.sessionDate.toDateString()}</p>
          <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p><strong>Therapy:</strong> ${booking.therapyType}</p>
        </div>
        <p>You can book a new session through your dashboard.</p>
        <p>Best regards,<br>Panchkarma Team</p>
      `,
      smsBody: `Your ${booking.therapyType} session on ${booking.sessionDate.toDateString()} has been cancelled. You can book a new session anytime.`
    }
  };

  return templates[template] || {
    subject: 'Notification from Panchkarma',
    emailBody: customMessage || 'You have a new notification from Panchkarma.',
    smsBody: customMessage || 'You have a new notification from Panchkarma.'
  };
};

module.exports = router;
