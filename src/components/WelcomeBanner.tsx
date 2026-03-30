import React from 'react';
import { Sparkles, Sun, Moon, CloudSun, Coffee } from 'lucide-react';

interface WelcomeBannerProps {
  userName: string;
  coursesInProgress?: number;
  currentStreak?: number;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  userName,
  coursesInProgress = 0,
  currentStreak = 0
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return { text: 'Good Night', icon: Moon, color: 'from-indigo-500 to-purple-600' };
    if (hour < 12) return { text: 'Good Morning', icon: Sun, color: 'from-amber-400 to-orange-500' };
    if (hour < 17) return { text: 'Good Afternoon', icon: CloudSun, color: 'from-blue-400 to-cyan-500' };
    if (hour < 21) return { text: 'Good Evening', icon: Coffee, color: 'from-purple-500 to-pink-500' };
    return { text: 'Good Night', icon: Moon, color: 'from-indigo-500 to-purple-600' };
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "The expert in anything was once a beginner.",
      "Learning never exhausts the mind.",
      "Every accomplishment starts with the decision to try.",
      "The beautiful thing about learning is that no one can take it away from you.",
      "Knowledge is power. Information is liberating.",
      "Education is the passport to the future.",
      "The more you learn, the more you earn.",
      "Success is the sum of small efforts repeated day in and day out.",
    ];
    // Use date as seed for consistent daily quote
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return quotes[dayOfYear % quotes.length];
  };

  const greeting = getGreeting();
  const Icon = greeting.icon;
  const firstName = userName.split(' ')[0];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${greeting.color} p-6 text-white shadow-lg`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white" />
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white" />
      </div>

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                {greeting.text}, {firstName}!
              </h2>
              <p className="text-white/80 text-sm flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                {getMotivationalQuote()}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4">
          {coursesInProgress > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-bold">{coursesInProgress}</p>
              <p className="text-xs text-white/80">In Progress</p>
            </div>
          )}
          {currentStreak > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-bold flex items-center justify-center gap-1">
                {currentStreak}
                <span className="text-amber-300 animate-pulse">🔥</span>
              </p>
              <p className="text-xs text-white/80">Day Streak</p>
            </div>
          )}
        </div>
      </div>

      {/* Today's Focus Suggestion */}
      <div className="relative mt-4 pt-4 border-t border-white/20">
        <p className="text-sm text-white/90">
          <span className="font-medium">Today's suggestion:</span>{' '}
          {coursesInProgress > 0
            ? "Continue where you left off and keep the momentum going!"
            : "Start a new course or explore the catalog to begin your learning journey!"}
        </p>
      </div>
    </div>
  );
};

export default WelcomeBanner;
