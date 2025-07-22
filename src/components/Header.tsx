import React from 'react';
import { Code, LogOut, User } from 'lucide-react';

interface HeaderProps {
  currentUser?: any;
  userRole?: 'admin' | 'member';
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, userRole, onLogout }) => {

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Code Review Assistant</h1>
              <p className="text-sm text-gray-400">Intelligent code analysis and suggestions</p>
            </div>
          </div>
          
          {currentUser && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{currentUser.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{userRole} • {currentUser.role}</div>
                </div>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};