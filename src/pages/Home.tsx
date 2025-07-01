import React from 'react';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  ChartBarIcon, 
  MapIcon, 
  CameraIcon,
  HeartIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  const features = [
    {
      icon: SparklesIcon,
      title: 'Plant & Track Trees',
      description: 'Register new trees and monitor their growth over time with detailed measurements and photos.'
    },
    {
      icon: MapIcon,
      title: 'Interactive Map',
      description: 'View all your trees on an interactive map with health status indicators and location tracking.'
    },
    {
      icon: ChartBarIcon,
      title: 'Growth Analytics',
      description: 'Track tree growth with measurements, care activities, and health status monitoring.'
    },
    {
      icon: CameraIcon,
      title: 'Photo Documentation',
      description: 'Document your tree journey with progress photos and care activity records.'
    },
    {
      icon: HeartIcon,
      title: 'Care Management',
      description: 'Log watering, fertilizing, pruning, and other care activities for each tree.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Environmental Impact',
      description: 'Contribute to a greener campus and track your environmental impact through tree planting.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="h-24 w-24 bg-forest-green rounded-full flex items-center justify-center">
                <span className="text-white text-4xl">🌳</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="text-forest-green">Green Campus</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join the movement to create a greener, more sustainable campus. Plant trees, track their growth, 
              and contribute to environmental conservation with our comprehensive tree management platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-3 inline-block"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="btn-secondary text-lg px-8 py-3 inline-block"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Trees
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools you need to plant, track, and care for trees 
              while contributing to a sustainable environment.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-center h-16 w-16 bg-forest-green rounded-lg mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-forest-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Green Journey?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already making a difference by planting and caring for trees.
          </p>
          <Link
            to="/register"
            className="bg-white text-forest-green hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200 inline-block"
          >
            Create Your Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 Green Campus Initiative. Making the world greener, one tree at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home; 