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
}));

// Add required dependencies and imports for the analysis functions
const { ESLint } = require('eslint');
const { mkdtempSync, writeFileSync, rmSync } = require('fs');
const { tmpdir } = require('os');
const { join } = require('path');
const { execFile } = require('child_process');
const HTMLHint = require('htmlhint').HTMLHint;
const stylelint = require('stylelint');
const markdownlint = require('markdownlint');
const YAML = require('yaml');
const { XMLParser } = require('fast-xml-parser');

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

// New endpoint: Analyze code using various language-specific linters
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
    // Basic fallback analysis for unsupported languages
    const performBasicAnalysis = (lang, codeContent) => {
      const lines = codeContent.split('\n');
      const loc = lines.length;
      const issues = [];

      // Basic syntax checks
      const openBraces = (codeContent.match(/\{/g) || []).length;
      const closeBraces = (codeContent.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        issues.push({
          type: 'syntax',
          severity: 'high',
          category: 'Syntax',
          message: 'Unbalanced braces',
          line: 1,
          column: 1,
          code: '',
          suggestion: 'Ensure { and } are balanced',
          fixedCode: '',
          confidence: 90,
          impact: 'high',
          effort: 'low'
        });
      }

      return {
        language: lang,
        overallScore: Math.max(0, 100 - issues.length * 10),
        issues,
        metrics: {
          complexity: 0,
          maintainability: 100 - issues.length * 5,
          readability: 100 - issues.length * 3,
          performance: 100,
          security: 100,
          documentation: 0,
          cyclomaticComplexity: 0,
          cognitiveComplexity: 0,
          linesOfCode: loc,
          duplicateLines: 0,
          testCoverage: 0,
        },
        summary: {
          totalIssues: issues.length,
          criticalIssues: issues.filter(i => i.severity === 'critical').length,
          highIssues: issues.filter(i => i.severity === 'high').length,
          mediumIssues: issues.filter(i => i.severity === 'medium').length,
          lowIssues: issues.filter(i => i.severity === 'low').length,
          securityIssues: 0,
          performanceIssues: 0,
          qualityIssues: issues.length,
        },
        recommendations: issues.length ? ['Review and fix syntax issues'] : ['Code appears to have good structure'],
        codeSmells: issues.length,
        technicalDebt: `Estimated ${(issues.length * 0.2).toFixed(1)} hours to address issues.`,
      };
    };

    // JavaScript/TypeScript analysis (simplified fallback)
    if (language === 'javascript' || language === 'typescript') {
      const issues = [];
      const lines = code.split('\n');
      
      // Check for common issues
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        
        if (/\bvar\s+/.test(trimmed)) {
          issues.push({
            type: 'lint-warning',
            severity: 'medium',
            category: 'Best Practices',
            message: 'Use let or const instead of var',
            line: idx + 1,
            column: trimmed.indexOf('var') + 1,
            code: trimmed,
            suggestion: 'Replace var with let or const',
            fixedCode: trimmed.replace(/\bvar\b/, 'const'),
            confidence: 95,
            impact: 'medium',
            effort: 'low'
          });
        }

        if (/==(?!=)/.test(trimmed) && !/===/.test(trimmed)) {
          issues.push({
            type: 'lint-warning',
            severity: 'medium',
            category: 'Best Practices',
            message: 'Use strict equality (===) instead of loose equality (==)',
            line: idx + 1,
            column: trimmed.indexOf('==') + 1,
            code: trimmed,
            suggestion: 'Use === for strict equality comparison',
            fixedCode: trimmed.replace(/==/g, '==='),
            confidence: 90,
            impact: 'medium',
            effort: 'easy'
          });
        }
      });

      const analysis = {
        language: language,
        overallScore: Math.max(0, 100 - issues.length * 8),
        issues,
        metrics: {
          complexity: 0,
          maintainability: Math.max(10, 100 - issues.length * 5),
          readability: Math.max(10, 100 - issues.length * 3),
          performance: 100,
          security: 100,
          documentation: 0,
          cyclomaticComplexity: 0,
          cognitiveComplexity: 0,
          linesOfCode: lines.length,
          duplicateLines: 0,
          testCoverage: 0,
        },
        summary: {
          totalIssues: issues.length,
          criticalIssues: issues.filter(i => i.severity === 'critical').length,
          highIssues: issues.filter(i => i.severity === 'high').length,
          mediumIssues: issues.filter(i => i.severity === 'medium').length,
          lowIssues: issues.filter(i => i.severity === 'low').length,
          securityIssues: 0,
          performanceIssues: 0,
          qualityIssues: issues.length,
        },
        recommendations: issues.length > 0 ? ['Follow JavaScript/TypeScript best practices', 'Use modern syntax features'] : ['Code follows good practices'],
        codeSmells: Math.ceil(issues.length / 2),
        technicalDebt: `Estimated ${(issues.length * 0.3).toFixed(1)} hours to address issues.`,
      };
      
      return res.status(200).json({ success: true, analysis });
    }

    // JSON validation
    if (language === 'json') {
      let error = null;
      try {
        JSON.parse(code);
      } catch (e) {
        error = e;
      }
      
      const issues = error ? [{
        type: 'syntax',
        severity: 'high',
        category: 'Syntax',
        message: String(error.message || error),
        line: 1,
        column: 1,
        code: '',
        suggestion: 'Fix JSON syntax (quoting, commas, braces)',
        fixedCode: '',
        confidence: 100,
        impact: 'high',
        effort: 'low',
      }] : [];
      
      const analysis = {
        language: 'json',
        overallScore: issues.length ? 60 : 100,
        issues,
        metrics: {
          complexity: 0,
          maintainability: 100 - issues.length * 5,
          readability: 100 - issues.length * 3,
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
          totalIssues: issues.length,
          criticalIssues: 0,
          highIssues: issues.length,
          mediumIssues: 0,
          lowIssues: 0,
          securityIssues: 0,
          performanceIssues: 0,
          qualityIssues: issues.length,
        },
        recommendations: [],
        codeSmells: issues.length,
        technicalDebt: `${(issues.length * 0.1).toFixed(1)} hours`,
      };
      
      return res.status(200).json({ success: true, analysis });
    }

    // Default analysis for other languages
    const analysis = performBasicAnalysis(language || 'unknown', code);
    return res.status(200).json({ success: true, analysis });

  } catch (error) {
    logger.error('Code analysis error:', error);
    return res.status(500).json({ error: 'Failed to analyze code' });
  }
}));
