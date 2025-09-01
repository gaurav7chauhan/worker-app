import nodemailer from 'nodemailer';
import { Otp } from '../models/otpModel.js';
import bcrypt from 'bcrypt';
import { OtpToken } from '../models/otpTokens.js';

// // Generate OTP code
// export const generateOtp = () => {
//   return Math.floor(1000 + Math.random() * 9000).toString();
// };

// // Create OTP, save to DB, and send email
// export const createAndSendOtp = async (email, type) => {
//   const otp = generateOtp();
//   const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//   await Otp.create({
//     email,
//     otp,
//     type,
//     used: false,
//     expiresAt,
//   });

//   await sendOtpEmail(email, otp);

//   return otp; // Controller decides the response
// };

// // Verify OTP validity and mark used
// export const verifyOtp = async (email, otp, type) => {
//   const existingOtp = await Otp.findOneAndUpdate(
//     { email, otp, type, used: false, expiresAt: { $gt: new Date() } },
//     { used: true },
//     { new: true }
//   );

//   if (!existingOtp) {
//     return res.status(400).json({message:'Invalid, expired, or already used OTP'});
//   }

//   return true;
// };

// // Handle OTP resend
// export const resendOtp = async (email, type) => {
//   const existingOtp = await Otp.findOne({ email, type, used: false });

//   if (existingOtp && existingOtp.expiresAt > Date.now()) {
//     await sendOtpEmail(email, existingOtp.otp);
//     return { otp: existingOtp.otp, reissued: false };
//   }

//   const otp = await createAndSendOtp(email, type);
//   return { otp, reissued: true };
// };

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const requestOtp = async (req, res, next) => {
  try {
    const { userId, purpose, channel } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000); // 6 digit
    const codeHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await OtpToken.findOneAndUpdate(
      { userId, purpose, channel, consumed: false },
      {
        $set: { codeHash, expiresAt, attempts: 0 },
        $setOnInsert: { userId, purpose, channel },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.status(200).json({ message: 'OTP sent' });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { userId, code, channel, purpose } = req.body;
    const otp = await OtpToken.findOne({
      userId,
      channel,
      purpose,
      consumed: false,
      expiresAt: { $gt: new Date() },
    });
    if (!otp) return res.status(400).json({ error: 'Invalid or expired OTP' });

    if (otp.attempts >= 5) {
      await OtpToken.deleteOne({ _id: otp._id });
      return res.status(429).json({ error: 'Too many attempts' });
    }

    const ok = await bcrypt.compare(code, otp.hashOtp);
    if (!ok) {
      await OtpToken.updateOne({ _id: otp._id }, { $inc: { attempts: 1 } });
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await OtpToken.updateOne({ _id: otp._id }, { $set: { consumed: true } });

    return res.status(200).json({ message: 'OTP verify successfully' });
  } catch (error) {
    next(error);
  }
};

// // Send OTP
export const sendOtp = async (email, otp) => {
  try {
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
  } catch (error) {
    console.log('error', error.message);
    return error;
  }
};
