// React Frontend Example for Content Management System with Ayrshare Integration

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Main App Component
const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Dashboard />
      </div>
    </div>
  );
};

// Header Component
const Header = () => {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold">Social Media Content Manager</h1>
        <p className="text-blue-100 mt-2">Powered by Ayrshare API</p>
      </div>
    </header>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'create', label: 'Create Post' },
              { id: 'schedule', label: 'Scheduled Posts' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'history', label: 'Post History' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'create' && <CreatePostForm />}
          {activeTab === 'schedule' && <ScheduledPosts />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'history' && <PostHistory />}
        </div>
      </div>
    </div>
  );
};

// Create Post Form Component
const CreatePostForm = () => {
  const [formData, setFormData] = useState({
    content: '',
    platforms: [],
    hashtags: '',
    scheduleTime: '',
    mediaFiles: []
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const platforms = [
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600' },
    { id: 'instagram', name: 'Instagram', color: 'bg-pink-600' },
    { id: 'x', name: 'X (Twitter)', color: 'bg-black' },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700' },
    { id: 'tiktok', name: 'TikTok', color: 'bg-black' },
    { id: 'youtube', name: 'YouTube', color: 'bg-red-600' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const postData = {
        content: formData.content,
        platforms: formData.platforms,
        hashtags: formData.hashtags.split(' ').filter(tag => tag.trim()),
        schedule_time: formData.scheduleTime || null
      };

      const response = await axios.post('/api/post', postData);
      setResult(response.data);
      
      // Reset form on success
      if (response.data.status !== 'failed') {
        setFormData({
          content: '',
          platforms: [],
          hashtags: '',
          scheduleTime: '',
          mediaFiles: []
        });
      }
    } catch (error) {
      setResult({ error: error.message, status: 'failed' });
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformToggle = (platformId) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Create New Post</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post Content
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What's on your mind?"
            required
          />
        </div>

        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Platforms
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                type="button"
                onClick={() => handlePlatformToggle(platform.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.platforms.includes(platform.id)
                    ? `${platform.color} text-white border-transparent`
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {platform.name}
              </button>
            ))}
          </div>
        </div>

        {/* Hashtags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hashtags (space-separated)
          </label>
          <input
            type="text"
            value={formData.hashtags}
            onChange={(e) => setFormData(prev => ({ ...prev, hashtags: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="#socialmedia #contentmarketing #automation"
          />
        </div>

        {/* Schedule Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Schedule Time (optional)
          </label>
          <input
            type="datetime-local"
            value={formData.scheduleTime}
            onChange={(e) => setFormData(prev => ({ ...prev, scheduleTime: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || formData.platforms.length === 0}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Posting...' : formData.scheduleTime ? 'Schedule Post' : 'Post Now'}
        </button>
      </form>

      {/* Result Display */}
      {result && (
        <div className={`p-4 rounded-md ${
          result.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          {result.error ? (
            <p>Error: {result.error}</p>
          ) : (
            <p>Post {formData.scheduleTime ? 'scheduled' : 'published'} successfully!</p>
          )}
        </div>
      )}
    </div>
  );
};

// Analytics Component
const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/analytics?days=${days}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  if (!analytics || analytics.error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading analytics: {analytics?.error || 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Total Posts</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics.total_posts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Total Engagement</h3>
          <p className="text-3xl font-bold text-green-600">{analytics.total_engagement}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Avg. Engagement</h3>
          <p className="text-3xl font-bold text-purple-600">
            {analytics.total_posts > 0 
              ? Math.round(analytics.total_engagement / analytics.total_posts)
              : 0
            }
          </p>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Platform Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(analytics.platform_breakdown || {}).map(([platform, data]) => (
            <div key={platform} className="flex justify-between items-center">
              <span className="capitalize font-medium">{platform}</span>
              <div className="text-right">
                <div className="text-sm text-gray-600">{data.posts} posts</div>
                <div className="text-sm font-semibold">{data.engagement} engagement</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Post History Component
const PostHistory = () => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading post history...</div>;
  }

  if (!history || history.error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading history: {history?.error || 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Post History</h2>
      
      <div className="space-y-4">
        {history.posts && history.posts.length > 0 ? (
          history.posts.map((post, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900">
                  {post.platform ? post.platform.charAt(0).toUpperCase() + post.platform.slice(1) : 'Unknown Platform'}
                </h3>
                <span className="text-sm text-gray-500">
                  {post.postDate ? new Date(post.postDate).toLocaleDateString() : 'Unknown Date'}
                </span>
              </div>
              <p className="text-gray-700 mb-3">{post.post || 'No content available'}</p>
              <div className="flex space-x-4 text-sm text-gray-600">
                <span>❤️ {post.likes || 0}</span>
                <span>🔄 {post.shares || 0}</span>
                <span>💬 {post.comments || 0}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No posts found in history
          </div>
        )}
      </div>
    </div>
  );
};

// Scheduled Posts Component
const ScheduledPosts = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Scheduled Posts</h2>
      <div className="text-center py-8 text-gray-500">
        Scheduled posts feature coming soon...
      </div>
    </div>
  );
};

export default App;

// Additional utility functions and hooks

// Custom hook for API calls
export const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = async (method, url, data = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const config = {
        method,
        url,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (data) {
        config.data = data;
      }
      
      const response = await axios(config);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { apiCall, loading, error };
};

// Platform configuration
export const PLATFORM_CONFIG = {
  facebook: {
    name: 'Facebook',
    color: '#1877F2',
    icon: '📘',
    maxLength: 63206
  },
  instagram: {
    name: 'Instagram',
    color: '#E4405F',
    icon: '📷',
    maxLength: 2200
  },
  x: {
    name: 'X (Twitter)',
    color: '#000000',
    icon: '🐦',
    maxLength: 280
  },
  linkedin: {
    name: 'LinkedIn',
    color: '#0A66C2',
    icon: '💼',
    maxLength: 3000
  },
  tiktok: {
    name: 'TikTok',
    color: '#000000',
    icon: '🎵',
    maxLength: 2200
  },
  youtube: {
    name: 'YouTube',
    color: '#FF0000',
    icon: '📺',
    maxLength: 5000
  }
};

// Utility function to format dates
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Utility function to validate post content
export const validatePost = (content, platforms) => {
  const errors = [];
  
  if (!content.trim()) {
    errors.push('Post content is required');
  }
  
  if (platforms.length === 0) {
    errors.push('At least one platform must be selected');
  }
  
  // Check character limits for each platform
  platforms.forEach(platform => {
    const config = PLATFORM_CONFIG[platform];
    if (config && content.length > config.maxLength) {
      errors.push(`Content exceeds ${config.name} character limit (${config.maxLength})`);
    }
  });
  
  return errors;
};

