import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  showErrToast,
  showLoadingToast,
  showSuccessToast,
} from "../../utils/toast";
import { IoCreateOutline } from "react-icons/io5";
import { MdEdit, MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const MyPosts = () => {
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletePostId, setDeletePostId] = useState(null);
  const navigate = useNavigate();

  let toastId;
  useEffect(() => {
    async function fetchData() {
      toastId = showLoadingToast("Loading posts...");
      try {
        const res = await api.get("/post/");
        showSuccessToast("Posts loaded", toastId);
        setResult(res.data.posts || []);
      } catch (error) {
        showErrToast("Failed to load posts", toastId);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleEditPost = (postId) => {
    navigate("/posts/edit", {
      state: postId,
    });
  };

  const handleDeletePost = (postId) => {
    setDeletePostId(postId);
  };

  const handleCreateNewPost = () => {
    navigate("/post/create");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent mb-1">
                My Posts
              </h1>
              <p className="text-slate-600 text-sm">
                Manage and track all your job postings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-xl border border-indigo-200">
                <span className="text-indigo-600 text-sm font-medium">
                  Total Posts:{" "}
                </span>
                <span className="text-indigo-700 font-bold">
                  {result.length}
                </span>
              </div>
              <button
                onClick={handleCreateNewPost}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-indigo-600 
                  to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 
                  transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <IoCreateOutline className="w-5 h-5" />
                Create Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletePostId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg z-9999 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 p-8 animate-in fade-in zoom-in duration-200">
            {/* Icon and Title */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-linear-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <MdDelete className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Delete Post?
              </h3>
            </div>

            {/* Warning Message */}
            <div className="text-center mb-8">
              <p className="text-gray-700 text-lg leading-relaxed">
                This action{" "}
                <span className="font-semibold text-red-600">
                  cannot be undone
                </span>
                . Are you sure you want to delete this post permanently?
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setDeletePostId(null)}
                className="flex-1 h-12 px-6 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-2xl transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const toastId = showLoadingToast("Deleting post...");
                  try {
                    const res = await api.delete(`/post/${deletePostId}`);
                    if (res.status === 200) {
                      showSuccessToast("Post deleted successfully!", toastId);
                      setResult(
                        result.filter((post) => post._id !== deletePostId),
                      );
                    }
                  } catch (err) {
                    console.log(err);
                    showErrToast("Failed to delete post", toastId);
                  } finally {
                    setDeletePostId(null);
                  }
                }}
                className="flex-1 h-12 px-6 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-2xl transition-all duration-200 hover:shadow-2xl hover:-translate-y-0.5 shadow-lg"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-pulse text-slate-600 text-lg font-medium">
              Loading your posts...
            </div>
          </div>
        ) : result.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center max-w-md">
              <div className="w-20 h-20 bg-linear-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-indigo-200">
                <svg
                  className="w-10 h-10 text-indigo-600"
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
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                No posts yet
              </h3>
              <p className="text-slate-600 mb-6 text-base">
                You haven't created any job posts. Start by creating your first
                post to find the perfect candidate.
              </p>
              <button
                onClick={handleCreateNewPost}
                className="px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white 
                  font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 
                  transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Create Your First Post
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {result.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 
                  hover:shadow-lg hover:border-indigo-200 transition-all duration-300 
                  hover:-translate-y-1"
              >
                {/* Header with Budget and Status */}
                <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-200">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-indigo-600">
                        ₹{post.budgetAmount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wide">
                      Budget Amount
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      post.status === "Open"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : post.status === "Closed"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                    }`}
                  >
                    {post.status}
                  </span>
                </div>

                {/* Description */}
                <div className="mb-5">
                  <p className="text-sm text-slate-700 leading-relaxed line-clamp-3 min-h-15">
                    {post.description || "No description provided"}
                  </p>
                </div>

                {/* Category Tags */}
                {post.category?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                      Categories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.category.slice(0, 3).map((cat, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                      {post.category.length > 3 && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
                          +{post.category.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {post.skills?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                      Required Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.skills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-linear-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-200 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {post.skills.length > 4 && (
                        <span className="text-xs bg-linear-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-200 font-medium">
                          +{post.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Posted By Section */}
                <div className="mb-5 pb-4 border-b border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                    Posted By
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-linear-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-sm font-bold text-white">
                        {(post.employerId?.avatar || "U")[0].toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 font-semibold capitalize">
                      {post.employerId?.fullName || "Unknown User"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditPost(post._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-200 hover:shadow-md"
                  >
                    <MdEdit className="w-4 h-4" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border border-red-200 text-red-700 font-semibold rounded-xl transition-all duration-200 hover:shadow-md"
                  >
                    <MdDelete className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add this at the end of Main Content section, before closing </div> */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => navigate("/home")}
          className="w-14 h-14 bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center hover:scale-105"
          title="Back to Home"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-sm text-slate-500">
            © 2026 JobPortal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MyPosts;
