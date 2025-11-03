import nodemailer from 'nodemailer';
import { prisma } from './prisma';
import crypto from 'crypto';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@mystipixel.com';
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

/**
 * Generate a random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Send email verification link
 */
export async function sendVerificationEmail(email: string, userId: string) {
  try {
    // Generate verification token
    const token = generateToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Verification URL
    const verifyUrl = `${APP_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    // Email content
    const mailOptions = {
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify Your Email - MystiPixel',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to MystiPixel!</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thank you for creating an account with MystiPixel. To complete your registration, please verify your email address by clicking the button below:</p>
              <p style="text-align: center;">
                <a href="${verifyUrl}" class="button">Verify Email Address</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verifyUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account with MystiPixel, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MystiPixel. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to MystiPixel!

        Thank you for creating an account. To complete your registration, please verify your email address by visiting:

        ${verifyUrl}

        This link will expire in 24 hours.

        If you didn't create an account with MystiPixel, you can safely ignore this email.

        © ${new Date().getFullYear()} MystiPixel. All rights reserved.
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);

    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * Send password reset link
 */
export async function sendPasswordResetEmail(email: string) {
  try {
    // Generate reset token
    const token = generateToken();
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // Store new token in database
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // Reset URL
    const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;

    // Email content
    const mailOptions = {
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset Your Password - MystiPixel',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password for your MystiPixel account. Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MystiPixel. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request

        We received a request to reset your password for your MystiPixel account. Visit the link below to create a new password:

        ${resetUrl}

        This link will expire in 1 hour.

        If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

        © ${new Date().getFullYear()} MystiPixel. All rights reserved.
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);

    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

/**
 * Verify email token
 */
export async function verifyEmailToken(email: string, token: string): Promise<boolean> {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    });

    if (!verificationToken) {
      return false;
    }

    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token,
          },
        },
      });
      return false;
    }

    // Mark user as verified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Delete used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    });

    return true;
  } catch (error) {
    console.error('Error verifying email token:', error);
    return false;
  }
}

/**
 * Verify password reset token
 */
export async function verifyPasswordResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { valid: false };
    }

    // Check if token has expired
    if (resetToken.expires < new Date()) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { token },
      });
      return { valid: false };
    }

    return { valid: true, email: resetToken.email };
  } catch (error) {
    console.error('Error verifying password reset token:', error);
    return { valid: false };
  }
}

/**
 * Delete password reset token after use
 */
export async function deletePasswordResetToken(token: string) {
  try {
    await prisma.passwordResetToken.delete({
      where: { token },
    });
  } catch (error) {
    console.error('Error deleting password reset token:', error);
  }
}
