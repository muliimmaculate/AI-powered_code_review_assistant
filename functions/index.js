const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
require("dotenv").config();

setGlobalOptions({ maxInstances: 10 });



const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});

// Cloud Function to send recommendation email
exports.sendRecommendationEmail = onRequest(async (req, res) => {
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
        <div style="background:#f1f5f9;padding:12px 0;text-align:center;font-size:13px;color:#64748b;">
          <span>This is an automated message. Please do not reply.</span>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    logger.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});
