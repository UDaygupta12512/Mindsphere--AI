import React from 'react';
import { UserPoints } from '../types/achievement';
import { Zap, Award, Trophy, Star } from 'lucide-react';

interface PointsDisplayProps {
  points: UserPoints;
  showDetails?: boolean;
}

export const PointsDisplay: React.FC<PointsDisplayProps> = ({ 
  points, 
  showDetails = false 
}) => {
  const progress = Math.min(
    100, 
    ((points.total - points.currentLevelPoints) / 
    (points.nextLevelPoints - points.currentLevelPoints)) * 100
  );

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2.5 rounded-xl mr-4 shadow-lg shadow-orange-200">
            <Zap className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">MindSphere XP</h3>
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600">{points.total}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-bold text-sm mb-1">
            <Trophy className="w-4 h-4" /> Level {points.level}
          </div>
          <div className="text-xs font-semibold text-gray-500">
            {points.nextLevelPoints - points.total} XP to Level {points.level + 1}
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-3 mb-4 shadow-inner overflow-hidden relative">
        <div 
          className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out relative" 
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Points Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center">
                <Trophy className="w-4 h-4 text-yellow-500 mr-2" />
                <span>Course Completions</span>
              </div>
              <span className="font-medium">+{points.byCategory.courseCompletion}</span>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-blue-500 mr-2" />
                <span>Participation</span>
              </div>
              <span className="font-medium">+{points.byCategory.participation}</span>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center">
                <Award className="w-4 h-4 text-green-500 mr-2" />
                <span>Daily Login</span>
              </div>
              <span className="font-medium">+{points.byCategory.dailyLogin}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsDisplay;
