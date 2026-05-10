import React, { useEffect, useState } from 'react';
import { Download, Settings, Loader2, FileText, Sparkles, Target, PanelTop } from 'lucide-react';
import { api } from '../lib/api';
import { generateStudentReport } from '../utils/generateStudentReport';
import { User } from '../types/auth';

interface SettingsPageProps {
  user: User | null;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const DASHBOARD_PREFS_KEY = 'ms-dashboard-prefs';
  const PERSONA_KEY = 'ms-tutor-persona';
  const TONE_KEY = 'ms-tutor-tone';
  const FOCUS_MODE_KEY = 'ms-focus-mode';
  const FOCUS_SPRINT_KEY = 'ms-focus-sprint-minutes';
  const FOCUS_GOAL_KEY = 'ms-focus-goal-minutes';

  const defaultDashboardPrefs = {
    showPersona: true,
    showStreak: true,
    showTimer: true,
    showGoals: true,
    showTopicOfDay: true,
    showAutoPlan: true,
    showKnowledgeGraph: true
  };
  type DashboardPrefs = typeof defaultDashboardPrefs;

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [message, setMessage] = useState('');
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [goalReminders, setGoalReminders] = useState(false);
  const [autoQuiz, setAutoQuiz] = useState(true);
  const [focusMode, setFocusMode] = useState(() => localStorage.getItem(FOCUS_MODE_KEY) === 'true');
  const [dataSharing, setDataSharing] = useState(false);
  const [learningGoal, setLearningGoal] = useState(() => localStorage.getItem('ms-weekly-goal-minutes') || '60');
  const [tutorPersona, setTutorPersona] = useState(() => localStorage.getItem(PERSONA_KEY) || 'balanced');
  const [tutorTone, setTutorTone] = useState(() => localStorage.getItem(TONE_KEY) || 'warm');
  const [focusSprint, setFocusSprint] = useState(() => localStorage.getItem(FOCUS_SPRINT_KEY) || '25');
  const [focusGoalMinutes, setFocusGoalMinutes] = useState(() => localStorage.getItem(FOCUS_GOAL_KEY) || '60');
  const [dashboardPrefs, setDashboardPrefs] = useState<DashboardPrefs>(() => {
    const stored = localStorage.getItem(DASHBOARD_PREFS_KEY);
    if (!stored) return defaultDashboardPrefs;
    try {
      return { ...defaultDashboardPrefs, ...JSON.parse(stored) };
    } catch {
      return defaultDashboardPrefs;
    }
  });

  useEffect(() => {
    localStorage.setItem(DASHBOARD_PREFS_KEY, JSON.stringify(dashboardPrefs));
  }, [dashboardPrefs]);

  useEffect(() => {
    localStorage.setItem(PERSONA_KEY, tutorPersona);
    localStorage.setItem(TONE_KEY, tutorTone);
    localStorage.setItem(FOCUS_MODE_KEY, focusMode ? 'true' : 'false');
    localStorage.setItem(FOCUS_SPRINT_KEY, focusSprint);
    localStorage.setItem(FOCUS_GOAL_KEY, focusGoalMinutes);
    localStorage.setItem('ms-weekly-goal-minutes', learningGoal);
  }, [tutorPersona, tutorTone, focusMode, focusSprint, focusGoalMinutes, learningGoal]);

  const handleGenerateStudentReport = async () => {
    setIsGeneratingReport(true);
    setMessage('');

    try {
      const response = await api.get<{ success: boolean; data: any }>('/api/analytics');
      const analytics = response.data;

      await generateStudentReport(analytics, {
        name: user?.name,
        email: user?.email,
        enrollmentDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''
      });

      setMessage('Student report downloaded successfully.');
    } catch (error) {
      console.error('Error generating student report:', error);
      setMessage('Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const personaOptions = [
    { id: 'balanced', label: 'Balanced Mentor', description: 'Clear explanations with friendly tone.' },
    { id: 'storyteller', label: 'Storyteller', description: 'Uses narratives, characters, and vivid examples.' },
    { id: 'strategist', label: 'Strategist', description: 'Action-first guidance and plans.' },
    { id: 'analyst', label: 'Analyst', description: 'Precise reasoning and structured breakdowns.' }
  ];

  const toneOptions = [
    { id: 'warm', label: 'Warm', description: 'Encouraging and supportive.' },
    { id: 'crisp', label: 'Crisp', description: 'Direct and concise.' },
    { id: 'playful', label: 'Playful', description: 'Light, energetic, and fun.' }
  ];

  const dashboardOptions: Array<{ id: keyof DashboardPrefs; label: string }> = [
    { id: 'showPersona', label: 'Learning persona card' },
    { id: 'showStreak', label: 'Learning streak card' },
    { id: 'showTimer', label: 'Study timer widget' },
    { id: 'showGoals', label: 'Weekly goals tracker' },
    { id: 'showTopicOfDay', label: 'Topic of the day' },
    { id: 'showAutoPlan', label: 'Auto daily plan' },
    { id: 'showKnowledgeGraph', label: 'Knowledge graph' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-200/60 to-indigo-200/60 blur-2xl" />
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-gradient-to-br from-purple-200/50 to-pink-200/50 blur-2xl" />
          <div className="relative flex items-center gap-4 mb-3">
            <div className="p-3 rounded-2xl bg-indigo-100">
              <Settings className="h-7 w-7 text-indigo-700" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Tune your learning experience and download personalized reports.</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-blue-50/60 p-4">
              <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold">Profile</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{user?.name || 'Learner'}</p>
              <p className="text-sm text-gray-600">{user?.email || 'No email on file'}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-indigo-50/70 p-4">
              <p className="text-xs uppercase tracking-widest text-indigo-600 font-semibold">Member Since</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
              </p>
              <p className="text-sm text-gray-600">Active learning profile</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-purple-50/70 p-4">
              <p className="text-xs uppercase tracking-widest text-purple-600 font-semibold">Plan</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">Student</p>
              <p className="text-sm text-gray-600">Unlimited AI lessons</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Student Report</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Download a comprehensive report with progress, learning streaks, achievements, and weekly performance.
            </p>

            <button
              onClick={handleGenerateStudentReport}
              disabled={isGeneratingReport}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGeneratingReport ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating report...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Download Student Report (PDF)
                </>
              )}
            </button>

            {message && (
              <p className="mt-4 text-sm font-medium text-gray-700">{message}</p>
            )}
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">AI Tutor Style</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">Pick how your tutor explains concepts and tells stories.</p>

              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Persona preset</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {personaOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setTutorPersona(option.id)}
                      className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                        tutorPersona === option.id
                          ? 'border-purple-300 bg-purple-50 text-purple-900'
                          : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      <p className="font-semibold">{option.label}</p>
                      <p className="text-xs opacity-80">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Tone</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {toneOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setTutorTone(option.id)}
                      className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                        tutorTone === option.id
                          ? 'border-blue-300 bg-blue-50 text-blue-900'
                          : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      <p className="font-semibold">{option.label}</p>
                      <p className="text-xs opacity-80">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-6 w-6 text-emerald-600" />
                <h3 className="text-xl font-bold text-gray-900">Focus Sessions</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">Customize how focused study blocks feel across the app.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                    focusMode
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <p className="font-semibold">Focus mode</p>
                  <p className="text-xs opacity-80">Reduce visual noise across study views</p>
                  <p className="text-xs font-semibold mt-2">{focusMode ? 'On' : 'Off'}</p>
                </button>

                <div className="rounded-2xl border border-gray-200 px-4 py-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Daily focus goal</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="15"
                      max="240"
                      step="15"
                      value={focusGoalMinutes}
                      onChange={(e) => setFocusGoalMinutes(e.target.value)}
                      className="w-full accent-emerald-600"
                    />
                    <span className="text-sm font-semibold text-gray-900 min-w-[64px]">{focusGoalMinutes} min</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Used by the Study Timer dashboard.</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Preferred sprint length</p>
                <div className="flex flex-wrap gap-2">
                  {['15', '25', '45'].map((minutes) => (
                    <button
                      key={minutes}
                      onClick={() => setFocusSprint(minutes)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                        focusSprint === minutes
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      {minutes} min
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-4">
                <PanelTop className="h-6 w-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">Dashboard Layout</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">Show only the cards that matter most to you.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dashboardOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() =>
                      setDashboardPrefs((prev: typeof dashboardPrefs) => ({
                        ...prev,
                        [option.id]: !prev[option.id]
                      }))
                    }
                    className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                      dashboardPrefs[option.id]
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-900'
                        : 'border-gray-200 bg-white text-gray-700'
                    }`}
                  >
                    <p className="font-semibold">{option.label}</p>
                    <p className="text-xs opacity-80">{dashboardPrefs[option.id] ? 'Visible' : 'Hidden'}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Learning Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setAutoQuiz(!autoQuiz)}
                  className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                    autoQuiz
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <p className="font-semibold">Auto-create quizzes</p>
                  <p className="text-xs opacity-80">Generate quizzes after each lesson</p>
                  <p className="text-xs font-semibold mt-2">{autoQuiz ? 'Enabled' : 'Disabled'}</p>
                </button>
              </div>
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Weekly learning goal</p>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="15"
                    max="300"
                    step="15"
                    value={learningGoal}
                    onChange={(e) => setLearningGoal(e.target.value)}
                    className="w-full accent-blue-600"
                  />
                  <span className="text-sm font-semibold text-gray-900 min-w-[64px]">{learningGoal} min</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Set a weekly target to stay consistent.</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Privacy & Data</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setDataSharing(!dataSharing)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                    dataSharing
                      ? 'border-amber-300 bg-amber-50 text-amber-900'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Share anonymized learning data</p>
                      <p className="text-xs opacity-80">Help improve AI recommendations</p>
                    </div>
                    <span className="text-xs font-semibold">{dataSharing ? 'On' : 'Off'}</span>
                  </div>
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button className="rounded-2xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Export learning data</p>
                    <p className="text-xs text-gray-500">Download your activity history</p>
                  </button>
                  <button className="rounded-2xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Request data deletion</p>
                    <p className="text-xs text-gray-500">Remove personal data from MindSphere</p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Notifications</h3>
            <div className="space-y-4">
              <button
                onClick={() => setEmailUpdates(!emailUpdates)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                  emailUpdates
                    ? 'border-blue-300 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Email updates</p>
                    <p className="text-xs opacity-80">Product news and new features</p>
                  </div>
                  <span className="text-xs font-semibold">{emailUpdates ? 'On' : 'Off'}</span>
                </div>
              </button>
              <button
                onClick={() => setWeeklyDigest(!weeklyDigest)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                  weeklyDigest
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-900'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Weekly digest</p>
                    <p className="text-xs opacity-80">Progress summary every Monday</p>
                  </div>
                  <span className="text-xs font-semibold">{weeklyDigest ? 'On' : 'Off'}</span>
                </div>
              </button>
              <button
                onClick={() => setGoalReminders(!goalReminders)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                  goalReminders
                    ? 'border-purple-300 bg-purple-50 text-purple-900'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Goal reminders</p>
                    <p className="text-xs opacity-80">Gentle nudges to stay on track</p>
                  </div>
                  <span className="text-xs font-semibold">{goalReminders ? 'On' : 'Off'}</span>
                </div>
              </button>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Security</h4>
              <div className="space-y-3">
                <button className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">Reset password</p>
                  <p className="text-xs text-gray-500">Send a password reset email</p>
                </button>
                <button className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">Manage connected devices</p>
                  <p className="text-xs text-gray-500">Review recent sign-ins</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
