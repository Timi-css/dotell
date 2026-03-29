const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'DoTell <onboarding@resend.dev>';
const APP_NAME = 'DoTell';

const sendVerificationEmail = async ({ to, displayName, code }) => {
        return resend.emails.send({
                from: FROM_EMAIL,
                to,
                subject: `Verify your DoTell account`,
                html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #F05A28; padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: #fff; font-size: 28px; margin: 0;">doTell</h1>
        </div>
        <div style="background: #FAFAF7; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #E8E3DB;">
          <h2 style="color: #1C1917; font-size: 20px;">Hey ${displayName},</h2>
          <p style="color: #44403C; font-size: 15px; line-height: 1.6;">
            Thanks for joining DoTell. Use the code below to verify your email address.
          </p>
          <div style="background: #1C1917; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="color: #A8A29E; font-size: 12px; margin: 0 0 8px; letter-spacing: 0.1em; text-transform: uppercase;">Your verification code</p>
            <p style="color: #F05A28; font-size: 36px; font-weight: 700; letter-spacing: 0.2em; margin: 0;">${code}</p>
          </div>
          <p style="color: #A8A29E; font-size: 13px;">
            This code expires in 10 minutes. If you didn't sign up for DoTell, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
        });
};

const sendPasswordResetEmail = async ({ to, displayName, code }) => {
        return resend.emails.send({
                from: FROM_EMAIL,
                to,
                subject: `Reset your DoTell password`,
                html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #F05A28; padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: #fff; font-size: 28px; margin: 0;">doTell</h1>
        </div>
        <div style="background: #FAFAF7; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #E8E3DB;">
          <h2 style="color: #1C1917; font-size: 20px;">Hey ${displayName},</h2>
          <p style="color: #44403C; font-size: 15px; line-height: 1.6;">
            We received a request to reset your password. Use the code below to continue.
          </p>
          <div style="background: #1C1917; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="color: #A8A29E; font-size: 12px; margin: 0 0 8px; letter-spacing: 0.1em; text-transform: uppercase;">Your reset code</p>
            <p style="color: #F05A28; font-size: 36px; font-weight: 700; letter-spacing: 0.2em; margin: 0;">${code}</p>
          </div>
          <p style="color: #A8A29E; font-size: 13px;">
            This code expires in 10 minutes. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
        });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };