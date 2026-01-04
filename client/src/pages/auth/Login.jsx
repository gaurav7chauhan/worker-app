import React from "react";
import { useForm } from "react-hook-form";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  dismissToast,
  showErrToast,
  showLoadingToast,
  showSuccessToast,
} from "../../utils/toast";
import api from "../../api/axios";

const Login = () => {
  const [loading, setLoading] = React.useState(false);
  const {
    handleSubmit,
    register,
    watch,
    setError,
    formState: { errors },
  } = useForm();

  const email = watch("email");
  const password = watch("password");

  const onSubmit = async (data) => {
    let toastId;
    try {
      setLoading(true);
      toastId = showLoadingToast("Verifying user");

      await api.post("/auth/login", {
        state: {
          email: data.email,
          password: data.password,
        },
      });

      showSuccessToast("User successfully login", toastId);
    } catch (error) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.error?.message || "";

      dismissToast(toastId);

      if (status === 401 && msg.toLowerCase().includes("exists.")) {
        setError("email", {
          type: "manual",
          message: "Invalid email or password",
        });
        return;
      }

      showErrToast(error, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* email */}
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

        {/* password */}
        <Input
          label="Password"
          type="password"
          placeholder="password"
          {...register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "Minimum 8 characters" },
          })}
          error={errors.password?.message}
        />
        <Button type="submit" loading={loading}>
          login
        </Button>
      </form>
    </div>
  );
};

export default Login;
