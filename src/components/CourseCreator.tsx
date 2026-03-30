import React, { useState } from 'react';
import { Upload, FileText, Globe, Loader2, CheckCircle } from 'lucide-react';
import { Course } from '../types/course';
import { coursesApi } from '../lib/api';

interface CourseCreatorProps {
  onCourseCreated: (course: Course) => void;
}

const CourseCreator: React.FC<CourseCreatorProps> = ({ onCourseCreated }) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'url'>('pdf');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [fileError, setFileError] = useState('');
  const [urlError, setUrlError] = useState('');
  const [titleError, setTitleError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MIN_TITLE_LENGTH = 3;
  const MAX_TITLE_LENGTH = 100;

  // Validate URL format
  const isValidUrl = (urlString: string): boolean => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setFileError('');
    if (selectedFile.type !== 'application/pdf') {
      setFileError('Only PDF files are accepted');
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError(`File size (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB) exceeds 10MB limit`);
      return;
    }
    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace('.pdf', ''));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const extractPdfText = async (pdfFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Send the raw text content from the PDF file
        // The backend will use the title and this text to generate course content
        const text = reader.result as string;
        // Extract readable text (skip binary PDF data)
        const lines = text.split('\n').filter(line => {
          // Filter out binary/encoded lines
          return line.length > 0 && line.length < 1000 && /[a-zA-Z]{3,}/.test(line);
        });
        resolve(lines.join('\n').substring(0, 8000) || pdfFile.name);
      };
      reader.onerror = () => resolve(pdfFile.name);
      reader.readAsText(pdfFile);
    });
  };

  const handleCreateCourse = async () => {
    // Clear previous errors
    setUrlError('');
    setTitleError('');
    setFileError('');

    // Trim title
    const trimmedTitle = title.trim();

    // Validate title
    if (!trimmedTitle) {
      setTitleError('Course title is required');
      return;
    }

    if (trimmedTitle.length < MIN_TITLE_LENGTH) {
      setTitleError(`Title must be at least ${MIN_TITLE_LENGTH} characters`);
      return;
    }

    if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      setTitleError(`Title must not exceed ${MAX_TITLE_LENGTH} characters`);
      return;
    }

    // Validate content source
    if (activeTab === 'pdf' && !file) {
      setFileError('Please upload a PDF file');
      return;
    }

    if (activeTab === 'url' && !url.trim()) {
      setUrlError('Please enter a URL');
      return;
    }

    // Validate URL if using URL tab
    if (activeTab === 'url' && !isValidUrl(url.trim())) {
      setUrlError('Please enter a valid URL (starting with http:// or https://)');
      return;
    }

    setIsLoading(true);

    try {
      let source: string;
      if (activeTab === 'pdf' && file) {
        // Extract text content from the PDF to send to the AI
        const pdfText = await extractPdfText(file);
        source = pdfText;
      } else {
        source = url;
      }
      // Detect YouTube URLs vs regular URLs
      const isYoutubeUrl = activeTab === 'url' && /(?:youtube\.com|youtu\.be)/i.test(url);
      const sourceType = activeTab === 'pdf' ? 'pdf' : isYoutubeUrl ? 'youtube' : 'text';

      // Call backend API to create course
      const createdCourse = await coursesApi.create({
        sourceType,
        source,
        title
      });

      // Convert course to frontend format
      const newCourse: Course = {
        ...createdCourse,
        id: createdCourse._id,
        createdAt: new Date(createdCourse.createdAt),
        lastAccessed: createdCourse.lastAccessed ? new Date(createdCourse.lastAccessed) : undefined,
      } as unknown as Course;

      onCourseCreated(newCourse);
    } catch (error) {
      console.error('Error creating course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create course. Please try again.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="mb-6">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Creating Your Course</h3>
            <p className="text-gray-600">MindSphere AI is analyzing your content and generating personalized learning materials...</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Analyzing content structure
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin mr-2" />
              Generating intelligent notes
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin mr-2" />
              Creating dynamic quizzes
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin mr-2" />
              Building flashcards
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Course</h1>
          <p className="text-gray-600">Upload a PDF or provide a URL to generate your personalized learning experience</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Tab Navigation */}
          <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md transition-all ${
                activeTab === 'pdf'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-5 h-5 mr-2" />
              Upload PDF
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md transition-all ${
                activeTab === 'url'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Globe className="w-5 h-5 mr-2" />
              From URL
            </button>
          </div>

          {/* Course Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError('');
              }}
              placeholder="Enter course title..."
              maxLength={MAX_TITLE_LENGTH}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                titleError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {titleError && (
              <p className="mt-2 text-sm text-red-600 font-medium">{titleError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {title.length}/{MAX_TITLE_LENGTH} characters
            </p>
          </div>

          {/* Content Input */}
          {activeTab === 'pdf' ? (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload PDF Document
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="mb-4">
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Click to upload
                    </span>
                    <span className="text-gray-600"> or drag and drop</span>
                  </label>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500">PDF files only, up to 10MB</p>
                {fileError && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{fileError}</p>
                )}
                {file && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium">{file.name}</p>
                    <p className="text-xs text-blue-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setUrlError('');
                }}
                placeholder="https://example.com/article or YouTube video URL"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  urlError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {urlError && (
                <p className="mt-2 text-sm text-red-600 font-medium">{urlError}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Supports YouTube videos, articles, and other web content
              </p>
            </div>
          )}

          {/* Create Button */}
          <button
            onClick={handleCreateCourse}
            disabled={isLoading || !title.trim() || (activeTab === 'pdf' && !file) || (activeTab === 'url' && !url.trim())}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Course...
              </>
            ) : (
              'Create Course with AI'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCreator; 