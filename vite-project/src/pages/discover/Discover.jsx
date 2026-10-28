import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { discoverDevelopers } from "../../services/search";
import { followUser, unfollowUser } from "../../services/follow";
import { useAuth } from "../../hooks/useAuth";
import { FiSearch, FiUsers, FiAlertCircle } from "react-icons/fi";

const Discover = () => {
  const { user: currentUser } = useAuth();
  const [filters, setFilters] = useState({
    q: "",
    skill: "",
    college: "",
    designation: "",
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followedMap, setFollowedMap] = useState({});

  const loadDevelopers = async (nextFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const data = await discoverDevelopers(nextFilters);
      setUsers(data?.users || []);
    } catch (err) {
      setError(err.message || "Could not load developers.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevelopers();
  }, []);

  const handleChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loadDevelopers(filters);
  };

  const handleFollowToggle = async (userId) => {
    const isFollowing = !!followedMap[userId];
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setFollowedMap((prev) => ({ ...prev, [userId]: false }));
      } else {
        await followUser(userId);
        setFollowedMap((prev) => ({ ...prev, [userId]: true }));
      }
    } catch (err) {
      console.error("Follow toggle error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Discover developers</h1>
          <p className="text-sm text-slate-500 mt-1">
            Filter by username, skills, college, or designation.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <input
            name="q"
            value={filters.q}
            onChange={handleChange}
            placeholder="Username or bio"
            className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-violet-500"
          />
          <input
            name="skill"
            value={filters.skill}
            onChange={handleChange}
            placeholder="Skill (React, Node.js)"
            className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-violet-500"
          />
          <input
            name="college"
            value={filters.college}
            onChange={handleChange}
            placeholder="College"
            className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-violet-500"
          />
          <input
            name="designation"
            value={filters.designation}
            onChange={handleChange}
            placeholder="Designation"
            className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            className="sm:col-span-2 lg:col-span-4 inline-flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold"
          >
            <FiSearch size={16} /> Search developers
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
            <FiAlertCircle /> {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-40 bg-white rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <FiUsers className="mx-auto mb-3 opacity-40" size={36} />
            <p>No developers matched those filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((developer) => {
              const isSelf = currentUser?.id === developer.id;
              const isFollowing = !!followedMap[developer.id];
              return (
                <div
                  key={developer.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Link to={`/profile/${developer.username}`}>
                      <img
                        src={
                          developer.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(developer.username)}&background=7c3aed&color=fff`
                        }
                        alt={developer.username}
                        className="w-12 h-12 rounded-full object-cover border border-slate-100"
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link
                        to={`/profile/${developer.username}`}
                        className="font-bold text-slate-900 hover:text-violet-600 block truncate"
                      >
                        {developer.username}
                      </Link>
                      <p className="text-xs text-slate-500 truncate">
                        {developer.designation || "Developer"}
                      </p>
                      {developer.college && (
                        <p className="text-[11px] text-slate-400 truncate">{developer.college}</p>
                      )}
                    </div>
                  </div>
                  {developer.bio && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">{developer.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(developer.skills || []).slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {developer._count?.followers || 0} followers
                    </span>
                    {!isSelf && (
                      <button
                        onClick={() => handleFollowToggle(developer.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          isFollowing
                            ? "bg-slate-100 text-slate-700"
                            : "bg-violet-600 text-white"
                        }`}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
