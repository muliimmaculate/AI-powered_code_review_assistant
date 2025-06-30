import React, { useState } from 'react';
import { Zap, Clock, Database, Cpu, MemoryStick, AlertTriangle, CheckCircle, TrendingUp, Target, Gauge } from 'lucide-react';

interface PerformanceIssue {
  id: number;
  type: 'memory' | 'cpu' | 'network' | 'database' | 'algorithm';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  suggestion: string;
  code: string;
  optimizedCode: string;
  estimatedImprovement: string;
  line?: number;
}

interface PerformanceMetrics {
  bigOComplexity: string;
  memoryUsage: 'low' | 'medium' | 'high';
  networkCalls: number;
  databaseQueries: number;
  algorithmicEfficiency: number;
  cacheUtilization: number;
  bundleImpact: number;
}

interface Analysis {
  originalCode: string;
  issues: any[];
}

interface PerformancePanelProps {
  analysis: Analysis | null;
}

export const PerformancePanel: React.FC<PerformancePanelProps> = ({ analysis }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);

  const analyzePerformance = (code: string): { issues: PerformanceIssue[], metrics: PerformanceMetrics } => {
    const issues: PerformanceIssue[] = [];
    let issueId = 1;

    // Algorithm complexity analysis
    const nestedLoops = (code.match(/for\s*\([^}]*for\s*\(/g) || []).length;
    const whileLoops = (code.match(/while\s*\(/g) || []).length;
    const forLoops = (code.match(/for\s*\(/g) || []).length;
    
    if (nestedLoops > 0) {
      issues.push({
        id: issueId++,
        type: 'algorithm',
        severity: 'high',
        title: 'Nested Loop Detected - O(n²) Complexity',
        description: 'Nested loops can cause quadratic time complexity, leading to poor performance with large datasets.',
        impact: 'Performance degrades exponentially with input size',
        suggestion: 'Consider using hash maps, sets, or more efficient algorithms',
        code: 'for (let i = 0; i < arr1.length; i++) {\n  for (let j = 0; j < arr2.length; j++) {\n    // O(n²) operation\n  }\n}',
        optimizedCode: 'const map = new Map();\nfor (const item of arr1) {\n  map.set(item.key, item);\n}\nfor (const item of arr2) {\n  const match = map.get(item.key); // O(1) lookup\n}',
        estimatedImprovement: '90% faster for large datasets'
      });
    }

    // Memory usage patterns
    const arrayMethods = (code.match(/\.map\(|\.filter\(|\.reduce\(/g) || []).length;
    const objectCreation = (code.match(/new\s+\w+\(|{\s*\w+:/g) || []).length;
    
    if (arrayMethods > 3) {
      issues.push({
        id: issueId++,
        type: 'memory',
        severity: 'medium',
        title: 'Multiple Array Operations - Memory Overhead',
        description: 'Chaining multiple array methods creates intermediate arrays, increasing memory usage.',
        impact: 'Higher memory consumption and GC pressure',
        suggestion: 'Combine operations or use for loops for better memory efficiency',
        code: 'data.filter(x => x.active)\n    .map(x => x.value)\n    .reduce((a, b) => a + b, 0)',
        optimizedCode: 'let sum = 0;\nfor (const item of data) {\n  if (item.active) {\n    sum += item.value;\n  }\n}\nreturn sum;',
        estimatedImprovement: '60% less memory usage'
      });
    }

    // Network optimization
    const fetchCalls = (code.match(/fetch\(|axios\.|http\./g) || []).length;
    const awaitInLoop = /for.*await|while.*await/.test(code);
    
    if (awaitInLoop) {
      issues.push({
        id: issueId++,
        type: 'network',
        severity: 'critical',
        title: 'Sequential API Calls in Loop',
        description: 'Making API calls sequentially in a loop creates unnecessary delays.',
        impact: 'Response time increases linearly with number of requests',
        suggestion: 'Use Promise.all() or Promise.allSettled() for concurrent requests',
        code: 'for (const id of userIds) {\n  const user = await fetchUser(id); // Sequential\n  users.push(user);\n}',
        optimizedCode: 'const userPromises = userIds.map(id => fetchUser(id));\nconst users = await Promise.all(userPromises); // Concurrent',
        estimatedImprovement: '80% faster API response time'
      });
    }

    // Database query optimization
    const sqlPatterns = (code.match(/SELECT.*FROM|INSERT.*INTO|UPDATE.*SET/gi) || []).length;
    const nPlusOnePattern = /for.*SELECT|forEach.*query/.test(code);
    
    if (nPlusOnePattern) {
      issues.push({
        id: issueId++,
        type: 'database',
        severity: 'high',
        title: 'N+1 Query Problem Detected',
        description: 'Making database queries inside loops leads to excessive database calls.',
        impact: 'Database performance degrades with data size',
        suggestion: 'Use JOIN queries or batch operations to reduce database calls',
        code: 'for (const post of posts) {\n  const author = await db.query("SELECT * FROM users WHERE id = ?", post.authorId);\n}',
        optimizedCode: 'const posts = await db.query(`\n  SELECT p.*, u.name as author_name \n  FROM posts p \n  JOIN users u ON p.author_id = u.id\n`);',
        estimatedImprovement: '95% fewer database queries'
      });
    }

    // CPU intensive operations
    const regexInLoop = /for.*new RegExp|while.*\/.*\//.test(code);
    const jsonParse = (code.match(/JSON\.parse|JSON\.stringify/g) || []).length;
    
    if (regexInLoop) {
      issues.push({
        id: issueId++,
        type: 'cpu',
        severity: 'medium',
        title: 'Regex Compilation in Loop',
        description: 'Creating regex patterns inside loops causes unnecessary CPU overhead.',
        impact: 'Increased CPU usage and slower execution',
        suggestion: 'Move regex compilation outside the loop',
        code: 'for (const text of texts) {\n  const pattern = new RegExp(userInput, "gi"); // Recompiled each time\n  if (pattern.test(text)) { ... }\n}',
        optimizedCode: 'const pattern = new RegExp(userInput, "gi"); // Compiled once\nfor (const text of texts) {\n  if (pattern.test(text)) { ... }\n}',
        estimatedImprovement: '70% faster regex operations'
      });
    }

    // Bundle size impact
    const imports = (code.match(/import.*from|require\(/g) || []).length;
    const heavyLibraries = /lodash|moment|jquery/i.test(code);
    
    if (heavyLibraries) {
      issues.push({
        id: issueId++,
        type: 'network',
        severity: 'medium',
        title: 'Heavy Library Dependencies',
        description: 'Using large libraries increases bundle size and load time.',
        impact: 'Slower initial page load and larger bundle size',
        suggestion: 'Use tree-shaking, lighter alternatives, or native methods',
        code: 'import _ from "lodash";\nimport moment from "moment";',
        optimizedCode: 'import { debounce } from "lodash/debounce"; // Tree-shaking\nimport { format } from "date-fns"; // Lighter alternative',
        estimatedImprovement: '40% smaller bundle size'
      });
    }

    // Calculate metrics
    const complexity = nestedLoops > 0 ? 'O(n²)' : forLoops > 0 ? 'O(n)' : 'O(1)';
    const memoryUsage = objectCreation > 10 ? 'high' : objectCreation > 5 ? 'medium' : 'low';
    
    const metrics: PerformanceMetrics = {
      bigOComplexity: complexity,
      memoryUsage: memoryUsage as 'low' | 'medium' | 'high',
      networkCalls: fetchCalls,
      databaseQueries: sqlPatterns,
      algorithmicEfficiency: Math.max(1, 10 - (nestedLoops * 3) - (forLoops * 1)),
      cacheUtilization: code.includes('cache') || code.includes('memo') ? 8 : 3,
      bundleImpact: Math.max(1, 10 - (imports * 0.5) - (heavyLibraries ? 3 : 0))
    };

    return { issues, metrics };
  };

  if (!analysis) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center py-12">
          <Zap className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">Performance Analysis Ready</h3>
          <p className="text-gray-500">Analyze your code to get performance optimization suggestions</p>
        </div>
      </div>
    );
  }

  const { issues, metrics } = analyzePerformance(analysis.originalCode);
  const filteredIssues = selectedCategory === 'all' 
    ? issues 
    : issues.filter(issue => issue.type === selectedCategory);

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'memory': return <MemoryStick className="w-4 h-4 text-blue-400" />;
      case 'cpu': return <Cpu className="w-4 h-4 text-red-400" />;
      case 'network': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'database': return <Database className="w-4 h-4 text-green-400" />;
      case 'algorithm': return <Target className="w-4 h-4 text-purple-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-700';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-700';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
      case 'low': return 'text-blue-400 bg-blue-900/20 border-blue-700';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-700';
    }
  };

  const getMetricColor = (value: number) => {
    if (value >= 8) return 'text-green-400';
    if (value >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const categories = ['all', 'algorithm', 'memory', 'cpu', 'network', 'database'];

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Zap className="w-5 h-5 text-white" />
        <h2 className="text-lg font-semibold text-white">Performance Analysis</h2>
      </div>

      {/* Performance Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Big O Complexity</span>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-purple-400">{metrics.bigOComplexity}</div>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Memory Usage</span>
            <MemoryStick className="w-4 h-4 text-blue-400" />
          </div>
          <div className={`text-lg font-bold ${
            metrics.memoryUsage === 'low' ? 'text-green-400' : 
            metrics.memoryUsage === 'medium' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {metrics.memoryUsage.toUpperCase()}
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Network Calls</span>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-lg font-bold text-yellow-400">{metrics.networkCalls}</div>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Algorithm Efficiency</span>
            <Gauge className="w-4 h-4 text-green-400" />
          </div>
          <div className={`text-lg font-bold ${getMetricColor(metrics.algorithmicEfficiency)}`}>
            {metrics.algorithmicEfficiency}/10
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Cache Utilization</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className={`text-lg font-bold ${getMetricColor(metrics.cacheUtilization)}`}>
            {metrics.cacheUtilization}/10
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Bundle Impact</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className={`text-lg font-bold ${getMetricColor(metrics.bundleImpact)}`}>
            {metrics.bundleImpact}/10
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category === 'all' ? 'All Issues' : category.charAt(0).toUpperCase() + category.slice(1)}
              {category !== 'all' && (
                <span className="ml-1 opacity-75">
                  ({issues.filter(i => i.type === category).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Issues */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-gray-400">No performance issues found in this category</p>
          </div>
        ) : (
          filteredIssues.map(issue => (
            <div
              key={issue.id}
              className={`bg-gray-900 rounded-lg border overflow-hidden ${getSeverityColor(issue.severity)}`}
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
              >
                <div className="flex items-start space-x-3">
                  {getIssueIcon(issue.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-white">{issue.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                        <span className="text-xs px-2 py-1 bg-green-900 text-green-300 rounded-full">
                          {issue.estimatedImprovement}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-1">{issue.description}</p>
                    <p className="text-xs text-gray-400">Impact: {issue.impact}</p>
                  </div>
                </div>
              </div>

              {expandedIssue === issue.id && (
                <div className="border-t border-gray-700 p-4 bg-gray-800">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Optimization Suggestion:</h4>
                      <p className="text-sm text-gray-300">{issue.suggestion}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs font-medium text-red-300 mb-2">Current Code (Inefficient)</h5>
                        <pre className="text-xs bg-red-900/20 border border-red-700/30 p-3 rounded text-red-200 overflow-x-auto">
                          {issue.code}
                        </pre>
                      </div>
                      <div>
                        <h5 className="text-xs font-medium text-green-300 mb-2">Optimized Code</h5>
                        <pre className="text-xs bg-green-900/20 border border-green-700/30 p-3 rounded text-green-200 overflow-x-auto">
                          {issue.optimizedCode}
                        </pre>
                      </div>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-700/30 p-3 rounded">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-300">Expected Improvement</span>
                      </div>
                      <p className="text-sm text-blue-200 mt-1">{issue.estimatedImprovement}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Performance Tips */}
      <div className="mt-6 bg-gray-900 rounded-lg p-4">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center space-x-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span>Performance Best Practices</span>
        </h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li className="flex items-start space-x-2">
            <span className="text-yellow-400 mt-1">•</span>
            <span>Use efficient algorithms and data structures (Map, Set, WeakMap)</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-yellow-400 mt-1">•</span>
            <span>Implement caching and memoization for expensive operations</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-yellow-400 mt-1">•</span>
            <span>Batch API calls and database queries to reduce network overhead</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-yellow-400 mt-1">•</span>
            <span>Use lazy loading and code splitting for better bundle management</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-yellow-400 mt-1">•</span>
            <span>Profile your code regularly to identify performance bottlenecks</span>
          </li>
        </ul>
      </div>
    </div>
  );
};