import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

const PatientProfile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>
        
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Name" value={user?.name || ''} />
            <Input label="Email" value={user?.email || ''} />
            <Input label="Phone" value={user?.phone || ''} />
            <Input label="Age" value={user?.age || ''} />
            <Input label="Gender" value={user?.gender || ''} />
            <Input label="Location" value={user?.location || ''} />
          </div>
          <div className="mt-6">
            <Button>Update Profile</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PatientProfile;
