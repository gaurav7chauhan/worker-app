import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaRegBell } from "react-icons/fa";
import { LuBellRing } from "react-icons/lu";
import { ImSwitch } from "react-icons/im";
import { TfiClose } from "react-icons/tfi";
import { AiOutlineUserSwitch } from "react-icons/ai";
import { IoCreateOutline } from "react-icons/io5";

const Home = () => {
  const { state } = useLocation();
  const [sideBar, setSideBar] = useState();
  const [notification, setNotification] = useState(false);
  const [cross, setCross] = useState(false);
  const [status, setStatus] = useState(true)
  const role = state?.role || localStorage.getItem("role");

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* NAVBAR */}
      <nav className="bg-white border-b">
        <div className="mx-auto pl-14 pr-7 py-4 flex items-center">
          {/* LEFT */}
          <h2 className="text-2xl font-bold text-slate-800 mr-10">LOGO</h2>
          <div className="flex w-[40%] items-center gap-10">
            <div className="w-full px-20 hidden md:flex justify-between text-slate-600 font-medium">
              <Link className="hover:text-slate-900 underline">About</Link>
              <Link className="hover:text-slate-900 underline">Blog</Link>
              <Link className="hover:text-slate-900 underline">Contacts</Link>
            </div>
          </div>

          {/* CENTER (SEARCH) */}
          <div className="flex-1 flex justify-center">
            <div className="hidden sm:flex w-full max-w-xl">
              <input
                type="search"
                placeholder="Search jobs, companies..."
                className="flex-1 border border-slate-300 rounded-l-full px-5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
              <button className="px-6 rounded-r-full bg-slate-800 text-white hover:bg-slate-700">
                Search
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-6">
            <button className="text-xl text-white hover:bg-slate-800 transition-all p-4 rounded-2xl bg-slate-600">
              {notification ? <LuBellRing /> : <FaRegBell />}
            </button>

            <button
              onClick={() => setSideBar(!sideBar)}
              className="w-10 h-10 rounded-md border flex items-center justify-center bg-slate-600 text-white hover:bg-slate-800"
            >
              <ImSwitch className="text-2xl" />
            </button>
            <button>{/* <TfiClose /> */}</button>
            <div className="hidden sm:flex flex-col items-center text-xs p-4 text-white rounded-2xl bg-slate-600 hover:bg-slate-800 transition-all">
              <AiOutlineUserSwitch className="text-2xl" />
              <span className="capitalize">{role}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="flex-1 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Dashboard Box */}
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            {/* Employer Card */}
            {role === "employer" && (
              <div className="mb-10">
                <div className="border rounded-xl p-6 hover:bg-gray-400 hover:text-white hover:shadow-md hover:scale-105 transition-all">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">
                        Create a Job Post
                      </h3>
                      <p className="text-slate-600">
                        Post a new job and start hiring candidates.
                      </p>
                    </div>
                    <IoCreateOutline className="text-6xl cursor-pointer hover:scale-125 transition-all" />
                  </div>
                </div>
              </div>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="h-44 rounded-xl border bg-slate-50">
                Youtube Thumbnails
              </div>
              <div className="h-44 rounded-xl border bg-slate-50">
                Youtube Thumbnails
              </div>
              <div className="h-44 rounded-xl border bg-slate-50">
                Youtube Thumbnails
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t py-4 text-center text-sm text-slate-500">
        © 2026 Your Company. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
