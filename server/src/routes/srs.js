import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to validate ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && (new mongoose.Types.ObjectId(id)).toString() === id;
}

/**
 * SM-2 Spaced Repetition Algorithm
 * @param {Object} item - SRS item with current values
 * @param {number} quality - Response quality (0-5): 0=wrong, 3=correct with effort, 5=perfect recall
 * @returns {Object} Updated item with new interval and easeFactor
 */
function calculateNextReview(item, quality) {
  let { easeFactor, interval, repetitions } = item;

  // Update ease factor based on quality
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  if (quality < 3) {
    // Incorrect answer - reset repetitions
    repetitions = 0;
    interval = 1; // Review tomorrow
  } else {
    // Correct answer - increase interval
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReview,
    lastReviewed: new Date()
  };
}

/**
 * POST /api/srs/track
 * Track a wrong answer or difficult flashcard
 * Body: { courseId, itemType: 'flashcard'|'quiz', itemId, question, answer, isCorrect }
 */
router.post('/track', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId, itemType, itemId, question, answer, isCorrect } = req.body;

    if (!courseId || !itemType || itemId === undefined || !question || !answer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate courseId format
    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID format' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find existing SRS item
    const existingIndex = user.srsItems.findIndex(
      item => item.courseId.toString() === courseId &&
              item.itemType === itemType &&
              item.itemId === itemId
    );

    // Quality score: 0 for incorrect, 4 for correct
    const quality = isCorrect ? 4 : 0;

    if (existingIndex !== -1) {
      // Update existing item
      const item = user.srsItems[existingIndex];
      const updates = calculateNextReview(item, quality);

      user.srsItems[existingIndex] = {
        ...item,
        ...updates,
        wrongCount: isCorrect ? item.wrongCount : item.wrongCount + 1,
        correctCount: isCorrect ? item.correctCount + 1 : item.correctCount,
        difficulty: isCorrect ? Math.max(0, item.difficulty - 1) : item.difficulty + 1
      };
    } else {
      // Create new SRS item
      const updates = calculateNextReview({ easeFactor: 2.5, interval: 1, repetitions: 0 }, quality);

      user.srsItems.push({
        courseId,
        itemType,
        itemId,
        question,
        answer,
        wrongCount: isCorrect ? 0 : 1,
        correctCount: isCorrect ? 1 : 0,
        difficulty: isCorrect ? 0 : 1,
        ...updates
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'SRS item tracked successfully',
      totalReviewItems: user.srsItems.filter(item => new Date(item.nextReview) <= new Date()).length
    });
  } catch (error) {
    console.error('Error tracking SRS item:', error);
    res.status(500).json({ error: 'Failed to track SRS item' });
  }
});

/**
 * GET /api/srs/review-items
 * Get all items due for review (nextReview <= now)
 * Query: ?limit=20
 */
router.get('/review-items', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 20;

    const user = await User.findById(userId).populate('srsItems.courseId', 'title');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const now = new Date();

    // Get items due for review, sorted by priority (highest difficulty and oldest nextReview first)
    const reviewItems = user.srsItems
      .filter(item => new Date(item.nextReview) <= now)
      .sort((a, b) => {
        // Sort by difficulty (descending) then by nextReview (ascending)
        if (b.difficulty !== a.difficulty) {
          return b.difficulty - a.difficulty;
        }
        return new Date(a.nextReview) - new Date(b.nextReview);
      })
      .slice(0, limit)
      .map(item => ({
        itemType: item.itemType,
        itemId: item.itemId,
        courseId: item.courseId._id,
        courseTitle: item.courseId.title,
        question: item.question,
        answer: item.answer,
        difficulty: item.difficulty,
        wrongCount: item.wrongCount,
        correctCount: item.correctCount,
        lastReviewed: item.lastReviewed,
        nextReview: item.nextReview
      }));

    res.json({
      success: true,
      reviewItems,
      totalDue: user.srsItems.filter(item => new Date(item.nextReview) <= now).length
    });
  } catch (error) {
    console.error('Error getting review items:', error);
    res.status(500).json({ error: 'Failed to get review items' });
  }
});

/**
 * GET /api/srs/stats
 * Get SRS statistics for the user
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const now = new Date();
    const total = user.srsItems.length;
    const dueNow = user.srsItems.filter(item => new Date(item.nextReview) <= now).length;
    const dueTomorrow = user.srsItems.filter(item => {
      const nextReview = new Date(item.nextReview);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);
      return nextReview > now && nextReview <= tomorrow;
    }).length;

    // Count by difficulty
    const atRisk = user.srsItems.filter(item => item.difficulty >= 3).length;
    const needsReview = user.srsItems.filter(item => item.difficulty >= 1 && item.difficulty < 3).length;
    const mastered = user.srsItems.filter(item => item.difficulty === 0 && item.correctCount >= 3).length;

    res.json({
      success: true,
      stats: {
        total,
        dueNow,
        dueTomorrow,
        atRisk,
        needsReview,
        mastered
      }
    });
  } catch (error) {
    console.error('Error getting SRS stats:', error);
    res.status(500).json({ error: 'Failed to get SRS stats' });
  }
});

/**
 * POST /api/srs/review
 * Mark an item as reviewed
 * Body: { courseId, itemType, itemId, quality: 0-5 }
 */
router.post('/review', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId, itemType, itemId, quality } = req.body;

    if (!courseId || !itemType || itemId === undefined || quality === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate courseId format
    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID format' });
    }

    // Validate quality range
    if (typeof quality !== 'number' || quality < 0 || quality > 5) {
      return res.status(400).json({ error: 'Quality must be a number between 0 and 5' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const itemIndex = user.srsItems.findIndex(
      item => item.courseId.toString() === courseId &&
              item.itemType === itemType &&
              item.itemId === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'SRS item not found' });
    }

    const item = user.srsItems[itemIndex];
    const updates = calculateNextReview(item, quality);

    user.srsItems[itemIndex] = {
      ...item,
      ...updates,
      wrongCount: quality < 3 ? item.wrongCount + 1 : item.wrongCount,
      correctCount: quality >= 3 ? item.correctCount + 1 : item.correctCount,
      difficulty: quality < 3 ? item.difficulty + 1 : Math.max(0, item.difficulty - 1)
    };

    await user.save();

    res.json({
      success: true,
      message: 'Review recorded successfully',
      nextReview: updates.nextReview
    });
  } catch (error) {
    console.error('Error recording review:', error);
    res.status(500).json({ error: 'Failed to record review' });
  }
});

export default router;
