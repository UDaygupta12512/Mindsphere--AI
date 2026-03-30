import React, { useState, useEffect } from 'react';
import { Share2, RefreshCcw, Clock, Calendar, Zap, Trophy, Brain, Lightbulb, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { learningApi, LearningPersona } from '../lib/api';

interface LearningPersonaCardProps {
  compact?: boolean;
  onExpand?: () => void;
}

const LearningPersonaCard: React.FC<LearningPersonaCardProps> = ({ compact = false, onExpand }) => {
  const [persona, setPersona] = useState<LearningPersona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    loadPersona();
  }, []);

  const loadPersona = async () => {
    try {
      setIsLoading(true);
      const response = await learningApi.getPersona();
      setPersona(response.persona);
    } catch (error) {
      console.error('Error loading persona:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!persona) return;

    try {
      await navigator.clipboard.writeText(persona.shareText);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard
      const textArea = document.createElement('textarea');
      textArea.value = persona.shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${compact ? 'p-4' : 'p-6'}`}>
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Start studying to discover your learning persona!</p>
        </div>
      </div>
    );
  }

  // Compact version for dashboard
  if (compact) {
    return (
      <div
        onClick={onExpand}
        className={`bg-gradient-to-br ${persona.color} rounded-2xl shadow-lg p-5 text-white cursor-pointer hover:shadow-xl transition-all transform hover:scale-[1.02]`}
      >
        <div className="flex items-center gap-3">
          <div className="text-4xl">{persona.icon}</div>
          <div>
            <h3 className="font-bold text-lg">{persona.title}</h3>
            <p className="text-white/80 text-sm">Your Learning Persona</p>
          </div>
        </div>
        <p className="text-white/90 text-sm mt-3 line-clamp-2">{persona.description}</p>
        <div className="flex gap-2 mt-3">
          {persona.traits.slice(0, 2).map((trait, idx) => (
            <span key={idx} className="px-2 py-1 bg-white/20 rounded-full text-xs">
              {trait}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-br ${persona.color} p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{persona.icon}</div>
            <div>
              <h2 className="text-2xl font-bold">{persona.title}</h2>
              <p className="text-white/80">Your Learning Persona</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              title="Share your persona"
            >
              {shareSuccess ? (
                <span className="text-xs">Copied!</span>
              ) : (
                <Share2 className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={loadPersona}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              title="Refresh"
            >
              <RefreshCcw className="h-5 w-5" />
            </button>
          </div>
        </div>

        <p className="text-white/95 leading-relaxed">{persona.description}</p>

        <div className="flex flex-wrap gap-2 mt-4">
          {persona.traits.map((trait, idx) => (
            <span key={idx} className="px-3 py-1.5 bg-white/20 rounded-full text-sm font-medium">
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Your Study Stats
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Clock className="h-5 w-5 text-blue-500 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">{persona.stats.preferredTime}</div>
            <div className="text-xs text-gray-500">Peak Time</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Calendar className="h-5 w-5 text-purple-500 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">{persona.stats.avgSessionLength}</div>
            <div className="text-xs text-gray-500">Avg Session</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">{persona.stats.quizAverage}</div>
            <div className="text-xs text-gray-500">Quiz Avg</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Brain className="h-5 w-5 text-pink-500 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">{persona.stats.retentionRate}</div>
            <div className="text-xs text-gray-500">Retention</div>
          </div>
        </div>

        {/* Expanded Tips */}
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl hover:from-yellow-100 hover:to-orange-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-gray-900">Personal Tips for You</span>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-2">
              {persona.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Share Banner */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Share your learning style!</p>
              <p className="text-sm text-gray-600">Let friends know how you learn best</p>
            </div>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              {shareSuccess ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPersonaCard;
