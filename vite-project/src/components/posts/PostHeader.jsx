import React from "react";
import { Link } from "react-router-dom";

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
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const PostHeader = ({ post }) => {
  return (
    <div className="flex items-center gap-3 p-4 pb-2">
      <Link to={`/profile/${post.author?.username}`} className="flex-shrink-0">
        <img
          src={
            post.author?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.username || "Dev")}&background=7c3aed&color=fff`
          }
          alt={post.author?.username}
          className="w-11 h-11 rounded-full object-cover border border-slate-200"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          to={`/profile/${post.author?.username}`}
          className="font-semibold text-slate-900 text-sm hover:text-violet-600 transition"
        >
          {post.author?.username}
        </Link>
        <div className="flex items-center gap-1.5 flex-wrap">
          {post.author?.designation && (
            <span className="text-xs text-slate-500">{post.author.designation}</span>
          )}
          <span className="text-slate-300 text-xs">·</span>
          <span className="text-xs text-slate-400">{formatTime(post.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default PostHeader;