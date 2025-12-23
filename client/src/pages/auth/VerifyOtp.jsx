import React from "react";

const VerifyOtp = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Verify your email
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-between gap-2 mb-6">
          {[...Array(6)].map((_, i) => (
            <input
              key={i}
              type="text"
              maxLength="1"
              className="h-12 w-12 rounded-xl border text-center text-lg font-semibold focus:border-black focus:outline-none"
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          type="button"
          className="w-full rounded-xl bg-black py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition"
        >
          Verify OTP
        </button>

        {/* Resend */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Didn’t receive the code?{" "}
          <span className="cursor-pointer font-medium text-black">
            Resend OTP
          </span>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;
