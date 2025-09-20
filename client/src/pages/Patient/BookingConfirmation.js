import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  ArrowRight,
  Download,
  Share2
} from 'lucide-react';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data.booking);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDownload = () => {
    // Create a simple text-based receipt
    const receipt = `
PANCHKARMA THERAPY BOOKING CONFIRMATION

Booking ID: ${booking._id}
Patient: ${booking.patientId.name}
Email: ${booking.patientId.email}
Phone: ${booking.patientId.phone}

Session Details:
- Therapy: ${booking.therapyType}
- Date: ${formatDate(booking.sessionDate)}
- Time: ${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}
- Session: ${booking.sessionNumber} of ${booking.totalSessions}

Center Details:
- Name: ${booking.centerId.name}
- Address: ${booking.centerId.address}
- Phone: ${booking.centerId.phone}

Practitioner:
- Name: ${booking.practitionerId.name}
- Specialization: ${booking.practitionerId.specialization}

Status: ${booking.status.toUpperCase()}

Important Reminders:
- Arrive 15 minutes before your scheduled time
- Wear comfortable, loose-fitting clothing
- Bring a water bottle
- Inform us of any health changes

Thank you for choosing Panchkarma!
    `;

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `panchkarma-booking-${booking._id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Panchkarma Therapy Booking',
          text: `I've booked a ${booking.therapyType} session for ${formatDate(booking.sessionDate)} at ${booking.centerId.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `I've booked a ${booking.therapyType} session for ${formatDate(booking.sessionDate)} at ${booking.centerId.name}. Booking ID: ${booking._id}`;
      navigator.clipboard.writeText(shareText).then(() => {
        toast.success('Booking details copied to clipboard!');
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Booking not found</h3>
          <p className="text-gray-600">The booking you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-success-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your therapy session has been successfully booked
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Booking Details
              </h2>
              
              <div className="space-y-6">
                {/* Session Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-primary-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(booking.sessionDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-primary-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Time</p>
                        <p className="font-medium text-gray-900">
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Therapy Type</p>
                      <p className="font-medium text-gray-900">{booking.therapyType}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Session</p>
                      <p className="font-medium text-gray-900">
                        {booking.sessionNumber} of {booking.totalSessions}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Center Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Center Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-primary-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{booking.centerId.name}</p>
                        <p className="text-sm text-gray-600">{booking.centerId.address}</p>
                      </div>
                    </div>
                    
                    {booking.centerId.phone && (
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-primary-600 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">{booking.centerId.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Practitioner Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Your Practitioner</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">{booking.practitionerId.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Specialization</p>
                      <p className="font-medium text-gray-900">{booking.practitionerId.specialization}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {booking.notes && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{booking.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Important Reminders */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Important Reminders
              </h2>
              
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Before Your Session:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Arrive 15 minutes before your scheduled time</li>
                    <li>• Wear comfortable, loose-fitting clothing</li>
                    <li>• Avoid heavy meals 2 hours before the session</li>
                    <li>• Bring a water bottle</li>
                    <li>• Inform us of any health changes</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">After Your Session:</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Rest for the remainder of the day</li>
                    <li>• Drink plenty of warm water</li>
                    <li>• Eat light, easily digestible food</li>
                    <li>• Avoid cold drinks and heavy meals</li>
                    <li>• Take a warm shower after 2-3 hours</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Status */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Booking Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {booking.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Booking ID</span>
                  <span className="text-sm font-mono text-gray-900">
                    {booking._id.slice(-8)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm text-gray-900">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              
              <div className="space-y-3">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Booking
                </Button>
                
                <Button
                  onClick={() => navigate('/patient/dashboard')}
                  className="w-full"
                >
                  View Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>

            {/* Contact Information */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Need Help?
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">For questions or changes:</p>
                  <p className="font-medium text-gray-900">{booking.centerId.phone}</p>
                </div>
                
                <div>
                  <p className="text-gray-600">Email support:</p>
                  <p className="font-medium text-gray-900">support@panchkarma.com</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
