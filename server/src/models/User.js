import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  subscription: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  // Spaced Repetition System (SRS) - Active Recall Study Buddy
  srsItems: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    itemType: {
      type: String,
      enum: ['flashcard', 'quiz'],
      required: true
    },
    itemId: String, // flashcard index or quiz question index
    question: String, // The question text for display
    answer: String, // The correct answer for display
    difficulty: {
      type: Number,
      default: 0 // 0 = new, increases with each wrong answer
    },
    interval: {
      type: Number,
      default: 1 // Days until next review
    },
    repetitions: {
      type: Number,
      default: 0 // Number of successful reviews
    },
    easeFactor: {
      type: Number,
      default: 2.5 // SM-2 algorithm ease factor
    },
    lastReviewed: Date,
    nextReview: {
      type: Date,
      default: Date.now
    },
    wrongCount: {
      type: Number,
      default: 0
    },
    correctCount: {
      type: Number,
      default: 0
    }
  }],
  // Learning Paths - personalized day-by-day study plans
  learningPaths: {
    type: Map,
    of: {
      path: Object,
      targetDays: Number,
      dailyHours: Number,
      createdAt: Date,
      currentDay: Number
    },
    default: {}
  },
  // Study Patterns - for Learning Persona analysis
  studyPatterns: [{
    startTime: Date,
    endTime: Date,
    duration: Number, // minutes
    activityType: String, // 'lesson', 'quiz', 'flashcard', 'review'
    performance: Number, // 0-100
    courseId: mongoose.Schema.Types.ObjectId,
    dayOfWeek: Number, // 0-6
    hourOfDay: Number // 0-23
  }],
  // Cached Learning Persona
  learningPersona: {
    type: {
      type: String,
      default: 'explorer'
    },
    title: String,
    lastCalculated: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
 