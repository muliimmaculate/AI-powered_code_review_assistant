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

// Define Issue type for better type safety
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

// Rename Analysis to AppAnalysis to avoid type conflicts
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
  metrics: any;
  recommendations: string[];
  codeSmells: number;
  technicalDebt: string;
}

function App() {
  const [orgStatus, setOrgStatus] = useState<'approved' | 'pending' | 'rejected' | null>(null);
  const [checking, setChecking] = useState(false);
  const [orgDocId, setOrgDocId] = useState(() => localStorage.getItem('orgDocId'));
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);
  const approvalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState<'review' | 'team' | 'assignment' | 'history' | 'settings' | 'chat'>('review');
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState<AppAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customRules] = useState<unknown[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Language detection and analysis
  const analyzeCode = async (codeContent: string) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const detection = hljs.highlightAuto(codeContent);
      const language = detection.language || 'unknown';
      const lines = codeContent.split('\n');
      const linesOfCode = lines.length;
      const issues: Issue[] = [];
      let syntaxError: string | null = null;
      let functionCount = 0;
      let commentLines = 0;
      let longFunctions = 0;
      let maxNesting = 0;
      let duplicateLines = 0;
      const variableNames: string[] = [];
      let inconsistentNaming = false;
      let cyclomaticComplexity = 1;
      let deadCodeCount = 0;
      let magicNumberCount = 0;
      let duplicateBlocks = 0;
      const blockMap: { [key: string]: number } = {};
      const usedVariables = new Set<string>();
      const declaredVariables = new Set<string>();
      let inFunction = false;
      let currentFunctionLength = 0;
      let currentNesting = 0;
      let maxCurrentNesting = 0;
      const lineMap: { [key: string]: number } = {};
      let blockBuffer: string[] = [];
      // --- Syntax Error Detection ---
      if (language === 'javascript') {
        try {
          // Try parsing code
          // eslint-disable-next-line no-new-func
          new Function(codeContent);
        } catch (e: unknown) {
          const errMsg = e instanceof Error ? e.message : String(e);
          syntaxError = errMsg;
          issues.push({
            type: 'syntax',
            severity: 'critical',
            category: 'Syntax',
            message: `Syntax error: ${errMsg}`,
            line: 1,
            column: 1,
            code: '',
            suggestion: 'Fix the syntax error',
            fixedCode: '',
            confidence: 100,
            impact: 'high',
            effort: 'medium'
          });
        }
        // Unclosed string
        if ((codeContent.match(/"/g) || []).length % 2 !== 0 || (codeContent.match(/'/g) || []).length % 2 !== 0) {
          issues.push({
            type: 'syntax',
            severity: 'high',
            category: 'Syntax',
            message: 'Unclosed string detected',
            line: 1,
            column: 1,
            code: '',
            suggestion: 'Check for missing or extra quotes',
            fixedCode: '',
            confidence: 80,
            impact: 'medium',
            effort: 'easy'
          });
        }
        // Unmatched brackets
        const openBrackets = (codeContent.match(/\{/g) || []).length;
        const closeBrackets = (codeContent.match(/\}/g) || []).length;
        if (openBrackets !== closeBrackets) {
          issues.push({
            type: 'syntax',
            severity: 'high',
            category: 'Syntax',
            message: 'Unmatched curly braces',
            line: 1,
            column: 1,
            code: '',
            suggestion: 'Check for missing or extra curly braces',
            fixedCode: '',
            confidence: 80,
            impact: 'medium',
            effort: 'easy'
          });
        }
      } else if (language === 'python') {
        // Simple regex checks for common Python mistakes
        const missingColon = lines.findIndex(line => /^(def |if |elif |else:|for |while |try:|except |with |class )/.test(line) && !line.trim().endsWith(':'));
        if (missingColon !== -1) {
          syntaxError = 'Possible missing colon';
          issues.push({
            type: 'syntax',
            severity: 'critical',
            category: 'Syntax',
            message: `Possible missing colon at line ${missingColon + 1}`,
            line: missingColon + 1,
            column: 1,
            code: lines[missingColon],
            suggestion: 'Add a colon at the end of the statement',
            fixedCode: lines[missingColon] + ':',
            confidence: 90,
            impact: 'high',
            effort: 'easy'
          });
        }
        // Unclosed parentheses
        const openParens = (codeContent.match(/\(/g) || []).length;
        const closeParens = (codeContent.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
          syntaxError = 'Unmatched parentheses';
          issues.push({
            type: 'syntax',
            severity: 'critical',
            category: 'Syntax',
            message: 'Unmatched parentheses',
            line: 1,
            column: 1,
            code: '',
            suggestion: 'Check for missing or extra parentheses',
            fixedCode: '',
            confidence: 80,
            impact: 'high',
            effort: 'easy'
          });
        }
        // Unclosed string
        if ((codeContent.match(/"/g) || []).length % 2 !== 0 || (codeContent.match(/'/g) || []).length % 2 !== 0) {
          issues.push({
            type: 'syntax',
            severity: 'high',
            category: 'Syntax',
            message: 'Unclosed string detected',
            line: 1,
            column: 1,
            code: '',
            suggestion: 'Check for missing or extra quotes',
            fixedCode: '',
            confidence: 80,
            impact: 'medium',
            effort: 'easy'
          });
        }
        // Indentation error (very basic)
        for (let i = 0; i < lines.length; i++) {
          if (/^\s+/.test(lines[i]) && lines[i].length - lines[i].trimStart().length % 4 !== 0) {
            issues.push({
              type: 'syntax',
              severity: 'medium',
              category: 'Syntax',
              message: `Possible indentation error at line ${i + 1}`,
              line: i + 1,
              column: 1,
              code: lines[i],
              suggestion: 'Use consistent indentation (4 spaces)',
              fixedCode: '',
              confidence: 70,
              impact: 'medium',
              effort: 'easy'
            });
          }
        }
      } else if (language === 'java') {
        // Check for missing semicolons at end of statements (very basic)
        const missingSemicolon = lines.findIndex(line => /^(int |String |public |private |protected |return |System\.|double |float |boolean )/.test(line) && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}'));
        if (missingSemicolon !== -1) {
          syntaxError = 'Possible missing semicolon';
          issues.push({
            type: 'syntax',
            severity: 'high',
            category: 'Syntax',
            message: `Possible missing semicolon at line ${missingSemicolon + 1}`,
            line: missingSemicolon + 1,
            column: 1,
            code: lines[missingSemicolon],
            suggestion: 'Add a semicolon at the end of the statement',
            fixedCode: lines[missingSemicolon] + ';',
            confidence: 80,
            impact: 'medium',
            effort: 'easy'
          });
        }
        // Unclosed string
        if ((codeContent.match(/"/g) || []).length % 2 !== 0) {
          issues.push({
            type: 'syntax',
            severity: 'high',
            category: 'Syntax',
            message: 'Unclosed string detected',
            line: 1,
            column: 1,
            code: '',
            suggestion: 'Check for missing or extra quotes',
            fixedCode: '',
            confidence: 80,
            impact: 'medium',
            effort: 'easy'
          });
        }
        // Unmatched braces
        const openBraces = (codeContent.match(/\{/g) || []).length;
        const closeBraces = (codeContent.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
          issues.push({
            type: 'syntax',
            severity: 'high',
            category: 'Syntax',
            message: 'Unmatched curly braces',
            line: 1,
            column: 1,
            code: '',
            suggestion: 'Check for missing or extra curly braces',
            fixedCode: '',
            confidence: 80,
            impact: 'medium',
            effort: 'easy'
          });
        }
      }
      // --- Quality Metrics & Code Smells ---
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        // Comments
        if (/^\/\//.test(trimmed) || /^#/.test(trimmed)) commentLines++;
        // Function detection (very basic)
        if (/function |def |public |private |protected |static /.test(trimmed)) {
          functionCount++;
          if (currentFunctionLength > 30) longFunctions++;
          currentFunctionLength = 0;
          inFunction = true;
        }
        if (inFunction) currentFunctionLength++;
        // Nesting (count braces/indents)
        if (trimmed.endsWith('{')) currentNesting++;
        if (trimmed.endsWith('}')) currentNesting = Math.max(0, currentNesting - 1);
        if (currentNesting > maxCurrentNesting) maxCurrentNesting = currentNesting;
        // Cyclomatic complexity: count branches
        if (/\b(if|for|while|case |catch|\?|&&|\|\|)\b/.test(trimmed)) cyclomaticComplexity++;
        // Variable naming
        const varMatch = trimmed.match(/(var|let|const|int|String|double|float|boolean)\s+([a-zA-Z0-9_]+)/);
        if (varMatch) {
          variableNames.push(varMatch[2]);
          declaredVariables.add(varMatch[2]);
        }
        // Used variables (simple)
        (trimmed.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g) || []).forEach(name => {
          if (name.length > 1 && !['if','for','let','var','const','int','String','double','float','boolean','function','return','else','while','case','catch','public','private','protected','static','class','def','import','from','as','new','try','except','with','print','System','out','println'].includes(name)) {
            usedVariables.add(name);
          }
        });
        // Duplicate lines
        if (trimmed && lineMap[trimmed]) duplicateLines++;
        lineMap[trimmed] = (lineMap[trimmed] || 0) + 1;
        // Magic numbers
        if (/\b\d+\b/.test(trimmed) && !/^\s*(const|let|var|int|float|double|#|\/\/)/.test(trimmed)) {
          magicNumberCount++;
        }
        // Duplicate code blocks (3+ lines)
        blockBuffer.push(trimmed);
        if (blockBuffer.length > 3) blockBuffer.shift();
        if (blockBuffer.length === 3 && blockBuffer.every(l => l.length > 0)) {
          const blockKey = blockBuffer.join('\n');
          blockMap[blockKey] = (blockMap[blockKey] || 0) + 1;
          if (blockMap[blockKey] === 2) duplicateBlocks++;
        }
      });
      maxNesting = maxCurrentNesting;
      // Naming consistency
      if (variableNames.length > 1) {
        const camel = variableNames.filter(n => /[a-z][A-Z]/.test(n)).length;
        const snake = variableNames.filter(n => /_/.test(n)).length;
        if (camel > 0 && snake > 0) inconsistentNaming = true;
      }
      // Dead code: declared but unused variables
      declaredVariables.forEach(v => {
        if (!usedVariables.has(v)) deadCodeCount++;
      });
      // --- Recommendations ---
      const recommendations: string[] = [];
      if (syntaxError) {
        recommendations.push('Fix all syntax errors before running the code.');
      }
      if (longFunctions > 0) {
        recommendations.push('Split long functions into smaller, focused ones.');
      }
      if (maxNesting > 3) {
        recommendations.push('Reduce nesting for better readability.');
      }
      if (duplicateLines > 0) {
        recommendations.push('Remove duplicate lines of code.');
      }
      if (duplicateBlocks > 0) {
        recommendations.push('Refactor duplicate code blocks into functions.');
      }
      if (inconsistentNaming) {
        recommendations.push('Use consistent variable naming (camelCase or snake_case, not both).');
      }
      if (functionCount === 0) {
        recommendations.push('Consider organizing code into functions for better structure.');
      }
      if (commentLines / linesOfCode < 0.05) {
        recommendations.push('Add more comments to explain complex logic.');
      }
      if (deadCodeCount > 0) {
        recommendations.push('Remove unused variables or functions (dead code).');
      }
      if (magicNumberCount > 0) {
        recommendations.push('Replace magic numbers with named constants.');
      }
      // Suggest adding tests if no test-like function is found
      if (!/test|spec|assert|expect/.test(codeContent)) {
        recommendations.push('Consider adding tests to improve code reliability.');
      }
      if (recommendations.length === 0) {
        recommendations.push('Code looks good! Keep following best practices.');
      }
      // --- Metrics ---
      const metrics = {
        complexity: Math.min(100, maxNesting * 20 + longFunctions * 10 + (duplicateLines > 0 ? 10 : 0) + cyclomaticComplexity * 5),
        maintainability: Math.max(20, 100 - (longFunctions * 10 + maxNesting * 5 + (duplicateLines > 0 ? 10 : 0) + duplicateBlocks * 10)),
        readability: Math.max(30, 100 - (maxNesting * 10 + longFunctions * 5 + duplicateBlocks * 10)),
        performance: 100,
        security: 100,
        documentation: Math.round((commentLines / linesOfCode) * 100),
        cyclomaticComplexity,
        cognitiveComplexity: maxNesting + longFunctions,
        linesOfCode,
        duplicateLines,
        testCoverage: 0 // Not detected
      };
      const score = Math.max(0, 100 - (issues.length * 10) - (longFunctions * 5) - (maxNesting * 3) - (duplicateLines * 2) - (duplicateBlocks * 5) - (deadCodeCount * 2) - (magicNumberCount * 2));
      const summary = {
        totalIssues: issues.length,
        criticalIssues: issues.filter(i => i.severity === 'critical').length,
        highIssues: issues.filter(i => i.severity === 'high').length,
        mediumIssues: issues.filter(i => i.severity === 'medium').length,
        lowIssues: issues.filter(i => i.severity === 'low').length,
        securityIssues: issues.filter(i => i.category === 'Security').length,
        performanceIssues: issues.filter(i => i.category === 'Performance').length,
        qualityIssues: issues.filter(i => i.category === 'Code Quality').length
      };
      setAnalysis({
        language,
        score,
        issues,
        summary,
        metrics,
        recommendations,
        codeSmells: longFunctions + (maxNesting > 3 ? 1 : 0) + (duplicateLines > 0 ? 1 : 0) + duplicateBlocks + deadCodeCount + magicNumberCount,
        technicalDebt: `Estimated ${(issues.length * 0.5 + longFunctions * 0.2 + maxNesting * 0.1 + duplicateBlocks * 0.2 + deadCodeCount * 0.1 + magicNumberCount * 0.1).toFixed(1)} hours to resolve all issues. Priority: ${issues.length > 5 ? 'High' : issues.length > 2 ? 'Medium' : 'Low'}`
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
                          onClick={() => setActiveTab(tab.id as unknown as 'review' | 'team' | 'assignment' | 'history' | 'settings' | 'chat')}
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
                                onClick={() => { setActiveTab(tab.id as unknown as 'review' | 'team' | 'assignment' | 'history' | 'settings' | 'chat'); setShowMoreMenu(false); }}
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
                  analysis={analysis ? { ...analysis, overallScore: analysis.score } : null} 
                  isAnalyzing={isAnalyzing} 
                  onAutoFix={() => {}}
                  sessionId={''}
                />
              )}
              {activeTab === 'chat' && (
                <AIChat analysis={analysis ? { ...analysis, score: analysis.score } : null} code={code} />
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