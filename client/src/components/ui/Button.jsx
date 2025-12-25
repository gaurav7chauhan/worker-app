import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = "",
  ...rest
}) => {
  // Base styles that apply to all buttons
  const baseStyles =
    "font-semibold rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Variant styles
  const variants = {
    primary:
      "bg-black text-white hover:bg-gray-800 active:scale-[0.98] shadow-lg hover:shadow-xl focus:ring-gray-900",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 active:scale-[0.98] focus:ring-gray-400",
    outline:
      "border-2 border-black bg-transparent text-black hover:bg-black hover:text-white active:scale-[0.98] focus:ring-gray-900",
    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-400",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] shadow-lg hover:shadow-xl focus:ring-red-500",
    success:
      "bg-green-600 text-white hover:bg-green-700 active:scale-[0.98] shadow-lg hover:shadow-xl focus:ring-green-500",
    gradient:
      "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 active:scale-[0.98] shadow-lg hover:shadow-xl focus:ring-blue-500",
  };

  // Size styles
  const sizes = {
    xs: "px-3 py-1.5 text-xs",
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
  };

  // Combine all styles
  const buttonStyles = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  return (
    <button
      type={type}
      onClick={loading ? undefined : onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      className={buttonStyles}
      {...rest}
    >
      {/* Left Icon */}
      {leftIcon && !loading && <span className="shrink-0">{leftIcon}</span>}

      {/* Loading Spinner */}
      {loading && (
        <svg
          className="animate-spin h-5 w-5 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Button Text */}
      <span>{children}</span>

      {/* Right Icon */}
      {rightIcon && !loading && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
