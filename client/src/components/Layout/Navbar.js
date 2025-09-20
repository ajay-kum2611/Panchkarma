import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    return user.userType === 'patient' ? '/patient/dashboard' : '/practitioner/dashboard';
  };

  const getProfilePath = () => {
    if (!user) return '/login';
    return user.userType === 'patient' ? '/patient/profile' : '/practitioner/profile';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-gradient">Panchkarma</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive(getDashboardPath())
                      ? 'text-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  Dashboard
                </Link>
                
                {user.userType === 'patient' && (
                  <>
                    <Link
                      to="/patient/health-intake"
                      className={`text-sm font-medium transition-colors duration-200 ${
                        isActive('/patient/health-intake')
                          ? 'text-primary-600'
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                    >
                      Health Intake
                    </Link>
                    <Link
                      to="/patient/booking"
                      className={`text-sm font-medium transition-colors duration-200 ${
                        isActive('/patient/booking')
                          ? 'text-primary-600'
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                    >
                      Book Session
                    </Link>
                  </>
                )}

                {user.userType === 'practitioner' && (
                  <>
                    <Link
                      to="/practitioner/patients"
                      className={`text-sm font-medium transition-colors duration-200 ${
                        isActive('/practitioner/patients')
                          ? 'text-primary-600'
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                    >
                      Patients
                    </Link>
                    <Link
                      to="/practitioner/schedule"
                      className={`text-sm font-medium transition-colors duration-200 ${
                        isActive('/practitioner/schedule')
                          ? 'text-primary-600'
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                    >
                      Schedule
                    </Link>
                    <Link
                      to="/practitioner/analytics"
                      className={`text-sm font-medium transition-colors duration-200 ${
                        isActive('/practitioner/analytics')
                          ? 'text-primary-600'
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                    >
                      Analytics
                    </Link>
                  </>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <span>{user.name}</span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        to={getProfilePath()}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              {user ? (
                <>
                  <Link
                    to={getDashboardPath()}
                    className="block text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  {user.userType === 'patient' && (
                    <>
                      <Link
                        to="/patient/health-intake"
                        className="block text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Health Intake
                      </Link>
                      <Link
                        to="/patient/booking"
                        className="block text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Book Session
                      </Link>
                    </>
                  )}

                  {user.userType === 'practitioner' && (
                    <>
                      <Link
                        to="/practitioner/patients"
                        className="block text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Patients
                      </Link>
                      <Link
                        to="/practitioner/schedule"
                        className="block text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Schedule
                      </Link>
                      <Link
                        to="/practitioner/analytics"
                        className="block text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Analytics
                      </Link>
                    </>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <Link
                      to={getProfilePath()}
                      className="block text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200 mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
