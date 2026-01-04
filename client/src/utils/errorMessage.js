export const getUserFriendlyError = (error) => {
  const status = error?.response?.status;
  const msg = error?.response?.data?.error?.message || "";

  if (status === 409 && msg.toLowerCase().includes("exists")) {
    return "This email is already registered. Please log in instead.";
  }

  if (msg.toLowerCase().includes("otp")) {
    return "Invalid or expired OTP. Please try again.";
  }

  if (status === 401 || msg.toLowerCase().includes("session")) {
    return "Please register again to continue.";
  }

  if (!error.response) {
    return "Network error. Please check your internet connection.";
  }

  return "Something went wrong. Please try again later.";
};
