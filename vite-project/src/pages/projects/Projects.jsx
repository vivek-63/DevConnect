import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { deleteProject, getProjects, getAllProjects } from "../../services/projects";
import ProjectCard from "../../components/projects/ProjectCard";
import { useAuth } from "../../hooks/useAuth";
import { FiPlus, FiFolder } from "react-icons/fi";

const Projects = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isStandalonePage = location.pathname === "/projects";

  const [activeTab, setActiveTab] = useState(isStandalonePage ? "explore" : "my");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentProjects();
  }, [activeTab]);

  const fetchCurrentProjects = async () => {
    setLoading(true);
    try {
      if (activeTab === "explore") {
        const data = await getAllProjects();
        setProjects(data.projects || []);
      } else {
        const data = await getProjects();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error(err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const content = (
    <div>
      {/* Header for standalone /projects page */}
      {isStandalonePage && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Developer Projects
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Explore open-source apps, tools, and creations built by the community.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <Link
                to="/projects/new"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <FiPlus size={15} /> Add Project
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Tabs for standalone page */}
      {isStandalonePage && (
        <div className="flex gap-2 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab("explore")}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition ${
              activeTab === "explore"
                ? "border-violet-600 text-violet-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Explore All
          </button>
          {user && (
            <button
              onClick={() => setActiveTab("my")}
              className={`pb-3 px-3 text-sm font-semibold border-b-2 transition ${
                activeTab === "my"
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              My Projects
            </button>
          )}
        </div>
      )}

      {/* Projects Grid or States */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse"
            >
              <div className="h-40 bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <FiFolder size={36} className="mx-auto mb-2 opacity-40 text-violet-600" />
          <p className="text-base font-semibold text-slate-700">No projects found</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            {activeTab === "my"
              ? "You haven't showcased any projects yet."
              : "No community projects have been added yet."}
          </p>
          {user && (
            <Link
              to="/projects/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition"
            >
              <FiPlus size={14} /> Add Your First Project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
              isPublic={activeTab === "explore"}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (isStandalonePage) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">{content}</div>
      </div>
    );
  }

  return content;
};

export default Projects;