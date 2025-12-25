import React, { useState } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";

const Register = () => {
  const location = useLocation();
  const role = location.state?.role || sessionStorage.getItem("selectedRole");
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  if (!role) {
    return <Navigate to="/select-role" replace />;
  }

  const isSubmitting = false; // Placeholder for submission state
  const handleSelect = () => {
    navigate("/otp", { state: { role } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-gray-600">
            Join as{" "}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-black text-white capitalize">
              {role}
            </span>
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form className="space-y-5">
            {/* Full Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none ${
                  focusedField === "name"
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none ${
                  focusedField === "email"
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none ${
                  focusedField === "password"
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>

            {/* Role-Specific Fields */}
            {role === "worker" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Skills
                </label>
                <input
                  type="text"
                  placeholder="e.g., Plumbing, Electrical, Driver"
                  onFocus={() => setFocusedField("skills")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none ${
                    focusedField === "skills"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Separate multiple skills with commas
                </p>
              </div>
            )}

            {role === "employer" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Your Company Ltd."
                  onFocus={() => setFocusedField("company")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none ${
                    focusedField === "company"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                />
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              onClick={handleSelect}
            >
              Register & Verify OTP
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-semibold text-black hover:underline"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
