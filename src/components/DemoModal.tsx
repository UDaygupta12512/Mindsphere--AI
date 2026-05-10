import React, { useState } from 'react';
import { X, Play, Users, BookOpen, Brain, Award } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const [showDemoVideo, setShowDemoVideo] = useState(false);
  const demoVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';

  if (!isOpen) return null;

  const demoSteps = [
    {
      title: "Upload Your Content",
      description: "Simply paste a YouTube URL or upload a PDF document",
      icon: <BookOpen className="h-8 w-8 text-blue-600" />,
      image: "https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      title: "AI Processing",
      description: "Our advanced AI analyzes and extracts key concepts automatically",
      icon: <Brain className="h-8 w-8 text-purple-600" />,
      image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      title: "Interactive Learning",
      description: "Get structured notes, quizzes, flashcards, and AI tutoring",
      icon: <Users className="h-8 w-8 text-green-600" />,
      image: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      title: "Track Progress",
      description: "Monitor your learning journey with detailed analytics",
      icon: <Award className="h-8 w-8 text-orange-600" />,
      image: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  const exampleCourses = [
    {
      title: 'Python for Data Analysis',
      level: 'Beginner',
      outcome: ['8 lessons', '12 quizzes', '24 flashcards'],
      color: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'UI Design Systems',
      level: 'Intermediate',
      outcome: ['6 lessons', '9 quizzes', '18 flashcards'],
      color: 'from-emerald-500 to-teal-500'
    },
    {
      title: 'Machine Learning Basics',
      level: 'Beginner',
      outcome: ['10 lessons', '14 quizzes', '30 flashcards'],
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">How MindSphere AI Works</h2>
            <p className="text-gray-600">Transform any content into interactive courses in minutes</p>
          </div>
          <button
            aria-label="Close Demo Modal"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Demo Video Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl overflow-hidden">
              <div className="aspect-video flex items-center justify-center">
                {showDemoVideo ? (
                  <video
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    src={demoVideoUrl}
                  />
                ) : (
                  <button
                    onClick={() => setShowDemoVideo(true)}
                    aria-label="Play MindSphere AI demo"
                    className="group flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
                  >
                    <Play className="h-8 w-8 text-white ml-1 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-semibold">MindSphere AI Demo</h3>
                <p className="text-white/80 text-sm">See how AI transforms content into courses</p>
              </div>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">MindSphere AI Demo</h3>
              <p className="text-sm text-gray-600 mb-4">
                Watch the full flow: content intake, AI structuring, and instant learning assets.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-600" />YouTube or PDF input to lesson blueprint</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-600" />Auto quizzes, flashcards, and micro-syllabus</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-600" />Analytics + achievements on completion</li>
              </ul>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => setShowDemoVideo(true)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                >
                  Play Demo
                </button>
                <span className="text-xs text-gray-500">2 min overview</span>
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            From Content to Course in 4 Simple Steps
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {demoSteps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        {step.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h4 className="font-semibold text-gray-900">{step.title}</h4>
                      </div>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Example Courses */}
          <div className="mt-10">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Example Course Outputs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {exampleCourses.map((course, index) => (
                <div key={index} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  <div className={`h-24 bg-gradient-to-r ${course.color} p-4 text-white`}>
                    <p className="text-xs uppercase tracking-widest text-white/80">{course.level}</p>
                    <p className="text-lg font-semibold">{course.title}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-3">Generated in under 2 minutes</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {course.outcome.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Highlight */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4 text-center">What You Get</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">📝</div>
                <div className="text-sm text-gray-700 mt-1">Structured Notes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">🧠</div>
                <div className="text-sm text-gray-700 mt-1">Smart Quizzes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">🎯</div>
                <div className="text-sm text-gray-700 mt-1">Flashcards</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">🤖</div>
                <div className="text-sm text-gray-700 mt-1">AI Tutor</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Start Creating Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoModal; 