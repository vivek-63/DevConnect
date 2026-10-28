import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPost, deletePost, likePost, unlikePost } from "../../services/post";
import PostCard from "../../components/posts/PostCard";
import { useAuth } from "../../hooks/useAuth";
import { FiArrowLeft, FiAlertCircle } from "react-icons/fi";

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSinglePost();
  }, [id]);

  const fetchSinglePost = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPost(id);
      setPost(data);
    } catch (err) {
      console.error("Error loading post:", err);
      setError("Post not found or could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId);
      navigate("/");
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleLike = async (postId) => {
    try {
      await likePost(postId);
      setPost((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          likes: [...(prev.likes || []), { userId: user?.id }],
          _count: { ...prev._count, likes: (prev._count?.likes || 0) + 1 },
        };
      });
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleUnlike = async (postId) => {
    try {
      await unlikePost(postId);
      setPost((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          likes: [],
          _count: {
            ...prev._count,
            likes: Math.max(0, (prev._count?.likes || 0) - 1),
          },
        };
      });
    } catch (err) {
      console.error("Error unliking post:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-violet-600 transition"
        >
          <FiArrowLeft size={16} /> Back
        </button>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-pulse">
            <div className="flex gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-1/4" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
            <FiAlertCircle size={36} className="text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-800 mb-1">{error}</h2>
            <p className="text-sm text-slate-500 mb-4">
              This post may have been deleted or the link is invalid.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition"
            >
              Back to Feed
            </Link>
          </div>
        ) : (
          post && (
            <PostCard
              post={post}
              onDelete={handleDelete}
              onLike={handleLike}
              onUnlike={handleUnlike}
              isPublic={true}
            />
          )
        )}
      </div>
    </div>
  );
};

export default PostDetails;
