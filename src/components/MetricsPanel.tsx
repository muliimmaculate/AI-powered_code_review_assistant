import React from 'react';
import { TrendingUp, Shield, Zap, Target, TestTube, FileText } from 'lucide-react';

interface Metrics {
  complexity: number;
  maintainability: number;
  reliability: number;
  security: number;
  coverage: number;
  documentation: number;
}

interface Analysis {
  score: number;
  metrics: Metrics;
  documentationFeedback: string[];
}

interface MetricsPanelProps {
  analysis: Analysis | null;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Metrics Available</h3>
          <p className="text-gray-500">Analyze your code to see detailed metrics</p>
        </div>
      </div>
    );
  }

  const getMetricColor = (value: number) => {
    if (value >= 8) return 'text-green-400';
    if (value >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressColor = (value: number) => {
    if (value >= 8) return 'bg-green-500';
    if (value >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const MetricCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    description: string;
  }> = ({ title, value, icon, description }) => (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-sm font-medium text-white">{title}</h3>
        </div>
        <span className={`text-lg font-bold ${getMetricColor(value)}`}>
          {value.toFixed(1)}
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full ${getProgressColor(value)}`}
          style={{ width: `${(value / 10) * 100}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Code Quality Metrics</h2>
        <div className="text-sm text-gray-400">
          Based on static analysis
        </div>
      </div>

      <div className="space-y-4">
        <MetricCard
          title="Complexity"
          value={analysis.metrics.complexity}
          icon={<Target className="w-4 h-4 text-purple-400" />}
          description="Cyclomatic complexity measures code complexity"
        />

        <MetricCard
          title="Maintainability"
          value={analysis.metrics.maintainability}
          icon={<TrendingUp className="w-4 h-4 text-blue-400" />}
          description="How easy it is to maintain and modify the code"
        />

        <MetricCard
          title="Reliability"
          value={analysis.metrics.reliability}
          icon={<Shield className="w-4 h-4 text-green-400" />}
          description="Likelihood of bugs and runtime errors"
        />

        <MetricCard
          title="Security"
          value={analysis.metrics.security}
          icon={<Shield className="w-4 h-4 text-red-400" />}
          description="Potential security vulnerabilities"
        />

        <MetricCard
          title="Documentation"
          value={analysis.metrics.documentation}
          icon={<FileText className="w-4 h-4 text-cyan-400" />}
          description="Quality and coverage of code documentation"
        />

        <MetricCard
          title="Test Coverage"
          value={analysis.metrics.coverage}
          icon={<TestTube className="w-4 h-4 text-indigo-400" />}
          description="Estimated test coverage based on code structure"
        />
      </div>

      {/* Documentation Feedback */}
      {analysis.documentationFeedback && analysis.documentationFeedback.length > 0 && (
        <div className="mt-6 p-4 bg-gray-900 rounded-lg">
          <h3 className="text-sm font-medium text-white mb-2 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Documentation Feedback</span>
          </h3>
          <ul className="text-sm text-gray-300 space-y-1">
            {analysis.documentationFeedback.map((feedback, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>{feedback}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-900 rounded-lg">
        <h3 className="text-sm font-medium text-white mb-2">Recommendations</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          {analysis.metrics.complexity > 7 && (
            <li>• Consider breaking down complex functions</li>
          )}
          {analysis.metrics.security < 7 && (
            <li>• Review security best practices</li>
          )}
          {analysis.metrics.coverage < 80 && (
            <li>• Increase test coverage for better reliability</li>
          )}
          {analysis.metrics.maintainability < 7 && (
            <li>• Improve code documentation and structure</li>
          )}
          {analysis.metrics.documentation < 6 && (
            <li>• Add more comments and documentation</li>
          )}
        </ul>
      </div>
    </div>
  );
};