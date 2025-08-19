import nodemailer from 'nodemailer';
import { Otp } from '../models/otp.model.js';

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP code
export const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send OTP email
export const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    html: `
      <div style="font-family: sans-serif; padding: 10px;">
        <h2>Hello,</h2>
        <p>Your OTP Code is:</p>
        <h1 style="color: #333;">${otp}</h1>
        <p>This code is valid for 10 minutes. Do not share it with anyone.</p>
        <br />
        <small>If you did not request this, please ignore this email.</small>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// Create OTP, save to DB, and send email
export const createAndSendOtp = async (email, type) => {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Otp.create({
    email,
    otp,
    type,
    used: false,
    expiresAt,
  });

  await sendOtpEmail(email, otp);

  return otp; // Controller decides the response
};

// Verify OTP validity and mark used
export const verifyOtp = async (email, otp, type) => {
  const existingOtp = await Otp.findOneAndUpdate(
    { email, otp, type, used: false, expiresAt: { $gt: new Date() } },
    { used: true },
    { new: true }
  );

  if (!existingOtp) {
    return res.status(400).json({message:'Invalid, expired, or already used OTP'});
  }

  return true;
};

// Handle OTP resend
export const resendOtp = async (email, type) => {
  const existingOtp = await Otp.findOne({ email, type, used: false });

  if (existingOtp && existingOtp.expiresAt > Date.now()) {
    await sendOtpEmail(email, existingOtp.otp);
    return { otp: existingOtp.otp, reissued: false };
  }

  const otp = await createAndSendOtp(email, type);
  return { otp, reissued: true };
};
