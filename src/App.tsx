import React, { useState } from 'react';
import { Header } from './components/Header';
import { CodeInput } from './components/CodeInput';
import { ReviewPanel } from './components/ReviewPanel';
import { MetricsPanel } from './components/MetricsPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { CodeComparison } from './components/CodeComparison';
import { AIChat } from './components/AIChat';
import { PerformancePanel } from './components/PerformancePanel';
import { CustomRulesPanel } from './components/CustomRulesPanel';
import { TeamDashboard } from './components/TeamDashboard';
import { LiveReviewSession } from './components/LiveReviewSession';
import { ReviewerAssignment } from './components/ReviewerAssignment';
import { ReviewHistory } from './components/ReviewHistory';
import { ChevronDown, Code, Users, Video, UserCheck, History, Zap, BarChart3, Settings as SettingsIcon, GitCompare, MessageSquare, Wrench } from 'lucide-react';

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

interface Metrics {
  complexity: number;
  maintainability: number;
  reliability: number;
  security: number;
  coverage: number;
  documentation: number;
}

interface Analysis {
  score: number;
  issues: Issue[];
  metrics: Metrics;
  documentationFeedback: string[];
  originalCode: string;
  fixedCode?: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'developer' | 'senior' | 'lead' | 'architect';
  isOnline: boolean;
}

interface LiveSession {
  id: string;
  participants: TeamMember[];
  isActive: boolean;
}

function App() {
  const [activeTab, setActiveTab] = useState<'review' | 'metrics' | 'performance' | 'rules' | 'comparison' | 'chat' | 'team' | 'live' | 'assignment' | 'history' | 'settings'>('review');
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customRules, setCustomRules] = useState<any[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  // Interactive state management
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah@company.com',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100&h=100&fit=crop&crop=face',
      role: 'lead',
      isOnline: true
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      email: 'marcus@company.com',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100&h=100&fit=crop&crop=face',
      role: 'senior',
      isOnline: true
    },
    {
      id: '3',
      name: 'Elena Rodriguez',
      email: 'elena@company.com',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=100&h=100&fit=crop&crop=face',
      role: 'developer',
      isOnline: false
    }
  ]);

  const [liveSession, setLiveSession] = useState<LiveSession>({
    id: 'session-123',
    participants: teamMembers.filter(m => m.isOnline),
    isActive: false
  });

  const [notifications, setNotifications] = useState<string[]>([]);

  // Define all tabs with their properties (removed templates)
  const allTabs = [
    { id: 'review', label: 'Review', icon: Code, primary: true },
    { id: 'team', label: 'Team', icon: Users, primary: true },
    { id: 'live', label: 'Live', icon: Video, primary: true },
    { id: 'assignment', label: 'Assign', icon: UserCheck, primary: false },
    { id: 'history', label: 'History', icon: History, primary: false },
    { id: 'performance', label: 'Performance', icon: Zap, primary: false },
    { id: 'metrics', label: 'Metrics', icon: BarChart3, primary: false },
    { id: 'rules', label: 'Rules', icon: Wrench, primary: false },
    { id: 'comparison', label: 'Compare', icon: GitCompare, primary: false },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare, primary: false },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, primary: false }
  ];

  // Split tabs into primary (always visible) and secondary (in dropdown)
  const primaryTabs = allTabs.filter(tab => tab.primary);
  const secondaryTabs = allTabs.filter(tab => !tab.primary);

  // Real auto-fix implementations
  const autoFixFunctions = {
    'Use strict equality (===) instead of ==': (code: string) => {
      return code.replace(/([^=!])={2}([^=])/g, '$1===$2');
    },
    'Use let or const instead of var': (code: string) => {
      return code.replace(/\bvar\s+/g, 'const ');
    },
    'Missing semicolon': (code: string) => {
      return code.replace(/([^;\s}])\s*\n/g, '$1;\n');
    },
    'Remove console.log statements': (code: string) => {
      return code.replace(/console\.log\([^)]*\);?\s*/g, '');
    },
    'Add error handling for async operations': (code: string) => {
      const asyncPattern = /(await\s+[^;]+;?)/g;
      return code.replace(asyncPattern, (match) => {
        if (code.includes('try') && code.includes('catch')) return match;
        return `try {\n  ${match.trim()}\n} catch (error) {\n  console.error('Error:', error);\n}`;
      });
    },
    'Use const for immutable variables': (code: string) => {
      return code.replace(/let\s+(\w+)\s*=\s*([^;]+);(?!\s*\1\s*=)/g, 'const $1 = $2;');
    },
    'Add JSDoc documentation': (code: string) => {
      return code.replace(/(function\s+\w+\([^)]*\)|const\s+\w+\s*=\s*\([^)]*\)\s*=>)/g, (match) => {
        return `/**\n * Description of the function\n * @param {*} param - Parameter description\n * @returns {*} Return value description\n */\n${match}`;
      });
    }
  };

  const analyzeCodeAccurately = async (codeContent: string): Promise<Analysis> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const lines = codeContent.split('\n');
          const issues: Issue[] = [];
          const documentationFeedback: string[] = [];
          let issueId = 1;

          // Enhanced analysis with real auto-fix capabilities
          const analysisRules = [
            {
              pattern: /([^=!])={2}([^=])/g,
              message: 'Use strict equality (===) instead of ==',
              category: 'Best Practice',
              type: 'warning' as const,
              severity: 'medium' as const,
              canAutoFix: true,
              suggestion: 'Replace == with === for strict equality comparison',
              getFixedCode: (code: string) => autoFixFunctions['Use strict equality (===) instead of =='](code)
            },
            {
              pattern: /\bvar\s+/g,
              message: 'Use let or const instead of var',
              category: 'Best Practice',
              type: 'info' as const,
              severity: 'low' as const,
              canAutoFix: true,
              suggestion: 'Use const for immutable values, let for mutable ones',
              getFixedCode: (code: string) => autoFixFunctions['Use let or const instead of var'](code)
            },
            {
              pattern: /console\.log/g,
              message: 'Console.log statement found',
              category: 'Best Practice',
              type: 'info' as const,
              severity: 'low' as const,
              canAutoFix: true,
              suggestion: 'Remove console.log statements in production code',
              getFixedCode: (code: string) => autoFixFunctions['Remove console.log statements'](code)
            },
            {
              pattern: /SELECT.*\+.*(?!\?)/i,
              message: 'Potential SQL injection vulnerability',
              category: 'Security',
              type: 'error' as const,
              severity: 'high' as const,
              canAutoFix: false,
              suggestion: 'Use parameterized queries to prevent SQL injection'
            },
            {
              pattern: /innerHTML.*(?!sanitize)/i,
              message: 'Potential XSS vulnerability with innerHTML',
              category: 'Security',
              type: 'error' as const,
              severity: 'high' as const,
              canAutoFix: false,
              suggestion: 'Use textContent or sanitize HTML content'
            },
            {
              pattern: /password.*[=:]/i,
              message: 'Hardcoded credentials detected',
              category: 'Security',
              type: 'error' as const,
              severity: 'high' as const,
              canAutoFix: false,
              suggestion: 'Move credentials to environment variables'
            }
          ];

          // Apply built-in analysis rules
          analysisRules.forEach(rule => {
            const matches = codeContent.match(rule.pattern);
            if (matches) {
              lines.forEach((line, index) => {
                if (rule.pattern.test(line)) {
                  const originalCode = line.trim();
                  const fixedCode = rule.getFixedCode ? rule.getFixedCode(line) : undefined;
                  
                  issues.push({
                    id: issueId++,
                    line: index + 1,
                    type: rule.type,
                    severity: rule.severity,
                    category: rule.category,
                    message: rule.message,
                    suggestion: rule.suggestion,
                    code: fixedCode || '// Manual fix required',
                    originalCode,
                    fixedCode,
                    canAutoFix: rule.canAutoFix
                  });
                }
              });
            }
          });

          // Apply custom rules
          customRules.filter(rule => rule.enabled).forEach(rule => {
            try {
              const regex = new RegExp(rule.pattern, 'gi');
              const matches = codeContent.match(regex);
              if (matches) {
                lines.forEach((line, index) => {
                  if (regex.test(line)) {
                    issues.push({
                      id: issueId++,
                      line: index + 1,
                      type: rule.severity === 'error' ? 'error' : rule.severity === 'warning' ? 'warning' : 'info',
                      severity: rule.severity === 'error' ? 'high' : rule.severity === 'warning' ? 'medium' : 'low',
                      category: rule.category,
                      message: rule.message,
                      suggestion: rule.suggestion,
                      code: rule.fixTemplate || '// Manual fix required',
                      originalCode: line.trim(),
                      canAutoFix: !!rule.fixTemplate
                    });
                  }
                });
              }
            } catch (error) {
              console.error('Error applying custom rule:', rule.name, error);
            }
          });

          // Documentation analysis
          const hasComments = codeContent.includes('//') || codeContent.includes('/*');
          const hasJSDoc = codeContent.includes('/**');
          const functionCount = (codeContent.match(/function\s+\w+|const\s+\w+\s*=\s*\(|=>\s*{/g) || []).length;
          const commentLines = lines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('*')).length;
          const documentationRatio = commentLines / Math.max(lines.length, 1);

          if (!hasComments) {
            documentationFeedback.push('No comments found - consider adding explanatory comments');
            issues.push({
              id: issueId++,
              line: 1,
              type: 'info',
              severity: 'medium',
              category: 'Documentation',
              message: 'Missing code comments',
              suggestion: 'Add comments to explain complex logic and function purposes',
              code: '// Explain what this function does\nfunction myFunction() {\n  // Implementation details\n}',
              canAutoFix: false
            });
          }

          if (!hasJSDoc && functionCount > 0) {
            documentationFeedback.push('Consider using JSDoc comments for better function documentation');
            issues.push({
              id: issueId++,
              line: 1,
              type: 'info',
              severity: 'low',
              category: 'Documentation',
              message: 'Missing JSDoc documentation',
              suggestion: 'Use JSDoc comments to document function parameters and return values',
              code: autoFixFunctions['Add JSDoc documentation'](codeContent),
              canAutoFix: true,
              fixedCode: autoFixFunctions['Add JSDoc documentation'](codeContent)
            });
          }

          // Error handling analysis
          const hasTryCatch = /try\s*{[\s\S]*?catch/i.test(codeContent);
          const hasAsyncWithoutCatch = /await|\.then\(/.test(codeContent) && !hasTryCatch;
          
          if (hasAsyncWithoutCatch) {
            issues.push({
              id: issueId++,
              line: 1,
              type: 'warning',
              severity: 'medium',
              category: 'Error Handling',
              message: 'Missing error handling for async operations',
              suggestion: 'Add try-catch blocks or .catch() for error handling',
              code: autoFixFunctions['Add error handling for async operations'](codeContent),
              canAutoFix: true,
              fixedCode: autoFixFunctions['Add error handling for async operations'](codeContent)
            });
          }

          // Calculate metrics
          const complexity = Math.min(10, Math.max(1, 
            ((codeContent.match(/if|for|while|switch|catch/g) || []).length * 0.5) + 
            ((codeContent.match(/function|=>/g) || []).length * 0.3) + 2
          ));

          const securityIssues = issues.filter(i => i.category === 'Security').length;
          const errorCount = issues.filter(i => i.type === 'error').length;
          
          const maintainability = Math.max(1, 10 - (issues.length * 0.3) - (complexity * 0.2));
          const reliability = Math.max(1, 10 - (errorCount * 1.5));
          const security = Math.max(1, 10 - (securityIssues * 2));
          const coverage = Math.min(100, Math.max(20, 85 - (issues.length * 1.5)));
          const documentation = Math.min(10, Math.max(1, 
            (hasComments ? 3 : 0) + 
            (hasJSDoc ? 2 : 0) + 
            (documentationRatio * 50) + 1
          ));

          const overallScore = (maintainability + reliability + security + (coverage / 10) + documentation) / 5;

          resolve({
            score: Math.round(overallScore * 10) / 10,
            issues: issues.slice(0, 50),
            metrics: {
              complexity: Math.round(complexity * 10) / 10,
              maintainability: Math.round(maintainability * 10) / 10,
              reliability: Math.round(reliability * 10) / 10,
              security: Math.round(security * 10) / 10,
              coverage: Math.round(coverage),
              documentation: Math.round(documentation * 10) / 10
            },
            documentationFeedback,
            originalCode: codeContent
          });
        } catch (error) {
          console.error('Analysis error:', error);
          resolve({
            score: 5,
            issues: [],
            metrics: {
              complexity: 5,
              maintainability: 5,
              reliability: 5,
              security: 5,
              coverage: 50,
              documentation: 5
            },
            documentationFeedback: ['Analysis failed - please try again'],
            originalCode: codeContent
          });
        }
      }, 100);
    });
  };

  const handleCodeAnalysis = async (codeContent: string) => {
    if (!codeContent.trim()) {
      addNotification('Please provide code to analyze');
      return;
    }

    setIsAnalyzing(true);
    setCode(codeContent);
    
    try {
      const analysis = await analyzeCodeAccurately(codeContent);
      setAnalysis(analysis);
      addNotification(`Analysis complete! Found ${analysis.issues.length} issues with score ${analysis.score}/10`);
    } catch (error) {
      console.error('Analysis error:', error);
      addNotification('An error occurred during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAutoFix = (issueId: number) => {
    if (!analysis) return;

    const issue = analysis.issues.find(i => i.id === issueId);
    if (!issue || !issue.canAutoFix) return;

    let fixedCode = analysis.fixedCode || analysis.originalCode;
    
    // Apply the specific fix
    Object.entries(autoFixFunctions).forEach(([key, fixFunction]) => {
      if (issue.message.includes(key) || issue.suggestion.includes(key)) {
        fixedCode = fixFunction(fixedCode);
      }
    });

    setAnalysis({
      ...analysis,
      fixedCode
    });

    setCode(fixedCode);
    addNotification(`Auto-fixed: ${issue.message}`);
  };

  const handleCustomRulesChange = (rules: any[]) => {
    setCustomRules(rules);
    addNotification(`Custom rules updated: ${rules.filter(r => r.enabled).length} active rules`);
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId as any);
    setShowMoreMenu(false);
    addNotification(`Switched to ${allTabs.find(t => t.id === tabId)?.label} tab`);
  };

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev.slice(-4), message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  const startLiveSession = () => {
    setLiveSession(prev => ({ ...prev, isActive: true }));
    addNotification('Live review session started!');
  };

  const endLiveSession = () => {
    setLiveSession(prev => ({ ...prev, isActive: false }));
    addNotification('Live review session ended');
  };

  const inviteToSession = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (member && !liveSession.participants.find(p => p.id === memberId)) {
      setLiveSession(prev => ({
        ...prev,
        participants: [...prev.participants, member]
      }));
      addNotification(`${member.name} invited to live session`);
    }
  };

  // Check if active tab is in secondary tabs
  const activeTabInSecondary = secondaryTabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in-right"
            >
              {notification}
            </div>
          ))}
        </div>
      )}
      
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8">
          {/* Left Panel - Code Input (only show for certain tabs) */}
          {['review', 'metrics', 'performance', 'rules', 'comparison', 'chat'].includes(activeTab) && (
            <div className="space-y-4 sm:space-y-6">
              <CodeInput 
                onAnalyze={handleCodeAnalysis} 
                isAnalyzing={isAnalyzing}
                code={code}
                setCode={setCode}
              />
            </div>
          )}

          {/* Right Panel - Analysis Results */}
          <div className={`space-y-4 sm:space-y-6 ${
            !['review', 'metrics', 'performance', 'rules', 'comparison', 'chat'].includes(activeTab) 
              ? 'xl:col-span-2' 
              : ''
          }`}>
            {/* Enhanced Tab Navigation */}
            <div className="bg-gray-800 p-1 rounded-lg">
              <div className="flex items-center">
                {/* Primary Tabs - Always Visible */}
                <div className="flex flex-1 min-w-0">
                  {primaryTabs.map(tab => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 min-w-0 flex-1 justify-center ${
                          activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* More Menu Dropdown */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTabInSecondary
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {activeTabInSecondary ? (
                      <>
                        <activeTabInSecondary.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{activeTabInSecondary.label}</span>
                      </>
                    ) : (
                      <span>More</span>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showMoreMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showMoreMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                      <div className="py-1">
                        {secondaryTabs.map(tab => {
                          const IconComponent = tab.icon;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => handleTabClick(tab.id)}
                              className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-colors ${
                                activeTab === tab.id
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
                              }`}
                            >
                              <IconComponent className="w-4 h-4 flex-shrink-0" />
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'review' && (
              <ReviewPanel 
                analysis={analysis} 
                isAnalyzing={isAnalyzing} 
                onAutoFix={applyAutoFix}
              />
            )}
            {activeTab === 'team' && (
              <TeamDashboard 
                teamMembers={teamMembers}
                onInviteToSession={inviteToSession}
                onNotification={addNotification}
              />
            )}
            {activeTab === 'live' && (
              <LiveReviewSession 
                sessionId={liveSession.id}
                codeContent={code}
                onCodeChange={setCode}
                participants={liveSession.participants}
                isActive={liveSession.isActive}
                onStartSession={startLiveSession}
                onEndSession={endLiveSession}
                onNotification={addNotification}
              />
            )}
            {activeTab === 'assignment' && (
              <ReviewerAssignment 
                teamMembers={teamMembers}
                onAssign={(reviewers) => addNotification(`Assigned reviewers: ${reviewers.join(', ')}`)}
              />
            )}
            {activeTab === 'history' && (
              <ReviewHistory 
                onExport={() => addNotification('Review history exported successfully')}
              />
            )}
            {activeTab === 'performance' && (
              <PerformancePanel 
                analysis={analysis}
                onOptimize={(suggestion) => addNotification(`Applied optimization: ${suggestion}`)}
              />
            )}
            {activeTab === 'metrics' && (
              <MetricsPanel 
                analysis={analysis}
                onMetricClick={(metric) => addNotification(`Viewing details for ${metric}`)}
              />
            )}
            {activeTab === 'rules' && (
              <CustomRulesPanel 
                onRulesChange={handleCustomRulesChange}
                onRuleTest={(result) => addNotification(`Rule test: ${result}`)}
              />
            )}
            {activeTab === 'comparison' && (
              <CodeComparison 
                analysis={analysis}
                onCopy={() => addNotification('Code copied to clipboard')}
              />
            )}
            {activeTab === 'chat' && (
              <AIChat 
                analysis={analysis} 
                code={code}
                onSuggestionApply={(suggestion) => addNotification(`Applied AI suggestion: ${suggestion}`)}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsPanel 
                onSettingChange={(setting, value) => addNotification(`${setting} updated to ${value}`)}
              />
            )}
          </div>
        </div>
      </main>

      {/* Click outside to close dropdown */}
      {showMoreMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMoreMenu(false)}
        />
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;