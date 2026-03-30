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
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'Digital Marketing Overview',
        description: 'Introduction to digital marketing landscape',
        duration: '20 min',
        content: 'Understand the digital marketing ecosystem, channels, and strategies used by successful marketers.',
        isCompleted: false,
        order: 1,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-3-2',
        title: 'SEO Fundamentals',
        description: 'Master search engine optimization',
        duration: '35 min',
        content: 'Learn how search engines work, keyword research, on-page and off-page SEO, and ranking strategies.',
        isCompleted: false,
        order: 2,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-3-3',
        title: 'Social Media Marketing',
        description: 'Grow your audience on social platforms',
        duration: '30 min',
        content: 'Master Facebook, Instagram, Twitter, and LinkedIn marketing. Create engaging content and run ad campaigns.',
        isCompleted: false,
        order: 3,
        resources: [],
        transcript: ''
      }
    ],
    notes: [],
    quizzes: [
      {
        id: 'quiz-3-1',
        title: 'SEO Basics Quiz',
        description: 'Test your SEO knowledge',
        questions: [
          {
            id: 'q1',
            question: 'What does SEO stand for?',
            options: ['Social Engine Optimization', 'Search Engine Optimization', 'Site Enhancement Option', 'Search Enhancement Online'],
            correctAnswer: 1,
            explanation: 'SEO stands for Search Engine Optimization - the practice of improving website visibility in search engines.'
          },
          {
            id: 'q2',
            question: 'Which is an on-page SEO factor?',
            options: ['Backlinks', 'Social shares', 'Title tags', 'Domain authority'],
            correctAnswer: 2,
            explanation: 'Title tags are an on-page SEO element you control directly on your website.'
          },
          {
            id: 'q3',
            question: 'What is a keyword in SEO?',
            options: [
              'A password for your site',
              'A term users search for',
              'A meta tag type',
              'A programming term'
            ],
            correctAnswer: 1,
            explanation: 'Keywords are terms and phrases that users type into search engines.'
          },
          {
            id: 'q4',
            question: 'What is the purpose of alt text in images?',
            options: [
              'To make images load faster',
              'To describe images for accessibility and SEO',
              'To add captions',
              'To compress images'
            ],
            correctAnswer: 1,
            explanation: 'Alt text describes images for screen readers and search engines, improving accessibility and SEO.'
          }
        ],
        passingScore: 70,
        timeLimit: 480,
        isCompleted: false
      },
      {
        id: 'quiz-3-2',
        title: 'Social Media Marketing Quiz',
        description: 'Test your social media knowledge',
        questions: [
          {
            id: 'q1',
            question: 'What is the ideal posting frequency for Instagram?',
            options: ['Once a month', '1-2 times per day', '10 times per day', 'Once a week'],
            correctAnswer: 1,
            explanation: 'For optimal engagement, posting 1-2 times per day on Instagram is recommended.'
          },
          {
            id: 'q2',
            question: 'Which metric measures how many people see your content?',
            options: ['Engagement', 'Reach', 'Clicks', 'Conversions'],
            correctAnswer: 1,
            explanation: 'Reach measures the total number of unique users who see your content.'
          },
          {
            id: 'q3',
            question: 'What is a hashtag used for?',
            options: [
              'To make text bold',
              'To categorize content and improve discoverability',
              'To tag people',
              'To add links'
            ],
            correctAnswer: 1,
            explanation: 'Hashtags categorize content and help users discover posts on specific topics.'
          },
          {
            id: 'q4',
            question: 'What does CTA stand for in marketing?',
            options: ['Click Through Action', 'Call To Action', 'Customer Target Ads', 'Content Type Analysis'],
            correctAnswer: 1,
            explanation: 'CTA stands for Call To Action - a prompt that encourages users to take a specific action.'
          }
        ],
        passingScore: 70,
        timeLimit: 480,
        isCompleted: false
      }
    ],
    flashcards: [
      { front: 'What is SEO?', back: 'Search Engine Optimization - improving website visibility in search results' },
      { front: 'What is a backlink?', back: 'A link from another website pointing to your site' },
      { front: 'What is engagement rate?', back: 'The percentage of your audience that interacts with your content' },
      { front: 'What is organic reach?', back: 'People who see your content without paid promotion' },
      { front: 'What is conversion rate?', back: 'Percentage of visitors who complete a desired action' }
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
    lessons: [
      {
        id: 'lesson-4-1',
        title: 'Introduction to UI/UX',
        description: 'Understanding user interface and experience design',
        duration: '25 min',
        content: 'Learn the difference between UI and UX, design thinking process, and user-centered design principles.',
        isCompleted: false,
        order: 1,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-4-2',
        title: 'Design Principles',
        description: 'Master fundamental design principles',
        duration: '30 min',
        content: 'Learn about balance, contrast, hierarchy, alignment, and other key principles that make great designs.',
        isCompleted: false,
        order: 2,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-4-3',
        title: 'Figma Essentials',
        description: 'Master Figma design tool',
        duration: '40 min',
        content: 'Learn Figma interface, tools, components, auto-layout, and collaborative features.',
        isCompleted: false,
        order: 3,
        resources: [],
        transcript: ''
      }
    ],
    notes: [],
    quizzes: [
      {
        id: 'quiz-4-1',
        title: 'UI/UX Principles Quiz',
        description: 'Test your design knowledge',
        questions: [
          {
            id: 'q1',
            question: 'What does UX stand for?',
            options: ['User Experience', 'User Extension', 'Universal Experience', 'Unified Experience'],
            correctAnswer: 0,
            explanation: 'UX stands for User Experience - the overall experience a user has with a product.'
          },
          {
            id: 'q2',
            question: 'Which principle creates visual interest through differences?',
            options: ['Balance', 'Contrast', 'Repetition', 'Proximity'],
            correctAnswer: 1,
            explanation: 'Contrast creates visual interest and draws attention by using differences in color, size, or shape.'
          },
          {
            id: 'q3',
            question: 'What is a wireframe?',
            options: [
              'A type of font',
              'A low-fidelity sketch of a design',
              'A coding framework',
              'A testing tool'
            ],
            correctAnswer: 1,
            explanation: 'A wireframe is a basic visual guide showing the skeletal framework of a website or app.'
          },
          {
            id: 'q4',
            question: 'What is the purpose of user personas?',
            options: [
              'To test code',
              'To represent target users',
              'To create animations',
              'To design logos'
            ],
            correctAnswer: 1,
            explanation: 'User personas are fictional characters that represent different user types to guide design decisions.'
          }
        ],
        passingScore: 70,
        timeLimit: 480,
        isCompleted: false
      }
    ],
    flashcards: [
      { front: 'What is UI?', back: 'User Interface - the visual elements users interact with' },
      { front: 'What is UX?', back: 'User Experience - the overall feeling and satisfaction from using a product' },
      { front: 'What is a prototype?', back: 'An early sample or model of a product used to test concepts' },
      { front: 'What is whitespace?', back: 'Empty space around elements that improves readability and focus' },
      { front: 'What is accessibility?', back: 'Designing products usable by people with disabilities' }
    ]
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
    lessons: [
      {
        id: 'lesson-5-1',
        title: 'Python Basics',
        description: 'Introduction to Python programming',
        duration: '30 min',
        content: 'Learn Python syntax, variables, data types, and basic operations. Write your first Python program.',
        isCompleted: false,
        order: 1,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-5-2',
        title: 'Control Flow and Functions',
        description: 'Master if statements, loops, and functions',
        duration: '35 min',
        content: 'Learn conditional statements, for and while loops, and how to create reusable functions.',
        isCompleted: false,
        order: 2,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-5-3',
        title: 'Object-Oriented Programming',
        description: 'Learn OOP concepts in Python',
        duration: '45 min',
        content: 'Master classes, objects, inheritance, encapsulation, and polymorphism in Python.',
        isCompleted: false,
        order: 3,
        resources: [],
        transcript: ''
      }
    ],
    notes: [],
    quizzes: [
      {
        id: 'quiz-5-1',
        title: 'Python Fundamentals Quiz',
        description: 'Test your Python basics',
        questions: [
          {
            id: 'q1',
            question: 'Which of these is a valid Python variable name?',
            options: ['2variable', 'variable-name', 'variable_name', 'variable name'],
            correctAnswer: 2,
            explanation: 'Python variable names can contain letters, numbers, and underscores, but cannot start with a number or contain spaces/hyphens.'
          },
          {
            id: 'q2',
            question: 'What is the output of print(type(5.0))?',
            options: ['<class int>', '<class float>', '<class str>', '<class number>'],
            correctAnswer: 1,
            explanation: '5.0 is a floating-point number, so type() returns <class float>.'
          },
          {
            id: 'q3',
            question: 'How do you create a list in Python?',
            options: ['list = (1, 2, 3)', 'list = {1, 2, 3}', 'list = [1, 2, 3]', 'list = <1, 2, 3>'],
            correctAnswer: 2,
            explanation: 'Lists in Python are created using square brackets [].'
          },
          {
            id: 'q4',
            question: 'What keyword is used to define a function?',
            options: ['func', 'def', 'function', 'define'],
            correctAnswer: 1,
            explanation: 'The "def" keyword is used to define functions in Python.'
          },
          {
            id: 'q5',
            question: 'What is a class in Python?',
            options: [
              'A type of variable',
              'A blueprint for creating objects',
              'A built-in function',
              'A data type'
            ],
            correctAnswer: 1,
            explanation: 'A class is a blueprint or template for creating objects with specific attributes and methods.'
          }
        ],
        passingScore: 70,
        timeLimit: 600,
        isCompleted: false
      }
    ],
    flashcards: [
      { front: 'What is a variable?', back: 'A container for storing data values' },
      { front: 'What is a function?', back: 'A reusable block of code that performs a specific task' },
      { front: 'What is a list?', back: 'An ordered, mutable collection of items' },
      { front: 'What is a dictionary?', back: 'A collection of key-value pairs' },
      { front: 'What is a loop?', back: 'A way to repeat code multiple times' },
      { front: 'What is OOP?', back: 'Object-Oriented Programming - organizing code around objects and classes' }
    ]
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
    lessons: [
      {
        id: 'lesson-6-1',
        title: 'Financial Statements Analysis',
        description: 'Learn to read and analyze financial statements',
        duration: '40 min',
        content: 'Master income statements, balance sheets, and cash flow statements. Learn ratio analysis.',
        isCompleted: false,
        order: 1,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-6-2',
        title: 'Excel for Finance',
        description: 'Advanced Excel techniques for financial modeling',
        duration: '50 min',
        content: 'Learn formulas, pivot tables, data validation, and create financial models in Excel.',
        isCompleted: false,
        order: 2,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-6-3',
        title: 'Valuation Methods',
        description: 'Learn company valuation techniques',
        duration: '45 min',
        content: 'Master DCF, comparable company analysis, and precedent transactions for valuation.',
        isCompleted: false,
        order: 3,
        resources: [],
        transcript: ''
      }
    ],
    notes: [],
    quizzes: [
      {
        id: 'quiz-6-1',
        title: 'Financial Analysis Quiz',
        description: 'Test your financial knowledge',
        questions: [
          {
            id: 'q1',
            question: 'What does ROE measure?',
            options: [
              'Revenue Over Expenses',
              'Return On Equity',
              'Rate Of Exchange',
              'Return On Earnings'
            ],
            correctAnswer: 1,
            explanation: 'ROE (Return On Equity) measures a company profitability relative to shareholders equity.'
          },
          {
            id: 'q2',
            question: 'Which statement shows a company assets and liabilities?',
            options: ['Income Statement', 'Balance Sheet', 'Cash Flow Statement', 'Statement of Changes'],
            correctAnswer: 1,
            explanation: 'The Balance Sheet shows what a company owns (assets) and owes (liabilities) at a specific point in time.'
          },
          {
            id: 'q3',
            question: 'What is DCF?',
            options: [
              'Daily Cash Flow',
              'Discounted Cash Flow',
              'Direct Cost Formula',
              'Debt Coverage Factor'
            ],
            correctAnswer: 1,
            explanation: 'DCF (Discounted Cash Flow) is a valuation method that estimates value based on future cash flows.'
          },
          {
            id: 'q4',
            question: 'What does EBITDA stand for?',
            options: [
              'Earnings Before Income Tax',
              'Estimated Business Income',
              'Earnings Before Interest, Taxes, Depreciation, and Amortization',
              'Expected Business Income Total Amount'
            ],
            correctAnswer: 2,
            explanation: 'EBITDA measures a company operating performance before non-operating expenses.'
          }
        ],
        passingScore: 70,
        timeLimit: 600,
        isCompleted: false
      }
    ],
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
    whatYouLearn: [
      'Understand blockchain fundamentals',
      'Learn about cryptocurrencies',
      'Create smart contracts',
      'Build decentralized applications',
      'Explore DeFi and NFTs'
    ],
    requirements: [
      'Basic programming knowledge',
      'Understanding of cryptography basics',
      'Interest in emerging technologies'
    ],
    lessons: [
      {
        id: 'lesson-7-1',
        title: 'Blockchain Fundamentals',
        description: 'Understanding blockchain technology',
        duration: '35 min',
        content: 'Learn how blockchain works, consensus mechanisms, and distributed ledger technology.',
        isCompleted: false,
        order: 1,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-7-2',
        title: 'Cryptocurrencies Explained',
        description: 'Bitcoin, Ethereum, and altcoins',
        duration: '30 min',
        content: 'Understand different cryptocurrencies, how they work, and their use cases.',
        isCompleted: false,
        order: 2,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-7-3',
        title: 'Smart Contracts',
        description: 'Self-executing contracts on blockchain',
        duration: '40 min',
        content: 'Learn to write smart contracts using Solidity and deploy them on Ethereum.',
        isCompleted: false,
        order: 3,
        resources: [],
        transcript: ''
      }
    ],
    notes: [],
    quizzes: [
      {
        id: 'quiz-7-1',
        title: 'Blockchain Basics Quiz',
        description: 'Test your blockchain knowledge',
        questions: [
          {
            id: 'q1',
            question: 'What is a blockchain?',
            options: [
              'A type of database',
              'A distributed ledger of transactions',
              'A cryptocurrency',
              'A programming language'
            ],
            correctAnswer: 1,
            explanation: 'A blockchain is a distributed ledger that stores transaction data across multiple computers.'
          },
          {
            id: 'q2',
            question: 'What is mining in blockchain?',
            options: [
              'Extracting cryptocurrency',
              'Validating transactions and adding blocks',
              'Buying cryptocurrency',
              'Storing data'
            ],
            correctAnswer: 1,
            explanation: 'Mining is the process of validating transactions and adding new blocks to the blockchain.'
          },
          {
            id: 'q3',
            question: 'What is a smart contract?',
            options: [
              'A paper contract',
              'Self-executing code on blockchain',
              'A mining algorithm',
              'A wallet type'
            ],
            correctAnswer: 1,
            explanation: 'Smart contracts are self-executing programs that run on blockchain when conditions are met.'
          },
          {
            id: 'q4',
            question: 'Which consensus mechanism does Bitcoin use?',
            options: ['Proof of Stake', 'Proof of Work', 'Proof of Authority', 'Delegated Proof of Stake'],
            correctAnswer: 1,
            explanation: 'Bitcoin uses Proof of Work (PoW) where miners compete to solve cryptographic puzzles.'
          }
        ],
        passingScore: 70,
        timeLimit: 480,
        isCompleted: false
      }
    ],
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
    whatYouLearn: [
      'Write persuasive copy that converts',
      'Create engaging blog content',
      'Master SEO writing techniques',
      'Develop your unique writing voice',
      'Write for different platforms'
    ],
    requirements: [
      'Basic English proficiency',
      'Interest in writing',
      'No prior experience needed'
    ],
    lessons: [
      {
        id: 'lesson-8-1',
        title: 'Writing Fundamentals',
        description: 'Master the basics of good writing',
        duration: '25 min',
        content: 'Learn grammar, sentence structure, and writing techniques for clear communication.',
        isCompleted: false,
        order: 1,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-8-2',
        title: 'Copywriting Principles',
        description: 'Write copy that sells',
        duration: '35 min',
        content: 'Learn AIDA formula, persuasive techniques, and how to write compelling headlines.',
        isCompleted: false,
        order: 2,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-8-3',
        title: 'SEO Content Writing',
        description: 'Write for search engines and readers',
        duration: '30 min',
        content: 'Master keyword research, on-page SEO, and creating content that ranks.',
        isCompleted: false,
        order: 3,
        resources: [],
        transcript: ''
      }
    ],
    notes: [],
    quizzes: [
      {
        id: 'quiz-8-1',
        title: 'Copywriting Basics Quiz',
        description: 'Test your copywriting skills',
        questions: [
          {
            id: 'q1',
            question: 'What does AIDA stand for in copywriting?',
            options: [
              'Action, Interest, Desire, Attention',
              'Attention, Interest, Desire, Action',
              'Awareness, Interest, Decision, Action',
              'Attention, Information, Decision, Action'
            ],
            correctAnswer: 1,
            explanation: 'AIDA stands for Attention, Interest, Desire, Action - a classic copywriting formula.'
          },
          {
            id: 'q2',
            question: 'What is a headline purpose?',
            options: [
              'To make text bold',
              'To grab attention and entice readers',
              'To separate paragraphs',
              'To add keywords'
            ],
            correctAnswer: 1,
            explanation: 'Headlines grab attention and persuade readers to continue reading your content.'
          },
          {
            id: 'q3',
            question: 'What is a call-to-action (CTA)?',
            options: [
              'A phone number',
              'A prompt encouraging readers to take action',
              'A headline type',
              'A writing style'
            ],
            correctAnswer: 1,
            explanation: 'A CTA is a statement designed to prompt an immediate response or encourage a sale.'
          },
          {
            id: 'q4',
            question: 'What is the ideal blog post length for SEO?',
            options: ['100-300 words', '300-500 words', '1000-2000 words', '5000+ words'],
            correctAnswer: 2,
            explanation: 'Long-form content (1000-2000+ words) typically performs better in search rankings.'
          }
        ],
        passingScore: 70,
        timeLimit: 480,
        isCompleted: false
      }
    ],
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
    whatYouLearn: [
      'Master PMI methodology and frameworks',
      'Learn Agile and Scrum practices',
      'Develop leadership and communication skills',
      'Manage project risks and stakeholders',
      'Prepare for PMP certification exam'
    ],
    requirements: [
      'Project management experience preferred',
      'Understanding of business processes',
      'Commitment to study'
    ],
    lessons: [
      {
        id: 'lesson-9-1',
        title: 'Project Management Fundamentals',
        description: 'Introduction to PM concepts',
        duration: '30 min',
        content: 'Learn project lifecycle, stakeholder management, and PM frameworks.',
        isCompleted: false,
        order: 1,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-9-2',
        title: 'Agile and Scrum',
        description: 'Master Agile methodologies',
        duration: '40 min',
        content: 'Learn Agile principles, Scrum framework, sprints, and ceremonies.',
        isCompleted: false,
        order: 2,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-9-3',
        title: 'Risk Management',
        description: 'Identify and manage project risks',
        duration: '35 min',
        content: 'Learn risk identification, assessment, mitigation strategies, and contingency planning.',
        isCompleted: false,
        order: 3,
        resources: [],
        transcript: ''
      }
    ],
    notes: [],
    quizzes: [
      {
        id: 'quiz-9-1',
        title: 'Project Management Quiz',
        description: 'Test your PM knowledge',
        questions: [
          {
            id: 'q1',
            question: 'What are the main project management phases?',
            options: [
              'Start, Middle, End',
              'Initiation, Planning, Execution, Monitoring, Closing',
              'Research, Development, Testing',
              'Planning, Building, Launching'
            ],
            correctAnswer: 1,
            explanation: 'The five process groups are: Initiating, Planning, Executing, Monitoring & Controlling, and Closing.'
          },
          {
            id: 'q2',
            question: 'What is a sprint in Scrum?',
            options: [
              'A fast run',
              'A time-boxed iteration (usually 2-4 weeks)',
              'A project phase',
              'A meeting type'
            ],
            correctAnswer: 1,
            explanation: 'A sprint is a time-boxed period (typically 2-4 weeks) where specific work must be completed.'
          },
          {
            id: 'q3',
            question: 'Who is responsible for the success of a Scrum project?',
            options: ['Scrum Master', 'Product Owner', 'The entire Scrum Team', 'Project Manager'],
            correctAnswer: 2,
            explanation: 'The entire Scrum Team is collectively responsible for the success of the project.'
          },
          {
            id: 'q4',
            question: 'What is the purpose of a project charter?',
            options: [
              'To schedule tasks',
              'To formally authorize a project',
              'To track expenses',
              'To assign resources'
            ],
            correctAnswer: 1,
            explanation: 'A project charter formally authorizes a project and gives the project manager authority to proceed.'
          }
        ],
        passingScore: 70,
        timeLimit: 600,
        isCompleted: false
      }
    ],
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
    whatYouLearn: [
      'Master camera settings and modes',
      'Learn composition and framing',
      'Understand lighting techniques',
      'Edit photos in Lightroom and Photoshop',
      'Build a photography business'
    ],
    requirements: [
      'A camera (DSLR, mirrorless, or smartphone)',
      'No photography experience needed',
      'Passion for visual storytelling'
    ],
    lessons: [
      {
        id: 'lesson-10-1',
        title: 'Camera Basics',
        description: 'Understanding your camera',
        duration: '30 min',
        content: 'Learn about aperture, shutter speed, ISO, and camera modes.',
        isCompleted: false,
        order: 1,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-10-2',
        title: 'Composition Rules',
        description: 'Create visually appealing photos',
        duration: '35 min',
        content: 'Master rule of thirds, leading lines, framing, and other composition techniques.',
        isCompleted: false,
        order: 2,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-10-3',
        title: 'Lighting Fundamentals',
        description: 'Master natural and artificial lighting',
        duration: '40 min',
        content: 'Learn to work with natural light, use flash, and create studio lighting setups.',
        isCompleted: false,
        order: 3,
        resources: [],
        transcript: ''
      }
    ],
    notes: [],
    quizzes: [
      {
        id: 'quiz-10-1',
        title: 'Photography Basics Quiz',
        description: 'Test your photography knowledge',
        questions: [
          {
            id: 'q1',
            question: 'What is the exposure triangle?',
            options: [
              'Three types of lenses',
              'Aperture, Shutter Speed, and ISO',
              'Three camera brands',
              'Focus, White Balance, and Metering'
            ],
            correctAnswer: 1,
            explanation: 'The exposure triangle consists of aperture, shutter speed, and ISO - the three elements that control exposure.'
          },
          {
            id: 'q2',
            question: 'What does a low f-number (like f/1.8) mean?',
            options: [
              'Small aperture, deep depth of field',
              'Large aperture, shallow depth of field',
              'Fast shutter speed',
              'Low ISO'
            ],
            correctAnswer: 1,
            explanation: 'A low f-number means a large aperture opening, creating a shallow depth of field (blurry background).'
          },
          {
            id: 'q3',
            question: 'What is the rule of thirds?',
            options: [
              'Taking three photos',
              'Dividing frame into thirds for composition',
              'Using three light sources',
              'Editing in three steps'
            ],
            correctAnswer: 1,
            explanation: 'The rule of thirds divides the frame into 9 equal parts to create balanced, interesting compositions.'
          },
          {
            id: 'q4',
            question: 'What is ISO?',
            options: [
              'A camera brand',
              'Camera sensitivity to light',
              'Image size option',
              'A lens type'
            ],
            correctAnswer: 1,
            explanation: 'ISO measures the camera sensor sensitivity to light. Higher ISO = more sensitive but more noise.'
          }
        ],
        passingScore: 70,
        timeLimit: 480,
        isCompleted: false
      }
    ],
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
    whatYouLearn: [
      'Master Unity game engine',
      'Learn C# programming for games',
      'Create 2D and 3D game mechanics',
      'Implement physics and animations',
      'Publish games to PC, mobile, and consoles'
    ],
    requirements: [
      'Basic programming knowledge helpful',
      'Computer with Unity installed',
      'Passion for game development'
    ],
    lessons: [
      {
        id: 'lesson-11-1',
        title: 'Unity Introduction',
        description: 'Getting started with Unity',
        duration: '30 min',
        content: 'Learn Unity interface, project setup, and basic concepts like GameObjects and Components.',
        isCompleted: false,
        order: 1,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-11-2',
        title: 'C# for Unity',
        description: 'Programming games with C#',
        duration: '45 min',
        content: 'Learn C# basics, Unity scripting, and how to control game objects through code.',
        isCompleted: false,
        order: 2,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-11-3',
        title: '2D Game Development',
        description: 'Build your first 2D game',
        duration: '50 min',
        content: 'Create a 2D platformer game with player movement, enemies, and scoring.',
        isCompleted: false,
        order: 3,
        resources: [],
        transcript: ''
      }
    ],
    notes: [],
    quizzes: [
      {
        id: 'quiz-11-1',
        title: 'Unity Basics Quiz',
        description: 'Test your Unity knowledge',
        questions: [
          {
            id: 'q1',
            question: 'What is a GameObject in Unity?',
            options: [
              'A game character',
              'The basic object in Unity scenes',
              'A C# script',
              'A level'
            ],
            correctAnswer: 1,
            explanation: 'GameObjects are the fundamental objects in Unity that represent characters, props, scenery, cameras, etc.'
          },
          {
            id: 'q2',
            question: 'What language is primarily used for Unity scripting?',
            options: ['Python', 'JavaScript', 'C#', 'Java'],
            correctAnswer: 2,
            explanation: 'C# is the primary programming language used for Unity game development.'
          },
          {
            id: 'q3',
            question: 'What is a prefab in Unity?',
            options: [
              'A 3D model',
              'A reusable GameObject template',
              'A script',
              'A scene'
            ],
            correctAnswer: 1,
            explanation: 'Prefabs are reusable GameObject templates that can be instantiated multiple times in your scenes.'
          },
          {
            id: 'q4',
            question: 'What does the Rigidbody component do?',
            options: [
              'Makes objects visible',
              'Adds physics properties to GameObjects',
              'Plays audio',
              'Detects collisions'
            ],
            correctAnswer: 1,
            explanation: 'Rigidbody components enable GameObjects to be affected by physics (gravity, forces, collisions).'
          }
        ],
        passingScore: 70,
        timeLimit: 600,
        isCompleted: false
      }
    ],
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
    topics: ['Public Speaking', 'Presentation', 'Communication', 'Confidence'],
    summary: 'Master public speaking and presentation skills. Overcome fear and deliver powerful, engaging presentations.',
    whatYouLearn: [
      'Overcome public speaking fear',
      'Structure compelling presentations',
      'Master voice modulation and pace',
      'Use body language effectively',
      'Engage and persuade audiences'
    ],
    requirements: [
      'No prior experience needed',
      'Willingness to practice speaking',
      'Access to presentation tools'
    ],
    lessons: [
      {
        id: 'lesson-12-1',
        title: 'Overcoming Stage Fright',
        description: 'Conquer your fear of public speaking',
        duration: '25 min',
        content: 'Learn techniques to manage anxiety, build confidence, and overcome nervousness.',
        isCompleted: false,
        order: 1,
        resources: [],
        transcript: ''
      },
      {
        id: 'lesson-12-2',
        title: 'Presentation Structure',
        description: 'Craft compelling presentations',
        duration: '30 min',
        content: 'Learn to structure presentations with strong openings, clear messages, and memorable endings.',
        isCompleted: false,
        order: 2,
        resources: [],
        transcript: ''
      },
      {
         id: 'lesson-12-3',
        title: 'Body Language and Delivery',
        description: 'Non-verbal communication mastery',
        duration: '28 min',
        content: 'Master gestures, eye contact, posture, and voice modulation for impactful delivery.',
        isCompleted: false,
        order: 3,
        resources: [],
        transcript: ''
      }
    ],
    notes: [],
    quizzes: [
      {
        id: 'quiz-12-1',
        title: 'Public Speaking Quiz',
        description: 'Test your presentation skills',
        questions: [
          {
            id: 'q1',
            question: 'What is the most common fear people have?',
            options: ['Heights', 'Public Speaking', 'Flying', 'Death'],
            correctAnswer: 1,
            explanation: 'Public speaking is often cited as people most common fear, even above death.'
          },
          {
            id: 'q2',
            question: 'What should you do with your hands while presenting?',
            options: [
              'Keep them in pockets',
              'Cross your arms',
              'Use natural gestures to emphasize points',
              'Hold them behind your back'
            ],
            correctAnswer: 2,
            explanation: 'Natural, purposeful gestures help emphasize points and keep the audience engaged.'
          },
          {
            id: 'q3',
            question: 'How should you start a presentation?',
            options: [
              'With apologies',
              'Reading from slides',
              'With a strong hook or story',
              'Introducing yourself only'
            ],
            correctAnswer: 2,
            explanation: 'Starting with a hook, story, or compelling question captures audience attention immediately.'
          },
          {
            id: 'q4',
            question: 'What is the ideal eye contact pattern?',
            options: [
              'Look at one person',
              'Look at the floor',
              'Scan the entire audience',
              'Look at the back wall'
            ],
            correctAnswer: 2,
            explanation: 'Making eye contact with different people across the audience creates connection and engagement.'
          }
        ],
        passingScore: 70,
        timeLimit: 480,
        isCompleted: false
      }
    ],
    flashcards: [
      { front: 'What is public speaking?', back: 'The act of speaking to a group of people in a structured manner' },
      { front: 'What is stage fright?', back: 'Anxiety or fear felt before or during a performance or presentation' },
      { front: 'What is body language?', back: 'Non-verbal communication through posture, gestures, and expressions' },
      { front: 'What is a hook?', back: 'An attention-grabbing opening that draws in the audience' },
      { front: 'What is inflection?', back: 'Changes in voice pitch and tone to add emphasis and emotion' }
    ]

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
