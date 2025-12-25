import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";

const SelectRoles = () => {
  const navigate = useNavigate();
  const [hoveredRole, setHoveredRole] = useState(null);

  const handleSelect = (role) => {
    sessionStorage.setItem("selectedRole", role);
    navigate("/register", {
      state: { role },
    });
  };

  const roles = [
    {
      id: "employer",
      title: "Employer",
      description: "Post jobs and find the perfect workers for your works",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      features: [
        "Post unlimited jobs",
        "Manage applications",
        "Direct messaging",
      ],
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      id: "worker",
      title: "Worker",
      description:
        "Discover opportunities and showcase your skills to employers",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      features: ["Browse job listings", "Quick apply", "Build your profile"],
      gradient: "from-purple-500 to-pink-600",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-gray-100 to-gray-50 px-4 py-12">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Role
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select how you want to use the platform and unlock your potential
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roles.map((role) => (
            <div
              key={role.id}
              onMouseEnter={() => setHoveredRole(role.id)}
              onMouseLeave={() => setHoveredRole(null)}
              className={`relative rounded-3xl bg-white border-2 transition-all duration-300 overflow-hidden ${
                hoveredRole === role.id
                  ? "border-black shadow-2xl -translate-y-2"
                  : "border-gray-200 shadow-lg hover:border-gray-300"
              }`}
            >
              {/* Gradient Accent */}
              <div className={`h-2 bg-linear-to-r ${role.gradient}`} />

              <div className="p-8">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 text-gray-700 mb-6">
                  {role.icon}
                </div>

                {/* Content */}
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {role.title}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {role.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {role.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-sm text-gray-700"
                    >
                      <svg
                        className="w-5 h-5 text-green-500 mr-3 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button className="cursor-pointer" fullWidth onClick={() => handleSelect(role.id)}>
                  Continue as {role.title}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-8">
          You can switch roles anytime from your account settings
        </p>
      </div>
    </div>
  );
};

export default SelectRoles;
