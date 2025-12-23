import React from "react";
import SelectRoles from "./pages/auth/SelectRoles.jsx";
import Register from "./pages/auth/Register";
import VerifyOtp from "./pages/auth/VerifyOtp";
import Login from "./pages/auth/Login";

const App = () => {
  return <div>
    {/* <SelectRoles /> */}
    <Register />
    {/* <VerifyOtp /> */}
    <Login />
  </div>;
};

export default App;
