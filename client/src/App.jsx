import React from "react";
import SelectRoles from "./pages/auth/SelectRoles.jsx";
import Register from "./pages/auth/Register";
import VerifyOtp from "./pages/auth/VerifyOtp";
import Login from "./pages/auth/Login";
import { Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<SelectRoles />} />
      <Route path="/select-role" element={<SelectRoles />} />
      <Route path="/register" element={<Register />} />
      <Route path="/otp" element={<VerifyOtp />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default App;
