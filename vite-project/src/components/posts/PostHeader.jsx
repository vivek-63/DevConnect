
import { Link } from "react-router-dom";

const formatTime = (dateString) => {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const differenceInSeconds = Math.floor(
    (Date.now() - date.getTime()) / 1000
  );

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

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString();
};

const PostHeader = ({ post }) => {
  const author = post.author;
  const username = author?.username || "Dev";

  const avatarUrl =
    author?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      username
    )}&background=7c3aed&color=fff`;

  const profileUrl = `/profile/${author?.username}`;

  return (
    <div className="flex items-center gap-3 p-4 pb-2">
      <Link to={profileUrl} className="flex-shrink-0">
        <img
          src={avatarUrl}
          alt={`${username}'s avatar`}
          className="w-11 h-11 rounded-full object-cover border border-slate-200"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          to={profileUrl}
          className="font-semibold text-slate-900 text-sm hover:text-violet-600 transition"
        >
          {author?.username || "Unknown user"}
        </Link>

        <div className="flex items-center gap-1.5 flex-wrap">
          {author?.designation && (
            <span className="text-xs text-slate-500">
              {author.designation}
            </span>
          )}

          <span className="text-slate-300 text-xs">·</span>

          <span className="text-xs text-slate-400">
            {formatTime(post.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostHeader;
