import React, { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FiMessageCircle, FiEdit2, FiTrash2, FiSend, FiBookmark } from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import PostHeader from "./PostHeader";
import { createComment, deleteComment, getComments } from "../../services/comment";
import { useAuth } from "../../hooks/useAuth";

const PostCard = ({ post, onDelete, isPublic, onLike, onUnlike, onSave, onUnsave }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isLiked = post.likes?.length > 0;

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return date.toLocaleDateString();
  };

  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const data = await getComments(post.id);
        setComments(Array.isArray(data) ? data : data?.comments || []);
      } catch (err) {
        console.log("Fetch comments error:", err);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments((prev) => !prev);
  };

  const handleSubmitComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const res = await createComment(post.id, { content: trimmed });
      const newComment = res?.comment || res;
      if (newComment?.id) {
        setComments((prev) => [newComment, ...prev]);
        setCommentText("");
      }
    } catch (err) {
      console.log("Create comment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.log("Delete comment error:", err);
    }
  };

  const isOwner = user?.id === post.author?.id || user?.id === post.authorId;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <PostHeader post={post} />

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="px-4 pb-3">
          <img
            src={post.image}
            alt="Post image"
            className="w-full rounded-lg object-cover max-h-80 border border-slate-100"
          />
        </div>
      )}

      {/* Actions bar */}
      <div className="px-4 py-2.5 border-t border-slate-100 flex items-center gap-6">
        {/* Like */}
        <button
          onClick={() => (isLiked ? onUnlike?.(post.id) : onLike?.(post.id))}
          className="flex items-center gap-1.5 group transition"
        >
          {isLiked ? (
            <FaHeart className="text-red-500 text-lg group-hover:scale-110 transition-transform" />
          ) : (
            <FaRegHeart className="text-slate-400 text-lg group-hover:text-red-400 group-hover:scale-110 transition" />
          )}
          <span className={`text-xs font-medium ${isLiked ? "text-red-500" : "text-slate-500"}`}>
            {post._count?.likes || 0}
          </span>
        </button>

        <button
          onClick={() => (post.isSaved ? onUnsave?.(post.id) : onSave?.(post.id))}
          className="flex items-center gap-1.5 group transition"
          title={post.isSaved ? "Remove bookmark" : "Save post"}
        >
          {post.isSaved ? (
            <FaBookmark className="text-violet-600 text-base" />
          ) : (
            <FiBookmark className="text-slate-400 text-lg group-hover:text-violet-500 transition" />
          )}
        </button>

        {/* Comment */}
        <button
          onClick={handleToggleComments}
          className="flex items-center gap-1.5 group transition"
        >
          <FiMessageCircle className="text-slate-400 text-lg group-hover:text-violet-500 transition" />
          <span className="text-xs font-medium text-slate-500">
            {comments.length || post._count?.comments || 0}
          </span>
        </button>

        {/* Owner actions */}
        {isOwner && (
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => navigate(`/posts/edit/${post.id}`)}
              className="text-slate-400 hover:text-violet-600 transition"
              title="Edit post"
            >
              <FiEdit2 size={15} />
            </button>
            <button
              onClick={() => {
                if (window.confirm("Delete this post?")) {
                  onDelete?.(post.id);
                }
              }}
              className="text-slate-400 hover:text-red-500 transition"
              title="Delete post"
            >
              <FiTrash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3">
          {/* Comment input */}
          <div className="flex gap-2.5 mb-4">
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}&background=7c3aed&color=fff`
              }
              alt=""
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 pr-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment..."
                className="flex-1 text-sm py-2 outline-none bg-transparent text-slate-700 placeholder-slate-400"
              />
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || submitting}
                className="p-1.5 text-violet-600 hover:text-violet-700 disabled:opacity-40 transition flex-shrink-0"
              >
                <FiSend size={15} />
              </button>
            </div>
          </div>

          {/* Comments list */}
          {loadingComments ? (
            <div className="text-sm text-slate-400 py-3 text-center">Loading comments...</div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-slate-400 py-2 text-center">
              No comments yet. Be the first!
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => {
                if (!comment?.id) return null;
                return (
                  <div key={comment.id} className="flex gap-2.5">
                    <Link to={`/profile/${comment.author?.username}`} className="flex-shrink-0">
                      <img
                        src={
                          comment.author?.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.username || "U")}&background=7c3aed&color=fff`
                        }
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </Link>
                    <div className="flex-1 bg-white rounded-2xl px-3 py-2 border border-slate-100">
                      <div className="flex items-center justify-between mb-0.5">
                        <Link
                          to={`/profile/${comment.author?.username}`}
                          className="text-xs font-semibold text-slate-800 hover:text-violet-600 transition"
                        >
                          {comment.author?.username}
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">
                            {formatTime(comment.createdAt)}
                          </span>
                          {comment.authorId === user?.id && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-slate-300 hover:text-red-500 transition"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
