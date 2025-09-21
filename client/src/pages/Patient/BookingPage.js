import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const BookingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingData, setBookingData] = useState({
    therapyType: user.assignedTherapy || '',
    totalSessions: 5,
    notes: ''
  });

  useEffect(() => {
    fetchCenters();
    
    // If center was pre-selected from therapy recommendation
    if (location.state?.center) {
      setSelectedCenter(location.state.center);
    }
  }, [location.state]);

  // const fetchCenters = async () => {
  //   try {
  //     const response = await api.get('/centers');
  //     setCenters(response.data.centers);
  //   } catch (error) {
  //     console.error('Error fetching centers:', error);
  //     toast.error('Failed to fetch centers');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchCenters = async () => {
  try {
    const response = await api.get('/centers');
    console.log("Centers API response:", response.data); // 👀 Debug

    // Adjust this line depending on API shape
    const centersData = response.data.centers || response.data || [];
    setCenters(centersData);
  } catch (error) {
    console.error('Error fetching centers:', error);
    toast.error('Failed to fetch centers');
  } finally {
    setLoading(false);
  }
};


  const fetchAvailableSlots = async (centerId, date) => {
    try {
      const response = await api.get(`/centers/${centerId}`);
      const center = response.data.center;
      
      // Filter slots for the selected date
      const slotsForDate = center.availableSlots.find(slot => {
        const slotDate = new Date(slot.date).toDateString();
        const selectedDateStr = new Date(date).toDateString();
        return slotDate === selectedDateStr;
      });

      if (slotsForDate) {
        setAvailableSlots(slotsForDate.timeSlots.filter(slot => slot.isAvailable));
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to fetch available slots');
    }
  };

  const handleCenterSelect = (center) => {
    setSelectedCenter(center);
    setSelectedDate('');
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (selectedCenter) {
      fetchAvailableSlots(selectedCenter._id, date);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCenter || !selectedDate || !selectedSlot) {
      toast.error('Please select a center, date, and time slot');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/bookings/create', {
        centerId: selectedCenter._id,
        therapyType: bookingData.therapyType,
        sessionDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        totalSessions: bookingData.totalSessions,
        notes: bookingData.notes
      });

      toast.success('Booking created successfully!');
      navigate(`/patient/booking-confirmation/${response.data.booking._id}`);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const getNext30Days = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book Your Therapy Session
          </h1>
          <p className="text-gray-600">
            Select a center, date, and time for your Panchkarma therapy session
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Selection Steps */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Select Center */}
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                  1. Select Center
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {centers.map((center) => (
                    <div
                      key={center._id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedCenter?._id === center._id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleCenterSelect(center)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{center.name}</h3>
                        {selectedCenter?._id === center._id && (
                          <CheckCircle className="w-5 h-5 text-primary-600" />
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{center.city}, {center.state}</span>
                        </div>
                        {center.phone && (
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            <span>{center.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Available Therapies:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {center.therapies?.slice(0, 3).map((therapy, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                            >
                              {therapy}
                            </span>
                          ))}
                          {center.therapies?.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              +{center.therapies.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Step 2: Select Date */}
              {selectedCenter && (
                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                    2. Select Date
                  </h2>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {getNext30Days().map((date) => (
                      <button
                        key={date.toISOString()}
                        type="button"
                        onClick={() => handleDateSelect(date.toISOString().split('T')[0])}
                        className={`p-3 text-center rounded-lg border transition-colors ${
                          selectedDate === date.toISOString().split('T')[0]
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium">
                          {formatDate(date)}
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Step 3: Select Time Slot */}
              {selectedDate && (
                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-primary-600" />
                    3. Select Time Slot
                  </h2>
                  
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSlotSelect(slot)}
                          className={`p-3 text-center rounded-lg border transition-colors ${
                            selectedSlot === slot
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No available slots for this date</p>
                      <p className="text-sm text-gray-500">Please select a different date</p>
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* Right Column - Booking Summary */}
            <div className="space-y-6">
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Booking Summary
                </h2>
                
                <div className="space-y-4">
                  {/* Therapy Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Therapy Type
                    </label>
                    <input
                      type="text"
                      value={bookingData.therapyType}
                      onChange={(e) => setBookingData(prev => ({ ...prev, therapyType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter therapy type"
                      required
                    />
                  </div>

                  {/* Total Sessions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Sessions
                    </label>
                    <select
                      value={bookingData.totalSessions}
                      onChange={(e) => setBookingData(prev => ({ ...prev, totalSessions: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value={5}>5 sessions</option>
                      <option value={7}>7 sessions</option>
                      <option value={10}>10 sessions</option>
                      <option value={15}>15 sessions</option>
                      <option value={21}>21 sessions</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={bookingData.notes}
                      onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Any special requirements or notes..."
                    />
                  </div>
                </div>
              </Card>

              {/* Selected Details */}
              {(selectedCenter || selectedDate || selectedSlot) && (
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Selected Details
                  </h3>
                  
                  <div className="space-y-3">
                    {selectedCenter && (
                      <div>
                        <p className="text-sm text-gray-600">Center</p>
                        <p className="font-medium text-gray-900">{selectedCenter.name}</p>
                        <p className="text-sm text-gray-600">{selectedCenter.city}, {selectedCenter.state}</p>
                      </div>
                    )}
                    
                    {selectedDate && (
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(new Date(selectedDate))}
                        </p>
                      </div>
                    )}
                    
                    {selectedSlot && (
                      <div>
                        <p className="text-sm text-gray-600">Time</p>
                        <p className="font-medium text-gray-900">
                          {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  size="large"
                  loading={submitting}
                  disabled={!selectedCenter || !selectedDate || !selectedSlot || submitting}
                >
                  {submitting ? 'Creating Booking...' : 'Confirm Booking'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/patient/dashboard')}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
