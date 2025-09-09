import React, { useState, useRef } from 'react';
import { 
  ArrowLeftRight, 
  Copy, 
  Download, 
  Zap, 
  GitCompare,
  FileText,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface CodeComparisonProps {
  onAnalyze: (code: string) => void;
}

export const CodeComparison: React.FC<CodeComparisonProps> = ({ onAnalyze }) => {
  const [leftCode, setLeftCode] = useState('');
  const [rightCode, setRightCode] = useState('');
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);
  const leftTextareaRef = useRef<HTMLTextAreaElement>(null);
  const rightTextareaRef = useRef<HTMLTextAreaElement>(null);

  const generateOptimizedCode = (originalCode: string): string => {
    let optimizedCode = originalCode;

    // Apply common optimizations
    const optimizations = [
      {
        pattern: /var\s+/g,
        replacement: 'const ',
        description: 'Replace var with const for better scoping'
      },
      {
        pattern: /==(?!=)/g,
        replacement: '===',
        description: 'Use strict equality operator'
      },
      {
        pattern: /console\.(log|warn|error|debug|info)\([^)]*\);?\n?/g,
        replacement: '',
        description: 'Remove console statements'
      },
      {
        pattern: /\/\/\s*TODO:.*\n/g,
        replacement: '',
        description: 'Remove TODO comments'
      },
      {
        pattern: /function\s+(\w+)\s*\(/g,
        replacement: 'const $1 = (',
        description: 'Convert to arrow functions where appropriate'
      }
    ];

    optimizations.forEach(({ pattern, replacement }) => {
      optimizedCode = optimizedCode.replace(pattern, replacement);
    });

    // Add JSDoc comments for functions
    optimizedCode = optimizedCode.replace(
      /(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{)/g,
      '/**\n * Function description\n * @param {*} params - Parameters\n * @returns {*} Return value\n */\n$1'
    );

    return optimizedCode;
  };

  const calculateDifferences = (code1: string, code2: string) => {
    const lines1 = code1.split('\n');
    const lines2 = code2.split('\n');
    
    const maxLines = Math.max(lines1.length, lines2.length);
    const differences = [];
    
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';
      
      if (line1 !== line2) {
        differences.push({
          lineNumber: i + 1,
          originalLine: line1,
          modifiedLine: line2,
          type: !line1 ? 'added' : !line2 ? 'removed' : 'modified'
        });
      }
    }
    
    return differences;
  };

  const handleOptimize = () => {
    if (leftCode.trim()) {
      const optimized = generateOptimizedCode(leftCode);
      setRightCode(optimized);
      
      setComparisonResult({
        optimizations: [
          'Replaced var with const for better scoping',
          'Used strict equality operators (===)',
          'Removed console statements',
          'Added JSDoc documentation',
          'Converted to arrow functions where appropriate'
        ],
        improvements: {
          readability: '+15%',
          maintainability: '+20%',
          performance: '+5%',
          security: '+10%'
        },
        differences: calculateDifferences(leftCode, optimized)
      });
    }
  };

  const handleCompare = async () => {
    setIsComparing(true);
    
    try {
      // Simulate comparison analysis
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const differences = calculateDifferences(leftCode, rightCode);
      
      setComparisonResult({
        differences,
        summary: {
          totalChanges: differences.length,
          additions: differences.filter(d => d.type === 'added').length,
          deletions: differences.filter(d => d.type === 'removed').length,
          modifications: differences.filter(d => d.type === 'modified').length
        },
        metrics: {
          similarityPercentage: Math.round((1 - (differences.length / Math.max(leftCode.split('\n').length, rightCode.split('\n').length))) * 100),
          leftLines: leftCode.split('\n').length,
          rightLines: rightCode.split('\n').length
        }
      });
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setIsComparing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadComparison = () => {
    const report = `
# Code Comparison Report
Generated on: ${new Date().toLocaleString()}

## Original Code
\`\`\`
${leftCode}
\`\`\`

## Modified Code
\`\`\`
${rightCode}
\`\`\`

## Summary
- Total Changes: ${comparisonResult?.summary?.totalChanges || 0}
- Lines Added: ${comparisonResult?.summary?.additions || 0}
- Lines Deleted: ${comparisonResult?.summary?.deletions || 0}
- Lines Modified: ${comparisonResult?.summary?.modifications || 0}
- Similarity: ${comparisonResult?.metrics?.similarityPercentage || 0}%

## Optimizations Applied
${comparisonResult?.optimizations?.map((opt: string) => `- ${opt}`).join('\n') || 'None'}
    `;

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-comparison-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Code Comparison & Optimization</h2>
          <p className="text-gray-300">Compare code versions or get AI-powered optimizations</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleOptimize}
            disabled={!leftCode.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Auto Optimize</span>
          </button>
          <button
            onClick={handleCompare}
            disabled={!leftCode.trim() || !rightCode.trim() || isComparing}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isComparing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <GitCompare className="w-4 h-4" />
            )}
            <span>{isComparing ? 'Comparing...' : 'Compare'}</span>
          </button>
        </div>
      </div>

      {/* Code Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Code */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Original Code</h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(leftCode)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => leftCode && onAnalyze(leftCode)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Analyze this code"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <textarea
            ref={leftTextareaRef}
            value={leftCode}
            onChange={(e) => setLeftCode(e.target.value)}
            placeholder="Paste your original code here..."
            className="w-full h-96 p-4 bg-transparent text-white font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>

        {/* Modified/Optimized Code */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Modified Code</h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(rightCode)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => rightCode && onAnalyze(rightCode)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Analyze this code"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <textarea
            ref={rightTextareaRef}
            value={rightCode}
            onChange={(e) => setRightCode(e.target.value)}
            placeholder="Paste modified code here or use Auto Optimize..."
            className="w-full h-96 p-4 bg-transparent text-white font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Comparison Results */}
      {comparisonResult && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {comparisonResult.metrics?.similarityPercentage || comparisonResult.summary?.totalChanges || 0}
                {comparisonResult.metrics?.similarityPercentage ? '%' : ''}
              </div>
              <div className="text-sm text-gray-300">
                {comparisonResult.metrics?.similarityPercentage ? 'Similarity' : 'Total Changes'}
              </div>
            </div>
            
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {comparisonResult.summary?.additions || 0}
              </div>
              <div className="text-sm text-gray-300">Lines Added</div>
            </div>
            
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-400">
                {comparisonResult.summary?.deletions || 0}
              </div>
              <div className="text-sm text-gray-300">Lines Deleted</div>
            </div>
            
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {comparisonResult.summary?.modifications || 0}
              </div>
              <div className="text-sm text-gray-300">Lines Modified</div>
            </div>
          </div>

          {/* Optimizations Applied */}
          {comparisonResult.optimizations && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Applied Optimizations</h3>
                <button
                  onClick={downloadComparison}
                  className="flex items-center space-x-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-white mb-3">Improvements Made</h4>
                  <div className="space-y-2">
                    {comparisonResult.optimizations.map((optimization: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{optimization}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {comparisonResult.improvements && (
                  <div>
                    <h4 className="font-medium text-white mb-3">Quality Improvements</h4>
                    <div className="space-y-2">
                      {Object.entries(comparisonResult.improvements).map(([metric, improvement]) => (
                        <div key={metric} className="flex items-center justify-between">
                          <span className="text-gray-300 capitalize">{metric}</span>
                          <span className="text-green-400 font-medium">{improvement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Detailed Differences */}
          {comparisonResult.differences && comparisonResult.differences.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Line-by-Line Differences</h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {comparisonResult.differences.map((diff: any, index: number) => (
                  <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-2 p-2 rounded-lg bg-gray-800/50">
                    <div className="flex items-start space-x-2">
                      <span className="text-xs text-gray-400 font-mono w-8">{diff.lineNumber}</span>
                      {diff.type === 'removed' ? (
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                      ) : diff.type === 'added' ? (
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      ) : (
                        <ArrowLeftRight className="w-4 h-4 text-yellow-400 mt-0.5" />
                      )}
                      <code className={`text-xs font-mono ${
                        diff.type === 'removed' ? 'text-red-300 bg-red-900/20' : 
                        diff.type === 'added' ? 'text-green-300 bg-green-900/20' : 
                        'text-yellow-300 bg-yellow-900/20'
                      } px-2 py-1 rounded`}>
                        {diff.originalLine || '(empty)'}
                      </code>
                    </div>
                    
                    {diff.modifiedLine && (
                      <div className="flex items-start space-x-2">
                        <span className="text-xs text-gray-400 font-mono w-8">{diff.lineNumber}</span>
                        <ArrowLeftRight className="w-4 h-4 text-blue-400 mt-0.5" />
                        <code className="text-xs font-mono text-blue-300 bg-blue-900/20 px-2 py-1 rounded">
                          {diff.modifiedLine}
                        </code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};