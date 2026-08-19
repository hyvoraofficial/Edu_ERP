import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WelcomeEmailData {
  academyName: string;
  studentName: string;
  loginUrl: string;
  studentEmail: string;
  generatedPassword: string;
  supportContact: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private provider: 'resend' | 'ses' | 'smtp';

  constructor(private readonly configService: ConfigService) {
    this.provider = this.configService.get<'resend' | 'ses' | 'smtp'>('EMAIL_PROVIDER') || 'smtp';
  }

  async sendWelcomeEmail(to: string, data: WelcomeEmailData): Promise<void> {
    const subject = `Welcome to ${data.academyName} - Student Portal Credentials`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #4F46E5;">Welcome to ${data.academyName}!</h2>
        <p>Dear ${data.studentName},</p>
        <p>Your student portal account has been successfully provisioned. You can log in immediately using the credentials below:</p>
        
        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Portal Login URL:</strong> <a href="${data.loginUrl}" target="_blank">${data.loginUrl}</a></p>
          <p style="margin: 5px 0;"><strong>Username / Email:</strong> ${data.studentEmail}</p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="font-size: 1.1em; color: #D97706; background-color: #FEF3C7; padding: 2px 6px; border-radius: 4px;">${data.generatedPassword}</code></p>
        </div>
        
        <p style="color: #DC2626; font-weight: bold; background-color: #FEE2E2; padding: 10px; border-left: 4px solid #DC2626; border-radius: 4px;">
          IMPORTANT: You can log in immediately using the credentials below. For better security, we recommend changing your password after your first login from Profile → Security.
        </p>
        
        <p>If you encounter any issues logging in, please reach out to support at: <strong>${data.supportContact}</strong></p>
        
        <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
        <p style="font-size: 0.85em; color: #6B7280;">This is an automated system notification. Please do not reply directly to this email.</p>
      </div>
    `;

    // Replacement logic based on configured provider
    switch (this.provider) {
      case 'resend':
        await this.sendViaResend(to, subject, htmlBody);
        break;
      case 'ses':
        await this.sendViaAwsSes(to, subject, htmlBody);
        break;
      case 'smtp':
      default:
        await this.sendViaSmtp(to, subject, htmlBody);
        break;
    }
  }

  private async sendViaResend(to: string, subject: string, html: string): Promise<void> {
    this.logger.log(`[Resend Email Provider] Sending welcome email to ${to} (Subject: ${subject})`);
    // Simulated Resend SDK call:
    // await this.resendClient.emails.send({ from: 'no-reply@hyvora.com', to, subject, html })
  }

  private async sendViaAwsSes(to: string, subject: string, html: string): Promise<void> {
    this.logger.log(`[AWS SES Email Provider] Sending welcome email to ${to} (Subject: ${subject})`);
    // Simulated AWS SES SDK call:
    // await this.sesClient.send(new SendEmailCommand({ ... }))
  }

  private async sendViaSmtp(to: string, subject: string, html: string): Promise<void> {
    this.logger.log(`[SMTP Email Provider] Sending welcome email to ${to} (Subject: ${subject})`);
    // Simulated SMTP Nodemailer call:
    // await this.transporter.sendMail({ from: 'no-reply@hyvora.com', to, subject, html })
  }
}
