import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Lightbulb, Flame, Trophy, Brain, Target } from 'lucide-react';
import { ChatMessage } from '../types/course';
import { chatApi } from '../lib/api';
import './ChatBot.css';

interface ChatBotProps {
  courses?: unknown[];
}

type TutorMode = 'coach' | 'socratic' | 'quiz' | 'story';

interface TutorProgress {
  xp: number;
  streak: number;
  lastActiveDate: string;
  dailyMessages: number;
  dailyDate: string;
}

const TUTOR_PROGRESS_KEY = 'mindsphere-tutor-progress-v1';
const DAILY_GOAL = 3;

const getTodayKey = () => new Date().toISOString().slice(0, 10);
const getYesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

const getDefaultProgress = (): TutorProgress => ({
  xp: 0,
  streak: 0,
  lastActiveDate: '',
  dailyMessages: 0,
  dailyDate: getTodayKey()
});

const getLevelFromXp = (xp: number) => {
  const level = Math.floor(xp / 120) + 1;
  const currentLevelXp = (level - 1) * 120;
  const nextLevelXp = level * 120;
  return {
    level,
    current: xp - currentLevelXp,
    needed: nextLevelXp - currentLevelXp
  };
};

const modePrompts: Record<TutorMode, string> = {
  coach: 'Act as a practical learning coach: concise, structured, and actionable.',
  socratic: 'Use a Socratic style: guide with 2-4 probing questions before final explanation when possible.',
  quiz: 'Use quiz mode: ask one question at a time, wait for answer, then provide score + feedback.',
  story: 'Use story mode: explain concepts as a short narrative with a clear takeaway.'
};

const ChatBot: React.FC<ChatBotProps> = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "I am your AI tutor. Choose a mode and ask your first question to start today's learning quest.",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<TutorMode>('coach');
  const [progress, setProgress] = useState<TutorProgress>(() => {
    try {
      const raw = localStorage.getItem(TUTOR_PROGRESS_KEY);
      return raw ? { ...getDefaultProgress(), ...JSON.parse(raw) } : getDefaultProgress();
    } catch {
      return getDefaultProgress();
    }
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const syncProgress = (next: TutorProgress) => {
    setProgress(next);
    localStorage.setItem(TUTOR_PROGRESS_KEY, JSON.stringify(next));
  };

  const awardXp = (amount: number) => {
    const today = getTodayKey();
    const yesterday = getYesterdayKey();
    const previous = progress;

    let streak = previous.streak;
    if (previous.lastActiveDate === today) {
      streak = previous.streak;
    } else if (previous.lastActiveDate === yesterday) {
      streak = previous.streak + 1;
    } else {
      streak = 1;
    }

    const dailyMessages = previous.dailyDate === today ? previous.dailyMessages + 1 : 1;
    syncProgress({
      xp: previous.xp + amount,
      streak,
      lastActiveDate: today,
      dailyMessages,
      dailyDate: today
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestedQuestions = [
    'Explain this topic simply with one real-world example.',
    'Quiz me on my weakest concepts and score my answers.',
    'Help me make a 25-minute study sprint plan.',
    'Ask me 3 Socratic questions before giving the answer.',
    'Tell me a short story that teaches this concept.'
  ];

  const getTutorPreferences = () => {
    const persona = localStorage.getItem('ms-tutor-persona') || 'balanced';
    const tone = localStorage.getItem('ms-tutor-tone') || 'warm';
    return { persona, tone };
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const history = messages
        .filter((m) => m.id !== '1')
        .map((m) => ({ role: m.type as 'user' | 'ai', content: m.content }));

      const { persona, tone } = getTutorPreferences();
      const composedMessage = `[Tutor Mode: ${mode}]\n[Tutor Persona: ${persona}]\n[Tutor Tone: ${tone}]\n${modePrompts[mode]}\nStudent request: ${messageText}`;
      const response = await chatApi.sendMessage(composedMessage, history);

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.reply,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, aiResponse]);
      awardXp(mode === 'quiz' ? 18 : 14);
    } catch {
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I hit an error while processing that. Please try again.',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    await sendMessage(inputMessage);
  };

  const handleSuggestedQuestion = async (question: string) => {
    await sendMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const levelInfo = getLevelFromXp(progress.xp);
  const dailyPercent = Math.min(100, Math.round((progress.dailyMessages / DAILY_GOAL) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-rose-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">AI Tutor Arena</h1>
              <p className="text-slate-600">Learn, practice, and level up with focused tutor modes.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-white border border-amber-100 shadow-sm">
                <div className="flex items-center gap-2 text-amber-700 text-sm font-semibold"><Trophy className="h-4 w-4" /> Level {levelInfo.level}</div>
                <p className="text-xs text-slate-500 mt-1">{levelInfo.current}/{levelInfo.needed} XP</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white border border-rose-100 shadow-sm">
                <div className="flex items-center gap-2 text-rose-700 text-sm font-semibold"><Flame className="h-4 w-4" /> {progress.streak} day streak</div>
                <p className="text-xs text-slate-500 mt-1">Stay active daily</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Tutor Mode</h2>
              <div className="space-y-2">
                {([
                  { id: 'coach', label: 'Coach', icon: Brain },
                  { id: 'socratic', label: 'Socratic', icon: Lightbulb },
                  { id: 'quiz', label: 'Quiz Mode', icon: Target },
                  { id: 'story', label: 'Story Mode', icon: Bot }
                ] as Array<{ id: TutorMode; label: string; icon: typeof Brain }>).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setMode(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                        mode === item.id
                          ? 'bg-cyan-600 text-white border-cyan-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4" /> {item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">Daily Quest</h2>
              <p className="text-xs text-slate-500 mb-3">Send {DAILY_GOAL} quality prompts today.</p>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500" style={{ width: `${dailyPercent}%` }} />
              </div>
              <p className="text-xs font-semibold text-slate-700">{progress.dailyMessages}/{DAILY_GOAL} completed</p>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl border border-slate-100 h-[680px] flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <div className="inline-flex rounded-lg bg-slate-100 p-1">
                {(['coach', 'socratic', 'quiz', 'story'] as TutorMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      mode === m ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`flex-shrink-0 p-2 rounded-full ${message.type === 'user' ? 'bg-cyan-700' : 'bg-slate-800'}`}>
                      {message.type === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
                    </div>

                    <div className={`p-4 rounded-2xl ${message.type === 'user' ? 'bg-cyan-700 text-white rounded-br-sm' : 'bg-slate-50 text-slate-900 rounded-bl-sm border border-slate-100'}`}>
                      {message.type === 'ai' ? (
                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-line">{message.content}</p>
                      )}
                      <p className={`text-xs mt-2 opacity-70 ${message.type === 'user' ? 'text-cyan-100' : 'text-slate-500'}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 p-2 rounded-full bg-slate-800">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-slate-600 animate-pulse">Tutor is thinking...</p>
                        <div className="spinner w-4 h-4 border-2 border-slate-300 border-t-cyan-600 rounded-full animate-spin"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
              <div className="px-6 py-4 border-t border-slate-100">
                <div className="flex items-center mb-3">
                  <Lightbulb className="h-4 w-4 text-amber-500 mr-2" />
                  <span className="text-sm font-medium text-slate-700">Suggested prompts:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => void handleSuggestedQuestion(question)}
                      className="text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm text-slate-700 transition-colors border border-slate-100"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6 border-t border-slate-100">
              <div className="flex items-end space-x-4">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask a concept question, request a quiz, or ask for a study plan..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none outline-none"
                    rows={2}
                  />
                </div>
                <button
                  onClick={() => void handleSendMessage()}
                  disabled={!inputMessage.trim() || isTyping}
                  aria-label="Send message"
                  className="flex items-center justify-center p-3 bg-cyan-700 text-white rounded-xl hover:bg-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
