import React, { useState, forwardRef } from "react";
import PropTypes from "prop-types";

const Input = forwardRef(
  (
    {
      label,
      type = "text",
      name,
      value,
      onChange,
      onBlur,
      onFocus,
      placeholder,
      error,
      helperText,
      required = false,
      disabled = false,
      leftIcon,
      rightIcon,
      size = "md",
      fullWidth = false,
      className = "",
      inputClassName = "",
      rows = 4,
      maxLength,
      showCharCount = false,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleFocus = (e) => {
      setIsFocused(true);
      onFocus && onFocus(e);
    };

    const handleBlur = (e) => {
      setIsFocused(false);
      onBlur && onBlur(e);
    };

    // Base input styles
    const baseInputStyles =
      "w-full transition-all duration-200 outline-none bg-white";

    // Size styles
    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-base",
      lg: "px-5 py-4 text-lg",
    };

    // Border and focus styles
    const borderStyles = error
      ? "border-2 border-red-500 focus:border-red-600"
      : isFocused
      ? "border-2 border-black bg-gray-50"
      : "border-2 border-gray-200 hover:border-gray-300";

    // Icon padding adjustments
    const iconPadding = leftIcon
      ? "pl-11"
      : rightIcon && type !== "password"
      ? "pr-11"
      : "";

    // Combine input styles
    const inputStyles = `
    ${baseInputStyles}
    ${sizes[size]}
    ${borderStyles}
    ${iconPadding}
    ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : ""}
    ${type === "textarea" ? "rounded-xl resize-none" : "rounded-xl"}
    ${inputClassName}
  `
      .trim()
      .replace(/\s+/g, " ");

    // Container styles
    const containerStyles = `${fullWidth ? "w-full" : ""} ${className}`;

    // Render input or textarea
    const InputElement = type === "textarea" ? "textarea" : "input";

    return (
      <div className={containerStyles}>
        {/* Label */}
        {label && (
          <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <InputElement
            ref={ref}
            type={
              type === "password" ? (showPassword ? "text" : "password") : type
            }
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={inputStyles}
            maxLength={maxLength}
            rows={type === "textarea" ? rows : undefined}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error
                ? `${name}-error`
                : helperText
                ? `${name}-helper`
                : undefined
            }
            {...rest}
          />

          {/* Right Icon or Password Toggle */}
          {type === "password" ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {/* Character Count */}
        {showCharCount && maxLength && (
          <div className="mt-1.5 text-right">
            <span
              className={`text-xs ${
                value?.length >= maxLength ? "text-red-500" : "text-gray-500"
              }`}
            >
              {value?.length || 0}/{maxLength}
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={`${name}-error`}
            className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p id={`${name}-helper`} className="mt-1.5 text-xs text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.oneOf([
    "text",
    "email",
    "password",
    "number",
    "tel",
    "url",
    "search",
    "textarea",
  ]),
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  rows: PropTypes.number,
  maxLength: PropTypes.number,
  showCharCount: PropTypes.bool,
};

export default Input;
