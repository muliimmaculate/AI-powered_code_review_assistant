import React, { useEffect, useState, useRef } from 'react';
import OrganizationRegister from './components/OrganizationRegister';
import SuperadminDashboard from './components/SuperadminDashboard';
import { Header } from './components/Header';
import { CodeInput } from './components/CodeInput';
import ReviewPanel from './components/ReviewPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { AIChat } from './components/AIChat';
import { ChevronDown, Code, Users, UserCheck, History, Settings as SettingsIcon, MessageSquare } from 'lucide-react';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import xml from 'highlight.js/lib/languages/xml';
import plaintext from 'highlight.js/lib/languages/plaintext';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('plaintext', plaintext);

function App() {
  const [orgStatus, setOrgStatus] = useState<'approved' | 'pending' | 'rejected' | null>(null);
  const [checking, setChecking] = useState(false);
  const [orgDocId, setOrgDocId] = useState(() => localStorage.getItem('orgDocId'));
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);
  const approvalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState<'review' | 'team' | 'assignment' | 'history' | 'settings' | 'chat'>('review');
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customRules, setCustomRules] = useState<any[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Language detection and analysis
  const analyzeCode = async (codeContent: string) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const detection = hljs.highlightAuto(codeContent);
      const language = detection.language || 'unknown';
      let issues: any[] = [];
      if (language === 'javascript') {
        if (codeContent.includes('var ')) {
          issues.push({ line: 1, message: 'Avoid using var', suggestion: 'Use let or const', severity: 'low' });
        }
      } else if (language === 'python') {
        if (codeContent.includes('print ')) {
          issues.push({ line: 1, message: 'Use print() function', suggestion: 'Use print()', severity: 'low' });
        }
      } else if (language === 'java') {
        if (codeContent.includes('System.out.println')) {
          issues.push({ line: 1, message: 'Avoid using System.out.println in production', suggestion: 'Use a logger', severity: 'low' });
        }
      } else {
        // Fallback: TODO/FIXME check
        issues = (codeContent.split('\n') || []).map((line, idx) => {
          if (/TODO|FIXME/.test(line)) {
            return {
              line: idx + 1,
              message: 'Found TODO or FIXME',
              suggestion: 'Resolve or remove TODO/FIXME comments',
              severity: 'medium',
            };
          }
          return null;
        }).filter(Boolean);
      }
      setAnalysis({
        language,
        issues,
        summary: issues.length ? `${issues.length} issues found.` : 'No issues found.',
      });
      setIsAnalyzing(false);
    }, 800);
  };

  // Debug output
  useEffect(() => {
    console.log('orgDocId:', orgDocId);
    console.log('orgStatus:', orgStatus);
  }, [orgDocId, orgStatus]);

  // Show SuperadminDashboard at /superadmin
  if (window.location.pathname === '/superadmin') {
    return <SuperadminDashboard />;
  }

  useEffect(() => {
    if (!orgDocId) return;
    setChecking(true);
    const orgRef = doc(db, 'pendingOrganizations', orgDocId);
    let prevStatus: string | null = null;
    const unsub = onSnapshot(orgRef, (orgSnap) => {
      if (orgSnap.exists()) {
        const newStatus = orgSnap.data().status;
        if (prevStatus === 'pending' && newStatus === 'approved') {
          setShowApprovalPopup(true);
          if (approvalTimeoutRef.current) clearTimeout(approvalTimeoutRef.current);
          approvalTimeoutRef.current = setTimeout(() => setShowApprovalPopup(false), 2000);
        }
        setOrgStatus(newStatus);
        prevStatus = newStatus;
      } else {
        setOrgStatus(null);
      }
      setChecking(false);
    });
    return () => { unsub(); if (approvalTimeoutRef.current) clearTimeout(approvalTimeoutRef.current); };
  }, [orgDocId]);

  // Handler for registration completion
  const handleRegistered = (docId: string) => {
    setOrgDocId(docId);
    setOrgStatus('pending');
  };

  if (!orgDocId) {
    return <OrganizationRegister onRegistered={handleRegistered} />;
  }

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-xl">Checking organization approval status...</div>;
  }

  if (orgStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 text-white rounded-lg p-8 w-full max-w-md shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Waiting for Approval</h2>
          <p>Your organization registration is pending approval by the superadmin. You will be notified once approved.</p>
        </div>
        {showApprovalPopup && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-lg font-semibold">
            Your organization has been approved! Redirecting...
          </div>
        )}
      </div>
    );
  }

  if (orgStatus === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 text-white rounded-lg p-8 w-full max-w-md shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Registration Rejected</h2>
          <p>Your organization registration was rejected. Please contact support or try again.</p>
          <button
            onClick={() => { localStorage.removeItem('orgDocId'); setOrgDocId(null); setOrgStatus(null); }}
            className="mt-6 px-6 py-2 bg-blue-600 rounded text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Re-register
          </button>
        </div>
      </div>
    );
  }

  if (orgStatus === 'approved') {
    // Render the full main app UI (tabs, code input, etc.)
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
    return (
      <div className="min-h-screen w-full bg-gray-900 text-white transition-colors duration-300">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8">
            {/* Left Panel - Code Input (only show for certain tabs) */}
            {['review', 'team', 'assignment', 'chat'].includes(activeTab) && (
              <div className="space-y-4 sm:space-y-6">
                <CodeInput 
                  onAnalyze={analyzeCode} 
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

  return <OrganizationRegister onRegistered={handleRegistered} />;
}

export default App;