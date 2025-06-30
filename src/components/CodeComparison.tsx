import React, { useState } from 'react';
import { GitCompare, Copy, Download, RotateCcw, Check } from 'lucide-react';

interface Analysis {
  score: number;
  originalCode: string;
  fixedCode?: string;
}

interface CodeComparisonProps {
  analysis: Analysis | null;
}

export const CodeComparison: React.FC<CodeComparisonProps> = ({ analysis }) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [copied, setCopied] = useState<'original' | 'fixed' | null>(null);

  if (!analysis) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center py-12">
          <GitCompare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Comparison Available</h3>
          <p className="text-gray-500">Analyze your code to see before/after comparison</p>
        </div>
      </div>
    );
  }

  if (!analysis.fixedCode) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center py-12">
          <GitCompare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Fixes Applied</h3>
          <p className="text-gray-500">Apply auto-fixes to see the comparison</p>
        </div>
      </div>
    );
  }

  const copyToClipboard = async (text: string, type: 'original' | 'fixed') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLineNumbers = (code: string) => {
    return code.split('\n').map((_, index) => index + 1);
  };

  const originalLines = analysis.originalCode.split('\n');
  const fixedLines = analysis.fixedCode.split('\n');
  const maxLines = Math.max(originalLines.length, fixedLines.length);

  return (
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <GitCompare className="w-5 h-5 text-white" />
          <h2 className="text-lg font-semibold text-white">Code Comparison</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                viewMode === 'side-by-side'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Side by Side
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                viewMode === 'unified'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Unified
            </button>
          </div>
          
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              showLineNumbers
                ? 'bg-gray-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:text-white'
            }`}
          >
            Line Numbers
          </button>
        </div>
      </div>

      {viewMode === 'side-by-side' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Original Code */}
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-red-900/20 border-b border-red-700/30">
              <h3 className="text-sm font-medium text-red-300 flex items-center space-x-2">
                <RotateCcw className="w-4 h-4" />
                <span>Original Code</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(analysis.originalCode, 'original')}
                  className="p-1 text-red-300 hover:text-red-200 transition-colors"
                  title="Copy original code"
                >
                  {copied === 'original' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => downloadCode(analysis.originalCode, 'original-code.txt')}
                  className="p-1 text-red-300 hover:text-red-200 transition-colors"
                  title="Download original code"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-auto">
              <pre className="text-sm text-gray-300 font-mono">
                {showLineNumbers ? (
                  <div className="flex">
                    <div className="text-gray-500 text-right pr-4 select-none">
                      {getLineNumbers(analysis.originalCode).map(num => (
                        <div key={num}>{num}</div>
                      ))}
                    </div>
                    <div className="flex-1">
                      {originalLines.map((line, index) => (
                        <div key={index}>{line || ' '}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  analysis.originalCode
                )}
              </pre>
            </div>
          </div>

          {/* Fixed Code */}
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-green-900/20 border-b border-green-700/30">
              <h3 className="text-sm font-medium text-green-300 flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>Fixed Code</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(analysis.fixedCode!, 'fixed')}
                  className="p-1 text-green-300 hover:text-green-200 transition-colors"
                  title="Copy fixed code"
                >
                  {copied === 'fixed' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => downloadCode(analysis.fixedCode!, 'fixed-code.txt')}
                  className="p-1 text-green-300 hover:text-green-200 transition-colors"
                  title="Download fixed code"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-auto">
              <pre className="text-sm text-gray-300 font-mono">
                {showLineNumbers ? (
                  <div className="flex">
                    <div className="text-gray-500 text-right pr-4 select-none">
                      {getLineNumbers(analysis.fixedCode).map(num => (
                        <div key={num}>{num}</div>
                      ))}
                    </div>
                    <div className="flex-1">
                      {fixedLines.map((line, index) => (
                        <div key={index}>{line || ' '}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  analysis.fixedCode
                )}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        /* Unified View */
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
            <h3 className="text-sm font-medium text-white">Unified Diff View</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyToClipboard(analysis.fixedCode!, 'fixed')}
                className="p-1 text-gray-300 hover:text-white transition-colors"
                title="Copy fixed code"
              >
                {copied === 'fixed' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => downloadCode(analysis.fixedCode!, 'fixed-code.txt')}
                className="p-1 text-gray-300 hover:text-white transition-colors"
                title="Download fixed code"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-4 max-h-96 overflow-auto">
            <pre className="text-sm font-mono">
              {Array.from({ length: maxLines }, (_, index) => {
                const originalLine = originalLines[index] || '';
                const fixedLine = fixedLines[index] || '';
                const lineNum = index + 1;
                
                if (originalLine === fixedLine) {
                  return (
                    <div key={index} className="text-gray-300">
                      {showLineNumbers && <span className="text-gray-500 pr-4">{lineNum}</span>}
                      {originalLine || ' '}
                    </div>
                  );
                } else {
                  return (
                    <div key={index}>
                      {originalLine && (
                        <div className="bg-red-900/20 text-red-200">
                          {showLineNumbers && <span className="text-red-400 pr-4">-{lineNum}</span>}
                          <span className="bg-red-900/40">- {originalLine}</span>
                        </div>
                      )}
                      {fixedLine && (
                        <div className="bg-green-900/20 text-green-200">
                          {showLineNumbers && <span className="text-green-400 pr-4">+{lineNum}</span>}
                          <span className="bg-green-900/40">+ {fixedLine}</span>
                        </div>
                      )}
                    </div>
                  );
                }
              })}
            </pre>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <div className="text-lg font-semibold text-red-400">{originalLines.length}</div>
          <p className="text-xs text-gray-400">Original Lines</p>
        </div>
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <div className="text-lg font-semibold text-green-400">{fixedLines.length}</div>
          <p className="text-xs text-gray-400">Fixed Lines</p>
        </div>
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <div className="text-lg font-semibold text-blue-400">
            {fixedLines.length - originalLines.length > 0 ? '+' : ''}{fixedLines.length - originalLines.length}
          </div>
          <p className="text-xs text-gray-400">Line Diff</p>
        </div>
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <div className="text-lg font-semibold text-purple-400">
            {Math.round(((analysis.fixedCode?.length || 0) / analysis.originalCode.length) * 100)}%
          </div>
          <p className="text-xs text-gray-400">Size Ratio</p>
        </div>
      </div>
    </div>
  );
};