export const getUserFriendlyError = (error) => {
  const status = error?.response?.status;
  const msg = error?.response?.data?.error?.message || "";

  // EMAIL ALREADY EXISTS
  if (status === 409 && msg.toLowerCase().includes("exists")) {
    return "This email is already registered. Please log in instead.";
  }

  // OTP
  if (msg.toLowerCase().includes("otp")) {
    return "Unable to send OTP right now. Please try again.";
  }

  // NETWORK
  if (!error.response) {
    return "Network error. Please check your internet connection.";
  }

  // FALLBACK
  return "Something went wrong. Please try again later.";
};
