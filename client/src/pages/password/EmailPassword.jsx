import React from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import {
  showErrToast,
  showLoadingToast,
  showSuccessToast,
} from "../../utils/toast";
import api from "../../api/axios";
import { useLocation, useNavigate } from "react-router-dom";

const EmailPassword = () => {
  const { state } = useLocation();
  const userEmail = state?.email;

  const [email, setEmail] = React.useState(userEmail || "");
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const onSubmit = async () => {
    if (!email) {
      showErrToast("Email is required");
      return;
    }

    let toastId;
    try {
      setLoading(true);
      toastId = showLoadingToast("Sending OTP...");

      const passwordUrl = await api.post("/password/forgot-email", { email });

      const { id } = passwordUrl.data;

      showSuccessToast("OTP sent successfully", toastId);
      navigate("/verify-otp", {
        state: { userId: id, email, purpose: "password_reset" },
      });
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
          Forgot Password
        </h1>

        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          Enter your registered email to receive OTP
        </p>

        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button loading={loading} onClick={onSubmit} fullWidth>
            Send OTP
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

export default EmailPassword;
