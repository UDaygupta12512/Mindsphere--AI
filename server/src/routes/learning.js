import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateAIContent } from '../services/geminiService.js';

const router = express.Router();

const parseAiJsonObject = (aiResponse) => {
  if (!aiResponse) return null;
  if (typeof aiResponse === 'object') return aiResponse;
  if (typeof aiResponse === 'string') {
    try {
      return JSON.parse(aiResponse);
    } catch {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch {
          return null;
        }
      }
    }
  }
  return null;
};

const topicProgressionMap = {
  Trees: ['Recursion', 'Dynamic Programming', 'Graphs'],
  Recursion: ['Dynamic Programming', 'Backtracking'],
  'Dynamic Programming': ['Graphs', 'Advanced Algorithms'],
  Graphs: ['Advanced Algorithms', 'System Design'],
  Python: ['Data Structures', 'Machine Learning', 'Django'],
  JavaScript: ['React', 'Node.js', 'TypeScript'],
  React: ['Next.js', 'State Management', 'Performance Optimization'],
  'Node.js': ['Express', 'Databases', 'Microservices'],
  SQL: ['Database Design', 'Query Optimization', 'Analytics'],
  'Machine Learning': ['Deep Learning', 'MLOps', 'Model Evaluation'],
  'Data Science': ['Machine Learning', 'Data Visualization', 'Statistics']
};

const normalizeTopic = (topic) => (topic || '').toString().trim();

const findProgressionSuggestions = (topics) => {
  const suggestions = [];
  const topicSet = new Set(topics.map(normalizeTopic));

  topics.forEach((topic) => {
    const nextTopics = topicProgressionMap[topic] || [];
    nextTopics.forEach((nextTopic) => {
      if (!topicSet.has(nextTopic)) {
        suggestions.push({ from: topic, to: nextTopic });
      }
    });
  });

  return suggestions;
};

const projectTemplates = {
  react: {
    projectIdea: 'Build a productivity dashboard with reusable hooks and reducer-driven state',
    folderStructure: [
      { path: 'src/components', purpose: 'UI components for project features' },
      { path: 'src/hooks', purpose: 'Custom React hooks and state logic' },
      { path: 'src/state', purpose: 'Reducer/actions and app state' },
      { path: 'src/pages', purpose: 'Feature pages and navigation views' },
      { path: 'src/utils', purpose: 'Helpers and formatters' }
    ],
    starterCode: [
      {
        path: 'src/hooks/useTaskReducer.ts',
        language: 'typescript',
        content: `import { useReducer } from 'react';\n\ntype Task = { id: string; title: string; done: boolean };\ntype Action =\n  | { type: 'add'; payload: { title: string } }\n  | { type: 'toggle'; payload: { id: string } };\n\nfunction reducer(state: Task[], action: Action): Task[] {\n  switch (action.type) {\n    case 'add':\n      return [...state, { id: crypto.randomUUID(), title: action.payload.title, done: false }];\n    case 'toggle':\n      return state.map(t => t.id === action.payload.id ? { ...t, done: !t.done } : t);\n    default:\n      return state;\n  }\n}\n\nexport function useTaskReducer() {\n  return useReducer(reducer, []);\n}`
      }
    ],
    tasks: [
      { title: 'Create reducer and task actions', description: 'Implement add/toggle/remove flows with useReducer.' },
      { title: 'Build task list UI', description: 'Create task cards, filters, and completion badges.' },
      { title: 'Persist state locally', description: 'Store task state in localStorage and hydrate on load.' },
      { title: 'Add analytics panel', description: 'Show completed vs pending and daily progress summary.' }
    ]
  },
  default: {
    projectIdea: 'Build a focused learning app that applies the current topic in a practical workflow',
    folderStructure: [
      { path: 'src/core', purpose: 'Core domain logic for the topic' },
      { path: 'src/features', purpose: 'Feature modules built incrementally' },
      { path: 'src/challenges', purpose: 'Challenge solutions and variants' },
      { path: 'src/tests', purpose: 'Validation and automated tests' },
      { path: 'docs', purpose: 'Milestones and learning reflections' }
    ],
    starterCode: [
      {
        path: 'src/core/index.js',
        language: 'javascript',
        content: `export function startProject() {\n  return { status: 'ready', timestamp: Date.now() };\n}`
      }
    ],
    tasks: [
      { title: 'Define project scope', description: 'Write clear inputs, outputs, and success criteria.' },
      { title: 'Implement core logic', description: 'Build the smallest usable version of the main flow.' },
      { title: 'Add one advanced feature', description: 'Extend project with a topic-specific improvement.' },
      { title: 'Test and document', description: 'Add tests and write implementation notes.' }
    ]
  }
};

const pickTemplateForTopic = (topic) => {
  const normalized = normalizeTopic(topic).toLowerCase();
  if (normalized.includes('react') || normalized.includes('hook')) return projectTemplates.react;
  return projectTemplates.default;
};

const generateProjectId = () => `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

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
 * POST /api/learning/smart-compression
 * Create compressed learning views + concept dependencies + exam hotspots
 * Body: { courseId }
 */
router.post('/smart-compression', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'Missing required field: courseId' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const lessonTitles = (course.lessons || []).slice(0, 12).map((l, i) => `${i + 1}. ${l.title}`).join('\n');
    const noteSummary = (course.notes || []).slice(0, 8).map((n) => `${n.title}: ${Array.isArray(n.summary) ? n.summary.join('; ') : (n.summary || '')}`).join('\n');

    const prompt = `You are a learning compression engine. Compress this course into multi-level explanations and concept dependencies.

Course title: ${course.title}
Course topics: ${(course.topics || []).join(', ')}
Lessons:\n${lessonTitles}
Notes:\n${noteSummary}

Return ONLY JSON in this structure:
{
  "explainLike": {
    "five": "Explain in very simple terms",
    "fifteen": "Teen-friendly explanation",
    "expert": "Technical concise explanation"
  },
  "dependencyGraph": {
    "nodes": [{ "id": "n1", "label": "Concept", "group": "foundation|core|advanced" }],
    "edges": [{ "from": "n1", "to": "n2", "reason": "why n1 leads to n2" }]
  },
  "examHotTopics": [
    { "topic": "Topic", "whyImportant": "Why high frequency", "priority": "high|medium" }
  ]
}

Rules:
- Provide 5-8 nodes and 4-10 edges.
- Highlight only high-frequency exam-relevant topics.
- Keep language concise and specific.`;

    let compression = null;
    try {
      const aiResponse = await generateAIContent(prompt, true);
      compression = parseAiJsonObject(aiResponse);
    } catch (aiError) {
      console.error('Smart compression AI error:', aiError);
    }

    if (!compression) {
      compression = {
        explainLike: {
          five: `${course.title} is about learning small ideas step by step, then combining them to solve bigger problems.`,
          fifteen: `${course.title} teaches core concepts in sequence, then helps you apply them with practice and assessment.`,
          expert: `${course.title} establishes foundational abstractions, layers operational patterns, and validates understanding through applied tasks.`
        },
        dependencyGraph: {
          nodes: (course.topics || []).slice(0, 6).map((topic, index) => ({
            id: `n${index + 1}`,
            label: topic,
            group: index < 2 ? 'foundation' : index < 4 ? 'core' : 'advanced'
          })),
          edges: (course.topics || []).slice(0, 5).map((topic, index) => ({
            from: `n${index + 1}`,
            to: `n${index + 2}`,
            reason: `${topic} supports the next concept`
          }))
        },
        examHotTopics: (course.topics || []).slice(0, 4).map((topic) => ({
          topic,
          whyImportant: 'Frequently tested core concept with strong fundamentals impact.',
          priority: 'high'
        }))
      };
    }

    res.json({
      success: true,
      courseTitle: course.title,
      compression
    });
  } catch (error) {
    console.error('Error generating smart compression:', error);
    res.status(500).json({ error: 'Failed to generate smart compression' });
  }
});

/**
 * POST /api/learning/build-mode
 * Connect learning to doing with tasks, challenges, and project skeleton
 * Body: { courseId }
 */
router.post('/build-mode', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'Missing required field: courseId' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const prompt = `You are an educational project coach. Convert this course into build-while-learning mode.

Course title: ${course.title}
Topics: ${(course.topics || []).join(', ')}
Lessons: ${(course.lessons || []).slice(0, 12).map((l) => l.title).join(', ')}

Return ONLY JSON in this structure:
{
  "miniTasks": [
    { "title": "Task", "objective": "Outcome", "estimatedMinutes": 20, "linkedTopic": "Topic" }
  ],
  "codeChallenges": [
    { "title": "Challenge", "prompt": "Problem statement", "difficulty": "easy|medium|hard", "starterHint": "Hint" }
  ],
  "projectSkeleton": {
    "projectName": "Name",
    "description": "One-line description",
    "folders": [{ "path": "src/components", "purpose": "Why this folder exists" }],
    "milestones": ["Milestone 1", "Milestone 2", "Milestone 3"]
  }
}

Rules:
- 4-7 mini tasks
- 3-5 code challenges
- 5-8 practical folders
- milestone sequence should represent build progression.`;

    let buildMode = null;
    try {
      const aiResponse = await generateAIContent(prompt, true);
      buildMode = parseAiJsonObject(aiResponse);
    } catch (aiError) {
      console.error('Build mode AI error:', aiError);
    }

    if (!buildMode) {
      buildMode = {
        miniTasks: (course.topics || []).slice(0, 5).map((topic, index) => ({
          title: `Mini task ${index + 1}: ${topic}`,
          objective: `Apply ${topic} in a focused hands-on activity.`,
          estimatedMinutes: 20,
          linkedTopic: topic
        })),
        codeChallenges: [
          {
            title: `${course.title} Core Logic Challenge`,
            prompt: 'Implement a small feature that demonstrates the core concept.',
            difficulty: 'easy',
            starterHint: 'Break the feature into input, processing, and output steps.'
          },
          {
            title: `${course.title} Integration Challenge`,
            prompt: 'Combine at least two learned concepts in one solution.',
            difficulty: 'medium',
            starterHint: 'Reuse previous mini tasks and integrate incrementally.'
          }
        ],
        projectSkeleton: {
          projectName: `${course.title.replace(/\s+/g, '-')}-lab`,
          description: 'A guided project built while progressing through the course.',
          folders: [
            { path: 'src', purpose: 'Application source code' },
            { path: 'src/features', purpose: 'Feature modules aligned to topics' },
            { path: 'src/challenges', purpose: 'Challenge implementations' },
            { path: 'src/tests', purpose: 'Validation and tests' },
            { path: 'docs', purpose: 'Learning notes and reflection logs' }
          ],
          milestones: [
            'Set up the starter project',
            'Build core feature modules',
            'Complete code challenges',
            'Integrate and polish final project'
          ]
        }
      };
    }

    res.json({
      success: true,
      courseTitle: course.title,
      buildMode
    });
  } catch (error) {
    console.error('Error generating build mode:', error);
    res.status(500).json({ error: 'Failed to generate build mode plan' });
  }
});

/**
 * GET /api/learning/daily-plan/auto
 * Auto-generate today's plan using progress, weak areas, and spaced repetition queue
 */
router.get('/daily-plan/auto', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userCourses = await Course.find({ _id: { $in: user.courses || [] } });
    const inProgressCourses = userCourses.filter(c => c.progress > 0 && c.progress < 100);
    const dueReviews = (user.srsItems || [])
      .filter(item => new Date(item.nextReview) <= new Date())
      .sort((a, b) => b.difficulty - a.difficulty)
      .slice(0, 8);

    const weakAttempts = (user.quizAttempts || []).filter(a => (a.score || 0) < 70);
    const weakTopicMap = new Map();
    weakAttempts.forEach((attempt) => {
      const topic = normalizeTopic(attempt.topic) || 'General';
      const current = weakTopicMap.get(topic) || { topic, count: 0, minScore: 100 };
      current.count += 1;
      current.minScore = Math.min(current.minScore, attempt.score || 0);
      weakTopicMap.set(topic, current);
    });

    const weakTopics = Array.from(weakTopicMap.values())
      .sort((a, b) => b.count - a.count || a.minScore - b.minScore)
      .slice(0, 3)
      .map(t => t.topic);

    const fallbackPlan = {
      date: new Date().toISOString(),
      focus: weakTopics[0] || inProgressCourses[0]?.title || 'Core revision',
      tasks: [
        {
          type: 'review',
          title: 'Memory-based revision session',
          durationMinutes: 20,
          reason: dueReviews.length > 0 ? `You have ${dueReviews.length} due review items` : 'Reinforce long-term retention'
        },
        {
          type: 'weak-area',
          title: weakTopics.length > 0 ? `Fix weak area: ${weakTopics[0]}` : 'Attempt a quick diagnostic quiz',
          durationMinutes: 25,
          reason: weakTopics.length > 0 ? 'Score trend below 70% detected' : 'Collect performance signal'
        },
        {
          type: 'progress',
          title: inProgressCourses[0] ? `Continue ${inProgressCourses[0].title}` : 'Start next lesson',
          durationMinutes: 30,
          reason: 'Sustain daily momentum'
        }
      ],
      goals: [
        'Complete all due spaced-repetition reviews',
        'Improve one weak topic by active recall',
        'Finish one meaningful learning block'
      ]
    };

    const prompt = `Create a concise daily learning plan for this user.

In-progress courses: ${inProgressCourses.map(c => `${c.title} (${c.progress}%)`).join(', ') || 'None'}
Weak topics: ${weakTopics.join(', ') || 'None'}
Due memory reviews: ${dueReviews.length}

Return ONLY JSON:
{
  "date": "ISO date",
  "focus": "main focus",
  "tasks": [
    { "type": "review|weak-area|progress", "title": "task", "durationMinutes": 20, "reason": "why now" }
  ],
  "goals": ["goal 1", "goal 2", "goal 3"]
}

Rules: 3-5 tasks, total 60-120 minutes, prioritize due memory reviews and weak topics.`;

    let dailyPlan = null;
    try {
      const aiResponse = await generateAIContent(prompt, true);
      dailyPlan = parseAiJsonObject(aiResponse);
    } catch (aiError) {
      console.error('Daily plan AI error:', aiError);
    }

    res.json({
      success: true,
      dailyPlan: dailyPlan && dailyPlan.tasks ? dailyPlan : fallbackPlan,
      signals: {
        dueReviews: dueReviews.length,
        weakTopics,
        inProgressCourses: inProgressCourses.length
      }
    });
  } catch (error) {
    console.error('Error generating auto daily plan:', error);
    res.status(500).json({ error: 'Failed to generate daily plan' });
  }
});

/**
 * GET /api/learning/knowledge-graph
 * Build personal knowledge graph showing learned topics, gaps, and recommended path
 */
router.get('/knowledge-graph', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userCourses = await Course.find({ _id: { $in: user.courses || [] } });
    const topicStats = new Map();

    userCourses.forEach((course) => {
      (course.topics || []).forEach((rawTopic) => {
        const topic = normalizeTopic(rawTopic);
        if (!topic) return;

        const current = topicStats.get(topic) || {
          topic,
          maxProgress: 0,
          appearances: 0,
          courseTitles: new Set()
        };

        current.appearances += 1;
        current.maxProgress = Math.max(current.maxProgress, course.progress || 0);
        current.courseTitles.add(course.title);
        topicStats.set(topic, current);
      });
    });

    const weakTopicSet = new Set(
      (user.quizAttempts || [])
        .filter(a => (a.score || 0) < 70)
        .map(a => normalizeTopic(a.topic))
        .filter(Boolean)
    );

    const knownTopics = Array.from(topicStats.keys());
    const progressionSuggestions = findProgressionSuggestions(knownTopics);

    const nodes = knownTopics.map((topic, index) => {
      const stat = topicStats.get(topic);
      const state = weakTopicSet.has(topic)
        ? 'weak'
        : stat.maxProgress >= 90
        ? 'mastered'
        : stat.maxProgress >= 40
        ? 'learning'
        : 'new';

      return {
        id: `k${index + 1}`,
        label: topic,
        state,
        progress: stat.maxProgress,
        evidenceCount: stat.appearances
      };
    });

    const nodeIdByLabel = new Map(nodes.map((n) => [n.label, n.id]));
    const edges = [];

    progressionSuggestions.forEach((link) => {
      const fromId = nodeIdByLabel.get(link.from);
      const toId = nodeIdByLabel.get(link.to);
      if (fromId && toId) {
        edges.push({ from: fromId, to: toId, relation: 'prerequisite' });
      }
    });

    const gaps = progressionSuggestions
      .filter(link => !nodeIdByLabel.has(link.to))
      .slice(0, 6)
      .map(link => ({ from: link.from, missing: link.to }));

    const recommendedPath = [];
    if (knownTopics.includes('Trees')) {
      recommendedPath.push('Trees', 'Recursion', 'Dynamic Programming', 'Graphs');
    } else {
      const learned = nodes.filter(n => n.state === 'learning' || n.state === 'mastered').slice(0, 2).map(n => n.label);
      const next = gaps.slice(0, 2).map(g => g.missing);
      recommendedPath.push(...learned, ...next);
    }

    res.json({
      success: true,
      graph: {
        nodes,
        edges,
        gaps,
        recommendedPath: Array.from(new Set(recommendedPath)).filter(Boolean)
      }
    });
  } catch (error) {
    console.error('Error building knowledge graph:', error);
    res.status(500).json({ error: 'Failed to build knowledge graph' });
  }
});

/**
 * POST /api/learning/project-builder/generate
 * Generate an auto project from the user's current learning topic
 * Body: { courseId, topic }
 */
router.post('/project-builder/generate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId, topic } = req.body;

    if (!courseId || !topic) {
      return res.status(400).json({ error: 'Missing required fields: courseId and topic' });
    }

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const template = pickTemplateForTopic(topic);

    const prompt = `You are a project-based learning coach. Customize this project template to the topic.

Topic: ${topic}
Course: ${course.title}
Base project idea: ${template.projectIdea}

Return ONLY JSON:
{
  "projectIdea": "customized project idea",
  "folderStructure": [{ "path": "src/...", "purpose": "..." }],
  "starterCode": [{ "path": "src/file.ext", "language": "javascript|typescript|python", "content": "code" }],
  "tasks": [{ "title": "task", "description": "what to build" }],
  "milestones": ["step 1", "step 2", "step 3"]
}

Rules: 4-7 tasks, practical progression, and topic-specific outcomes.`;

    let customized = null;
    try {
      const aiResponse = await generateAIContent(prompt, true);
      customized = parseAiJsonObject(aiResponse);
    } catch (aiError) {
      console.error('Project builder AI error:', aiError);
    }

    const source = customized && customized.tasks ? customized : template;
    const projectId = generateProjectId();
    const tasks = (source.tasks || []).map((task, index) => ({
      taskId: `task_${index + 1}`,
      title: task.title,
      description: task.description,
      completed: false
    }));

    const project = {
      projectId,
      courseId: course._id,
      courseTitle: course.title,
      topic,
      projectIdea: source.projectIdea || template.projectIdea,
      folderStructure: source.folderStructure || template.folderStructure,
      starterCode: source.starterCode || template.starterCode,
      tasks,
      completionPercent: 0,
      status: 'not-started',
      createdAt: new Date(),
      updatedAt: new Date(),
      milestones: source.milestones || []
    };

    user.learningProjects = user.learningProjects || [];
    user.learningProjects.push(project);
    if (user.learningProjects.length > 100) {
      user.learningProjects = user.learningProjects.slice(-100);
    }
    await user.save();

    res.json({ success: true, project });
  } catch (error) {
    console.error('Error generating auto project:', error);
    res.status(500).json({ error: 'Failed to generate auto project' });
  }
});

/**
 * GET /api/learning/project-builder
 * List generated projects for the current user, optionally filtered by course
 */
router.get('/project-builder', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId } = req.query;
    const user = await User.findById(userId).select('learningProjects');
    if (!user) return res.status(404).json({ error: 'User not found' });

    let projects = user.learningProjects || [];
    if (courseId) {
      projects = projects.filter(p => p.courseId && p.courseId.toString() === courseId.toString());
    }

    projects = [...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.json({ success: true, projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch project list' });
  }
});

/**
 * PATCH /api/learning/project-builder/:projectId/tasks/:taskId
 * Update task completion and project progress
 * Body: { completed: boolean }
 */
router.patch('/project-builder/:projectId/tasks/:taskId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { projectId, taskId } = req.params;
    const { completed } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const projectIndex = (user.learningProjects || []).findIndex(p => p.projectId === projectId);
    if (projectIndex === -1) return res.status(404).json({ error: 'Project not found' });

    const project = user.learningProjects[projectIndex];
    const taskIndex = (project.tasks || []).findIndex(t => t.taskId === taskId);
    if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });

    project.tasks[taskIndex].completed = Boolean(completed);

    const totalTasks = project.tasks.length || 1;
    const doneCount = project.tasks.filter(t => t.completed).length;
    project.completionPercent = Math.round((doneCount / totalTasks) * 100);
    project.status = doneCount === 0 ? 'not-started' : doneCount === totalTasks ? 'completed' : 'in-progress';
    project.updatedAt = new Date();

    user.learningProjects[projectIndex] = project;
    await user.save();

    res.json({ success: true, project });
  } catch (error) {
    console.error('Error updating project task:', error);
    res.status(500).json({ error: 'Failed to update project task' });
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
