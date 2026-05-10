import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Lightbulb, BookOpen, Target, ChevronDown, ChevronUp, Brain, Sparkles, TrendingUp } from 'lucide-react';
import { GapReport } from '../lib/api';

interface GapReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  gapReport: GapReport;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
}

const GapReportModal: React.FC<GapReportModalProps> = ({
  isOpen,
  onClose,
  gapReport,
  score,
  totalQuestions,
  correctCount,
  wrongCount
}) => {
  const [expandedLesson, setExpandedLesson] = useState<number | null>(0);

  if (!isOpen) return null;

  const getScoreColor = () => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-600';
  };

  const getScoreEmoji = () => {
    if (score >= 90) return '🏆';
    if (score >= 80) return '🌟';
    if (score >= 70) return '👍';
    if (score >= 60) return '💪';
    return '📚';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getScoreColor()} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{getScoreEmoji()}</div>
              <div>
                <h2 className="text-2xl font-bold">Gap Analysis Report</h2>
                <p className="text-white/80">AI-powered insights to help you learn better</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {/* Score Summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">{score}%</div>
              <div className="text-xs text-gray-600">Your Score</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
              <div className="text-3xl font-bold text-green-600">{correctCount}</div>
              <div className="text-xs text-gray-600">Correct</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
              <div className="text-3xl font-bold text-red-600">{wrongCount}</div>
              <div className="text-xs text-gray-600">Need Review</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
              <div className="text-3xl font-bold text-gray-600">{totalQuestions}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>

          {/* Overall Analysis */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 mb-6 border border-purple-200">
            <div className="flex items-start gap-3">
              <Brain className="h-6 w-6 text-purple-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
                <p className="text-gray-700">{gapReport.overallAnalysis}</p>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">You Understand Well</h3>
              </div>
              <ul className="space-y-2">
                {gapReport.strengths.length > 0 ? (
                  gapReport.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-green-700">
                      <span className="text-green-500">✓</span>
                      {strength}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500 italic">Keep practicing to build strengths!</li>
                )}
              </ul>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-orange-800">Areas to Improve</h3>
              </div>
              <ul className="space-y-2">
                {gapReport.weaknesses.length > 0 ? (
                  gapReport.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-orange-700">
                      <span className="text-orange-500">!</span>
                      {weakness}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-green-600 font-medium">Excellent! No major gaps found!</li>
                )}
              </ul>
            </div>
          </div>

          {/* Mini-Lessons */}
          {gapReport.miniLessons && gapReport.miniLessons.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-6 w-6 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900">Mini-Lessons for You</h3>
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                  AI Generated
                </span>
              </div>

              <div className="space-y-3">
                {gapReport.miniLessons.map((lesson, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedLesson(expandedLesson === idx ? null : idx)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <span className="font-medium text-gray-900">{lesson.topic}</span>
                      </div>
                      {expandedLesson === idx ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>

                    {expandedLesson === idx && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="mt-4 space-y-4">
                          {/* Explanation */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              Explanation
                            </h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{lesson.explanation}</p>
                          </div>

                          {/* Key Points */}
                          <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Key Points
                            </h4>
                            <ul className="space-y-1">
                              {lesson.keyPoints.map((point, pIdx) => (
                                <li key={pIdx} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-green-500 mt-1">•</span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Example */}
                          <div className="bg-purple-50 rounded-lg p-4">
                            <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              Example
                            </h4>
                            <p className="text-sm text-gray-700">
                              {lesson.example?.trim() || `Example coming soon. Try explaining ${lesson.topic} in your own words.`}
                            </p>
                          </div>

                          {/* Practice Question */}
                          <div className="bg-yellow-50 rounded-lg p-4">
                            <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Practice Question
                            </h4>
                            <p className="text-sm text-gray-700 italic">
                              "{lesson.practiceQuestion?.trim() || `How would you apply ${lesson.topic} in a real project?`}"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 mb-6 border border-indigo-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              Recommended Next Steps
            </h3>
            <ul className="space-y-2">
              {gapReport.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-semibold flex-shrink-0">
                    {idx + 1}
                  </span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Encouragement */}
          <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl p-5 text-center border border-pink-200">
            <p className="text-lg font-medium text-rose-700">🌟 {gapReport.encouragement}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-opacity"
            >
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GapReportModal;
