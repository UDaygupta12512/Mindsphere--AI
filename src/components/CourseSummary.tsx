import React, { useState } from 'react';
import { BookOpen, Clock, Target, CheckCircle, ChevronDown, ChevronUp, Lightbulb, Award } from 'lucide-react';

interface CourseSummaryProps {
  title: string;
  summary: string;
  whatYouLearn: string[];
  requirements: string[];
  topics: string[];
  duration: string;
  totalLessons: number;
  level: string;
}

const CourseSummary: React.FC<CourseSummaryProps> = ({
  title,
  summary,
  whatYouLearn,
  requirements,
  topics,
  duration,
  totalLessons,
  level
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('summary');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Course Summary</h2>
        <p className="text-blue-100 text-sm">{title}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Clock className="h-4 w-4 text-blue-600 mr-1" />
            <span className="text-sm font-semibold text-gray-900">{duration}</span>
          </div>
          <span className="text-xs text-gray-500">Duration</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <BookOpen className="h-4 w-4 text-purple-600 mr-1" />
            <span className="text-sm font-semibold text-gray-900">{totalLessons}</span>
          </div>
          <span className="text-xs text-gray-500">Lessons</span>
        </div>
        <div className="text-center">
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getLevelColor(level)}`}>
            {level}
          </span>
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="divide-y divide-gray-100">
        {/* Summary Section */}
        <div className="p-4">
          <button
            type="button"
            onClick={() => toggleSection('summary')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Lightbulb className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-semibold text-gray-900">Overview</span>
            </div>
            {expandedSection === 'summary' ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
          {expandedSection === 'summary' && (
            <div className="mt-4 pl-12">
              <p className="text-gray-600 leading-relaxed">{summary}</p>
            </div>
          )}
        </div>

        {/* What You'll Learn Section */}
        <div className="p-4">
          <button
            type="button"
            onClick={() => toggleSection('learn')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <span className="font-semibold text-gray-900">What You'll Learn</span>
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                {whatYouLearn.length} skills
              </span>
            </div>
            {expandedSection === 'learn' ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
          {expandedSection === 'learn' && (
            <div className="mt-4 pl-12 space-y-3">
              {whatYouLearn.map((item, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Requirements Section */}
        <div className="p-4">
          <button
            type="button"
            onClick={() => toggleSection('requirements')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-3">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
              <span className="font-semibold text-gray-900">Requirements</span>
            </div>
            {expandedSection === 'requirements' ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
          {expandedSection === 'requirements' && (
            <div className="mt-4 pl-12 space-y-3">
              {requirements.length > 0 ? (
                requirements.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="h-2 w-2 bg-orange-400 rounded-full mr-3 mt-2"></div>
                    <span className="text-gray-600">{item}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No specific requirements</p>
              )}
            </div>
          )}
        </div>

        {/* Topics Covered */}
        <div className="p-4">
          <button
            type="button"
            onClick={() => toggleSection('topics')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <span className="font-semibold text-gray-900">Topics Covered</span>
              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                {topics.length} topics
              </span>
            </div>
            {expandedSection === 'topics' ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
          {expandedSection === 'topics' && (
            <div className="mt-4 pl-12">
              <div className="flex flex-wrap gap-2">
                {topics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 text-sm rounded-full border border-blue-100"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Takeaways Footer */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-blue-100">
        <div className="flex items-center text-sm text-gray-600">
          <Lightbulb className="h-4 w-4 text-yellow-500 mr-2" />
          <span>Complete this course to earn a certificate of completion</span>
        </div>
      </div>
    </div>
  );
};

export default CourseSummary;
