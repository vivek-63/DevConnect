import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const ProjectCard = ({ project, onDelete, isPublic }) => {
  const navigate = useNavigate();

  if (!project) return null;

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-violet-300 transition group cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Cover Image or Gradient fallback */}
        <div className="h-44 overflow-hidden bg-slate-100 relative">
          {project.image ? (
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 flex items-center justify-center text-white/40 text-4xl font-black">
              &lt;/&gt;
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-600 transition mb-1.5 truncate">
            {project.title}
          </h3>

          <p className="text-slate-600 text-xs line-clamp-2 mb-4 leading-relaxed">
            {project.description}
          </p>

          {/* Tech Stack */}
          {project.techStack?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.techStack.slice(0, 4).map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-md text-[11px] font-medium"
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 4 && (
                <span className="text-[11px] text-slate-400 self-center">
                  +{project.techStack.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 pb-4 pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
        <div className="flex items-center gap-3">
          {project.githubUrl && (
            <a
              href={project.githubUrl.startsWith("http") ? project.githubUrl : `https://${project.githubUrl}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 hover:text-black flex items-center gap-1 transition"
              onClick={(e) => e.stopPropagation()}
            >
              <FaGithub size={13} /> Code
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl.startsWith("http") ? project.liveUrl : `https://${project.liveUrl}`}
              target="_blank"
              rel="noreferrer"
              className="text-violet-600 hover:text-violet-800 flex items-center gap-1 font-semibold transition"
              onClick={(e) => e.stopPropagation()}
            >
              <FaExternalLinkAlt size={10} /> Live
            </a>
          )}
        </div>

        {!isPublic && (
          <div className="flex items-center gap-2">
            <button
              className="p-1.5 text-slate-400 hover:text-violet-600 transition"
              title="Edit project"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/edit/${project.id}`);
              }}
            >
              <FiEdit2 size={13} />
            </button>
            <button
              className="p-1.5 text-slate-400 hover:text-red-500 transition"
              title="Delete project"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete "${project.title}"?`)) {
                  onDelete?.(project.id);
                }
              }}
            >
              <FiTrash2 size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
