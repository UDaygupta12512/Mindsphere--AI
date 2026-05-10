import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, BookOpen, HelpCircle, Layers, Download, CheckCircle, Play, Clock, Users, Star, Award, FileText, Link, Code, Image, FileSearch, StickyNote, PenLine, Bot, Target, Loader2, BarChart3, Sparkles, Zap, Flame, Trophy } from 'lucide-react';
import { Course } from '../types/course';
import { Certificate } from '../types/achievement';
import QuizComponent from './QuizComponent';
import FlashcardsComponent from './FlashcardsComponent';
import CourseSummary from './CourseSummary';
import CertificateViewer from './Certificate';
import LearningPathModal from './LearningPathModal';
import SmartLearningLab from './SmartLearningLab';
import { coursesApi, certificateApi } from '../lib/api';
import { useCountUp } from '../hooks/useCountUp';
import { safeSetItem, safeGetItem } from '../utils/localStorage';

interface CourseViewerProps {
  course: Course;
  onBack: () => void;
  onUpdateCourse: (course: Course) => void;
  refreshCourses?: () => Promise<void>;
}

// Lesson Notepad - sticky auto-saved notepad per lesson
const NOTES_PREFIX = 'mindsphere-lesson-note-';
const LessonNotepad: React.FC<{ courseId: string; lessonId: string }> = ({ courseId, lessonId }) => {
  const key = `${NOTES_PREFIX}${courseId}-${lessonId}`;
  const [text, setText] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  useEffect(() => {
    const saved = safeGetItem(key);
    if (saved !== null) {
      setText(saved);
    }
  }, [key]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    setSaveStatus('saving');

    // Debounce save
    const timeoutId = setTimeout(() => {
      const success = safeSetItem(key, value);
      setSaveStatus(success ? 'saved' : 'error');
    }, 500);

    return () => clearTimeout(timeoutId);
  };
  return (
    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-yellow-400 rounded-lg">
          <StickyNote className="h-5 w-5 text-yellow-900" />
        </div>
        <div className="flex-1">
          <span className="text-base font-bold text-yellow-900 block">My Lesson Notes</span>
          <span className="text-xs text-yellow-600">Auto-saved per lesson</span>
        </div>
      </div>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder={`Write your notes for this lesson here...

- Key concepts
- Questions to review
- Important points
- Your thoughts`}
        className="w-full min-h-[400px] max-h-[600px] bg-white/90 backdrop-blur border-2 border-yellow-200 rounded-xl p-4 text-sm text-gray-800 placeholder-gray-400 resize-y focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none shadow-inner font-mono leading-relaxed"
      />
      <div className="flex items-center justify-between mt-3 text-xs text-yellow-700">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Saved automatically
        </span>
        <span>{text.length} characters</span>
      </div>
    </div>
  );
};

const CourseViewer: React.FC<CourseViewerProps> = ({ course, onBack, onUpdateCourse, refreshCourses }) => {
  const isPendingCourse = course._id?.startsWith('pending-');
  const [certificateData, setCertificateData] = useState<Certificate | null>(null);
  const [certificateError, setCertificateError] = useState('');
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [hasTriggeredCertificate, setHasTriggeredCertificate] = useState(false);
  const [showCompletionConfetti, setShowCompletionConfetti] = useState(false);
  const [adaptiveOrder, setAdaptiveOrder] = useState(true);
  const [readingDensity, setReadingDensity] = useState<'compact' | 'comfortable'>('comfortable');
  const [notesQuery, setNotesQuery] = useState('');
  const [sprintMinutes, setSprintMinutes] = useState<15 | 25 | 45>(25);
  const [sprintPlan, setSprintPlan] = useState<Array<{ title: string; detail: string; tab?: 'lessons' | 'flashcards' | 'quiz' }>>([]);
  const [topicConfidence, setTopicConfidence] = useState<Record<string, { score: number; lastReviewed: string; attempts: number }>>({});
  const [lastMicroSyllabus, setLastMicroSyllabus] = useState<Array<{ title: string; detail: string }>>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'summary' | 'smartlab' | 'lessons' | 'notes' | 'quiz' | 'flashcards'>('overview');
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [notesMode, setNotesMode] = useState<'ai' | 'personal'>('ai');
  const [showCertificate, setShowCertificate] = useState(false);
  const [showLearningPath, setShowLearningPath] = useState(false);
  const [explainBackInputs, setExplainBackInputs] = useState<Record<number, string>>({});
  const [explainBackLoading, setExplainBackLoading] = useState<Record<number, boolean>>({});
  const [explainBackResults, setExplainBackResults] = useState<Record<number, {
    score: number;
    missingPoints: string[];
    strengths: string[];
    feedback: string;
    improvementTip: string;
  }>>({});

  const PERSONAL_NOTES_KEY = `mindsphere-personal-notes-${course._id || course.id}`;
  const [personalNotes, setPersonalNotes] = useState('');
  useEffect(() => { setPersonalNotes(localStorage.getItem(PERSONAL_NOTES_KEY) || ''); }, [PERSONAL_NOTES_KEY]);
  const handlePersonalNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPersonalNotes(e.target.value);
    localStorage.setItem(PERSONAL_NOTES_KEY, e.target.value);
  };

  const CONFIDENCE_KEY = `mindsphere-topic-confidence-${course._id || course.id}`;
  useEffect(() => {
    const saved = localStorage.getItem(CONFIDENCE_KEY);
    if (saved) {
      try {
        setTopicConfidence(JSON.parse(saved));
      } catch {
        setTopicConfidence({});
      }
    }
  }, [CONFIDENCE_KEY]);

  const persistTopicConfidence = (next: typeof topicConfidence) => {
    setTopicConfidence(next);
    localStorage.setItem(CONFIDENCE_KEY, JSON.stringify(next));
  };

  const normalizeTopic = (text: string) => {
    return text.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  };

  const updateConfidenceFromQuiz = (results: Array<{ question: string; userAnswer: string; correctAnswer: string; isCorrect: boolean; topic?: string }>) => {
    const now = new Date().toISOString();
    const next = { ...topicConfidence };

    results.forEach((result) => {
      const rawTopic = result.topic || result.question.split(' ').slice(0, 3).join(' ');
      const topic = normalizeTopic(rawTopic) || 'General';
      const existing = next[topic] || { score: 50, lastReviewed: now, attempts: 0 };
      const delta = result.isCorrect ? 8 : -12;
      const score = Math.max(0, Math.min(100, existing.score + delta));
      next[topic] = {
        score,
        lastReviewed: now,
        attempts: existing.attempts + 1
      };
    });

    persistTopicConfidence(next);
  };

  const getDecayedScore = (topic: string) => {
    const data = topicConfidence[topic];
    if (!data) return 0;
    const last = new Date(data.lastReviewed).getTime();
    const days = Math.max(0, (Date.now() - last) / (1000 * 60 * 60 * 24));
    const decay = Math.min(35, days * 2.5);
    return Math.max(0, Math.round(data.score - decay));
  };

  const buildSprintPlan = (minutes: 15 | 25 | 45) => {
    const nextLessonIndex = course.lessons.findIndex((lesson) => !lesson.isCompleted);
    const lesson = course.lessons[nextLessonIndex >= 0 ? nextLessonIndex : 0];
    const flashcards = course.flashcards?.slice(0, 5) || [];
    const quizQuestions = course.quizzes?.[0]?.questions?.slice(0, 3) || [];

    const plan = [
      { title: lesson ? `Lesson: ${lesson.title}` : 'Lesson review', detail: 'Read and summarize the key idea.', tab: 'lessons' as const },
      { title: `Flashcards: ${flashcards.length} cards`, detail: 'Quick recall sprint on key definitions.', tab: 'flashcards' as const },
      { title: `Quiz: ${quizQuestions.length} questions`, detail: 'Answer and review explanations.', tab: 'quiz' as const }
    ];

    setSprintMinutes(minutes);
    setSprintPlan(plan);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'insights', label: 'Insights', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'summary', label: 'Summary', icon: <FileSearch className="h-4 w-4" /> },
    { id: 'smartlab', label: 'Smart Lab', icon: <Target className="h-4 w-4" /> },
    { id: 'lessons', label: 'Lessons', icon: <Play className="h-4 w-4" /> },
    { id: 'notes', label: 'Notes', icon: <FileText className="h-4 w-4" /> },
    { id: 'quiz', label: 'Quiz', icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Layers className="h-4 w-4" /> },
  ];

  const getLessonType = (lesson: Course['lessons'][number]) => {
    if (lesson.videoUrl || lesson.videoId) return 'visual';
    const hasCodeResource = lesson.resources?.some(r => r.type === 'code');
    if (hasCodeResource || /practice|exercise|lab/i.test(lesson.title)) return 'practice';
    return 'text';
  };

  const visualCount = course.lessons.filter(l => getLessonType(l) === 'visual').length;
  const practiceCount = course.lessons.filter(l => getLessonType(l) === 'practice').length;
  const textWeight = course.notes?.length ? course.notes.length * 2 : 1;
  const visualScore = visualCount * 3 + (course.lessons.length ? 2 : 0);
  const practiceScore = practiceCount * 3 + (course.quizzes?.length || 0) * 2 + (course.flashcards?.length || 0) * 2;
  const textScore = textWeight + Math.round((course.summary?.length || 0) / 200);

  const styleScores = [
    { key: 'visual', label: 'Visual', value: visualScore },
    { key: 'practice', label: 'Practice', value: practiceScore },
    { key: 'text', label: 'Text', value: textScore }
  ];

  const totalStyleScore = styleScores.reduce((sum, item) => sum + item.value, 0) || 1;
  const primaryStyle = [...styleScores].sort((a, b) => b.value - a.value)[0].label;

  const orderedLessons = course.lessons.map((lesson, index) => ({
    lesson,
    originalIndex: index,
    type: getLessonType(lesson)
  }));

  const adaptiveLessons = adaptiveOrder
    ? [...orderedLessons].sort((a, b) => {
        const priority = primaryStyle.toLowerCase();
        const aScore = a.type === priority ? 2 : 0;
        const bScore = b.type === priority ? 2 : 0;
        return bScore - aScore;
      })
    : orderedLessons;

  const handleQuizComplete = async (score: number) => {
    const progressBonus = Math.round(25 * (score / 100));
    const newProgress = Math.min(100, course.progress + progressBonus);
    const updatedCourse = { ...course, progress: newProgress };
    onUpdateCourse(updatedCourse);
    try {
      await coursesApi.updateProgress(course._id, { progress: newProgress });
      // Refresh courses to update analytics in real-time
      if (refreshCourses) await refreshCourses();
    } catch (e) {
      console.error('Error updating progress:', e);
    }
    try {
      if (course.quizzes?.length > 0) {
        await coursesApi.completeQuiz(course._id, 0, score);
      }
    } catch (e) {
      console.error('Error completing quiz:', e);
    }

    if (newProgress >= 100) {
      void generateCertificate(true);
    }
  };

  const handleFlashcardComplete = async () => {
    const newProgress = Math.min(100, course.progress + 15);
    const updatedCourse = { ...course, progress: newProgress };
    onUpdateCourse(updatedCourse);
    try {
      await coursesApi.updateProgress(course._id, { progress: newProgress });
      // Refresh courses to update analytics in real-time
      if (refreshCourses) await refreshCourses();
    } catch (e) {
      console.error('Error updating flashcard progress:', e);
    }

    if (newProgress >= 100) {
      void generateCertificate(true);
    }
  };

  const handleLessonComplete = async (displayIndex: number) => {
    const targetIndex = adaptiveLessons[displayIndex]?.originalIndex ?? displayIndex;
    const updatedLessons = [...course.lessons];
    updatedLessons[targetIndex] = { ...updatedLessons[targetIndex], isCompleted: true };
    const completedCount = updatedLessons.filter(l => l.isCompleted).length;
    const totalLessons = course.totalLessons || course.lessons.length || 1;
    const progressPercentage = Math.round((completedCount / totalLessons) * 100);
    const updatedCourse = { ...course, lessons: updatedLessons, completedLessons: completedCount, progress: progressPercentage, lastAccessed: new Date() };
    onUpdateCourse(updatedCourse);
    try {
      await coursesApi.updateProgress(course._id, { completedLessons: completedCount, progress: progressPercentage, lessons: updatedLessons as any });
      // Refresh courses to update analytics in real-time
      if (refreshCourses) await refreshCourses();
    } catch (e) {
      console.error('Error updating lesson progress:', e);
    }

    if (progressPercentage >= 100) {
      void generateCertificate(true);
    }
  };

  const generateCertificate = async (openModal: boolean) => {
    if (isPendingCourse || isGeneratingCertificate || !course._id) return;
    setCertificateError('');
    setIsGeneratingCertificate(true);
    try {
      const cert = await certificateApi.generate(course._id);
      setCertificateData(cert);
      if (openModal) {
        setShowCertificate(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate certificate.';
      setCertificateError(message);
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  useEffect(() => {
    if (course.progress >= 100 && !hasTriggeredCertificate) {
      setHasTriggeredCertificate(true);
      void generateCertificate(true);
      setShowCompletionConfetti(true);
    }
  }, [course.progress, course._id, hasTriggeredCertificate]);

  useEffect(() => {
    if (!showCompletionConfetti) return;
    const timer = setTimeout(() => setShowCompletionConfetti(false), 2800);
    return () => clearTimeout(timer);
  }, [showCompletionConfetti]);

  const currentLesson = adaptiveLessons[selectedLessonIndex]?.lesson;
  const lessonContentClass = readingDensity === 'compact' ? 'text-sm leading-snug' : 'text-base leading-relaxed';

  useEffect(() => {
    setSelectedLessonIndex(0);
  }, [adaptiveOrder]);

  const filteredNotes = (course.notes || []).filter((note) => {
    const query = notesQuery.trim().toLowerCase();
    if (!query) return true;
    const haystack = [note.title, note.summary, note.content]
      .flatMap((item) => Array.isArray(item) ? item : [item])
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  });

  const strategicInsights = (course.insights && course.insights.length > 0)
    ? course.insights
    : (course.notes || []).slice(0, 4).map((note, index) => ({
        title: note.title || `Insight ${index + 1}`,
        whyItMatters: Array.isArray(note.summary) ? (note.summary[0] || 'This concept supports long-term retention.') : 'This concept supports long-term retention.',
        applyItToday: `Summarize "${note.title || `Insight ${index + 1}`}" in your own words and add one example.`,
        successMetric: 'Can explain this idea in 60 seconds without notes.',
        relatedTopics: note.topics || []
      }));

  const explainBackScores = Object.values(explainBackResults).map((result) => result.score);
  const explainBackAverage = explainBackScores.length > 0
    ? Math.round((explainBackScores.reduce((sum, score) => sum + score, 0) / explainBackScores.length) * 10)
    : 0;
  const questCompletion = Math.round((((course.completedLessons || 0) + explainBackScores.length) / Math.max(1, (course.totalLessons || course.lessons.length) + 4)) * 100);
  const masteryScore = Math.min(100, Math.round((course.progress * 0.7) + (explainBackAverage * 0.3)));

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'link': return <Link className="h-4 w-4" />;
      case 'code': return <Code className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleExplainBackEvaluate = async (note: Course['notes'][number], noteIndex: number) => {
    const userExplanation = explainBackInputs[noteIndex]?.trim();
    if (!userExplanation) {
      alert('Please explain the concept in your own words first.');
      return;
    }

    setExplainBackLoading(prev => ({ ...prev, [noteIndex]: true }));
    try {
      const originalContent = Array.isArray(note.summary)
        ? note.summary.join('\n')
        : (note.summary || note.content || note.title);

      const response = await coursesApi.evaluateExplainBack(course._id, {
        conceptTitle: note.title,
        originalContent,
        userExplanation
      });

      setExplainBackResults(prev => ({
        ...prev,
        [noteIndex]: response.evaluation
      }));
    } catch (error) {
      console.error('Explain Back evaluation error:', error);
      alert('Failed to evaluate your explanation. Please try again.');
    } finally {
      setExplainBackLoading(prev => ({ ...prev, [noteIndex]: false }));
    }
  };

  // Animated Stat Box for Overview stats
  const AnimatedStatBox: React.FC<{ value: number; label: string; bgColor: string; textColor: string }> = ({ value, label, bgColor, textColor }) => {
    const { value: animatedValue, ref } = useCountUp({ end: value, duration: 2000 });
    return (
      <div ref={ref} className={`text-center p-4 ${bgColor} rounded-lg`}>
        <div className={`text-2xl font-bold ${textColor}`}>{animatedValue}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </div>
    );
  };

  if (isPendingCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button onClick={onBack} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="h-5 w-5" /><span>Back to Dashboard</span>
          </button>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mb-6">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Preparing your course</h1>
            <p className="text-gray-600 mb-6">
              We are generating lessons, quizzes, and flashcards. This can take a minute.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {[
                'Curating lesson structure',
                'Building quizzes and flashcards',
                'Personalizing study materials'
              ].map((item, index) => (
                <div key={index} className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-blue-50/60 p-4">
                  <p className="text-sm font-semibold text-gray-900">Step {index + 1}</p>
                  <p className="text-sm text-gray-600 mt-1">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-6">You can keep this page open while we finish.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {showCompletionConfetti && (
        <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
          {Array.from({ length: 24 }).map((_, index) => (
            <span
              key={`completion-confetti-${index}`}
              className="absolute h-2 w-2 rounded-full opacity-80 course-confetti"
              style={{
                left: `${(index * 9) % 100}%`,
                top: `${(index * 7) % 20}%`,
                background: ['#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ef4444'][index % 5],
                animationDelay: `${index * 0.06}s`
              }}
            />
          ))}
          <style>{`
            .course-confetti { animation: course-confetti-fall 2.8s ease-in-out forwards; }
            @keyframes course-confetti-fall {
              0% { transform: translateY(-20px) rotate(0deg); opacity: 0.9; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button onClick={onBack} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-5 w-5" /><span>Back to Dashboard</span>
          </button>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 mb-6 lg:mb-0 lg:pr-8">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">{course.category || 'General'}</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">{course.level || 'Intermediate'}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                <p className="text-gray-600 mb-4">{course.description}</p>
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1"><Clock className="h-4 w-4" /><span>{course.duration}</span></div>
                  <div className="flex items-center space-x-1"><Users className="h-4 w-4" /><span>{course.studentsEnrolled || 0} students</span></div>
                  <div className="flex items-center space-x-1"><Star className="h-4 w-4 text-yellow-500" /><span>{course.rating || 0} rating</span></div>
                  <div className="flex items-center space-x-1"><Play className="h-4 w-4" /><span>{course.totalLessons || course.lessons?.length || 8} lessons</span></div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">Instructor: <span className="font-medium text-gray-900">{course.instructor || 'AI Generated'}</span></div>
                  {course.certificate && (<div className="flex items-center space-x-1 text-sm text-green-600"><Award className="h-4 w-4" /><span>Certificate included</span></div>)}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Course Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{course.progress}%</p>
                  <p className="text-sm text-gray-500">{course.completedLessons || 0} of {course.totalLessons || course.lessons?.length || 8} lessons</p>
                </div>
                <div className="w-48">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all" style={{ width: `${course.progress}%` }}></div>
                  </div>
                </div>
                {/* Claim Certificate - appears at 100% */}
                {course.progress >= 100 && (
                  <button
                    id="claim-certificate-btn"
                    onClick={() => void generateCertificate(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-orange-200"
                    disabled={isGeneratingCertificate}
                  >
                    {isGeneratingCertificate ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Award className="h-5 w-5" />
                        <span>{certificateData ? 'View Certificate' : 'Claim Certificate'}</span>
                      </>
                    )}
                  </button>
                )}
                {certificateError && (
                  <p className="text-xs text-red-600">{certificateError}</p>
                )}
                <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 transition-colors">
                  <Download className="h-4 w-4" /><span>Download Resources</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Course Content</h3>
              <div className="space-y-2 mb-6">
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-700 hover:bg-gray-50'}`}>
                    {tab.icon}<span>{tab.label}</span>
                  </button>
                ))}
              </div>
              {activeTab === 'lessons' && course.lessons && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Curriculum</h4>
                  {adaptiveLessons.map((entry, index) => (
                    <button key={entry.lesson.id} onClick={() => setSelectedLessonIndex(index)}
                      className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors border ${selectedLessonIndex === index ? 'bg-purple-50 text-purple-600 border-purple-200' : 'text-gray-600 hover:bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{entry.lesson.title}</span>
                        {entry.lesson.isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500"><Clock className="h-3 w-3" /><span>{entry.lesson.duration}</span></div>
                    </button>
                  ))}
                </div>
              )}
              {activeTab === 'notes' && course.notes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Sections</h4>
                  {course.notes.map((note, index) => (
                    <div key={note.title + index} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 border border-gray-200">
                      <span className="font-medium">{note.title}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Topics Covered</h4>
                <div className="space-y-1">
                  {course.topics.slice(0, 5).map((topic, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm"><CheckCircle className="h-4 w-4 text-green-500" /><span className="text-gray-700">{topic}</span></div>
                  ))}
                  {course.topics.length > 5 && <div className="text-xs text-gray-500 mt-2">+{course.topics.length - 5} more topics</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              {activeTab === 'overview' && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Overview</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <AnimatedStatBox value={course.totalLessons || course.lessons?.length || 8} label="Lessons" bgColor="bg-blue-50" textColor="text-blue-600" />
                    <AnimatedStatBox value={course.completedLessons || 0} label="Completed" bgColor="bg-green-50" textColor="text-green-600" />
                    <AnimatedStatBox value={course.quizzes?.length || 0} label="Quizzes" bgColor="bg-purple-50" textColor="text-purple-600" />
                    <AnimatedStatBox value={course.flashcards?.length || 0} label="Flashcards" bgColor="bg-orange-50" textColor="text-orange-600" />
                  </div>
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Course</h3>
                    <div className="prose max-w-none"><p className="text-gray-700 leading-relaxed">{course.summary || `This comprehensive course covers ${course.topics.slice(0, 3).join(', ')} and more.`}</p></div>
                  </div>
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Learn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.topics.slice(0, 6).map((topic, index) => (
                        <div key={index} className="flex items-center space-x-2"><CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /><span className="text-gray-700">{topic}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-50 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Smart Study Sprints</h3>
                          <p className="text-sm text-gray-600">Auto-stitched sprint plan for focused learning.</p>
                        </div>
                        <Zap className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {[15, 25, 45].map((minutes) => (
                          <button
                            key={minutes}
                            onClick={() => buildSprintPlan(minutes as 15 | 25 | 45)}
                            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                              sprintMinutes === minutes ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-200'
                            }`}
                          >
                            {minutes} min
                          </button>
                        ))}
                      </div>
                      {sprintPlan.length > 0 ? (
                        <div className="space-y-3">
                          {sprintPlan.map((step, index) => (
                            <div key={`${step.title}-${index}`} className="rounded-xl bg-white p-4 border border-gray-100">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-indigo-700">Step {index + 1}</span>
                                {step.tab && (
                                  <button
                                    onClick={() => setActiveTab(step.tab)}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                  >
                                    Open
                                  </button>
                                )}
                              </div>
                              <p className="text-sm font-semibold text-gray-900 mt-1">{step.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{step.detail}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Select a sprint to generate your plan.</p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Course DNA</h3>
                          <p className="text-sm text-gray-600">Learning style profile based on your content mix.</p>
                        </div>
                        <Sparkles className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="space-y-3">
                        {styleScores.map((item) => (
                          <div key={item.key}>
                            <div className="flex items-center justify-between text-sm text-gray-700">
                              <span className="font-medium">{item.label}</span>
                              <span>{Math.round((item.value / totalStyleScore) * 100)}%</span>
                            </div>
                            <div className="mt-1 h-2 bg-white rounded-full">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                style={{ width: `${Math.round((item.value / totalStyleScore) * 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-sm text-gray-700">
                        Primary style: <span className="font-semibold text-gray-900">{primaryStyle}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => setAdaptiveOrder(!adaptiveOrder)}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                            adaptiveOrder ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-purple-700 border-purple-200'
                          }`}
                        >
                          {adaptiveOrder ? 'Adaptive order on' : 'Adaptive order off'}
                        </button>
                        <button
                          onClick={() => setActiveTab('insights')}
                          className="px-3 py-2 rounded-lg text-xs font-semibold border border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          View Insights
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => setActiveTab('lessons')} className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"><Play className="h-5 w-5" /><span>Start Learning</span></button>
                    <button onClick={() => setActiveTab('quiz')} className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"><HelpCircle className="h-5 w-5" /><span>Take Quiz</span></button>
                    <button onClick={() => setActiveTab('flashcards')} className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"><Layers className="h-5 w-5" /><span>Review Flashcards</span></button>
                    <button onClick={() => setShowLearningPath(true)} className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity shadow-lg"><Target className="h-5 w-5" /><span>Set Learning Goal</span></button>
                  </div>
                </div>
              )}

              {activeTab === 'insights' && (
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-amber-900">Mastery Score</p>
                        <Trophy className="h-5 w-5 text-amber-600" />
                      </div>
                      <p className="mt-3 text-3xl font-bold text-amber-900">{masteryScore}%</p>
                      <p className="text-xs text-amber-700 mt-1">Blends completion progress and explain-back quality.</p>
                    </div>
                    <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-pink-50 p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-rose-900">Learning Quest</p>
                        <Flame className="h-5 w-5 text-rose-600" />
                      </div>
                      <p className="mt-3 text-3xl font-bold text-rose-900">{Math.min(100, questCompletion)}%</p>
                      <p className="text-xs text-rose-700 mt-1">Complete lessons and explain concepts to level up.</p>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-blue-900">Explain-Back Avg</p>
                        <Award className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="mt-3 text-3xl font-bold text-blue-900">{explainBackAverage}%</p>
                      <p className="text-xs text-blue-700 mt-1">Based on your AI-graded concept explanations.</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Strategic Learning Insights</h3>
                      <button
                        onClick={() => setActiveTab('notes')}
                        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        Open Notes
                      </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {strategicInsights.slice(0, 6).map((insight, index) => (
                        <div key={`${insight.title}-${index}`} className="rounded-xl bg-white border border-emerald-100 p-4">
                          <p className="text-sm font-semibold text-gray-900">{insight.title}</p>
                          <p className="text-xs text-gray-600 mt-2"><strong>Why:</strong> {insight.whyItMatters}</p>
                          <p className="text-xs text-gray-600 mt-2"><strong>Apply today:</strong> {insight.applyItToday}</p>
                          <p className="text-xs text-emerald-700 mt-2"><strong>Success metric:</strong> {insight.successMetric}</p>
                          {(insight.relatedTopics || []).length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {insight.relatedTopics?.slice(0, 3).map((topic, topicIndex) => (
                                <span key={`${topic}-${topicIndex}`} className="px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  {topic}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Topic Confidence Heatmap</h3>
                          <p className="text-sm text-gray-600">Confidence decays if topics are not revisited.</p>
                        </div>
                        <BarChart3 className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {(course.topics.length ? course.topics : ['Core Concepts']).map((topic, index) => {
                          const normalized = normalizeTopic(topic) || 'General';
                          const score = getDecayedScore(normalized);
                          const color = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-yellow-500' : score >= 25 ? 'bg-orange-500' : 'bg-red-500';
                          return (
                            <div key={`${topic}-${index}`} className="rounded-xl border border-gray-100 p-3">
                              <p className="text-xs font-semibold text-gray-700 mb-2">{topic}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-100 rounded-full">
                                  <div className={`h-2 rounded-full ${color}`} style={{ width: `${score}%` }} />
                                </div>
                                <span className="text-xs font-semibold text-gray-700">{score}%</span>
                              </div>
                              <p className="text-[10px] text-gray-500 mt-2">Decay applied from last review.</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Adaptive Lesson Flow</h3>
                          <p className="text-sm text-gray-600">Reorder lessons to match your learning DNA.</p>
                        </div>
                        <Sparkles className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Adaptive order</p>
                            <p className="text-xs text-gray-500">Prioritize {primaryStyle.toLowerCase()} lessons.</p>
                          </div>
                          <button
                            onClick={() => setAdaptiveOrder(!adaptiveOrder)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                              adaptiveOrder ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {adaptiveOrder ? 'On' : 'Off'}
                          </button>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Reading density</p>
                            <p className="text-xs text-gray-500">Adjust lesson text density.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {(['compact', 'comfortable'] as const).map((mode) => (
                              <button
                                key={mode}
                                onClick={() => setReadingDensity(mode)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                  readingDensity === mode ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {mode}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Micro-Syllabus</h3>
                    {lastMicroSyllabus.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {lastMicroSyllabus.map((step, index) => (
                          <div key={`${step.title}-${index}`} className="rounded-xl bg-white p-4 border border-gray-100">
                            <p className="text-xs font-semibold text-indigo-700">Step {index + 1}</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{step.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{step.detail}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">Complete a quiz to generate your personalized micro-syllabus.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'summary' && (
                <div className="p-8">
                  <CourseSummary title={course.title}
                    summary={course.summary || `This comprehensive course covers ${course.topics.slice(0, 3).join(', ')} and more.`}
                    whatYouLearn={course.whatYouLearn || course.topics.slice(0, 5).map(t => `Master ${t}`)}
                    requirements={course.requirements || ['No prior experience required', 'A computer with internet connection', 'Willingness to learn']}
                    topics={course.topics || []} duration={course.duration || '10 hours'}
                    totalLessons={course.totalLessons || course.lessons?.length || 8} level={course.level || 'Beginner'} />
                </div>
              )}

              {activeTab === 'smartlab' && (
                <div className="p-8">
                  <SmartLearningLab courseId={course._id || course.id || ''} courseTopics={course.topics || []} />
                </div>
              )}

              {activeTab === 'lessons' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Lesson Content */}
                  <div className="lg:col-span-2">
                    {currentLesson ? (
                      <div>
                        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg overflow-hidden">
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="relative p-8 text-white">
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">Lesson {selectedLessonIndex + 1} of {adaptiveLessons.length}</span>
                              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium flex items-center"><Clock className="h-3 w-3 mr-1" />{currentLesson.duration}</span>
                            </div>
                            <h2 className="text-3xl font-bold mb-2">{currentLesson.title}</h2>
                            <p className="text-blue-100 text-lg max-w-3xl">{currentLesson.description}</p>
                          </div>
                          <div className="absolute top-4 right-4 opacity-20"><BookOpen className="h-32 w-32" /></div>
                        </div>
                        <div className="p-8">
                          <div className="flex items-center justify-between mb-6">
                            <div><h3 className="text-xl font-semibold text-gray-900 mb-1">Lesson Content</h3><p className="text-gray-500 text-sm">Read through the material below to complete this lesson</p></div>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500">{currentLesson.duration}</span>
                              {!currentLesson.isCompleted && (<button onClick={() => handleLessonComplete(selectedLessonIndex)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">Mark Complete</button>)}
                              {currentLesson.isCompleted && (<div className="flex items-center space-x-2 text-green-600"><CheckCircle className="h-5 w-5" /><span className="text-sm font-medium">Completed</span></div>)}
                            </div>
                          </div>
                          <div className="prose max-w-none mb-8"><div className={`text-gray-700 whitespace-pre-line ${lessonContentClass}`}>{currentLesson.content}</div></div>
                          {currentLesson.resources && currentLesson.resources.length > 0 && (
                            <div className="mb-8">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lesson Resources</h3>
                              <div className="space-y-3">
                                {currentLesson.resources.map((resource) => (
                                  <div key={resource.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">{getResourceIcon(resource.type)}<div><p className="font-medium text-gray-900">{resource.title}</p>{resource.size && <p className="text-sm text-gray-500">{resource.size}</p>}</div></div>
                                    <button className="text-blue-600 hover:text-blue-700 font-medium">Download</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
                            <button onClick={() => setSelectedLessonIndex(Math.max(0, selectedLessonIndex - 1))} disabled={selectedLessonIndex === 0}
                              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                              <ArrowLeft className="h-4 w-4" /><span>Previous Lesson</span>
                            </button>
                            <span className="text-sm text-gray-500">Lesson {selectedLessonIndex + 1} of {adaptiveLessons.length}</span>
                            <button onClick={() => setSelectedLessonIndex(Math.min(adaptiveLessons.length - 1, selectedLessonIndex + 1))} disabled={selectedLessonIndex === adaptiveLessons.length - 1}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700">
                              <span>Next Lesson</span><ArrowLeft className="h-4 w-4 rotate-180" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center"><Play className="h-16 w-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-semibold text-gray-900 mb-2">No Lessons Available</h3><p className="text-gray-600">Lessons will be generated based on your course content.</p></div>
                    )}
                  </div>

                  {/* Sticky Sidebar Notepad */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-8">
                      {currentLesson && <LessonNotepad courseId={course._id || course.id || ''} lessonId={currentLesson.id} />}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Tab with AI / Personal toggle */}
              {activeTab === 'notes' && (
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <button onClick={() => setNotesMode('ai')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${notesMode === 'ai' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      <Bot className="h-4 w-4" /> AI Notes
                    </button>
                    <button onClick={() => setNotesMode('personal')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${notesMode === 'personal' ? 'bg-yellow-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      <PenLine className="h-4 w-4" /> My Notes
                    </button>
                  </div>
                  {notesMode === 'ai' ? (
                    <>
                      <h4 className="text-sm font-medium text-gray-600 mb-4">AI-Generated Summaries</h4>
                      <div className="flex items-center gap-3 mb-5">
                        <input
                          value={notesQuery}
                          onChange={(e) => setNotesQuery(e.target.value)}
                          placeholder="Search notes by keyword..."
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                        <span className="text-xs text-gray-500">{filteredNotes.length} sections</span>
                      </div>
                      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <p className="text-sm font-semibold text-blue-900 mb-2">Key Takeaways</p>
                        <div className="flex flex-wrap gap-2">
                          {(course.notes || []).slice(0, 3).map((note, idx) => (
                            <span key={`${note.title}-${idx}`} className="text-xs font-semibold bg-white text-blue-700 border border-blue-100 px-2 py-1 rounded-full">
                              {note.title}
                            </span>
                          ))}
                        </div>
                        {strategicInsights.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-blue-100">
                            <p className="text-xs font-semibold text-blue-800 mb-2">Insight Actions</p>
                            <div className="space-y-2">
                              {strategicInsights.slice(0, 2).map((insight, idx) => (
                                <div key={`${insight.title}-${idx}`} className="text-xs text-blue-700 bg-white rounded-lg px-3 py-2 border border-blue-100">
                                  <strong>{insight.title}:</strong> {insight.applyItToday}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        {filteredNotes.map((note, index) => (
                          <div key={note.title + index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <div className="font-semibold text-lg mb-3">{note.title}</div>
                            <ul className="list-disc ml-5 text-sm text-gray-600 space-y-2">
                              {(Array.isArray(note.summary) ? note.summary : [note.summary]).map((s: string | undefined, i: number) => (
                                s ? <li key={i}><span className="inline"><ReactMarkdown components={{p: 'span'}}>{s}</ReactMarkdown></span></li> : null
                              ))}
                            </ul>

                            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                              <div className="text-sm font-semibold text-blue-900 mb-2">Explain Back (AI Evaluator)</div>
                              <p className="text-xs text-blue-700 mb-3">Explain this concept in your own words, then get an AI score and targeted feedback.</p>

                              <textarea
                                value={explainBackInputs[index] || ''}
                                onChange={(e) => setExplainBackInputs(prev => ({ ...prev, [index]: e.target.value }))}
                                placeholder="Explain this concept in your own words..."
                                className="w-full min-h-[120px] rounded-lg border border-blue-200 bg-white p-3 text-sm text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                              />

                              <button
                                onClick={() => handleExplainBackEvaluate(note, index)}
                                disabled={!!explainBackLoading[index]}
                                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {explainBackLoading[index] ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Evaluating...
                                  </>
                                ) : (
                                  'Evaluate Explanation'
                                )}
                              </button>

                              {explainBackResults[index] && (
                                <div className="mt-3 rounded-lg border border-blue-100 bg-white p-3">
                                  <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-800">Score</span>
                                    <span className="rounded-full bg-blue-100 px-2 py-1 text-sm font-bold text-blue-700">
                                      {explainBackResults[index].score}/10
                                    </span>
                                  </div>

                                  <p className="text-sm text-gray-700 mb-2">{explainBackResults[index].feedback}</p>
                                  {explainBackResults[index].strengths.length > 0 && (
                                    <p className="text-xs text-green-700 mb-1">
                                      <strong>Strengths:</strong> {explainBackResults[index].strengths.join(', ')}
                                    </p>
                                  )}
                                  {explainBackResults[index].missingPoints.length > 0 && (
                                    <p className="text-xs text-red-700 mb-1">
                                      <strong>Missing points:</strong> {explainBackResults[index].missingPoints.join(', ')}
                                    </p>
                                  )}
                                  <p className="text-xs text-blue-700">
                                    <strong>Improve:</strong> {explainBackResults[index].improvementTip}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Your Personal Notes</h4>
                      <p className="text-xs text-gray-400 mb-3">Notes are auto-saved to your browser.</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {[
                          { label: 'Lesson Summary', value: 'Lesson Summary:\n- Key idea:\n- Example:\n- Open questions:\n\n' },
                          { label: 'Flashcard Drafts', value: 'Flashcard Drafts:\n1) Q: \n   A: \n2) Q: \n   A: \n\n' },
                          { label: 'Exam Prep', value: 'Exam Prep:\n- Must-know concepts:\n- Common mistakes:\n- Quick formulas:\n\n' }
                        ].map((template) => (
                          <button
                            key={template.label}
                            onClick={() => setPersonalNotes((prev) => `${template.value}${prev}`)}
                            className="text-xs font-semibold rounded-full border border-yellow-200 px-3 py-1 bg-yellow-50 text-yellow-700"
                          >
                            {template.label}
                          </button>
                        ))}
                      </div>
                      <textarea value={personalNotes} onChange={handlePersonalNotesChange}
                        placeholder={"Write your personal notes for this course here...\n\nTip: Summarize key concepts, add questions, or jot down ideas."}
                        className="w-full min-h-[300px] bg-white border border-gray-200 rounded-xl p-4 text-gray-800 placeholder-gray-400 resize-y focus:ring-2 focus:ring-yellow-400 focus:outline-none text-sm leading-relaxed" />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'quiz' && (
                <div className="p-8">
                  <QuizComponent
                    quizzes={course.quizzes}
                    courseId={course._id}
                    onComplete={handleQuizComplete}
                    onQuizzesUpdated={(updatedQuizzes) => { onUpdateCourse({ ...course, quizzes: updatedQuizzes }); }}
                    onQuizResults={(results, score) => {
                      updateConfidenceFromQuiz(results);
                      const weakTopics = results.filter(r => !r.isCorrect).map(r => r.topic || '').filter(Boolean);
                      const unique = Array.from(new Set(weakTopics)).slice(0, 3);
                      const plan = unique.length > 0
                        ? unique.map((topic, index) => ({
                            title: index === 0 ? `Review: ${topic}` : index === 1 ? `Practice: ${topic}` : `Apply: ${topic}`,
                            detail: index === 0
                              ? 'Revisit the lesson and write 3 takeaways.'
                              : index === 1
                              ? 'Run a flashcard sprint on this topic.'
                              : 'Answer 3 quick quiz questions.'
                          }))
                        : [
                            { title: 'Review strengths', detail: 'Summarize your top lesson in 3 bullets.' },
                            { title: 'Flashcard sprint', detail: 'Do 5 fast recall cards.' },
                            { title: 'Mini quiz', detail: 'Answer 3 rapid questions.' }
                          ];
                      setLastMicroSyllabus(plan);
                    }}
                  />
                </div>
              )}

              {activeTab === 'flashcards' && (
                <div className="p-8">
                  <FlashcardsComponent flashcards={course.flashcards} onComplete={handleFlashcardComplete} courseId={course._id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Certificate Modal */}
      {showCertificate && certificateData && (
        <CertificateViewer certificate={certificateData} onClose={() => setShowCertificate(false)} />
      )}
      {/* Learning Path Modal */}
      <LearningPathModal
        isOpen={showLearningPath}
        onClose={() => setShowLearningPath(false)}
        courseId={course._id || course.id || ''}
        courseTitle={course.title}
        totalLessons={course.totalLessons || course.lessons?.length || 8}
        completedLessons={course.completedLessons || 0}
      />
    </div>
  );
};

export default CourseViewer;


