import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  showErrToast,
  showLoadingToast,
  showSuccessToast,
} from "../../utils/toast";
import Button from "../../components/ui/Button";

const MyPosts = () => {
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const toastId = showLoadingToast("Loading posts...");
      try {
        const res = await api.get("/post/");
        showSuccessToast("Posts loaded");
        setResult(res.data.posts || []);
      } catch (error) {
        showErrToast("Failed to load posts");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header Section */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">My Posts</h1>
              <p className="text-slate-300 text-sm">
                Manage and track all your job postings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/20 px-4 py-2 rounded-lg border border-amber-500/50">
                <span className="text-amber-200 text-sm">Total Posts: </span>
                <span className="text-amber-400 font-bold">
                  {result.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-slate-300 text-lg">
              Loading...
            </div>
          </div>
        ) : result.length === 0 ? (
          // Brighter Empty State
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center max-w-md">
              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-500/50">
                <svg
                  className="w-10 h-10 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No posts yet
              </h3>
              <p className="text-slate-300 mb-6 text-base">
                You haven't created any job posts. Start by creating your first
                post to find the perfect candidate.
              </p>
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-6 py-3">
                Create Your First Post
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {result.map((post) => (
              <div
                key={post._id}
                className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header with Budget and Status */}
                <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-700">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-amber-400">
                        ₹{post.budgetAmount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      Budget Amount
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      post.status === "Open"
                        ? "bg-green-500/20 text-green-300 border border-green-400/50"
                        : post.status === "Closed"
                          ? "bg-red-500/20 text-red-300 border border-red-400/50"
                          : "bg-yellow-500/20 text-yellow-300 border border-yellow-400/50"
                    }`}
                  >
                    {post.status}
                  </span>
                </div>

                {/* Description */}
                <div className="mb-5">
                  <p className="text-sm text-slate-200 leading-relaxed line-clamp-3 min-h-[3.75rem]">
                    {post.description || "No description provided"}
                  </p>
                </div>

                {/* Category Tags */}
                {post.category?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                      Categories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.category.slice(0, 3).map((cat, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-600 font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                      {post.category.length > 3 && (
                        <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-600 font-medium">
                          +{post.category.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {post.skills?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                      Required Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.skills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-400/50 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {post.skills.length > 4 && (
                        <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-400/50 font-medium">
                          +{post.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Posted By Section */}
                <div className="mb-5 pb-4 border-b border-slate-700">
                  <p className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                    Posted By
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-slate-950">
                        {(post.employerId?.name ||
                          post.employerId?.companyName ||
                          "U")[0].toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-100 font-semibold">
                      {post.employerId?.name ||
                        post.employerId?.companyName ||
                        "Unknown User"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="flex-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-semibold transition-all">
                    <svg
                      className="w-4 h-4 mr-2 inline-block"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </Button>
                  <Button className="flex-1 bg-red-600 hover:bg-red-700 border border-red-500 text-white font-semibold transition-all">
                    <svg
                      className="w-4 h-4 mr-2 inline-block"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;
