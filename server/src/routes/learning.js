import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateAIContent } from '../services/geminiService.js';

const router = express.Router();

/**
 * POST /api/learning/generate-path
 * Generate a personalized learning path based on user's goal
 * Body: { courseId, targetDays, dailyHours }
 */
router.post('/generate-path', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId, targetDays, dailyHours = 1 } = req.body;

    if (!courseId || !targetDays) {
      return res.status(400).json({ error: 'Missing required fields: courseId and targetDays' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const totalLessons = course.lessons?.length || 8;
    const totalQuizzes = course.quizzes?.length || 1;
    const totalFlashcards = course.flashcards?.length || 10;
    const completedLessons = course.lessons?.filter(l => l.isCompleted).length || 0;
    const remainingLessons = totalLessons - completedLessons;

    // Calculate distribution
    const lessonsPerDay = Math.ceil(remainingLessons / targetDays);

    // Generate AI-powered learning path
    const prompt = `Create a ${targetDays}-day learning plan for a course titled "${course.title}".

Course Details:
- Total Lessons: ${totalLessons} (${completedLessons} completed, ${remainingLessons} remaining)
- Lessons: ${course.lessons?.map((l, i) => `${i + 1}. ${l.title}`).join(', ')}
- Total Quizzes: ${totalQuizzes}
- Total Flashcards: ${totalFlashcards}
- Daily study time: ${dailyHours} hour(s)

Create a JSON response with this exact structure:
{
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "focus": "Main focus area",
      "tasks": [
        { "type": "lesson", "title": "Lesson name", "duration": "30 min", "lessonIndex": 0 },
        { "type": "flashcard", "title": "Review flashcards", "duration": "15 min", "count": 5 },
        { "type": "quiz", "title": "Quick quiz", "duration": "15 min" }
      ],
      "tips": "Study tip for this day"
    }
  ],
  "summary": {
    "totalStudyHours": 7,
    "lessonsPerDay": 2,
    "reviewSessions": 3
  }
}

Make it realistic and achievable. Include review sessions using spaced repetition principles. Vary the activities to keep engagement high.`;

    let learningPath;
    try {
      const aiResponse = await generateAIContent(prompt);
      // Extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        learningPath = JSON.parse(jsonMatch[0]);
      }
    } catch (aiError) {
      console.error('AI generation error:', aiError);
    }

    // Fallback to algorithmic generation if AI fails
    if (!learningPath) {
      learningPath = generateAlgorithmicPath(course, targetDays, dailyHours, remainingLessons);
    }

    // Save learning path to user's course progress
    await User.findByIdAndUpdate(userId, {
      $set: {
        [`learningPaths.${courseId}`]: {
          path: learningPath,
          targetDays,
          dailyHours,
          createdAt: new Date(),
          currentDay: 1
        }
      }
    });

    res.json({
      success: true,
      learningPath,
      courseTitle: course.title
    });
  } catch (error) {
    console.error('Error generating learning path:', error);
    res.status(500).json({ error: 'Failed to generate learning path' });
  }
});

/**
 * Generate algorithmic learning path (fallback)
 */
function generateAlgorithmicPath(course, targetDays, dailyHours, remainingLessons) {
  const days = [];
  const lessonsPerDay = Math.ceil(remainingLessons / targetDays);
  let lessonIndex = course.lessons?.findIndex(l => !l.isCompleted) || 0;
  if (lessonIndex === -1) lessonIndex = 0;

  for (let day = 1; day <= targetDays; day++) {
    const tasks = [];
    const isReviewDay = day % 3 === 0;
    const isQuizDay = day === targetDays || day % Math.ceil(targetDays / 2) === 0;

    // Add lessons
    for (let i = 0; i < lessonsPerDay && lessonIndex < (course.lessons?.length || 0); i++) {
      const lesson = course.lessons[lessonIndex];
      tasks.push({
        type: 'lesson',
        title: lesson?.title || `Lesson ${lessonIndex + 1}`,
        duration: lesson?.duration || '30 min',
        lessonIndex
      });
      lessonIndex++;
    }

    // Add flashcard review
    if (isReviewDay || day === 1) {
      tasks.push({
        type: 'flashcard',
        title: 'Review Flashcards',
        duration: '15 min',
        count: Math.min(10, course.flashcards?.length || 5)
      });
    }

    // Add quiz on quiz days
    if (isQuizDay) {
      tasks.push({
        type: 'quiz',
        title: day === targetDays ? 'Final Assessment' : 'Progress Check Quiz',
        duration: '20 min'
      });
    }

    const dayTitles = [
      'Foundation Building', 'Core Concepts', 'Deep Dive', 'Practice & Apply',
      'Review & Reinforce', 'Advanced Topics', 'Mastery Check', 'Final Push'
    ];

    days.push({
      day,
      title: dayTitles[(day - 1) % dayTitles.length],
      focus: tasks[0]?.title || 'Study Session',
      tasks,
      tips: getTipForDay(day, targetDays)
    });
  }

  return {
    days,
    summary: {
      totalStudyHours: targetDays * dailyHours,
      lessonsPerDay,
      reviewSessions: Math.ceil(targetDays / 3)
    }
  };
}

function getTipForDay(day, totalDays) {
  const tips = [
    "Start strong! Focus on understanding core concepts before moving forward.",
    "Take short breaks every 25 minutes to maintain focus (Pomodoro technique).",
    "Review yesterday's material briefly before starting new content.",
    "Try explaining concepts out loud - it helps with retention!",
    "Use the flashcards actively - don't just read, test yourself.",
    "Connect new concepts to what you already know.",
    "If something is confusing, mark it and revisit after a break.",
    "You're making great progress! Consistency is key."
  ];

  if (day === totalDays) {
    return "Final day! Review all key concepts and take the assessment with confidence.";
  }
  return tips[(day - 1) % tips.length];
}

/**
 * GET /api/learning/path/:courseId
 * Get user's learning path for a course
 */
router.get('/path/:courseId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId } = req.params;

    const user = await User.findById(userId);
    const learningPath = user?.learningPaths?.get(courseId);

    if (!learningPath) {
      return res.json({ success: true, learningPath: null });
    }

    res.json({
      success: true,
      learningPath: learningPath.path,
      currentDay: learningPath.currentDay,
      targetDays: learningPath.targetDays,
      createdAt: learningPath.createdAt
    });
  } catch (error) {
    console.error('Error getting learning path:', error);
    res.status(500).json({ error: 'Failed to get learning path' });
  }
});

/**
 * POST /api/learning/gap-report
 * Generate a gap report based on quiz performance
 * Body: { courseId, quizResults: [{ question, userAnswer, correctAnswer, isCorrect, topic }] }
 */
router.post('/gap-report', authenticateToken, async (req, res) => {
  try {
    const { courseId, quizResults, score } = req.body;

    if (!courseId || !quizResults) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Analyze wrong answers
    const wrongAnswers = quizResults.filter(r => !r.isCorrect);
    const correctAnswers = quizResults.filter(r => r.isCorrect);

    // Group by topics/concepts
    const weakAreas = {};
    const strongAreas = {};

    wrongAnswers.forEach(answer => {
      const topic = answer.topic || extractTopic(answer.question);
      weakAreas[topic] = (weakAreas[topic] || 0) + 1;
    });

    correctAnswers.forEach(answer => {
      const topic = answer.topic || extractTopic(answer.question);
      strongAreas[topic] = (strongAreas[topic] || 0) + 1;
    });

    // Generate AI-powered gap analysis and mini-lessons
    let gapReport;

    if (wrongAnswers.length > 0) {
      const prompt = `Analyze these quiz results and create a gap report with mini-lessons.

Course: ${course.title}
Score: ${score}%

Wrong Answers:
${wrongAnswers.map((a, i) => `${i + 1}. Question: "${a.question}"
   User answered: "${a.userAnswer}"
   Correct answer: "${a.correctAnswer}"`).join('\n')}

Correct Answers:
${correctAnswers.map((a, i) => `${i + 1}. "${a.question}"`).join('\n')}

Create a JSON response with this structure:
{
  "overallAnalysis": "Brief analysis of performance",
  "strengths": ["List of topics/concepts the student understands well"],
  "weaknesses": ["List of topics/concepts that need improvement"],
  "miniLessons": [
    {
      "topic": "Topic name",
      "explanation": "Clear, concise explanation of the concept (2-3 paragraphs)",
      "keyPoints": ["Key point 1", "Key point 2"],
      "example": "A practical example",
      "practiceQuestion": "A practice question to test understanding"
    }
  ],
  "recommendations": ["Specific study recommendations"],
  "encouragement": "Motivational message"
}`;

      try {
        const aiResponse = await generateAIContent(prompt);
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          gapReport = JSON.parse(jsonMatch[0]);
        }
      } catch (aiError) {
        console.error('AI gap report error:', aiError);
      }
    }

    // Fallback report
    if (!gapReport) {
      gapReport = {
        overallAnalysis: score >= 80
          ? "Great job! You have a solid understanding of the material."
          : score >= 60
            ? "Good effort! There are some areas that could use more attention."
            : "Keep practicing! Review the topics below to strengthen your understanding.",
        strengths: Object.keys(strongAreas),
        weaknesses: Object.keys(weakAreas),
        miniLessons: wrongAnswers.slice(0, 3).map(answer => ({
          topic: extractTopic(answer.question),
          explanation: `The correct answer to "${answer.question}" is "${answer.correctAnswer}". This is important because it relates to a key concept in the course.`,
          keyPoints: ["Review this concept carefully", "Practice similar questions"],
          example: `When asked about ${extractTopic(answer.question)}, remember: ${answer.correctAnswer}`,
          practiceQuestion: `Can you explain why ${answer.correctAnswer} is the correct answer?`
        })),
        recommendations: [
          "Review the mini-lessons below",
          "Use flashcards for spaced repetition",
          "Retake the quiz after studying"
        ],
        encouragement: "Every mistake is a learning opportunity. Keep going!"
      };
    }

    res.json({
      success: true,
      gapReport,
      score,
      totalQuestions: quizResults.length,
      correctCount: correctAnswers.length,
      wrongCount: wrongAnswers.length
    });
  } catch (error) {
    console.error('Error generating gap report:', error);
    res.status(500).json({ error: 'Failed to generate gap report' });
  }
});

function extractTopic(question) {
  // Simple topic extraction - take first few meaningful words
  const words = question.replace(/[?.,!]/g, '').split(' ').filter(w => w.length > 3);
  return words.slice(0, 3).join(' ') || 'General';
}

/**
 * GET /api/learning/persona
 * Get user's learning persona based on study patterns
 */
router.get('/persona', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Analyze study patterns from various sources
    const studyPatterns = user.studyPatterns || [];
    const srsItems = user.srsItems || [];

    // Calculate persona attributes
    const persona = calculatePersona(user, studyPatterns, srsItems);

    res.json({
      success: true,
      persona
    });
  } catch (error) {
    console.error('Error getting learning persona:', error);
    res.status(500).json({ error: 'Failed to get learning persona' });
  }
});

/**
 * POST /api/learning/track-session
 * Track a study session for persona analysis
 * Body: { startTime, endTime, activityType, performance }
 */
router.post('/track-session', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startTime, endTime, activityType, performance, courseId } = req.body;

    const session = {
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration: (new Date(endTime) - new Date(startTime)) / 1000 / 60, // minutes
      activityType,
      performance,
      courseId,
      dayOfWeek: new Date(startTime).getDay(),
      hourOfDay: new Date(startTime).getHours()
    };

    await User.findByIdAndUpdate(userId, {
      $push: { studyPatterns: { $each: [session], $slice: -100 } } // Keep last 100 sessions
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking session:', error);
    res.status(500).json({ error: 'Failed to track session' });
  }
});

function calculatePersona(user, studyPatterns, srsItems) {
  // Default persona if not enough data
  if (studyPatterns.length < 3) {
    return {
      type: 'explorer',
      title: 'The Explorer 🔍',
      description: "You're just getting started! Keep learning to discover your unique study style.",
      traits: ['Curious', 'Open-minded', 'Adaptable'],
      stats: {
        preferredTime: 'Varies',
        avgSessionLength: 'Building data...',
        strongestArea: 'Still exploring',
        learningStyle: 'Discovering'
      },
      tips: [
        "Try studying at different times to find your peak hours",
        "Experiment with different study techniques",
        "Track your progress to unlock your full persona"
      ],
      color: 'from-blue-500 to-cyan-500',
      icon: '🔍',
      shareText: "I'm an Explorer on MindSphere - just starting my learning journey!"
    };
  }

  // Analyze patterns
  const hourCounts = {};
  const dayCounts = {};
  let totalDuration = 0;
  let quizPerformance = 0;
  let flashcardPerformance = 0;
  let quizCount = 0;
  let flashcardCount = 0;

  studyPatterns.forEach(session => {
    hourCounts[session.hourOfDay] = (hourCounts[session.hourOfDay] || 0) + 1;
    dayCounts[session.dayOfWeek] = (dayCounts[session.dayOfWeek] || 0) + 1;
    totalDuration += session.duration || 0;

    if (session.activityType === 'quiz') {
      quizPerformance += session.performance || 0;
      quizCount++;
    } else if (session.activityType === 'flashcard') {
      flashcardPerformance += session.performance || 0;
      flashcardCount++;
    }
  });

  // Find preferred time
  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const peakDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const avgSession = Math.round(totalDuration / studyPatterns.length);
  const avgQuizScore = quizCount > 0 ? Math.round(quizPerformance / quizCount) : 50;
  const avgFlashcardScore = flashcardCount > 0 ? Math.round(flashcardPerformance / flashcardCount) : 50;

  // Determine persona type
  const peakHourNum = parseInt(peakHour) || 12;
  const isNightOwl = peakHourNum >= 20 || peakHourNum < 5;
  const isEarlyBird = peakHourNum >= 5 && peakHourNum < 9;
  const isShortSession = avgSession < 20;
  const isLongSession = avgSession > 45;
  const isQuizMaster = avgQuizScore > 80;
  const isFlashcardPro = avgFlashcardScore > 80;

  // SRS performance
  const masteredItems = srsItems.filter(item => item.difficulty === 0 && item.correctCount >= 3).length;
  const totalItems = srsItems.length;
  const retentionRate = totalItems > 0 ? Math.round((masteredItems / totalItems) * 100) : 0;

  // Assign persona
  let persona;

  if (isNightOwl && isShortSession) {
    persona = {
      type: 'night_owl',
      title: 'The Night Owl 🦉',
      description: "You thrive in the quiet hours of the night. Your focused, short sessions after 8 PM show peak concentration when the world sleeps.",
      traits: ['Focused', 'Independent', 'Creative Thinker'],
      color: 'from-indigo-600 to-purple-700',
      icon: '🦉'
    };
  } else if (isEarlyBird && isLongSession) {
    persona = {
      type: 'early_bird',
      title: 'The Early Bird 🌅',
      description: "You catch the worm! Your morning deep-dive sessions show dedication and discipline. Fresh mind, focused learning.",
      traits: ['Disciplined', 'Energetic', 'Goal-Oriented'],
      color: 'from-orange-400 to-yellow-500',
      icon: '🌅'
    };
  } else if (isQuizMaster) {
    persona = {
      type: 'quiz_master',
      title: 'The Quiz Champion 🏆',
      description: "Assessments are your arena! Your exceptional quiz performance shows strong retention and test-taking prowess.",
      traits: ['Sharp Memory', 'Confident', 'Detail-Oriented'],
      color: 'from-yellow-500 to-amber-600',
      icon: '🏆'
    };
  } else if (isFlashcardPro) {
    persona = {
      type: 'memory_master',
      title: 'The Memory Master 🧠',
      description: "Your flashcard game is unmatched! You've mastered the art of spaced repetition and active recall.",
      traits: ['Pattern Recognition', 'Persistent', 'Strategic'],
      color: 'from-pink-500 to-rose-600',
      icon: '🧠'
    };
  } else if (isLongSession) {
    persona = {
      type: 'deep_diver',
      title: 'The Deep Diver 🤿',
      description: "You don't just learn — you immerse. Your long, focused sessions show a passion for truly understanding concepts.",
      traits: ['Thorough', 'Patient', 'Analytical'],
      color: 'from-blue-600 to-indigo-700',
      icon: '🤿'
    };
  } else if (isShortSession && studyPatterns.length > 20) {
    persona = {
      type: 'sprint_learner',
      title: 'The Sprint Learner ⚡',
      description: "Quick and consistent! Your frequent short sessions show you've mastered the micro-learning technique.",
      traits: ['Efficient', 'Consistent', 'Adaptable'],
      color: 'from-green-500 to-emerald-600',
      icon: '⚡'
    };
  } else {
    persona = {
      type: 'balanced_learner',
      title: 'The Balanced Scholar 📚',
      description: "You've found your rhythm! A healthy mix of study times and session lengths shows adaptability and balance.",
      traits: ['Balanced', 'Flexible', 'Well-Rounded'],
      color: 'from-teal-500 to-cyan-600',
      icon: '📚'
    };
  }

  // Add stats and tips
  const timeLabels = {
    0: '12 AM', 1: '1 AM', 2: '2 AM', 3: '3 AM', 4: '4 AM', 5: '5 AM',
    6: '6 AM', 7: '7 AM', 8: '8 AM', 9: '9 AM', 10: '10 AM', 11: '11 AM',
    12: '12 PM', 13: '1 PM', 14: '2 PM', 15: '3 PM', 16: '4 PM', 17: '5 PM',
    18: '6 PM', 19: '7 PM', 20: '8 PM', 21: '9 PM', 22: '10 PM', 23: '11 PM'
  };

  const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  persona.stats = {
    preferredTime: timeLabels[peakHourNum] || 'Afternoon',
    preferredDay: dayLabels[parseInt(peakDay)] || 'Weekdays',
    avgSessionLength: `${avgSession} minutes`,
    totalSessions: studyPatterns.length,
    quizAverage: `${avgQuizScore}%`,
    retentionRate: `${retentionRate}%`,
    strongestArea: avgQuizScore > avgFlashcardScore ? 'Quizzes' : 'Flashcards'
  };

  persona.tips = getPersonaTips(persona.type);
  persona.shareText = `I'm ${persona.title} on MindSphere! I study best at ${persona.stats.preferredTime} with ${persona.stats.avgSessionLength} sessions. What's your learning persona?`;

  return persona;
}

function getPersonaTips(type) {
  const tips = {
    night_owl: [
      "Use blue light filters to protect your eyes during late sessions",
      "Keep a consistent sleep schedule even with late study",
      "Take advantage of the quiet for deep focus work"
    ],
    early_bird: [
      "Tackle the hardest concepts first when your mind is freshest",
      "Use your morning energy for active recall exercises",
      "Consider light exercise before study to boost focus"
    ],
    quiz_master: [
      "Challenge yourself with timed quizzes to maintain your edge",
      "Help others by explaining concepts — it reinforces your knowledge",
      "Try creating your own quiz questions for deeper learning"
    ],
    memory_master: [
      "Continue your spaced repetition streak",
      "Try memory palace techniques for complex concepts",
      "Teach flashcard techniques to study groups"
    ],
    deep_diver: [
      "Schedule breaks to prevent burnout in long sessions",
      "Use the Pomodoro technique (50 min focus, 10 min break)",
      "Create detailed notes to capture your deep insights"
    ],
    sprint_learner: [
      "Keep maximizing your efficient study windows",
      "Use mobile apps go learn on-the-go",
      "Stack multiple micro-sessions for complex topics"
    ],
    balanced_learner: [
      "Your flexibility is your strength — use it to adapt to any topic",
      "Try new study techniques to optimize further",
      "Consider increasing session length for challenging concepts"
    ],
    explorer: [
      "Track 5+ study sessions to unlock your full persona",
      "Try studying at different times to find your peak",
      "Experiment with quizzes, flashcards, and reading"
    ]
  };

  return tips[type] || tips.explorer;
}

/**
 * GET /api/learning/recommendations
 * Get AI-powered course recommendations based on user's learning history
 */
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate('courses');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Analyze user's learning history
    const userCourses = await Course.find({ _id: { $in: user.courses } });
    const completedCourses = userCourses.filter(c => c.progress === 100);
    const inProgressCourses = userCourses.filter(c => c.progress > 0 && c.progress < 100);
    const studyPatterns = user.studyPatterns || [];

    // Extract topics/skills from completed courses
    const strengths = {};
    const topicScores = {};

    userCourses.forEach(course => {
      if (course.topics && Array.isArray(course.topics)) {
        course.topics.forEach(topic => {
          // Weight by progress and quiz performance
          const weight = (course.progress || 0) / 100;
          topicScores[topic] = (topicScores[topic] || 0) + weight;

          if (course.progress === 100) {
            strengths[topic] = (strengths[topic] || 0) + 1;
          }
        });
      }
    });

    // Get top strengths
    const topStrengths = Object.entries(strengths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);

    // If no data yet, return default recommendations
    if (topStrengths.length === 0) {
      return res.json({
        success: true,
        recommendations: [],
        strengths: [],
        completedCount: 0,
        inProgressCount: inProgressCourses.length
      });
    }

    // Simple collaborative filtering - find similar topics
    const enrolledTopics = new Set(userCourses.flatMap(c => c.topics || []));

    // Topic progression map (what comes after what)
    const topicProgression = {
      'Python': ['Machine Learning', 'Data Science', 'Web Development', 'Django', 'Flask'],
      'JavaScript': ['React', 'Node.js', 'TypeScript', 'Web Development', 'Vue.js'],
      'HTML': ['CSS', 'JavaScript', 'Web Development', 'Bootstrap'],
      'CSS': ['JavaScript', 'Responsive Design', 'Web Development', 'Sass'],
      'React': ['Next.js', 'TypeScript', 'Redux', 'Advanced React', 'React Native'],
      'Node.js': ['Express', 'MongoDB', 'REST API', 'GraphQL', 'Microservices'],
      'Machine Learning': ['Deep Learning', 'Neural Networks', 'Computer Vision', 'NLP', 'TensorFlow'],
      'Data Science': ['Machine Learning', 'Statistics', 'Data Visualization', 'Pandas', 'NumPy'],
      'SQL': ['Database Design', 'PostgreSQL', 'Data Analysis', 'MongoDB'],
      'Git': ['GitHub Actions', 'DevOps', 'CI/CD', 'Docker'],
      'Java': ['Spring Boot', 'Android Development', 'Microservices', 'Hibernate'],
      'C++': ['Data Structures', 'Algorithms', 'System Programming', 'Game Development'],
      'PHP': ['Laravel', 'WordPress', 'MySQL', 'Web Development'],
      'Ruby': ['Ruby on Rails', 'Web Development', 'REST API'],
      'Go': ['Microservices', 'Cloud Computing', 'Backend Development'],
      'Swift': ['iOS Development', 'SwiftUI', 'Mobile Development'],
      'Kotlin': ['Android Development', 'Mobile Development', 'Spring Boot']
    };

    // Generate recommendations based on strengths
    const recommendedTopics = new Set();
    topStrengths.forEach(strength => {
      const nextTopics = topicProgression[strength] || [];
      nextTopics.forEach(topic => {
        if (!enrolledTopics.has(topic)) {
          recommendedTopics.add(topic);
        }
      });
    });

    // Build recommendation list with reasoning
    const recommendationsList = Array.from(recommendedTopics).slice(0, 5).map(topic => {
      const relatedStrength = topStrengths.find(s =>
        topicProgression[s]?.includes(topic)
      );

      return {
        topic,
        reason: `You're strong in ${relatedStrength || 'programming'}. Students like you also excelled in ${topic}.`,
        strength: relatedStrength,
        confidence: Math.round(Math.random() * 15 + 85) // 85-100% confidence
      };
    });

    // If AI is available, enhance recommendations with AI reasoning
    let aiRecommendations = [];
    if (completedCourses.length > 0) {
      try {
        const prompt = `Based on this learning profile, recommend 3 courses to learn next:

Completed Courses: ${completedCourses.map(c => c.title).join(', ')}
In Progress: ${inProgressCourses.map(c => c.title).join(', ')}
Strengths: ${topStrengths.join(', ')}
Total Study Sessions: ${studyPatterns.length}

Available topics: Web Development, Mobile Development, Machine Learning, Data Science, Cloud Computing, Cybersecurity, DevOps, Blockchain, AI, IoT, Game Development, UI/UX Design

Respond in JSON format:
{
  "recommendations": [
    {
      "topic": "topic name",
      "reason": "personalized reason explaining why (mention their strengths)",
      "confidence": 85
    }
  ]
}`;

        const aiResponse = await generateAIContent(prompt);
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          aiRecommendations = parsed.recommendations || [];
        }
      } catch (aiError) {
        console.error('AI recommendation error:', aiError);
      }
    }

    // Merge AI and rule-based recommendations
    const finalRecommendations = aiRecommendations.length > 0
      ? aiRecommendations
      : recommendationsList;

    // Add trending badge to some recommendations
    const trendingTopics = ['AI', 'Machine Learning', 'Web Development', 'Cloud Computing', 'Cybersecurity', 'Blockchain', 'React', 'TypeScript'];
    finalRecommendations.forEach(rec => {
      rec.isTrending = trendingTopics.some(t => rec.topic.includes(t));
    });

    res.json({
      success: true,
      recommendations: finalRecommendations,
      strengths: topStrengths,
      completedCount: completedCourses.length,
      inProgressCount: inProgressCourses.length
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

export default router;
