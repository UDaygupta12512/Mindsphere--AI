import React, { useState, useEffect } from 'react';
import { Brain, Trophy, CheckCircle, XCircle, RotateCcw, ArrowLeft, AlertCircle } from 'lucide-react';
import { srsApi } from '../lib/api';

interface ReviewItem {
  itemType: 'flashcard' | 'quiz';
  itemId: string;
  courseId: string;
  courseTitle: string;
  question: string;
  answer: string;
  difficulty: number;
  wrongCount: number;
  correctCount: number;
  lastReviewed?: string;
  nextReview: string;
}

interface ReviewDashboardProps {
  onBack: () => void;
}

const ReviewDashboard: React.FC<ReviewDashboardProps> = ({ onBack }) => {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    loadReviewItems();
  }, []);

  const loadReviewItems = async () => {
    try {
      setIsLoading(true);
      const response = await srsApi.getReviewItems(20);
      setReviewItems(response.reviewItems);
    } catch (error) {
      console.error('Error loading review items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (quality: number) => {
    const currentItem = reviewItems[currentIndex];

    try {
      await srsApi.review({
        courseId: currentItem.courseId,
        itemType: currentItem.itemType,
        itemId: currentItem.itemId,
        quality,
      });

      setReviewedCount(reviewedCount + 1);

      if (currentIndex < reviewItems.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        setSessionComplete(true);
      }
    } catch (error) {
      console.error('Error recording review:', error);
    }
  };

  const handleRestart = () => {
    loadReviewItems();
    setCurrentIndex(0);
    setShowAnswer(false);
    setSessionComplete(false);
    setReviewedCount(0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-16 w-16 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading review items...</p>
        </div>
      </div>
    );
  }

  if (reviewItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button onClick={onBack} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h2>
            <p className="text-gray-600 mb-6">You don't have any items due for review right now.</p>
            <p className="text-sm text-gray-500">Keep learning to add more concepts to your review schedule.</p>
          </div>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button onClick={onBack} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Session Complete!</h2>
            <p className="text-gray-600 mb-8">Great job reviewing your concepts</p>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
              <div className="text-4xl font-bold text-gray-900 mb-2">{reviewedCount}</div>
              <div className="text-gray-600">Items Reviewed</div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Review More</span>
              </button>
              <button
                onClick={onBack}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = reviewItems[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={onBack} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Recall Review</h1>
              <p className="text-gray-600">Review items that need your attention</p>
            </div>
            <Brain className="h-12 w-12 text-purple-500" />
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {currentIndex + 1} of {reviewItems.length}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                currentItem.itemType === 'flashcard'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {currentItem.itemType === 'flashcard' ? 'Flashcard' : 'Quiz Question'}
              </span>
              {currentItem.difficulty >= 3 && (
                <span className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  <AlertCircle className="h-3 w-3" />
                  <span>At Risk</span>
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              From: {currentItem.courseTitle}
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / reviewItems.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl mb-4">
              <div className="text-sm uppercase tracking-wider mb-3 opacity-80">Question</div>
              <div className="text-xl font-medium leading-relaxed mb-4">
                {currentItem.question}
              </div>
              {!showAnswer && (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Show Answer
                </button>
              )}
            </div>

            {/* Answer Card (shown when revealed) */}
            {showAnswer && (
              <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="text-sm uppercase tracking-wider mb-3 opacity-80">Answer</div>
                <div className="text-xl font-medium leading-relaxed">
                  {currentItem.answer}
                </div>
              </div>
            )}
          </div>

          {/* Review Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{currentItem.wrongCount}</div>
              <div className="text-xs text-gray-600">Wrong</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{currentItem.correctCount}</div>
              <div className="text-xs text-gray-600">Correct</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{currentItem.difficulty}</div>
              <div className="text-xs text-gray-600">Difficulty</div>
            </div>
          </div>

          {/* Review Buttons */}
          {showAnswer ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center mb-4">How well did you remember this?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleReview(0)}
                  className="flex items-center justify-center space-x-2 bg-red-100 text-red-700 px-4 py-3 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                  <span>Forgot Completely</span>
                </button>
                <button
                  onClick={() => handleReview(3)}
                  className="flex items-center justify-center space-x-2 bg-yellow-100 text-yellow-700 px-4 py-3 rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  <AlertCircle className="h-5 w-5" />
                  <span>Hard</span>
                </button>
                <button
                  onClick={() => handleReview(4)}
                  className="flex items-center justify-center space-x-2 bg-blue-100 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Good</span>
                </button>
                <button
                  onClick={() => handleReview(5)}
                  className="flex items-center justify-center space-x-2 bg-green-100 text-green-700 px-4 py-3 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Trophy className="h-5 w-5" />
                  <span>Easy/Perfect</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500 text-sm">Click "Show Answer" to reveal the answer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewDashboard;
