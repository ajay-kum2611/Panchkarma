import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  TrendingUp,
  Heart,
  Activity,
  CheckCircle,
  AlertCircle,
  Plus,
  BarChart3,
  Target,
  Award
} from 'lucide-react';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ProgressChart from '../../components/Charts/ProgressChart';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get(`/patients/dashboard/${user.id}`);
      setDashboardData(response.data.dashboard);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {status.replace('-', ' ')}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
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

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600">Unable to load dashboard data</p>
        </div>
      </div>
    );
  }

  const { patient, upcomingSessions, pastSessions, progress, feedbackData } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {patient.name}!
          </h1>
          <p className="text-gray-600">
            Track your healing journey and manage your therapy sessions
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/patient/booking">
            <Card hover className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Book Session</h3>
              <p className="text-gray-600">Schedule your next therapy session</p>
            </Card>
          </Link>
          
          <Link to="/patient/health-intake">
            <Card hover className="text-center">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-success-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Health Intake</h3>
              <p className="text-gray-600">Update your health information</p>
            </Card>
          </Link>
          
          <Link to="/patient/profile">
            <Card hover className="text-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-secondary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile</h3>
              <p className="text-gray-600">Manage your account settings</p>
            </Card>
          </Link>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{progress.totalSessions}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{progress.completedSessions}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900">{progress.progressPercentage}%</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assigned Therapy</p>
                <p className="text-lg font-semibold text-gray-900">{patient.assignedTherapy || 'Not assigned'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Chart */}
        {feedbackData && feedbackData.length > 0 && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
                Progress Tracking
              </h2>
            </div>
            <ProgressChart data={feedbackData} />
          </Card>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'upcoming', label: 'Upcoming Sessions', icon: Calendar },
              { id: 'history', label: 'Session History', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Sessions */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h3>
                <Link to="/patient/booking">
                  <Button size="small">
                    <Plus className="w-4 h-4 mr-1" />
                    Book New
                  </Button>
                </Link>
              </div>
              
              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.slice(0, 3).map((session) => (
                    <div key={session._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{session.therapyType}</h4>
                        {getStatusBadge(session.status)}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(session.sessionDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{session.centerId?.name}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          <span>{session.practitionerId?.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {upcomingSessions.length > 3 && (
                    <div className="text-center">
                      <Link to="/patient/sessions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View all {upcomingSessions.length} upcoming sessions
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h4>
                  <p className="text-gray-600 mb-4">Book your first therapy session to get started</p>
                  <Link to="/patient/booking">
                    <Button>Book Session</Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Recent Progress */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Progress</h3>
              
              {feedbackData && feedbackData.length > 0 ? (
                <div className="space-y-4">
                  {feedbackData.slice(-3).reverse().map((feedback) => (
                    <div key={feedback._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Session {feedback.sessionNumber}</h4>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{feedback.improvements}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{formatDate(feedback.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No progress data yet</h4>
                  <p className="text-gray-600">Complete your first session to see progress tracking</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'upcoming' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Upcoming Sessions</h3>
            
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-semibold text-gray-900">{session.therapyType}</h4>
                      {getStatusBadge(session.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(session.sessionDate)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{session.centerId?.name}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <User className="w-4 h-4 mr-2" />
                          <span>{session.practitionerId?.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    {session.notes && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700">{session.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-3">
                      <Button variant="outline" size="small">
                        Reschedule
                      </Button>
                      <Button variant="danger" size="small">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-medium text-gray-900 mb-2">No upcoming sessions</h4>
                <p className="text-gray-600 mb-6">Book your first therapy session to get started</p>
                <Link to="/patient/booking">
                  <Button size="large">Book Session</Button>
                </Link>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'history' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Session History</h3>
            
            {pastSessions.length > 0 ? (
              <div className="space-y-4">
                {pastSessions.map((session) => (
                  <div key={session._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-semibold text-gray-900">{session.therapyType}</h4>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(session.status)}
                        {session.feedbackId && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Feedback Given
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(session.sessionDate)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{session.centerId?.name}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <User className="w-4 h-4 mr-2" />
                          <span>{session.practitionerId?.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    {session.feedbackId ? (
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-sm text-green-800">Thank you for providing feedback!</p>
                      </div>
                    ) : (
                      <div className="flex space-x-3">
                        <Button size="small">
                          Provide Feedback
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-medium text-gray-900 mb-2">No session history</h4>
                <p className="text-gray-600">Your completed sessions will appear here</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
