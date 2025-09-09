import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Code2, 
  Target, 
  Award,
  Clock,
  FileText,
  Shield,
  Zap,
  Brain,
  GitBranch
} from 'lucide-react';

interface DashboardProps {
  analysisHistory: any[];
}

export const CodeDashboard: React.FC<DashboardProps> = ({ analysisHistory }) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [selectedMetric, setSelectedMetric] = useState<string>('score');

  // Calculate trends and statistics
  const calculateTrends = () => {
    if (analysisHistory.length < 2) return { trend: 0, direction: 'stable' };
    
    const recent = analysisHistory.slice(0, 5);
    const older = analysisHistory.slice(5, 10);
    
    const recentAvg = recent.reduce((sum, analysis) => sum + analysis.score, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, analysis) => sum + analysis.score, 0) / older.length : recentAvg;
    
    const trend = ((recentAvg - olderAvg) / olderAvg) * 100;
    const direction = trend > 5 ? 'improving' : trend < -5 ? 'declining' : 'stable';
    
    return { trend: Math.abs(trend), direction };
  };

  const { trend, direction } = calculateTrends();

  const totalLinesAnalyzed = analysisHistory.reduce((sum, analysis) => sum + (analysis.metrics?.linesOfCode || 0), 0);
  const avgScore = analysisHistory.length > 0 
    ? analysisHistory.reduce((sum, analysis) => sum + analysis.score, 0) / analysisHistory.length 
    : 0;

  const languageStats = analysisHistory.reduce((acc, analysis) => {
    const lang = analysis.language || 'unknown';
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostUsedLanguage = Object.entries(languageStats)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Code Analytics Dashboard</h2>
          <p className="text-gray-300">Track your code quality over time</p>
        </div>
        <div className="flex space-x-2">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeframe === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{avgScore.toFixed(1)}%</p>
              <p className="text-sm text-gray-300">Avg Quality Score</p>
              <div className={`flex items-center space-x-1 text-xs ${
                direction === 'improving' ? 'text-green-400' : 
                direction === 'declining' ? 'text-red-400' : 'text-gray-400'
              }`}>
                <span>{direction === 'improving' ? '↗' : direction === 'declining' ? '↘' : '→'}</span>
                <span>{trend.toFixed(1)}% vs last period</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Code2 className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalLinesAnalyzed.toLocaleString()}</p>
              <p className="text-sm text-gray-300">Lines Analyzed</p>
              <p className="text-xs text-green-400">Across {analysisHistory.length} reviews</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{mostUsedLanguage}</p>
              <p className="text-sm text-gray-300">Primary Language</p>
              <p className="text-xs text-purple-400">{languageStats[mostUsedLanguage] || 0} reviews</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {analysisHistory.reduce((sum, a) => {
                  const hours = a.technicalDebt?.match(/(\d+\.?\d*)\s*hours/)?.[1];
                  return sum + (parseFloat(hours) || 0);
                }, 0).toFixed(1)}h
              </p>
              <p className="text-sm text-gray-300">Tech Debt Est.</p>
              <p className="text-xs text-orange-400">Time to resolve</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Metrics Chart */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Quality Trends</h3>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm"
          >
            <option value="score">Overall Score</option>
            <option value="security">Security</option>
            <option value="performance">Performance</option>
            <option value="maintainability">Maintainability</option>
          </select>
        </div>
        
        <div className="h-64 flex items-end space-x-2">
          {analysisHistory.slice(0, 10).reverse().map((analysis, index) => {
            const value = selectedMetric === 'score' 
              ? analysis.score 
              : analysis.metrics?.[selectedMetric] || 0;
            const height = Math.max((value / 100) * 100, 5);
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    value >= 80 ? 'bg-green-500' :
                    value >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-400 mt-2">{index + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Issue Categories Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Issue Categories</h3>
          <div className="space-y-4">
            {[
              { name: 'Security', icon: Shield, color: 'red' },
              { name: 'Performance', icon: Zap, color: 'yellow' },
              { name: 'Code Quality', icon: Target, color: 'blue' },
              { name: 'Documentation', icon: FileText, color: 'green' }
            ].map((category) => {
              const totalIssues = analysisHistory.reduce((sum, analysis) => {
                return sum + (analysis.summary?.[`${category.name.toLowerCase()}Issues`] || 0);
              }, 0);
              
              const IconComponent = category.icon;
              
              return (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`w-5 h-5 text-${category.color}-400`} />
                    <span className="text-gray-300">{category.name}</span>
                  </div>
                  <span className="text-white font-medium">{totalIssues}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Language Distribution</h3>
          <div className="space-y-3">
            {Object.entries(languageStats)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([language, count]) => {
                const percentage = ((count / analysisHistory.length) * 100).toFixed(1);
                return (
                  <div key={language} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 capitalize">{language}</span>
                      <span className="text-white font-medium">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              name: 'First Review',
              description: 'Completed your first code review',
              earned: analysisHistory.length >= 1,
              icon: '🎯'
            },
            {
              name: 'Quality Champion',
              description: 'Achieved 90+ average score',
              earned: avgScore >= 90,
              icon: '🏆'
            },
            {
              name: 'Security Expert',
              description: 'Resolved all security issues',
              earned: analysisHistory.some(a => a.summary?.securityIssues === 0),
              icon: '🛡️'
            },
            {
              name: 'Code Master',
              description: 'Analyzed 10,000+ lines of code',
              earned: totalLinesAnalyzed >= 10000,
              icon: '👑'
            }
          ].map((achievement) => (
            <div
              key={achievement.name}
              className={`p-4 rounded-lg border ${
                achievement.earned
                  ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30'
                  : 'bg-gray-700/50 border-gray-600'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{achievement.icon}</div>
                <h4 className={`font-medium ${achievement.earned ? 'text-yellow-300' : 'text-gray-400'}`}>
                  {achievement.name}
                </h4>
                <p className={`text-xs ${achievement.earned ? 'text-yellow-200' : 'text-gray-500'}`}>
                  {achievement.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};