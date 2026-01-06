import React from "react";
import { useForm } from "react-hook-form";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  showErrToast,
  showLoadingToast,
  showSuccessToast,
} from "../../utils/toast";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    let toastId;
    try {
      setLoading(true);
      toastId = showLoadingToast("Logging in...");

      await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      showSuccessToast("Login successful", toastId);
      navigate("/home");
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401) {
        showErrToast("Invalid email or password", toastId);

        setError("email", {
          type: "manual",
          message: "Invalid email or password",
        });

        setError("password", {
          type: "manual",
          message: "Invalid email or password",
        });
        return;
      }

      showErrToast(error, toastId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-800 text-center">
          Welcome back
        </h1>
        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          Login to continue
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <Input
            label="Email"
            type="email"
            placeholder="gaurav@chauhan.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Please enter a valid email address",
              },
            })}
            error={errors.email?.message}
          />

          {/* Password */}
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

          {/* Forgot password */}
          <div className="flex justify-end">
            <span
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-indigo-600 cursor-pointer hover:underline"
            >
              Forgot password?
            </span>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            fullWidth
            variant="gradient"
            size="md"
            loading={loading}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="grow border-t border-gray-300" />
          <span className="mx-3 text-xs text-gray-400">OR</span>
          <div className="grow border-t border-gray-300" />
        </div>

        {/* Register Redirect */}
        <p className="text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
