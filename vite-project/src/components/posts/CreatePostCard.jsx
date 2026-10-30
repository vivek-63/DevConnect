
import { useState } from "react";
import { FiImage, FiX, FiSend } from "react-icons/fi";
import { createPost } from "../../services/post";

const CreatePostCard = ({ user, onPostCreated }) => {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const postContent = content.trim();

    if (!postContent || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await createPost({
        content: postContent,
        image: imageUrl.trim() || null,
      });

      const newPost = response?.post || response;

      if (newPost?.id && onPostCreated) {
        onPostCreated(newPost);
      }

      setContent("");
      setImageUrl("");
      setShowImageInput(false);
      setExpanded(false);
    } catch (error) {
      setError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    setContent("");
    setImageUrl("");
    setShowImageInput(false);
    setExpanded(false);
    setError("");
  };

  const toggleImageInput = () => {
    setShowImageInput((previousValue) => !previousValue);
    setError("");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex gap-3">
        <img
          src={
            user?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user?.username || "Dev"
            )}&background=7c3aed&color=fff`
          }
          alt={user?.username || "User avatar"}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-slate-200"
        />

        {!expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex-1 text-left px-4 py-2.5 bg-slate-100 hover:bg-slate-200/70 text-slate-500 text-sm rounded-full transition"
          >
            What's on your mind, {user?.username || "Developer"}?
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1">
            <textarea
              autoFocus
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Share something with the developer community..."
              rows={3}
              className="w-full text-sm text-slate-800 placeholder-slate-400 resize-none outline-none"
            />

            {showImageInput && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="Paste image URL..."
                  aria-label="Image URL"
                  className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:border-violet-400"
                />

                <button
                  type="button"
                  onClick={() => {
                    setShowImageInput(false);
                    setImageUrl("");
                  }}
                  aria-label="Remove image URL"
                  className="text-slate-400 hover:text-red-500"
                >
                  <FiX size={16} />
                </button>
              </div>
            )}

            {error && (
              <p role="alert" className="text-xs text-red-500 mt-1">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={toggleImageInput}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 transition"
              >
                <FiImage size={15} />
                Add Image
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDiscard}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
                >
                  Discard
                </button>

                <button
                  type="submit"
                  disabled={!content.trim() || loading}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
                >
                  <FiSend size={13} />
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreatePostCard;
