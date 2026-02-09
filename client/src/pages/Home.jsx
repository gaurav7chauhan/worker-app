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
import { MdDeleteForever, MdCreateNewFolder } from "react-icons/md";
import { BsPostcardFill } from "react-icons/bs";
import { IoIosApps } from "react-icons/io";
import api from "../api/axios";
import {
  showErrToast,
  showLoadingToast,
  showSuccessToast,
} from "../utils/toast";

const Home = () => {
  const [notification, setNotification] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { state } = useLocation();
  const role = state?.role || localStorage.getItem("role");
  const userId = state?.userId;

  /* ------------------------ CREATE ---------------------------- */
  let toastId;

  const handleCreateJob = () => {
    navigate("/post/create", {
      state: userId,
    });
  };

  /* ------------------------ SWITCH ---------------------------- */
  const handleSwitch = async () => {
    await api.patch(`toggle-role/:${role}`);
  };

  /* ------------------------ POSTS LOGIC ---------------------------- */
  const handleLastPost = () => {};

  const handleMyPosts = () => {
    navigate("/posts");
  };

  const handleDeleteAllPosts = async () => {
    await api.delete("/post/bulk/purge");
  };

  /* ------------------------ COMMENT ------------------------------- */
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
        <div className="max-w-full px-8 py-4">
          <div className="grid grid-cols-[1fr_auto] gap-8 items-center">
            {/* Logo and Brand */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">J</span>
                </div>
                <h2 className="text-2xl font-bold bg-linear-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
                  JobPortal
                </h2>
              </div>

              {/* Search Bar */}
              <div className="flex-1 relative max-w-xl">
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r 
                from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 
                hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex gap-4 items-center">
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

              <button
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-indigo-100 to-purple-100 
              rounded-xl text-indigo-700 font-medium shadow-sm hover:shadow-md transition-all"
                onClick={handleSwitch}
              >
                <AiOutlineUserSwitch className="w-5 h-5" />
                <span className="capitalize text-sm">
                  Switch to {role === "employer" ? "Worker" : "Employer"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Grid Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-full px-8">
          <div className="grid grid-cols-5 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center justify-center gap-3 px-6 py-4 text-slate-700 
              hover:bg-indigo-50 hover:text-indigo-700 font-medium transition-all duration-200 
              border-b-4 border-transparent hover:border-indigo-600 group"
              >
                <item.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-base">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="overflow-auto">
        <div className="max-w-full px-8 py-10">
          {/* Employer Dashboard - Large Full Width Section */}
          {role === "employer" && (
            <div className="bg-linear-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-lg border border-indigo-100 p-10 mb-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    Employer Dashboard
                  </h2>
                  <p className="text-slate-600">
                    Manage your job posts and applications
                  </p>
                </div>
                <button
                  onClick={handleCreateJob}
                  className="flex items-center gap-3 px-6 py-4 bg-linear-to-r from-indigo-600 
                to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 
                transition-all duration-200 shadow-xl hover:shadow-2xl font-semibold text-lg"
                >
                  <IoCreateOutline className="w-6 h-6" />
                  Create New Job Post
                </button>
              </div>

              {/* Grid Layout for Employer Actions */}
              <div className="grid grid-cols-5 gap-6">
                <button
                  onClick={handleCreateJob}
                  className="bg-white border-2 border-blue-200 rounded-2xl p-8 hover:border-blue-400 
                hover:shadow-2xl transition-all text-blue-700 font-medium group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex flex-col items-center">
                    <MdCreateNewFolder className="w-14 h-14 mb-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-base">Create Post</span>
                    <span className="text-xs text-slate-500 mt-2">
                      New job listing
                    </span>
                  </div>
                </button>

                <button
                  onClick={handleLastPost}
                  className="bg-white border-2 border-blue-200 rounded-2xl p-8 hover:border-blue-400 
                hover:shadow-2xl transition-all text-blue-700 font-medium group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex flex-col items-center">
                    <BsPostcardFill className="w-14 h-14 mb-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-base">Last Post</span>
                    <span className="text-xs text-slate-500 mt-2">
                      View recent
                    </span>
                  </div>
                </button>

                <button
                  onClick={handleMyPosts}
                  className="bg-white border-2 border-green-200 rounded-2xl p-8 hover:border-green-400 
                hover:shadow-2xl transition-all text-green-700 font-medium group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex flex-col items-center">
                    <IoIosApps className="w-14 h-14 mb-4 text-green-600 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-base">My Posts</span>
                    <span className="text-xs text-slate-500 mt-2">
                      All listings
                    </span>
                  </div>
                </button>

                <button
                  className="bg-white border-2 border-green-200 rounded-2xl p-8 hover:border-green-400 
                hover:shadow-2xl transition-all text-green-700 font-medium group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex flex-col items-center">
                    <IoPeople className="w-14 h-14 mb-4 text-green-600 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-base">Applicants</span>
                    <span className="text-xs text-slate-500 mt-2">
                      View all
                    </span>
                  </div>
                </button>

                <button
                  className="bg-white border-2 border-red-200 rounded-2xl p-8 hover:border-red-400 
                hover:shadow-2xl transition-all text-red-700 font-medium group relative overflow-hidden"
                  onClick={handleDeleteAllPosts}
                >
                  <div className="absolute inset-0 bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex flex-col items-center">
                    <MdDeleteForever className="w-14 h-14 mb-4 text-red-600 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-base">Delete All</span>
                    <span className="text-xs text-slate-500 mt-2">
                      Remove posts
                    </span>
                  </div>
                </button>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-4 gap-6 mt-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
                  <p className="text-sm text-slate-600 font-medium mb-2">
                    Total Posts
                  </p>
                  <p className="text-3xl font-bold text-indigo-600">47</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200">
                  <p className="text-sm text-slate-600 font-medium mb-2">
                    Active Now
                  </p>
                  <p className="text-3xl font-bold text-green-600">24</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200">
                  <p className="text-sm text-slate-600 font-medium mb-2">
                    Pending Review
                  </p>
                  <p className="text-3xl font-bold text-orange-600">8</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-200">
                  <p className="text-sm text-slate-600 font-medium mb-2">
                    Total Views
                  </p>
                  <p className="text-3xl font-bold text-purple-600">3.4K</p>
                </div>
              </div>
            </div>
          )}
          {/* Dashboard Stats - Full Width Grid */}
          <div className="grid grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                    Active Jobs
                  </p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">24</p>
                  <p className="text-sm text-green-600 mt-2">
                    ↑ 12% this month
                  </p>
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
                  <p className="text-4xl font-bold text-slate-900 mt-2">156</p>
                  <p className="text-sm text-green-600 mt-2">
                    ↑ 23% this month
                  </p>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                  <IoPeople className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium text-slate-600 uppercase tracking-wide"
                    onClick={handleComments}
                  >
                    Comments
                  </p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">23</p>
                  <p className="text-sm text-purple-600 mt-2">5 new today</p>
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
                  <p className="text-4xl font-bold text-slate-900 mt-2">1.2K</p>
                  <p className="text-sm text-orange-600 mt-2">↑ 8% this week</p>
                </div>
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <AiOutlineUserSwitch className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid - 2 Columns */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            {/* Recent Jobs Block */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <IoBriefcase className="w-7 h-7 text-indigo-600" />
                  Recent Jobs
                </h3>
                <Link
                  to="/jobs"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-auto">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="p-5 border border-slate-200 rounded-xl hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">
                          Senior React Developer
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          Posted 2 hours ago • Remote
                        </p>
                        <div className="flex gap-2 mt-3">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                            Full-time
                          </span>
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            $80-120K
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700">
                          <IoPeople className="w-4 h-4" />
                          12
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          applicants
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <IoChatbubble className="w-7 h-7 text-purple-600" />
                  Recent Activity
                </h3>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-auto">
                {[
                  {
                    action: "New application received",
                    detail: "John Doe applied for Senior Developer",
                    time: "5 min ago",
                    color: "green",
                  },
                  {
                    action: "Job post viewed",
                    detail: "Your React Developer post got 15 views",
                    time: "1 hour ago",
                    color: "blue",
                  },
                  {
                    action: "Comment posted",
                    detail: "New comment on Full Stack position",
                    time: "2 hours ago",
                    color: "purple",
                  },
                  {
                    action: "Application reviewed",
                    detail: "You reviewed 3 applications",
                    time: "3 hours ago",
                    color: "orange",
                  },
                  {
                    action: "New message",
                    detail: "Sarah sent you a message",
                    time: "4 hours ago",
                    color: "indigo",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                  >
                    <div
                      className={`w-12 h-12 bg-${item.color}-100 rounded-full flex items-center justify-center flex-shrink-0`}
                    >
                      <div
                        className={`w-3 h-3 bg-${item.color}-600 rounded-full`}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">
                        {item.action}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {item.detail}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Grid - 3 Columns with Content Blocks */}
          <div className="grid grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-all">
              <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-8 bg-indigo-600 rounded"></div>
                Trending Skills
              </h4>
              <div className="space-y-3">
                {[
                  { skill: "React", count: 145 },
                  { skill: "Node.js", count: 132 },
                  { skill: "TypeScript", count: 98 },
                  { skill: "AWS", count: 87 },
                  { skill: "Docker", count: 76 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-all cursor-pointer group"
                  >
                    <span className="font-semibold text-slate-700 group-hover:text-indigo-700">
                      {item.skill}
                    </span>
                    <span className="text-sm text-indigo-600 font-bold">
                      {item.count} jobs
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-all">
              <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-8 bg-green-600 rounded"></div>
                Top Candidates
              </h4>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 hover:bg-green-50 rounded-xl transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">Candidate {i}</p>
                      <p className="text-xs text-slate-500">
                        Applied 2 days ago
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                      95%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-all">
              <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-8 bg-purple-600 rounded"></div>
                Performance Metrics
              </h4>
              <div className="space-y-6">
                <div className="p-5 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-sm text-slate-600 font-medium mb-2">
                    Response Rate
                  </p>
                  <p className="text-4xl font-bold text-purple-600">92%</p>
                  <div className="w-full h-2 bg-purple-200 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-purple-600 w-[92%]"></div>
                  </div>
                </div>
                <div className="p-5 bg-orange-50 rounded-xl border border-orange-100">
                  <p className="text-sm text-slate-600 font-medium mb-2">
                    Avg. Time to Hire
                  </p>
                  <p className="text-4xl font-bold text-orange-600">12d</p>
                  <p className="text-sm text-green-600 mt-2">↓ 3 days faster</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200 mt-10">
        <div className="max-w-full px-8 py-6">
          <div className="grid grid-cols-3 items-center">
            <p className="text-sm text-slate-500">
              © 2026 JobPortal. All rights reserved.
            </p>
            <div className="text-center">
              <div className="flex justify-center gap-6">
                <a
                  href="#"
                  className="text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  Terms
                </a>
                <a
                  href="#"
                  className="text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  Help
                </a>
              </div>
            </div>
            <div className="text-right text-sm text-slate-500">
              Made with ❤️ in India
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Home;
