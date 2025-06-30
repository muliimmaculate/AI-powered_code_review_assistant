import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Copy, ExternalLink, Wrench, Check, Zap, X } from 'lucide-react';

interface Issue {
  id: number;
  line: number;
  type: 'error' | 'warning' | 'info';
  severity: 'high' | 'medium' | 'low';
  category: string;
  message: string;
  suggestion: string;
  code: string;
  originalCode?: string;
  fixedCode?: string;
  canAutoFix: boolean;
}

interface Analysis {
  score: number;
  issues: Issue[];
  originalCode: string;
  fixedCode?: string;
}

interface ReviewPanelProps {
  analysis: Analysis | null;
  isAnalyzing: boolean;
  onAutoFix: (issueId: number) => void;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({ analysis, isAnalyzing, onAutoFix }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);
  const [fixedIssues, setFixedIssues] = useState<Set<number>>(new Set());
  const [isFixing, setIsFixing] = useState<number | null>(null);
  const [showFixPreview, setShowFixPreview] = useState<number | null>(null);

  if (isAnalyzing) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Analyzing your code...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
        <div className="text-center py-8 sm:py-12">
          <CheckCircle className="w-8 sm:w-12 h-8 sm:h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-300 mb-2">Ready for Analysis</h3>
          <p className="text-sm text-gray-500">Provide your code and click "Analyze Code" to get started</p>
        </div>
      </div>
    );
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleAutoFix = async (issue: Issue) => {
    if (!issue.canAutoFix) return;
    
    setIsFixing(issue.id);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Apply the real fix
    onAutoFix(issue.id);
    setFixedIssues(prev => new Set([...prev, issue.id]));
    setIsFixing(null);
  };

  const previewFix = (issue: Issue) => {
    setShowFixPreview(showFixPreview === issue.id ? null : issue.id);
  };

  const categories = ['all', ...new Set(analysis.issues.map(issue => issue.category))];
  const filteredIssues = selectedCategory === 'all' 
    ? analysis.issues 
    : analysis.issues.filter(issue => issue.category === selectedCategory);

  const unfixedIssues = filteredIssues.filter(issue => !fixedIssues.has(issue.id));
  const fixedCount = filteredIssues.length - unfixedIssues.length;
  const autoFixableCount = unfixedIssues.filter(issue => issue.canAutoFix).length;

  return (
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
      {/* Score and Summary */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <h2 className="text-base sm:text-lg font-semibold text-white">Code Review Results</h2>
          <div className="text-center sm:text-right">
            <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}/10
            </div>
            <p className="text-xs sm:text-sm text-gray-400">Overall Score</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4">
          <div className="text-center p-2 bg-gray-900 rounded">
            <div className="text-sm sm:text-lg font-semibold text-red-400">
              {analysis.issues.filter(i => i.type === 'error' && !fixedIssues.has(i.id)).length}
            </div>
            <p className="text-xs text-gray-400">Errors</p>
          </div>
          <div className="text-center p-2 bg-gray-900 rounded">
            <div className="text-sm sm:text-lg font-semibold text-yellow-400">
              {analysis.issues.filter(i => i.type === 'warning' && !fixedIssues.has(i.id)).length}
            </div>
            <p className="text-xs text-gray-400">Warnings</p>
          </div>
          <div className="text-center p-2 bg-gray-900 rounded">
            <div className="text-sm sm:text-lg font-semibold text-blue-400">
              {analysis.issues.filter(i => i.type === 'info' && !fixedIssues.has(i.id)).length}
            </div>
            <p className="text-xs text-gray-400">Suggestions</p>
          </div>
          <div className="text-center p-2 bg-gray-900 rounded">
            <div className="text-sm sm:text-lg font-semibold text-green-400">
              {fixedCount}
            </div>
            <p className="text-xs text-gray-400">Fixed</p>
          </div>
        </div>

        {/* Auto-fix all button */}
        {autoFixableCount > 0 && (
          <div className="mb-4">
            <button
              onClick={() => {
                unfixedIssues.filter(issue => issue.canAutoFix).forEach(issue => {
                  handleAutoFix(issue);
                });
              }}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Zap className="w-4 h-4" />
              <span className="font-medium">Auto-Fix All ({autoFixableCount})</span>
            </button>
          </div>
        )}

        {fixedCount > 0 && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-sm text-green-300">
                {fixedCount} issue{fixedCount !== 1 ? 's' : ''} fixed automatically
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-2 sm:px-3 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category === 'all' ? 'All Issues' : category}
              {category !== 'all' && (
                <span className="ml-1 text-xs opacity-75">
                  ({analysis.issues.filter(i => i.category === category && !fixedIssues.has(i.id)).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {unfixedIssues.map(issue => (
          <div
            key={issue.id}
            className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden"
          >
            <div
              className="p-3 sm:p-4 cursor-pointer hover:bg-gray-800 transition-colors"
              onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
            >
              <div className="flex items-start space-x-3">
                {getIssueIcon(issue.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white break-words">{issue.message}</span>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">
                        Line {issue.line}
                      </span>
                      {issue.canAutoFix && (
                        <span className="text-xs px-2 py-1 bg-green-900 text-green-300 rounded-full">
                          Auto-fixable
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-400">{issue.category}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      issue.severity === 'high' ? 'bg-red-900 text-red-300' :
                      issue.severity === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-blue-900 text-blue-300'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                  {issue.canAutoFix && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          previewFix(issue);
                        }}
                        className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        <Info className="w-3 h-3" />
                        <span className="hidden sm:inline">Preview</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAutoFix(issue);
                        }}
                        disabled={isFixing === issue.id}
                        className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isFixing === issue.id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span className="hidden sm:inline">Fixing...</span>
                          </>
                        ) : (
                          <>
                            <Wrench className="w-3 h-3" />
                            <span className="hidden sm:inline">Fix</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Fix Preview */}
            {showFixPreview === issue.id && issue.canAutoFix && (
              <div className="border-t border-gray-700 p-3 sm:p-4 bg-gray-800">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-white">Fix Preview</h4>
                    <button
                      onClick={() => setShowFixPreview(null)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div>
                      <h5 className="text-xs font-medium text-red-300 mb-2">Before (Original)</h5>
                      <pre className="text-xs bg-red-900/20 border border-red-700/30 p-2 rounded text-red-200 overflow-x-auto">
                        {issue.originalCode || 'Original code'}
                      </pre>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-green-300 mb-2">After (Fixed)</h5>
                      <pre className="text-xs bg-green-900/20 border border-green-700/30 p-2 rounded text-green-200 overflow-x-auto">
                        {issue.fixedCode || issue.code}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {expandedIssue === issue.id && (
              <div className="border-t border-gray-700 p-3 sm:p-4 bg-gray-800">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Suggestion:</h4>
                    <p className="text-sm text-gray-300">{issue.suggestion}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-white">Recommended Code:</h4>
                      <button 
                        onClick={() => copyToClipboard(issue.code)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <pre className="text-xs bg-gray-900 p-3 rounded border text-gray-300 overflow-x-auto">
                      {issue.code}
                    </pre>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                      <ExternalLink className="w-3 h-3" />
                      <span>Learn More</span>
                    </button>
                    <button className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600 transition-colors">
                      Ignore
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Show fixed issues */}
        {filteredIssues.filter(issue => fixedIssues.has(issue.id)).map(issue => (
          <div
            key={`fixed-${issue.id}`}
            className="bg-green-900/10 border border-green-700/30 rounded-lg p-3 sm:p-4 opacity-75"
          >
            <div className="flex items-center space-x-3">
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-green-300 line-through break-words">{issue.message}</span>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-green-400">Fixed automatically</span>
                  <span className="text-xs px-2 py-1 bg-green-800 text-green-200 rounded-full">
                    Line {issue.line}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {unfixedIssues.length === 0 && fixedCount === 0 && (
        <div className="text-center py-8">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-gray-400">No issues found in this category</p>
        </div>
      )}

      {unfixedIssues.length === 0 && fixedCount > 0 && (
        <div className="text-center py-8">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-green-300">All issues in this category have been fixed!</p>
        </div>
      )}
    </div>
  );
};