import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProject } from "../../services/projects";
import { useAuth } from "../../hooks/useAuth";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { FiArrowLeft, FiEdit2, FiAlertCircle } from "react-icons/fi";

const ProjectDetails = () => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProject(id);
      setProject(data?.project || data);
    } catch (err) {
      console.error("Error loading project:", err);
      setError("Project not found or could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 animate-pulse space-y-6">
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="h-8 bg-slate-200 rounded w-1/2" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 max-w-md text-center shadow-sm border border-slate-200">
          <FiAlertCircle size={40} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800 mb-1">Project Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">{error || "Could not find this project."}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === project.ownerId || user?.id === project.owner?.id;

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-violet-600 transition"
          >
            <FiArrowLeft size={16} /> Back
          </button>

          {isOwner && (
            <Link
              to={`/projects/edit/${project.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <FiEdit2 size={13} /> Edit Project
            </Link>
          )}
        </div>

        {/* Project Card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
          {/* Banner / Image */}
          {project.image ? (
            <div className="relative h-72 sm:h-96 w-full bg-slate-900">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white/30 text-6xl font-black">
              &lt;/&gt;
            </div>
          )}

          {/* Body */}
          <div className="p-6 sm:p-10 space-y-8">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {project.title}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Published on {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl.startsWith("http") ? project.githubUrl : `https://${project.githubUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition"
                  >
                    <FaGithub size={15} /> GitHub Code
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl.startsWith("http") ? project.liveUrl : `https://${project.liveUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-sm transition"
                  >
                    <FaExternalLinkAlt size={12} /> Live Demo
                  </a>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                About the Project
              </h2>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>

            {/* Tech Stack */}
            {project.techStack?.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Technologies Used
                </h2>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-lg bg-violet-50 text-violet-700 font-medium text-xs border border-violet-100"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Owner Section */}
            {project.owner && (
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                <Link
                  to={`/profile/${project.owner.username}`}
                  className="flex items-center gap-3.5 group"
                >
                  <img
                    src={
                      project.owner.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        project.owner.username
                      )}&background=7c3aed&color=fff`
                    }
                    alt={project.owner.username}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-violet-400 transition"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-violet-600 transition">
                      {project.owner.username}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {project.owner.designation || "Project Creator"}
                    </p>
                  </div>
                </Link>

                <Link
                  to={`/profile/${project.owner.username}`}
                  className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                >
                  View Profile →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;