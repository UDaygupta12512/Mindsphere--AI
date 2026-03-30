import { useState } from 'react';

const STREAK_KEY = 'mindsphere-streak';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string; // Local date string YYYY-MM-DD
}

// Get today's date in local timezone as YYYY-MM-DD
function getTodayStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate days between two YYYY-MM-DD date strings
function daysBetween(dateA: string, dateB: string): number {
  // Parse dates as local time by appending T00:00:00
  const dateALocal = new Date(`${dateA}T00:00:00`);
  const dateBLocal = new Date(`${dateB}T00:00:00`);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((dateBLocal.getTime() - dateALocal.getTime()) / msPerDay);
}

export function useStreak() {
  const [streakData] = useState<StreakData>(() => {
    const today = getTodayStr();
    try {
      const raw = localStorage.getItem(STREAK_KEY);
      if (!raw) {
        // First ever visit
        const initial: StreakData = { currentStreak: 1, longestStreak: 1, lastVisitDate: today };
        localStorage.setItem(STREAK_KEY, JSON.stringify(initial));
        return initial;
      }

      const data: StreakData = JSON.parse(raw);
      const diff = daysBetween(data.lastVisitDate, today);

      if (diff === 0) {
        // Already visited today — no change
        return data;
      } else if (diff === 1) {
        // Visited yesterday — continue streak
        const updated: StreakData = {
          currentStreak: data.currentStreak + 1,
          longestStreak: Math.max(data.longestStreak, data.currentStreak + 1),
          lastVisitDate: today,
        };
        localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
        return updated;
      } else {
        // Missed a day — reset streak
        const updated: StreakData = {
          currentStreak: 1,
          longestStreak: data.longestStreak,
          lastVisitDate: today,
        };
        localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
        return updated;
      }
    } catch {
      const initial: StreakData = { currentStreak: 1, longestStreak: 1, lastVisitDate: today };
      localStorage.setItem(STREAK_KEY, JSON.stringify(initial));
      return initial;
    }
  });

  return {
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
  };
}
