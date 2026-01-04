import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input.jsx";
import api from "../../api/axios.js";
import { HiBriefcase } from "react-icons/hi2";
import { FaHardHat } from "react-icons/fa";
import {
  dismissToast,
  showErrToast,
  showLoadingToast,
  showSuccessToast,
} from "../../utils/toast.js";
import Button from "../../components/ui/Button.jsx";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const submitLockRef = React.useRef(false);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm();

  const password = watch("password");
  const role = watch("role");
  const email = watch("email");

  const isStrongPassword =
    password &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^a-zA-Z0-9]/.test(password);

  // ONSUBMIT
  const onSubmit = async (data) => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    let toastId;

    try {
      setLoading(true);

      // toast
      toastId = showLoadingToast("Sending OTP...");

      // API calls to auth
      const registerUrl =
        data.role === "employer"
          ? "/auth/register/employer"
          : "/auth/register/worker";

      const registerRes = await api.post(registerUrl, data);
      const { userId } = registerRes.data;

      // API calls to OTP
      await api.post("/auth/request-otp", {
        userId,
        email: data.email,
        purpose: "register",
      });

      // toast
      showSuccessToast("OTP sent successfully", toastId);

      // naviagation
      navigate("/otp", {
        state: {
          userId,
          email: data.email,
          purpose: "register",
        },
      });
    } catch (error) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.error?.message || "";

      dismissToast(toastId);

      if (status === 409 && msg.toLowerCase().includes("exists.")) {
        setError("email", {
          type: "manual",
          message: "This email is already registered",
        });
        return;
      }

      // All other errors → toast
      showErrToast(error, { id: toastId });
    } finally {
      setLoading(false);
      submitLockRef.current = false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-800 text-center">
          Create your account
        </h1>
        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          Register to continue
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="FullName"
            placeholder="gaurav chauhan"
            {...register("fullName", { required: "Full name is required" })}
            error={errors.fullName?.message}
          />

          <Input
            label="Email"
            type="email"
            placeholder="gaurav@chauhan.com"
            {...register("email", { required: "Email is required" })}
            error={errors.email?.message}
          />

          {email && !email.includes("@") && (
            <p className="text-xs text-red-500">Please enter a valid email</p>
          )}

          <Input
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Minimum 8 characters" },
            })}
            error={errors.password?.message}
          />

          {password && (
            <p
              className={`text-xs ${
                isStrongPassword ? "text-green-600" : "text-red-500"
              }`}
            >
              {isStrongPassword ? "Strong password" : "Weak password"}
            </p>
          )}

          {/* Role Selection */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Select role
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Employer */}
              <label className="cursor-pointer">
                <input
                  type="radio"
                  value="employer"
                  {...register("role", { required: "Select a role" })}
                  className="peer hidden"
                />
                <div
                  className="flex flex-col items-center justify-center gap-1
                    rounded-lg border border-gray-300 py-3 text-blue-700
                   peer-checked:border-indigo-600 peer-checked:bg-indigo-50
                   peer-checked:text-indigo-600 peer-checked:scale-[1.05] hover:border-blue-700 transition-all"
                >
                  <HiBriefcase size={22} />
                  <span className="text-sm font-medium">Employer</span>
                </div>
              </label>

              {/* Worker */}
              <label className="cursor-pointer">
                <input
                  type="radio"
                  value="worker"
                  {...register("role", { required: "Select a role" })}
                  className="peer hidden"
                />
                <div
                  className="flex flex-col items-center justify-center gap-1
                  rounded-lg border border-gray-300 py-3 text-blue-700
                  peer-checked:border-indigo-600 peer-checked:bg-indigo-50
                  peer-checked:text-indigo-600 peer-checked:scale-[1.05] hover:border-blue-700 transition-all"
                >
                  <FaHardHat size={22} />
                  <span className="text-sm font-medium">Worker</span>
                </div>
              </label>
            </div>

            {errors.role && (
              <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>
            )}
          </div>

          <Button
            type="submit"
            fullWidth
            variant="gradient"
            size="md"
            loading={loading}
            disabled={!role}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Processing...
              </>
            ) : (
              "Register & Get OTP"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="grow border-t border-gray-300" />
          <span className="mx-3 text-xs text-gray-400">OR</span>
          <div className="grow border-t border-gray-300" />
        </div>

        {/* Login Redirect */}
        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
