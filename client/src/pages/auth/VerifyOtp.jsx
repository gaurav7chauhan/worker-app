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

const VerifyOtp = () => {
  const inputsRef = React.useRef([]);
  const [otp, setOtp] = React.useState(Array(6).fill(""));
  const { state } = useLocation();
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  // safety guards
  const userId = state?.userId;
  const email = state?.email;
  const role = state?.role;
  const fullName = state?.fullName;
  const purpose = state?.purpose || "register";

  React.useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

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
      showErrToast("Session expired. Please register again.");
      navigate("/register");
      return;
    }

    try {
      setLoading(true);
      toastId = showLoadingToast("Verifying OTP...");

      await api.post("/verify-otp", {
        userId,
        email,
        purpose,
        otp: finalOtp,
      });

      showSuccessToast("OTP verify successfully", toastId);

      navigate("/login", {
        state: {
          userId,
          email,
          fullName,
          role,
        },
      });
    } catch (error) {
      showErrToast(error, { id: toastId });
      return;
    } finally {
      setLoading(false);
    }

    console.log("OTP:", finalOtp);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {otp.map((val, idx) => (
          <div key={idx}>
            <Input
              ref={(el) => (inputsRef.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={val}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              placeholder="0"
            />
          </div>
        ))}
        <Button type="submit" loading={loading}>
          {loading ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Processing...
            </>
          ) : (
            "Verify OTP"
          )}
        </Button>
      </form>
    </div>
  );
};

export default VerifyOtp;
