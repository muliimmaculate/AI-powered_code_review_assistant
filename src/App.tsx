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

    // Try precise backend analyzer for supported languages
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
        console.error('Precise analysis failed:', e);
        setIsAnalyzing(false);
        window.alert('Analysis failed. Please try again or reduce file size.');
        return;
      }
    }

    // Unsupported language
    setIsAnalyzing(false);
    window.alert('Unsupported language for precise analysis.');
    return;
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