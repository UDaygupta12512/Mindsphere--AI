import { Course } from '../types/course';

export interface CatalogCourse extends Omit<Course, 'createdAt' | 'lastAccessed' | '_id'> {
  id: string;
  whatYouLearn: string[];
  requirements: string[];
  isEnrolled?: boolean;
  createdAt?: Date;
  lastAccessed?: Date;
}

export const catalogCourses: CatalogCourse[] = [
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
    whatYouLearn: [
      'Build responsive websites from scratch',
      'Master React.js and modern JavaScript',
      'Create full-stack applications with Node.js',
      'Deploy applications to production',
      'Work with databases and APIs'
    ],
    requirements: [
      'No programming experience required',
      'A computer with internet connection',
      'Willingness to learn and practice'
    ],
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'Introduction to Web Development',
        description: 'Get started with web development fundamentals',
        duration: '15 min',
        content: 'Welcome to the Complete Web Development Bootcamp! In this lesson, you\'ll learn about the structure of the web, how websites work, and what tools you\'ll need to become a web developer. We\'ll explore the relationship between HTML, CSS, and JavaScript, and discuss the modern web development landscape.',
        isCompleted: false,
        order: 1,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-1-2',
        title: 'HTML Fundamentals',
        description: 'Master HTML structure and semantic markup',
        duration: '25 min',
        content: 'HTML is the foundation of web development. Learn about HTML elements, attributes, semantic markup, and best practices for creating well-structured web pages. We\'ll build your first webpage from scratch.',
        isCompleted: false,
        order: 2,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-1-3',
        title: 'CSS Styling Basics',
        description: 'Learn CSS fundamentals and styling techniques',
        duration: '30 min',
        content: 'Master CSS to style your web pages beautifully. Learn about selectors, the box model, positioning, flexbox, and grid layout systems.',
        isCompleted: false,
        order: 3,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-1-4',
        title: 'JavaScript Essentials',
        description: 'Master JavaScript programming basics',
        duration: '40 min',
        content: 'JavaScript brings interactivity to your websites. Learn variables, functions, DOM manipulation, and event handling.',
        isCompleted: false,
        order: 4,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-1-5',
        title: 'React Fundamentals',
        description: 'Introduction to React and component-based architecture',
        duration: '35 min',
        content: 'Learn React, the most popular JavaScript library for building user interfaces. Understand components, props, state, and hooks.',
        isCompleted: false,
        order: 5,
        resources: [],
        transcript: ''
      }
    ],
    notes: [],
    quizzes: [
      {
        id: 'quiz-1-1',
        title: 'HTML & CSS Fundamentals Quiz',
        description: 'Test your knowledge of HTML and CSS basics',
        questions: [
          {
            id: 'q1-1',
            question: 'What does HTML stand for?',
            options: [
              'Hyper Text Markup Language',
              'High Tech Modern Language',
              'Home Tool Markup Language',
              'Hyperlinks and Text Markup Language'
            ],
            correctAnswer: 0,
            explanation: 'HTML stands for Hyper Text Markup Language. It is the standard markup language for creating web pages.'
          },
          {
            id: 'q1-2',
            question: 'Which CSS property is used to change text color?',
            options: ['text-color', 'color', 'font-color', 'text-style'],
            correctAnswer: 1,
            explanation: 'The "color" property is used to change the color of text in CSS.'
          },
          {
            id: 'q1-3',
            question: 'What is the correct HTML tag for the largest heading?',
            options: ['<heading>', '<h6>', '<h1>', '<head>'],
            correctAnswer: 2,
            explanation: '<h1> defines the most important heading, while <h6> defines the least important heading.'
          },
          {
            id: 'q1-4',
            question: 'Which property is used in CSS to change the background color?',
            options: ['bgcolor', 'background-color', 'color-background', 'bg-color'],
            correctAnswer: 1,
            explanation: 'The background-color property is used to set the background color of an element.'
          },
          {
            id: 'q1-5',
            question: 'What is the purpose of the <div> tag?',
            options: [
              'To display divisions in math',
              'To create a container for grouping elements',
              'To divide the page into columns',
              'To create a divider line'
            ],
            correctAnswer: 1,
            explanation: 'The <div> tag is a generic container used to group elements together for styling and layout purposes.'
          }
        ],
        passingScore: 70,
        timeLimit: 600,
        isCompleted: false
      },
      {
        id: 'quiz-1-2',
        title: 'JavaScript Basics Quiz',
        description: 'Test your JavaScript fundamentals knowledge',
        questions: [
          {
            id: 'q2-1',
            question: 'Which keyword is used to declare a variable that cannot be reassigned?',
            options: ['var', 'let', 'const', 'static'],
            correctAnswer: 2,
            explanation: 'The "const" keyword creates a read-only reference to a value, preventing reassignment.'
          },
          {
            id: 'q2-2',
            question: 'What will console.log(typeof null) output?',
            options: ['null', 'undefined', 'object', 'boolean'],
            correctAnswer: 2,
            explanation: 'This is a known quirk in JavaScript. typeof null returns "object" due to a legacy bug.'
          },
          {
            id: 'q2-3',
            question: 'What is the correct way to create a function in JavaScript?',
            options: [
              'function = myFunction()',
              'function myFunction()',
              'create myFunction()',
              'def myFunction()'
            ],
            correctAnswer: 1,
            explanation: 'Functions in JavaScript are declared using the "function" keyword followed by the function name and parentheses.'
          },
          {
            id: 'q2-4',
            question: 'Which method is used to add an element to the end of an array?',
            options: ['append()', 'push()', 'add()', 'insert()'],
            correctAnswer: 1,
            explanation: 'The push() method adds one or more elements to the end of an array and returns the new length.'
          },
          {
            id: 'q2-5',
            question: 'What does the === operator do?',
            options: [
              'Assigns a value',
              'Compares values only',
              'Compares values and types',
              'Checks if values are similar'
            ],
            correctAnswer: 2,
            explanation: 'The === operator (strict equality) checks both value and type, unlike == which only compares values.'
          }
        ],
        passingScore: 70,
        timeLimit: 600,
        isCompleted: false
      },
      {
        id: 'quiz-1-3',
        title: 'React Components Quiz',
        description: 'Test your understanding of React components',
        questions: [
          {
            id: 'q3-1',
            question: 'What is the correct way to create a functional component in React?',
            options: [
              'function Component() { return <div /> }',
              'Component = () => { <div /> }',
              'create Component() { return <div /> }',
              'component Component() { return <div /> }'
            ],
            correctAnswer: 0,
            explanation: 'Functional components are regular JavaScript functions that return JSX.'
          },
          {
            id: 'q3-2',
            question: 'Which hook is used to manage state in functional components?',
            options: ['useEffect', 'useState', 'useContext', 'useReducer'],
            correctAnswer: 1,
            explanation: 'useState is the primary hook for adding state to functional components.'
          },
          {
            id: 'q3-3',
            question: 'What is JSX?',
            options: [
              'A JavaScript library',
              'A syntax extension for JavaScript',
              'A CSS framework',
              'A testing framework'
            ],
            correctAnswer: 1,
            explanation: 'JSX is a syntax extension that allows you to write HTML-like code in JavaScript files.'
          },
          {
            id: 'q3-4',
            question: 'How do you pass data from parent to child component?',
            options: ['Using state', 'Using props', 'Using context', 'Using refs'],
            correctAnswer: 1,
            explanation: 'Props (properties) are used to pass data from parent components to child components.'
          },
          {
            id: 'q3-5',
            question: 'What does the useEffect hook do?',
            options: [
              'Creates state variables',
              'Handles side effects',
              'Manages context',
              'Creates references'
            ],
            correctAnswer: 1,
            explanation: 'useEffect is used to perform side effects like fetching data, subscriptions, or manually changing the DOM.'
          }
        ],
        passingScore: 70,
        timeLimit: 600,
        isCompleted: false
      }
    ],
    flashcards: [
      { front: 'What is HTML?', back: 'HyperText Markup Language - the standard language for creating web pages' },
      { front: 'What is CSS?', back: 'Cascading Style Sheets - used to style and layout web pages' },
      { front: 'What is JavaScript?', back: 'A programming language that makes web pages interactive' },
      { front: 'What is React?', back: 'A JavaScript library for building user interfaces using components' },
      { front: 'What is a component?', back: 'A reusable piece of UI that can have its own logic and appearance' },
      { front: 'What is state?', back: 'Data that changes over time in a component' },
      { front: 'What are props?', back: 'Short for properties - data passed from parent to child components' },
      { front: 'What is the DOM?', back: 'Document Object Model - a programming interface for HTML documents' }
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
    whatYouLearn: [
      'Master Python for data science',
      'Build machine learning models',
      'Perform statistical analysis',
      'Work with neural networks',
      'Create data visualizations'
    ],
    requirements: [
      'Basic Python knowledge',
      'Understanding of mathematics',
      'Familiarity with programming concepts'
    ],
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'Python Basics for Data Science',
        description: 'Essential Python programming for data analysis',
        duration: '30 min',
        content: 'Learn Python fundamentals specifically for data science: variables, data types, lists, dictionaries, and control flow.',
        isCompleted: false,
        order: 1,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-2-2',
        title: 'NumPy and Pandas',
        description: 'Work with data using Python libraries',
        duration: '45 min',
        content: 'Master NumPy for numerical computing and Pandas for data manipulation. Learn to load, clean, and analyze datasets.',
        isCompleted: false,
        order: 2,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-2-3',
        title: 'Data Visualization',
        description: 'Create compelling visualizations with Matplotlib and Seaborn',
        duration: '35 min',
        content: 'Learn to visualize data effectively using Python visualization libraries. Create charts, graphs, and interactive plots.',
        isCompleted: false,
        order: 3,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-2-4',
        title: 'Machine Learning Basics',
        description: 'Introduction to ML concepts and algorithms',
        duration: '50 min',
        content: 'Understand supervised and unsupervised learning, train your first model, and evaluate its performance.',
        isCompleted: false,
        order: 4,
        resources: [],
        transcript: ''
      }
    ],
    notes: [],
    quizzes: [
      {
        id: 'quiz-2-1',
        title: 'Python for Data Science Quiz',
        description: 'Test your Python data science knowledge',
        questions: [
          {
            id: 'q1',
            question: 'Which library is primarily used for data manipulation in Python?',
            options: ['NumPy', 'Pandas', 'Matplotlib', 'Scikit-learn'],
            correctAnswer: 1,
            explanation: 'Pandas is the primary library for data manipulation and analysis in Python, providing DataFrame structures.'
          },
          {
            id: 'q2',
            question: 'What does NumPy stand for?',
            options: ['Numerical Python', 'Number Python', 'New Python', 'Numeric Package'],
            correctAnswer: 0,
            explanation: 'NumPy stands for Numerical Python and is used for numerical computing.'
          },
          {
            id: 'q3',
            question: 'Which method loads a CSV file in Pandas?',
            options: ['load_csv()', 'read_csv()', 'import_csv()', 'open_csv()'],
            correctAnswer: 1,
            explanation: 'pandas.read_csv() is the standard method to read CSV files into a DataFrame.'
          },
          {
            id: 'q4',
            question: 'What is a DataFrame in Pandas?',
            options: [
              'A photo frame',
              'A 2D labeled data structure',
              'A type of chart',
              'A machine learning model'
            ],
            correctAnswer: 1,
            explanation: 'A DataFrame is a 2-dimensional labeled data structure with columns of potentially different types.'
          },
          {
            id: 'q5',
            question: 'Which library is used for machine learning in Python?',
            options: ['Pandas', 'Matplotlib', 'Scikit-learn', 'NumPy'],
            correctAnswer: 2,
            explanation: 'Scikit-learn is the most popular library for machine learning in Python.'
          }
        ],
        passingScore: 70,
        timeLimit: 600,
        isCompleted: false
      },
      {
        id: 'quiz-2-2',
        title: 'Machine Learning Concepts Quiz',
        description: 'Test your ML fundamentals',
        questions: [
          {
            id: 'q1',
            question: 'What is supervised learning?',
            options: [
              'Learning without labeled data',
              'Learning with labeled training data',
              'Learning by trial and error',
              'Learning from unlabeled examples'
            ],
            correctAnswer: 1,
            explanation: 'Supervised learning uses labeled data where the correct output is known during training.'
          },
          {
            id: 'q2',
            question: 'Which of these is a classification algorithm?',
            options: ['Linear Regression', 'K-Means', 'Decision Tree', 'PCA'],
            correctAnswer: 2,
            explanation: 'Decision Trees can be used for classification tasks, predicting discrete categories.'
          },
          {
            id: 'q3',
            question: 'What is overfitting?',
            options: [
              'When a model is too simple',
              'When a model performs well on training but poorly on new data',
              'When a model cannot learn',
              'When data is too large'
            ],
            correctAnswer: 1,
            explanation: 'Overfitting occurs when a model learns the training data too well, including noise, leading to poor generalization.'
          },
          {
            id: 'q4',
            question: 'What is the purpose of splitting data into training and test sets?',
            options: [
              'To make datasets smaller',
              'To evaluate model performance on unseen data',
              'To speed up training',
              'To reduce memory usage'
            ],
            correctAnswer: 1,
            explanation: 'Splitting data helps evaluate how well the model will perform on new, unseen data.'
          },
          {
            id: 'q5',
            question: 'What does accuracy measure in classification?',
            options: [
              'Speed of predictions',
              'Percentage of correct predictions',
              'Model complexity',
              'Training time'
            ],
            correctAnswer: 1,
            explanation: 'Accuracy is the ratio of correctly predicted observations to total observations.'
          }
        ],
        passingScore: 70,
        timeLimit: 600,
        isCompleted: false
      }
    ],
    flashcards: [
      { front: 'What is Pandas?', back: 'A Python library for data manipulation and analysis' },
      { front: 'What is NumPy?', back: 'A library for numerical computing in Python with array support' },
      { front: 'What is Machine Learning?', back: 'A method where computers learn from data without being explicitly programmed' },
      { front: 'What is supervised learning?', back: 'Learning from labeled data with known outputs' },
      { front: 'What is  unsupervised learning?', back: 'Finding patterns in unlabeled data' },
      { front: 'What is a neural network?', back: 'A series of algorithms that recognize patterns, modeled after the human brain' },
      { front: 'What is training data?', back: 'Data used to train a machine learning model' },
      { front: 'What is a feature?', back: 'An individual measurable property used as input to a model' }
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
    whatYouLearn: [
      'Master SEO and content marketing',
      'Run successful social media campaigns',
      'Create email marketing strategies',
      'Analyze marketing metrics',
      'Build a complete marketing plan'
    ],
    requirements: [
      'No prior marketing experience needed',
      'Access to social media platforms',
      'Basic computer skills'
    ],
    lessons: [],
    notes: [],
    quizzes: [],
    flashcards: []
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
    whatYouLearn: [
      'Master design principles and theory',
      'Create professional UI designs in Figma',
      'Conduct user research and testing',
      'Build design systems',
      'Create interactive prototypes'
    ],
    requirements: [
      'No design experience required',
      'Install Figma (free)',
      'Creative mindset'
    ],
    lessons: [],
    notes: [],
    quizzes: [],
    flashcards: []
  },
  {
    id: 'catalog-5',
    title: 'Python Programming Complete Course',
    description: 'From basics to advanced Python programming. Learn OOP, data structures, algorithms, and build real projects.',
    instructor: 'Dr. James Wilson',
    thumbnail: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Programming',
    level: 'Beginner',
    duration: '40 hours',
    rating: 4.9,
    studentsEnrolled: 21456,
    totalLessons: 45,
    completedLessons: 0,
    progress: 0,
    certificate: true,
    source: 'pdf',
    topics: ['Python', 'OOP', 'Data Structures', 'Algorithms'],
    summary: 'Master Python programming from scratch. Learn fundamentals, OOP, and build real-world applications.',
    whatYouLearn: [
      'Master Python fundamentals',
      'Object-oriented programming',
      'Work with APIs and databases',
      'Build automation scripts',
      'Create real-world applications'
    ],
    requirements: [
      'No programming experience needed',
      'A computer with Python installed',
      'Dedication to practice coding'
    ],
    lessons: [],
    notes: [],
    quizzes: [],
    flashcards: []
  },
  {
    id: 'catalog-6',
    title: 'Financial Analysis and Modeling',
    description: 'Master financial analysis, Excel modeling, valuation techniques, and investment strategies used by professional analysts.',
    instructor: 'Robert Martinez',
    thumbnail: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Finance',
    level: 'Advanced',
    duration: '35 hours',
    rating: 4.7,
    studentsEnrolled: 5432,
    totalLessons: 30,
    completedLessons: 0,
    progress: 0,
    certificate: true,
    source: 'pdf',
    topics: ['Financial Modeling', 'Valuation', 'Excel', 'Investment Analysis'],
    summary: 'Master financial analysis and modeling. Learn valuation, Excel modeling, and investment strategies.',
    whatYouLearn: [
      'Build financial models in Excel',
      'Perform company valuations',
      'Analyze financial statements',
      'Create investment portfolios',
      'Master financial forecasting'
    ],
    requirements: [
      'Basic accounting knowledge',
      'Excel proficiency',
      'Understanding of business fundamentals'
    ],
    lessons: [],
    notes: [],
    quizzes: [],
    flashcards: []
  }
];

export const getCatalogCourses = (): CatalogCourse[] => {
  return catalogCourses;
};

export const getCatalogCourseById = (id: string): CatalogCourse | undefined => {
  return catalogCourses.find(course => course.id === id);
};

export const getCoursesByCategory = (category: string): CatalogCourse[] => {
  return catalogCourses.filter(course => course.category === category);
};

export const getCategories = (): string[] => {
  const categories = new Set(catalogCourses.map(course => course.category));
  return Array.from(categories);
};
