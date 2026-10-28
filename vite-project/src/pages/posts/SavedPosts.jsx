import React, { useEffect, useState } from "react";
import PostCard from "../../components/posts/PostCard";
import { deletePost, getSavedPosts, likePost, unlikePost, unsavePost } from "../../services/post";
import { useAuth } from "../../hooks/useAuth";
import { FiBookmark, FiRefreshCw } from "react-icons/fi";

const SavedPosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSaved = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSavedPosts();
      setPosts(data?.posts || []);
    } catch (err) {
      setError("Could not load saved posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleDelete = async (id) => {
    await deletePost(id);
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const handleLike = async (id) => {
    await likePost(id);
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? {
              ...post,
              likes: [...(post.likes || []), { userId: user.id }],
              _count: { ...post._count, likes: (post._count?.likes || 0) + 1 },
            }
          : post
      )
    );
  };

  const handleUnlike = async (id) => {
    await unlikePost(id);
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? {
              ...post,
              likes: (post.likes || []).filter((like) => like.userId !== user.id),
              _count: {
                ...post._count,
                likes: Math.max(0, (post._count?.likes || 0) - 1),
              },
            }
          : post
      )
    );
  };

  const handleUnsave = async (id) => {
    await unsavePost(id);
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Saved posts</h1>
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div key={item} className="h-40 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-red-500 mb-3">{error}</p>
            <button
              onClick={loadSaved}
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm"
            >
              <FiRefreshCw /> Try again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-slate-500">
            <FiBookmark className="mx-auto mb-3 opacity-40" size={36} />
            <p>You have not saved any posts yet.</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handleDelete}
              onLike={handleLike}
              onUnlike={handleUnlike}
              onSave={handleUnsave}
              onUnsave={handleUnsave}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SavedPosts;
