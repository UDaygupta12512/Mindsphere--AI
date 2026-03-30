import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, ChevronRight, Lightbulb, Target, Award, ArrowRight, Loader2, RefreshCcw } from 'lucide-react';
import { learningApi } from '../lib/api';

interface Recommendation {
  topic: string;
  reason: string;
  confidence: number;
  isTrending?: boolean;
  strength?: string;
}

interface CourseRecommenderProps {
  onCreateCourse?: () => void;
}

const CourseRecommender: React.FC<CourseRecommenderProps> = ({ onCreateCourse }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      const response = await learningApi.getRecommendations();
      setRecommendations(response.recommendations);
      setStrengths(response.strengths);
      setCompletedCount(response.completedCount);
      setInProgressCount(response.inProgressCount);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg border border-blue-200 p-8">
        <div className="text-center">
          <Target className="h-12 w-12 text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Learning Journey</h3>
          <p className="text-gray-600 text-sm mb-4">
            Complete a few courses to get personalized AI recommendations
          </p>
          {onCreateCourse && (
            <button
              onClick={onCreateCourse}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Create Your First Course
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">What Should I Learn Next?</h2>
              <p className="text-blue-100 text-sm">AI-powered recommendations just for you</p>
            </div>
          </div>
          <button
            onClick={loadRecommendations}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            title="Refresh recommendations"
          >
            <RefreshCcw className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Your Strengths */}
        {strengths.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Your Strengths</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {strengths.map((strength, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200"
                >
                  ⭐ {strength}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Progress Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
            <div className="text-xs text-gray-600">In Progress</div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Recommended For You</h3>
          </div>

          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="group relative bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-all cursor-pointer hover:shadow-md"
            >
              {/* Trending Badge */}
              {rec.isTrending && (
                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-400 to-pink-400 text-white text-xs font-bold rounded-full">
                    <TrendingUp className="h-3 w-3" />
                    Trending
                  </span>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 mb-1 text-lg">{rec.topic}</h4>
                  <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>

                  <div className="flex items-center gap-3">
                    {/* Confidence Bar */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Match</span>
                        <span className="font-semibold text-blue-600">{Math.round(rec.confidence)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${rec.confidence}%` }}
                        />
                      </div>
                    </div>

                    {/* Start Button */}
                    <button
                      onClick={onCreateCourse}
                      className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity group-hover:gap-2 text-sm"
                    >
                      <span>Start</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Ready to level up?</p>
                <p className="text-xs text-gray-600">Start learning and unlock new recommendations</p>
              </div>
            </div>
            {onCreateCourse && (
              <button
                onClick={onCreateCourse}
                className="flex items-center gap-1 text-indigo-600 font-medium text-sm hover:text-indigo-700 transition-colors"
              >
                <span>Create Course</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseRecommender;
