import { Resend } from 'resend';
import { env } from '../../shared/config/env.config';
import { logger } from '../../shared/utils/logger';
import { SendEmailOptions, EmailResult } from './email.interface';
import { getVerificationEmailTemplate } from './templates/verificationEmail';
import { getPasswordResetEmailTemplate } from './templates/passwordResetEmail';
import { getWelcomeEmailTemplate } from './templates/welcomeEmail';

class EmailService {
  private resendClient: Resend | null = null;

  constructor() {
    if (
      env.RESEND_API_KEY &&
      !env.RESEND_API_KEY.includes('placeholder') &&
      !env.RESEND_API_KEY.includes('demo') &&
      !env.RESEND_API_KEY.includes('replace_with_actual')
    ) {
      this.resendClient = new Resend(env.RESEND_API_KEY);
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<EmailResult> {
    try {
      if (!this.resendClient) {
        logger.warn('📧 [DEV EMAIL MOCK] RESEND_API_KEY is not configured with a live key.');
        logger.info(`📧 [DEV EMAIL MOCK] Recipient: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
        logger.info(`📧 [DEV EMAIL MOCK] Subject: ${options.subject}`);
        return { success: true, id: 'mock-email-id-dev' };
      }

      const response = await this.resendClient.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (response.error) {
        logger.error('❌ Resend API error:', response.error);
        return { success: false, error: response.error.message };
      }

      logger.info(`📧 Email sent successfully to ${options.to}. Email ID: ${response.data?.id}`);
      return { success: true, id: response.data?.id };
    } catch (error) {
      logger.error('❌ Failed to send email via Resend:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email sending error',
      };
    }
  }

  async sendVerificationEmail(to: string, name: string, otp: string): Promise<EmailResult> {
    logger.info(`🔐 Verification OTP for [${to}]: ${otp} (Valid for 10 minutes)`);
    return this.sendEmail({
      to,
      subject: 'Verify Your Email Address - Dicey',
      html: getVerificationEmailTemplate(name, otp),
      text: `Hello ${name}, your verification code is: ${otp}. It will expire in 10 minutes.`,
    });
  }

  async sendPasswordResetEmail(to: string, name: string, otp: string): Promise<EmailResult> {
    logger.info(`🔑 Password Reset OTP for [${to}]: ${otp} (Valid for 10 minutes)`);
    return this.sendEmail({
      to,
      subject: 'Password Reset Request - Dicey',
      html: getPasswordResetEmailTemplate(name, otp),
      text: `Hello ${name}, your password reset code is: ${otp}. It will expire in 10 minutes.`,
    });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<EmailResult> {
    return this.sendEmail({
      to,
      subject: 'Welcome to Dicey!',
      html: getWelcomeEmailTemplate(name),
      text: `Hello ${name}, welcome to Dicey! Your email has been verified.`,
    });
  }
}

export const emailService = new EmailService();
