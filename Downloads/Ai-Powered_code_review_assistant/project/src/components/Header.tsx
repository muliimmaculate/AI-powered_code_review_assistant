import React from 'react';
import { Code } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Code Review Assistant</h1>
              <p className="text-sm text-gray-400">Intelligent code analysis and suggestions</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};