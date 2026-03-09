import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaRegBell } from "react-icons/fa";
import { LuBellRing } from "react-icons/lu";
import { AiOutlineUserSwitch } from "react-icons/ai";
import { IoCreateOutline, IoPeople } from "react-icons/io5";
import { MdDeleteForever, MdCreateNewFolder } from "react-icons/md";
import { BsPostcardFill } from "react-icons/bs";
import { IoIosApps } from "react-icons/io";
import api from "../api/axios";

const Home = () => {
  const [notification, setNotification] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const navigate = useNavigate();

  const { state } = useLocation();
  const role = state?.role || localStorage.getItem("role");
  const userId = state?.userId;

  const handleCreateJob = () => {
    navigate("/post/create", { state: userId });
  };

  const handleSwitch = async () => {
    await api.patch(`toggle-role/:${role}`);
  };

  const handleLastPost = () => {};

  const handleMyPosts = () => {
    navigate("/posts");
  };

  const handleDeleteAllPosts = async () => {
    await api.delete(`/post/bulk/purge?confirm=${confirmation}`);
  };

  return (
    <div style={{ padding: "20px", background: "#f5f5f5", minHeight: "100vh" }}>
      
      {/* Top Bar */}
      <div
        style={{
          background: "#ffffff",
          padding: "15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <h2>JobPortal</h2>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button>Search</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <button onClick={() => setNotification(!notification)}>
            {notification ? <LuBellRing /> : <FaRegBell />}
          </button>

          <button onClick={handleSwitch}>
            <AiOutlineUserSwitch />
            Switch to {role === "employer" ? "Worker" : "Employer"}
          </button>
        </div>
      </div>

      {/* Employer Dashboard */}
      {role === "employer" && (
        <div style={{ background: "#ffffff", padding: "20px" }}>
          
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2>Employer Dashboard</h2>
              <p>Manage your job posts</p>
            </div>

            <button onClick={handleCreateJob} style={{ display: "flex", gap: "5px" }}>
              <IoCreateOutline />
              Create Job
            </button>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "15px",
            }}
          >
            <button onClick={handleCreateJob} style={{ padding: "15px" }}>
              <MdCreateNewFolder />
              <p>Create Post</p>
            </button>

            <button onClick={handleLastPost} style={{ padding: "15px" }}>
              <BsPostcardFill />
              <p>Last Post</p>
            </button>

            <button onClick={handleMyPosts} style={{ padding: "15px" }}>
              <IoIosApps />
              <p>My Posts</p>
            </button>

            <button style={{ padding: "15px" }}>
              <IoPeople />
              <p>Applicants</p>
            </button>

            <button
              onClick={handleDeleteAllPosts}
              style={{ padding: "15px", background: "#ffe5e5" }}
            >
              <MdDeleteForever />
              <p>Delete All</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;