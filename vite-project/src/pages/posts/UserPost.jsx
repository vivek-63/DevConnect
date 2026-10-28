import React, { useEffect, useState } from "react";
import { getuserPosts, deletePost, likePost, unlikePost } from "../../services/post";
import { useAuth } from "../../hooks/useAuth";
import PostCard from "../../components/posts/PostCard";
import CreatePostCard from "../../components/posts/CreatePostCard";
import { FiRefreshCw } from "react-icons/fi";

const UserPost = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const fetchUserPosts = async () => {
    setLoading(true);
    try {
      const data = await getuserPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading user posts:", err);
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
      console.error("Error deleting post:", err);
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
            likes: [...(post.likes || []), { userId: user?.id }],
            _count: { ...post._count, likes: (post._count?.likes || 0) + 1 },
          };
        })
      );
    } catch (err) {
      console.error("Like error:", err);
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
            likes: [],
            _count: {
              ...post._count,
              likes: Math.max(0, (post._count?.likes || 0) - 1),
            },
          };
        })
      );
    } catch (err) {
      console.error("Unlike error:", err);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-slate-50 rounded-xl p-5 animate-pulse border border-slate-100">
            <div className="flex gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-1/4" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Create post inline if user is logged in */}
      {user && <CreatePostCard user={user} onPostCreated={handlePostCreated} />}

      {/* Empty State */}
      {posts.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="font-semibold text-slate-800 text-base mb-1">
            No posts published yet
          </h3>
          <p className="text-xs text-slate-400">
            Share your development thoughts, architecture discoveries, or latest project updates!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handleDelete}
              onLike={handleLike}
              onUnlike={handleUnlike}
              isPublic={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPost;