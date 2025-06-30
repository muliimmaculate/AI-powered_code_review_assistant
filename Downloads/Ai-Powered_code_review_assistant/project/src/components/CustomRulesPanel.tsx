import React, { useState } from 'react';
import { Settings, Plus, Edit, Trash2, Save, X, Check, AlertTriangle, Code, TestTube, Shield } from 'lucide-react';

interface CustomRule {
  id: string;
  name: string;
  description: string;
  category: 'style' | 'security' | 'performance' | 'best-practice' | 'custom';
  severity: 'error' | 'warning' | 'info';
  pattern: string;
  message: string;
  suggestion: string;
  fixTemplate?: string;
  enabled: boolean;
  isBuiltIn: boolean;
  tags: string[];
  examples: {
    bad: string;
    good: string;
  };
}

interface CustomRulesPanelProps {
  onRulesChange?: (rules: CustomRule[]) => void;
}

export const CustomRulesPanel: React.FC<CustomRulesPanelProps> = ({ onRulesChange }) => {
  const [rules, setRules] = useState<CustomRule[]>([
    {
      id: 'no-console-log',
      name: 'No Console Logs',
      description: 'Prevent console.log statements in production code',
      category: 'best-practice',
      severity: 'warning',
      pattern: 'console\\.log\\(',
      message: 'Console.log statement found',
      suggestion: 'Remove console.log statements or use a proper logging library',
      enabled: true,
      isBuiltIn: true,
      tags: ['logging', 'production'],
      examples: {
        bad: 'console.log("Debug message");',
        good: 'logger.debug("Debug message");'
      }
    },
    {
      id: 'no-var-declarations',
      name: 'No Var Declarations',
      description: 'Enforce use of let/const instead of var',
      category: 'style',
      severity: 'info',
      pattern: '\\bvar\\s+',
      message: 'Use let or const instead of var',
      suggestion: 'Replace var with const for immutable values or let for mutable ones',
      fixTemplate: 'const $1',
      enabled: true,
      isBuiltIn: true,
      tags: ['es6', 'scope'],
      examples: {
        bad: 'var name = "John";',
        good: 'const name = "John";'
      }
    },
    {
      id: 'require-error-handling',
      name: 'Require Error Handling',
      description: 'Ensure async operations have error handling',
      category: 'best-practice',
      severity: 'error',
      pattern: 'await\\s+(?!.*catch)',
      message: 'Async operation without error handling',
      suggestion: 'Wrap async operations in try-catch blocks',
      enabled: true,
      isBuiltIn: true,
      tags: ['async', 'error-handling'],
      examples: {
        bad: 'const data = await fetchData();',
        good: 'try {\n  const data = await fetchData();\n} catch (error) {\n  handleError(error);\n}'
      }
    }
  ]);

  const [editingRule, setEditingRule] = useState<CustomRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [testCode, setTestCode] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const createNewRule = (): CustomRule => ({
    id: `custom-${Date.now()}`,
    name: '',
    description: '',
    category: 'custom',
    severity: 'warning',
    pattern: '',
    message: '',
    suggestion: '',
    enabled: true,
    isBuiltIn: false,
    tags: [],
    examples: {
      bad: '',
      good: ''
    }
  });

  const handleCreateRule = () => {
    setEditingRule(createNewRule());
    setIsCreating(true);
  };

  const handleEditRule = (rule: CustomRule) => {
    if (rule.isBuiltIn) return;
    setEditingRule({ ...rule });
    setIsCreating(false);
  };

  const handleSaveRule = () => {
    if (!editingRule) return;

    if (isCreating) {
      setRules(prev => [...prev, editingRule]);
    } else {
      setRules(prev => prev.map(rule => 
        rule.id === editingRule.id ? editingRule : rule
      ));
    }

    setEditingRule(null);
    setIsCreating(false);
    onRulesChange?.(rules);
  };

  const handleDeleteRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule?.isBuiltIn) return;

    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    onRulesChange?.(rules);
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
    onRulesChange?.(rules);
  };

  const testRule = (rule: CustomRule, code: string) => {
    try {
      const regex = new RegExp(rule.pattern, 'gi');
      const matches = [];
      let match;
      
      while ((match = regex.exec(code)) !== null) {
        const lineNumber = code.substring(0, match.index).split('\n').length;
        matches.push({
          line: lineNumber,
          match: match[0],
          index: match.index
        });
      }
      
      return matches;
    } catch (error) {
      return [{ error: 'Invalid regex pattern' }];
    }
  };

  const handleTestRules = () => {
    const results = rules
      .filter(rule => rule.enabled)
      .map(rule => ({
        rule,
        matches: testRule(rule, testCode)
      }))
      .filter(result => result.matches.length > 0);
    
    setTestResults(results);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return <Shield className="w-4 h-4 text-red-400" />;
      case 'performance': return <Settings className="w-4 h-4 text-yellow-400" />;
      case 'style': return <Code className="w-4 h-4 text-blue-400" />;
      case 'best-practice': return <Check className="w-4 h-4 text-green-400" />;
      default: return <Settings className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-400 bg-red-900/20';
      case 'warning': return 'text-yellow-400 bg-yellow-900/20';
      case 'info': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const categories = ['all', 'style', 'security', 'performance', 'best-practice', 'custom'];
  const filteredRules = selectedCategory === 'all' 
    ? rules 
    : rules.filter(rule => rule.category === selectedCategory);

  const ruleTemplates = [
    {
      name: 'No Magic Numbers',
      pattern: '\\b\\d{2,}\\b(?!.*const|.*let)',
      message: 'Magic number detected',
      suggestion: 'Replace magic numbers with named constants',
      category: 'best-practice'
    },
    {
      name: 'Require JSDoc',
      pattern: 'function\\s+\\w+\\([^)]*\\)\\s*{(?!.*\\/\\*\\*)',
      message: 'Function missing JSDoc documentation',
      suggestion: 'Add JSDoc comments to document function parameters and return values',
      category: 'style'
    },
    {
      name: 'No Hardcoded URLs',
      pattern: 'https?:\\/\\/[^\\s"\']+',
      message: 'Hardcoded URL detected',
      suggestion: 'Move URLs to configuration files or environment variables',
      category: 'security'
    }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-white" />
          <h2 className="text-lg font-semibold text-white">Custom Rules Engine</h2>
        </div>
        <button
          onClick={handleCreateRule}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Rule</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category !== 'all' && getCategoryIcon(category)}
              <span>{category === 'all' ? 'All Rules' : category.replace('-', ' ')}</span>
              <span className="opacity-75">
                ({category === 'all' ? rules.length : rules.filter(r => r.category === category).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-3 mb-6">
        {filteredRules.map(rule => (
          <div key={rule.id} className="bg-gray-900 rounded-lg border border-gray-700 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getCategoryIcon(rule.category)}
                  <h3 className="text-sm font-medium text-white">{rule.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(rule.severity)}`}>
                    {rule.severity}
                  </span>
                  {rule.isBuiltIn && (
                    <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">
                      Built-in
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 mb-2">{rule.description}</p>
                <div className="flex flex-wrap gap-1">
                  {rule.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleRule(rule.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    rule.enabled ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      rule.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                {!rule.isBuiltIn && (
                  <>
                    <button
                      onClick={() => handleEditRule(rule)}
                      className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rule Editor Modal */}
      {editingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {isCreating ? 'Create New Rule' : 'Edit Rule'}
              </h3>
              <button
                onClick={() => setEditingRule(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rule Name</label>
                  <input
                    type="text"
                    value={editingRule.name}
                    onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter rule name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={editingRule.description}
                    onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe what this rule checks for"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={editingRule.category}
                      onChange={(e) => setEditingRule({ ...editingRule, category: e.target.value as any })}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="style">Style</option>
                      <option value="security">Security</option>
                      <option value="performance">Performance</option>
                      <option value="best-practice">Best Practice</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
                    <select
                      value={editingRule.severity}
                      onChange={(e) => setEditingRule({ ...editingRule, severity: e.target.value as any })}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="error">Error</option>
                      <option value="warning">Warning</option>
                      <option value="info">Info</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Regex Pattern</label>
                  <input
                    type="text"
                    value={editingRule.pattern}
                    onChange={(e) => setEditingRule({ ...editingRule, pattern: e.target.value })}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter regex pattern"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Error Message</label>
                  <input
                    type="text"
                    value={editingRule.message}
                    onChange={(e) => setEditingRule({ ...editingRule, message: e.target.value })}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Message shown when rule is violated"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Suggestion</label>
                  <textarea
                    value={editingRule.suggestion}
                    onChange={(e) => setEditingRule({ ...editingRule, suggestion: e.target.value })}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="How to fix the issue"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={editingRule.tags.join(', ')}
                    onChange={(e) => setEditingRule({ 
                      ...editingRule, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bad Example</label>
                  <textarea
                    value={editingRule.examples.bad}
                    onChange={(e) => setEditingRule({ 
                      ...editingRule, 
                      examples: { ...editingRule.examples, bad: e.target.value }
                    })}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Example of code that violates this rule"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Good Example</label>
                  <textarea
                    value={editingRule.examples.good}
                    onChange={(e) => setEditingRule({ 
                      ...editingRule, 
                      examples: { ...editingRule.examples, good: e.target.value }
                    })}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Example of correct code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quick Templates</label>
                  <div className="space-y-2">
                    {ruleTemplates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => setEditingRule({
                          ...editingRule,
                          name: template.name,
                          pattern: template.pattern,
                          message: template.message,
                          suggestion: template.suggestion,
                          category: template.category as any
                        })}
                        className="w-full text-left p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 transition-colors"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingRule(null)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRule}
                disabled={!editingRule.name || !editingRule.pattern || !editingRule.message}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Rule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rule Tester */}
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <TestTube className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-medium text-white">Rule Tester</h3>
        </div>
        
        <div className="space-y-4">
          <textarea
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={6}
            placeholder="Paste code here to test your rules..."
          />
          
          <button
            onClick={handleTestRules}
            disabled={!testCode.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <TestTube className="w-4 h-4" />
            <span>Test Rules</span>
          </button>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white">Test Results:</h4>
              {testResults.map((result, index) => (
                <div key={index} className="bg-gray-800 p-3 rounded border-l-4 border-yellow-400">
                  <div className="flex items-center space-x-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-white">{result.rule.name}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{result.rule.message}</p>
                  {result.matches.map((match: any, matchIndex: number) => (
                    <div key={matchIndex} className="text-xs text-gray-400">
                      {match.error ? (
                        <span className="text-red-400">Error: {match.error}</span>
                      ) : (
                        <span>Line {match.line}: "{match.match}"</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};