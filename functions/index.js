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

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Code Review Recommendation for ${name}`,
    text: `Hello ${name},\n\nHere is a code review recommendation for you:\n\n${recommendation}\n\nBest regards,\nAI Code Review Assistant`,
    html: `<p>Hello <strong>${name}</strong>,</p><p>Here is a code review recommendation for you:</p><blockquote>${recommendation}</blockquote><p>Best regards,<br/>AI Code Review Assistant</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    logger.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});
