import React, { useEffect, useState } from "react";
import CreatePostCard from "../../components/posts/CreatePostCard";
import PostCard from "../../components/posts/PostCard";
import { deletePost, getFeed, likePost, unlikePost, savePost, unsavePost } from "../../services/post";
import { useAuth } from "../../hooks/useAuth";
import { FiRefreshCw } from "react-icons/fi";

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFeed();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load feed. Please try again.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((post) => post.id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const handleLike = async (id) => {
    try {
      await likePost(id);
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== id) return post;
          return {
            ...post,
            likes: [...(post.likes || []), { userId: user.id }],
            _count: { ...post._count, likes: (post._count?.likes || 0) + 1 },
          };
        })
      );
    } catch (err) {
      console.log("Like error:", err);
    }
  };

  const handleUnlike = async (id) => {
    try {
      await unlikePost(id);
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== id) return post;
          return {
            ...post,
            likes: (post.likes || []).filter((like) => like.userId !== user.id),
            _count: {
              ...post._count,
              likes: Math.max(0, (post._count?.likes || 0) - 1),
            },
          };
        })
      );
    } catch (err) {
      console.log("Unlike error:", err);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleSave = async (id) => {
    await savePost(id);
    setPosts((prev) => prev.map((post) => (post.id === id ? { ...post, isSaved: true } : post)));
  };

  const handleUnsave = async (id) => {
    await unsavePost(id);
    setPosts((prev) => prev.map((post) => (post.id === id ? { ...post, isSaved: false } : post)));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
            <div className="flex gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-200" />
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
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchFeed}
          className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition"
        >
          <FiRefreshCw size={15} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create Post */}
      <CreatePostCard user={user} onPostCreated={handlePostCreated} />

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-5xl mb-4">👨‍💻</div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No posts yet</h3>
          <p className="text-slate-500 text-sm">
            Be the first to share something with the developer community!
          </p>
        </div>
      )}

      {/* Posts */}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onDelete={handleDelete}
          isPublic={true}
          onLike={handleLike}
          onUnlike={handleUnlike}
          onSave={handleSave}
          onUnsave={handleUnsave}
        />
      ))}
    </div>
  );
};

export default Feed;