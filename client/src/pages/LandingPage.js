import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Heart, 
  Calendar, 
  Users, 
  BarChart3, 
  Shield, 
  Clock,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

const LandingPage = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <Heart className="w-8 h-8 text-primary-600" />,
      title: 'Personalized Therapy',
      description: 'AI-powered therapy recommendations based on your health profile and specific conditions.'
    },
    {
      icon: <Calendar className="w-8 h-8 text-primary-600" />,
      title: 'Easy Scheduling',
      description: 'Book your sessions with qualified practitioners at convenient times and locations.'
    },
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: 'Expert Practitioners',
      description: 'Connect with certified Panchkarma practitioners and experienced healthcare professionals.'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary-600" />,
      title: 'Progress Tracking',
      description: 'Monitor your healing journey with detailed progress reports and recovery analytics.'
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: 'Secure & Private',
      description: 'Your health data is protected with enterprise-grade security and privacy measures.'
    },
    {
      icon: <Clock className="w-8 h-8 text-primary-600" />,
      title: '24/7 Support',
      description: 'Get help whenever you need it with our round-the-clock customer support team.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      content: 'The therapy recommendations were spot-on for my digestive issues. I feel so much better after just 3 sessions!',
      rating: 5
    },
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Practitioner',
      content: 'This platform has revolutionized how I manage my patients. The scheduling and progress tracking features are excellent.',
      rating: 5
    },
    {
      name: 'Maria Garcia',
      role: 'Patient',
      content: 'The booking process was so smooth, and the reminders helped me never miss a session. Highly recommended!',
      rating: 5
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Patients' },
    { number: '500+', label: 'Certified Practitioners' },
    { number: '50+', label: 'Therapy Centers' },
    { number: '98%', label: 'Success Rate' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-primary-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your Health with
              <span className="text-gradient block">Panchkarma Therapy</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Experience the ancient wisdom of Ayurveda with modern technology. 
              Get personalized therapy recommendations, book sessions with expert practitioners, 
              and track your healing journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to={user.userType === 'patient' ? '/patient/dashboard' : '/practitioner/dashboard'}>
                  <Button size="large" className="w-full sm:w-auto">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/signup">
                    <Button size="large" className="w-full sm:w-auto">
                      Get Started
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="large" className="w-full sm:w-auto">
                      Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Panchkarma?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We combine traditional Ayurvedic wisdom with cutting-edge technology 
              to provide the best healing experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started with your healing journey in just a few simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Complete Health Intake
              </h3>
              <p className="text-gray-600">
                Fill out a comprehensive health questionnaire to help us understand your specific needs and conditions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Get Therapy Recommendations
              </h3>
              <p className="text-gray-600">
                Our AI system analyzes your profile and recommends the most suitable Panchkarma therapies for you.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Book & Track Progress
              </h3>
              <p className="text-gray-600">
                Schedule sessions with qualified practitioners and monitor your healing progress with detailed analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied patients and practitioners who trust Panchkarma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} hover>
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Healing Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of people who have transformed their health with Panchkarma therapy.
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button variant="secondary" size="large" className="w-full sm:w-auto">
                  Get Started Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="large" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary-600">
                  Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="text-xl font-bold">Panchkarma</span>
              </div>
              <p className="text-gray-400">
                Transforming healthcare with ancient wisdom and modern technology.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Patients</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Find Centers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Therapy Guide</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Practitioners</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Join as Practitioner</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Training Programs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resources</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Panchkarma Patient Management. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
