import { useState } from 'react';
import { CodeInput } from './components/CodeInput';
import ReviewPanel from './components/ReviewPanel';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import xml from 'highlight.js/lib/languages/xml';
import plaintext from 'highlight.js/lib/languages/plaintext';
import typescript from 'highlight.js/lib/languages/typescript';
import css from 'highlight.js/lib/languages/css';
import markdown from 'highlight.js/lib/languages/markdown';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('css', css);
hljs.registerLanguage('markdown', markdown);
import { ENDPOINTS } from './config';

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

// Analysis interface
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

function App() {
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState<AppAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Language detection and analysis function
  const analyzeCode = async (codeContent: string) => {
    setIsAnalyzing(true);
    const detection = hljs.highlightAuto(codeContent);
    const language = detection.language || 'unknown';

    // Try precise backend analyzer first for supported languages
    if (["javascript", "typescript", "html", "xml", "json", "yaml", "yml", "python", "java", "c", "cpp", "c++"].includes(language)) {
      try {
        const resp = await fetch(ENDPOINTS.analyzeCode, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: codeContent, language }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Failed to analyze code');
        const backend = data.analysis;
        setAnalysis({
          language: backend.language,
          score: backend.overallScore,
          issues: backend.issues,
          summary: backend.summary,
          metrics: backend.metrics,
          recommendations: backend.recommendations || [],
          codeSmells: backend.codeSmells || 0,
          technicalDebt: backend.technicalDebt || '',
        });
        setIsAnalyzing(false);
        return;
      } catch (e) {
        console.error('Precise analysis failed, using heuristic fallback:', e);
      }
    }

    setTimeout(() => {
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
      let magicNumberCount = 0;
      const duplicateBlocks = 0;
      const declaredVariables = new Set<string>();
      let inFunction = false;
      let currentFunctionLength = 0;
      let currentNesting = 0;
      let maxCurrentNesting = 0;
      const lineMap: { [key: string]: number } = {};
      

      // Language-specific syntax checks
      if (language === 'javascript') {
        try {
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

        // Security checks
        if (/\beval\s*\(/.test(codeContent) || /new\s+Function\s*\(/.test(codeContent)) {
          issues.push({
            type: 'security',
            severity: 'critical',
            category: 'Security',
            message: 'Use of eval or Function constructor detected',
            line: 1,
            column: 1,
            code: '',
            suggestion: 'Avoid using eval or Function constructor for security reasons',
            fixedCode: '',
            confidence: 95,
            impact: 'high',
            effort: 'high'
          });
        }

        if (/password\s*=\s*['"].+['"]/i.test(codeContent) || /api[_-]?key\s*=\s*['"].+['"]/i.test(codeContent)) {
          issues.push({
            type: 'security',
            severity: 'high',
            category: 'Security',
            message: 'Possible hardcoded credential detected',
            line: 1,
            column: 1,
            code: '',
            suggestion: 'Do not hardcode credentials in code',
            fixedCode: '',
            confidence: 90,
            impact: 'high',
            effort: 'high'
          });
        }
      }

      // Advanced code quality checks

      lines.forEach((line) => {
        const trimmed = line.trim();

        // Function detection
        const funcMatch = trimmed.match(/(function|def|public |private |protected |static )\s*([a-zA-Z0-9_]+)?\s*\(([^)]*)\)/);
        if (funcMatch) {
          if (!inFunction) {
            functionCount++;
          }
          currentFunctionLength = 0;
          inFunction = true;
        }

        if (inFunction) currentFunctionLength++;

        // End of function
        if (inFunction && trimmed === '}') {
          if (currentFunctionLength > 30) longFunctions++;
          inFunction = false;
        }

        // Comments
        if (/^\/\//.test(trimmed) || /^#/.test(trimmed)) commentLines++;

        // Nesting
        if (trimmed.endsWith('{')) currentNesting++;
        if (trimmed.endsWith('}')) currentNesting = Math.max(0, currentNesting - 1);
        if (currentNesting > maxCurrentNesting) maxCurrentNesting = currentNesting;

        // Cyclomatic complexity
        if (/\b(if|for|while|case |catch|\?|&&|\|\|)\b/.test(trimmed)) cyclomaticComplexity++;

        // Variable naming
        const varMatch = trimmed.match(/(var|let|const|int|String|double|float|boolean)\s+([a-zA-Z0-9_]+)/);
        if (varMatch) {
          variableNames.push(varMatch[2]);
          declaredVariables.add(varMatch[2]);
        }

        // Duplicate lines
        if (trimmed && lineMap[trimmed]) duplicateLines++;
        lineMap[trimmed] = (lineMap[trimmed] || 0) + 1;

        // Magic numbers
        if (/\b\d+\b/.test(trimmed) && !/^\s*(const|let|var|int|float|double|#|\/\/)/.test(trimmed)) {
          magicNumberCount++;
        }
      });

      maxNesting = maxCurrentNesting;

      // Naming consistency
      if (variableNames.length > 1) {
        const camel = variableNames.filter(n => /[a-z][A-Z]/.test(n)).length;
        const snake = variableNames.filter(n => /_/.test(n)).length;
        if (camel > 0 && snake > 0) inconsistentNaming = true;
      }

      // Generate recommendations
      const recommendations: string[] = [];
      if (syntaxError) recommendations.push('Fix all syntax errors before running the code.');
      if (longFunctions > 0) recommendations.push('Split long functions into smaller, focused ones.');
      if (maxNesting > 3) recommendations.push('Reduce nesting for better readability.');
      if (duplicateLines > 0) recommendations.push('Remove duplicate lines of code.');
      if (inconsistentNaming) recommendations.push('Use consistent variable naming (camelCase or snake_case).');
      if (functionCount === 0) recommendations.push('Consider organizing code into functions for better structure.');
      if (commentLines / linesOfCode < 0.05) recommendations.push('Add more comments to explain complex logic.');
      if (magicNumberCount > 0) recommendations.push('Replace magic numbers with named constants.');
      if (issues.some(i => i.type === 'security')) recommendations.push('Address all security issues immediately.');
      if (recommendations.length === 0) recommendations.push('Code looks good! Keep following best practices.');

      // Calculate metrics
      const metrics = {
        complexity: Math.min(100, maxNesting * 20 + longFunctions * 10 + cyclomaticComplexity * 5),
        maintainability: Math.max(20, 100 - (longFunctions * 10 + maxNesting * 5 + duplicateBlocks * 10)),
        readability: Math.max(30, 100 - (maxNesting * 10 + longFunctions * 5 + duplicateBlocks * 10)),
        performance: 100,
        security: 100,
        documentation: Math.round((commentLines / linesOfCode) * 100),
        cyclomaticComplexity,
        cognitiveComplexity: maxNesting + longFunctions,
        linesOfCode,
        duplicateLines,
        testCoverage: 0
      };

      const score = Math.max(0, 100 - (issues.length * 10) - (longFunctions * 5) - (maxNesting * 3) - (duplicateLines * 2));

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
        codeSmells: longFunctions + (maxNesting > 3 ? 1 : 0) + (duplicateLines > 0 ? 1 : 0),
        technicalDebt: `Estimated ${(issues.length * 0.5 + longFunctions * 0.2 + maxNesting * 0.1).toFixed(1)} hours to resolve all issues.`
      });
      setIsAnalyzing(false);
    }, 800);
  };

  // Send email with analysis results via Cloud Function
  const sendAnalysisEmail = async () => {
    if (!analysis || !email) return;

    setIsSending(true);
    setEmailError('');
    setEmailSent(false);

    try {
      // Format analysis results for email
      const emailContent = `
Code Analysis Results
=====================

Language: ${analysis.language}
Overall Score: ${analysis.score}/100
Lines of Code: ${analysis.metrics.linesOfCode}

Summary:
- Total Issues: ${analysis.summary.totalIssues}
- Critical Issues: ${analysis.summary.criticalIssues}
- High Issues: ${analysis.summary.highIssues}
- Medium Issues: ${analysis.summary.mediumIssues}
- Security Issues: ${analysis.summary.securityIssues}

Metrics:
- Complexity: ${analysis.metrics.complexity}
- Maintainability: ${analysis.metrics.maintainability}
- Readability: ${analysis.metrics.readability}
- Documentation: ${analysis.metrics.documentation}%

Issues Found:
${analysis.issues.map(issue => `
- ${issue.severity.toUpperCase()}: ${issue.message}
  Category: ${issue.category}
  Suggestion: ${issue.suggestion}
`).join('')}

Recommendations:
${analysis.recommendations.map(rec => `- ${rec}`).join('\n')}

Technical Debt: ${analysis.technicalDebt}
      `.trim();

      const resp = await fetch(ENDPOINTS.sendAnalysisReport, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          subject: 'Code Analysis Results',
          content: emailContent,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error((data && data.error) || 'Failed to send analysis report');
      }
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);
    } catch (error) {
      setEmailError('Failed to send email. Please try again.');
      console.error('Email error:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center">Code Analyzer</h1>
          <p className="text-gray-400 text-center mt-2">Analyze your code for quality, security, and best practices</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Panel - Code Input */}
          <div className="space-y-6">
            <CodeInput 
              onAnalyze={analyzeCode} 
              isAnalyzing={isAnalyzing}
              code={code}
              setCode={setCode}
            />

            {/* Email Section */}
            {analysis && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Results
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={sendAnalysisEmail}
                    disabled={!email || isSending}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Analysis
                      </>
                    )}
                  </button>
                  
                  {emailSent && (
                    <div className="flex items-center text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Analysis sent successfully!
                    </div>
                  )}
                  
                  {emailError && (
                    <div className="flex items-center text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {emailError}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Analysis Results */}
          <div className="space-y-6">
            <ReviewPanel 
              analysis={analysis ? { ...analysis, overallScore: analysis.score } : null} 
              isAnalyzing={isAnalyzing} 
              onAutoFix={() => {}}
              sessionId={''}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;