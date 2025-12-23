import React from "react";

const Register = () => {
  // TEMP role (later this will come from URL or global state)
  const role = "worker"; // "employer"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Register as{" "}
            <span className="font-medium capitalize text-black">{role}</span>
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="mt-1 w-full rounded-xl border px-4 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="mt-1 w-full rounded-xl border px-4 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border px-4 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>

          {/* Role-specific fields */}
          {role === "worker" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Skills
              </label>
              <input
                type="text"
                placeholder="Plumbing, Electrician, Driver"
                className="mt-1 w-full rounded-xl border px-4 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
          )}

          {role === "employer" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company name
              </label>
              <input
                type="text"
                placeholder="Acme Pvt Ltd"
                className="mt-1 w-full rounded-xl border px-4 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-xl bg-black py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition"
          >
            Register & Verify OTP
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <span className="cursor-pointer font-medium text-black">Login</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
