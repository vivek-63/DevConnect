import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { globalSearch } from "../services/search";
import { followUser, unfollowUser } from "../services/follow";
import { useAuth } from "../hooks/useAuth";
import {
  FiSearch,
  FiUser,
  FiFolder,
  FiFileText,
  FiExternalLink,
  FiUsers,
} from "react-icons/fi";

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser } = useAuth();

  const query = searchParams.get("q") || "";
  const activeType = searchParams.get("type") || "all";

  const [results, setResults] = useState({
    users: [],
    posts: [],
    projects: [],
  });

  const [loading, setLoading] = useState(false);
  const [followedMap, setFollowedMap] = useState({});

  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], posts: [], projects: [] });
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await globalSearch(query);
        setResults({
          users: data?.users || [],
          posts: data?.posts || [],
          projects: data?.projects || [],
        });
      } catch (error) {
        console.error("Search results error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const changeType = (type) => {
    setSearchParams({ q: query, type });
  };

  const handleFollowToggle = async (userId) => {
    const isCurrentlyFollowed = !!followedMap[userId];
    try {
      if (isCurrentlyFollowed) {
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

  const renderUsers = () => {
    if (!results.users.length) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          No developers found matching "{query}".
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.users.map((u) => {
          const isFollowing = followedMap[u.id];
          const isSelf = currentUser?.id === u.id;

          return (
            <div
              key={u.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  <Link to={`/profile/${u.username}`} className="flex-shrink-0">
                    <img
                      src={
                        u.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          u.username
                        )}&background=7c3aed&color=fff`
                      }
                      alt={u.username}
                      className="w-13 h-13 rounded-full object-cover border border-slate-100"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/profile/${u.username}`}
                      className="font-bold text-slate-900 hover:text-violet-600 transition truncate block text-base"
                    >
                      {u.username}
                    </Link>
                    <p className="text-xs text-slate-500 truncate">
                      {u.designation || "Developer"}
                    </p>
                    {u.college && (
                      <p className="text-[11px] text-slate-400 truncate">
                        🎓 {u.college}
                      </p>
                    )}
                  </div>
                </div>

                {u.bio && (
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {u.bio}
                  </p>
                )}

                {/* Skills tags */}
                {u.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {u.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 text-[11px] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                    {u.skills.length > 4 && (
                      <span className="text-[11px] text-slate-400 self-center">
                        +{u.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                <span className="text-xs text-slate-400">
                  {u._count?.followers || 0} followers
                </span>

                {!isSelf ? (
                  <button
                    onClick={() => handleFollowToggle(u.id)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isFollowing
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                ) : (
                  <Link
                    to="/profile"
                    className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                  >
                    View Your Profile
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPosts = () => {
    if (!results.posts.length) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          No posts found matching "{query}".
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {results.posts.map((post) => (
          <div
            key={post.id}
            onClick={() => navigate(`/posts/${post.id}`)}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-violet-300 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <img
                src={
                  post.author?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    post.author?.username || "Dev"
                  )}&background=7c3aed&color=fff`
                }
                alt=""
                className="w-9 h-9 rounded-full object-cover border border-slate-100"
              />
              <div>
                <p className="font-semibold text-sm text-slate-900">
                  {post.author?.username}
                </p>
                <p className="text-[11px] text-slate-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
              <span>View discussion →</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderProjects = () => {
    if (!results.projects.length) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          No projects found matching "{query}".
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.projects.map((project) => (
          <div
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}`)}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-violet-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-slate-900 text-base">
                  {project.title}
                </h3>
                <FiExternalLink size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                {project.description}
              </p>

              {project.techStack?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-0.5 text-[11px] rounded-md bg-violet-50 text-violet-700 font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs text-slate-400">
              <span>By {project.owner?.username || "Developer"}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Search Results
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {query ? (
              <>
                Showing results for <span className="font-semibold text-slate-800">"{query}"</span>
              </>
            ) : (
              "Enter a term to search for developers, posts, or projects."
            )}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
          {[
            ["all", "All Results"],
            ["people", `People (${results.users.length})`],
            ["posts", `Posts (${results.posts.length})`],
            ["projects", `Projects (${results.projects.length})`],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => changeType(val)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
                activeType === val
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div>
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Searching DevConnect...</p>
            </div>
          ) : !query.trim() ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <FiSearch size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium text-slate-600">Start your search</p>
              <p className="text-xs mt-1 text-slate-400">
                Search by developer username, skills, role, college, posts, or projects
              </p>
            </div>
          ) : (
            <>
              {activeType === "all" && (
                <div className="space-y-8">
                  {results.users.length > 0 && (
                    <section>
                      <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <FiUsers className="text-violet-600" /> Developers
                      </h2>
                      {renderUsers()}
                    </section>
                  )}

                  {results.posts.length > 0 && (
                    <section>
                      <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <FiFileText className="text-violet-600" /> Posts
                      </h2>
                      {renderPosts()}
                    </section>
                  )}

                  {results.projects.length > 0 && (
                    <section>
                      <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <FiFolder className="text-violet-600" /> Projects
                      </h2>
                      {renderProjects()}
                    </section>
                  )}

                  {!results.users.length &&
                    !results.posts.length &&
                    !results.projects.length && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                        No results found for "{query}". Try searching a different keyword or skill.
                      </div>
                    )}
                </div>
              )}

              {activeType === "people" && renderUsers()}
              {activeType === "posts" && renderPosts()}
              {activeType === "projects" && renderProjects()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;