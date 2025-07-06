"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateErrorEmailTemplate = void 0;
const generateErrorEmailTemplate = (errorData) => {
    const { errorId, timestamp, errorType, description, userId, userAgent, route, stackTrace, screenshotCount } = errorData;
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #f44336;
      color: white;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .section {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 15px;
    }
    .label {
      font-weight: bold;
      color: #666;
    }
    .stack-trace {
      background-color: #272822;
      color: #f8f8f2;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      font-family: monospace;
      white-space: pre-wrap;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #1976d2;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>⚠️ New Error Report</h2>
    <p>A new error has been reported in the VoiceVault application.</p>
  </div>

  <div class="section">
    <p><span class="label">Error ID:</span> ${errorId}</p>
    <p><span class="label">Timestamp:</span> ${timestamp.toLocaleString()}</p>
    <p><span class="label">Error Type:</span> ${errorType}</p>
    <p><span class="label">Description:</span> ${description}</p>
    ${userId ? `<p><span class="label">User ID:</span> ${userId}</p>` : ''}
    <p><span class="label">Route:</span> ${route}</p>
    <p><span class="label">User Agent:</span> ${userAgent}</p>
    <p><span class="label">Screenshots:</span> ${screenshotCount} attached</p>
  </div>

  ${stackTrace ? `
  <div class="section">
    <p class="label">Stack Trace:</p>
    <div class="stack-trace">${stackTrace}</div>
  </div>
  ` : ''}

  <a href="${process.env.APP_URL}/error-logs" class="button">
    View in Dashboard
  </a>

  <p style="margin-top: 30px; color: #666; font-size: 12px;">
    This is an automated message from the VoiceVault Error Reporting System.
    Please do not reply to this email.
  </p>
</body>
</html>
  `.trim();
};
exports.generateErrorEmailTemplate = generateErrorEmailTemplate;
//# sourceMappingURL=errorNotification.js.map