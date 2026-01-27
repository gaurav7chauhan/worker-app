import Register from "./pages/auth/Register";
import VerifyOtp from "./pages/auth/VerifyOtp";
import Login from "./pages/auth/Login";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import EmailPassword from "./pages/password/EmailPassword";
import ResetPassword from "./pages/password/ResetPassword";
import CreatePost from "./pages/posts/CreatePost";
import MyPosts from "./pages/posts/MyPosts";
import Post from "./pages/posts/Post";
import UpdatePost from "./pages/posts/UpdatePost";
import EmployerPosts from "./pages/posts/EmployerPosts";

const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#1f2937",
            border: "1px solid #e5e7eb",
          },
          error: {
            iconTheme: {
              primary: "#dc2626",
              secondary: "#fff",
            },
          },
        }}
      />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/forgot-password-email" element={<EmailPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/post/create" element={<CreatePost />} />
        <Route path="/post" element={<Post />} />
        <Route path="/posts" element={<MyPosts />} />
        <Route path="/post/employer" element={<EmployerPosts />} />
        <Route path="/post/update" element={<UpdatePost />} />
      </Routes>
    </>
  );
};

export default App;
