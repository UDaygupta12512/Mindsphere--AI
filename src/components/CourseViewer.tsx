import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, BookOpen, HelpCircle, Layers, Download, CheckCircle, Play, Clock, Users, Star, Award, FileText, Link, Code, Image, FileSearch, StickyNote, PenLine, Bot, Target } from 'lucide-react';
import { Course } from '../types/course';
import { Certificate } from '../types/achievement';
import QuizComponent from './QuizComponent';
import FlashcardsComponent from './FlashcardsComponent';
import CourseSummary from './CourseSummary';
import CertificateViewer from './Certificate';
import LearningPathModal from './LearningPathModal';
import { coursesApi } from '../lib/api';
import { useCountUp } from '../hooks/useCountUp';
import { safeSetItem, safeGetItem } from '../utils/localStorage';

interface CourseViewerProps {
  course: Course;
  onBack: () => void;
  onUpdateCourse: (course: Course) => void;
  userName?: string;
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
        placeholder="✍️ Write your notes for this lesson here…

• Key concepts
• Questions to review
• Important points
• Your thoughts"
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

const CourseViewer: React.FC<CourseViewerProps> = ({ course, onBack, onUpdateCourse, userName, refreshCourses }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'summary' | 'lessons' | 'notes' | 'quiz' | 'flashcards'>('overview');
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [notesMode, setNotesMode] = useState<'ai' | 'personal'>('ai');
  const [showCertificate, setShowCertificate] = useState(false);
  const [showLearningPath, setShowLearningPath] = useState(false);

  const PERSONAL_NOTES_KEY = `mindsphere-personal-notes-${course._id || course.id}`;
  const [personalNotes, setPersonalNotes] = useState('');
  useEffect(() => { setPersonalNotes(localStorage.getItem(PERSONAL_NOTES_KEY) || ''); }, [PERSONAL_NOTES_KEY]);
  const handlePersonalNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPersonalNotes(e.target.value);
    localStorage.setItem(PERSONAL_NOTES_KEY, e.target.value);
  };

  const buildCertificate = (): Certificate => ({
    id: `cert-${course._id}`, courseId: course._id, courseTitle: course.title,
    userName: userName || 'Learner', completionDate: new Date(), certificateUrl: '',
    verificationCode: `MS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`,
    issuedBy: 'MindSphere AI',
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'summary', label: 'Summary', icon: <FileSearch className="h-4 w-4" /> },
    { id: 'lessons', label: 'Lessons', icon: <Play className="h-4 w-4" /> },
    { id: 'notes', label: 'Notes', icon: <FileText className="h-4 w-4" /> },
    { id: 'quiz', label: 'Quiz', icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Layers className="h-4 w-4" /> },
  ];

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
  };

  const handleLessonComplete = async (lessonIndex: number) => {
    const updatedLessons = [...course.lessons];
    updatedLessons[lessonIndex] = { ...updatedLessons[lessonIndex], isCompleted: true };
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
  };

  const currentLesson = course.lessons && course.lessons[selectedLessonIndex];

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'link': return <Link className="h-4 w-4" />;
      case 'code': return <Code className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
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
                {course.progress >= 100 && course.certificate && (
                  <button id="claim-certificate-btn" onClick={() => setShowCertificate(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-orange-200 animate-pulse hover:animate-none">
                    <Award className="h-5 w-5" /><span>🎉 Claim Certificate</span>
                  </button>
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
                  {course.lessons.map((lesson, index) => (
                    <button key={lesson.id} onClick={() => setSelectedLessonIndex(index)}
                      className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors border ${selectedLessonIndex === index ? 'bg-purple-50 text-purple-600 border-purple-200' : 'text-gray-600 hover:bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{lesson.title}</span>
                        {lesson.isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500"><Clock className="h-3 w-3" /><span>{lesson.duration}</span></div>
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
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => setActiveTab('lessons')} className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"><Play className="h-5 w-5" /><span>Start Learning</span></button>
                    <button onClick={() => setActiveTab('quiz')} className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"><HelpCircle className="h-5 w-5" /><span>Take Quiz</span></button>
                    <button onClick={() => setActiveTab('flashcards')} className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"><Layers className="h-5 w-5" /><span>Review Flashcards</span></button>
                    <button onClick={() => setShowLearningPath(true)} className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity shadow-lg"><Target className="h-5 w-5" /><span>Set Learning Goal</span></button>
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
                              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">Lesson {selectedLessonIndex + 1} of {course.lessons.length}</span>
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
                          <div className="prose max-w-none mb-8"><div className="text-gray-700 leading-relaxed whitespace-pre-line">{currentLesson.content}</div></div>
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
                            <span className="text-sm text-gray-500">Lesson {selectedLessonIndex + 1} of {course.lessons.length}</span>
                            <button onClick={() => setSelectedLessonIndex(Math.min(course.lessons.length - 1, selectedLessonIndex + 1))} disabled={selectedLessonIndex === course.lessons.length - 1}
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
                      <div className="space-y-4">
                        {course.notes.map((note, index) => (
                          <div key={note.title + index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <div className="font-semibold text-lg mb-3">{note.title}</div>
                            <ul className="list-disc ml-5 text-sm text-gray-600 space-y-2">
                              {(Array.isArray(note.summary) ? note.summary : [note.summary]).map((s: string | undefined, i: number) => (
                                s ? <li key={i}><span className="inline"><ReactMarkdown components={{p: 'span'}}>{s}</ReactMarkdown></span></li> : null
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Your Personal Notes</h4>
                      <p className="text-xs text-gray-400 mb-3">Notes are auto-saved to your browser.</p>
                      <textarea value={personalNotes} onChange={handlePersonalNotesChange}
                        placeholder={"Write your personal notes for this course here…\n\nTip: Summarize key concepts, add questions, or jot down ideas."}
                        className="w-full min-h-[300px] bg-white border border-gray-200 rounded-xl p-4 text-gray-800 placeholder-gray-400 resize-y focus:ring-2 focus:ring-yellow-400 focus:outline-none text-sm leading-relaxed" />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'quiz' && (
                <div className="p-8">
                  <QuizComponent quizzes={course.quizzes} courseId={course._id} onComplete={handleQuizComplete}
                    onQuizzesUpdated={(updatedQuizzes) => { onUpdateCourse({ ...course, quizzes: updatedQuizzes }); }} />
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
      {showCertificate && <CertificateViewer certificate={buildCertificate()} onClose={() => setShowCertificate(false)} />}
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
