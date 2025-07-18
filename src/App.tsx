import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { CodeInput } from './components/CodeInput';
import { ReviewPanel } from './components/ReviewPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { AIChat } from './components/AIChat';
import { ChevronDown, Code, Users, UserCheck, History, Settings as SettingsIcon, MessageSquare } from 'lucide-react';

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
}

interface LiveSession {
  id: string;
  participants: TeamMember[];
  isActive: boolean;
}

// ErrorBoundary for catching errors in tab content
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, info: any) { console.error(error, info); }
  render() {
    if (this.state.hasError) {
      return <div className="bg-red-900 text-white p-8 rounded-lg text-center">Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}

// Custom hook for notifications
function useNotifications() {
  const [notifications, setNotifications] = useState<string[]>([]);

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev.slice(-4), message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  return { notifications, addNotification };
}

function App() {
  const [activeTab, setActiveTab] = useState<'review' | 'team' | 'assignment' | 'history' | 'settings' | 'chat'>('review');
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customRules, setCustomRules] = useState<any[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const approvalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Define all tabs with their properties
  const allTabs = [
    { id: 'review', label: 'Review', icon: Code, primary: true },
    { id: 'team', label: 'Team', icon: Users, primary: true },
    { id: 'assignment', label: 'Assign', icon: UserCheck, primary: false },
    { id: 'history', label: 'History', icon: History, primary: false },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare, primary: false },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, primary: false }
  ];
  const primaryTabs = allTabs.filter(tab => tab.primary);
  const secondaryTabs = allTabs.filter(tab => !tab.primary);

  // Main app UI
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white transition-colors duration-300">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8">
          {/* Left Panel - Code Input (only show for certain tabs) */}
          {['review', 'team', 'assignment', 'chat'].includes(activeTab) && (
            <div className="space-y-4 sm:space-y-6">
              <CodeInput 
                onAnalyze={() => {}} 
                isAnalyzing={isAnalyzing}
                code={code}
                setCode={setCode}
              />
            </div>
          )}
          {/* Right Panel - Analysis Results */}
          <div className={`space-y-4 sm:space-y-6 ${
            !['review', 'team', 'assignment', 'chat'].includes(activeTab) 
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
                        onClick={() => setActiveTab(tab.id as any)}
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
                      secondaryTabs.find(tab => activeTab === tab.id)
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <span>More</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showMoreMenu ? 'rotate-180' : ''}`} />
                  </button>
                  {showMoreMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                      <div className="py-1">
                        {secondaryTabs.map(tab => {
                          const IconComponent = tab.icon;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => { setActiveTab(tab.id as any); setShowMoreMenu(false); }}
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
                {/* Click outside to close dropdown */}
                {showMoreMenu && (
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowMoreMenu(false)}
                  />
                )}
              </div>
            </div>
            {/* Tab Content */}
            {activeTab === 'review' && (
              <ReviewPanel 
                analysis={analysis} 
                isAnalyzing={isAnalyzing} 
                onAutoFix={() => {}}
                sessionId={''}
              />
            )}
            {activeTab === 'chat' && (
              <AIChat analysis={analysis} code={code} />
            )}
            {activeTab === 'settings' && (
              <SettingsPanel
                customRules={customRules}
                onRulesChange={() => {}}
                settings={{
                  autoAnalysis: true,
                  notifications: true,
                  strictMode: false,
                  theme: 'dark',
                  language: 'javascript'
                }}
                onSettingsChange={() => {}}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;