import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, Target, Zap, ChevronRight, CheckCircle, Layers, HelpCircle, X, Sparkles, Loader2 } from 'lucide-react';
import { learningApi, LearningPath } from '../lib/api';

interface LearningPathModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
}

const LearningPathModal: React.FC<LearningPathModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  totalLessons,
  completedLessons
}) => {
  const [step, setStep] = useState<'setup' | 'generating' | 'view'>('setup');
  const [targetDays, setTargetDays] = useState(7);
  const [dailyHours, setDailyHours] = useState(1);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadExistingPath();
    }
  }, [isOpen, courseId]);

  const loadExistingPath = async () => {
    try {
      const response = await learningApi.getPath(courseId);
      if (response.learningPath) {
        setLearningPath(response.learningPath);
        setStep('view');
      }
    } catch (err) {
      // No existing path, that's fine
    }
  };

  const handleGenerate = async () => {
    setStep('generating');
    setError('');

    try {
      const response = await learningApi.generatePath({
        courseId,
        targetDays,
        dailyHours
      });
      setLearningPath(response.learningPath);
      setStep('view');
    } catch (err) {
      setError('Failed to generate learning path. Please try again.');
      setStep('setup');
    }
  };

  const handleRegenerate = () => {
    setStep('setup');
    setLearningPath(null);
  };

  if (!isOpen) return null;

  const remainingLessons = totalLessons - completedLessons;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Personalized Learning Path</h2>
                <p className="text-blue-100 text-sm">{courseTitle}</p>
              </div>
            </div>
            <button aria-label="Close learning path modal" title="Close" onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Setup Step */}
          {step === 'setup' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Your Goal</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Tell us when you want to complete this course, and we'll create a personalized day-by-day study plan.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{remainingLessons}</div>
                    <div className="text-xs text-gray-500">Lessons Remaining</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{completedLessons}</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    I want to finish in...
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[3, 5, 7, 14, 30].map(days => (
                      <button
                        key={days}
                        onClick={() => setTargetDays(days)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          targetDays === days
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {days} days
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 inline mr-2" />
                    Daily study time
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[0.5, 1, 1.5, 2, 3].map(hours => (
                      <button
                        key={hours}
                        onClick={() => setDailyHours(hours)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          dailyHours === hours
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {hours} hr{hours !== 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
              )}

              <button
                onClick={handleGenerate}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Generate My Learning Path
              </button>
            </div>
          )}

          {/* Generating Step */}
          {step === 'generating' && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Creating Your Plan...</h3>
              <p className="text-gray-600 text-sm">
                Learning OS is analyzing your progress signals and designing today&apos;s best schedule
              </p>
            </div>
          )}

          {/* View Path Step */}
          {step === 'view' && learningPath && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Your Personalized Plan</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-gray-900">{learningPath.summary.totalStudyHours}h</div>
                    <div className="text-xs text-gray-500">Total Time</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-gray-900">{learningPath.summary.lessonsPerDay}</div>
                    <div className="text-xs text-gray-500">Lessons/Day</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-gray-900">{learningPath.summary.reviewSessions}</div>
                    <div className="text-xs text-gray-500">Reviews</div>
                  </div>
                </div>
              </div>

              {/* Day-by-Day Breakdown */}
              <div className="space-y-2">
                {learningPath.days.map(day => (
                  <div key={day.day} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                          {day.day}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">{day.title}</div>
                          <div className="text-sm text-gray-500">{day.focus}</div>
                        </div>
                      </div>
                      <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${expandedDay === day.day ? 'rotate-90' : ''}`} />
                    </button>

                    {expandedDay === day.day && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="space-y-2 mt-3">
                          {day.tasks.map((task, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              {task.type === 'lesson' && <BookOpen className="h-4 w-4 text-blue-500" />}
                              {task.type === 'flashcard' && <Layers className="h-4 w-4 text-purple-500" />}
                              {task.type === 'quiz' && <HelpCircle className="h-4 w-4 text-green-500" />}
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900">{task.title}</span>
                                {task.count && <span className="text-xs text-gray-500 ml-2">({task.count} cards)</span>}
                              </div>
                              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">{task.duration}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-800">💡 {day.tips}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleRegenerate}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Generate a different plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPathModal;
