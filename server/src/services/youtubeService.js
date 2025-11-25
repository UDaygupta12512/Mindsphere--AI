// You
// Uses YouTube Data API to search for educational videos related to lesson topics

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Get video duration from YouTube
 * @param {string} videoId - The YouTube video ID
 * @returns {Promise<number>} Duration in seconds
 */
const getVideoDuration = async (videoId) => {
  try {
    const params = new URLSearchParams({
      part: 'contentDetails',
      id: videoId,
      key: YOUTUBE_API_KEY
    });

    const response = await fetch(`${YOUTUBE_API_BASE_URL}/videos?${params}`);
    const data = await response.json();

    console.log('YouTube API Request URL:', `${YOUTUBE_API_BASE_URL}/videos?${params}`);
    console.log('YouTube API Response:', data);

    if (data.items && data.items.length > 0) {
      const duration = data.items[0].contentDetails.duration;
      // Convert ISO 8601 duration to seconds
      const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      const hours = (parseInt(match[1]) || 0) * 3600;
      const minutes = (parseInt(match[2]) || 0) * 60;
      const seconds = parseInt(match[3]) || 0;
      
      console.log('Video Duration (seconds):', hours + minutes + seconds);
      console.log('Video Duration (formatted):', duration);
      
      return hours + minutes + seconds;
    }
    return 0;
  } catch (error) {
    console.error('❌ Error getting video duration:', error.message);
    return 0;
  }
};

/**
 * Search for YouTube videos related to a topic
 * Filters out Shorts (videos under 60 seconds) to show only lectures
 * @param {string} topic - The topic to search for
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise<Array>} Array of video objects with id, title, and thumbnail
 */
export const searchYoutubeVideos = async (topic, maxResults = 3) => {
  if (!YOUTUBE_API_KEY) {
    console.warn('⚠️ YOUTUBE_API_KEY not set. YouTube videos will not be available.');
    return [];
  }

  try {
    console.log(`🔍 Searching YouTube for: "${topic}"`);
    console.log('🔑 Using YOUTUBE_API_KEY:', YOUTUBE_API_KEY ? 'SET' : 'NOT SET');
    
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: `${topic} tutorial lecture`,
      type: 'video',
      maxResults: maxResults * 2, // Get more results to filter out shorts
      order: 'relevance',
      videoLicense: 'creativeCommon', // Optional: prefer open-licensed content
      key: YOUTUBE_API_KEY
    });

    const response = await fetch(`${YOUTUBE_API_BASE_URL}/search?${searchParams}`);
    console.log('YouTube API Request URL:', `${YOUTUBE_API_BASE_URL}/search?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('YouTube API Response:', JSON.stringify(data, null, 2));
    console.log(`✅ Found ${data.items?.length || 0} videos for "${topic}"`);

    if (!data.items || data.items.length === 0) {
      console.warn(`⚠️ No YouTube videos found for: "${topic}"`);
      return [];
    }

    // Filter out shorts by checking duration (minimum 5 minutes for lectures)
    const videosWithDuration = [];
    for (const item of data.items) {
      if (!item.id.videoId) continue;
      
      const duration = await getVideoDuration(item.id.videoId);
      
      // Only include videos that are at least 5 minutes long (300 seconds)
      // This filters out YouTube Shorts (typically under 60 seconds)
      if (duration >= 300) {
        videosWithDuration.push({
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          duration: duration
        });
        
        if (videosWithDuration.length >= maxResults) break;
      }
    }

    if (videosWithDuration.length === 0) {
      console.warn(`⚠️ No full-length videos found for: "${topic}" (only shorts)`);
    }

    return videosWithDuration;
  } catch (error) {
    console.error('❌ Error searching YouTube:', error.message);
    return [];
  }
};

/**
 * Get the best YouTube video URL for a lesson topic
 * Uses the lesson title directly as the search query.
 * @param {string} lessonTitle - Title of the lesson
 * @param {string} courseTopic - Topic of the course
 * @returns {Promise<Object>} Object with videoId, videoUrl, title, and thumbnail
 */
export const getYoutubeVideoForLesson = async (lessonTitle, courseTopic = '') => {
  // Use the lesson title directly as the search query
  const searchQuery = lessonTitle.trim();
  try {
    console.log(`🔍 Search Query: ${searchQuery}`);
    const videos = await searchYoutubeVideos(searchQuery, 5); // Fetch more results for better filtering

    if (videos.length === 0) {
      console.warn(`⚠️ No videos found for "${lessonTitle}".`);
      return null;
    }

    // Select the first video as the best match
    const bestVideo = videos[0];
    console.log(`✅ Best Video: ${JSON.stringify(bestVideo, null, 2)}`);
    return {
      videoId: bestVideo.id,
      videoUrl: `https://www.youtube.com/embed/${bestVideo.id}?rel=0&modestbranding=1`,
      title: bestVideo.title,
      thumbnail: bestVideo.thumbnail
    };
  } catch (error) {
    console.error('❌ Error getting YouTube video for lesson:', error.message);
    return null;
  }
};

/**
 * Get YouTube videos for all lessons in a course
 * @param {Array} lessons - Array of lesson objects with title and content
 * @param {string} courseTopic - Topic of the course
 * @returns {Promise<Array>} Array of lessons with videoUrl
 */
export const getYoutubeVideosForLessons = async (lessons, courseTopic) => {
  const updatedLessons = await Promise.all(
    lessons.map(async (lesson) => {
      const video = await getYoutubeVideoForLesson(lesson.title, courseTopic);
      return {
        ...lesson,
        videoUrl: video ? video.videoUrl : null,
      };
    })
  );
  return updatedLessons;
};