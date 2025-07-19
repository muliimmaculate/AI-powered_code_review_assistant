import React from 'react';

interface ReviewPanelProps {
  analysis: any;
  isAnalyzing: boolean;
  onAutoFix: () => void;
  sessionId: string;
}

interface ReviewPanelProps {
  analysis: any;
  isAnalyzing: boolean;
  onAutoFix: () => void;
  sessionId: string;
}

const ReviewPanel: React.FC<ReviewPanelProps> = ({ analysis, isAnalyzing, onAutoFix, sessionId }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-2 text-white">Review Results</h3>
      <div className="text-gray-400">[Code review results and suggestions will appear here]</div>
    </div>
  );
};

export default ReviewPanel; 