import React, { useState } from 'react';
import { Users, Brain, Star, Clock, Target, Zap, UserCheck, AlertCircle } from 'lucide-react';

interface Developer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  expertise: string[];
  experience: 'junior' | 'mid' | 'senior' | 'lead';
  availability: 'available' | 'busy' | 'unavailable';
  workload: number; // 0-100
  stats: {
    reviewsCompleted: number;
    averageReviewTime: number; // in hours
    qualityScore: number;
    responseTime: number; // in hours
  };
  preferences: {
    maxReviewsPerDay: number;
    preferredCategories: string[];
    timeZone: string;
  };
}

interface CodeReviewRequest {
  id: string;
  title: string;
  description: string;
  author: string;
  codeSize: number; // lines of code
  complexity: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  technologies: string[];
  estimatedReviewTime: number; // in hours
  deadline?: Date;
  requiredExpertise: string[];
}

interface AssignmentSuggestion {
  reviewer: Developer;
  score: number;
  reasons: string[];
  estimatedCompletionTime: Date;
  workloadImpact: number;
}

export const ReviewerAssignment: React.FC = () => {
  const [developers] = useState<Developer[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah@company.com',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100&h=100&fit=crop&crop=face',
      expertise: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
      experience: 'lead',
      availability: 'available',
      workload: 65,
      stats: {
        reviewsCompleted: 156,
        averageReviewTime: 2.5,
        qualityScore: 9.2,
        responseTime: 0.8
      },
      preferences: {
        maxReviewsPerDay: 3,
        preferredCategories: ['frontend', 'architecture'],
        timeZone: 'PST'
      }
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      email: 'marcus@company.com',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100&h=100&fit=crop&crop=face',
      expertise: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Kubernetes'],
      experience: 'senior',
      availability: 'busy',
      workload: 85,
      stats: {
        reviewsCompleted: 134,
        averageReviewTime: 3.2,
        qualityScore: 8.7,
        responseTime: 1.2
      },
      preferences: {
        maxReviewsPerDay: 2,
        preferredCategories: ['backend', 'database'],
        timeZone: 'EST'
      }
    },
    {
      id: '3',
      name: 'Elena Rodriguez',
      email: 'elena@company.com',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=100&h=100&fit=crop&crop=face',
      expertise: ['Vue.js', 'JavaScript', 'CSS', 'Figma', 'UX'],
      experience: 'mid',
      availability: 'available',
      workload: 45,
      stats: {
        reviewsCompleted: 89,
        averageReviewTime: 2.8,
        qualityScore: 8.4,
        responseTime: 1.5
      },
      preferences: {
        maxReviewsPerDay: 4,
        preferredCategories: ['frontend', 'ui'],
        timeZone: 'PST'
      }
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'david@company.com',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=100&h=100&fit=crop&crop=face',
      expertise: ['Java', 'Spring', 'Microservices', 'Security', 'Performance'],
      experience: 'senior',
      availability: 'available',
      workload: 55,
      stats: {
        reviewsCompleted: 198,
        averageReviewTime: 4.1,
        qualityScore: 9.5,
        responseTime: 0.6
      },
      preferences: {
        maxReviewsPerDay: 2,
        preferredCategories: ['backend', 'security'],
        timeZone: 'PST'
      }
    }
  ]);

  const [reviewRequest, setReviewRequest] = useState<CodeReviewRequest>({
    id: '1',
    title: 'User Authentication Refactor',
    description: 'Refactored the user authentication system to use JWT tokens and improved security',
    author: 'John Doe',
    codeSize: 450,
    complexity: 'high',
    priority: 'high',
    technologies: ['React', 'TypeScript', 'Node.js', 'JWT'],
    estimatedReviewTime: 3,
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    requiredExpertise: ['React', 'Security', 'Authentication']
  });

  const [assignmentMode, setAssignmentMode] = useState<'auto' | 'manual'>('auto');
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);

  const calculateAssignmentScore = (developer: Developer, request: CodeReviewRequest): AssignmentSuggestion => {
    let score = 0;
    const reasons: string[] = [];

    // Expertise match (40% weight)
    const expertiseMatch = request.requiredExpertise.filter(skill => 
      developer.expertise.some(devSkill => 
        devSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(devSkill.toLowerCase())
      )
    ).length;
    const expertiseScore = (expertiseMatch / request.requiredExpertise.length) * 40;
    score += expertiseScore;
    
    if (expertiseMatch > 0) {
      reasons.push(`Matches ${expertiseMatch}/${request.requiredExpertise.length} required skills`);
    }

    // Experience level (20% weight)
    const experienceScores = { junior: 5, mid: 10, senior: 15, lead: 20 };
    const complexityRequirement = { low: 5, medium: 10, high: 15 };
    const experienceScore = Math.min(experienceScores[developer.experience], complexityRequirement[request.complexity]);
    score += experienceScore;
    
    if (developer.experience === 'lead' || developer.experience === 'senior') {
      reasons.push(`${developer.experience} level developer`);
    }

    // Availability and workload (25% weight)
    const availabilityScore = developer.availability === 'available' ? 25 : 
                             developer.availability === 'busy' ? 10 : 0;
    const workloadPenalty = (developer.workload / 100) * 10;
    score += availabilityScore - workloadPenalty;
    
    if (developer.availability === 'available') {
      reasons.push('Currently available');
    }
    if (developer.workload < 70) {
      reasons.push('Low current workload');
    }

    // Quality and performance (15% weight)
    const qualityScore = (developer.stats.qualityScore / 10) * 10;
    const responseScore = Math.max(0, 5 - developer.stats.responseTime);
    score += qualityScore + responseScore;
    
    if (developer.stats.qualityScore >= 9) {
      reasons.push('High quality review score');
    }
    if (developer.stats.responseTime <= 1) {
      reasons.push('Fast response time');
    }

    // Calculate estimated completion time
    const estimatedCompletionTime = new Date(
      Date.now() + (developer.stats.averageReviewTime + request.estimatedReviewTime) * 60 * 60 * 1000
    );

    // Calculate workload impact
    const workloadImpact = (request.estimatedReviewTime / 8) * 100; // Assuming 8-hour workday

    return {
      reviewer: developer,
      score: Math.round(score),
      reasons,
      estimatedCompletionTime,
      workloadImpact
    };
  };

  const suggestions = developers
    .map(dev => calculateAssignmentScore(dev, reviewRequest))
    .sort((a, b) => b.score - a.score);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-400 bg-green-900/20';
      case 'busy': return 'text-yellow-400 bg-yellow-900/20';
      case 'unavailable': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case 'lead': return 'text-purple-400 bg-purple-900/20';
      case 'senior': return 'text-blue-400 bg-blue-900/20';
      case 'mid': return 'text-green-400 bg-green-900/20';
      case 'junior': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const handleAssignReviewers = () => {
    if (assignmentMode === 'auto') {
      // Auto-assign top 2 suggestions
      const topSuggestions = suggestions.slice(0, 2);
      console.log('Auto-assigning reviewers:', topSuggestions.map(s => s.reviewer.name));
    } else {
      // Manual assignment
      const assignedReviewers = developers.filter(dev => selectedReviewers.includes(dev.id));
      console.log('Manually assigning reviewers:', assignedReviewers.map(r => r.name));
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Brain className="w-5 h-5 text-white" />
        <h2 className="text-lg font-semibold text-white">Smart Reviewer Assignment</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Review Request Details */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Review Request</h3>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-white">{reviewRequest.title}</h4>
                <p className="text-xs text-gray-400 mt-1">{reviewRequest.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Author:</span>
                  <div className="text-white">{reviewRequest.author}</div>
                </div>
                <div>
                  <span className="text-gray-400">Code Size:</span>
                  <div className="text-white">{reviewRequest.codeSize} lines</div>
                </div>
                <div>
                  <span className="text-gray-400">Complexity:</span>
                  <div className="text-white capitalize">{reviewRequest.complexity}</div>
                </div>
                <div>
                  <span className="text-gray-400">Est. Time:</span>
                  <div className="text-white">{reviewRequest.estimatedReviewTime}h</div>
                </div>
              </div>
              
              <div>
                <span className="text-gray-400 text-sm">Priority:</span>
                <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getPriorityColor(reviewRequest.priority)}`}>
                  {reviewRequest.priority}
                </span>
              </div>
              
              <div>
                <span className="text-gray-400 text-sm">Technologies:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {reviewRequest.technologies.map(tech => (
                    <span key={tech} className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-gray-400 text-sm">Required Expertise:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {reviewRequest.requiredExpertise.map(skill => (
                    <span key={skill} className="text-xs px-2 py-1 bg-blue-900 text-blue-300 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              {reviewRequest.deadline && (
                <div>
                  <span className="text-gray-400 text-sm">Deadline:</span>
                  <div className="text-white text-sm">
                    {reviewRequest.deadline.toLocaleDateString()} at {reviewRequest.deadline.toLocaleTimeString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assignment Mode */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Assignment Mode</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="auto"
                  checked={assignmentMode === 'auto'}
                  onChange={(e) => setAssignmentMode(e.target.value as 'auto')}
                  className="text-blue-600"
                />
                <span className="text-white text-sm">AI-Powered Auto Assignment</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="manual"
                  checked={assignmentMode === 'manual'}
                  onChange={(e) => setAssignmentMode(e.target.value as 'manual')}
                  className="text-blue-600"
                />
                <span className="text-white text-sm">Manual Selection</span>
              </label>
            </div>
          </div>
        </div>

        {/* Reviewer Suggestions */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">
                {assignmentMode === 'auto' ? 'AI Recommendations' : 'Available Reviewers'}
              </h3>
              <button
                onClick={handleAssignReviewers}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                <span>Assign Reviewers</span>
              </button>
            </div>

            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.reviewer.id}
                  className={`p-4 bg-gray-800 rounded-lg border transition-colors ${
                    assignmentMode === 'manual' && selectedReviewers.includes(suggestion.reviewer.id)
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700'
                  } ${assignmentMode === 'auto' && index < 2 ? 'border-green-500 bg-green-900/10' : ''}`}
                  onClick={() => {
                    if (assignmentMode === 'manual') {
                      setSelectedReviewers(prev => 
                        prev.includes(suggestion.reviewer.id)
                          ? prev.filter(id => id !== suggestion.reviewer.id)
                          : [...prev, suggestion.reviewer.id]
                      );
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <img
                          src={suggestion.reviewer.avatar}
                          alt={suggestion.reviewer.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {assignmentMode === 'auto' && index < 2 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{index + 1}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-white font-medium">{suggestion.reviewer.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getExperienceColor(suggestion.reviewer.experience)}`}>
                            {suggestion.reviewer.experience}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getAvailabilityColor(suggestion.reviewer.availability)}`}>
                            {suggestion.reviewer.availability}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          {suggestion.reviewer.expertise.slice(0, 4).map(skill => (
                            <span
                              key={skill}
                              className={`text-xs px-2 py-1 rounded ${
                                reviewRequest.requiredExpertise.some(req => 
                                  skill.toLowerCase().includes(req.toLowerCase()) || 
                                  req.toLowerCase().includes(skill.toLowerCase())
                                ) ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-300'
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                          {suggestion.reviewer.expertise.length > 4 && (
                            <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                              +{suggestion.reviewer.expertise.length - 4}
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-gray-400">Quality:</span>
                            <div className="text-white font-medium">{suggestion.reviewer.stats.qualityScore}/10</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Avg Time:</span>
                            <div className="text-white font-medium">{suggestion.reviewer.stats.averageReviewTime}h</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Response:</span>
                            <div className="text-white font-medium">{suggestion.reviewer.stats.responseTime}h</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Workload:</span>
                            <div className="text-white font-medium">{suggestion.reviewer.workload}%</div>
                          </div>
                        </div>
                        
                        {assignmentMode === 'auto' && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-400 mb-1">Match Reasons:</div>
                            <ul className="text-xs text-gray-300 space-y-1">
                              {suggestion.reasons.slice(0, 3).map((reason, reasonIndex) => (
                                <li key={reasonIndex} className="flex items-start space-x-1">
                                  <span className="text-green-400">•</span>
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {assignmentMode === 'auto' && (
                        <div className="flex items-center space-x-1 mb-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-lg font-bold text-white">{suggestion.score}</span>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>ETA: {suggestion.estimatedCompletionTime.toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <Target className="w-3 h-3" />
                          <span>+{Math.round(suggestion.workloadImpact)}% load</span>
                        </div>
                      </div>
                      
                      {assignmentMode === 'auto' && index < 2 && (
                        <div className="mt-2">
                          <span className="text-xs px-2 py-1 bg-green-900 text-green-300 rounded-full">
                            Recommended
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {assignmentMode === 'auto' && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">AI Recommendation</span>
                </div>
                <p className="text-sm text-blue-200 mt-1">
                  Based on expertise match, availability, and performance history, we recommend assigning 
                  <strong> {suggestions[0]?.reviewer.name}</strong> and <strong> {suggestions[1]?.reviewer.name}</strong> 
                  for optimal review quality and timing.
                </p>
              </div>
            )}

            {assignmentMode === 'manual' && selectedReviewers.length === 0 && (
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-300">No Reviewers Selected</span>
                </div>
                <p className="text-sm text-yellow-200 mt-1">
                  Please select one or more reviewers from the list above.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};