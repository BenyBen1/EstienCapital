import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const transporter = process.env.SMTP_HOST ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}) : null;

export const sendEmail = async (options: EmailOptions) => {
  try {
    // Skip email sending if no SMTP configuration is provided
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !transporter) {
      console.log('Email sending skipped - no SMTP configuration found');
      console.log('Email would have been sent to:', options.to);
      console.log('Subject:', options.subject);
      return { messageId: 'skipped' };
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      ...options,
    });
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw error - just log it so deposit still works
    console.log('Email sending failed, but continuing with deposit...');
    return { messageId: 'failed' };
  }
}; 