import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import api from "../../api/axios";
import Input from "../../components/ui/Input";
import {
  showErrToast,
  showLoadingToast,
  showSuccessToast,
} from "../../utils/toast";
import toast from "react-hot-toast";

const VerifyOtp = () => {
  const inputsRef = React.useRef([]);
  const [otp, setOtp] = React.useState(Array(6).fill(""));
  const { state } = useLocation();
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  // resend OTP
  const RESEND_TIME = 30;
  const [resendTimer, setResendTimer] = React.useState(RESEND_TIME);
  const [canResend, setCanResend] = React.useState(false);

  // safety guards
  const userId = state?.userId;
  const email = state?.email;
  const purpose = state?.purpose || "register";

  React.useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  React.useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => clearTimeout(timer);
  }, [resendTimer]);

  // handle setOtp
  const handleChange = (e, idx) => {
    const value = e.target.value;

    // allow only single digit
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);

    // move to next input
    if (value && idx < 5) {
      inputsRef.current[idx + 1].focus();
    }
  };

  // handle backspace
  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1].focus();
    }
  };

  // handle form
  const handleSubmit = async (e) => {
    e.preventDefault();

    let toastId;
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      showErrToast("Please enter complete OTP");
      return;
    }

    if (!userId || !email) {
      toast("Invalid or expired session. Please try again.", { icon: "⚠️" });
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      toastId = showLoadingToast("Verifying OTP...");

      await api.post("/auth/verify-otp", {
        userId,
        email,
        purpose,
        otp: finalOtp,
      });

      showSuccessToast("OTP verify successfully", toastId);

      if (purpose === "password_reset") {
        return navigate("/reset-password", { state: { userId } });
      }

      navigate("/login");
    } catch (error) {
      showErrToast(error, toastId);
      return;
    } finally {
      setLoading(false);
    }

    console.log("OTP:", finalOtp);
  };

  // handle resend
  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      showLoadingToast("Resending OTP...");

      await api.post("/auth/request-otp", {
        userId,
        email,
        purpose,
      });

      showSuccessToast("OTP sent again");
      setResendTimer(RESEND_TIME);
      setCanResend(false);
    } catch (error) {
      showErrToast(error);
    }
  };

  const maskedEmail = email ? email.replace(/(.{2}).+(@.+)/, "$1***$2") : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-800 text-center">
          Verify OTP
        </h1>

        {/* Email info */}
        <p className="text-sm text-gray-500 text-center mt-1">
          We’ve sent a 6-digit code to
        </p>
        <p className="text-sm font-medium text-indigo-600 text-center mb-6">
          {maskedEmail}
          {/* or use maskedEmail */}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Inputs */}
          <div className="flex justify-center gap-3">
            {otp.map((val, idx) => (
              <Input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                placeholder="0"
                className="w-12 h-12 text-center text-lg font-semibold
                         border border-gray-300 rounded-lg
                         focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200
                         transition-all"
              />
            ))}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="gradient"
            size="md"
            loading={loading}
            className="cursor-pointer"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>

          {/* OTP resend */}
          <p className="text-xs text-gray-500 text-center">
            Didn’t receive the code?{" "}
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-indigo-600 font-medium hover:underline cursor-pointer"
              >
                Resend OTP
              </button>
            ) : (
              <span className="underline text-indigo-500 hover:text-indigo-700 transition-colors">
                Resend OTP in {resendTimer}s
              </span>
            )}
          </p>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
