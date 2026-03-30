import React from 'react';
import { Flame, Calendar, Award, TrendingUp } from 'lucide-react';

interface LearningStreakProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
}

const LearningStreak: React.FC<LearningStreakProps> = ({
  currentStreak = 0,
  longestStreak = 0,
  lastActivityDate
}) => {
  const getStreakMessage = () => {
    if (currentStreak === 0) return "Start your streak today!";
    if (currentStreak === 1) return "Great start! Keep it going!";
    if (currentStreak < 7) return "You're building momentum!";
    if (currentStreak < 14) return "One week strong!";
    if (currentStreak < 30) return "You're on fire!";
    if (currentStreak < 100) return "Incredible dedication!";
    return "Legendary learner!";
  };

  const getStreakColor = () => {
    if (currentStreak === 0) return 'text-gray-400';
    if (currentStreak < 7) return 'text-orange-400';
    if (currentStreak < 30) return 'text-orange-500';
    return 'text-orange-600';
  };

  const getFlameSize = () => {
    if (currentStreak === 0) return 'h-8 w-8';
    if (currentStreak < 7) return 'h-10 w-10';
    if (currentStreak < 30) return 'h-12 w-12';
    return 'h-14 w-14';
  };

  // Generate last 7 days for the mini calendar
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const isActiveDay = (date: Date) => {
    if (!lastActivityDate) return false;
    const lastActive = new Date(lastActivityDate);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff < currentStreak;
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-lg border border-orange-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Learning Streak
        </h3>
        {currentStreak > 0 && currentStreak === longestStreak && (
          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
            <Award className="h-3 w-3" />
            Personal Best!
          </span>
        )}
      </div>

      {/* Main Streak Display */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div className={`${getStreakColor()} animate-pulse`}>
            <Flame className={`${getFlameSize()} mx-auto transition-all duration-300`} />
          </div>
          {currentStreak > 0 && (
            <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {currentStreak}
            </div>
          )}
        </div>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
        </p>
        <p className="text-sm text-gray-600">{getStreakMessage()}</p>
      </div>

      {/* Mini Calendar */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          {last7Days.map((date, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-xs text-gray-400 mb-1">{getDayName(date)}</span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                  isActiveDay(date)
                    ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white'
                    : date.toDateString() === new Date().toDateString()
                    ? 'bg-orange-100 text-orange-600 border-2 border-orange-300'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-orange-200">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Current</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{currentStreak}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
            <Award className="h-4 w-4" />
            <span className="text-xs">Longest</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{longestStreak}</p>
        </div>
      </div>

      {/* Encouragement for no streak */}
      {currentStreak === 0 && (
        <div className="mt-4 p-3 bg-white/50 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            Complete a lesson today to start your streak!
          </p>
        </div>
      )}
    </div>
  );
};

export default LearningStreak;
