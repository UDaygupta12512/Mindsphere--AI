import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateCourseContent } from '../services/geminiService.js';
import { getYoutubeVideosForLessons } from '../services/youtubeService.js';
import { getYoutubeVideosForLessonsNoKey } from '../services/youtubeServiceNoKey.js';

const router = express.Router();

// Catalog seed data - All 12 courses with quizzes and flashcards
const catalogCourses = [
  {
    id: 'catalog-1',
    title: 'Complete Web Development Bootcamp',
    description: 'Master modern web development with HTML, CSS, JavaScript, React, Node.js, and more. Build real-world projects and become a full-stack developer.',
    instructor: 'Dr. Sarah Chen',
    thumbnail: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Programming',
    level: 'Beginner',
    duration: '45 hours',
    rating: 4.9,
    studentsEnrolled: 15234,
    totalLessons: 42,
    completedLessons: 0,
    progress: 0,
    certificate: true,
    source: 'pdf',
    topics: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
    summary: 'From zero to full-stack developer. This comprehensive bootcamp covers everything you need to build modern web applications.',
    whatYouLearn: ['Build responsive websites from scratch', 'Master React.js and modern JavaScript', 'Create full-stack applications with Node.js', 'Deploy applications to production', 'Work with databases and APIs'],
    requirements: ['No programming experience required', 'A computer with internet connection', 'Willingness to learn and practice'],
    lessons: [
      { title: 'Introduction to Web Development', description: 'Get started with web development fundamentals', duration: '15 min', content: 'Welcome to the Complete Web Development Bootcamp! Learn about the structure of the web and tools needed.', isCompleted: false, order: 1, resources: [] },
      { title: 'HTML Fundamentals', description: 'Master HTML structure and semantic markup', duration: '25 min', content: 'HTML is the foundation of web development. Learn about elements, attributes, and semantic markup.', isCompleted: false, order: 2, resources: [] },
      { title: 'CSS Styling and Layout', description: 'Style your web pages beautifully', duration: '30 min', content: 'Master CSS selectors, properties, flexbox, and grid to create stunning layouts.', isCompleted: false, order: 3, resources: [] }
    ],
    notes: [],
    quizzes: [{ id: 'quiz-1-1', title: 'Web Development Fundamentals Quiz', description: 'Test your web development knowledge', questions: [
      { id: 'q1', question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyper Transfer Markup Language'], correctAnswer: 0, explanation: 'HTML stands for Hyper Text Markup Language.' },
      { id: 'q2', question: 'Which CSS property is used to change text color?', options: ['text-color', 'font-color', 'color', 'text-style'], correctAnswer: 2, explanation: 'The color property is used to set the text color.' },
      { id: 'q3', question: 'What is React?', options: ['A database', 'A JavaScript library for building UI', 'A CSS framework', 'A server-side language'], correctAnswer: 1, explanation: 'React is a JavaScript library for building user interfaces.' },
      { id: 'q4', question: 'What does API stand for?', options: ['Application Programming Interface', 'Advanced Program Integration', 'Application Process Interface', 'Automated Programming Interface'], correctAnswer: 0, explanation: 'API stands for Application Programming Interface.' }
    ], passingScore: 70, timeLimit: 600, isCompleted: false }],
    flashcards: [
      { front: 'What is HTML?', back: 'HyperText Markup Language - the standard markup language for creating web pages' },
      { front: 'What is CSS?', back: 'Cascading Style Sheets - used for styling HTML elements' },
      { front: 'What is JavaScript?', back: 'A programming language that enables interactive web pages' },
      { front: 'What is React?', back: 'A JavaScript library for building user interfaces' },
      { front: 'What is Node.js?', back: 'A JavaScript runtime built on Chrome V8 engine for server-side development' }
    ]
  },
  {
    id: 'catalog-2',
    title: 'Data Science and Machine Learning',
    description: 'Learn data science, machine learning, and AI. Master Python, statistical analysis, and build predictive models with real datasets.',
    instructor: 'Prof. Michael Rodriguez',
    thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Data Science',
    level: 'Intermediate',
    duration: '60 hours',
    rating: 4.8,
    studentsEnrolled: 12567,
    totalLessons: 38,
    completedLessons: 0,
    progress: 0,
    certificate: true,
    source: 'pdf',
    topics: ['Python', 'Machine Learning', 'Data Analysis', 'Neural Networks'],
    summary: 'Become a data scientist. Master Python, machine learning algorithms, and build AI models from scratch.',
    whatYouLearn: ['Master Python for data science', 'Build machine learning models', 'Perform statistical analysis', 'Work with neural networks', 'Create data visualizations'],
    requirements: ['Basic Python knowledge', 'Understanding of mathematics', 'Familiarity with programming concepts'],
    lessons: [
      { title: 'Introduction to Data Science', description: 'Understanding the data science workflow', duration: '20 min', content: 'Learn about data science, its applications, and the tools used in the industry.', isCompleted: false, order: 1, resources: [] },
      { title: 'Python for Data Science', description: 'Essential Python libraries for data analysis', duration: '35 min', content: 'Master NumPy, Pandas, and Matplotlib for data manipulation and visualization.', isCompleted: false, order: 2, resources: [] },
      { title: 'Machine Learning Fundamentals', description: 'Core ML concepts and algorithms', duration: '40 min', content: 'Learn supervised and unsupervised learning, regression, and classification.', isCompleted: false, order: 3, resources: [] }
    ],
    notes: [],
    quizzes: [{ id: 'quiz-2-1', title: 'Data Science Quiz', description: 'Test your data science knowledge', questions: [
      { id: 'q1', question: 'What is machine learning?', options: ['A way to program computers manually', 'Computers learning from data without explicit programming', 'A type of database', 'A programming language'], correctAnswer: 1, explanation: 'Machine learning enables computers to learn patterns from data automatically.' },
      { id: 'q2', question: 'What library is commonly used for data manipulation in Python?', options: ['React', 'Pandas', 'Angular', 'Bootstrap'], correctAnswer: 1, explanation: 'Pandas is the most popular library for data manipulation in Python.' },
      { id: 'q3', question: 'What is supervised learning?', options: ['Learning without labels', 'Learning with labeled data', 'Self-learning AI', 'Unsupervised pattern detection'], correctAnswer: 1, explanation: 'Supervised learning uses labeled data to train models.' },
      { id: 'q4', question: 'What is a neural network?', options: ['A computer network', 'A computing system inspired by biological neural networks', 'A database structure', 'A programming language'], correctAnswer: 1, explanation: 'Neural networks are computing systems inspired by biological neural networks in the brain.' }
    ], passingScore: 70, timeLimit: 600, isCompleted: false }],
    flashcards: [
      { front: 'What is Pandas?', back: 'A Python library for data manipulation and analysis' },
      { front: 'What is NumPy?', back: 'A Python library for numerical computing with arrays' },
      { front: 'What is supervised learning?', back: 'ML where the model learns from labeled training data' },
      { front: 'What is unsupervised learning?', back: 'ML where the model finds patterns in unlabeled data' },
      { front: 'What is a neural network?', back: 'A computing system inspired by biological neural networks' }
    ]
  },
  {
    id: 'catalog-3',
    title: 'Digital Marketing Mastery',
    description: 'Complete digital marketing course covering SEO, social media, content marketing, email campaigns, and analytics to grow your business.',
    instructor: 'Emma Thompson',
    thumbnail: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Business',
    level: 'Beginner',
    duration: '30 hours',
    rating: 4.7,
    studentsEnrolled: 18903,
    totalLessons: 28,
    completedLessons: 0,
    progress: 0,
    certificate: true,
    source: 'pdf',
    topics: ['SEO', 'Social Media', 'Content Marketing', 'Analytics'],
    summary: 'Master digital marketing strategies. Learn SEO, social media, and content marketing to grow your business.',
    whatYouLearn: ['Master SEO and content marketing', 'Run successful social media campaigns', 'Create email marketing strategies', 'Analyze marketing metrics', 'Build a complete marketing plan'],
    requirements: ['No prior marketing experience needed', 'Access to social media platforms', 'Basic computer skills'],
    lessons: [
      { title: 'Introduction to Digital Marketing', description: 'Understanding the digital landscape', duration: '20 min', content: 'Learn about digital marketing channels, strategies, and their impact on business.', isCompleted: false, order: 1, resources: [] },
      { title: 'SEO Fundamentals', description: 'Rank higher in search engines', duration: '30 min', content: 'Master on-page SEO, keyword research, and link building strategies.', isCompleted: false, order: 2, resources: [] },
      { title: 'Social Media Marketing', description: 'Build engagement on social platforms', duration: '25 min', content: 'Learn to create engaging content and grow your audience on social media.', isCompleted: false, order: 3, resources: [] }
    ],
    notes: [],
    quizzes: [{ id: 'quiz-3-1', title: 'Digital Marketing Quiz', description: 'Test your marketing knowledge', questions: [
      { id: 'q1', question: 'What does SEO stand for?', options: ['Social Engine Optimization', 'Search Engine Optimization', 'Site Enhancement Operation', 'Search Email Outreach'], correctAnswer: 1, explanation: 'SEO stands for Search Engine Optimization.' },
      { id: 'q2', question: 'What is a key metric for email marketing?', options: ['Bounce rate', 'Open rate', 'Page views', 'Followers'], correctAnswer: 1, explanation: 'Open rate measures how many recipients opened your email.' },
      { id: 'q3', question: 'What is content marketing?', options: ['Buying ads', 'Creating valuable content to attract audience', 'Cold calling', 'Print advertising'], correctAnswer: 1, explanation: 'Content marketing involves creating valuable content to attract and engage audiences.' },
      { id: 'q4', question: 'What is CTR?', options: ['Click Through Rate', 'Content Type Rate', 'Customer Target Ratio', 'Cost To Revenue'], correctAnswer: 0, explanation: 'CTR (Click Through Rate) measures clicks divided by impressions.' }
    ], passingScore: 70, timeLimit: 480, isCompleted: false }],
    flashcards: [
      { front: 'What is SEO?', back: 'Search Engine Optimization - improving website visibility in search results' },
      { front: 'What is PPC?', back: 'Pay-Per-Click - an advertising model where you pay for each click' },
      { front: 'What is CTR?', back: 'Click-Through Rate - percentage of people who click on your ad or link' },
      { front: 'What is conversion rate?', back: 'Percentage of visitors who complete a desired action' },
      { front: 'What is ROI?', back: 'Return On Investment - measuring profitability of marketing efforts' }
    ]
  },
  {
    id: 'catalog-4',
    title: 'UI/UX Design Fundamentals',
    description: 'Learn user interface and experience design principles. Master Figma, create beautiful designs, and build user-centered products.',
    instructor: 'Alex Kim',
    thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Design',
    level: 'Beginner',
    duration: '25 hours',
    rating: 4.8,
    studentsEnrolled: 9876,
    totalLessons: 32,
    completedLessons: 0,
    progress: 0,
    certificate: true,
    source: 'pdf',
    topics: ['UI Design', 'UX Research', 'Figma', 'Prototyping'],
    summary: 'Master UI/UX design. Learn design principles, user research, and create beautiful interfaces with Figma.',
    whatYouLearn: ['Master design principles and theory', 'Create professional UI designs in Figma', 'Conduct user research and testing', 'Build design systems', 'Create interactive prototypes'],
    requirements: ['No design experience required', 'Install Figma (free)', 'Creative mindset'],
    lessons: [
      { title: 'Introduction to UI/UX', description: 'Understanding user-centered design', duration: '20 min', content: 'Learn the difference between UI and UX, and why both matter for product success.', isCompleted: false, order: 1, resources: [] },
      { title: 'Design Principles', description: 'Core visual design concepts', duration: '30 min', content: 'Master typography, color theory, spacing, and visual hierarchy.', isCompleted: false, order: 2, resources: [] },
      { title: 'Figma Basics', description: 'Getting started with Figma', duration: '35 min', content: 'Learn Figma interface, tools, and create your first design.', isCompleted: false, order: 3, resources: [] }
    ],
    notes: [],
    quizzes: [{ id: 'quiz-4-1', title: 'UI/UX Design Quiz', description: 'Test your design knowledge', questions: [
      { id: 'q1', question: 'What is the difference between UI and UX?', options: ['They are the same', 'UI is visual design, UX is overall user experience', 'UX is visual design, UI is experience', 'Neither relate to design'], correctAnswer: 1, explanation: 'UI focuses on visual elements while UX encompasses the entire user experience.' },
      { id: 'q2', question: 'What is a wireframe?', options: ['A final design', 'A low-fidelity layout sketch', 'A coding framework', 'A database structure'], correctAnswer: 1, explanation: 'Wireframes are low-fidelity sketches used to plan layout and structure.' },
      { id: 'q3', question: 'What is user research?', options: ['Reading user reviews', 'Studying users to understand their needs', 'Counting website visitors', 'Creating user accounts'], correctAnswer: 1, explanation: 'User research involves studying users to understand their needs, behaviors, and motivations.' },
      { id: 'q4', question: 'What is a design system?', options: ['A computer OS', 'A collection of reusable components and guidelines', 'A project management tool', 'A coding language'], correctAnswer: 1, explanation: 'A design system is a collection of reusable components with clear standards.' }
    ], passingScore: 70, timeLimit: 480, isCompleted: false }],
    flashcards: [
      { front: 'What is UI?', back: 'User Interface - the visual elements users interact with' },
      { front: 'What is UX?', back: 'User Experience - the overall experience a user has with a product' },
      { front: 'What is a wireframe?', back: 'A low-fidelity layout sketch showing structure and content' },
      { front: 'What is a prototype?', back: 'An interactive simulation of the final product' },
      { front: 'What is Figma?', back: 'A collaborative design tool for UI/UX design' }
    ]
  },
  {
    id: 'catalog-5',
    title: 'Mobile App Development with React Native',
    description: 'Build cross-platform mobile apps for iOS and Android using React Native. Learn app deployment to app stores.',
    instructor: 'David Park',
    thumbnail: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Programming',
    level: 'Intermediate',
    duration: '50 hours',
    rating: 4.7,
    studentsEnrolled: 8945,
    totalLessons: 40,
    completedLessons: 0,
    progress: 0,
    certificate: true,
    source: 'pdf',
    topics: ['React Native', 'Mobile Development', 'iOS', 'Android'],
    summary: 'Build mobile apps for iOS and Android with React Native. Deploy to app stores.',
    whatYouLearn: ['Build cross-platform mobile apps', 'Master React Native components', 'Implement navigation and state management', 'Access device features', 'Deploy to App Store and Play Store'],
    requirements: ['JavaScript knowledge required', 'React.js experience helpful', 'Mac for iOS development'],
    lessons: [
      { title: 'React Native Introduction', description: 'Getting started with React Native', duration: '25 min', content: 'Learn what React Native is and set up your development environment.', isCompleted: false, order: 1, resources: [] },
      { title: 'Core Components', description: 'Building blocks of React Native apps', duration: '35 min', content: 'Master View, Text, Image, ScrollView, and other core components.', isCompleted: false, order: 2, resources: [] },
      { title: 'Navigation', description: 'Moving between screens', duration: '40 min', content: 'Implement stack, tab, and drawer navigation in your apps.', isCompleted: false, order: 3, resources: [] }
    ],
    notes: [],
    quizzes: [{ id: 'quiz-5-1', title: 'React Native Quiz', description: 'Test your mobile development knowledge', questions: [
      { id: 'q1', question: 'What is React Native?', options: ['A web framework', 'A framework for building native mobile apps', 'A database', 'A design tool'], correctAnswer: 1, explanation: 'React Native is a framework for building native mobile apps using React.' },
      { id: 'q2', question: 'Which language is used in React Native?', options: ['Swift', 'Kotlin', 'JavaScript', 'Python'], correctAnswer: 2, explanation: 'React Native uses JavaScript as its primary programming language.' },
      { id: 'q3', question: 'What is Expo?', options: ['A camera app', 'A toolchain for React Native development', 'A database', 'An IDE'], correctAnswer: 1, explanation: 'Expo is a toolchain that simplifies React Native development.' },
      { id: 'q4', question: 'Can React Native apps access device features?', options: ['No, never', 'Yes, through native modules', 'Only on Android', 'Only on iOS'], correctAnswer: 1, explanation: 'React Native can access device features through native modules and libraries.' }
    ], passingScore: 70, timeLimit: 480, isCompleted: false }],
    flashcards: [
      { front: 'What is React Native?', back: 'A framework for building native mobile apps using React' },
      { front: 'What is Expo?', back: 'A toolchain for easier React Native development' },
      { front: 'What is a native module?', back: 'A bridge to access native device functionality' },
      { front: 'What is hot reloading?', back: 'Instantly see code changes without rebuilding' },
      { front: 'What is AsyncStorage?', back: 'Local storage system for React Native apps' }
    ]
  },
  {
    id: 'catalog-6',
    title: 'Financial Analysis and Investment',
    description: 'Master financial analysis, investment strategies, stock valuation, portfolio management, and financial modeling.',
    instructor: 'Robert Chen',
    thumbnail: 'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Finance',
    level: 'Intermediate',
    duration: '42 hours',
    rating: 4.6,
    studentsEnrolled: 7654,
    totalLessons: 36,
    completedLessons: 0,
    progress: 0,
    certificate: true,
    source: 'pdf',
    topics: ['Financial Analysis', 'Investment', 'Stock Market', 'Portfolio Management'],
    summary: 'Master financial analysis and investment strategies. Learn stock valuation and portfolio management.',
    whatYouLearn: ['Analyze financial statements', 'Understand stock valuation methods', 'Build investment portfolios', 'Perform risk analysis', 'Create financial models'],
    requirements: ['Basic understanding of finance', 'Excel knowledge helpful', 'Interest in investing'],
    lessons: [
      { title: 'Financial Statement Analysis', description: 'Reading and interpreting financial statements', duration: '35 min', content: 'Learn to analyze balance sheets, income statements, and cash flow statements.', isCompleted: false, order: 1, resources: [] },
      { title: 'Stock Valuation Methods', description: 'Determining intrinsic stock value', duration: '40 min', content: 'Master DCF, P/E ratio, and other valuation techniques.', isCompleted: false, order: 2, resources: [] },
      { title: 'Portfolio Management', description: 'Building diversified portfolios', duration: '35 min', content: 'Learn asset allocation, diversification, and risk management strategies.', isCompleted: false, order: 3, resources: [] }
    ],
    notes: [],
    quizzes: [{ id: 'quiz-6-1', title: 'Financial Analysis Quiz', description: 'Test your finance knowledge', questions: [
      { id: 'q1', question: 'What is P/E ratio?', options: ['Profit/Equity', 'Price/Earnings', 'Portfolio/Expense', 'Performance/Evaluation'], correctAnswer: 1, explanation: 'P/E (Price-to-Earnings) ratio compares stock price to earnings per share.' },
      { id: 'q2', question: 'What is diversification?', options: ['Buying one stock', 'Spreading investments across different assets', 'Selling all investments', 'Day trading'], correctAnswer: 1, explanation: 'Diversification reduces risk by spreading investments across different assets.' },
      { id: 'q3', question: 'What is DCF?', options: ['Daily Cash Flow', 'Discounted Cash Flow', 'Direct Cost Formula', 'Debt Coverage Factor'], correctAnswer: 1, explanation: 'DCF (Discounted Cash Flow) is a valuation method based on future cash flows.' },
      { id: 'q4', question: 'What does EBITDA stand for?', options: ['Earnings Before Income Tax', 'Estimated Business Income', 'Earnings Before Interest, Taxes, Depreciation, and Amortization', 'Expected Business Income'], correctAnswer: 2, explanation: 'EBITDA measures operating performance before non-operating expenses.' }
    ], passingScore: 70, timeLimit: 600, isCompleted: false }],
    flashcards: [
      { front: 'What is a Balance Sheet?', back: 'A financial statement showing assets, liabilities, and equity at a point in time' },
      { front: 'What is an Income Statement?', back: 'A financial statement showing revenue, expenses, and profit over a period' },
      { front: 'What is Cash Flow?', back: 'The movement of money in and out of a business' },
      { front: 'What is ROI?', back: 'Return On Investment - a measure of profitability' },
      { front: 'What is NPV?', back: 'Net Present Value - the difference between present value of cash inflows and outflows' }
    ]
  },
  {
    id: 'catalog-7',
    title: 'Blockchain and Cryptocurrency',
    description: 'Understand blockchain technology, cryptocurrencies, smart contracts, and decentralized applications.',
    instructor: 'Dr. Kevin Zhang',
    thumbnail: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Technology',
    level: 'Intermediate',
    duration: '38 hours',
    rating: 4.6,
    studentsEnrolled: 6234,
    totalLessons: 32,
    completedLessons: 0,
    progress: 0,
    certificate: true,
    source: 'pdf',
    topics: ['Blockchain', 'Cryptocurrency', 'Smart Contracts', 'DeFi'],
    summary: 'Master blockchain technology and cryptocurrencies. Learn how blockchain works and build decentralized applications.',
    whatYouLearn: ['Understand blockchain fundamentals', 'Learn about cryptocurrencies', 'Create smart contracts', 'Build decentralized applications', 'Explore DeFi and NFTs'],
    requirements: ['Basic programming knowledge', 'Understanding of cryptography basics', 'Interest in emerging technologies'],
    lessons: [
      { title: 'Blockchain Fundamentals', description: 'Understanding blockchain technology', duration: '35 min', content: 'Learn how blockchain works, consensus mechanisms, and distributed ledger technology.', isCompleted: false, order: 1, resources: [] },
      { title: 'Cryptocurrencies Explained', description: 'Bitcoin, Ethereum, and altcoins', duration: '30 min', content: 'Understand different cryptocurrencies, how they work, and their use cases.', isCompleted: false, order: 2, resources: [] },
      { title: 'Smart Contracts', description: 'Self-executing contracts on blockchain', duration: '40 min', content: 'Learn to write smart contracts using Solidity and deploy them on Ethereum.', isCompleted: false, order: 3, resources: [] }
    ],
    notes: [],
    quizzes: [{ id: 'quiz-7-1', title: 'Blockchain Basics Quiz', description: 'Test your blockchain knowledge', questions: [
      { id: 'q1', question: 'What is a blockchain?', options: ['A type of database', 'A distributed ledger of transactions', 'A cryptocurrency', 'A programming language'], correctAnswer: 1, explanation: 'A blockchain is a distributed ledger that stores transaction data across multiple computers.' },
      { id: 'q2', question: 'What is mining in blockchain?', options: ['Extracting cryptocurrency', 'Validating transactions and adding blocks', 'Buying cryptocurrency', 'Storing data'], correctAnswer: 1, explanation: 'Mining is the process of validating transactions and adding new blocks to the blockchain.' },
      { id: 'q3', question: 'What is a smart contract?', options: ['A paper contract', 'Self-executing code on blockchain', 'A mining algorithm', 'A wallet type'], correctAnswer: 1, explanation: 'Smart contracts are self-executing programs that run on blockchain when conditions are met.' },
      { id: 'q4', question: 'Which consensus mechanism does Bitcoin use?', options: ['Proof of Stake', 'Proof of Work', 'Proof of Authority', 'Delegated Proof of Stake'], correctAnswer: 1, explanation: 'Bitcoin uses Proof of Work (PoW) where miners compete to solve cryptographic puzzles.' }
    ], passingScore: 70, timeLimit: 480, isCompleted: false }],
    flashcards: [
      { front: 'What is blockchain?', back: 'A distributed ledger technology for recording transactions' },
      { front: 'What is Bitcoin?', back: 'The first decentralized cryptocurrency' },
      { front: 'What is Ethereum?', back: 'A blockchain platform for smart contracts and decentralized apps' },
      { front: 'What is a wallet?', back: 'Software for storing and managing cryptocurrency' },
      { front: 'What is DeFi?', back: 'Decentralized Finance - financial services on blockchain' }
    ]
  },
  {
    id: 'catalog-8',
    title: 'Content Writing and Copywriting',
    description: 'Master the art of writing compelling content, marketing copy, blog posts, and persuasive copy that converts.',
    instructor: 'Rachel Morgan',
    thumbnail: 'https://images.pexels.com/photos/261510/pexels-photo-261510.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Writing',
    level: 'Beginner',
    duration: '28 hours',
    rating: 4.8,
    studentsEnrolled: 13456,
    totalLessons: 26,
    completedLessons: 0,
    progress: 0,
    certificate: true,
    source: 'pdf',
    topics: ['Copywriting', 'Content Creation', 'SEO Writing', 'Storytelling'],
    summary: 'Become a professional writer. Learn copywriting, content creation, and storytelling techniques.',
    whatYouLearn: ['Write persuasive copy that converts', 'Create engaging blog content', 'Master SEO writing techniques', 'Develop your unique writing voice', 'Write for different platforms'],
    requirements: ['Basic English proficiency', 'Interest in writing', 'No prior experience needed'],
    lessons: [
      { title: 'Writing Fundamentals', description: 'Master the basics of good writing', duration: '25 min', content: 'Learn grammar, sentence structure, and writing techniques for clear communication.', isCompleted: false, order: 1, resources: [] },
      { title: 'Copywriting Principles', description: 'Write copy that sells', duration: '35 min', content: 'Learn AIDA formula, persuasive techniques, and how to write compelling headlines.', isCompleted: false, order: 2, resources: [] },
      { title: 'SEO Content Writing', description: 'Write for search engines and readers', duration: '30 min', content: 'Master keyword research, on-page SEO, and creating content that ranks.', isCompleted: false, order: 3, resources: [] }
    ],
    notes: [],
    quizzes: [{ id: 'quiz-8-1', title: 'Copywriting Basics Quiz', description: 'Test your copywriting skills', questions: [
      { id: 'q1', question: 'What does AIDA stand for in copywriting?', options: ['Action, Interest, Desire, Attention', 'Attention, Interest, Desire, Action', 'Awareness, Interest, Decision, Action', 'Attention, Information, Decision, Action'], correctAnswer: 1, explanation: 'AIDA stands for Attention, Interest, Desire, Action - a classic copywriting formula.' },
      { id: 'q2', question: 'What is a headline purpose?', options: ['To make text bold', 'To grab attention and entice readers', 'To separate paragraphs', 'To add keywords'], correctAnswer: 1, explanation: 'Headlines grab attention and persuade readers to continue reading your content.' },
      { id: 'q3', question: 'What is a call-to-action (CTA)?', options: ['A phone number', 'A prompt encouraging readers to take action', 'A headline type', 'A writing style'], correctAnswer: 1, explanation: 'A CTA is a statement designed to prompt an immediate response or encourage a sale.' },
      { id: 'q4', question: 'What is the ideal blog post length for SEO?', options: ['100-300 words', '300-500 words', '1000-2000 words', '5000+ words'], correctAnswer: 2, explanation: 'Long-form content (1000-2000+ words) typically performs better in search rankings.' }
    ], passingScore: 70, timeLimit: 480, isCompleted: false }],
    flashcards: [
      { front: 'What is copywriting?', back: 'Writing text for advertising and marketing purposes' },
      { front: 'What is a USP?', back: 'Unique Selling Proposition - what makes a product different' },
      { front: 'What is storytelling?', back: 'Using narratives to engage and connect with audiences' },
      { front: 'What is tone of voice?', back: 'The personality and emotion infused in your writing' },
      { front: 'What is editing?', back: 'Reviewing and improving written content for clarity and correctness' }
    ]
  },
  {
    id: 'catalog-9',
    title: 'Project Management Professional (PMP)',
    description: 'Comprehensive PMP certification prep. Master project management methodologies, Agile, Scrum, and leadership skills.',
    instructor: 'Thomas Wright',
    thumbnail: 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Business',
    level: 'Intermediate',
    duration: '48 hours',
    rating: 4.7,
    studentsEnrolled: 7890,
    totalLessons: 42,
    completedLessons: 0,
    progress: 0,
    certificate: true,
    source: 'pdf',
    topics: ['Project Management', 'Agile', 'Scrum', 'Leadership'],
    summary: 'Prepare for PMP certification. Master project management methodologies and leadership skills.',
    whatYouLearn: ['Master PMI methodology and frameworks', 'Learn Agile and Scrum practices', 'Develop leadership and communication skills', 'Manage project risks and stakeholders', 'Prepare for PMP certification exam'],
    requirements: ['Project management experience preferred', 'Understanding of business processes', 'Commitment to study'],
    lessons: [
      { title: 'Project Management Fundamentals', description: 'Introduction to PM concepts', duration: '30 min', content: 'Learn project lifecycle, stakeholder management, and PM frameworks.', isCompleted: false, order: 1, resources: [] },
      { title: 'Agile and Scrum', description: 'Master Agile methodologies', duration: '40 min', content: 'Learn Agile principles, Scrum framework, sprints, and ceremonies.', isCompleted: false, order: 2, resources: [] },
      { title: 'Risk Management', description: 'Identify and manage project risks', duration: '35 min', content: 'Learn risk identification, assessment, mitigation strategies, and contingency planning.', isCompleted: false, order: 3, resources: [] }
    ],
    notes: [],
    quizzes: [{ id: 'quiz-9-1', title: 'Project Management Quiz', description: 'Test your PM knowledge', questions: [
      { id: 'q1', question: 'What are the main project management phases?', options: ['Start, Middle, End', 'Initiation, Planning, Execution, Monitoring, Closing', 'Research, Development, Testing', 'Planning, Building, Launching'], correctAnswer: 1, explanation: 'The five process groups are: Initiating, Planning, Executing, Monitoring & Controlling, and Closing.' },
      { id: 'q2', question: 'What is a sprint in Scrum?', options: ['A fast run', 'A time-boxed iteration (usually 2-4 weeks)', 'A project phase', 'A meeting type'], correctAnswer: 1, explanation: 'A sprint is a time-boxed period (typically 2-4 weeks) where specific work must be completed.' },
      { id: 'q3', question: 'Who is responsible for the success of a Scrum project?', options: ['Scrum Master', 'Product Owner', 'The entire Scrum Team', 'Project Manager'], correctAnswer: 2, explanation: 'The entire Scrum Team is collectively responsible for the success of the project.' },
      { id: 'q4', question: 'What is the purpose of a project charter?', options: ['To schedule tasks', 'To formally authorize a project', 'To track expenses', 'To assign resources'], correctAnswer: 1, explanation: 'A project charter formally authorizes a project and gives the project manager authority to proceed.' }
    ], passingScore: 70, timeLimit: 600, isCompleted: false }],
    flashcards: [
      { front: 'What is Agile?', back: 'An iterative approach to project management focused on flexibility and customer satisfaction' },
      { front: 'What is Scrum?', back: 'An Agile framework for managing complex projects' },
      { front: 'What is a sprint?', back: 'A time-boxed iteration in Scrum (typically 2-4 weeks)' },
      { front: 'What is a stakeholder?', back: 'Anyone affected by or who can affect the project' },
      { front: 'What is scope creep?', back: 'Uncontrolled changes or growth in project scope' }
    ]
  },
  {
    id: 'catalog-10',
    title: 'Photography Masterclass',
    description: 'Professional photography course covering camera settings, composition, lighting, editing, and building a photography business.',
    instructor: 'Sophie Anderson',
    thumbnail: 'https://images.pexels.com/photos/225157/pexels-photo-225157.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Creative',
    level: 'Beginner',
    duration: '36 hours',
    rating: 4.9,
    studentsEnrolled: 11234,
    totalLessons: 34,
    completedLessons: 0,
    progress: 0,
    certificate: true,
    source: 'pdf',
    topics: ['Photography', 'Camera Settings', 'Composition', 'Photo Editing'],
    summary: 'Master photography from beginner to professional. Learn camera settings, composition, and photo editing.',
    whatYouLearn: ['Master camera settings and modes', 'Learn composition and framing', 'Understand lighting techniques', 'Edit photos in Lightroom and Photoshop', 'Build a photography business'],
    requirements: ['A camera (DSLR, mirrorless, or smartphone)', 'No photography experience needed', 'Passion for visual storytelling'],
    lessons: [
      { title: 'Camera Basics', description: 'Understanding your camera', duration: '30 min', content: 'Learn about aperture, shutter speed, ISO, and camera modes.', isCompleted: false, order: 1, resources: [] },
      { title: 'Composition Rules', description: 'Create visually appealing photos', duration: '35 min', content: 'Master rule of thirds, leading lines, framing, and other composition techniques.', isCompleted: false, order: 2, resources: [] },
      { title: 'Lighting Fundamentals', description: 'Master natural and artificial lighting', duration: '40 min', content: 'Learn to work with natural light, use flash, and create studio lighting setups.', isCompleted: false, order: 3, resources: [] }
    ],
    notes: [],
    quizzes: [{ id: 'quiz-10-1', title: 'Photography Basics Quiz', description: 'Test your photography knowledge', questions: [
      { id: 'q1', question: 'What is the exposure triangle?', options: ['Three types of lenses', 'Aperture, Shutter Speed, and ISO', 'Three camera brands', 'Focus, White Balance, and Metering'], correctAnswer: 1, explanation: 'The exposure triangle consists of aperture, shutter speed, and ISO.' },
      { id: 'q2', question: 'What does a low f-number (like f/1.8) mean?', options: ['Small aperture, deep depth of field', 'Large aperture, shallow depth of field', 'Fast shutter speed', 'Low ISO'], correctAnswer: 1, explanation: 'A low f-number means a large aperture opening, creating a shallow depth of field.' },
      { id: 'q3', question: 'What is the rule of thirds?', options: ['Taking three photos', 'Dividing frame into thirds for composition', 'Using three light sources', 'Editing in three steps'], correctAnswer: 1, explanation: 'The rule of thirds divides the frame into 9 equal parts to create balanced compositions.' },
      { id: 'q4', question: 'What is ISO?', options: ['A camera brand', 'Camera sensitivity to light', 'Image size option', 'A lens type'], correctAnswer: 1, explanation: 'ISO measures the camera sensor sensitivity to light.' }
    ], passingScore: 70, timeLimit: 480, isCompleted: false }],
    flashcards: [
      { front: 'What is aperture?', back: 'The opening in the lens that controls how much light enters the camera' },
      { front: 'What is shutter speed?', back: 'How long the camera shutter stays open to expose light' },
      { front: 'What is ISO?', back: 'Camera sensor sensitivity to light' },
      { front: 'What is depth of field?', back: 'The zone of acceptable sharpness in front of and behind the subject' },
      { front: 'What is white balance?', back: 'Adjusting colors to appear natural under different lighting' }
    ]
  },
  {
    id: 'catalog-11',
    title: 'Game Development with Unity',
    description: 'Create 2D and 3D games using Unity. Learn C# programming, game mechanics, physics, and publish games to multiple platforms.',
    instructor: 'Marcus Johnson',
    thumbnail: 'https://images.pexels.com/photos/194511/pexels-photo-194511.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Programming',
    level: 'Intermediate',
    duration: '58 hours',
    rating: 4.8,
    studentsEnrolled: 9567,
    totalLessons: 46,
    completedLessons: 0,
    progress: 0,
    certificate: true,
    source: 'pdf',
    topics: ['Unity', 'C#', 'Game Development', '3D Graphics'],
    summary: 'Master game development with Unity. Build 2D and 3D games and publish to multiple platforms.',
    whatYouLearn: ['Master Unity game engine', 'Learn C# programming for games', 'Create 2D and 3D game mechanics', 'Implement physics and animations', 'Publish games to PC, mobile, and consoles'],
    requirements: ['Basic programming knowledge helpful', 'Computer with Unity installed', 'Passion for game development'],
    lessons: [
      { title: 'Unity Introduction', description: 'Getting started with Unity', duration: '30 min', content: 'Learn Unity interface, project setup, and basic concepts like GameObjects and Components.', isCompleted: false, order: 1, resources: [] },
      { title: 'C# for Unity', description: 'Programming games with C#', duration: '45 min', content: 'Learn C# basics, Unity scripting, and how to control game objects through code.', isCompleted: false, order: 2, resources: [] },
      { title: '2D Game Development', description: 'Build your first 2D game', duration: '50 min', content: 'Create a 2D platformer game with player movement, enemies, and scoring.', isCompleted: false, order: 3, resources: [] }
    ],
    notes: [],
    quizzes: [{ id: 'quiz-11-1', title: 'Unity Basics Quiz', description: 'Test your Unity knowledge', questions: [
      { id: 'q1', question: 'What is a GameObject in Unity?', options: ['A game character', 'The basic object in Unity scenes', 'A C# script', 'A level'], correctAnswer: 1, explanation: 'GameObjects are the fundamental objects in Unity that represent characters, props, scenery, cameras, etc.' },
      { id: 'q2', question: 'What language is primarily used for Unity scripting?', options: ['Python', 'JavaScript', 'C#', 'Java'], correctAnswer: 2, explanation: 'C# is the primary programming language used for Unity game development.' },
      { id: 'q3', question: 'What is a prefab in Unity?', options: ['A 3D model', 'A reusable GameObject template', 'A script', 'A scene'], correctAnswer: 1, explanation: 'Prefabs are reusable GameObject templates that can be instantiated multiple times in your scenes.' },
      { id: 'q4', question: 'What does the Rigidbody component do?', options: ['Makes objects visible', 'Adds physics properties to GameObjects', 'Plays audio', 'Detects collisions'], correctAnswer: 1, explanation: 'Rigidbody components enable GameObjects to be affected by physics.' }
    ], passingScore: 70, timeLimit: 600, isCompleted: false }],
    flashcards: [
      { front: 'What is Unity?', back: 'A cross-platform game engine for creating 2D and 3D games' },
      { front: 'What is a GameObject?', back: 'The basic object in Unity scenes that can have components' },
      { front: 'What is a Component?', back: 'A piece of functionality attached to GameObjects' },
      { front: 'What is a Prefab?', back: 'A reusable GameObject template' },
      { front: 'What is a Scene?', back: 'A container for game content and levels' }
    ]
  },
  {
    id: 'catalog-12',
    title: 'Public Speaking and Presentation Skills',
    description: 'Overcome stage fright, deliver powerful presentations, master body language, and become a confident speaker.',
    instructor: 'Victoria Brown',
    thumbnail: 'https://images.pexels.com/photos/7648051/pexels-photo-7648051.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Personal Development',
    level: 'Beginner',
    duration: '22 hours',
    rating: 4.8,
    studentsEnrolled: 15678,
    totalLessons: 24,
    completedLessons: 0,
    progress: 0,
    certificate: true,
    source: 'pdf',
    topics: ['Public Speaking', 'Presentation Skills', 'Body Language', 'Communication'],
    summary: 'Become a confident public speaker. Master presentation skills, body language, and overcome stage fright.',
    whatYouLearn: ['Overcome fear of public speaking', 'Structure compelling presentations', 'Master body language and vocal delivery', 'Handle Q&A sessions confidently', 'Use visual aids effectively'],
    requirements: ['No prior speaking experience needed', 'Willingness to practice', 'Open to feedback'],
    lessons: [
      { title: 'Overcoming Fear', description: 'Conquering stage fright', duration: '25 min', content: 'Learn techniques to manage anxiety and build confidence before speaking.', isCompleted: false, order: 1, resources: [] },
      { title: 'Structuring Your Speech', description: 'Creating compelling presentations', duration: '30 min', content: 'Master the art of storytelling, opening hooks, and memorable conclusions.', isCompleted: false, order: 2, resources: [] },
      { title: 'Body Language', description: 'Non-verbal communication', duration: '35 min', content: 'Learn to use gestures, eye contact, and movement to engage your audience.', isCompleted: false, order: 3, resources: [] }
    ],
    notes: [],
    quizzes: [{ id: 'quiz-12-1', title: 'Public Speaking Quiz', description: 'Test your public speaking knowledge', questions: [
      { id: 'q1', question: 'What percentage of communication is non-verbal?', options: ['10%', '30%', '55%', '80%'], correctAnswer: 2, explanation: 'Studies suggest about 55% of communication is through body language and non-verbal cues.' },
      { id: 'q2', question: 'What is the best way to start a presentation?', options: ['Apologizing for being nervous', 'With a hook or story', 'Reading from slides', 'Introduction of yourself'], correctAnswer: 1, explanation: 'Starting with an engaging hook or story captures audience attention immediately.' },
      { id: 'q3', question: 'How can you manage speaking anxiety?', options: ['Avoid eye contact', 'Practice deep breathing', 'Speak very fast', 'Skip preparation'], correctAnswer: 1, explanation: 'Deep breathing helps calm nerves and reduce physical symptoms of anxiety.' },
      { id: 'q4', question: 'What is the rule of three in presentations?', options: ['Speak for 3 minutes', 'Use 3 slides', 'Group ideas in threes for memorability', 'Practice 3 times'], correctAnswer: 2, explanation: 'The rule of three suggests grouping information in threes makes it more memorable and impactful.' }
    ], passingScore: 70, timeLimit: 480, isCompleted: false }],
    flashcards: [
      { front: 'What is stage fright?', back: 'Anxiety or fear experienced before or during public speaking' },
      { front: 'What is a hook?', back: 'An engaging opening to capture audience attention' },
      { front: 'What is eye contact?', back: 'Looking at audience members to create connection and engagement' },
      { front: 'What is vocal variety?', back: 'Varying pitch, pace, and volume to maintain audience interest' },
      { front: 'What is a call to action?', back: 'A statement urging the audience to take a specific action' }
    ]
  }
];

// GET /api/catalog - Get catalog courses
router.get('/', (req, res) => {
  try {
    res.json(catalogCourses);
  } catch (error) {
    console.error('Get catalog error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch catalog. Please try again.' 
    });
  }
});

// GET /api/catalog/:id - Get a single catalog course by ID
router.get('/:id', (req, res) => {
  try {
    const course = catalogCourses.find(c => c.id === req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Catalog course not found' });
    }
    res.json(course);
  } catch (error) {
    console.error('Get catalog course error:', error);
    res.status(500).json({ error: 'Failed to fetch catalog course' });
  }
});

// POST /api/catalog/:id/enroll - Enroll in catalog course
router.post('/:id/enroll', authMiddleware, async (req, res) => {
  try {
    const catalogCourseId = req.params.id;
    console.log(`\n📚 ENROLL REQUEST for catalog course: ${catalogCourseId}`);
    
    // Find catalog course
    const catalogCourse = catalogCourses.find(c => c.id === catalogCourseId);
    
    if (!catalogCourse) {
      console.log('❌ Catalog course not found');
      return res.status(404).json({ 
        error: 'Catalog course not found' 
      });
    }
    
    console.log(`📖 Found catalog course: ${catalogCourse.title}`);
    
    // Check if user already enrolled
    const existingCourse = await Course.findOne({
      user: req.userId,
      title: catalogCourse.title,
      sourceType: 'catalog'
    });
    
    if (existingCourse) {
      console.log('⚠️ User already enrolled in this course');
      return res.status(400).json({ 
        error: 'You are already enrolled in this course',
        course: existingCourse
      });
    }
    
    console.log(`\n🤖 Generating content for: ${catalogCourse.title}`);
    console.log(`📝 Using Gemini to generate lessons, quizzes, notes, and flashcards...`);
    
    // Generate course content using Gemini AI
    const generatedContent = await generateCourseContent(
      catalogCourse.title,
      'pdf',
      catalogCourse.title
    );
    
    console.log(`✅ Generated ${generatedContent.lessons?.length || 0} lessons`);
    console.log(`✅ Generated ${generatedContent.quizQuestions?.length || 0} quiz questions`);
    console.log(`✅ Generated ${generatedContent.notes?.length || 0} study notes`);
    console.log(`✅ Generated ${generatedContent.flashcards?.length || 0} flashcards`);
    
    // Build course data with generated content
    const courseData = {
      title: catalogCourse.title,
      description: catalogCourse.description,
      summary: generatedContent.summary || catalogCourse.summary,
      sourceType: 'catalog',
      source: catalogCourse.title,
      thumbnail: catalogCourse.thumbnail,
      category: catalogCourse.category || generatedContent.category,
      level: catalogCourse.level || generatedContent.level,
      duration: catalogCourse.duration,
      rating: catalogCourse.rating,
      studentsEnrolled: catalogCourse.studentsEnrolled,
      instructor: catalogCourse.instructor,
      topics: catalogCourse.topics || generatedContent.topics || [],
      whatYouLearn: catalogCourse.whatYouLearn || [],
      requirements: catalogCourse.requirements || [],
      
      // Generated content
      lessons: (generatedContent.lessons || []).map((lesson, index) => ({
        ...lesson,
        isCompleted: false,
        order: lesson.order || index + 1,
        resources: [],
        transcript: ''
      })),
      notes: (generatedContent.notes || []).map(note => {
        let summaryArray = [];
        if (Array.isArray(note.summary)) {
          summaryArray = note.summary;
        } else if (typeof note.summary === 'string') {
          summaryArray = note.summary
            .split(/[\n•\-]/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
        }
        return {
          title: note.title,
          summary: summaryArray,
          topics: note.topics || []
        };
      }),
      quizzes: generatedContent.quizQuestions && generatedContent.quizQuestions.length > 0 ? [{
        title: `${catalogCourse.title} Quiz`,
        questions: generatedContent.quizQuestions.map(q => {
          if (q.type === 'multiple-choice') {
            q.explanations = q.explanations || {};
            
            const buildFallback = () => {
              const correctOpt = q.correctAnswer;
              return `${correctOpt} is the correct answer because it most accurately addresses the question. This option provides the most relevant and accurate information based on the course material.`;
            };
            
            ['A', 'B', 'C', 'D'].forEach(opt => {
              if (!q.explanations[opt] || q.explanations[opt].trim().length < 10) {
                q.explanations[opt] = buildFallback();
              }
            });
            
            if (!q.correctExplanation || q.correctExplanation.trim().length < 10) {
              q.correctExplanation = buildFallback();
            }
          }
          if (!q.explanation || q.explanation.trim().length < 10) {
            q.explanation = `The correct answer is ${q.correctAnswer}.`;
          }
          return q;
        })
      }] : [],
      
      flashcards: (generatedContent.flashcards || []).map(card => ({
        ...card,
        reviewCount: 0
      })),
      
      totalLessons: generatedContent.lessons?.length || 0,
      completedLessons: 0,
      progress: 0,
      certificate: catalogCourse.certificate ?? true,
      user: req.userId,
      lastAccessed: new Date()
    };
    
    console.log(`\n🎬 Fetching YouTube videos for lessons...`);
    
    // Fetch YouTube videos for lessons
    const hasYoutubeKey = !!process.env.YOUTUBE_API_KEY;
    
    if (hasYoutubeKey) {
      console.log('🔑 Using YouTube Data API');
      courseData.lessons = await getYoutubeVideosForLessons(
        courseData.lessons,
        courseData.topics.join(', ')
      );
    } else {
      console.log('🔓 Using Invidious (no API key required)');
      courseData.lessons = await getYoutubeVideosForLessonsNoKey(
        courseData.lessons,
        courseData.topics.join(', ')
      );
    }
    
    const course = new Course(courseData);
    await course.save();
    
    console.log(`\n✅ Catalog course successfully created and saved to database`);
    console.log(`✅ Course ID: ${course._id}`);
    
    // Add course to user's courses AND enrolledCourses (for analytics)
    await User.findByIdAndUpdate(req.userId, {
      $push: { 
        courses: course._id,
        enrolledCourses: course._id
      },
      lastActivityDate: new Date()
    });
    
    console.log(`✅ Course added to user's enrolledCourses`);
    console.log(`\n🎉 Enrollment complete!\n`);
    
    res.status(201).json(course);
  } catch (error) {
    console.error('❌ Enroll course error:', error);
    res.status(500).json({ 
      error: 'Failed to enroll in course. Please try again.',
      details: error.message
    });
  }
});

export default router;
 