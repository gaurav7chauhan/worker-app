import { Otp } from "../models/otp.model";
import { ApiError } from "./apiError";
import { asyncHandler } from "./asyncHandler";

export const verifyOTP = asyncHandler(async (email, otp, type) => {
  const existingOtp = await Otp.findOneAndUpdate(
    { email, otp, type, used: false, expiresAt: { $gt: Date.now() } },
    { used: true },
    { new: true }
  );

  if (!existingOtp) {
    throw new ApiError(400, "Invalid, expired, or already used OTP");
  }

  return existingOtp;
});
