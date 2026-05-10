import React from 'react';
import { Clock, Brain, Lightbulb, ArrowRight, CheckCircle2, Trophy, Flame, Target } from 'lucide-react';

interface AITutorSectionProps {
  onNavigate?: (view: string) => void;
}

const AITutorSection: React.FC<AITutorSectionProps> = ({ onNavigate }) => {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 via-white to-cyan-50 overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div className="z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-800 rounded-full text-sm font-semibold mb-6">
              <Flame className="w-4 h-4" /> AI Tutor + Learning Quests
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Learn Faster With Your
              <br />
              <span className="text-cyan-700">Personal AI Tutor</span>
            </h2>

            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
              Ask questions, practice with explain-back feedback, and track XP progress while you study. Built for deep learning, not shallow answers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <div className="rounded-xl border border-cyan-100 bg-white p-3">
                <p className="text-xs font-semibold text-slate-500">Tutor Uptime</p>
                <p className="text-xl font-bold text-slate-900">24/7</p>
              </div>
              <div className="rounded-xl border border-orange-100 bg-white p-3">
                <p className="text-xs font-semibold text-slate-500">Daily Streak</p>
                <p className="text-xl font-bold text-slate-900">+XP</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-white p-3">
                <p className="text-xs font-semibold text-slate-500">Quiz Mode</p>
                <p className="text-xl font-bold text-slate-900">Ready</p>
              </div>
            </div>

            <div className="space-y-5 mb-10">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-11 h-11 bg-cyan-600 rounded-xl flex items-center justify-center text-white">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Always Available</h3>
                  <p className="text-slate-600 text-sm">Get instant help during revision, practice sessions, and project work.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-11 h-11 bg-cyan-600 rounded-xl flex items-center justify-center text-white">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Adaptive Coaching</h3>
                  <p className="text-slate-600 text-sm">Switch between explain, Socratic, and quiz modes to match your learning goal.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-11 h-11 bg-cyan-600 rounded-xl flex items-center justify-center text-white">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Gamified Progress</h3>
                  <p className="text-slate-600 text-sm">Earn XP for learning actions and keep your study streak alive.</p>
                </div>
              </div>
            </div>

            <button
              id="try-ai-tutor-btn"
              onClick={() => onNavigate?.('chatbot')}
              className="bg-cyan-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-cyan-800 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-cyan-200"
            >
              Open AI Tutor <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute -top-6 -right-4 bg-white border border-amber-100 rounded-xl shadow-md px-4 py-3 z-20">
              <div className="flex items-center gap-2 text-amber-700 text-sm font-semibold">
                <Trophy className="w-4 h-4" /> XP Level Up
              </div>
              <p className="text-xs text-slate-500 mt-1">+35 XP from explain-back</p>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-cyan-100/60 rounded-full blur-3xl -z-10"></div>

            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="bg-cyan-700 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-semibold">MindSphere Tutor</span>
                </div>
                <div className="text-cyan-100 text-xs px-2 py-1 bg-cyan-600 rounded-full">Live</div>
              </div>

              <div className="p-6 space-y-5 bg-slate-50 min-h-[400px]">
                <div className="flex justify-end">
                  <div className="bg-cyan-700 text-white p-4 rounded-2xl rounded-tr-none max-w-[80%] shadow-md">
                    <p>Quiz me on data normalization and grade me.</p>
                  </div>
                </div>

                <div className="flex justify-start gap-4">
                  <div className="w-9 h-9 bg-cyan-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">AI</div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm border border-slate-100">
                    <p className="text-slate-700 leading-relaxed mb-2">
                      Great challenge. First question: what problem does normalization solve in databases?
                    </p>
                    <p className="text-slate-500 text-sm">Answer, and I will score + explain your gaps.</p>
                  </div>
                </div>

                <div className="bg-white border border-emerald-100 rounded-xl p-3">
                  <p className="text-xs text-emerald-700 font-semibold mb-2">Quest Progress</p>
                  <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-emerald-500 w-2/3"></div>
                  </div>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2 text-xs text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 2 lessons completed</li>
                    <li className="flex items-center gap-2 text-xs text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1 explain-back evaluated</li>
                    <li className="flex items-center gap-2 text-xs text-slate-600"><Lightbulb className="w-4 h-4 text-amber-500" /> 1 quiz attempt to level up</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AITutorSection;
