import React, { useState } from 'react';
import { FileText, Plus, Edit, Trash2, Copy, Check, Star, Clock, Users, Tag } from 'lucide-react';

interface ReviewTemplate {
  id: string;
  name: string;
  description: string;
  category: 'frontend' | 'backend' | 'mobile' | 'security' | 'performance' | 'general';
  checklist: ChecklistItem[];
  estimatedTime: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  isDefault: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: Date;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'code-quality' | 'security' | 'performance' | 'documentation' | 'testing' | 'architecture';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRequired: boolean;
  examples?: string[];
  resources?: string[];
}

export const ReviewTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<ReviewTemplate[]>([
    {
      id: '1',
      name: 'React Component Review',
      description: 'Comprehensive checklist for reviewing React components',
      category: 'frontend',
      estimatedTime: 30,
      difficulty: 'intermediate',
      tags: ['react', 'components', 'typescript', 'hooks'],
      isDefault: true,
      usageCount: 156,
      createdBy: 'System',
      createdAt: new Date('2024-01-01'),
      checklist: [
        {
          id: '1',
          title: 'Component Structure',
          description: 'Verify component follows proper structure and naming conventions',
          category: 'code-quality',
          priority: 'high',
          isRequired: true,
          examples: ['PascalCase naming', 'Single responsibility', 'Proper file organization']
        },
        {
          id: '2',
          title: 'TypeScript Types',
          description: 'Ensure all props and state are properly typed',
          category: 'code-quality',
          priority: 'high',
          isRequired: true,
          examples: ['Interface definitions', 'Generic types', 'Proper return types']
        },
        {
          id: '3',
          title: 'Performance Optimization',
          description: 'Check for unnecessary re-renders and optimization opportunities',
          category: 'performance',
          priority: 'medium',
          isRequired: false,
          examples: ['React.memo usage', 'useCallback/useMemo', 'Lazy loading']
        },
        {
          id: '4',
          title: 'Accessibility',
          description: 'Verify component meets accessibility standards',
          category: 'code-quality',
          priority: 'high',
          isRequired: true,
          examples: ['ARIA labels', 'Keyboard navigation', 'Screen reader support']
        },
        {
          id: '5',
          title: 'Error Handling',
          description: 'Ensure proper error boundaries and error handling',
          category: 'code-quality',
          priority: 'medium',
          isRequired: true,
          examples: ['Error boundaries', 'Try-catch blocks', 'Fallback UI']
        }
      ]
    },
    {
      id: '2',
      name: 'API Security Review',
      description: 'Security-focused checklist for API endpoints',
      category: 'security',
      estimatedTime: 45,
      difficulty: 'advanced',
      tags: ['api', 'security', 'authentication', 'validation'],
      isDefault: true,
      usageCount: 89,
      createdBy: 'Security Team',
      createdAt: new Date('2024-01-15'),
      checklist: [
        {
          id: '1',
          title: 'Authentication & Authorization',
          description: 'Verify proper authentication and authorization mechanisms',
          category: 'security',
          priority: 'critical',
          isRequired: true,
          examples: ['JWT validation', 'Role-based access', 'Session management']
        },
        {
          id: '2',
          title: 'Input Validation',
          description: 'Ensure all inputs are properly validated and sanitized',
          category: 'security',
          priority: 'critical',
          isRequired: true,
          examples: ['Schema validation', 'SQL injection prevention', 'XSS protection']
        },
        {
          id: '3',
          title: 'Rate Limiting',
          description: 'Check for proper rate limiting implementation',
          category: 'security',
          priority: 'high',
          isRequired: true,
          examples: ['Request throttling', 'IP-based limits', 'User-based limits']
        },
        {
          id: '4',
          title: 'Data Encryption',
          description: 'Verify sensitive data is properly encrypted',
          category: 'security',
          priority: 'critical',
          isRequired: true,
          examples: ['HTTPS enforcement', 'Database encryption', 'Password hashing']
        }
      ]
    },
    {
      id: '3',
      name: 'Database Performance Review',
      description: 'Checklist for optimizing database queries and performance',
      category: 'performance',
      estimatedTime: 60,
      difficulty: 'advanced',
      tags: ['database', 'sql', 'performance', 'optimization'],
      isDefault: false,
      usageCount: 34,
      createdBy: 'DBA Team',
      createdAt: new Date('2024-02-01'),
      checklist: [
        {
          id: '1',
          title: 'Query Optimization',
          description: 'Review SQL queries for performance optimization',
          category: 'performance',
          priority: 'high',
          isRequired: true,
          examples: ['Index usage', 'Query execution plans', 'N+1 query prevention']
        },
        {
          id: '2',
          title: 'Index Strategy',
          description: 'Verify proper indexing strategy',
          category: 'performance',
          priority: 'high',
          isRequired: true,
          examples: ['Composite indexes', 'Covering indexes', 'Index maintenance']
        },
        {
          id: '3',
          title: 'Connection Management',
          description: 'Check database connection handling',
          category: 'performance',
          priority: 'medium',
          isRequired: true,
          examples: ['Connection pooling', 'Connection timeouts', 'Resource cleanup']
        }
      ]
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<ReviewTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const categories = ['all', 'frontend', 'backend', 'mobile', 'security', 'performance', 'general'];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'frontend': return 'text-blue-400 bg-blue-900/20';
      case 'backend': return 'text-green-400 bg-green-900/20';
      case 'mobile': return 'text-purple-400 bg-purple-900/20';
      case 'security': return 'text-red-400 bg-red-900/20';
      case 'performance': return 'text-yellow-400 bg-yellow-900/20';
      case 'general': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-900/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-900/20';
      case 'advanced': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const handleCopyTemplate = async (template: ReviewTemplate) => {
    const templateText = `# ${template.name}\n\n${template.description}\n\n## Checklist\n\n${
      template.checklist.map((item, index) => 
        `${index + 1}. **${item.title}** (${item.priority}${item.isRequired ? ', Required' : ''})\n   ${item.description}`
      ).join('\n\n')
    }`;

    try {
      await navigator.clipboard.writeText(templateText);
      setCopiedTemplate(template.id);
      setTimeout(() => setCopiedTemplate(null), 2000);
    } catch (err) {
      console.error('Failed to copy template: ', err);
    }
  };

  const handleCreateTemplate = () => {
    setIsCreating(true);
    setSelectedTemplate({
      id: Date.now().toString(),
      name: '',
      description: '',
      category: 'general',
      estimatedTime: 30,
      difficulty: 'intermediate',
      tags: [],
      isDefault: false,
      usageCount: 0,
      createdBy: 'Current User',
      createdAt: new Date(),
      checklist: []
    });
    setIsEditing(true);
  };

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;

    if (isCreating) {
      setTemplates(prev => [...prev, selectedTemplate]);
    } else {
      setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? selectedTemplate : t));
    }

    setIsEditing(false);
    setIsCreating(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-white" />
          <h2 className="text-lg font-semibold text-white">Review Templates</h2>
        </div>
        <button
          onClick={handleCreateTemplate}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search and Filter */}
          <div className="space-y-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search templates..."
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Templates */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className={`p-4 bg-gray-900 rounded-lg border cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-medium text-sm">{template.name}</h3>
                  {template.isDefault && (
                    <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
                
                <p className="text-gray-400 text-xs mb-3 line-clamp-2">{template.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{template.estimatedTime}m</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-400">
                    {template.checklist.length} items • {template.usageCount} uses
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Template Details */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <div className="bg-gray-900 rounded-lg p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">
                      {isCreating ? 'Create New Template' : 'Edit Template'}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setIsCreating(false);
                        }}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveTemplate}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                  
                  {/* Edit Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={selectedTemplate.name}
                      onChange={(e) => setSelectedTemplate({...selectedTemplate, name: e.target.value})}
                      placeholder="Template name"
                      className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    <select
                      value={selectedTemplate.category}
                      onChange={(e) => setSelectedTemplate({...selectedTemplate, category: e.target.value as any})}
                      className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.slice(1).map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <textarea
                    value={selectedTemplate.description}
                    onChange={(e) => setSelectedTemplate({...selectedTemplate, description: e.target.value})}
                    placeholder="Template description"
                    rows={3}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Estimated Time (minutes)</label>
                      <input
                        type="number"
                        value={selectedTemplate.estimatedTime}
                        onChange={(e) => setSelectedTemplate({...selectedTemplate, estimatedTime: parseInt(e.target.value)})}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Difficulty</label>
                      <select
                        value={selectedTemplate.difficulty}
                        onChange={(e) => setSelectedTemplate({...selectedTemplate, difficulty: e.target.value as any})}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{selectedTemplate.name}</h3>
                        {selectedTemplate.isDefault && (
                          <Star className="w-5 h-5 text-yellow-400" />
                        )}
                      </div>
                      <p className="text-gray-300 mb-3">{selectedTemplate.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`text-sm px-3 py-1 rounded-full ${getCategoryColor(selectedTemplate.category)}`}>
                          {selectedTemplate.category}
                        </span>
                        <span className={`text-sm px-3 py-1 rounded-full ${getDifficultyColor(selectedTemplate.difficulty)}`}>
                          {selectedTemplate.difficulty}
                        </span>
                        <div className="flex items-center space-x-1 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{selectedTemplate.estimatedTime} minutes</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{selectedTemplate.usageCount} uses</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {selectedTemplate.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded flex items-center space-x-1">
                            <Tag className="w-3 h-3" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCopyTemplate(selectedTemplate)}
                        className="flex items-center space-x-1 px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors text-sm"
                      >
                        {copiedTemplate === selectedTemplate.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span>Copy</span>
                      </button>
                      
                      {!selectedTemplate.isDefault && (
                        <>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Checklist */}
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">Review Checklist ({selectedTemplate.checklist.length} items)</h4>
                    <div className="space-y-3">
                      {selectedTemplate.checklist.map((item, index) => (
                        <div key={item.id} className="bg-gray-800 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-blue-400">#{index + 1}</span>
                              <h5 className="text-white font-medium">{item.title}</h5>
                              {item.isRequired && (
                                <span className="text-xs px-2 py-1 bg-red-900 text-red-300 rounded-full">
                                  Required
                                </span>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                          </div>
                          
                          <p className="text-gray-300 text-sm mb-3">{item.description}</p>
                          
                          {item.examples && item.examples.length > 0 && (
                            <div>
                              <h6 className="text-xs font-medium text-gray-400 mb-1">Examples:</h6>
                              <ul className="text-xs text-gray-400 space-y-1">
                                {item.examples.map((example, exampleIndex) => (
                                  <li key={exampleIndex} className="flex items-start space-x-2">
                                    <span>•</span>
                                    <span>{example}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg p-6 text-center">
              <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">Select a Template</h3>
              <p className="text-gray-500">Choose a review template from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};