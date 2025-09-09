import React, { useState, useEffect } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { CodeInput } from './CodeInput';
import ReviewPanel from './ReviewPanel';
import { SettingsPanel } from './SettingsPanel';
import { AIChat } from './AIChat';
import { ReviewHistory } from './ReviewHistory';
import TeamDashboard from './TeamDashboard';
import { UserProfile } from './GoogleAuth';
import { CodeDashboard } from './CodeDashboard';
import { CodeComparison } from './CodeComparison';
import { 
  ChevronDown, 
  Code, 
  Users, 
  History, 
  Settings as SettingsIcon, 
  MessageSquare,
  Star,
  Zap,
  Shield,
  FileText,
  TrendingUp,
  Award,
  Clock,
  Download,
  Share2
} from 'lucide-react';

interface Issue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  message: string;
  line: number;
  column: number;
  code: string;
  suggestion: string;
  fixedCode: string;
  confidence: number;
  impact: string;
  effort: string;
}

interface AppAnalysis {
  language: string;
  score: number;
  issues: Issue[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    securityIssues: number;
    performanceIssues: number;
    qualityIssues: number;
  };
  metrics: {
    complexity: number;
    maintainability: number;
    readability: number;
    performance: number;
    security: number;
    documentation: number;
    cyclomaticComplexity: number;
    cognitiveComplexity: number;
    linesOfCode: number;
    duplicateLines: number;
    testCoverage: number;
  };
  recommendations: string[];
  codeSmells: number;
  technicalDebt: string;
}

interface HomePageProps {
  user: User;
}

export const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'review' | 'team' | 'history' | 'settings' | 'chat' | 'dashboard' | 'compare'>('review');
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState<AppAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<AppAnalysis[]>([]);

  // Advanced code analysis function with AI-powered insights
  const analyzeCode = async (codeContent: string) => {
    setIsAnalyzing(true);
    
    try {
      // Use the advanced code analyzer
      const { codeAnalyzer } = await import('../services/codeAnalysis');
      const result = await codeAnalyzer.analyzeCode(codeContent);
      
      // Convert to AppAnalysis format
      const newAnalysis: AppAnalysis = {
        language: result.language,
        score: result.score,
        issues: result.issues,
        summary: result.summary,
        metrics: result.metrics,
        recommendations: result.recommendations,
        codeSmells: result.codeSmells,
        technicalDebt: result.technicalDebt
      };
      
      setAnalysis(newAnalysis);
      setAnalysisHistory(prev => [newAnalysis, ...prev.slice(0, 9)]); // Keep last 10 analyses
      
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback to basic analysis if advanced fails
      const basicAnalysis: AppAnalysis = {
        language: 'unknown',
        score: 75,
        issues: [],
        summary: {
          totalIssues: 0,
          criticalIssues: 0,
          highIssues: 0,
          mediumIssues: 0,
          lowIssues: 0,
          securityIssues: 0,
          performanceIssues: 0,
          qualityIssues: 0
        },
        metrics: {
          complexity: 1,
          maintainability: 75,
          readability: 75,
          performance: 75,
          security: 75,
          documentation: 25,
          cyclomaticComplexity: 1,
          cognitiveComplexity: 1,
          linesOfCode: codeContent.split('\n').length,
          duplicateLines: 0,
          testCoverage: 0
        },
        recommendations: ['Analysis failed - please try again'],
        codeSmells: 0,
        technicalDebt: 'Unable to calculate technical debt'
      };
      setAnalysis(basicAnalysis);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const exportResults = () => {
    if (analysis) {
      const results = {
        timestamp: new Date().toISOString(),
        user: user.displayName || user.email,
        analysis
      };
      const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `code-review-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const shareResults = async () => {
    if (analysis && navigator.share) {
      try {
        await navigator.share({
          title: 'Code Review Results',
          text: `Code review completed with score: ${analysis.score}%`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    }
  };

  const allTabs = [
    { id: 'review', label: 'Review', icon: Code, primary: true },
    { id: 'team', label: 'Team', icon: Users, primary: true },
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, primary: false },
    { id: 'compare', label: 'Compare', icon: Share2, primary: false },
    { id: 'history', label: 'History', icon: History, primary: false },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare, primary: false },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, primary: false }
  ];

  const primaryTabs = allTabs.filter(tab => tab.primary);
  const secondaryTabs = allTabs.filter(tab => !tab.primary);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Code Review</h1>
                <p className="text-sm text-gray-300">Powered by Advanced AI</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {analysis && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={exportResults}
                    className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Export Results"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={shareResults}
                    className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Share Results"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              )}
              <UserProfile user={user} onSignOut={handleSignOut} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Dashboard */}
        {analysisHistory.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(analysisHistory.reduce((acc, a) => acc + a.score, 0) / analysisHistory.length)}%
                  </p>
                  <p className="text-sm text-gray-300">Avg Score</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{analysisHistory.length}</p>
                  <p className="text-sm text-gray-300">Reviews</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {analysisHistory.reduce((acc, a) => acc + a.summary.criticalIssues, 0)}
                  </p>
                  <p className="text-sm text-gray-300">Critical Issues</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {analysisHistory.reduce((acc, a) => acc + a.metrics.linesOfCode, 0)}
                  </p>
                  <p className="text-sm text-gray-300">Lines Analyzed</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Panel - Code Input */}
          {['review', 'team', 'chat', 'compare'].includes(activeTab) && (
            <div className="space-y-6">
              {activeTab !== 'compare' ? (
                <CodeInput 
                  onAnalyze={analyzeCode} 
                  isAnalyzing={isAnalyzing}
                  code={code}
                  setCode={setCode}
                />
              ) : (
                <CodeComparison onAnalyze={analyzeCode} />
              )}
            </div>
          )}

          {/* Right Panel - Analysis Results */}
          <div className={`space-y-6 ${
            !['review', 'team', 'chat', 'compare'].includes(activeTab) 
              ? 'xl:col-span-2' 
              : ''
          }`}>
            {/* Enhanced Tab Navigation */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-1">
              <div className="flex items-center">
                {/* Primary Tabs */}
                <div className="flex flex-1 min-w-0">
                  {primaryTabs.map(tab => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 min-w-0 flex-1 justify-center ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
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
                    className={`flex items-center space-x-1 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      secondaryTabs.find(tab => activeTab === tab.id)
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>More</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showMoreMenu ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showMoreMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800/95 backdrop-blur-md border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
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
              </div>
            </div>

            {/* Click outside to close dropdown */}
            {showMoreMenu && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowMoreMenu(false)}
              />
            )}

            {/* Tab Content */}
            <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden ${
              activeTab === 'compare' ? 'xl:col-span-2' : ''
            }`}>
              {activeTab === 'review' && (
                <ReviewPanel 
                  analysis={analysis ? { ...analysis, overallScore: analysis.score } : null} 
                  isAnalyzing={isAnalyzing} 
                  onAutoFix={() => {}}
                  sessionId={`session-${Date.now()}`}
                />
              )}
              {activeTab === 'team' && <TeamDashboard />}
              {activeTab === 'dashboard' && <CodeDashboard analysisHistory={analysisHistory} />}
              {activeTab === 'compare' && (
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Code Comparison Results</h3>
                  <p className="text-gray-300">Use the comparison tool on the left to compare different versions of your code.</p>
                </div>
              )}
              {activeTab === 'history' && <ReviewHistory />}
              {activeTab === 'settings' && (
                <SettingsPanel
                  customRules={[]}
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
              {activeTab === 'chat' && (
                <AIChat analysis={analysis ? { ...analysis, score: analysis.score } : null} code={code} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};