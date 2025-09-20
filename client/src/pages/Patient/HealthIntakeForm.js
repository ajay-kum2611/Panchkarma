import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { 
  User, 
  Calendar, 
  MapPin, 
  Heart, 
  AlertTriangle,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const HealthIntakeForm = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    location: '',
    problems: [],
    diseases: []
  });

  const [currentProblem, setCurrentProblem] = useState('');
  const [currentDisease, setCurrentDisease] = useState('');

  const commonProblems = [
    'Digestive issues', 'Constipation', 'Indigestion', 'Acid reflux',
    'Asthma', 'Bronchitis', 'Sinusitis', 'Allergies',
    'Psoriasis', 'Eczema', 'Acne',
    'Arthritis', 'Back pain', 'Joint pain',
    'Migraine', 'Anxiety', 'Depression', 'Insomnia',
    'Stress', 'Fatigue', 'Low immunity'
  ];

  const commonDiseases = [
    'Diabetes', 'Hypertension', 'Thyroid disorders', 'Heart disease',
    'Kidney disease', 'Liver disease', 'Autoimmune disorders',
    'Chronic fatigue syndrome', 'Fibromyalgia', 'IBS'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const addProblem = () => {
    if (currentProblem.trim() && !formData.problems.includes(currentProblem.trim())) {
      setFormData(prev => ({
        ...prev,
        problems: [...prev.problems, currentProblem.trim()]
      }));
      setCurrentProblem('');
    }
  };

  const removeProblem = (problem) => {
    setFormData(prev => ({
      ...prev,
      problems: prev.problems.filter(p => p !== problem)
    }));
  };

  const addDisease = () => {
    if (currentDisease.trim() && !formData.diseases.includes(currentDisease.trim())) {
      setFormData(prev => ({
        ...prev,
        diseases: [...prev.diseases, currentDisease.trim()]
      }));
      setCurrentDisease('');
    }
  };

  const removeDisease = (disease) => {
    setFormData(prev => ({
      ...prev,
      diseases: prev.diseases.filter(d => d !== disease)
    }));
  };

  const addCommonProblem = (problem) => {
    if (!formData.problems.includes(problem)) {
      setFormData(prev => ({
        ...prev,
        problems: [...prev.problems, problem]
      }));
    }
  };

  const addCommonDisease = (disease) => {
    if (!formData.diseases.includes(disease)) {
      setFormData(prev => ({
        ...prev,
        diseases: [...prev.diseases, disease]
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || formData.age < 1 || formData.age > 120) {
      newErrors.age = 'Please enter a valid age (1-120)';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.problems.length === 0) {
      newErrors.problems = 'Please add at least one health problem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Submit health intake form
      await api.post('/patients/form', {
        age: parseInt(formData.age),
        gender: formData.gender,
        location: formData.location.trim(),
        problems: formData.problems,
        diseases: formData.diseases
      });

      // Update user context
      updateUser({
        age: parseInt(formData.age),
        gender: formData.gender,
        location: formData.location.trim(),
        problems: formData.problems,
        diseases: formData.diseases
      });

      toast.success('Health intake form submitted successfully!');
      navigate('/patient/therapy-recommendation');
    } catch (error) {
      console.error('Health intake error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit health intake form');
    } finally {
      setLoading(false);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Health Intake Form
          </h1>
          <p className="text-gray-600">
            Help us understand your health condition to provide personalized therapy recommendations
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Age"
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Enter your age"
                    error={errors.age}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-error-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-sm text-error-600 mt-1">{errors.gender}</p>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <Input
                  label="Location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter your city and state"
                  error={errors.location}
                  required
                />
              </div>
            </div>

            {/* Health Problems */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-primary-600" />
                Health Problems & Symptoms
              </h2>
              
              {/* Current Problems */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a health problem or symptom"
                    value={currentProblem}
                    onChange={(e) => setCurrentProblem(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addProblem}
                    disabled={!currentProblem.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Common Problems */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Common problems (click to add):</p>
                <div className="flex flex-wrap gap-2">
                  {commonProblems.map((problem) => (
                    <button
                      key={problem}
                      type="button"
                      onClick={() => addCommonProblem(problem)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        formData.problems.includes(problem)
                          ? 'bg-primary-100 border-primary-300 text-primary-700'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {problem}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Problems */}
              {formData.problems.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected problems:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.problems.map((problem) => (
                      <span
                        key={problem}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                      >
                        {problem}
                        <button
                          type="button"
                          onClick={() => removeProblem(problem)}
                          className="ml-2 text-primary-600 hover:text-primary-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {errors.problems && (
                <p className="text-sm text-error-600 mt-1">{errors.problems}</p>
              )}
            </div>

            {/* Diseases */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-primary-600" />
                Existing Medical Conditions
              </h2>
              
              {/* Current Diseases */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a medical condition"
                    value={currentDisease}
                    onChange={(e) => setCurrentDisease(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addDisease}
                    disabled={!currentDisease.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Common Diseases */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Common conditions (click to add):</p>
                <div className="flex flex-wrap gap-2">
                  {commonDiseases.map((disease) => (
                    <button
                      key={disease}
                      type="button"
                      onClick={() => addCommonDisease(disease)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        formData.diseases.includes(disease)
                          ? 'bg-primary-100 border-primary-300 text-primary-700'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {disease}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Diseases */}
              {formData.diseases.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected conditions:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.diseases.map((disease) => (
                      <span
                        key={disease}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                      >
                        {disease}
                        <button
                          type="button"
                          onClick={() => removeDisease(disease)}
                          className="ml-2 text-primary-600 hover:text-primary-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                size="large"
                loading={loading}
                disabled={loading}
              >
                Get Therapy Recommendations
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default HealthIntakeForm;
