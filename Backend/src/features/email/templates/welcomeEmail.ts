export const getWelcomeEmailTemplate = (name: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Dicey</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; color: #333333; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #10b981, #059669); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
    .badge { display: inline-block; background: #ecfdf5; color: #065f46; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
    .footer { padding: 20px 28px; background: #fafafa; border-top: 1px solid #eeeeee; font-size: 12px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Dicey!</h1>
    </div>
    <div class="content">
      <div class="badge">Verified Account</div>
      <div class="greeting">Welcome aboard, ${name}!</div>
      <p>Your email has been successfully verified, and your account is now fully active.</p>
      <p>We're thrilled to have you with us. You can now explore games, join matches, and connect with players.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Dicey. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();
};
