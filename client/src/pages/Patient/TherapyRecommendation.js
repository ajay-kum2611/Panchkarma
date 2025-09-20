import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { 
  Heart, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  MapPin,
  Phone,
  Star,
  Calendar
} from 'lucide-react';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const TherapyRecommendation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);

  useEffect(() => {
    fetchRecommendations();
    fetchCenters();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await api.post('/therapy/recommend', {
        problems: user.problems || [],
        diseases: user.diseases || [],
        age: user.age,
        gender: user.gender
      });
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to fetch therapy recommendations');
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await api.get('/centers');
      setCenters(response.data.centers);
    } catch (error) {
      console.error('Error fetching centers:', error);
      toast.error('Failed to fetch centers');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = () => {
    if (selectedCenter) {
      navigate('/patient/booking', { state: { center: selectedCenter } });
    } else {
      navigate('/patient/booking');
    }
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Personalized Therapy Recommendations
          </h1>
          <p className="text-gray-600">
            Based on your health profile, we recommend the following Panchkarma therapies
          </p>
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {recommendations.map((therapy, index) => (
            <Card key={index} hover className="h-full">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {therapy.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {therapy.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Duration: {therapy.duration}</span>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Benefits:</p>
                      <div className="flex flex-wrap gap-2">
                        {therapy.benefits.map((benefit, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-success-100 text-success-800"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Centers */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Available Therapy Centers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {centers.map((center) => (
              <Card
                key={center._id}
                hover
                className={`cursor-pointer transition-all duration-200 ${
                  selectedCenter?._id === center._id
                    ? 'ring-2 ring-primary-500 bg-primary-50'
                    : ''
                }`}
                onClick={() => setSelectedCenter(center)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {center.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{center.city}, {center.state}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                    <span>4.8</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">{center.address}</span>
                  </div>
                  {center.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{center.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Available Therapies:</p>
                  <div className="flex flex-wrap gap-1">
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
                        +{center.therapies.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                {selectedCenter?._id === center._id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-primary-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span>Selected</span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleBookSession}
            size="large"
            className="w-full sm:w-auto"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Book Your Session
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/patient/dashboard')}
            size="large"
            className="w-full sm:w-auto"
          >
            View Dashboard
          </Button>
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-primary-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What to Expect
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Before Your Session:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Arrive 15 minutes early</li>
                <li>• Wear comfortable, loose clothing</li>
                <li>• Avoid heavy meals 2 hours before</li>
                <li>• Bring a water bottle</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">After Your Session:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Rest for the remainder of the day</li>
                <li>• Drink plenty of warm water</li>
                <li>• Eat light, easily digestible food</li>
                <li>• Avoid cold drinks and heavy meals</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapyRecommendation;
