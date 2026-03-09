const ConfirmDeleteModal = ({ handleDeleteAllPosts, closeModal }) => {
  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black/40 pt-10">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[320px]">
        <h2 className="text-lg font-semibold mb-2">Delete All Posts</h2>

        <p className="text-sm text-gray-600 mb-5">
          This action will permanently remove all posts. This cannot be undone.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleDeleteAllPosts}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
