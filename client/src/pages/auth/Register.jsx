// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Input from "../../components/ui/Input";
// import Button from "../../components/ui/Button";

// const Register = () => {
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     role: "worker",
//   });
//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: "" }));
//     }
//   };

//   const validate = () => {
//     const newErrors = {};
//     if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
//     if (!formData.email.trim()) newErrors.email = "Email is required";
//     else if (!/\S+@\S+\.\S+/.test(formData.email))
//       newErrors.email = "Invalid email format";
//     if (!formData.password) newErrors.password = "Password is required";
//     else if (formData.password.length < 8)
//       newErrors.password = "Password must be at least 8 characters";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     setIsSubmitting(true);
//     try {
//       console.log("Form submitted:", formData);
//       navigate("/otp", {
//         state: { role: formData.role, email: formData.email },
//       });
//     } catch (error) {
//       console.error("Registration failed:", error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
//       <div className="w-full max-w-2xl">
//         {/* Header */}
//         <div className="text-center mb-10">
//           <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-black mb-6">
//             <svg
//               className="w-10 h-10 text-white"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//               />
//             </svg>
//           </div>
//           <h1 className="text-4xl font-bold text-gray-900 mb-3">
//             Create Account
//           </h1>
//           <p className="text-lg text-gray-600">
//             Start your journey with us today
//           </p>
//         </div>

//         {/* Form Card */}
//         <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-12">
//           <form onSubmit={handleSubmit} className="space-y-7">
//             {/* Full Name */}
//             <Input
//               label="Full Name"
//               type="text"
//               name="fullName"
//               value={formData.fullName}
//               onChange={handleChange}
//               placeholder="Enter your full name"
//               error={errors.fullName}
//               required
//               fullWidth
//             />

//             {/* Email */}
//             <Input
//               label="Email Address"
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="your.email@example.com"
//               error={errors.email}
//               required
//               fullWidth
//               leftIcon={
//                 <svg
//                   className="w-5 h-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
//                   />
//                 </svg>
//               }
//             />

//             {/* Password */}
//             <Input
//               label="Password"
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               placeholder="Create a strong password"
//               error={errors.password}
//               helperText={
//                 !errors.password ? "Must be at least 8 characters" : ""
//               }
//               required
//               fullWidth
//             />

//             {/* Role Selection Section */}
//             <div className="pt-4">
//               <label className="block text-base font-semibold text-gray-900 mb-4">
//                 I want to join as
//               </label>
//               <div className="grid grid-cols-2 gap-4">
//                 <label
//                   className={`role-card-large ${
//                     formData.role === "worker"
//                       ? "ring-2 ring-black bg-gray-50 border-black"
//                       : ""
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name="role"
//                     value="worker"
//                     checked={formData.role === "worker"}
//                     onChange={handleChange}
//                     className="sr-only"
//                   />
//                   <div className="text-center p-2">
//                     <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-3">
//                       <svg
//                         className="w-8 h-8 text-gray-700"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//                         />
//                       </svg>
//                     </div>
//                     <p className="font-semibold text-lg text-gray-900">Worker</p>
//                     <p className="text-sm text-gray-500 mt-1">
//                       Find opportunities
//                     </p>
//                   </div>
//                 </label>

//                 <label
//                   className={`role-card-large ${
//                     formData.role === "employer"
//                       ? "ring-2 ring-black bg-gray-50 border-black"
//                       : ""
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name="role"
//                     value="employer"
//                     checked={formData.role === "employer"}
//                     onChange={handleChange}
//                     className="sr-only"
//                   />
//                   <div className="text-center p-2">
//                     <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-3">
//                       <svg
//                         className="w-8 h-8 text-gray-700"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
//                         />
//                       </svg>
//                     </div>
//                     <p className="font-semibold text-lg text-gray-900">
//                       Employer
//                     </p>
//                     <p className="text-sm text-gray-500 mt-1">
//                       Hire talent
//                     </p>
//                   </div>
//                 </label>
//               </div>
//             </div>

//             {/* Submit Button */}
//             <div className="pt-4">
//               <Button type="submit" fullWidth loading={isSubmitting}>
//                 Create Account & Verify
//               </Button>
//             </div>
//           </form>

//           {/* Footer */}
//           <div className="mt-8 text-center pt-6 border-t border-gray-200">
//             <p className="text-base text-gray-600">
//               Already have an account?{" "}
//               <a
//                 href="/login"
//                 className="font-semibold text-black hover:underline"
//               >
//                 Sign in here
//               </a>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;

// SECOND - MINE CODE

import React from "react";
import { useState } from "react";
import Input from "../../components/ui/Input.jsx";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import api from "../../api/axios.js";

const Register = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
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

  const onSubmit = async (data) => {
    try {
      // 1️⃣ Decide register route by role
      const registerUrl =
        data.role === "employer"
          ? "/auth/register/employer"
          : "/auth/register/employer";

      // 2️⃣ Call register API
      const registerRes = await api.post(registerUrl, {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      // backend should return userId or tempId
      const { userId } = registerRes.data;

      // 3️⃣ Request OTP
      await api.post("/auth/request-register-otp", {
        userId,
        email: data.email,
        role: data.role,
        purpose: "register",
      });

      // 4️⃣ Navigate to OTP page
      navigate("/otp", {
        state: {
          userId,
          email: data.email,
          role: data.role,
        },
      });
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Something went wrong";
      toast.error(msg);
    }
  };

  return (
    <>
      <div className="flex flex-col text-center items-center justify-center mt-32 bg-gray-500 py-10 text-white">
        <h1 className="text-center">Register</h1>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="fullName*"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              {...register("fullName", { required: "Full name is required" })}
              error={errors.fullName?.message}
              className="flex flex-col items-start py-2"
            />
            <Input
              label="email*"
              name="email"
              type="email"
              placeholder="Enter your email"
              {...register("email", { required: "email is required" })}
              error={errors.email?.message}
              className="flex flex-col items-start py-2"
            />
            {email && !email.includes("@") && (
              <p className="text-red-500 text-sm">Email must include @</p>
            )}

            <Input
              label="password*"
              name="password"
              type="password"
              placeholder="Create a password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Min 8 characters" },
              })}
              error={errors.password?.message}
              className="flex flex-col items-start py-2"
            />
            {password && (
              <p
                className={`text-sm mt-1 ${
                  isStrongPassword ? "text-green-600" : "text-red-600"
                }`}
              >
                {isStrongPassword ? "Strong password" : "Weak password"}
              </p>
            )}
            <div>
              <h3 className="py-5">Select Role</h3>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="employer"
                    {...register("role", { required: "Please select a role" })}
                  />
                  Employer
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="worker"
                    {...register("role", { required: "Please select a role" })}
                  />
                  Worker
                </label>
              </div>

              {errors.role && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>
            {role && <p>Selected role: {role}</p>}

            <button type="submit">Register for OTP</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
