
import { useState } from "react";
import { FaHeart, FaRegHeart, FaBookmark } from "react-icons/fa";
import {
  FiMessageCircle,
  FiEdit2,
  FiTrash2,
  FiSend,
  FiBookmark,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

import PostHeader from "./PostHeader";
import {
  createComment,
  deleteComment,
  getComments,
} from "../../services/comment";
import { useAuth } from "../../hooks/useAuth";

const PostCard = ({
  post,
  onDelete,
  isPublic,
  onLike,
  onUnlike,
  onSave,
  onUnsave,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isLiked = post.likes?.length > 0;
  const isOwner =
    Number(user?.id) === Number(post.author?.id ?? post.authorId);

  // Format dates as relative time.
  const formatTime = (dateString) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const differenceInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (differenceInSeconds < 0) {
      return date.toLocaleDateString();
    }

    if (differenceInSeconds < 60) {
      return "just now";
    }

    const minutes = Math.floor(differenceInSeconds / 60);

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h ago`;
    }

    return date.toLocaleDateString();
  };

  // Fetch comments when the comment section is opened for the first time.
  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);

      try {
        const response = await getComments(post.id);
        const fetchedComments = Array.isArray(response)
          ? response
          : response?.comments || [];

        setComments(fetchedComments);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setLoadingComments(false);
      }
    }

    setShowComments((previousValue) => !previousValue);
  };

  // Create a comment.
  const handleSubmitComment = async () => {
    const content = commentText.trim();

    if (!content || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await createComment(post.id, { content });
      const newComment = response?.comment || response;

      if (newComment?.id) {
        setComments((previousComments) => [
          newComment,
          ...previousComments,
        ]);

        setCommentText("");
      }
    } catch (error) {
      console.error("Failed to create comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit a comment when Enter is pressed without Shift.
  const handleCommentKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmitComment();
    }
  };

  // Delete a comment.
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);

      setComments((previousComments) =>
        previousComments.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  // Generate a fallback avatar when a user has no profile image.
  const getAvatarUrl = (avatar, username) => {
    return (
      avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        username || "U"
      )}&background=7c3aed&color=fff`
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <PostHeader post={post} />

      {/* Post content */}
      <div className="px-4 pb-3">
        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Post image */}
      {post.image && (
        <div className="px-4 pb-3">
          <img
            src={post.image}
            alt="Post image"
            className="w-full rounded-lg object-cover max-h-80 border border-slate-100"
          />
        </div>
      )}

      {/* Post actions */}
      <div className="px-4 py-2.5 border-t border-slate-100 flex items-center gap-6">
        <button
          type="button"
          onClick={() =>
            isLiked ? onUnlike?.(post.id) : onLike?.(post.id)
          }
          aria-label={isLiked ? "Unlike post" : "Like post"}
          className="flex items-center gap-1.5 group transition"
        >
          {isLiked ? (
            <FaHeart className="text-red-500 text-lg group-hover:scale-110 transition-transform" />
          ) : (
            <FaRegHeart className="text-slate-400 text-lg group-hover:text-red-400 group-hover:scale-110 transition" />
          )}

          <span
            className={`text-xs font-medium ${isLiked ? "text-red-500" : "text-slate-500"
              }`}
          >
            {post._count?.likes || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            post.isSaved ? onUnsave?.(post.id) : onSave?.(post.id)
          }
          title={post.isSaved ? "Remove bookmark" : "Save post"}
          aria-label={post.isSaved ? "Remove bookmark" : "Save post"}
          className="flex items-center gap-1.5 group transition"
        >
          {post.isSaved ? (
            <FaBookmark className="text-violet-600 text-base" />
          ) : (
            <FiBookmark className="text-slate-400 text-lg group-hover:text-violet-500 transition" />
          )}
        </button>

        <button
          type="button"
          onClick={handleToggleComments}
          aria-label="Toggle comments"
          className="flex items-center gap-1.5 group transition"
        >
          <FiMessageCircle className="text-slate-400 text-lg group-hover:text-violet-500 transition" />

          <span className="text-xs font-medium text-slate-500">
            {comments.length || post._count?.comments || 0}
          </span>
        </button>

        {/* Edit and delete actions for the post owner */}
        {isOwner && (
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/posts/edit/${post.id}`)}
              aria-label="Edit post"
              title="Edit post"
              className="text-slate-400 hover:text-violet-600 transition"
            >
              <FiEdit2 size={15} />
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm("Delete this post?")) {
                  onDelete?.(post.id);
                }
              }}
              aria-label="Delete post"
              title="Delete post"
              className="text-slate-400 hover:text-red-500 transition"
            >
              <FiTrash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3">
          {/* Add a comment */}
          <div className="flex gap-2.5 mb-4">
            <img
              src={getAvatarUrl(user?.avatar, user?.username)}
              alt=""
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />

            <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 pr-2">
              <input
                type="text"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                onKeyDown={handleCommentKeyDown}
                placeholder="Add a comment..."
                aria-label="Write a comment"
                className="flex-1 text-sm py-2 outline-none bg-transparent text-slate-700 placeholder-slate-400"
              />

              <button
                type="button"
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || submitting}
                aria-label="Send comment"
                className="p-1.5 text-violet-600 hover:text-violet-700 disabled:opacity-40 transition flex-shrink-0"
              >
                <FiSend size={15} />
              </button>
            </div>
          </div>

          {/* Comments list */}
          {loadingComments ? (
            <div className="text-sm text-slate-400 py-3 text-center">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-slate-400 py-2 text-center">
              No comments yet. Be the first!
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => {
                if (!comment?.id) {
                  return null;
                }

                const author = comment.author;
                const profileUrl = `/profile/${author?.username}`;

                return (
                  <div key={comment.id} className="flex gap-2.5">
                    <Link to={profileUrl} className="flex-shrink-0">
                      <img
                        src={getAvatarUrl(author?.avatar, author?.username)}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </Link>

                    <div className="flex-1 bg-white rounded-2xl px-3 py-2 border border-slate-100">
                      <div className="flex items-center justify-between mb-0.5">
                        <Link
                          to={profileUrl}
                          className="text-xs font-semibold text-slate-800 hover:text-violet-600 transition"
                        >
                          {author?.username}
                        </Link>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">
                            {formatTime(comment.createdAt)}
                          </span>

                          {Number(comment.authorId) === Number(user?.id) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(comment.id)}
                              aria-label="Delete comment"
                              title="Delete comment"
                              className="text-slate-300 hover:text-red-500 transition"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {comment.content}
                      </p>
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
