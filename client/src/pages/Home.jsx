import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaRegBell } from "react-icons/fa";
import { LuBellRing } from "react-icons/lu";
import { AiOutlineUserSwitch } from "react-icons/ai";
import {
  IoCreateOutline,
  IoHome,
  IoBriefcase,
  IoPeople,
  IoChatbubble,
  IoSettings,
} from "react-icons/io5";
import { IoIosApps } from "react-icons/io";
import api from "../api/axios";

const Home = () => {
  const { state } = useLocation();
  const [notification, setNotification] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const role = state?.role || localStorage.getItem("role");
  const navigate = useNavigate();

  const handlePost = () => {
    navigate("/post/create");
  };

  const handleSwitch = async () => {
    await api.get();
  };

  const handleComments = async () => {};

  const navItems = [
    { icon: IoHome, label: "Dashboard", path: "/" },
    { icon: IoBriefcase, label: "Jobs", path: "/jobs" },
    { icon: IoPeople, label: "Candidates", path: "/candidates" },
    { icon: IoChatbubble, label: "Messages", path: "/messages" },
    { icon: IoSettings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-indigo-50">
      {/* Top Search Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-20">
            <div className="flex-1 relative max-w-2xl">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="search"
                placeholder="Search jobs, companies, candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-slate-100/50 border border-slate-200 rounded-2xl 
                  focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 
                  text-slate-700 placeholder-slate-400 transition-all duration-200"
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-linear-to-r 
                from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 
                hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Search
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex gap-10">
              <button
                onClick={() => setNotification(!notification)}
                className="p-3 bg-linear-to-r from-indigo-100 to-purple-100 text-indigo-600 
                  rounded-2xl hover:from-indigo-200 hover:to-purple-200 transition-all duration-200 
                  shadow-md hover:shadow-lg"
              >
                {notification ? (
                  <LuBellRing className="w-6 h-6" />
                ) : (
                  <FaRegBell className="w-6 h-6" />
                )}
              </button>

              <div
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-indigo-100 to-purple-100 
                rounded-xl text-indigo-700 font-medium shadow-sm hover:shadow-md transition-all"
                onClick={handleSwitch}
              >
                <AiOutlineUserSwitch className="w-5 h-5" />
                <span className="capitalize text-sm">
                  Switch to {role === "employer" ? "Worker" : "Employer"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Always Open Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur-md border-r border-slate-200 shadow-lg">
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-200">
              <div className="w-10 h-10 bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <h2 className="text-2xl font-bold bg-linear-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
                JobPortal
              </h2>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-indigo-50 
                    hover:text-indigo-700 font-medium transition-all duration-200 group"
                >
                  <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Quick Actions - Future Expansions */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {role === "employer" && (
                  <button
                    onClick={handlePost}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 
                      to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 
                      transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  >
                    <IoCreateOutline className="w-5 h-5" />
                    Post New Job
                  </button>
                )}
                {/* Add more quick actions here */}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-10">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                      Active Jobs
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">24</p>
                  </div>
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                    <IoBriefcase className="w-8 h-8 text-indigo-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                      Applications
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      156
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                    <IoPeople className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-sm font-medium text-slate-600 uppercase tracking-wide"
                      onClick={handleComments}
                    >
                      Comments
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">23</p>
                  </div>
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <IoChatbubble className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                      Profile Views
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      1.2K
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <AiOutlineUserSwitch className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Blocks - Expandable */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Jobs Block */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <IoBriefcase className="w-7 h-7 text-indigo-600" />
                  Recent Jobs
                </h3>
                <div className="space-y-4 h-96 overflow-auto">
                  {/* Add job cards here */}
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all"
                    >
                      <p className="font-medium text-slate-800">
                        Job Title {i}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        $500 - Posted 2h ago
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions / Employer Specific */}
              {role === "employer" && (
                <div className="bg-linear-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-sm border border-indigo-100 p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">
                    Employer Dashboard
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => navigate("/posts/my-posts")}
                      className="p-6 bg-white border-2 border-green-200 rounded-xl hover:border-green-400 
                      hover:shadow-lg transition-all text-green-700 font-medium group"
                    >
                      <div className="flex flex-col items-center">
                        <IoIosApps className="w-8 h-8 mx-auto mb-3 text-green-600 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-sm">My Posts</span>
                      </div>
                    </button>

                    <button
                      className="p-6 bg-white border-2 border-green-200 rounded-xl hover:border-green-400 
                      hover:shadow-lg transition-all text-green-700 font-medium"
                    >
                      <IoPeople className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      View Applicants
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Future Content Area */}
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add your Youtube Thumbnails or other blocks here */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 min-h-75">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">
                  Content Block 1
                </h4>
                <p className="text-slate-600">Add your content here...</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 min-h-75">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">
                  Content Block 2
                </h4>
                <p className="text-slate-600">Add your content here...</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 min-h-75">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">
                  Content Block 3
                </h4>
                <p className="text-slate-600">Add your content here...</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-sm text-slate-500">
            © 2026 JobPortal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
