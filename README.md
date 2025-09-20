# Panchkarma Patient Management & Therapy Scheduler

A comprehensive full-stack web application for managing Panchkarma therapy patients, practitioners, and scheduling. Built with React, Node.js, Express, and MongoDB.

## 🌟 Features

### For Patients
- **User Registration & Authentication** - Secure signup/login with JWT
- **Health Intake Form** - Comprehensive health assessment
- **AI-Powered Therapy Recommendations** - Personalized therapy suggestions based on health profile
- **Center Discovery** - Find nearby therapy centers with location-based search
- **Session Booking** - Easy booking system with real-time slot availability
- **Progress Tracking** - Visual charts and analytics for healing journey
- **Session Management** - View upcoming and past sessions
- **Feedback System** - Post-session feedback and rating system
- **Notifications** - Email and SMS reminders for sessions

### For Practitioners
- **Patient Management** - View and manage patient profiles
- **Schedule Management** - Manage appointments and availability
- **Progress Monitoring** - Track patient recovery and therapy outcomes
- **Analytics Dashboard** - Comprehensive reports and insights
- **Session History** - Complete patient session records
- **Feedback Analysis** - Review patient feedback and ratings

### General Features
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI/UX** - Clean, intuitive interface with TailwindCSS
- **Real-time Updates** - Live booking status and notifications
- **Secure Data** - Enterprise-grade security and privacy
- **Multi-role Support** - Separate interfaces for patients and practitioners

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TailwindCSS** - Utility-first CSS framework for styling
- **React Router** - Client-side routing
- **Chart.js** - Data visualization and progress tracking
- **Axios** - HTTP client for API requests
- **React Hook Form** - Form handling and validation
- **React Toastify** - Notification system

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Nodemailer** - Email notifications
- **Twilio** - SMS notifications

### Development Tools
- **Concurrently** - Run multiple npm scripts
- **Nodemon** - Development server auto-restart
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **MongoDB** (v5 or higher)
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd panchkarma-patient-management
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, and client)
npm run install-all
```

### 3. Environment Configuration

#### Backend Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/panchkarma
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@panchkarma.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# Frontend URL
CLIENT_URL=http://localhost:3000
```

#### Frontend Environment Variables

Create a `.env` file in the `client` directory:

```bash
cd client
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

### 4. Database Setup

Make sure MongoDB is running on your system:

```bash
# Start MongoDB (if not already running)
mongod
```

The application will automatically create the database and collections when you first run it.

### 5. Run the Application

#### Development Mode (Recommended)

```bash
# From the root directory, run both frontend and backend
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend React app on `http://localhost:3000`

#### Production Mode

```bash
# Build the frontend
npm run build

# Start the production server
npm start
```

## 📱 Usage

### For Patients

1. **Sign Up** - Create a new patient account
2. **Health Intake** - Complete the comprehensive health assessment
3. **Get Recommendations** - Receive personalized therapy suggestions
4. **Book Sessions** - Select center, date, and time for therapy
5. **Track Progress** - Monitor healing journey with visual charts
6. **Provide Feedback** - Rate sessions and provide improvement notes

### For Practitioners

1. **Sign Up** - Create a practitioner account (requires admin approval)
2. **Manage Patients** - View patient profiles and session history
3. **Schedule Management** - Manage availability and appointments
4. **Monitor Progress** - Track patient recovery and outcomes
5. **Analytics** - View comprehensive reports and insights

### Demo Credentials

For testing purposes, you can use these demo accounts:

**Patient Account:**
- Email: `patient@demo.com`
- Password: `password123`

**Practitioner Account:**
- Email: `practitioner@demo.com`
- Password: `password123`

## 🏗️ Project Structure

```
panchkarma-patient-management/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── UI/        # Basic UI components
│   │   │   ├── Layout/    # Layout components
│   │   │   └── Charts/    # Chart components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   │   ├── Auth/      # Authentication pages
│   │   │   ├── Patient/   # Patient-specific pages
│   │   │   └── Practitioner/ # Practitioner pages
│   │   ├── utils/         # Utility functions
│   │   └── index.js       # App entry point
│   ├── package.json
│   └── tailwind.config.js
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── index.js          # Server entry point
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Patients
- `POST /api/patients/form` - Submit health intake form
- `GET /api/patients/dashboard/:id` - Get patient dashboard
- `GET /api/patients/sessions/:id` - Get patient sessions
- `GET /api/patients/progress/:id` - Get progress data

### Practitioners
- `GET /api/practitioners/dashboard/:id` - Get practitioner dashboard
- `GET /api/practitioners/patients/:id` - Get practitioner's patients
- `GET /api/practitioners/schedule/:id` - Get practitioner schedule
- `GET /api/practitioners/analytics/:id` - Get analytics data

### Centers
- `GET /api/centers` - Get all centers
- `GET /api/centers/:id` - Get center by ID
- `GET /api/centers/nearby` - Get nearby centers

### Bookings
- `POST /api/bookings/create` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `GET /api/bookings/patient/:patientId` - Get patient bookings
- `GET /api/bookings/practitioner/:practitionerId` - Get practitioner bookings

### Feedback
- `POST /api/feedback` - Submit session feedback
- `GET /api/feedback/:bookingId` - Get feedback for booking
- `GET /api/feedback/patient/:patientId` - Get patient feedback
- `GET /api/feedback/analytics/:patientId` - Get feedback analytics

### Therapy Recommendations
- `POST /api/therapy/recommend` - Get therapy recommendations

### Notifications
- `POST /api/notifications/send` - Send notification
- `POST /api/notifications/reminder` - Send reminder notifications
- `POST /api/notifications/followup` - Send follow-up notifications

## 🗄️ Database Schema

### Patient
```javascript
{
  id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  age: Number,
  gender: String,
  location: String,
  problems: [String],
  diseases: [String],
  assignedTherapy: String,
  centerId: ObjectId,
  bookings: [ObjectId],
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Practitioner
```javascript
{
  id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  specialization: String,
  centerId: ObjectId,
  role: String (practitioner/admin),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Center
```javascript
{
  id: ObjectId,
  name: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  phone: String,
  email: String,
  location: {
    type: "Point",
    coordinates: [Number, Number] // [lng, lat]
  },
  availableSlots: [{
    date: Date,
    timeSlots: [{
      startTime: String,
      endTime: String,
      isAvailable: Boolean,
      practitionerId: ObjectId
    }]
  }],
  therapies: [String],
  facilities: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Booking
```javascript
{
  id: ObjectId,
  patientId: ObjectId,
  practitionerId: ObjectId,
  centerId: ObjectId,
  therapyType: String,
  sessionDate: Date,
  startTime: String,
  endTime: String,
  status: String,
  sessionNumber: Number,
  totalSessions: Number,
  notes: String,
  feedbackId: ObjectId,
  isActive: Boolean,
  reminderSent: Boolean,
  followUpSent: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Feedback
```javascript
{
  id: ObjectId,
  patientId: ObjectId,
  bookingId: ObjectId,
  sessionNumber: Number,
  symptoms: String,
  sideEffects: String,
  improvements: String,
  rating: Number (1-5),
  energyLevel: Number (1-10),
  painLevel: Number (0-10),
  sleepQuality: Number (1-10),
  mood: Number (1-10),
  additionalNotes: String,
  wouldRecommend: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **Input Validation** - Express-validator for request validation
- **Rate Limiting** - Prevent API abuse
- **CORS Configuration** - Cross-origin resource sharing
- **Helmet.js** - Security headers
- **Environment Variables** - Sensitive data protection

## 📧 Notification System

### Email Notifications (SendGrid)
- Booking confirmations
- Session reminders (24 hours before)
- Post-session follow-ups
- Rescheduling notifications

### SMS Notifications (Twilio)
- Session reminders
- Booking confirmations
- Emergency notifications

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-first approach
- **Dark/Light Mode** - Theme switching capability
- **Accessibility** - WCAG compliant components
- **Loading States** - Smooth loading indicators
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Non-intrusive notifications
- **Progress Indicators** - Visual progress tracking

## 🧪 Testing

### Running Tests

```bash
# Run frontend tests
cd client
npm test

# Run backend tests
cd server
npm test
```

### Test Coverage

- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for React components
- E2E tests for critical user flows

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)

1. Build the frontend:
```bash
cd client
npm run build
```

2. Deploy the `build` folder to your hosting service

### Backend Deployment (Heroku/DigitalOcean)

1. Set environment variables in your hosting platform
2. Deploy the server directory
3. Ensure MongoDB is accessible from your hosting platform

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
JWT_EXPIRE=7d
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
CLIENT_URL=https://yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact support at support@panchkarma.com

## 🙏 Acknowledgments

- Ayurvedic practitioners for therapy recommendations
- Open source community for amazing tools and libraries
- Healthcare professionals for domain expertise

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Basic patient and practitioner management
- ✅ Session booking and scheduling
- ✅ Progress tracking and analytics
- ✅ Notification system

### Phase 2 (Upcoming)
- 🔄 Advanced analytics and reporting
- 🔄 Video consultation integration
- 🔄 Mobile app development
- 🔄 AI-powered health insights

### Phase 3 (Future)
- 📋 Telemedicine features
- 📋 Integration with health devices
- 📋 Advanced therapy protocols
- 📋 Multi-language support

---

**Built with ❤️ for the Panchkarma community**
