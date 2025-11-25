import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// MongoDB connection with caching for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  cachedDb = connection;
  console.log('✅ MongoDB connected');
  return cachedDb;
}

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  subscription: { type: String, enum: ['free', 'premium'], default: 'free' },
  lastActivityDate: { type: Date, default: Date.now },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API is running' });
});

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    await connectToDatabase();
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    await connectToDatabase();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login. Please try again.' });
  }
});

// Catch-all for other routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Export for Vercel serverless
export default app;
