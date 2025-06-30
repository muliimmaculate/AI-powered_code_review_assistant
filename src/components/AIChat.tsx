import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Lightbulb, Code, FileText, Zap } from 'lucide-react';

interface Analysis {
  score: number;
  issues: any[];
  metrics: any;
}

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIChatProps {
  analysis: Analysis | null;
  code: string;
}

export const AIChat: React.FC<AIChatProps> = ({ analysis, code }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (analysis && messages.length === 0) {
      // Initial AI greeting based on analysis
      const greeting: Message = {
        id: 1,
        type: 'ai',
        content: `Hello! I've analyzed your code and found ${analysis.issues.length} issues with an overall score of ${analysis.score}/10. How can I help you improve your code today?`,
        timestamp: new Date(),
        suggestions: [
          'Explain the most critical issues',
          'How to improve code quality?',
          'Best practices for this code',
          'Security recommendations'
        ]
      };
      setMessages([greeting]);
    }
  }, [analysis]);

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (!analysis) {
      return "Please analyze your code first so I can provide specific recommendations based on your code.";
    }

    // Context-aware responses based on analysis
    if (message.includes('critical') || message.includes('important') || message.includes('urgent')) {
      const criticalIssues = analysis.issues.filter(issue => issue.severity === 'high');
      if (criticalIssues.length > 0) {
        return `I found ${criticalIssues.length} critical issue(s) in your code:\n\n${criticalIssues.map(issue => `• ${issue.message} (Line ${issue.line})`).join('\n')}\n\nThese should be addressed immediately as they could cause security vulnerabilities or runtime errors.`;
      }
      return "Great news! I didn't find any critical issues in your code. The main areas for improvement are code style and best practices.";
    }

    if (message.includes('security')) {
      const securityIssues = analysis.issues.filter(issue => issue.category === 'Security');
      if (securityIssues.length > 0) {
        return `I found ${securityIssues.length} security-related issue(s):\n\n${securityIssues.map(issue => `• ${issue.message}\n  Suggestion: ${issue.suggestion}`).join('\n\n')}\n\nSecurity should always be a top priority. Would you like me to explain any of these in more detail?`;
      }
      return `Your code looks secure! I didn't find any obvious security vulnerabilities. Your security score is ${analysis.metrics.security}/10. Keep following security best practices!`;
    }

    if (message.includes('performance') || message.includes('optimize')) {
      const performanceIssues = analysis.issues.filter(issue => issue.category === 'Performance');
      if (performanceIssues.length > 0) {
        return `Here are some performance optimization opportunities:\n\n${performanceIssues.map(issue => `• ${issue.message}\n  Suggestion: ${issue.suggestion}`).join('\n\n')}\n\nOptimizing these areas could significantly improve your application's performance.`;
      }
      return "Your code looks well-optimized! I didn't find any obvious performance bottlenecks. Consider profiling your application under load to identify any runtime performance issues.";
    }

    if (message.includes('documentation') || message.includes('comment')) {
      return `Your documentation score is ${analysis.metrics.documentation}/10. Here are some tips to improve it:\n\n• Add JSDoc comments to all functions\n• Explain complex logic with inline comments\n• Document function parameters and return values\n• Add README files for project overview\n• Use meaningful variable and function names\n\nGood documentation makes your code maintainable and helps other developers understand your work.`;
    }

    if (message.includes('best practice') || message.includes('improve')) {
      const suggestions = [
        "Use consistent naming conventions throughout your code",
        "Add error handling for all async operations",
        "Keep functions small and focused on a single responsibility",
        "Use TypeScript for better type safety",
        "Add unit tests to ensure code reliability",
        "Follow the DRY principle (Don't Repeat Yourself)",
        "Use modern JavaScript features like arrow functions and destructuring"
      ];
      return `Here are some best practices to improve your code quality:\n\n${suggestions.map(s => `• ${s}`).join('\n')}\n\nYour current maintainability score is ${analysis.metrics.maintainability}/10. Implementing these practices will help improve it!`;
    }

    if (message.includes('fix') || message.includes('auto')) {
      const autoFixableIssues = analysis.issues.filter(issue => issue.canAutoFix);
      if (autoFixableIssues.length > 0) {
        return `I can automatically fix ${autoFixableIssues.length} issues for you:\n\n${autoFixableIssues.map(issue => `• ${issue.message}`).join('\n')}\n\nGo to the Review tab and click the "Auto-Fix All" button to apply these fixes automatically!`;
      }
      return "Most of the issues in your code require manual attention, but I can guide you through fixing them step by step. Which specific issue would you like help with?";
    }

    if (message.includes('score') || message.includes('rating')) {
      return `Your code quality breakdown:\n\n• Overall Score: ${analysis.score}/10\n• Complexity: ${analysis.metrics.complexity}/10\n• Maintainability: ${analysis.metrics.maintainability}/10\n• Reliability: ${analysis.metrics.reliability}/10\n• Security: ${analysis.metrics.security}/10\n• Documentation: ${analysis.metrics.documentation}/10\n\nThe areas that need the most attention are those with lower scores. Would you like specific advice on improving any of these metrics?`;
    }

    // Default response with helpful suggestions
    return `I'm here to help you improve your code! Based on your analysis, I can assist with:\n\n• Explaining specific issues and how to fix them\n• Security and performance recommendations\n• Code quality best practices\n• Documentation improvements\n\nWhat specific aspect would you like to discuss?`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: generateAIResponse(inputMessage),
        timestamp: new Date(),
        suggestions: [
          'Tell me more about this',
          'How do I implement this?',
          'What are the alternatives?',
          'Show me an example'
        ]
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const quickActions = [
    { icon: Zap, text: 'Critical Issues', action: 'What are the most critical issues?' },
    { icon: Code, text: 'Best Practices', action: 'How can I improve code quality?' },
    { icon: FileText, text: 'Documentation', action: 'How to improve documentation?' },
    { icon: Lightbulb, text: 'Suggestions', action: 'Give me improvement suggestions' }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6 h-96 sm:h-[500px] flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <MessageCircle className="w-5 h-5 text-white" />
        <h2 className="text-lg font-semibold text-white">AI Code Assistant</h2>
        <div className="flex-1"></div>
        <div className="text-xs text-gray-400">
          {analysis ? `${analysis.issues.length} issues found` : 'No analysis yet'}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && !analysis && (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">AI Assistant Ready</h3>
            <p className="text-gray-500 mb-4">Analyze your code first, then I can provide personalized recommendations</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(action.action)}
                  className="flex items-center space-x-2 p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  disabled={!analysis}
                >
                  <action.icon className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">{action.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(message => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' ? 'bg-blue-600' : 'bg-green-600'
              }`}>
                {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`rounded-lg p-3 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-100'
              }`}>
                <div className="text-sm whitespace-pre-line">{message.content}</div>
                <div className="text-xs opacity-75 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
                {message.suggestions && (
                  <div className="mt-3 space-y-1">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left text-xs p-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask me about your code..."
          className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isTyping}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isTyping}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};