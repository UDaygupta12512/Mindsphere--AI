import React, { useState } from 'react';
import { CheckCircle, XCircle, RefreshCw, Award, Brain, Zap, FileText, Loader2 } from 'lucide-react';
import { Quiz } from '../types/course';
import { api, srsApi, learningApi, GapReport } from '../lib/api';
import GapReportModal from './GapReportModal';

interface QuizComponentProps {
  quizzes: Quiz[];
  onComplete: (score: number) => void;
  courseId?: string;
  onQuizzesUpdated?: (quizzes: Quiz[]) => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ quizzes, onComplete, courseId, onQuizzesUpdated }) => {
  const [currentQuizIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  // Gap Report state
  const [gapReport, setGapReport] = useState<GapReport | null>(null);
  const [showGapReport, setShowGapReport] = useState(false);
  const [isGeneratingGapReport, setIsGeneratingGapReport] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const currentQuiz = quizzes && quizzes.length > 0 ? quizzes[currentQuizIndex] : null;
  const currentQuestion = currentQuiz && currentQuiz.questions && currentQuiz.questions.length > 0 ? currentQuiz.questions[currentQuestionIndex] : null;

  // Helper function to get the correct answer letter
  const getCorrectAnswerLetter = (): string => {
    if (!currentQuestion) return '';
    return extractLetter(currentQuestion.correctAnswer, currentQuestion.options);
  };

  if (!quizzes || quizzes.length === 0 || !currentQuiz) {
    return (
      <div className="text-center py-12">
        <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quizzes Available</h3>
        <p className="text-gray-600">Quizzes will be generated based on your course content.</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-12">
        <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</h3>
        <p className="text-gray-600">This quiz doesn't have any questions yet.</p>
      </div>
    );
  }

  // Shared helper to extract the letter (A-D) from an answer string
  const extractLetter = (answer: string | undefined, options?: string[]): string => {
    if (!answer) return '';
    if (/^[A-D]$/.test(answer)) return answer;
    const match = answer.match(/^([A-D])\./);
    if (match) return match[1];
    if (options) {
      for (let j = 0; j < options.length; j++) {
        if (options[j] === answer || options[j].replace(/^[A-D]\.\s*/, '') === answer) {
          return String.fromCharCode(65 + j);
        }
      }
    }
    return '';
  };

  const handleAnswerSelect = (answer: string) => {
    if (!showResult) {
      setSelectedAnswer(answer);
    }
  };

  const handleNext = async () => {
    if (!selectedAnswer || !selectedAnswer.trim()) {
      alert('Please select an answer before continuing');
      return;
    }

    const questionId = `${currentQuizIndex}-${currentQuestionIndex}`;
    setAnswers(prev => ({ ...prev, [questionId]: selectedAnswer }));
    setShowResult(true);

    // Track in SRS if wrong answer
    if (courseId && currentQuestion) {
      const userLetter = extractLetter(selectedAnswer, currentQuestion.options);
      const correctLetter = extractLetter(currentQuestion.correctAnswer, currentQuestion.options);
      const isCorrect = userLetter === correctLetter && userLetter !== '';

      if (!isCorrect) {
        try {
          await srsApi.track({
            courseId,
            itemType: 'quiz',
            itemId: `${currentQuizIndex}-${currentQuestionIndex}`,
            question: currentQuestion.question,
            answer: currentQuestion.correctAnswer,
            isCorrect: false,
          });
        } catch (error) {
          console.error('Error tracking quiz question in SRS:', error);
        }
      }
    }
  };

  const handleContinue = async () => {
    // Store current answer before moving on (ensures last question is counted)
    const questionId = `${currentQuizIndex}-${currentQuestionIndex}`;
    const updatedAnswers = { ...answers, [questionId]: selectedAnswer };
    setAnswers(updatedAnswers);

    setShowResult(false);
    setSelectedAnswer('');

    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed - calculate score from all stored answers including this one
      const totalQuestions = currentQuiz.questions.length;
      let correctAnswers = 0;
      const quizResults: Array<{
        question: string;
        userAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
      }> = [];

      for (let i = 0; i < totalQuestions; i++) {
        const qId = `${currentQuizIndex}-${i}`;
        const userAnswer = updatedAnswers[qId];
        const question = currentQuiz.questions[i];
        const userLetter = extractLetter(userAnswer, question.options);
        const correctLetter = extractLetter(question.correctAnswer, question.options);
        const isCorrect = userLetter === correctLetter && userLetter !== '';
        if (isCorrect) correctAnswers++;

        quizResults.push({
          question: question.question,
          userAnswer: userAnswer || '',
          correctAnswer: question.correctAnswer,
          isCorrect
        });
      }

      const score = Math.round((correctAnswers / totalQuestions) * 100);
      setFinalScore(score);
      setCorrectCount(correctAnswers);
      setWrongCount(totalQuestions - correctAnswers);
      setQuizCompleted(true);
      onComplete(score);

      // Generate Gap Report if there are wrong answers
      if (courseId && totalQuestions - correctAnswers > 0) {
        setIsGeneratingGapReport(true);
        try {
          const response = await learningApi.generateGapReport({
            courseId,
            score,
            quizResults
          });
          setGapReport(response.gapReport);
        } catch (error) {
          console.error('Error generating gap report:', error);
        } finally {
          setIsGeneratingGapReport(false);
        }
      }

      // Track study session for persona
      if (courseId) {
        try {
          await learningApi.trackSession({
            startTime: new Date(Date.now() - totalQuestions * 30000).toISOString(), // Estimate start time
            endTime: new Date().toISOString(),
            activityType: 'quiz',
            performance: score,
            courseId
          });
        } catch (error) {
          console.error('Error tracking session:', error);
        }
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowResult(false);
    setAnswers({});
    setQuizCompleted(false);
    setGapReport(null);
    setShowGapReport(false);
    setFinalScore(0);
    setCorrectCount(0);
    setWrongCount(0);
  };

  const handleGenerateMoreQuestions = async () => {
    if (!courseId) {
      console.error('Course ID not available');
      alert('Error: Course ID not found');
      return;
    }
    
    setIsGeneratingQuestions(true);
    try {
      console.log(`Generating more questions for course: ${courseId}, quiz index: ${currentQuizIndex}`);
      
      const data = await api.post<{success: boolean; newQuestions: any[]; totalQuestions: number; error?: string}>(
        `/api/courses/${courseId}/quizzes/generate`,
        { quizIndex: currentQuizIndex, count: 5 }
      );
      
      if (data.success && data.newQuestions) {
        // Notify parent to refresh quiz data from server
        if (onQuizzesUpdated) {
          const updatedQuizzes = [...quizzes];
          const currentQuiz = updatedQuizzes[currentQuizIndex];
          if (currentQuiz) {
            updatedQuizzes[currentQuizIndex] = {
              ...currentQuiz,
              questions: [...currentQuiz.questions, ...data.newQuestions]
            };
            onQuizzesUpdated(updatedQuizzes);
          }
        }
        handleRestart();
      } else {
        throw new Error(data.error || 'Failed to generate questions');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const getSelectedAnswerLetter = (): string => {
    if (!selectedAnswer) return '';
    return extractLetter(selectedAnswer, currentQuestion?.options);
  };
  const selectedAnswerLetter = getSelectedAnswerLetter();
  const correctAnswerLetter = getCorrectAnswerLetter();
  const isCorrect = selectedAnswerLetter === correctAnswerLetter && selectedAnswerLetter !== '';
  
  const getExplanation = () => {
    if (!currentQuestion) return 'No explanation available.';

    // Try different explanation formats
    if (currentQuestion.correctExplanation && currentQuestion.correctExplanation.trim()) {
      return currentQuestion.correctExplanation;
    }

    if (currentQuestion.explanation && currentQuestion.explanation.trim()) {
      return currentQuestion.explanation;
    }

    // Fallback explanation
    return `The correct answer is: ${currentQuestion.correctAnswer}`;
  };

  if (quizCompleted) {
    const totalQuestions = currentQuiz.questions.length;

    // Use stored values
    const score = finalScore;
    const correctAnswers = correctCount;

    return (
      <div className="text-center py-12">
        <div className="mb-8">
          <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h3>
          <p className="text-gray-600 mb-6">You've finished the {currentQuiz.title}</p>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 max-w-sm mx-auto">
            <div className="text-4xl font-bold text-gray-900 mb-2">{score}%</div>
            <div className="text-gray-600">
              {correctAnswers} out of {totalQuestions} correct
            </div>
          </div>
        </div>

        {/* Gap Report Section */}
        {wrongCount > 0 && (
          <div className="mb-8 max-w-md mx-auto">
            {isGeneratingGapReport ? (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                  <span className="text-purple-700 font-medium">Analyzing your answers...</span>
                </div>
              </div>
            ) : gapReport ? (
              <button
                onClick={() => setShowGapReport(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 hover:opacity-90 transition-opacity shadow-lg"
              >
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="font-semibold">View Gap Analysis Report</span>
                </div>
                <p className="text-sm text-white/80 mt-1">
                  AI-generated insights and mini-lessons for improvement
                </p>
              </button>
            ) : null}
          </div>
        )}

        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={handleRestart}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isGeneratingQuestions}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retake Quiz</span>
          </button>
          <button
            onClick={handleGenerateMoreQuestions}
            className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isGeneratingQuestions}
          >
            <Zap className="h-4 w-4" />
            <span>{isGeneratingQuestions ? 'Generating...' : 'Generate More Questions'}</span>
          </button>
        </div>

        {/* Gap Report Modal */}
        {gapReport && (
          <GapReportModal
            isOpen={showGapReport}
            onClose={() => setShowGapReport(false)}
            gapReport={gapReport}
            score={score}
            totalQuestions={totalQuestions}
            correctCount={correctAnswers}
            wrongCount={wrongCount}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{currentQuiz.title}</h2>
          <span className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {!showResult ? (
        <div>
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion?.question}
            </h3>
            
            <div className="space-y-3">
              {currentQuestion?.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedAnswer === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedAnswer === option
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswer === option && (
                        <div className="w-full h-full bg-white rounded-full scale-50"></div>
                      )}
                    </div>
                    <span className="text-gray-900">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              aria-label="Submit Answer"
              onClick={handleNext}
              disabled={!selectedAnswer}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Submit Answer
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
            isCorrect ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isCorrect ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          
          <h3 className={`text-2xl font-bold mb-4 ${
            isCorrect ? 'text-green-600' : 'text-red-600'
          }`}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </h3>
          
          <div className={`p-6 rounded-lg mb-6 ${
            isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className="text-gray-700">
              <strong>Explanation:</strong> {getExplanation()}
            </p>
            {!isCorrect && (
              <p className="mt-2 text-gray-700">
                <strong>Correct answer:</strong> {currentQuestion?.correctAnswer}
              </p>
            )}
          </div>
          
          <button
            onClick={handleContinue}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {currentQuestionIndex < currentQuiz.questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizComponent; 