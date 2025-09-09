const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
require("dotenv").config();

setGlobalOptions({ maxInstances: 10 });

// CORS helper
const withCors = (handler) => async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }
  return handler(req, res);
};

// Email transporter (Gmail or Ethereal fallback)
let cachedTransporter = null;
async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    return cachedTransporter;
  }
  const test = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: test.user, pass: test.pass },
  });
  return cachedTransporter;
}



// Note: transporter is provided by getTransporter()

// Cloud Function to send recommendation email
exports.sendRecommendationEmail = onRequest(withCors(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { name, email, recommendation } = req.body;

  if (!name || !email || !recommendation) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Ensure recommendations are always an array of tips
  let tips = [];
  if (Array.isArray(recommendation)) {
    tips = recommendation;
  } else if (typeof recommendation === 'string') {
    // Split on newlines, semicolons, or period+space, and filter out empty tips
    tips = recommendation
      .split(/\n|;|\.\s+/)
      .map(t => t.trim())
      .filter(t => t.length > 0);
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Code Review Recommendation for ${name}`,
    text: `Hello ${name},\n\nHere are your code review recommendations:\n\n${tips.map(t => '- ' + t).join('\n')}\n\nBest regards,\nAI Code Review Assistant`,
    html: `
      <div style="max-width:520px;margin:36px auto;background:#fff;border-radius:14px;box-shadow:0 4px 24px #e3e8f0;border:1px solid #e5e7eb;padding:0;font-family:'Segoe UI',Arial,sans-serif;overflow:hidden;">
        <div style="background:#2563eb;padding:28px 0 16px 0;text-align:center;border-radius:14px 14px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:2rem;letter-spacing:0.5px;font-weight:700;">Code Review Recommendations</h1>
        </div>
        <div style="padding:32px 32px 24px 32px;background:#fff;">
          <p style="font-size:17px;color:#1e293b;margin:0 0 18px 0;">Hello <strong>${name}</strong>,</p>
          <p style="font-size:15px;color:#334155;margin:0 0 20px 0;">Please find below your code review recommendations:</p>
          <ul style="padding-left:0;list-style:none;margin:0 0 18px 0;">
            ${
              tips.map(t => `
                <li style="display:flex;align-items:flex-start;margin-bottom:14px;font-size:15px;line-height:1.7;">
                  <span style='display:inline-block;color:#2563eb;font-size:1.1em;margin-right:12px;margin-top:2px;'>&#10003;</span>
                  <span style='display:inline-block;vertical-align:top;'>${t}</span>
                </li>
              `).join('')
            }
          </ul>
          <div style="height:1px;background:#e5e7eb;margin:32px 0 18px 0;border-radius:2px;"></div>
          <div style="text-align:right;">
            <span style="color:#2563eb;font-weight:600;font-size:14px;">AI Code Review Assistant</span>
          </div>
        </div>
      
      </div>
    `,
  };

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
    return res.status(200).json({ success: true, message: 'Email sent successfully', previewUrl });
  } catch (error) {
    logger.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
<<<<<<< HEAD
}));

// Add a new endpoint to trigger Firebase password reset email
const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp();
}
exports.sendPasswordReset = onRequest(withCors(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }
  try {
    const link = await admin.auth().generatePasswordResetLink(email);
    // Optionally, you could send this link via email, but for now just return it
    return res.status(200).json({ success: true, link });
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    return res.status(500).json({ error: 'Failed to send password reset email' });
  }
}));

// New endpoint: send full analysis report via email
exports.sendAnalysisReport = onRequest(withCors(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { email, subject, content, name } = req.body || {};

  if (!email || !content) {
    return res.status(400).json({ error: 'Missing required fields: email, content' });
  }

  const safeSubject = subject || 'Code Analysis Results';
  const recipientName = name || 'there';

  const html = `
    <div style="max-width:720px;margin:24px auto;font-family:Segoe UI,Arial,sans-serif;color:#0f172a;">
      <h2 style="margin:0 0 12px 0;color:#111827;">${safeSubject}</h2>
      <p style="margin:0 0 16px 0;color:#374151;">Hello ${recipientName},</p>
      <p style="margin:0 0 16px 0;color:#374151;">Here are your code analysis results:</p>
      <pre style="white-space:pre-wrap;background:#0b1220;color:#e5e7eb;padding:16px;border-radius:8px;border:1px solid #1f2937;font-size:14px;">${content}
      </pre>
      <p style="margin:16px 0 0 0;color:#6b7280;font-size:13px;">This email was sent automatically by AI Code Review Assistant.</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: safeSubject,
    text: `Hello ${recipientName},\n\nHere are your code analysis results:\n\n${content}\n\n— AI Code Review Assistant`,
    html,
  };

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
    return res.status(200).json({ success: true, previewUrl });
  } catch (error) {
    logger.error('Error sending analysis report email:', error);
    return res.status(500).json({ error: 'Failed to send analysis report' });
  }
}));

// New endpoint: Analyze JS/TS using ESLint for precise results
exports.analyzeCode = onRequest(withCors(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  const { code, language } = req.body || {};
  if (!code) {
    return res.status(400).json({ error: 'Missing code' });
  }
  // Input size limit: 200KB
  const maxBytes = 200 * 1024;
  if (Buffer.byteLength(code, 'utf8') > maxBytes) {
    return res.status(413).json({ error: 'Code too large. Max 200KB.' });
  }
  try {
    // HTML precise validation
    if (language === 'xml' || language === 'html') {
      const rules = { 'tagname-lowercase': true, 'attr-lowercase': true, 'attr-value-double-quotes': true, 'doctype-first': false };
      const messages = HTMLHint.verify(code, rules);
      const issues = messages.map(m => ({
        type: 'lint-warning',
        severity: m.type === 'error' ? 'high' : 'medium',
        category: 'Markup',
        message: m.message,
        line: m.line || 1,
        column: m.col || 1,
        code: '',
        suggestion: 'Adjust markup per rule',
        fixedCode: '',
        confidence: 90,
        impact: m.type === 'error' ? 'high' : 'medium',
        effort: 'low',
        references: [],
      }));
      const analysis = {
        language: language,
        overallScore: Math.max(0, 100 - issues.length * 5),
        issues,
        metrics: {
          complexity: 0, maintainability: 100 - issues.length * 3, readability: 100 - issues.length * 2,
          performance: 100, security: 100, documentation: 0, cyclomaticComplexity: 0, cognitiveComplexity: 0,
          linesOfCode: code.split('\n').length, duplicateLines: 0, testCoverage: 0,
        },
        summary: {
          totalIssues: issues.length,
          criticalIssues: issues.filter(i => i.severity === 'critical').length,
          highIssues: issues.filter(i => i.severity === 'high').length,
          mediumIssues: issues.filter(i => i.severity === 'medium').length,
          lowIssues: issues.filter(i => i.severity === 'low').length,
          securityIssues: 0, performanceIssues: 0, qualityIssues: issues.length,
        },
        recommendations: [],
        codeSmells: issues.length,
        technicalDebt: `Estimated ${(issues.length * 0.2).toFixed(1)} hours to fix markup issues.`,
      };
      return res.status(200).json({ success: true, analysis });
    }

    // Java lightweight static checks (simplest heuristic)
    if (language === 'java') {
      const issues = [];
      const lines = code.split('\n');
      const loc = lines.length;
      // Basic brace/paren balance
      const openBraces = (code.match(/\{/g) || []).length;
      const closeBraces = (code.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        issues.push({ type: 'syntax', severity: 'high', category: 'Syntax', message: 'Unbalanced braces', line: 1, column: 1, code: '', suggestion: 'Ensure { and } are balanced', fixedCode: '', confidence: 90, impact: 'high', effort: 'low' });
      }
      const openParens = (code.match(/\(/g) || []).length;
      const closeParens = (code.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        issues.push({ type: 'syntax', severity: 'high', category: 'Syntax', message: 'Unbalanced parentheses', line: 1, column: 1, code: '', suggestion: 'Ensure ( and ) are balanced', fixedCode: '', confidence: 90, impact: 'high', effort: 'low' });
      }
      // Public class name presence
      if (!/public\s+class\s+[A-Z][A-Za-z0-9_]*/.test(code)) {
        issues.push({ type: 'lint-warning', severity: 'medium', category: 'Code Quality', message: 'No public class detected or naming not in PascalCase', line: 1, column: 1, code: '', suggestion: 'Declare a public class with PascalCase name', fixedCode: '', confidence: 70, impact: 'medium', effort: 'low' });
      }
      // System.out.println usage
      if (/System\.out\.println\s*\(/.test(code)) {
        issues.push({ type: 'lint-warning', severity: 'low', category: 'Code Quality', message: 'Debug printing detected (System.out.println)', line: 1, column: 1, code: '', suggestion: 'Use a logger instead of System.out.println', fixedCode: '', confidence: 80, impact: 'low', effort: 'low' });
      }
      // Method length heuristic
      let inMethod = false; let methodLen = 0; let longMethods = 0;
      lines.forEach(l => {
        const t = l.trim();
        if (/\b(public|private|protected|static)\b.*\(.*\)\s*\{\s*$/.test(t)) { inMethod = true; methodLen = 0; }
        if (inMethod) methodLen++;
        if (inMethod && /}\s*$/.test(t)) { if (methodLen > 60) longMethods++; inMethod = false; }
      });
      if (longMethods > 0) {
        issues.push({ type: 'maintainability', severity: 'medium', category: 'Maintainability', message: 'Long methods detected', line: 1, column: 1, code: '', suggestion: 'Refactor long methods into smaller ones', fixedCode: '', confidence: 80, impact: 'medium', effort: 'medium' });
      }
      const analysis = {
        language: 'java',
        overallScore: Math.max(0, 100 - (issues.length * 5 + longMethods * 2)),
        issues,
        metrics: { complexity: 0, maintainability: Math.max(20, 100 - longMethods * 5 - issues.length * 3), readability: Math.max(30, 100 - longMethods * 3), performance: 100, security: 100, documentation: 0, cyclomaticComplexity: 0, cognitiveComplexity: 0, linesOfCode: loc, duplicateLines: 0, testCoverage: 0 },
        summary: { totalIssues: issues.length, criticalIssues: issues.filter(i=>i.severity==='critical').length, highIssues: issues.filter(i=>i.severity==='high').length, mediumIssues: issues.filter(i=>i.severity==='medium').length, lowIssues: issues.filter(i=>i.severity==='low').length, securityIssues: 0, performanceIssues: 0, qualityIssues: issues.length },
        recommendations: issues.length ? ['Address syntax and maintainability findings.'] : [],
        codeSmells: longMethods + (issues.length>0?1:0),
        technicalDebt: `Estimated ${(issues.length * 0.2 + longMethods * 0.3).toFixed(1)} hours`,
      };
      return res.status(200).json({ success: true, analysis });
    }

    // C/C++ lightweight static checks (simplest heuristic)
    if (language === 'c' || language === 'cpp' || language === 'c++') {
      const issues = [];
      const lines = code.split('\n');
      const loc = lines.length;
      const openBraces = (code.match(/\{/g) || []).length;
      const closeBraces = (code.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        issues.push({ type: 'syntax', severity: 'high', category: 'Syntax', message: 'Unbalanced braces', line: 1, column: 1, code: '', suggestion: 'Ensure { and } are balanced', fixedCode: '', confidence: 90, impact: 'high', effort: 'low' });
      }
      const openParens = (code.match(/\(/g) || []).length;
      const closeParens = (code.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        issues.push({ type: 'syntax', severity: 'high', category: 'Syntax', message: 'Unbalanced parentheses', line: 1, column: 1, code: '', suggestion: 'Ensure ( and ) are balanced', fixedCode: '', confidence: 90, impact: 'high', effort: 'low' });
      }
      // Dangerous functions
      ['gets', 'strcpy', 'strcat', 'sprintf'].forEach(fn => {
        const re = new RegExp(`\\b${fn}\\s*\\(`);
        if (re.test(code)) {
          issues.push({ type: 'security', severity: 'high', category: 'Security', message: `Potentially unsafe function: ${fn}()`, line: 1, column: 1, code: '', suggestion: 'Use safer alternatives (e.g., fgets, strncpy, strncat, snprintf)', fixedCode: '', confidence: 85, impact: 'high', effort: 'low' });
        }
      });
      // Very long functions heuristic
      let inFunc = false; let depth = 0; let funcLen = 0; let longFuncs = 0;
      lines.forEach(l => {
        if (/\)\s*\{\s*$/.test(l.trim())) { inFunc = true; funcLen = 0; depth = 1; }
        if (inFunc) funcLen++;
        if (inFunc && /\{/.test(l)) depth++;
        if (inFunc && /\}/.test(l)) { depth--; if (depth <= 0) { if (funcLen > 80) longFuncs++; inFunc = false; } }
      });
      if (longFuncs > 0) {
        issues.push({ type: 'maintainability', severity: 'medium', category: 'Maintainability', message: 'Long functions detected', line: 1, column: 1, code: '', suggestion: 'Refactor long functions into smaller ones', fixedCode: '', confidence: 80, impact: 'medium', effort: 'medium' });
      }
      const analysis = {
        language: language,
        overallScore: Math.max(0, 100 - (issues.length * 5 + longFuncs * 2)),
        issues,
        metrics: { complexity: 0, maintainability: Math.max(20, 100 - longFuncs * 5 - issues.length * 3), readability: Math.max(30, 100 - longFuncs * 3), performance: 100, security: 100 - (issues.filter(i=>i.category==='Security').length*10), documentation: 0, cyclomaticComplexity: 0, cognitiveComplexity: 0, linesOfCode: loc, duplicateLines: 0, testCoverage: 0 },
        summary: { totalIssues: issues.length, criticalIssues: 0, highIssues: issues.filter(i=>i.severity==='high').length, mediumIssues: issues.filter(i=>i.severity==='medium').length, lowIssues: issues.filter(i=>i.severity==='low').length, securityIssues: issues.filter(i=>i.category==='Security').length, performanceIssues: 0, qualityIssues: issues.length },
        recommendations: issues.length ? ['Replace unsafe functions and refactor long functions.'] : [],
        codeSmells: longFuncs + (issues.length>0?1:0),
        technicalDebt: `Estimated ${(issues.length * 0.2 + longFuncs * 0.3).toFixed(1)} hours`,
      };
      return res.status(200).json({ success: true, analysis });
    }

    // Python precise validation via Pyright (static type checker)
    if (language === 'python') {
      const dir = mkdtempSync(join(tmpdir(), 'pyright-'));
      try {
        const file = join(dir, 'file.py');
        writeFileSync(file, code, 'utf8');
        const config = { pythonVersion: '3.11' };
        writeFileSync(join(dir, 'pyrightconfig.json'), JSON.stringify(config), 'utf8');
        const run = () => new Promise((resolve) => {
          execFile(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['pyright', file, '--outputjson'], { cwd: dir }, (err, stdout, stderr) => {
            if (err && !stdout) {
              resolve({ error: String(stderr || err.message) });
              return;
            }
            try { resolve(JSON.parse(stdout)); } catch (e) { resolve({ error: 'Failed to parse pyright output' }); }
          });
        });
        const result = await run();
        if (result.error) {
          return res.status(500).json({ error: result.error });
        }
        const diagnostics = (result.generalDiagnostics || []).map(d => ({
          type: 'lint-error',
          severity: d.severity === 'error' ? 'high' : 'medium',
          category: 'Type/Semantic',
          message: d.message,
          line: (d.range && d.range.start && d.range.start.line + 1) || 1,
          column: (d.range && d.range.start && d.range.start.character + 1) || 1,
          code: '',
          suggestion: 'Review Pyright message and adjust types/logic',
          fixedCode: '',
          confidence: 90,
          impact: d.severity === 'error' ? 'high' : 'medium',
          effort: 'low',
          references: ['https://microsoft.github.io/pyright/'],
        }));
        const errorCount = diagnostics.filter(i => i.severity === 'high').length;
        const warningCount = diagnostics.filter(i => i.severity === 'medium').length;
        const analysis = {
          language: 'python',
          overallScore: Math.max(0, 100 - (errorCount * 10 + warningCount * 3)),
          issues: diagnostics,
          metrics: {
            complexity: 0,
            maintainability: Math.max(10, 100 - (errorCount * 8 + warningCount * 2)),
            readability: Math.max(10, 100 - (warningCount * 2)),
            performance: 100,
            security: 100,
            documentation: 0,
            cyclomaticComplexity: 0,
            cognitiveComplexity: 0,
            linesOfCode: code.split('\n').length,
            duplicateLines: 0,
            testCoverage: 0,
          },
          summary: {
            totalIssues: diagnostics.length,
            criticalIssues: 0,
            highIssues: errorCount,
            mediumIssues: warningCount,
            lowIssues: 0,
            securityIssues: 0,
            performanceIssues: 0,
            qualityIssues: diagnostics.length,
          },
          recommendations: [],
          codeSmells: errorCount + Math.ceil(warningCount / 2),
          technicalDebt: `Estimated ${(errorCount * 0.5 + warningCount * 0.2).toFixed(1)} hours to address issues.`,
        };
        return res.status(200).json({ success: true, analysis });
      } finally {
        try { rmSync(dir, { recursive: true, force: true }); } catch {}
      }
    }

    // CSS precise validation
    if (language === 'css' || language === 'scss') {
      const result = await stylelint.lint({
        code,
        codeFilename: language === 'scss' ? 'file.scss' : 'file.css',
        config: { extends: ['stylelint-config-standard'] },
      });
      const warnings = (result.results && result.results[0] && result.results[0].warnings) || [];
      const issues = warnings.map(w => ({
        type: 'lint-warning',
        severity: w.severity === 'error' ? 'high' : 'medium',
        category: 'Style',
        message: `${w.text}`,
        line: w.line || 1,
        column: w.column || 1,
        code: '',
        suggestion: 'Adjust CSS to satisfy stylelint rule',
        fixedCode: '',
        confidence: 90,
        impact: w.severity === 'error' ? 'high' : 'medium',
        effort: 'low',
        references: [],
      }));
      const analysis = {
        language,
        overallScore: Math.max(0, 100 - issues.length * 3),
        issues,
        metrics: {
          complexity: 0, maintainability: 100 - issues.length * 2, readability: 100 - issues.length,
          performance: 100, security: 100, documentation: 0, cyclomaticComplexity: 0, cognitiveComplexity: 0,
          linesOfCode: code.split('\n').length, duplicateLines: 0, testCoverage: 0,
        },
        summary: {
          totalIssues: issues.length,
          criticalIssues: issues.filter(i => i.severity === 'critical').length,
          highIssues: issues.filter(i => i.severity === 'high').length,
          mediumIssues: issues.filter(i => i.severity === 'medium').length,
          lowIssues: issues.filter(i => i.severity === 'low').length,
          securityIssues: 0, performanceIssues: 0, qualityIssues: issues.length,
        },
        recommendations: [],
        codeSmells: issues.length,
        technicalDebt: `Estimated ${(issues.length * 0.2).toFixed(1)} hours to fix CSS issues.`,
      };
      return res.status(200).json({ success: true, analysis });
    }

    // Markdown precise validation
    if (language === 'markdown' || language === 'md') {
      const options = { strings: { content: code } };
      const results = markdownlint.sync(options);
      const list = results.content || [];
      const issues = list.map(r => ({
        type: 'lint-warning',
        severity: 'medium',
        category: 'Documentation',
        message: `${r.ruleNames.join('/')}: ${r.ruleDescription}`,
        line: r.lineNumber || 1,
        column: 1,
        code: '',
        suggestion: 'Adjust markdown to satisfy rule',
        fixedCode: '',
        confidence: 90,
        impact: 'medium',
        effort: 'low',
        references: [`https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md#${(r.ruleNames[0]||'').toLowerCase()}`],
      }));
      const analysis = {
        language: 'markdown', overallScore: Math.max(0, 100 - issues.length * 2), issues,
        metrics: { complexity: 0, maintainability: 100 - issues.length, readability: 100 - issues.length, performance: 100, security: 100, documentation: 100 - issues.length, cyclomaticComplexity: 0, cognitiveComplexity: 0, linesOfCode: code.split('\n').length, duplicateLines: 0, testCoverage: 0 },
        summary: { totalIssues: issues.length, criticalIssues: 0, highIssues: 0, mediumIssues: issues.length, lowIssues: 0, securityIssues: 0, performanceIssues: 0, qualityIssues: issues.length },
        recommendations: [], codeSmells: issues.length, technicalDebt: `${(issues.length * 0.1).toFixed(1)} hours`,
      };
      return res.status(200).json({ success: true, analysis });
    }

    // JSON precise validation
    if (language === 'json') {
      let error = null;
      try { JSON.parse(code); } catch (e) { error = e; }
      const issues = error ? [{
        type: 'syntax', severity: 'high', category: 'Syntax', message: String(error.message || error), line: 1, column: 1,
        code: '', suggestion: 'Fix JSON syntax (quoting, commas, braces)', fixedCode: '', confidence: 100, impact: 'high', effort: 'low',
      }] : [];
      const analysis = {
        language: 'json', overallScore: issues.length ? 60 : 100, issues,
        metrics: { complexity: 0, maintainability: 100 - issues.length * 5, readability: 100 - issues.length * 3, performance: 100, security: 100, documentation: 0, cyclomaticComplexity: 0, cognitiveComplexity: 0, linesOfCode: code.split('\n').length, duplicateLines: 0, testCoverage: 0 },
        summary: { totalIssues: issues.length, criticalIssues: 0, highIssues: issues.length, mediumIssues: 0, lowIssues: 0, securityIssues: 0, performanceIssues: 0, qualityIssues: issues.length },
        recommendations: [], codeSmells: issues.length, technicalDebt: `${(issues.length * 0.1).toFixed(1)} hours`,
      };
      return res.status(200).json({ success: true, analysis });
    }

    // YAML precise validation
    if (language === 'yaml' || language === 'yml') {
      let error = null;
      try { YAML.load(code); } catch (e) { error = e; }
      const issues = error ? [{
        type: 'syntax', severity: 'high', category: 'Syntax', message: String(error.message || error), line: 1, column: 1,
        code: '', suggestion: 'Fix YAML syntax (indentation, colons)', fixedCode: '', confidence: 100, impact: 'high', effort: 'low',
      }] : [];
      const analysis = {
        language: 'yaml', overallScore: issues.length ? 60 : 100, issues,
        metrics: { complexity: 0, maintainability: 100 - issues.length * 5, readability: 100 - issues.length * 3, performance: 100, security: 100, documentation: 0, cyclomaticComplexity: 0, cognitiveComplexity: 0, linesOfCode: code.split('\n').length, duplicateLines: 0, testCoverage: 0 },
        summary: { totalIssues: issues.length, criticalIssues: 0, highIssues: issues.length, mediumIssues: 0, lowIssues: 0, securityIssues: 0, performanceIssues: 0, qualityIssues: issues.length },
        recommendations: [], codeSmells: issues.length, technicalDebt: `${(issues.length * 0.1).toFixed(1)} hours`,
      };
      return res.status(200).json({ success: true, analysis });
    }

    // XML precise validation
    if (language === 'xml') {
      const parser = new XMLParser({ ignoreAttributes: false, allowBooleanAttributes: true, preserveOrder: false, stopNodes: [] });
      let error = null;
      try { parser.parse(code); } catch (e) { error = e; }
      const issues = error ? [{
        type: 'syntax', severity: 'high', category: 'Syntax', message: String(error.message || error), line: 1, column: 1,
        code: '', suggestion: 'Fix XML structure (tags, attributes)', fixedCode: '', confidence: 100, impact: 'high', effort: 'low',
      }] : [];
      const analysis = {
        language: 'xml', overallScore: issues.length ? 60 : 100, issues,
        metrics: { complexity: 0, maintainability: 100 - issues.length * 5, readability: 100 - issues.length * 3, performance: 100, security: 100, documentation: 0, cyclomaticComplexity: 0, cognitiveComplexity: 0, linesOfCode: code.split('\n').length, duplicateLines: 0, testCoverage: 0 },
        summary: { totalIssues: issues.length, criticalIssues: 0, highIssues: issues.length, mediumIssues: 0, lowIssues: 0, securityIssues: 0, performanceIssues: 0, qualityIssues: issues.length },
        recommendations: [], codeSmells: issues.length, technicalDebt: `${(issues.length * 0.1).toFixed(1)} hours`,
      };
      return res.status(200).json({ success: true, analysis });
    }

    // JS/TS via ESLint (default for these languages)
    const isTypeScript = language === 'typescript' || /:\s*\w+/.test(code) || /interface\s+\w+/.test(code) || /type\s+\w+\s*=/.test(code);
    const eslint = new ESLint({
      useEslintrc: false,
      baseConfig: {
        parser: isTypeScript ? '@typescript-eslint/parser' : undefined,
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: 'module',
          ecmaFeatures: { jsx: true },
        },
        plugins: isTypeScript ? ['@typescript-eslint'] : [],
        extends: [
          'eslint:recommended',
          ...(isTypeScript ? ['plugin:@typescript-eslint/recommended'] : []),
        ],
        rules: {
          'no-eval': 'error',
          'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
          'no-implied-eval': 'error',
          'no-unsafe-finally': 'error',
          'no-var': 'warn',
          'prefer-const': 'warn',
          'eqeqeq': ['warn', 'smart'],
        },
      },
    });
    const results = await eslint.lintText(code, { filePath: isTypeScript ? 'file.tsx' : 'file.jsx' });
    const [{ messages, errorCount, warningCount }] = results;
    // Map to UI schema
    const issues = messages.map(m => ({
      type: m.severity === 2 ? 'lint-error' : 'lint-warning',
      severity: m.severity === 2 ? 'high' : 'medium',
      category: 'Code Quality',
      message: `${m.ruleId || 'rule'}: ${m.message}`,
      line: m.line || 1,
      column: m.column || 1,
      code: '',
      suggestion: m.suggestions && m.suggestions[0] ? m.suggestions[0].desc : 'Review and fix per rule guidance',
      fixedCode: '',
      confidence: 90,
      impact: m.severity === 2 ? 'high' : 'medium',
      effort: 'low',
      references: m.ruleId ? [`https://eslint.org/docs/latest/rules/${m.ruleId}`] : [],
    }));

    const summary = {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      highIssues: issues.filter(i => i.severity === 'high').length,
      mediumIssues: issues.filter(i => i.severity === 'medium').length,
      lowIssues: issues.filter(i => i.severity === 'low').length,
      securityIssues: issues.filter(i => i.category === 'Security').length,
      performanceIssues: issues.filter(i => i.category === 'Performance').length,
      qualityIssues: issues.filter(i => i.category === 'Code Quality').length,
    };

    const analysis = {
      language: isTypeScript ? 'typescript' : 'javascript',
      overallScore: Math.max(0, 100 - (errorCount * 10 + warningCount * 3)),
      issues,
      metrics: {
        complexity: 0,
        maintainability: Math.max(10, 100 - (errorCount * 8 + warningCount * 2)),
        readability: Math.max(10, 100 - (warningCount * 2)),
        performance: 100,
        security: 100,
        documentation: 0,
        cyclomaticComplexity: 0,
        cognitiveComplexity: 0,
        linesOfCode: code.split('\n').length,
        duplicateLines: 0,
        testCoverage: 0,
      },
      summary,
      recommendations: [...new Set(issues.map(i => i.ruleId).filter(Boolean))],
      codeSmells: errorCount + Math.ceil(warningCount / 2),
      technicalDebt: `Estimated ${(errorCount * 0.5 + warningCount * 0.2).toFixed(1)} hours to fix lint issues.`,
    };

    return res.status(200).json({ success: true, analysis });
  } catch (error) {
    logger.error('ESLint analysis error:', error);
    return res.status(500).json({ error: 'Failed to analyze code' });
  }
}));
=======
});
>>>>>>> d530ddd1b9ae4ce4bc3c959b411d890d353753b7
