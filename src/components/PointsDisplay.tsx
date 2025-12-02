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
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="bg-indigo-100 p-2 rounded-full mr-3">
            <Zap className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Learning Points</h3>
            <p className="text-2xl font-bold text-indigo-700">{points.total}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Level {points.level}</div>
          <div className="text-xs text-gray-400">
            {points.nextLevelPoints - points.total} to next level
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
          style={{ width: `${progress}%` }}
        ></div>
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
