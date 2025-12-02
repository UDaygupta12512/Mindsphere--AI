import React from 'react';
import { Achievement } from '../types/achievement';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';
import { Trophy, Award, Star, Zap } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const getIcon = (type: Achievement['type']) => {
  switch (type) {
    case 'course_completion':
      return <Trophy className="w-5 h-5" />;
    case 'milestone':
      return <Award className="w-5 h-5" />;
    case 'streak':
      return <Zap className="w-5 h-5" />;
    default:
      return <Star className="w-5 h-5" />;
  }
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  achievement, 
  size = 'md',
  showTooltip = true
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-lg'
  };

  const badge = (
    <div 
      className={`relative flex items-center justify-center rounded-full ${achievement.unlocked ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-gray-200'} 
      ${sizeClasses[size]} shadow-md border-2 ${achievement.unlocked ? 'border-amber-400' : 'border-gray-300'} 
      transition-all duration-200 ${achievement.unlocked ? 'hover:scale-105' : 'opacity-60'}`}
    >
      {achievement.unlocked ? (
        <>
          <div className="absolute inset-0 rounded-full bg-white opacity-10"></div>
          <div className="relative z-10 text-white">
            {getIcon(achievement.type)}
          </div>
          {achievement.points > 0 && (
            <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {achievement.points}
            </div>
          )}
        </>
      ) : (
        <div className="text-gray-400">
          <div className="w-3/4 h-3/4 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center">
            ?
          </div>
        </div>
      )}
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="text-center">
            <p className="font-bold">{achievement.title}</p>
            <p className="text-sm text-gray-600">{achievement.description}</p>
            {!achievement.unlocked && (
              <p className="mt-1 text-xs text-amber-600">
                {achievement.criteria.type === 'course_completion' 
                  ? `Complete a course to unlock`
                  : `Earn ${achievement.points} points to unlock`}
              </p>
            )}
            {achievement.unlocked && achievement.unlockedAt && (
              <p className="mt-1 text-xs text-gray-500">
                Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AchievementBadge;
