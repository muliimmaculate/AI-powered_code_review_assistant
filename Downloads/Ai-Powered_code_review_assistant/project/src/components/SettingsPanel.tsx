import React, { useState } from 'react';
import { Settings, Bell, Shield, Palette, Download } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState({
    autoAnalysis: true,
    notifications: true,
    strictMode: false,
    theme: 'dark',
    language: 'javascript'
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="w-5 h-5 text-white" />
        <h2 className="text-lg font-semibold text-white">Settings</h2>
      </div>

      <div className="space-y-6">
        {/* Analysis Settings */}
        <div>
          <h3 className="text-sm font-medium text-white mb-3 flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Analysis Settings</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-gray-300">Auto-analyze on paste</label>
                <p className="text-xs text-gray-500">Automatically analyze code when pasted</p>
              </div>
              <button
                onClick={() => updateSetting('autoAnalysis', !settings.autoAnalysis)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoAnalysis ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoAnalysis ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-gray-300">Strict mode</label>
                <p className="text-xs text-gray-500">Enable stricter analysis rules</p>
              </div>
              <button
                onClick={() => updateSetting('strictMode', !settings.strictMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.strictMode ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.strictMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-2 block">Primary Language</label>
              <select
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div>
          <h3 className="text-sm font-medium text-white mb-3 flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm text-gray-300">Analysis notifications</label>
              <p className="text-xs text-gray-500">Get notified when analysis completes</p>
            </div>
            <button
              onClick={() => updateSetting('notifications', !settings.notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Theme Settings */}
        <div>
          <h3 className="text-sm font-medium text-white mb-3 flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>Appearance</span>
          </h3>
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>

        {/* Export Settings */}
        <div>
          <h3 className="text-sm font-medium text-white mb-3 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </h3>
          <div className="space-y-2">
            <button className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
              Export Analysis Report
            </button>
            <button className="w-full p-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors text-sm">
              Export Settings
            </button>
          </div>
        </div>

        {/* About */}
        <div className="pt-4 border-t border-gray-700">
          <div className="text-center text-sm text-gray-400">
            <p>AI Code Review Assistant v1.0</p>
            <p className="mt-1">Built with React & TypeScript</p>
          </div>
        </div>
      </div>
    </div>
  );
};