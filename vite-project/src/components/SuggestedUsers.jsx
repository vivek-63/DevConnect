import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSuggestedUsers } from "../services/auth";
import { followUser, unfollowUser } from "../services/follow";
import { useAuth } from "../hooks/useAuth";

const SuggestedUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // Track which users we've followed locally
  const [followed, setFollowed] = useState({});

  useEffect(() => {
    fetchSuggested();
  }, []);

  const fetchSuggested = async () => {
    try {
      const data = await getSuggestedUsers();
      setUsers(data.users || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetId) => {
    try {
      await followUser(targetId);
      setFollowed((prev) => ({ ...prev, [targetId]: true }));
    } catch (err) {
      console.log(err);
    }
  };

  const handleUnfollow = async (targetId) => {
    try {
      await unfollowUser(targetId);
      setFollowed((prev) => ({ ...prev, [targetId]: false }));
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-4 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 mb-3 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-slate-200 rounded w-2/3" />
              <div className="h-2 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
        Developers to Follow
      </h3>

      <div className="space-y-3">
        {users.map((u) => {
          const isFollowing = followed[u.id];
          return (
            <div key={u.id} className="flex items-center gap-3">
              <Link to={`/profile/${u.username}`} className="flex-shrink-0">
                <img
                  src={
                    u.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=7c3aed&color=fff`
                  }
                  alt={u.username}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/profile/${u.username}`}
                  className="text-sm font-semibold text-slate-800 hover:text-violet-600 transition block truncate"
                >
                  {u.username}
                </Link>
                <p className="text-[11px] text-slate-400 truncate">
                  {u.designation || "Developer"}
                </p>
              </div>

              <button
                onClick={() =>
                  isFollowing ? handleUnfollow(u.id) : handleFollow(u.id)
                }
                className={`text-xs font-semibold px-2.5 py-1 rounded-full transition flex-shrink-0 ${
                  isFollowing
                    ? "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600"
                    : "bg-violet-50 text-violet-700 hover:bg-violet-100"
                }`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            </div>
          );
        })}
      </div>

      <Link
        to="/search"
        className="block text-center text-xs font-semibold text-violet-600 hover:text-violet-700 mt-4 pt-3 border-t border-slate-100"
      >
        Find more developers →
      </Link>
    </div>
  );
};

export default SuggestedUsers;
