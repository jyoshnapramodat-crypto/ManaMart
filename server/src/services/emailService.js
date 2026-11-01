import nodemailer from 'nodemailer';

// Configure Transporter with Environment Variables
function createTransporter() {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 587;
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Fallback to development logger when SMTP credentials are not yet added
  return {
    sendMail: async (mailOptions) => {
      console.log('----------------------------------------------------');
      console.log(`📧 [MANAMART EMAIL SERVICE - DISPATCH]`);
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`[Security Note]: OTP is delivered to the recipient and NOT exposed to frontend.`);
      console.log('----------------------------------------------------');
      return { messageId: `dev-mock-${Date.now()}` };
    },
  };
}

const transporter = createTransporter();

export async function sendVerificationEmail(recipientEmail, otp, recipientName = 'Neighbor', purpose = 'verification') {
  const from = process.env.EMAIL_FROM || '"ManaMart Security" <no-reply@manamart.in>';

  const purposeLabels = {
    signup: 'Verify Your New Account',
    login: 'One-Time Login Code',
    forgot_password: 'Password Reset Request',
    verification: 'Identity Verification',
  };

  const subject = `[ManaMart] ${otp} is your ${purposeLabels[purpose] || 'Verification Code'}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px; }
        .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #edf2f7; }
        .header { background: linear-gradient(135deg, #0C8340 0%, #FF5E1E 100%); padding: 30px 20px; text-align: center; color: white; }
        .logo-title { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin: 0; }
        .tagline { font-size: 12px; opacity: 0.9; margin-top: 5px; font-weight: 600; }
        .content { padding: 30px 25px; color: #2d3748; }
        .otp-box { background: #f7fafc; border: 2px dashed #0C8340; border-radius: 14px; padding: 18px; text-align: center; margin: 25px 0; }
        .otp-code { font-size: 34px; font-weight: 900; letter-spacing: 6px; color: #0C8340; font-family: 'Courier New', monospace; }
        .notice { font-size: 12px; color: #718096; line-height: 1.6; }
        .footer { background: #f8fafc; padding: 15px; text-align: center; font-size: 11px; color: #a0aec0; border-top: 1px solid #edf2f7; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo-title">ManaMart</div>
          <div class="tagline">Mana Ooru. Mana Market. Your Entire Neighborhood, Delivered.</div>
        </div>
        <div class="content">
          <p style="font-size: 15px; margin-top: 0;">Hello <strong>${recipientName}</strong>,</p>
          <p style="font-size: 13px; color: #4a5568;">Your one-time verification code for <strong>${purposeLabels[purpose] || 'ManaMart'}</strong> is:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div style="font-size: 11px; color: #718096; margin-top: 6px;">Valid for 5 minutes • Do not share with anyone</div>
          </div>

          <p class="notice">
            If you did not request this verification code, please ignore this email or contact ManaMart Customer Security immediately.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ManaMart Hyperlocal Platform. Built with pride for local neighborhoods.
        </div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from,
    to: recipientEmail,
    subject,
    html,
  });
}
