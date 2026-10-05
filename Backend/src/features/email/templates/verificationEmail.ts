export const getVerificationEmailTemplate = (name: string, otp: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; color: #333333; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
    .code-box { background: #f0f4ff; border: 2px dashed #4f46e5; border-radius: 10px; padding: 20px; text-align: center; margin: 28px 0; }
    .code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; font-family: 'Courier New', Courier, monospace; }
    .expires { font-size: 13px; color: #6b7280; margin-top: 8px; }
    .footer { padding: 20px 28px; background: #fafafa; border-top: 1px solid #eeeeee; font-size: 12px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Dicey</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello ${name},</div>
      <p>Thank you for signing up with Dicey! To complete your registration and verify your email address, please use the 6-digit verification code below:</p>
      
      <div class="code-box">
        <div class="code">${otp}</div>
        <div class="expires">This code expires in 10 minutes.</div>
      </div>
      
      <p>If you didn't create an account with Dicey, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Dicey. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();
};
