import React, { useState } from 'react';
import { Settings, Bell, Shield, Palette, Download } from 'lucide-react';

interface SettingsPanelProps {
  customRules: any[];
  onRulesChange: (rules: any[]) => void;
  settings: {
    autoAnalysis: boolean;
    notifications: boolean;
    strictMode: boolean;
    theme: string;
    language: string;
  };
  onSettingsChange: (key: string, value: any) => void;
}

const defaultNewRule = {
  message: '',
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ customRules, onRulesChange, settings, onSettingsChange }) => {
  // Local settings state (not persisted globally)
  // const [settings, setSettings] = useState({
  //   autoAnalysis: true,
  //   notifications: true,
  //   strictMode: false,
  //   theme: 'dark',
  //   language: 'javascript'
  // });

  // const updateSetting = (key: string, value: any) => {
  //   setSettings(prev => ({ ...prev, [key]: value }));
  // };

  // Custom rules logic
  const [newRule, setNewRule] = useState({ ...defaultNewRule });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<any>(null);

  const handleAddRule = () => {
    if (newRule.message.trim()) {
      onRulesChange([
        ...customRules,
        { message: newRule.message }
      ]);
      setNewRule({ ...defaultNewRule });
    }
  };

  const handleDeleteRule = (idx: number) => {
    const updated = customRules.filter((_, i) => i !== idx);
    onRulesChange(updated);
  };

  const handleEditRule = (idx: number) => {
    setEditingIndex(idx);
    setEditingValue({ ...customRules[idx] });
  };

  const handleSaveEdit = (idx: number) => {
    const updated = customRules.map((rule, i) => i === idx ? { ...editingValue } : rule);
    onRulesChange(updated);
    setEditingIndex(null);
    setEditingValue(null);
  };

  const handleToggleRule = (idx: number) => {
    const updated = customRules.map((rule, i) => i === idx ? { ...rule, enabled: !rule.enabled } : rule);
    onRulesChange(updated);
  };

  return (
    <div className="bg-gray-800 text-white rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="w-5 h-5 text-white" />
        <h2 className="text-lg font-semibold text-white">Settings</h2>
      </div>
      <div className="space-y-6">
        {/* Analysis Settings */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center space-x-2 text-white">
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
                onClick={() => onSettingsChange('autoAnalysis', !settings.autoAnalysis)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoAnalysis ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.autoAnalysis ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-gray-300">Strict mode</label>
                <p className="text-xs text-gray-500">Enable stricter analysis rules</p>
              </div>
              <button
                onClick={() => onSettingsChange('strictMode', !settings.strictMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.strictMode ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.strictMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Primary Language</label>
              <select
                value={settings.language}
                onChange={(e) => onSettingsChange('language', e.target.value)}
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
              onClick={() => onSettingsChange('notifications', !settings.notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notifications ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
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
        {/* Custom Rules Section */}
        <div className="bg-gray-900 rounded-lg p-4 mt-8">
          <h3 className="text-lg font-medium mb-4 text-white">Custom Code Analysis Rules</h3>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-2">
            <input
              type="text"
              value={newRule.message}
              onChange={e => setNewRule(n => ({ ...n, message: e.target.value }))}
              placeholder="Message (required)"
              className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-300 text-sm col-span-2"
            />
            <button
              onClick={handleAddRule}
              className="px-3 py-1 rounded col-span-1 bg-blue-600 text-white hover:bg-blue-700"
              disabled={!newRule.message.trim()}
            >
              Add Rule
            </button>
          </div>
          <ul className="space-y-2">
            {customRules.length === 0 && (
              <li className="text-gray-400 text-sm">No custom rules added yet.</li>
            )}
            {customRules.map((rule, idx) => (
              <li key={idx} className="bg-gray-800 flex flex-col md:flex-row md:items-center gap-2 rounded p-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="flex-1 text-white">{rule.message}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};