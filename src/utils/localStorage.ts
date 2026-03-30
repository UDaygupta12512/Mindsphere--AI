// LocalStorage management utility with size limits and cleanup

const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB limit (localStorage usually has 5-10MB)
const STORAGE_PREFIX = 'mindsphere-';

/**
 * Get current localStorage usage in bytes
 */
export const getStorageSize = (): number => {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
};

/**
 * Check if storage space is available
 */
export const hasStorageSpace = (dataSize: number): boolean => {
  const currentSize = getStorageSize();
  return currentSize + dataSize < MAX_STORAGE_SIZE;
};

/**
 * Clean up old localStorage items (keeps last 50 items per type)
 */
export const cleanupStorage = () => {
  try {
    const notes: { key: string; timestamp: number }[] = [];

    // Collect all notes with timestamps
    for (const key in localStorage) {
      if (key.startsWith('mindsphere-lesson-note-') || key.startsWith('mindsphere-personal-notes-')) {
        const timestamp = localStorage.getItem(`${key}-timestamp`);
        notes.push({
          key,
          timestamp: timestamp ? parseInt(timestamp) : 0
        });
      }
    }

    // Sort by timestamp (oldest first)
    notes.sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest items if we have more than 50
    if (notes.length > 50) {
      const toRemove = notes.slice(0, notes.length - 50);
      toRemove.forEach(item => {
        localStorage.removeItem(item.key);
        localStorage.removeItem(`${item.key}-timestamp`);
      });
      console.log(`Cleaned up ${toRemove.length} old notes`);
    }
  } catch (error) {
    console.error('Error cleaning up storage:', error);
  }
};

/**
 * Safely set item in localStorage with size check
 */
export const safeSetItem = (key: string, value: string): boolean => {
  try {
    const dataSize = value.length + key.length;

    // Check if we have space
    if (!hasStorageSpace(dataSize)) {
      cleanupStorage();

      // Check again after cleanup
      if (!hasStorageSpace(dataSize)) {
        console.warn('localStorage is full, cannot save');
        return false;
      }
    }

    localStorage.setItem(key, value);
    localStorage.setItem(`${key}-timestamp`, Date.now().toString());
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);

    // Try cleanup and retry once
    try {
      cleanupStorage();
      localStorage.setItem(key, value);
      localStorage.setItem(`${key}-timestamp`, Date.now().toString());
      return true;
    } catch (retryError) {
      console.error('Failed to save even after cleanup:', retryError);
      return false;
    }
  }
};

/**
 * Safely get item from localStorage
 */
export const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

/**
 * Remove item from localStorage
 */
export const safeRemoveItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}-timestamp`);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

/**
 * Get all keys with a specific prefix
 */
export const getKeysByPrefix = (prefix: string): string[] => {
  const keys: string[] = [];
  try {
    for (const key in localStorage) {
      if (key.startsWith(prefix)) {
        keys.push(key);
      }
    }
  } catch (error) {
    console.error('Error getting keys:', error);
  }
  return keys;
};

/**
 * Clear all MindSphere data from localStorage
 */
export const clearAllData = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('Cleared all MindSphere data from localStorage');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Get storage usage statistics
 */
export const getStorageStats = () => {
  const total = getStorageSize();
  const notes = getKeysByPrefix('mindsphere-lesson-note-').length;
  const personalNotes = getKeysByPrefix('mindsphere-personal-notes-').length;

  return {
    totalSize: total,
    totalSizeMB: (total / (1024 * 1024)).toFixed(2),
    maxSize: MAX_STORAGE_SIZE,
    maxSizeMB: (MAX_STORAGE_SIZE / (1024 * 1024)).toFixed(2),
    usagePercent: ((total / MAX_STORAGE_SIZE) * 100).toFixed(1),
    lessonNotes: notes,
    personalNotes: personalNotes,
    isFull: total > MAX_STORAGE_SIZE * 0.9 // 90% threshold
  };
};

// Auto cleanup on module load if storage is too full
const stats = getStorageStats();
if (stats.isFull) {
  console.warn('localStorage is nearly full, running cleanup...');
  cleanupStorage();
}
