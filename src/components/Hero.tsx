import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import DemoModal from './DemoModal';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const [isDemoModalOpen, setIsDemoModalOpen] = React.useState(false);
  
  const stats = [
    { value: '10,000+', label: 'Courses Generated' },
    { value: '95%', label: 'Learning Efficiency' },
    { value: '50+', label: 'Languages Supported' }
  ];

  const features = [
    { text: 'Free', description: 'No credit card required' },
    { text: 'Instant', description: 'Generate courses in seconds' },
    { text: 'Smart', description: 'AI-powered optimization' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Learning Journey?
          </h1>
          
          <p className="text-xl text-gray-600 mb-12">
            Join thousands of learners who create AI-powered courses in minutes, not hours.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <button
              onClick={onGetStarted}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>Start Creating Now</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setIsDemoModalOpen(true)}
              className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              View Examples
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                <Check className="h-5 w-5 text-green-500" />
                <div className="text-left">
                  <div className="font-medium">{feature.text}</div>
                  <div className="text-sm text-gray-500">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">Proven Results</p>
            <p className="text-gray-700 mt-2">
              Our AI-powered tools help students improve performance and retention.
            </p>
          </div>
        </div>
      </div>

      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
};

export default Hero;