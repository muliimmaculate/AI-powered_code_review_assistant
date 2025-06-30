import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Clock, Star, GitBranch, Award, Target, Calendar, Filter, Download, UserPlus, MessageCircle, Video } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'developer' | 'senior' | 'lead' | 'architect';
  expertise: string[];
  stats: {
    reviewsCompleted: number;
    codeQualityScore: number;
    issuesFixed: number;
    linesReviewed: number;
  };
  activity: {
    lastActive: Date;
    currentStreak: number;
    totalContributions: number;
  };
  isOnline: boolean;
}

interface TeamDashboardProps {
  teamMembers?: TeamMember[];
  onInviteToSession?: (memberId: string) => void;
  onNotification?: (message: string) => void;
}

export const TeamDashboard: React.FC<TeamDashboardProps> = ({ 
  teamMembers: propTeamMembers,
  onInviteToSession,
  onNotification 
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'reviews' | 'analytics'>('overview');

  // Use prop team members or default data
  const [teamMembers] = useState<TeamMember[]>(propTeamMembers || [
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah@company.com',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100&h=100&fit=crop&crop=face',
      role: 'lead',
      expertise: ['React', 'TypeScript', 'Node.js', 'Architecture'],
      stats: { reviewsCompleted: 45, codeQualityScore: 9.2, issuesFixed: 128, linesReviewed: 15420 },
      activity: { lastActive: new Date(), currentStreak: 12, totalContributions: 234 },
      isOnline: true
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      email: 'marcus@company.com',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100&h=100&fit=crop&crop=face',
      role: 'senior',
      expertise: ['Python', 'Django', 'PostgreSQL', 'DevOps'],
      stats: { reviewsCompleted: 38, codeQualityScore: 8.7, issuesFixed: 95, linesReviewed: 12300 },
      activity: { lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), currentStreak: 8, totalContributions: 189 },
      isOnline: true
    },
    {
      id: '3',
      name: 'Elena Rodriguez',
      email: 'elena@company.com',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=100&h=100&fit=crop&crop=face',
      role: 'developer',
      expertise: ['Vue.js', 'JavaScript', 'CSS', 'UI/UX'],
      stats: { reviewsCompleted: 29, codeQualityScore: 8.4, issuesFixed: 67, linesReviewed: 8900 },
      activity: { lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000), currentStreak: 5, totalContributions: 156 },
      isOnline: false
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'david@company.com',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=100&h=100&fit=crop&crop=face',
      role: 'architect',
      expertise: ['System Design', 'Microservices', 'AWS', 'Security'],
      stats: { reviewsCompleted: 52, codeQualityScore: 9.5, issuesFixed: 145, linesReviewed: 18700 },
      activity: { lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000), currentStreak: 15, totalContributions: 298 },
      isOnline: true
    }
  ]);

  const teamMetrics = {
    averageQualityScore: teamMembers.reduce((sum, m) => sum + m.stats.codeQualityScore, 0) / teamMembers.length,
    totalReviews: teamMembers.reduce((sum, m) => sum + m.stats.reviewsCompleted, 0),
    activeMembers: teamMembers.filter(m => m.isOnline).length,
    criticalIssuesResolved: teamMembers.reduce((sum, m) => sum + m.stats.issuesFixed, 0),
    weeklyTrend: 12.5,
    topPerformers: teamMembers.sort((a, b) => b.stats.codeQualityScore - a.stats.codeQualityScore).slice(0, 3)
  };

  const handleInviteToSession = (memberId: string) => {
    if (onInviteToSession) {
      onInviteToSession(memberId);
    }
    if (onNotification) {
      const member = teamMembers.find(m => m.id === memberId);
      onNotification(`Invited ${member?.name} to live session`);
    }
  };

  const handleStartChat = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (onNotification) {
      onNotification(`Started chat with ${member?.name}`);
    }
  };

  const handleExportReport = () => {
    if (onNotification) {
      onNotification('Team report exported successfully');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'architect': return 'text-purple-400 bg-purple-900/20';
      case 'lead': return 'text-blue-400 bg-blue-900/20';
      case 'senior': return 'text-green-400 bg-green-900/20';
      case 'developer': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-white" />
          <h2 className="text-lg font-semibold text-white">Team Dashboard</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          
          <button 
            onClick={handleExportReport}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'members', label: 'Team Members', icon: Users },
          { id: 'reviews', label: 'Code Reviews', icon: GitBranch },
          { id: 'analytics', label: 'Analytics', icon: Target }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Avg Quality Score</span>
                <Star className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-yellow-400">{teamMetrics.averageQualityScore.toFixed(1)}</div>
              <div className="text-xs text-green-400">+{teamMetrics.weeklyTrend}% this week</div>
            </div>
            
            <div className="bg-gray-900 p-4 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Total Reviews</span>
                <GitBranch className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400">{teamMetrics.totalReviews}</div>
              <div className="text-xs text-gray-400">This {timeRange}</div>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Active Members</span>
                <Users className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-400">{teamMetrics.activeMembers}</div>
              <div className="text-xs text-gray-400">Online now</div>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Issues Resolved</span>
                <Award className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-red-400">{teamMetrics.criticalIssuesResolved}</div>
              <div className="text-xs text-green-400">Total</div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <span>Top Performers This {timeRange}</span>
            </h3>
            <div className="space-y-3">
              {teamMetrics.topPerformers.map((member, index) => (
                <div key={member.id} className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      'bg-orange-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      {member.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">{member.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {member.stats.reviewsCompleted} reviews • {member.stats.codeQualityScore} avg score
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStartChat(member.id)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Start chat"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleInviteToSession(member.id)}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Invite to live session"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">{member.stats.codeQualityScore}</div>
                    <div className="text-xs text-gray-400">Quality Score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Team Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {teamMembers.map(member => (
              <div key={member.id} className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
                      member.isOnline ? 'bg-green-400' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-white font-medium">{member.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{member.email}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {member.expertise.slice(0, 3).map(skill => (
                        <span key={skill} className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                          {skill}
                        </span>
                      ))}
                      {member.expertise.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                          +{member.expertise.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <div className="text-gray-400">Reviews</div>
                        <div className="text-white font-medium">{member.stats.reviewsCompleted}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Quality Score</div>
                        <div className="text-white font-medium">{member.stats.codeQualityScore}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Issues Fixed</div>
                        <div className="text-white font-medium">{member.stats.issuesFixed}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Streak</div>
                        <div className="text-white font-medium">{member.activity.currentStreak} days</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleStartChat(member.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Chat</span>
                      </button>
                      <button
                        onClick={() => handleInviteToSession(member.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                      >
                        <Video className="w-3 h-3" />
                        <span>Invite</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other tabs remain the same but with interactive elements */}
      {activeTab === 'reviews' && (
        <div className="text-center py-12">
          <GitBranch className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">Code Reviews</h3>
          <p className="text-gray-500">Interactive review management coming soon</p>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">Advanced Analytics</h3>
          <p className="text-gray-500">Detailed charts and insights coming soon</p>
        </div>
      )}
    </div>
  );
};