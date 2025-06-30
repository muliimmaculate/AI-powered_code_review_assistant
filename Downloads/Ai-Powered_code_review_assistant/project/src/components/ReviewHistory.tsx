import React, { useState } from 'react';
import { History, Calendar, TrendingUp, Filter, Download, Search, Star, Clock, User, GitBranch } from 'lucide-react';

interface HistoricalReview {
  id: string;
  title: string;
  author: {
    name: string;
    avatar: string;
  };
  reviewers: {
    name: string;
    avatar: string;
  }[];
  status: 'completed' | 'approved' | 'rejected' | 'abandoned';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  completedAt?: Date;
  metrics: {
    qualityScore: number;
    issuesFound: number;
    linesOfCode: number;
    reviewTime: number; // in hours
  };
  tags: string[];
  improvements: {
    before: number;
    after: number;
  };
}

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
}

export const ReviewHistory: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [authorFilter, setAuthorFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'quality' | 'impact'>('date');

  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'Elena Rodriguez',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '4',
      name: 'David Kim',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=100&h=100&fit=crop&crop=face'
    }
  ]);

  const [reviews] = useState<HistoricalReview[]>([
    {
      id: '1',
      title: 'User Authentication Refactor',
      author: teamMembers[1],
      reviewers: [teamMembers[0], teamMembers[3]],
      status: 'approved',
      priority: 'high',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      metrics: {
        qualityScore: 8.5,
        issuesFound: 3,
        linesOfCode: 450,
        reviewTime: 2.5
      },
      tags: ['security', 'authentication', 'refactor'],
      improvements: { before: 6.2, after: 8.5 }
    },
    {
      id: '2',
      title: 'API Response Optimization',
      author: teamMembers[2],
      reviewers: [teamMembers[1]],
      status: 'completed',
      priority: 'medium',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      metrics: {
        qualityScore: 9.1,
        issuesFound: 1,
        linesOfCode: 280,
        reviewTime: 1.8
      },
      tags: ['performance', 'api', 'optimization'],
      improvements: { before: 7.8, after: 9.1 }
    },
    {
      id: '3',
      title: 'Frontend Component Library Update',
      author: teamMembers[2],
      reviewers: [teamMembers[0]],
      status: 'approved',
      priority: 'low',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      metrics: {
        qualityScore: 7.8,
        issuesFound: 5,
        linesOfCode: 720,
        reviewTime: 3.2
      },
      tags: ['frontend', 'components', 'ui'],
      improvements: { before: 6.5, after: 7.8 }
    },
    {
      id: '4',
      title: 'Database Migration Script',
      author: teamMembers[1],
      reviewers: [teamMembers[3], teamMembers[0]],
      status: 'rejected',
      priority: 'urgent',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      metrics: {
        qualityScore: 5.2,
        issuesFound: 8,
        linesOfCode: 180,
        reviewTime: 4.5
      },
      tags: ['database', 'migration', 'sql'],
      improvements: { before: 4.1, after: 5.2 }
    },
    {
      id: '5',
      title: 'Mobile App Performance Improvements',
      author: teamMembers[0],
      reviewers: [teamMembers[2], teamMembers[1]],
      status: 'approved',
      priority: 'high',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      metrics: {
        qualityScore: 9.3,
        issuesFound: 2,
        linesOfCode: 650,
        reviewTime: 5.1
      },
      tags: ['mobile', 'performance', 'react-native'],
      improvements: { before: 7.1, after: 9.3 }
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-blue-400 bg-blue-900/20';
      case 'approved': return 'text-green-400 bg-green-900/20';
      case 'rejected': return 'text-red-400 bg-red-900/20';
      case 'abandoned': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 9) return 'text-green-400';
    if (score >= 7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const filteredReviews = reviews.filter(review => {
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesAuthor = authorFilter === 'all' || review.author.name === authorFilter;
    const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesAuthor && matchesSearch;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'quality':
        return b.metrics.qualityScore - a.metrics.qualityScore;
      case 'impact':
        return (b.improvements.after - b.improvements.before) - (a.improvements.after - a.improvements.before);
      default:
        return 0;
    }
  });

  const calculateStats = () => {
    const totalReviews = filteredReviews.length;
    const avgQuality = filteredReviews.reduce((sum, r) => sum + r.metrics.qualityScore, 0) / totalReviews;
    const avgImprovement = filteredReviews.reduce((sum, r) => sum + (r.improvements.after - r.improvements.before), 0) / totalReviews;
    const avgReviewTime = filteredReviews.reduce((sum, r) => sum + r.metrics.reviewTime, 0) / totalReviews;

    return {
      totalReviews,
      avgQuality: avgQuality || 0,
      avgImprovement: avgImprovement || 0,
      avgReviewTime: avgReviewTime || 0
    };
  };

  const stats = calculateStats();

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const exportData = () => {
    const csvContent = [
      ['Title', 'Author', 'Status', 'Quality Score', 'Issues Found', 'Review Time', 'Created', 'Completed'].join(','),
      ...sortedReviews.map(review => [
        review.title,
        review.author.name,
        review.status,
        review.metrics.qualityScore,
        review.metrics.issuesFound,
        review.metrics.reviewTime,
        review.createdAt.toLocaleDateString(),
        review.completedAt?.toLocaleDateString() || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'review-history.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-white" />
          <h2 className="text-lg font-semibold text-white">Review History & Analytics</h2>
        </div>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Total Reviews</span>
            <GitBranch className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.totalReviews}</div>
          <div className="text-xs text-gray-400">This {timeRange}</div>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Avg Quality</span>
            <Star className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-yellow-400">{stats.avgQuality.toFixed(1)}</div>
          <div className="text-xs text-gray-400">Out of 10</div>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Avg Improvement</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-400">+{stats.avgImprovement.toFixed(1)}</div>
          <div className="text-xs text-gray-400">Quality points</div>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Avg Review Time</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">{stats.avgReviewTime.toFixed(1)}h</div>
          <div className="text-xs text-gray-400">Per review</div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reviews..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="abandoned">Abandoned</option>
        </select>

        <select
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Authors</option>
          {teamMembers.map(member => (
            <option key={member.id} value={member.name}>{member.name}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="date">Sort by Date</option>
          <option value="quality">Sort by Quality</option>
          <option value="impact">Sort by Impact</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.map(review => (
          <div key={review.id} className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-white font-medium">{review.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(review.status)}`}>
                    {review.status}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(review.priority)}`}>
                    {review.priority}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>by {review.author.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatTimeAgo(review.createdAt)}</span>
                  </div>
                  {review.completedAt && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{review.metrics.reviewTime}h review time</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {review.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <div className={`text-lg font-bold ${getQualityColor(review.metrics.qualityScore)}`}>
                  {review.metrics.qualityScore}/10
                </div>
                <div className="text-xs text-gray-400">Quality Score</div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-3">
              <div className="text-center">
                <div className="text-sm font-medium text-white">{review.metrics.issuesFound}</div>
                <div className="text-xs text-gray-400">Issues Found</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-white">{review.metrics.linesOfCode}</div>
                <div className="text-xs text-gray-400">Lines of Code</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-green-400">
                  +{(review.improvements.after - review.improvements.before).toFixed(1)}
                </div>
                <div className="text-xs text-gray-400">Improvement</div>
              </div>
              <div className="text-center">
                <div className="flex -space-x-2 justify-center">
                  {review.reviewers.map(reviewer => (
                    <img
                      key={reviewer.name}
                      src={reviewer.avatar}
                      alt={reviewer.name}
                      className="w-6 h-6 rounded-full object-cover border-2 border-gray-900"
                      title={reviewer.name}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-400">Reviewers</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-white">
                  {review.completedAt ? 
                    Math.ceil((review.completedAt.getTime() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24)) + 'd' :
                    'Pending'
                  }
                </div>
                <div className="text-xs text-gray-400">Duration</div>
              </div>
            </div>

            {/* Quality Improvement Visualization */}
            <div className="bg-gray-800 rounded p-3">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span>Quality Improvement</span>
                <span>{review.improvements.before} → {review.improvements.after}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(review.improvements.after / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-green-400 font-medium">
                  +{((review.improvements.after - review.improvements.before) / review.improvements.before * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedReviews.length === 0 && (
        <div className="text-center py-12">
          <History className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Reviews Found</h3>
          <p className="text-gray-500">Try adjusting your filters to see more results</p>
        </div>
      )}
    </div>
  );
};