import { transporter } from './transportService.js';

export const sendOtp = async (email, otp) => {
  const minutes = 5;
  const info = await transporter.sendMail({
    from: { name: 'MyApp Support', address: process.env.EMAIL_USER }, // clearer sender
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}. It is valid for ${minutes} minutes. Do not share it.`, // plain-text fallback
    html: `
      <div style="font-family: sans-serif; padding: 10px;">
        <h2>Hello,</h2>
        <p>Your OTP Code is:</p>
        <h1 style="color: #333; letter-spacing: 3px;">${otp}</h1>
        <p>This code is valid for ${minutes} minutes. Do not share it with anyone.</p>
        <br/>
        <small>If you did not request this, please ignore this email.</small>
      </div>
    `,
    // Optional: replyTo: 'support@yourdomain.com'
  });
  return info.messageId;
};
