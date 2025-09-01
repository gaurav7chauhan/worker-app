import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, // Gmail address
    pass: process.env.EMAIL_PASS, // 16-digit App Password
  },
  // Optional if you send many emails:
  // pool: true, maxConnections: 5, maxMessages: 100
});

// Call once on server start
export async function verifySmtp() {
  await transporter.verify();
}
