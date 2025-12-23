import React from "react";

const SelectRoles = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-4xl">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Role</h1>
          <p className="text-gray-600 mt-2">
            Select how you want to use the platform
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employer Card */}
          <div className="cursor-pointer rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-gray-800">Employer</h2>
            <p className="mt-2 text-gray-600 text-sm">
              Post jobs, hire workers, and manage applications.
            </p>

            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-black px-4 py-2 text-white font-medium hover:bg-gray-800 transition"
            >
              Continue as Employer
            </button>
          </div>

          {/* Worker Card */}
          <div className="cursor-pointer rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-gray-800">Worker</h2>
            <p className="mt-2 text-gray-600 text-sm">
              Find jobs, apply easily, and get hired faster.
            </p>

            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-black px-4 py-2 text-white font-medium hover:bg-gray-800 transition"
            >
              Continue as Worker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectRoles;
