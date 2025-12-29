import React from "react";
import Register from "./pages/auth/Register";
import VerifyOtp from "./pages/auth/VerifyOtp";
import Login from "./pages/auth/Login";
import { Route, Routes } from "react-router-dom";
import {Toaster} from "react-hot-toast"

const App = () => {
  return (
    <>
    <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/otp" element={<VerifyOtp />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
};

export default App;
