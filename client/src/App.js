import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Components
import Navbar from './components/Layout/Navbar';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import PatientDashboard from './pages/Patient/PatientDashboard';
import PractitionerDashboard from './pages/Practitioner/PractitionerDashboard';
import HealthIntakeForm from './pages/Patient/HealthIntakeForm';
import TherapyRecommendation from './pages/Patient/TherapyRecommendation';
import BookingPage from './pages/Patient/BookingPage';
import BookingConfirmation from './pages/Patient/BookingConfirmation';
import PatientProfile from './pages/Patient/PatientProfile';
import PractitionerProfile from './pages/Practitioner/PractitionerProfile';
import PatientManagement from './pages/Practitioner/PatientManagement';
import ScheduleManagement from './pages/Practitioner/ScheduleManagement';
import Analytics from './pages/Practitioner/Analytics';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/login" 
              element={user ? <Navigate to={user.userType === 'patient' ? '/patient/dashboard' : '/practitioner/dashboard'} /> : <LoginPage />} 
            />
            <Route 
              path="/signup" 
              element={user ? <Navigate to={user.userType === 'patient' ? '/patient/dashboard' : '/practitioner/dashboard'} /> : <SignupPage />} 
            />

            {/* Patient Routes */}
            <Route 
              path="/patient/dashboard" 
              element={user && user.userType === 'patient' ? <PatientDashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/patient/health-intake" 
              element={user && user.userType === 'patient' ? <HealthIntakeForm /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/patient/therapy-recommendation" 
              element={user && user.userType === 'patient' ? <TherapyRecommendation /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/patient/booking" 
              element={user && user.userType === 'patient' ? <BookingPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/patient/booking-confirmation/:bookingId" 
              element={user && user.userType === 'patient' ? <BookingConfirmation /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/patient/profile" 
              element={user && user.userType === 'patient' ? <PatientProfile /> : <Navigate to="/login" />} 
            />

            {/* Practitioner Routes */}
            <Route 
              path="/practitioner/dashboard" 
              element={user && user.userType === 'practitioner' ? <PractitionerDashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/practitioner/profile" 
              element={user && user.userType === 'practitioner' ? <PractitionerProfile /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/practitioner/patients" 
              element={user && user.userType === 'practitioner' ? <PatientManagement /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/practitioner/schedule" 
              element={user && user.userType === 'practitioner' ? <ScheduleManagement /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/practitioner/analytics" 
              element={user && user.userType === 'practitioner' ? <Analytics /> : <Navigate to="/login" />} 
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
