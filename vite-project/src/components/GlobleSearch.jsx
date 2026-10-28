import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { globalSearch } from "../services/search";

const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({
    users: [],
    posts: [],
    projects: [],
  });

  const [loading, setLoading] =
    useState(false);

  const [showResults, setShowResults] =
    useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults({
        users: [],
        posts: [],
        projects: [],
      });

      setShowResults(false);

      return;
    }

    const timer = setTimeout(
      async () => {
        try {
          setLoading(true);

          const data =
            await globalSearch(query);

          setResults(data);

          setShowResults(true);
        } catch (error) {
          console.error(
            "Search failed:",
            error
          );
        } finally {
          setLoading(false);
        }
      },
      300
    );

    return () => clearTimeout(timer);
  }, [query]);

  const totalResults =
    results.users.length +
    results.posts.length +
    results.projects.length;

  return (
    <div className="relative w-[420px]">

      {/* Search Input */}
      <div className="relative">

        <Search
          size={19}
          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-gray-400
          "
        />

        <input
          type="text"
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          onFocus={() => {
            if (query.trim()) {
              setShowResults(true);
            }
          }}
          placeholder="Search people, posts, projects..."
          className="
            w-full
            bg-gray-100
            rounded-xl
            pl-11
            pr-4
            py-3
            text-sm
            outline-none
            focus:bg-white
            focus:ring-2
            focus:ring-violet-500
          "
        />

      </div>

      {/* Results */}
      {showResults && (
        <div
          className="
            absolute
            top-full
            left-0
            right-0
            mt-2
            bg-white
            rounded-2xl
            shadow-xl
            border
            border-gray-100
            overflow-hidden
            z-[100]
          "
        >

          {loading ? (
            <div className="p-5 text-center text-gray-500">
              Searching...
            </div>
          ) : totalResults === 0 ? (
            <div className="p-5 text-center text-gray-500">
              No results found
            </div>
          ) : (
            <>

              {/* ================= USERS ================= */}
              {results.users.length > 0 && (
                <section>

                  <div className="px-4 py-3 bg-gray-50">
                    <h3 className="text-xs font-semibold uppercase text-gray-500">
                      People
                    </h3>
                  </div>

                  {results.users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        navigate(
                          `/profile/${user.username}`
                        );

                        setShowResults(false);
                        setQuery("");
                      }}
                      className="
                        w-full
                        flex
                        items-center
                        gap-3
                        px-4
                        py-3
                        hover:bg-gray-50
                        text-left
                      "
                    >
                      <img
                        src={
                          user.avatar ||
                          "https://i.pravatar.cc/150"
                        }
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />

                      <div>
                        <p className="font-semibold text-sm">
                          {user.username}
                        </p>

                        <p className="text-xs text-gray-500 line-clamp-1">
                          {user.bio ||
                            "Developer"}
                        </p>
                      </div>
                    </button>
                  ))}

                </section>
              )}

              {/* ================= POSTS ================= */}
              {results.posts.length > 0 && (
                <section>

                  <div className="px-4 py-3 bg-gray-50">
                    <h3 className="text-xs font-semibold uppercase text-gray-500">
                      Posts
                    </h3>
                  </div>

                  {results.posts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => {
                        navigate(
                          `/post/${post.id}`
                        );

                        setShowResults(false);
                        setQuery("");
                      }}
                      className="
                        w-full
                        px-4
                        py-3
                        hover:bg-gray-50
                        text-left
                      "
                    >
                      <div className="flex gap-3">

                        <img
                          src={
                            post.author?.avatar ||
                            "https://i.pravatar.cc/150"
                          }
                          alt=""
                          className="w-9 h-9 rounded-full"
                        />

                        <div className="min-w-0">

                          <p className="font-semibold text-sm">
                            {post.author?.username}
                          </p>

                          <p className="text-sm text-gray-600 line-clamp-2">
                            {post.content}
                          </p>

                        </div>

                      </div>
                    </button>
                  ))}

                </section>
              )}

              {/* ================= PROJECTS ================= */}
              {results.projects.length > 0 && (
                <section>

                  <div className="px-4 py-3 bg-gray-50">
                    <h3 className="text-xs font-semibold uppercase text-gray-500">
                      Projects
                    </h3>
                  </div>

                  {results.projects.map(
                    (project) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          navigate(
                            `/projects/${project.id}`
                          );

                          setShowResults(false);
                          setQuery("");
                        }}
                        className="
                          w-full
                          px-4
                          py-3
                          hover:bg-gray-50
                          text-left
                        "
                      >

                        <p className="font-semibold text-sm">
                          {project.title}
                        </p>

                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {project.description}
                        </p>

                        <div className="flex gap-1 mt-2 flex-wrap">
                          {project.techStack
                            ?.slice(0, 3)
                            .map((tech) => (
                              <span
                                key={tech}
                                className="
                                  text-[11px]
                                  px-2
                                  py-1
                                  bg-violet-100
                                  text-violet-700
                                  rounded-full
                                "
                              >
                                {tech}
                              </span>
                            ))}
                        </div>

                      </button>
                    )
                  )}

                </section>
              )}

              {/* View all */}
              <button
                onClick={() => {
                  navigate(
                    `/search?q=${encodeURIComponent(
                      query
                    )}`
                  );

                  setShowResults(false);
                }}
                className="
                  w-full
                  py-3
                  text-sm
                  font-semibold
                  text-violet-600
                  hover:bg-violet-50
                  border-t
                "
              >
                View all results
              </button>

            </>
          )}

        </div>
      )}

    </div>
  );
};

export default GlobalSearch;