import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';
import JSON5 from 'json5';
import Ajv from 'ajv';
import { createRequire } from 'module';

// Load jsonrepair via createRequire to support CommonJS/ESM differences
const require = createRequire(import.meta.url);
let jsonRepair = null;
try {
  jsonRepair = require('jsonrepair');
} catch (err) {
  jsonRepair = null;
}

// Helper to attempt repairing JSON-like text using whatever form the module provides
const tryJsonRepair = (candidate) => {
  if (!jsonRepair) return null;
  try {
    if (typeof jsonRepair === 'function') return jsonRepair(candidate);
    if (jsonRepair && typeof jsonRepair.repair === 'function') return jsonRepair.repair(candidate);
    if (jsonRepair && jsonRepair.default && typeof jsonRepair.default === 'function') return jsonRepair.default(candidate);
    return null;
  } catch (e) {
    return null;
  }
};

// Setup Ajv validator
const ajv = new Ajv({ allErrors: true, strict: false });

// Basic schemas
const quizItemSchema = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    question: { type: 'string' },
    options: { type: 'array' },
    correctAnswer: { type: 'string' },
    explanations: { type: 'object' },
    correctExplanation: { type: 'string' },
    difficulty: { type: 'string' }
  },
  required: ['type', 'question', 'options', 'correctAnswer']
};

const quizEnvelopeSchema = {
  type: 'object',
  properties: {
    quizQuestions: {
      type: 'array',
      items: quizItemSchema
    }
  },
  required: ['quizQuestions']
};

const courseEnvelopeSchema = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    category: { type: 'string' },
    level: { type: 'string' },
    topics: { type: 'array' },
    whatYouLearn: { type: 'array' },
    requirements: { type: 'array' },
    lessons: { type: 'array' },
    notes: { type: 'array' },
    insights: { type: 'array' },
    flashcards: { type: 'array' },
    quizQuestions: {
      type: 'array',
      items: quizItemSchema
    }
  }
};

// Helper: extract candidate JSON string from AI text
const extractCandidateJson = (text) => {
  if (!text || typeof text !== 'string') return null;
  // Prefer ```json fenced blocks
  const fencedJson = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedJson && fencedJson[1]) return fencedJson[1].trim();

  // Any fenced block
  const fencedAny = text.match(/```\s*([\s\S]*?)\s*```/);
  if (fencedAny && fencedAny[1]) return fencedAny[1].trim();

  // Try to find the first balanced JSON object { ... }
  const firstBrace = text.indexOf('{');
  if (firstBrace === -1) return null;
  let depth = 0;
  for (let i = firstBrace; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    if (depth === 0) {
      return text.slice(firstBrace, i + 1);
    }
  }

  return null;
};

// Helper: conservative cleanup for common AI formatting issues (smart quotes, trailing commas, markdown)
const cleanJsonCandidate = (s) => {
  if (!s) return s;
  let out = s;
  // Normalize smart quotes
  out = out.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  // Remove markdown bold/italics markers
  out = out.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
  // Remove leading/trailing ``` if present
  out = out.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  // Remove Windows CR
  out = out.replace(/\r/g, '\n');
  // Remove any lines that look like log badges (e.g. ✅, ❌) at line start
  out = out.split('\n').filter(line => !/^\s*[✅❌⚠️✔︎✔✖️]/.test(line)).join('\n');
  // Remove trailing commas before } or ]
  out = out.replace(/,\s*(?=[}\]])/g, '');
  // Remove stray backticks
  out = out.replace(/`/g, '');
  return out;
};

// Parse candidate JSON using only JSON.parse (no install required). If it fails, attempt a cleaned parse.
const parseAiJsonSafely = (rawText) => {
  let candidate = extractCandidateJson(rawText) || rawText;
  if (!candidate) throw new Error('No JSON-like content found in AI response');

  // Normalize CRLF
  candidate = candidate.replace(/\r\n/g, '\n');

  // If the AI included fenced code blocks inside string values (e.g., ```html ... ```),
  // convert their internal newlines to literal \n so they don't break JSON parsing.
  candidate = candidate.replace(/```[\s\S]*?```/g, (m) => m.replace(/`/g, '').replace(/\n/g, '\\n'));

  // Escape literal newlines and unescaped quotes that appear inside JSON string values.
  const escapeSpecialCharsInStrings = (s) => {
    let out = '';
    let inString = false;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === '"') {
        // count preceding backslashes to determine if quote is escaped
        let j = i - 1;
        let backslashes = 0;
        while (j >= 0 && s[j] === '\\') { backslashes++; j--; }
        if (backslashes % 2 === 0) {
          // This is an unescaped quote - it toggles string state
          inString = !inString;
          out += ch;
        } else {
          // This is an escaped quote - keep it as is
          out += ch;
        }
        continue;
      }
      if (inString) {
        // Inside a string, escape newlines
        if (ch === '\n') {
          out += '\\n';
          continue;
        }
      }
      out += ch;
    }
    return out;
  };

  // First pass: handle newlines and basic escaping
  candidate = escapeSpecialCharsInStrings(candidate);

  // Second pass: fix unescaped quotes within string values
  // This handles cases like "question": "What is \"Hello World\"?"
  const fixUnescapedQuotesInStrings = (s) => {
    let out = '';
    let inString = false;
    let afterColon = false;

    for (let i = 0; i < s.length; i++) {
      const ch = s[i];

      // Track if we're after a colon (start of a value)
      if (!inString && ch === ':') {
        afterColon = true;
        out += ch;
        continue;
      }

      if (ch === '"') {
        // Count preceding backslashes
        let j = i - 1;
        let backslashes = 0;
        while (j >= 0 && s[j] === '\\') { backslashes++; j--; }

        if (backslashes % 2 === 0) {
          // Unescaped quote
          if (!inString && afterColon) {
            // Starting a string value
            inString = true;
            afterColon = false;
            out += ch;
          } else if (inString) {
            // Check if this is the closing quote or a quote within the string
            // Look ahead to see if we're at the end of the value
            let k = i + 1;
            while (k < s.length && (s[k] === ' ' || s[k] === '\n' || s[k] === '\r')) k++;

            if (k < s.length && (s[k] === ',' || s[k] === '}' || s[k] === ']')) {
              // This is the closing quote
              inString = false;
              out += ch;
            } else if (k >= s.length) {
              // End of string, this is the closing quote
              inString = false;
              out += ch;
            } else {
              // This is a quote within the string - escape it
              out += '\\' + ch;
            }
          } else {
            out += ch;
          }
        } else {
          // Already escaped quote
          out += ch;
        }
        continue;
      }

      // Reset afterColon flag for non-whitespace characters
      if (!inString && ch !== ' ' && ch !== '\n' && ch !== '\r' && ch !== '\t') {
        if (ch !== ':') afterColon = false;
      }

      out += ch;
    }
    return out;
  };

  candidate = fixUnescapedQuotesInStrings(candidate);

  // Try strict JSON.parse first
  try {
    return JSON.parse(candidate);
  } catch (e1) {
    // Try cleaning and parse again
    try {
      const cleaned = cleanJsonCandidate(candidate);
      return JSON.parse(cleaned);
    } catch (e2) {
      // Try jsonrepair (if available) then JSON.parse again
      try {
        const repaired = jsonRepair(candidate);
        try {
          return JSON.parse(repaired);
        } catch (eRepairParse) {
          // Fall through to JSON5 attempts
        }
      } catch (repairErr) {
        // repair library failed or not applicable; continue to JSON5
      }

      // As a last resort, try JSON5 (already available in repo)
      try {
        return JSON5.parse(candidate);
      } catch (e3) {
        try {
          const cleaned2 = cleanJsonCandidate(candidate);
          return JSON5.parse(cleaned2);
        } catch (e4) {
          const err = new Error('Failed to parse AI JSON response');
          err.details = { e1: e1.message, e2: e2.message, e3: e3?.message, e4: e4?.message };
          err.raw = candidate.substring(0, 1000); // Show first 1000 chars for debugging
          console.error('❌ All JSON parsing attempts failed');
          console.error('Error details:', err.details);
          console.error('Candidate preview (first 1000 chars):', err.raw);
          throw err;
        }
      }
    }
  }
};

let openRouterApiKey;
let geminiApiKeys = [];
let geminiModels = [];
let currentKeyIndex = 0;
let currentModelIndex = 0;

/**
 * Helper function to make Gemini API calls with key rotation and model fallback
 * @param {string} prompt - The prompt to send to the model
 * @param {number} maxRetries - Maximum number of retries per key/model combination
 * @returns {Promise<string>} Response text from the AI model
 */
const makeGeminiCallWithRotation = async (prompt, maxRetries = 2) => {
  const totalAttempts = geminiApiKeys.length * geminiModels.length;
  let lastError;

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    const apiKey = geminiApiKeys[currentKeyIndex];
    const modelName = geminiModels[currentModelIndex];

    try {
      console.log(`🔄 Gemini API attempt ${attempt + 1}/${totalAttempts} - Key: ${currentKeyIndex + 1}/${geminiApiKeys.length}, Model: ${modelName}`);

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const response = await result.response;

      // Check for safety ratings and blocked content
      if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        if (candidate.finishReason && candidate.finishReason !== 'STOP') {
          console.warn('⚠️ Finish reason not STOP:', candidate.finishReason);
          if (candidate.finishReason === 'SAFETY') {
            throw new Error('Content blocked due to safety filters');
          }
        }
      }

      const text = response.text();
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Gemini');
      }

      console.log(`✅ Gemini API succeeded with key ${currentKeyIndex + 1}, model: ${modelName}`);
      return text;
    } catch (error) {
      lastError = error;
      console.warn(`❌ Gemini API failed with key ${currentKeyIndex + 1}, model: ${modelName} - ${error.message}`);

      // Move to next key, if all keys tried for current model, move to next model
      currentKeyIndex = (currentKeyIndex + 1) % geminiApiKeys.length;
      if (currentKeyIndex === 0) {
        currentModelIndex = (currentModelIndex + 1) % geminiModels.length;
      }

      // Add a small delay between attempts
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // All attempts failed, fallback to OpenRouter if available
  if (openRouterApiKey) {
    console.log('🔄 Falling back to OpenRouter API...');
    try {
      return await makeOpenRouterCall(prompt);
    } catch (openRouterError) {
      console.error('❌ OpenRouter fallback also failed:', openRouterError.message);
    }
  }

  // Reset indices for next attempt
  currentKeyIndex = 0;
  currentModelIndex = 0;

  throw lastError || new Error('All Gemini API attempts failed');
};
/**
 * Helper function to make OpenRouter API calls with model fallback
 * @param {string} prompt - The prompt to send to the model
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise<string>} Response text from the AI model
 */
const makeOpenRouterCall = async (prompt, modelOverride = null, maxRetries = 3) => {
  const models = modelOverride ? [modelOverride] : ['openai/gpt-4o', 'openai/gpt-3.5-turbo']; // Fallback order or specific model
  let lastError;

  for (const model of models) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 OpenRouter API attempt ${attempt}/${maxRetries} with ${model}`);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            'HTTP-Referer': process.env.SITE_URL || 'http://localhost:5173',
            'X-Title': process.env.SITE_NAME || 'MindSphere AI',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error?.message || response.statusText;

          // Check for credit limit or insufficient funds errors
          const isCreditError = errorMessage.toLowerCase().includes('credit') ||
            errorMessage.toLowerCase().includes('insufficient') ||
            errorMessage.toLowerCase().includes('quota') ||
            errorMessage.toLowerCase().includes('limit') ||
            response.status === 402;

          if (isCreditError && model === 'openai/gpt-4o') {
            console.warn(`💸 Credit limit reached for GPT-4o, switching to GPT-3.5 Turbo`);
            break; // Break inner loop to try next model
          }

          throw new Error(`OpenRouter API error: ${response.status} - ${errorMessage}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error('No content in OpenRouter API response');
        }

        console.log(`✅ OpenRouter API succeeded with ${model} on attempt ${attempt}`);
        return content;
      } catch (error) {
        lastError = error;

        // Check if it's a credit error for GPT-4o
        if (error.message.toLowerCase().includes('credit') ||
          error.message.toLowerCase().includes('insufficient') ||
          error.message.toLowerCase().includes('quota') ||
          error.message.toLowerCase().includes('limit')) {
          if (model === 'openai/gpt-4o') {
            console.warn(`💸 Credit limit detected for GPT-4o: ${error.message}`);
            break; // Break to try GPT-3.5 Turbo
          }
        }

        // Check if error is retryable (503 Service Unavailable, 429 Too Many Requests, 500 Internal Server Error)
        const isRetryable = error.message.includes('503') || error.message.includes('429') || error.message.includes('500');

        if (!isRetryable) {
          // Not a retryable error, try next model
          break;
        }

        if (attempt === maxRetries) {
          // Last attempt failed for this model, try next model
          break;
        }

        // Calculate exponential backoff: 1s, 2s, 4s
        const delayMs = Math.pow(2, attempt - 1) * 1000;
        console.warn(`⚠️ OpenRouter API error with ${model}. Retrying in ${delayMs}ms...`);

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  // All models and retries exhausted
  throw lastError || new Error('All OpenRouter models failed');
};

// Generate a comprehensive note for a section on demand
export const generateComprehensiveNote = async (courseTitle, sectionTitle, summary, courseContext) => {
  if (geminiApiKeys.length === 0 && !openRouterApiKey) {
    throw new Error('AI system is not initialized. Please check your API keys.');
  }

  const prompt = `You are an expert educational content creator. Given the following course and section, generate a high-quality, one-page comprehensive note for the section. The note should be clear, well-structured, and suitable for deep understanding and revision. Avoid repeating the summary points; instead, expand on them with rich, specific, and educational content. Use engaging language and examples where appropriate.

Course Title: ${courseTitle}
Section Title: ${sectionTitle}
Section Summary (bullets):\n${summary}
Course Context (topics, other sections):\n${courseContext}

Return only the comprehensive note as a single string, no JSON or markdown formatting.`;

  try {
    // Try Gemini first, then fallback to OpenRouter
    if (geminiApiKeys.length > 0) {
      return await makeGeminiCallWithRotation(prompt);
    } else {
      return await makeOpenRouterCall(prompt);
    }
  } catch (error) {
    console.error('Error generating comprehensive note:', error);
    throw new Error('Failed to generate comprehensive note. Please try again.');
  }
};

export const initializeGemini = () => {
  // Initialize Gemini API keys (support multiple formats)
  geminiApiKeys = [];

  // Method 1: Comma-separated keys
  const geminiApiKeysEnv = process.env.GEMINI_API_KEYS;
  if (geminiApiKeysEnv) {
    geminiApiKeys = geminiApiKeysEnv.split(',').map(key => key.trim().replace(/"/g, '')).filter(key => key.length > 0);
  }

  // Method 2: Individual key environment variables
  const individualKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5
  ].filter(key => key && key.trim().length > 0).map(key => key.trim().replace(/"/g, ''));

  // Combine both methods (remove duplicates)
  geminiApiKeys = [...new Set([...geminiApiKeys, ...individualKeys])];

  if (geminiApiKeys.length > 0) {
    console.log(`✅ Initialized ${geminiApiKeys.length} Gemini API key(s)`);
  }

  // Initialize OpenRouter API keys (support multiple keys)
  const openRouterKeys = [
    process.env.OPENROUTER_API_KEY,
    process.env.OPENAI_API_KEY,
    process.env.OPENAI_API_KEY_SECONDARY,
    process.env.OPENAI_API_KEY_TERTIARY
  ].filter(key => key && key.trim().length > 0).map(key => key.trim().replace(/"/g, ''));

  if (openRouterKeys.length > 0) {
    openRouterApiKey = openRouterKeys[0]; // Use first available OpenRouter key
    console.log(`✅ Initialized ${openRouterKeys.length} OpenRouter API key(s) (using first one)`);
  }

  // Initialize Gemini models (support multiple models for fallback)
  const geminiModelsEnv = process.env.GEMINI_MODELS || 'gemini-2.5-flash,gemini-2.5-flash-lite,gemini-2.5-pro';
  geminiModels = geminiModelsEnv.split(',').map(model => model.trim()).filter(model => model.length > 0);
  console.log(`✅ Initialized ${geminiModels.length} Gemini model(s): ${geminiModels.join(', ')}`);

  if (geminiApiKeys.length === 0 && !openRouterApiKey) {
    console.warn('⚠️ No API keys configured. AI features will be disabled.');
    return false;
  }

  try {
    console.log(`✅ AI system initialized with ${geminiApiKeys.length} Gemini key(s), ${geminiModels.length} model(s), and ${openRouterApiKey ? 'OpenRouter fallback' : 'no OpenRouter fallback'}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize AI system:', error.message);
    return false;
  }
};

const toCleanStringArray = (value, minItems = 0, maxItems = 8) => {
  const asArray = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/\n|,|•|-/) : [];
  const cleaned = asArray
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
  if (cleaned.length >= minItems) {
    return cleaned.slice(0, maxItems);
  }
  return cleaned;
};

const normalizeCourseInsights = (insights, notes, topics) => {
  const cleaned = (Array.isArray(insights) ? insights : [])
    .map((insight) => ({
      title: typeof insight?.title === 'string' ? insight.title.trim() : '',
      whyItMatters: typeof insight?.whyItMatters === 'string' ? insight.whyItMatters.trim() : '',
      applyItToday: typeof insight?.applyItToday === 'string' ? insight.applyItToday.trim() : '',
      successMetric: typeof insight?.successMetric === 'string' ? insight.successMetric.trim() : '',
      relatedTopics: toCleanStringArray(insight?.relatedTopics, 0, 4)
    }))
    .filter((insight) => insight.title && insight.whyItMatters && insight.applyItToday && insight.successMetric);

  if (cleaned.length > 0) {
    return cleaned.slice(0, 6);
  }

  const noteFallback = (Array.isArray(notes) ? notes : [])
    .slice(0, 4)
    .map((note, index) => {
      const bullet = Array.isArray(note?.summary) ? note.summary[0] : '';
      const relatedTopics = toCleanStringArray(note?.topics, 0, 3);
      return {
        title: typeof note?.title === 'string' && note.title.trim().length > 0 ? note.title.trim() : `Insight ${index + 1}`,
        whyItMatters: bullet || `Understanding this concept builds stronger fundamentals in ${relatedTopics[0] || topics[0] || 'the course'}.`,
        applyItToday: `Write a short explanation and one real-world example for "${typeof note?.title === 'string' ? note.title.trim() : `Insight ${index + 1}`}".`,
        successMetric: 'Can explain the concept in 60 seconds without notes.',
        relatedTopics
      };
    });

  if (noteFallback.length > 0) {
    return noteFallback;
  }

  return [
    {
      title: 'Core Foundations',
      whyItMatters: 'Strong fundamentals help you retain advanced material faster.',
      applyItToday: 'Summarize one core concept in your own words.',
      successMetric: 'Can recall 3 key ideas from memory.',
      relatedTopics: toCleanStringArray(topics, 0, 3)
    }
  ];
};

const normalizeGeneratedCourseContent = (raw, courseTitle) => {
  const topics = toCleanStringArray(raw?.topics, 3, 8);

  const notes = (Array.isArray(raw?.notes) ? raw.notes : [])
    .map((note, index) => {
      const summary = Array.isArray(note?.summary)
        ? toCleanStringArray(note.summary, 0, 6)
        : toCleanStringArray(typeof note?.summary === 'string' ? note.summary : note?.content, 0, 6);
      return {
        title: typeof note?.title === 'string' && note.title.trim().length > 0 ? note.title.trim() : `Section ${index + 1}`,
        summary: summary.length > 0 ? summary : ['Review the lesson and capture the core takeaway in one sentence.'],
        topics: toCleanStringArray(note?.topics, 0, 4)
      };
    })
    .filter((note) => note.title && note.summary.length > 0);

  return {
    summary: typeof raw?.summary === 'string' && raw.summary.trim().length > 0
      ? raw.summary.trim()
      : `This course helps you build practical understanding in ${courseTitle}.`,
    category: typeof raw?.category === 'string' && raw.category.trim().length > 0 ? raw.category.trim() : 'General',
    level: ['Beginner', 'Intermediate', 'Advanced'].includes(raw?.level) ? raw.level : 'Intermediate',
    topics: topics.length > 0 ? topics : ['Learning', 'Practice', 'Application'],
    whatYouLearn: toCleanStringArray(raw?.whatYouLearn, 0, 8),
    requirements: toCleanStringArray(raw?.requirements, 0, 6),
    lessons: Array.isArray(raw?.lessons) ? raw.lessons : [],
    quizQuestions: Array.isArray(raw?.quizQuestions) ? raw.quizQuestions : [],
    flashcards: Array.isArray(raw?.flashcards) ? raw.flashcards : [],
    notes: notes.length > 0 ? notes : [
      {
        title: 'Course Overview',
        summary: ['Understand the main goals of this course.', 'Identify the top topics to focus on first.'],
        topics: topics.slice(0, 3)
      }
    ],
    insights: normalizeCourseInsights(raw?.insights, notes, topics)
  };
};

export const generateCourseContent = async (title, sourceType, source) => {
  if (geminiApiKeys.length === 0 && !openRouterApiKey) {
    throw new Error('AI system is not initialized. Please check your API keys.');
  }

  const sourceContext = sourceType === 'pdf'
    ? `Source Type: PDF\nExtracted Content: ${source}`
    : `Source Type: ${sourceType}\nSource Reference: ${source}`;

  const prompt = `You are an expert curriculum architect and learning scientist.
Generate premium, heavily engaging, and profound learning content that is specific, practical, and highly optimized for retention.

Course Title: ${title}
${sourceContext}

Requirements:
1. Summary: 2-3 concise sentences with concrete outcomes.
2. Category and level: choose one of Beginner, Intermediate, Advanced.
3. Topics: 5-8 focused topics.
4. WhatYouLearn: 5-8 measurable outcomes phrased as "You will be able to...".
5. Requirements: 3-6 realistic prerequisites or setup needs.
6. Lessons: 8-12 logically sequenced lessons with title, short description, duration, and rich, detailed content (minimum 4 paragraphs each, including analogies and clear examples).
7. QuizQuestions: 15-20 MCQs.
   - Use 4 options each.
   - Vary correct option position across A/B/C/D.
   - Always include explanations for A, B, C, D, plus correctExplanation.
8. Flashcards: 15-20 cards for quick recall. Use spaced-repetition friendly questions on the front and concise, definitive answers on the back.
9. Notes: 6-10 highly detailed notes.
   - title: concise section title highlighting the core concept.
   - summary: array of 4-6 high-quality bullet insights. Include at least one real-world analogy and one common pitfall. Do NOT use long paragraphs.
   - topics: related topics array.
10. Insights: 4-6 strategic, deep-dive insights for learners with this exact shape:
   - title: a catchy, insight-driven title.
   - whyItMatters: the deep psychological or technical reason this is crucial (2-3 sentences).
   - applyItToday: a step-by-step 30-minute actionable exercise.
   - successMetric: how the user will know they succeeded (a measurable KPI).
   - relatedTopics (array)

Output rules:
- Return ONLY valid JSON. Do not include markdown fences.
- Do not include comments inside JSON.
- Keep all fields present, even if arrays are empty.

JSON shape:
{
  "summary": "string",
  "category": "string",
  "level": "Beginner|Intermediate|Advanced",
  "topics": ["string"],
  "whatYouLearn": ["string"],
  "requirements": ["string"],
  "lessons": [
    {
      "title": "string",
      "description": "string",
      "duration": "string",
      "content": "string",
      "order": 1
    }
  ],
  "quizQuestions": [
    {
      "type": "multiple-choice",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "A|B|C|D",
      "explanations": {
        "A": "string",
        "B": "string",
        "C": "string",
        "D": "string"
      },
      "correctExplanation": "string",
      "difficulty": "easy|medium|hard"
    }
  ],
  "flashcards": [
    {
      "front": "string",
      "back": "string",
      "difficulty": "easy|medium|hard"
    }
  ],
  "notes": [
    {
      "title": "string",
      "summary": ["string", "string"],
      "topics": ["string"]
    }
  ],
  "insights": [
    {
      "title": "string",
      "whyItMatters": "string",
      "applyItToday": "string",
      "successMetric": "string",
      "relatedTopics": ["string"]
    }
  ]
}`;

  try {
    let text;
    if (geminiApiKeys.length > 0) {
      text = await makeGeminiCallWithRotation(prompt);
    } else {
      text = await makeOpenRouterCall(prompt);
    }

    try {
      const parsed = parseAiJsonSafely(text);

      const valid = ajv.validate(courseEnvelopeSchema, parsed);
      if (!valid) {
        console.warn('Course validation warning:', ajv.errors);
      }

      return normalizeGeneratedCourseContent(parsed, title);
    } catch (parseError) {
      console.error('Failed to parse/validate AI response in generateCourseContent:', parseError);
      console.error('Response preview (first 500 chars):', (text || '').substring(0, 500));

      return normalizeGeneratedCourseContent({
        summary: 'A comprehensive course generated from the content provided.',
        category: 'General',
        level: 'Intermediate',
        topics: ['Learning', 'Education', 'Practice'],
        whatYouLearn: [
          'You will be able to explain the core concepts clearly.',
          'You will be able to apply ideas in practical scenarios.'
        ],
        requirements: ['Curiosity to learn and practice consistently.'],
        lessons: [
          {
            title: 'Introduction',
            description: 'Introduction to the course content',
            duration: '1 hour',
            content: 'This lesson provides an overview of the main topics covered.',
            order: 1
          }
        ],
        quizQuestions: [
          {
            type: 'multiple-choice',
            question: 'What is the main focus of this course?',
            options: ['Learning new concepts', 'Testing knowledge', 'Building skills', 'All of the above'],
            correctAnswer: 'D',
            correctExplanation: 'This course combines concept learning, practice, and assessment.',
            explanations: {
              A: 'Learning concepts is important but not the only focus.',
              B: 'Assessment is part of learning, not the full picture.',
              C: 'Skill-building is essential but combined with concepts and testing.',
              D: 'This option includes all major goals of the course.'
            },
            difficulty: 'easy'
          }
        ],
        flashcards: [
          {
            front: 'Key Learning Concept',
            back: 'Important information from the course content',
            difficulty: 'easy'
          }
        ],
        notes: [
          {
            title: 'Course Overview',
            summary: ['Introduction to course topics', 'Key concepts to learn'],
            topics: ['Learning', 'Education']
          }
        ],
        insights: [
          {
            title: 'Start With Core Concepts',
            whyItMatters: 'Strong fundamentals improve retention and confidence.',
            applyItToday: 'Summarize one concept and teach it back in your own words.',
            successMetric: 'Can explain one key idea without notes in under 60 seconds.',
            relatedTopics: ['Learning', 'Education']
          }
        ]
      }, title);
    }
  } catch (error) {
    console.error('Error generating course content:', error);
    throw new Error('Failed to generate course content. Please try again.');
  }
};

export const generateChatResponse = async (message, coursesContext, history = []) => {
  if (geminiApiKeys.length === 0 && !openRouterApiKey) {
    throw new Error('AI system is not initialized. Please check your API keys.');
  }

  const contextInfo = coursesContext.length > 0
    ? `The user is enrolled in these courses:\n${coursesContext.map(c => `- ${c.title}: ${c.summary || 'No summary'}`).join('\n')}`
    : 'The user has not enrolled in any courses yet.';

  const modeMatch = message.match(/\[Tutor Mode:\s*(coach|socratic|quiz|story)\]/i);
  const tutorMode = modeMatch ? modeMatch[1].toLowerCase() : 'coach';
  const personaMatch = message.match(/\[Tutor Persona:\s*([^\]]+)\]/i);
  const toneMatch = message.match(/\[Tutor Tone:\s*([^\]]+)\]/i);
  const tutorPersona = personaMatch ? personaMatch[1].toLowerCase().trim() : 'balanced';
  const tutorTone = toneMatch ? toneMatch[1].toLowerCase().trim() : 'warm';
  const sanitizedMessage = message
    .replace(/\[Tutor Mode:[^\]]+\]/i, '')
    .replace(/\[Tutor Persona:[^\]]+\]/i, '')
    .replace(/\[Tutor Tone:[^\]]+\]/i, '')
    .replace(/Student request:/i, '')
    .trim();

  // Build conversation history string for context
  let conversationContext = '';
  if (history && history.length > 0) {
    const recentHistory = history.slice(-10); // Keep last 10 messages for context
    conversationContext = '\n\nPrevious conversation:\n' +
      recentHistory.map(h => `${h.role === 'user' ? 'Student' : 'Tutor'}: ${h.content}`).join('\n');
  }

  const modeInstruction = tutorMode === 'quiz'
    ? 'Quiz mode: ask exactly one thought-provoking question at a time. Wait for the student answer, then grade it enthusiastically, award imaginary XP points organically in text, and explain briefly.'
    : tutorMode === 'socratic'
      ? 'Socratic mode: guide with 2-4 short probing questions before giving the final answer. Keep responses highly interactive and encouraging.'
      : tutorMode === 'story'
        ? 'Story mode: write a short 2-4 paragraph story with a clear beginning, tension, and resolution. Include a named character, a real-world setting, and end with 1-2 explicit learning takeaways.'
        : 'Coach mode: provide concise, practical steps, use inspiring language, and set one quick gamified practice task (e.g., "Quest: Try this out!").';

  const personaInstructionMap = {
    storyteller: 'Lean into narrative and metaphor. Use characters and a clear arc to teach the concept.',
    strategist: 'Prioritize actionable steps, checklists, and sequencing. Keep it results-oriented.',
    analyst: 'Use precise reasoning, definitions, and structured breakdowns. Be exact and logical.',
    balanced: 'Balance clarity and encouragement with concise structure.'
  };

  const toneInstructionMap = {
    warm: 'Use supportive, encouraging language and gentle guidance.',
    crisp: 'Be direct, minimal, and efficient with words.',
    playful: 'Use light, fun phrasing and positive energy without being silly.'
  };

  const personaInstruction = personaInstructionMap[tutorPersona] || personaInstructionMap.balanced;
  const toneInstruction = toneInstructionMap[tutorTone] || toneInstructionMap.warm;

  const prompt = `You are the "Mindsphere AI Tutor", an elite, empathetic, and gamified mentor helping a student master concepts.
${contextInfo}${conversationContext}

Tutor mode: ${tutorMode}
Mode instruction: ${modeInstruction}
Tutor persona: ${tutorPersona}
Persona instruction: ${personaInstruction}
Tutor tone: ${tutorTone}
Tone instruction: ${toneInstruction}

Student's question: ${sanitizedMessage}

Output style:
- Adopt a warm, encouraging, and slightly playful mentor persona. Use gamified terminology lightly (like "Leveling up", "Quest", "XP").
- Keep answers concise, visually structured with markdown (bolding, lists), and highly engaging.
- Connect answers to the student's enrolled courses if relevant.
- Always end with ONE actionable "Mini-Quest" or next step to keep momentum high.
- Avoid long walls of text. Be punchy and impactful.`;

  try {
    // Try Gemini first since it's more reliable for chat
    if (geminiApiKeys.length > 0) {
      try {
        return await makeGeminiCallWithRotation(prompt);
      } catch (geminiError) {
        console.warn('Gemini chat failed, trying OpenRouter:', geminiError.message);
        // Fall through to OpenRouter
      }
    }

    // Try OpenRouter as fallback
    if (openRouterApiKey) {
      return await makeOpenRouterCall(prompt, 'openai/gpt-3.5-turbo');
    }

    throw new Error('No AI service available');
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate response. Please try again.');
  }
};

export const generateAdditionalQuizQuestions = async (courseTitle, courseTopic, existingQuestions = 5) => {
  if (geminiApiKeys.length === 0 && !openRouterApiKey) {
    throw new Error('AI system is not initialized. Please check your API keys.');
  }

  const prompt = `You are an expert educational content creator. Generate ${existingQuestions} new and unique multiple-choice quiz questions for the following course topic. These questions should be different from the existing ones and test deeper understanding.

Course Title: ${courseTitle}
Course Topic: ${courseTopic}

For each question:
- Provide 4 distinct options (A, B, C, D).
- IMPORTANT: Randomly vary the position of the correct answer (sometimes A, sometimes B, C, or D) to avoid predictable patterns. Do NOT always put the correct answer in the same position.
- Specify the correct answer clearly.
- For each option, provide a detailed explanation of why it is correct or incorrect.
- Provide a specific explanation for why the correct answer is right, referencing the question and options.
- Vary the difficulty level (easy, medium, hard).

Return the response as a valid JSON object with this exact structure:
{
  \"quizQuestions\": [
    {
      \"type\": \"multiple-choice\",
      \"question\": \"string\",
      \"options\": [\"string\", \"string\", \"string\", \"string\"],
      \"correctAnswer\": \"string\",
      \"explanations\": {
        \"A\": \"string\",
        \"B\": \"string\",
        \"C\": \"string\",
        \"D\": \"string\"
      },
      \"correctExplanation\": \"string\",
      \"difficulty\": \"easy|medium|hard\"
    }
  ]
}`;

  try {
    console.log('🤖 Calling AI for additional quiz questions...');

    // Try Gemini first, then fallback to OpenRouter
    let text;
    if (geminiApiKeys.length > 0) {
      text = await makeGeminiCallWithRotation(prompt);
      console.log('✅ Gemini API call completed');
    } else {
      text = await makeOpenRouterCall(prompt);
      console.log('✅ OpenRouter API call completed');
    }

    console.log('📝 Raw response length:', text.length, 'characters');

    if (!text || text.trim().length === 0) {
      throw new Error('AI returned empty response text');
    }

    try {
      const parsed = parseAiJsonSafely(text);
      // Validate schema for quiz questions
      try {
        const valid = ajv.validate(quizEnvelopeSchema, parsed);
        if (!valid) {
          console.error('Quiz validation failed:', ajv.errors);
          throw new Error('Quiz schema validation failed');
        }
      } catch (validationErr) {
        console.error('Validation error for quiz questions:', validationErr);
        throw validationErr;
      }

      console.log('✅ Successfully parsed and validated JSON. Questions count:', parsed.quizQuestions.length);
      return parsed;
    } catch (err) {
      console.error('❌ Failed to parse AI response for quiz questions:', err);
      console.error('Response preview (first 500 chars):', (text || '').substring(0, 500));
      throw new Error('Failed to parse AI response for quiz questions');
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Error generating additional quiz questions:', errorMsg);
    throw new Error(errorMsg || 'Failed to generate quiz questions. Please try again.');
  }
};

// Generate quiz questions based on content
export const generateQuizQuestions = async ({ title, source, content, fileName, url, timestamp }) => {
  const prompt = `Based on the following content, generate 10-15 quiz questions. Make them educational and relevant to the content. Include a mix of difficulties (easy, medium, hard).

Content Title: ${title}
Source Type: ${source}
${fileName ? `File Name: ${fileName}` : ''}
${url ? `URL: ${url}` : ''}

Content: ${content.substring(0, 3000)} ${content.length > 3000 ? '...' : ''}

Please generate questions with the following format:
{
  "quizQuestions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct",
      "difficulty": "easy|medium|hard"
    }
  ]
}`;

  try {
    const response = await makeAICall(prompt);
    return response.quizQuestions || [];
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw error;
  }
};

// Generate flashcards based on content
export const generateFlashcards = async ({ title, source, content, fileName, url }) => {
  const prompt = `Based on the following content, generate 6-8 educational flashcards with key concepts and terms.

Content Title: ${title}
Source Type: ${source}
${fileName ? `File Name: ${fileName}` : ''}
${url ? `URL: ${url}` : ''}

Content: ${content.substring(0, 3000)} ${content.length > 3000 ? '...' : ''}

Please generate flashcards with the following format:
{
  "flashcards": [
    {
      "front": "Key concept or term",
      "back": "Definition or explanation"
    }
  ]
}`;

  try {
    const response = await makeAICall(prompt);
    return response.flashcards || [];
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
};

// Generate lesson structure based on content
export const generateLessons = async ({ title, source, content, fileName, url }) => {
  const prompt = `Based on the following content, generate a structured lesson plan with 3-5 key learning modules.

Content Title: ${title}
Source Type: ${source}
${fileName ? `File Name: ${fileName}` : ''}
${url ? `URL: ${url}` : ''}

Content: ${content.substring(0, 3000)} ${content.length > 3000 ? '...' : ''}

Please generate lessons with the following format:
{
  "lessons": [
    {
      "title": "Lesson title",
      "content": "Lesson content and key points",
      "order": 1
    }
  ]
}`;

  try {
    const response = await makeAICall(prompt);
    return response.lessons || [];
  } catch (error) {
    console.error('Error generating lessons:', error);
    throw error;
  }
};

// Helper function to make AI calls with the existing rotation system
const makeAICall = async (prompt) => {
  try {
    const text = await makeGeminiCallWithRotation(prompt);

    try {
      const parsed = parseAiJsonSafely(text);
      return parsed;
    } catch (err) {
      console.warn('Failed to parse AI response in makeAICall, attempting one reformat retry:', err.message);
      // One controlled re-ask: ask the model to reformat the previous response into valid JSON only
      try {
        const reformatPrompt = 'The previous model response was not valid JSON. Below is the full response. Please return the SAME JSON object only, wrapped in a single ```json ... ``` fenced code block. Do NOT add any extra text or explanations. For any code samples inside string fields, replace newlines with the two-character sequence \\n and escape double quotes as \\\".\n\nPREVIOUS RESPONSE:\n' + text;
        const reformattedText = await makeGeminiCallWithRotation(reformatPrompt);
        try {
          const parsed2 = parseAiJsonSafely(reformattedText);
          console.log('✅ Successfully parsed after controlled reformat retry');
          return parsed2;
        } catch (err2) {
          console.error('Reformat retry also failed to produce valid JSON:', err2);
          throw err2;
        }
      } catch (retryErr) {
        console.error('Controlled reformat retry failed:', retryErr);
        throw err;
      }
    }
  } catch (error) {
    console.error('Error in makeAICall:', error);
    throw error;
  }
};

/**
 * Generate AI content from a raw prompt (returns text, optionally parsed as JSON)
 * This is a generic function for ad-hoc AI content generation
 * @param {string} prompt - The prompt to send to the AI
 * @param {boolean} parseJson - Whether to attempt parsing the response as JSON (default: true)
 * @returns {Promise<string|object>} Response text or parsed JSON object
 */
export const generateAIContent = async (prompt, parseJson = true) => {
  if (geminiApiKeys.length === 0 && !openRouterApiKey) {
    throw new Error('AI system is not initialized. Please check your API keys.');
  }

  try {
    const text = await makeGeminiCallWithRotation(prompt);

    if (!parseJson) {
      return text;
    }

    // Try to parse as JSON
    try {
      return parseAiJsonSafely(text);
    } catch {
      // If JSON parsing fails, return the raw text
      return text;
    }
  } catch (error) {
    console.error('Error generating AI content:', error);
    throw new Error('Failed to generate AI content. Please try again.');
  }
};
