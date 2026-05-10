import express from 'express';
import { generateQuizQuestions } from '../services/geminiService.js';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

const extractTopicFromQuestion = (question, courseTopics = []) => {
  if (!question || typeof question !== 'string') return 'General';

  const normalizedQuestion = question.toLowerCase();
  const matchedTopic = courseTopics.find((topic) => {
    if (!topic || typeof topic !== 'string') return false;
    return normalizedQuestion.includes(topic.toLowerCase());
  });

  if (matchedTopic) return matchedTopic;

  const words = question
    .replace(/[?.,!]/g, '')
    .split(' ')
    .filter((word) => word.length > 3);

  return words.slice(0, 3).join(' ') || 'General';
};

const buildWeakAreaSuggestion = (topic, avgScore) => {
  if (avgScore < 40) {
    return `Re-learn ${topic} from basics, then retake a short quiz.`;
  }
  if (avgScore < 60) {
    return `Revise ${topic} with notes and flashcards, then practice 5 mixed questions.`;
  }
  return `Do a quick recap on ${topic} and attempt a timed mini-quiz.`;
};

// Generate dynamic quiz questions
router.post('/generate', async (req, res) => {
  try {
    const { title, source, content, fileName, url, timestamp } = req.body;

    if (!title || !source || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, source, and content are required'
      });
    }

    // Generate quiz questions using AI
    const quizQuestions = await generateQuizQuestions({
      title,
      source,
      content,
      fileName,
      url,
      timestamp
    });

    res.json({
      success: true,
      quizQuestions
    });

  } catch (error) {
    console.error('Error generating quiz questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate quiz questions'
    });
  }
});

// Store a quiz attempt and topic-level scores for weak-area tracking
router.post('/attempt', async (req, res) => {
  try {
    const { courseId, score, quizResults } = req.body;

    if (!courseId || typeof score !== 'number' || !Array.isArray(quizResults)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: courseId, score, and quizResults[] are required'
      });
    }

    const course = await Course.findOne({ _id: courseId, user: req.userId });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    const topicStats = new Map();
    const courseTopics = Array.isArray(course.topics) ? course.topics : [];

    quizResults.forEach((result) => {
      if (!result || typeof result !== 'object') return;
      const topic = (typeof result.topic === 'string' && result.topic.trim())
        ? result.topic.trim()
        : extractTopicFromQuestion(result.question, courseTopics);

      const current = topicStats.get(topic) || { total: 0, correct: 0 };
      current.total += 1;
      if (result.isCorrect) current.correct += 1;
      topicStats.set(topic, current);
    });

    const topicAttempts = Array.from(topicStats.entries()).map(([topic, stats]) => ({
      courseId: course._id,
      courseTitle: course.title,
      topic,
      score: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      timestamp: new Date()
    }));

    if (topicAttempts.length > 0) {
      await User.findByIdAndUpdate(req.userId, {
        $push: {
          quizAttempts: {
            $each: topicAttempts,
            $slice: -500
          }
        },
        $set: { lastActivityDate: new Date() }
      });
    }

    res.json({
      success: true,
      trackedTopics: topicAttempts.length,
      overallScore: score
    });
  } catch (error) {
    console.error('Error storing quiz attempt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store quiz attempt'
    });
  }
});

// Get weak topics derived from historical quiz attempts
router.get('/weak-areas', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('quizAttempts');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const attempts = Array.isArray(user.quizAttempts) ? user.quizAttempts : [];
    const byTopic = new Map();

    attempts.forEach((attempt) => {
      if (!attempt?.topic) return;
      const key = attempt.topic;
      const current = byTopic.get(key) || {
        topic: key,
        courseId: attempt.courseId,
        courseTitle: attempt.courseTitle || 'Course',
        attempts: 0,
        scoreSum: 0,
        lastScore: 0,
        lastAttempt: attempt.timestamp
      };

      current.attempts += 1;
      current.scoreSum += attempt.score || 0;
      current.lastScore = attempt.score || 0;
      if (!current.lastAttempt || (attempt.timestamp && new Date(attempt.timestamp) > new Date(current.lastAttempt))) {
        current.lastAttempt = attempt.timestamp;
        current.courseId = attempt.courseId;
        current.courseTitle = attempt.courseTitle || current.courseTitle;
      }

      byTopic.set(key, current);
    });

    const weakTopics = Array.from(byTopic.values())
      .map((entry) => {
        const averageScore = entry.attempts > 0 ? Math.round(entry.scoreSum / entry.attempts) : 0;
        return {
          topic: entry.topic,
          courseId: entry.courseId,
          courseTitle: entry.courseTitle,
          averageScore,
          lastScore: entry.lastScore,
          attempts: entry.attempts,
          isWeak: averageScore < 70,
          suggestion: buildWeakAreaSuggestion(entry.topic, averageScore),
          lastAttempt: entry.lastAttempt
        };
      })
      .filter((entry) => entry.isWeak)
      .sort((a, b) => a.averageScore - b.averageScore);

    res.json({
      success: true,
      weakTopics,
      totalTrackedTopics: byTopic.size
    });
  } catch (error) {
    console.error('Error getting weak areas:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weak areas'
    });
  }
});

export default router; 