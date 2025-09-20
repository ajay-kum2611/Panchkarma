import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/UI/Card';

const PractitionerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Welcome, Dr. {user?.name}!
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Patients</h3>
            <p className="text-3xl font-bold text-primary-600">24</p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Today's Sessions</h3>
            <p className="text-3xl font-bold text-success-600">8</p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Rating</h3>
            <p className="text-3xl font-bold text-warning-600">4.8</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PractitionerDashboard;
