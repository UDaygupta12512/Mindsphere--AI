import React, { useState, useEffect } from 'react';
import { Target, Plus, Check, Trash2, Trophy, Flame } from 'lucide-react';

interface Goal {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface LearningGoalsProps {
  userName?: string;
}

const MOTIVATIONAL_MESSAGES = [
  "You're doing great! Keep pushing!",
  "Every lesson brings you closer to mastery!",
  "Consistency is key - you've got this!",
  "Small steps lead to big achievements!",
  "Your dedication is inspiring!",
  "Learning is a journey, enjoy the ride!",
];

const LearningGoals: React.FC<LearningGoalsProps> = ({ userName }) => {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('weeklyGoals');
    if (saved) {
      const parsed = JSON.parse(saved);
      const weekStart = getWeekStart();
      // Reset goals if it's a new week
      if (parsed.weekStart !== weekStart.toISOString()) {
        return [];
      }
      return parsed.goals || [];
    }
    return [];
  });
  const [newGoal, setNewGoal] = useState('');
  const [showInput, setShowInput] = useState(false);

  function getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  }

  useEffect(() => {
    const weekStart = getWeekStart();
    localStorage.setItem('weeklyGoals', JSON.stringify({
      weekStart: weekStart.toISOString(),
      goals
    }));
  }, [goals]);

  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, {
        id: Date.now().toString(),
        text: newGoal.trim(),
        completed: false,
        createdAt: new Date()
      }]);
      setNewGoal('');
      setShowInput(false);
    }
  };

  const toggleGoal = (id: string) => {
    setGoals(goals.map(goal =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const completedCount = goals.filter(g => g.completed).length;
  const progress = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;
  const motivationalMessage = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];

  const suggestedGoals = [
    "Complete 3 lessons",
    "Score 80%+ on a quiz",
    "Review 20 flashcards",
    "Finish a course module",
    "Study for 2 hours total",
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-500" />
          Weekly Goals
        </h3>
        {completedCount === goals.length && goals.length > 0 && (
          <div className="flex items-center gap-1 text-amber-500">
            <Trophy className="h-5 w-5" />
            <span className="text-sm font-medium">All done!</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {goals.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{completedCount} of {goals.length} completed</span>
            <span className="font-medium text-purple-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Motivational Message */}
      {goals.length > 0 && completedCount > 0 && (
        <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <p className="text-sm text-purple-700 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            {motivationalMessage}
          </p>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-2 mb-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              goal.completed ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <button
              onClick={() => toggleGoal(goal.id)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                goal.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 hover:border-purple-500'
              }`}
            >
              {goal.completed && <Check className="h-3 w-3 text-white" />}
            </button>
            <span className={`flex-1 text-sm ${goal.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
              {goal.text}
            </span>
            <button
              onClick={() => deleteGoal(goal.id)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Goal */}
      {showInput ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addGoal()}
            placeholder="Enter your goal..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            autoFocus
          />
          <button
            onClick={addGoal}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
          >
            Add
          </button>
          <button
            onClick={() => setShowInput(false)}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-purple-300 hover:text-purple-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">Add Goal</span>
        </button>
      )}

      {/* Suggested Goals */}
      {goals.length === 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Suggested goals:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedGoals.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setGoals([...goals, {
                    id: Date.now().toString() + index,
                    text: suggestion,
                    completed: false,
                    createdAt: new Date()
                  }]);
                }}
                className="px-3 py-1 bg-purple-50 text-purple-600 text-xs rounded-full hover:bg-purple-100 transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningGoals;
