/**
 * Email Service
 * Handles sending emails using nodemailer
 */

const nodemailer = require('nodemailer');

// Create transporter based on environment
const createTransporter = () => {
  // In development, use ethereal email (fake SMTP)
  // In production, use real SMTP service

  if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development: Log email to console instead of sending
    console.log('📧 Email service in development mode - emails will be logged to console');
    return null;
  }
};

const transporter = createTransporter();

/**
 * Send team invitation email
 */
async function sendInvitationEmail({ to, inviterName, inviterEmail, role, projectName, message, invitationLink }) {
  const subject = projectName
    ? `${inviterName} invited you to join "${projectName}"`
    : `${inviterName} invited you to join their team`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #00A3FF 0%, #00d4aa 100%);
          color: white;
          padding: 30px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          background: #f5f5f5;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .button {
          display: inline-block;
          background: #00A3FF;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 8px;
          margin: 20px 0;
          font-weight: bold;
        }
        .info-box {
          background: white;
          padding: 20px;
          border-left: 4px solid #00A3FF;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 You're Invited!</h1>
      </div>
      <div class="content">
        <p>Hi there,</p>
        <p><strong>${inviterName}</strong> (${inviterEmail}) has invited you to collaborate ${projectName ? `on the project <strong>"${projectName}"</strong>` : 'on their team'}.</p>

        ${message ? `
          <div class="info-box">
            <strong>Personal message from ${inviterName}:</strong>
            <p style="margin: 10px 0 0 0; font-style: italic;">"${message}"</p>
          </div>
        ` : ''}

        <div class="info-box">
          <strong>Your Access Level:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}
          <br/>
          ${
            role === 'viewer' ? '👁️ You can view project details and tasks' :
            role === 'editor' ? '✏️ You can view, create, and edit tasks' :
            '👑 You have full access to manage the project'
          }
        </div>

        <p>Click the button below to accept the invitation and get started:</p>

        <div style="text-align: center;">
          <a href="${invitationLink}" class="button">Accept Invitation</a>
        </div>

        <p style="font-size: 0.9em; color: #666;">
          This invitation link will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
        </p>

        <p style="font-size: 0.85em; color: #999; margin-top: 30px;">
          Or copy and paste this link into your browser:<br/>
          <code style="background: white; padding: 5px; display: inline-block; margin-top: 5px;">${invitationLink}</code>
        </p>
      </div>
      <div class="footer">
        <p>Universal Project Manager</p>
        <p>AI-powered project management for any type of project</p>
      </div>
    </body>
    </html>
  `;

  const textBody = `
${inviterName} invited you to collaborate ${projectName ? `on "${projectName}"` : 'on their team'}

${message ? `Message from ${inviterName}: "${message}"` : ''}

Your access level: ${role}

Accept invitation: ${invitationLink}

This invitation expires in 7 days.
  `;

  if (transporter) {
    // Production: Send real email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Universal Project Manager" <noreply@projectmanager.app>`,
      to,
      subject,
      text: textBody,
      html: htmlBody,
    });

    console.log('📧 Email sent:', info.messageId);
    return info;
  } else {
    // Development: Log email
    console.log('\n' + '='.repeat(80));
    console.log('📧 DEVELOPMENT EMAIL (Not actually sent)');
    console.log('='.repeat(80));
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('\n--- Email Content ---\n');
    console.log(textBody);
    console.log('\n--- Invitation Link ---');
    console.log(invitationLink);
    console.log('='.repeat(80) + '\n');

    return { messageId: 'dev-' + Date.now() };
  }
}

/**
 * Send feedback notification to admin
 */
async function sendFeedbackNotification({ userEmail, userName, feedbackType, content }) {
  const subject = `New Feedback: ${feedbackType}`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: #0b0f14;
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 0 0 8px 8px;
        }
        .info-box {
          background: white;
          padding: 15px;
          border-left: 4px solid #00A3FF;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>📬 New User Feedback</h2>
      </div>
      <div class="content">
        <div class="info-box">
          <strong>Type:</strong> ${feedbackType}<br/>
          <strong>From:</strong> ${userName} (${userEmail})<br/>
          <strong>Date:</strong> ${new Date().toLocaleString()}
        </div>
        <div class="info-box">
          <strong>Message:</strong>
          <p>${content}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textBody = `
New Feedback Received

Type: ${feedbackType}
From: ${userName} (${userEmail})
Date: ${new Date().toLocaleString()}

Message:
${content}
  `;

  if (transporter && process.env.ADMIN_EMAIL) {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Universal Project Manager" <noreply@projectmanager.app>`,
      to: process.env.ADMIN_EMAIL,
      subject,
      text: textBody,
      html: htmlBody,
    });

    console.log('📧 Feedback notification sent:', info.messageId);
    return info;
  } else {
    console.log('\n' + '='.repeat(80));
    console.log('📧 DEVELOPMENT FEEDBACK NOTIFICATION');
    console.log('='.repeat(80));
    console.log(textBody);
    console.log('='.repeat(80) + '\n');

    return { messageId: 'dev-feedback-' + Date.now() };
  }
}

module.exports = {
  sendInvitationEmail,
  sendFeedbackNotification,
};
