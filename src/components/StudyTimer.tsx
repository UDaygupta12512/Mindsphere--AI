import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Volume2, VolumeX } from 'lucide-react';

interface StudyTimerProps {
  onSessionComplete?: (minutes: number) => void;
}

type TimerMode = 'study' | 'shortBreak' | 'longBreak';

const BREAK_PRESETS = {
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const getPreferredStudySeconds = () => {
  const stored = localStorage.getItem('ms-focus-sprint-minutes');
  const minutes = stored ? parseInt(stored, 10) : 25;
  if (!Number.isFinite(minutes)) return 25 * 60;
  const bounded = Math.max(10, Math.min(90, minutes));
  return bounded * 60;
};

const getDailyGoalMinutes = () => {
  const stored = localStorage.getItem('ms-focus-goal-minutes');
  const minutes = stored ? parseInt(stored, 10) : 60;
  if (!Number.isFinite(minutes)) return 60;
  return Math.max(15, Math.min(240, minutes));
};

const StudyTimer: React.FC<StudyTimerProps> = ({ onSessionComplete }) => {
  const [mode, setMode] = useState<TimerMode>('study');
  const [studySeconds] = useState(getPreferredStudySeconds);
  const [timeLeft, setTimeLeft] = useState(studySeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [totalStudyTime, setTotalStudyTime] = useState(0);

  const playSound = useCallback(() => {
    if (soundEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 200);
    }
  }, [soundEnabled]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (mode === 'study') {
          setTotalStudyTime((prev) => prev + 1);
        }
      }, 1000);
    } else if (timeLeft === 0) {
      playSound();
      if (mode === 'study') {
        const newSessionCount = sessionsCompleted + 1;
        setSessionsCompleted(newSessionCount);
        onSessionComplete?.(studySeconds / 60);

        if (newSessionCount % 4 === 0) {
          setMode('longBreak');
          setTimeLeft(BREAK_PRESETS.longBreak);
        } else {
          setMode('shortBreak');
          setTimeLeft(BREAK_PRESETS.shortBreak);
        }
      } else {
        setMode('study');
        setTimeLeft(studySeconds);
      }
      setIsRunning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, sessionsCompleted, playSound, onSessionComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeSeconds = (targetMode: TimerMode) => {
    if (targetMode === 'study') return studySeconds;
    return targetMode === 'shortBreak' ? BREAK_PRESETS.shortBreak : BREAK_PRESETS.longBreak;
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(getModeSeconds(mode));
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(getModeSeconds(newMode));
    setIsRunning(false);
  };

  const progress = ((getModeSeconds(mode) - timeLeft) / getModeSeconds(mode)) * 100;
  const totalStudyMinutes = Math.floor(totalStudyTime / 60);
  const dailyGoalMinutes = getDailyGoalMinutes();
  const dailyProgress = Math.min(100, Math.round((totalStudyMinutes / dailyGoalMinutes) * 100));

  const getModeColor = () => {
    switch (mode) {
      case 'study': return 'from-blue-500 to-purple-500';
      case 'shortBreak': return 'from-green-400 to-emerald-500';
      case 'longBreak': return 'from-orange-400 to-amber-500';
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'study': return <BookOpen className="h-5 w-5" />;
      case 'shortBreak': return <Coffee className="h-5 w-5" />;
      case 'longBreak': return <Coffee className="h-5 w-5" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          {getModeIcon()}
          Study Timer
        </h3>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={soundEnabled ? 'Mute' : 'Unmute'}
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4 text-gray-600" />
          ) : (
            <VolumeX className="h-4 w-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-6">
        {(['study', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              mode === m
                ? `bg-gradient-to-r ${getModeColor()} text-white`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {m === 'study' ? 'Focus' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="relative mb-6">
        <div className="w-40 h-40 mx-auto relative">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * progress) / 100}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={mode === 'study' ? '#3b82f6' : mode === 'shortBreak' ? '#4ade80' : '#fb923c'} />
                <stop offset="100%" stopColor={mode === 'study' ? '#8b5cf6' : mode === 'shortBreak' ? '#10b981' : '#f59e0b'} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-gray-900">{formatTime(timeLeft)}</span>
            <span className="text-sm text-gray-500 capitalize">{mode === 'study' ? 'Focus Time' : 'Break Time'}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`p-4 rounded-full text-white transition-all transform hover:scale-105 bg-gradient-to-r ${getModeColor()}`}
        >
          {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </button>
        <button
          onClick={handleReset}
          className="p-4 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="h-6 w-6" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{sessionsCompleted}</p>
          <p className="text-xs text-gray-500">Sessions Today</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{totalStudyMinutes}m</p>
          <p className="text-xs text-gray-500">Focus Time</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-gray-50 border border-gray-100 p-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>Daily focus goal</span>
          <span className="font-semibold text-gray-800">{totalStudyMinutes}/{dailyGoalMinutes} min</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${dailyProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;
