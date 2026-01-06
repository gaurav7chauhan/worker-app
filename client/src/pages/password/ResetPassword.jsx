import React from "react";
import Input from "../../components/ui/Input";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import {
  showErrToast,
  showLoadingToast,
  showSuccessToast,
} from "../../utils/toast";
import api from "../../api/axios";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const navigate = useNavigate();
  const { state } = useLocation();
  const userId = state?.userId;

  const onSubmit = async () => {
    // safety guard
    if (!userId) {
      toast("Invalid or expired reset session", { icon: "⚠️" });
      navigate("/login");
      return;
    }

    // validations
    if (!password || !confirmPassword) {
      showErrToast("Both password fields are required");
      return;
    }

    if (password !== confirmPassword) {
      showErrToast("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      showErrToast("Password must be at least 8 characters long");
      return;
    }

    let toastId;
    try {
      setLoading(true);
      toastId = showLoadingToast("Resetting your password...");

      await api.post("/password/reset", {
        userId,
        newPassword: password,
        confirmPassword,
      });

      showSuccessToast("Password reset successfully! Please login.", toastId);

      navigate("/login");
    } catch (error) {
      showErrToast(error, toastId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-800 text-center">
          Reset Password
        </h1>

        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          Create a new password for your account
        </p>

        <div className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button onClick={onSubmit} loading={loading} fullWidth>
            Reset Password
          </Button>

          <p className="text-sm text-center text-gray-600">
            Back to{" "}
            <span
              onClick={() => navigate("/login")}
              className="font-medium cursor-pointer hover:underline text-blue-600"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
