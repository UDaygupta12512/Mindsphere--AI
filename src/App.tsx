import { useState, useEffect, useCallback } from 'react';
import { useDarkMode } from './hooks/useDarkMode';
import { useStreak } from './hooks/useStreak';
import Header from './components/Header';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import CourseCreator from './components/CourseCreator';
import CourseViewer from './components/CourseViewer';
import ChatBot from './components/ChatBot';
import AuthModal from './components/AuthModal';
import CourseCatalog from './components/CourseCatalog';
import CourseDetail from './components/CourseDetail';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ReviewDashboard from './components/ReviewDashboard';
import SettingsPage from './components/SettingsPage';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import CTASection from './components/CTASection';
import AITutorSection from './components/AITutorSection';
import StudyTools from './components/StudyTools';
import Footer from './components/Footer';
import { Course } from './types/course';
import { User } from './types/auth';
import { CatalogCourse } from './utils/catalogData';
import { coursesApi, catalogApi, api, removeToken, authEvents, authApi, setToken } from './lib/api';

function App() {
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { currentStreak: localCurrentStreak, longestStreak: localLongestStreak } = useStreak();
  const [currentStreak, setCurrentStreak] = useState(localCurrentStreak);
  const [longestStreak, setLongestStreak] = useState(localLongestStreak);
  // Get initial view from URL hash
  const getViewFromHash = () => {
    const hash = window.location.hash.slice(1); // Remove #
    const validViews = ['home', 'catalog', 'catalog-detail', 'dashboard', 'create', 'course', 'chatbot', 'analytics', 'review', 'settings'];
    return validViews.includes(hash) ? hash : 'home';
  };

  const [currentView, setCurrentView] = useState(getViewFromHash);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedCatalogCourse, setSelectedCatalogCourse] = useState<CatalogCourse | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingView, setPendingView] = useState<string | null>(null);

  // First-visit behavior: skip tour and let users explore the site immediately
  useEffect(() => {
    const firstVisitKey = 'ms-first-visit-complete';
    const hasVisited = localStorage.getItem(firstVisitKey);

    if (!hasVisited) {
      localStorage.setItem(firstVisitKey, 'true');
      localStorage.setItem('ms-tour-skipped', 'true');

      if (!window.location.hash || window.location.hash === '#home') {
        setCurrentView('catalog');
        window.history.replaceState({ view: 'catalog' }, '', '#catalog');
      }
    }
  }, []);

  // Initialize auth and load user data on app start
  useEffect(() => {
    const initializeApp = async () => {
      const rememberMe = localStorage.getItem('ms-remember-me') === 'true';
      const savedEmail = localStorage.getItem('ms-remember-email');
      const savedPassword = localStorage.getItem('ms-remember-password');
      let authedUser: User | null = null;

      if (rememberMe && savedEmail && savedPassword) {
        try {
          const response = await authApi.login({
            email: savedEmail,
            password: savedPassword
          });
          setToken(response.token);
          setUser(response.user as User);
          authedUser = response.user as User;
        } catch (error) {
          console.error('Auto-login failed:', error);
        }
      }

      try {
        if (!authedUser) {
          return;
        }
        // Load user's courses
        const userCourses = await coursesApi.getAll();
        setCourses(userCourses.map(course => ({
          ...course,
          id: course._id,
          createdAt: new Date(course.createdAt),
          lastAccessed: course.lastAccessed ? new Date(course.lastAccessed) : undefined
        } as unknown as Course)));

        // Get all catalog courses to map titles back to IDs
        const catalogData = await catalogApi.getAll();

        // Extract enrolled course titles from catalog courses
        const enrolledTitles = userCourses
          .filter(c => c.sourceType === 'catalog')
          .map(c => c.title);

        // Map titles to catalog IDs
        const catalogIds = catalogData
          .filter(cat => enrolledTitles.includes(cat.title))
          .map(cat => (cat as { id?: string }).id)
          .filter((id): id is string => id !== undefined);

        setEnrolledCourseIds(catalogIds);

        try {
          const analytics = await api.get<any>('/api/analytics');
          const overview = analytics?.data?.overview || analytics?.overview;
          if (overview) {
            setCurrentStreak(overview.currentStreak || 0);
            setLongestStreak(overview.longestStreak || 0);
          }
        } catch (error) {
          console.error('Error loading streak analytics:', error);
        }
      } catch (error) {
        console.error('Error initializing app course data:', error);
        // Do not clear the token here so the user remains successfully signed in even if the backend fails
      }
    };

    initializeApp();
  }, []);

  // Save user to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('edusynth-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('edusynth-user');
    }
  }, [user]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const view = getViewFromHash();
      setCurrentView(view);
      setSelectedCourse(null);
      setSelectedCatalogCourse(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Subscribe to auth events (token expiry) for automatic logout
  useEffect(() => {
    const unsubscribe = authEvents.subscribe((event) => {
      if (event === 'tokenExpired') {
        setUser(null);
        setCourses([]);
        setEnrolledCourseIds([]);
        setCurrentView('home');
        // Show auth modal so user can log back in
        setIsAuthModalOpen(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Update URL hash when view changes
  const updateUrlHash = useCallback((view: string) => {
    const newHash = view === 'home' ? '' : `#${view}`;
    if (window.location.hash !== newHash && window.location.hash !== `#${view}`) {
      window.history.pushState({ view }, '', newHash || window.location.pathname);
    }
  }, []);

  const handleNavigate = (view: string) => {
    // Require authentication for certain views
    if (!user && ['dashboard', 'create', 'chatbot', 'analytics', 'review', 'settings'].includes(view)) {
      setPendingView(view);
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentView(view);
    updateUrlHash(view);
    setSelectedCourse(null);
    setSelectedCatalogCourse(null);
  };

  const handleGetStarted = () => {
    if (!user) {
      setPendingView('create');
      setIsAuthModalOpen(true);
    } else {
      setCurrentView('create');
      updateUrlHash('create');
    }
  };

  const handleViewExamples = () => {
    setCurrentView('catalog');
    updateUrlHash('catalog');
  };

  const handleAuth = async (userData: User) => {
    setUser(userData);
    // Navigate to pending view if set, otherwise dashboard
    const targetView = pendingView || 'dashboard';
    setCurrentView(targetView);
    updateUrlHash(targetView);
    setPendingView(null);

    // Fetch user's courses after authentication
    try {
      const userCourses = await coursesApi.getAll();
      setCourses(userCourses.map(course => ({
        ...course,
        id: course._id,
        createdAt: new Date(course.createdAt),
        lastAccessed: course.lastAccessed ? new Date(course.lastAccessed) : undefined
      } as unknown as Course)));

      // Get all catalog courses to map titles back to IDs
      const catalogData = await catalogApi.getAll();

      // Extract enrolled course titles
      const enrolledTitles = userCourses
        .filter(c => c.sourceType === 'catalog')
        .map(c => c.title);

      // Map titles to catalog IDs
      const catalogIds = catalogData
        .filter(cat => enrolledTitles.includes(cat.title))
        .map(cat => (cat as { id?: string }).id)
        .filter((id): id is string => id !== undefined);

      setEnrolledCourseIds(catalogIds);

      try {
        const analytics = await api.get<any>('/api/analytics');
        const overview = analytics?.data?.overview || analytics?.overview;
        if (overview) {
          setCurrentStreak(overview.currentStreak || 0);
          setLongestStreak(overview.longestStreak || 0);
        }
      } catch (error) {
        console.error('Error loading streak analytics:', error);
      }
    } catch (error) {
      console.error('Error loading courses after auth:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCourses([]);
    setEnrolledCourseIds([]);
    setCurrentView('home');
    updateUrlHash('home');
    removeToken();
    localStorage.removeItem('edusynth-user');
  };

  // Refresh courses from backend (for real-time updates)
  const refreshCourses = useCallback(async () => {
    if (!user) return;

    try {
      const userCourses = await coursesApi.getAll();
      setCourses(userCourses.map(course => ({
        ...course,
        id: course._id,
        createdAt: new Date(course.createdAt),
        lastAccessed: course.lastAccessed ? new Date(course.lastAccessed) : undefined
      } as unknown as Course)));
      try {
        const analytics = await api.get<any>('/api/analytics');
        const overview = analytics?.data?.overview || analytics?.overview;
        if (overview) {
          setCurrentStreak(overview.currentStreak || 0);
          setLongestStreak(overview.longestStreak || 0);
        }
      } catch (error) {
        console.error('Error refreshing streak analytics:', error);
      }
    } catch (error) {
      console.error('Error refreshing courses:', error);
    }
  }, [user]);

  const handleCourseCreated = (course: Course) => {
    setCourses(prev => {
      const exists = prev.some(c => c.id === course.id || c.title === course.title);
      if (exists) {
        return prev.map(c => (c.id === course.id || c.title === course.title) ? course : c);
      }
      return [course, ...prev];
    });
    setCurrentView('dashboard');
    updateUrlHash('dashboard');
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setCurrentView('course');
    updateUrlHash('course');
  };

  const handleUpdateCourse = async (updatedCourse: Course) => {
    setCourses(prev => prev.map(course =>
      (course._id || course.id) === (updatedCourse._id || updatedCourse.id) ? updatedCourse : course
    ));
    setSelectedCourse(updatedCourse);
    // Refresh to get latest data from backend
    await refreshCourses();
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    updateUrlHash('dashboard');
    setSelectedCourse(null);
  };

  const handleCatalogCourseSelect = (course: CatalogCourse) => {
    setSelectedCatalogCourse(course);
    setCurrentView('catalog-detail');
    updateUrlHash('catalog-detail');
  };

  const handleBackToCatalog = () => {
    setCurrentView('catalog');
    updateUrlHash('catalog');
    setSelectedCatalogCourse(null);
  };

  const handleEnrollCourse = async (catalogCourse: CatalogCourse) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const pendingCourse: Course = {
        _id: `pending-${catalogCourse.id}`,
        id: `pending-${catalogCourse.id}`,
        title: catalogCourse.title,
        description: catalogCourse.description || 'Generating your course content... ',
        sourceType: 'catalog',
        createdAt: new Date(),
        duration: catalogCourse.duration || '0h',
        topics: catalogCourse.topics || [],
        progress: 0,
        notes: [],
        quizzes: [],
        flashcards: [],
        summary: '',
        lessons: [],
        instructor: catalogCourse.instructor || 'AI Generated',
        rating: catalogCourse.rating || 0,
        studentsEnrolled: catalogCourse.studentsEnrolled || 0,
        level: catalogCourse.level || 'Beginner',
        category: catalogCourse.category || 'General',
        thumbnail: catalogCourse.thumbnail || '',
        totalLessons: catalogCourse.totalLessons || 0,
        completedLessons: 0,
        certificate: false,
        lastAccessed: new Date()
      } as Course;

      setSelectedCourse(pendingCourse);
      setCurrentView('course');
      updateUrlHash('course');

      const enrolledCourse = await catalogApi.enroll(catalogCourse.id);

      const courseWithId: Course = {
        ...enrolledCourse,
        id: enrolledCourse._id,
        createdAt: new Date(enrolledCourse.createdAt),
        lastAccessed: enrolledCourse.lastAccessed ? new Date(enrolledCourse.lastAccessed) : new Date()
      } as unknown as Course;

      // Check if course already exists to prevent duplicates
      setCourses(prev => {
        const exists = prev.some(c => c.id === courseWithId.id || c.title === courseWithId.title);
        if (exists) {
          // Update existing course instead of adding duplicate
          return prev.map(c => (c.id === courseWithId.id || c.title === courseWithId.title) ? courseWithId : c);
        }
        return [courseWithId, ...prev];
      });

      setEnrolledCourseIds(prev => {
        if (prev.includes(catalogCourse.id)) {
          return prev;
        }
        return [...prev, catalogCourse.id];
      });

      // Navigate directly to the enrolled course
      setSelectedCourse(courseWithId);
      
      // Also close auth modal just in case
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to enroll in course. Please try again.';
      alert(errorMessage);
      setSelectedCourse(null);
      setCurrentView('catalog-detail');
      updateUrlHash('catalog-detail');
    }
  };

  const handleStartLearning = (catalogCourse: CatalogCourse) => {
    // Find by title since catalog courses might have different IDs
    const enrolledCourse = courses.find(c => c.title === catalogCourse.title);
    if (enrolledCourse) {
      setSelectedCourse(enrolledCourse);
      setCurrentView('course');
      updateUrlHash('course');
    }
  };

  const handleCreateCourse = () => {
    setCurrentView('create');
    updateUrlHash('create');
  };

  const handleReviewClick = () => {
    setCurrentView('review');
    updateUrlHash('review');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <Hero onGetStarted={handleGetStarted} />
            <Features />
            <AITutorSection onNavigate={handleNavigate} />
            <StudyTools onNavigate={handleNavigate} />
            <HowItWorks />
            <CTASection onGetStarted={handleGetStarted} onViewExamples={handleViewExamples} />
            <Footer onNavigate={handleNavigate} />
          </>
        );
      case 'catalog':
        return (
          <CourseCatalog
            onCourseSelect={handleCatalogCourseSelect}
            enrolledCourseIds={enrolledCourseIds}
          />
        );
      case 'catalog-detail':
        return selectedCatalogCourse ? (
          <CourseDetail
            course={selectedCatalogCourse}
            isEnrolled={enrolledCourseIds.includes(selectedCatalogCourse.id)}
            onBack={handleBackToCatalog}
            onEnroll={handleEnrollCourse}
            onStartLearning={handleStartLearning}
          />
        ) : (
          <CourseCatalog
            onCourseSelect={handleCatalogCourseSelect}
            enrolledCourseIds={enrolledCourseIds}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            courses={courses}
            onSelectCourse={handleSelectCourse}
            onCreateCourse={handleCreateCourse}
            onNavigate={handleNavigate}
            userName={user?.name}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            onReviewClick={handleReviewClick}
          />
        );
      case 'create':
        return <CourseCreator onCourseCreated={handleCourseCreated} />;
      case 'course':
        return selectedCourse ? (
          <CourseViewer
            course={selectedCourse}
            onBack={handleBackToDashboard}
            onUpdateCourse={handleUpdateCourse}
            refreshCourses={refreshCourses}
          />
        ) : (
          <Dashboard
            key={`dashboard-${courses.length}-${courses.map(c => c.progress).join('-')}`}
            courses={courses}
            onSelectCourse={handleSelectCourse}
            onCreateCourse={handleCreateCourse}
            onNavigate={handleNavigate}
            userName={user?.name}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            onReviewClick={handleReviewClick}
          />
        );
      case 'chatbot':
        return <ChatBot courses={courses} />;
      case 'analytics':
        return <AnalyticsDashboard key={`analytics-${courses.length}-${courses.map(c => c.progress).join('-')}`} onNavigate={handleNavigate} />;
      case 'review':
        return <ReviewDashboard onBack={handleBackToDashboard} />;
      case 'settings':
        return <SettingsPage user={user} />;
      default:
        return <Hero onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header
        onNavigate={handleNavigate}
        currentView={currentView}
        user={user}
        onAuthClick={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        isDark={isDark}
        onToggleDark={toggleDark}
      />
      <main>
        {renderCurrentView()}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuth={handleAuth}
      />
    </div>
  );
}

export default App; 
