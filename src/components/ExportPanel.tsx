import React, { useState } from 'react';
import { Download, GitBranch, Terminal, Copy, Check, FileText, Folder, Command } from 'lucide-react';

interface Analysis {
  score: number;
  originalCode: string;
  fixedCode?: string;
  issues: any[];
}

interface ExportPanelProps {
  analysis: Analysis | null;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ analysis }) => {
  const [exportMethod, setExportMethod] = useState<'git-patch' | 'script' | 'zip' | 'commands'>('git-patch');
  const [copied, setCopied] = useState<string | null>(null);
  const [projectPath, setProjectPath] = useState('');
  const [branchName, setBranchName] = useState('ai-code-review-fixes');

  if (!analysis || !analysis.fixedCode) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center py-12">
          <Download className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Fixed Code Available</h3>
          <p className="text-gray-500">Apply auto-fixes first to enable export options</p>
        </div>
      </div>
    );
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const generateGitPatch = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const patchContent = `From: AI Code Review Assistant <ai@codereview.local>
Date: ${new Date().toISOString()}
Subject: [PATCH] Apply AI code review fixes

Apply automated fixes from AI Code Review Assistant:
- Fixed ${analysis.issues.filter(i => i.canAutoFix).length} auto-fixable issues
- Improved code quality score from ${analysis.score}/10

---
 ${projectPath || 'your-file.js'} | ${analysis.fixedCode.split('\n').length} lines
 1 file changed

diff --git a/${projectPath || 'your-file.js'} b/${projectPath || 'your-file.js'}
index 1234567..abcdefg 100644
--- a/${projectPath || 'your-file.js'}
+++ b/${projectPath || 'your-file.js'}
@@ -1,${analysis.originalCode.split('\n').length} +1,${analysis.fixedCode.split('\n').length} @@
${analysis.originalCode.split('\n').map(line => `-${line}`).join('\n')}
${analysis.fixedCode.split('\n').map(line => `+${line}`).join('\n')}
--
2.40.0
`;
    return patchContent;
  };

  const generateGitCommands = () => {
    const commands = [
      '# Navigate to your project directory',
      `cd ${projectPath || '/path/to/your/project'}`,
      '',
      '# Create a new branch for the fixes',
      `git checkout -b ${branchName}`,
      '',
      '# Apply the fixed code (replace the content of your file)',
      '# Copy the fixed code from the Compare tab and paste it into your file',
      '',
      '# Stage the changes',
      'git add .',
      '',
      '# Commit the changes',
      `git commit -m "Apply AI code review fixes - improved score to ${analysis.score}/10"`,
      '',
      '# Push to remote repository',
      `git push origin ${branchName}`,
      '',
      '# Create a pull request (GitHub CLI)',
      `gh pr create --title "AI Code Review Fixes" --body "Applied ${analysis.issues.filter(i => i.canAutoFix).length} automated fixes from AI Code Review Assistant"`
    ];
    return commands.join('\n');
  };

  const generateUpdateScript = () => {
    const script = `#!/bin/bash
# AI Code Review Assistant - Auto Update Script
# Generated on ${new Date().toISOString()}

set -e

PROJECT_PATH="${projectPath || '/path/to/your/project'}"
BRANCH_NAME="${branchName}"
BACKUP_DIR="$PROJECT_PATH/.ai-review-backup-$(date +%Y%m%d-%H%M%S)"

echo "🤖 AI Code Review Assistant - Auto Update"
echo "========================================"

# Check if we're in a git repository
if [ ! -d "$PROJECT_PATH/.git" ]; then
    echo "❌ Error: Not a git repository. Please run this script from your project root."
    exit 1
fi

# Create backup
echo "📦 Creating backup..."
mkdir -p "$BACKUP_DIR"
cp -r "$PROJECT_PATH"/* "$BACKUP_DIR/" 2>/dev/null || true

# Create new branch
echo "🌿 Creating branch: $BRANCH_NAME"
cd "$PROJECT_PATH"
git checkout -b "$BRANCH_NAME" 2>/dev/null || git checkout "$BRANCH_NAME"

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy the fixed code from the AI Code Review Assistant"
echo "2. Replace your original file content with the fixed code"
echo "3. Run: git add . && git commit -m 'Apply AI code review fixes'"
echo "4. Run: git push origin $BRANCH_NAME"
echo ""
echo "Backup created at: $BACKUP_DIR"
`;
    return script;
  };

  const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const createZipExport = () => {
    // Since we can't create actual ZIP files in the browser without additional libraries,
    // we'll create a structured export with multiple files
    const files = {
      'fixed-code.js': analysis.fixedCode,
      'original-code.js': analysis.originalCode,
      'analysis-report.json': JSON.stringify({
        timestamp: new Date().toISOString(),
        score: analysis.score,
        issuesFixed: analysis.issues.filter(i => i.canAutoFix).length,
        totalIssues: analysis.issues.length,
        issues: analysis.issues
      }, null, 2),
      'apply-fixes.sh': generateUpdateScript(),
      'git-commands.txt': generateGitCommands(),
      'README.md': `# AI Code Review Export

## Files Included
- \`fixed-code.js\` - Your improved code
- \`original-code.js\` - Original code for reference
- \`analysis-report.json\` - Detailed analysis results
- \`apply-fixes.sh\` - Automated setup script
- \`git-commands.txt\` - Manual Git commands

## Quick Start
1. Copy \`fixed-code.js\` content to your project file
2. Run the Git commands from \`git-commands.txt\`
3. Or use \`apply-fixes.sh\` for automated setup

Generated by AI Code Review Assistant on ${new Date().toLocaleString()}
`
    };

    // Download each file separately since we can't create ZIP
    Object.entries(files).forEach(([filename, content]) => {
      setTimeout(() => downloadFile(content, filename), 100);
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Download className="w-5 h-5 text-white" />
        <h2 className="text-lg font-semibold text-white">Export & Sync</h2>
      </div>

      {/* Project Configuration */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Project File Path (optional)
          </label>
          <input
            type="text"
            value={projectPath}
            onChange={(e) => setProjectPath(e.target.value)}
            placeholder="src/components/MyComponent.js"
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Branch Name
          </label>
          <input
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Export Method Selection */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setExportMethod('git-patch')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              exportMethod === 'git-patch'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Git Patch</span>
          </button>
          <button
            onClick={() => setExportMethod('commands')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              exportMethod === 'commands'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Git Commands</span>
          </button>
          <button
            onClick={() => setExportMethod('script')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              exportMethod === 'script'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Command className="w-4 h-4" />
            <span>Auto Script</span>
          </button>
          <button
            onClick={() => setExportMethod('zip')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              exportMethod === 'zip'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Full Export</span>
          </button>
        </div>
      </div>

      {/* Export Content */}
      <div className="space-y-4">
        {exportMethod === 'git-patch' && (
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">Git Patch File</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(generateGitPatch(), 'patch')}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  {copied === 'patch' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => downloadFile(generateGitPatch(), 'ai-code-fixes.patch')}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>
            <pre className="text-xs bg-gray-800 p-3 rounded border text-gray-300 overflow-x-auto max-h-48">
              {generateGitPatch()}
            </pre>
            <div className="mt-3 text-xs text-gray-400">
              <p><strong>Usage:</strong> Save as .patch file and run: <code className="bg-gray-800 px-1 rounded">git apply ai-code-fixes.patch</code></p>
            </div>
          </div>
        )}

        {exportMethod === 'commands' && (
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">Git Commands</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(generateGitCommands(), 'commands')}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  {copied === 'commands' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>Copy All</span>
                </button>
                <button
                  onClick={() => downloadFile(generateGitCommands(), 'git-commands.txt')}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>
            <pre className="text-xs bg-gray-800 p-3 rounded border text-gray-300 overflow-x-auto max-h-48">
              {generateGitCommands()}
            </pre>
            <div className="mt-3 text-xs text-gray-400">
              <p><strong>Usage:</strong> Copy and paste these commands into your terminal one by one</p>
            </div>
          </div>
        )}

        {exportMethod === 'script' && (
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">Automated Setup Script</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(generateUpdateScript(), 'script')}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  {copied === 'script' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => downloadFile(generateUpdateScript(), 'apply-fixes.sh', 'text/x-shellscript')}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>
            <pre className="text-xs bg-gray-800 p-3 rounded border text-gray-300 overflow-x-auto max-h-48">
              {generateUpdateScript()}
            </pre>
            <div className="mt-3 text-xs text-gray-400">
              <p><strong>Usage:</strong> Download, make executable with <code className="bg-gray-800 px-1 rounded">chmod +x apply-fixes.sh</code>, then run <code className="bg-gray-800 px-1 rounded">./apply-fixes.sh</code></p>
            </div>
          </div>
        )}

        {exportMethod === 'zip' && (
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">Complete Export Package</h3>
              <button
                onClick={createZipExport}
                className="flex items-center space-x-1 px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download All Files</span>
              </button>
            </div>
            <div className="text-sm text-gray-300 space-y-2">
              <p>This will download multiple files:</p>
              <ul className="text-xs text-gray-400 space-y-1 ml-4">
                <li>• <code>fixed-code.js</code> - Your improved code</li>
                <li>• <code>original-code.js</code> - Original for comparison</li>
                <li>• <code>analysis-report.json</code> - Detailed analysis</li>
                <li>• <code>apply-fixes.sh</code> - Automated setup script</li>
                <li>• <code>git-commands.txt</code> - Manual commands</li>
                <li>• <code>README.md</code> - Instructions</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <h3 className="text-sm font-medium text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => downloadFile(analysis.fixedCode, 'fixed-code.js')}
            className="flex items-center justify-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Download Fixed Code</span>
          </button>
          <button
            onClick={() => copyToClipboard(analysis.fixedCode, 'fixed-code')}
            className="flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {copied === 'fixed-code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>Copy Fixed Code</span>
          </button>
        </div>
      </div>
    </div>
  );
};