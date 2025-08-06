import nodemailer from "nodemailer";

export const generateOtp = () => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  return otp.toString();
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    html: `<div style="font-family: sans-serif; padding: 10px;">
          <h2>Hello,</h2>
          <p>Your OTP Code is:</p>
          <h1 style="color: #333;">${otp}</h1>
          <p>This code is valid for 10 minutes. Do not share it with anyone.</p>
          <br />
          <small>If you did not request this, please ignore this email.</small>
        </div>`,
  };
  await transporter.sendMail(mailOptions);
};
