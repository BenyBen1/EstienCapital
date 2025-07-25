import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (options: EmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      ...options,
    });
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}; 