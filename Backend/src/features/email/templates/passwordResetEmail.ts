export const getPasswordResetEmailTemplate = (name: string, otp: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; color: #333333; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #ef4444, #f97316); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
    .code-box { background: #fef2f2; border: 2px dashed #ef4444; border-radius: 10px; padding: 20px; text-align: center; margin: 28px 0; }
    .code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #ef4444; font-family: 'Courier New', Courier, monospace; }
    .expires { font-size: 13px; color: #6b7280; margin-top: 8px; }
    .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #92400e; margin-top: 20px; }
    .footer { padding: 20px 28px; background: #fafafa; border-top: 1px solid #eeeeee; font-size: 12px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello ${name},</div>
      <p>We received a request to reset your Dicey account password. Use the verification code below to authorize your password reset:</p>
      
      <div class="code-box">
        <div class="code">${otp}</div>
        <div class="expires">This code will expire in 10 minutes.</div>
      </div>
      
      <div class="warning">
        <strong>Security Notice:</strong> If you did not request this password reset, please ignore this email or change your password immediately.
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Dicey. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();
};
