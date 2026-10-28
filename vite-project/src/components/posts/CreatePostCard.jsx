import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiImage, FiX, FiSend } from "react-icons/fi";
import { createPost } from "../../services/post";

const CreatePostCard = ({ user, onPostCreated }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError("");
    try {
      const data = await createPost({ content: content.trim(), image: imageUrl.trim() || null });
      const newPost = data?.post || data;
      if (newPost?.id && onPostCreated) {
        onPostCreated(newPost);
      }
      setContent("");
      setImageUrl("");
      setShowImageInput(false);
      setExpanded(false);
    } catch (err) {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex gap-3">
        <img
          src={
            user?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "Dev")}&background=7c3aed&color=fff`
          }
          alt={user?.username}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-slate-200"
        />

        {!expanded ? (
          <button
            onClick={() => setExpanded(true)}
            className="flex-1 text-left px-4 py-2.5 bg-slate-100 hover:bg-slate-200/70 text-slate-500 text-sm rounded-full transition"
          >
            What's on your mind, {user?.username}?
          </button>
        ) : (
          <div className="flex-1">
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share something with the developer community..."
              rows={3}
              className="w-full text-sm text-slate-800 placeholder-slate-400 resize-none outline-none"
            />

            {showImageInput && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL..."
                  className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:border-violet-400"
                />
                <button
                  onClick={() => { setShowImageInput(false); setImageUrl(""); }}
                  className="text-slate-400 hover:text-red-500"
                >
                  <FiX size={16} />
                </button>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowImageInput(!showImageInput)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 transition"
              >
                <FiImage size={15} />
                Add Image
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleDiscard}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
                >
                  Discard
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || loading}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
                >
                  <FiSend size={13} />
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePostCard;