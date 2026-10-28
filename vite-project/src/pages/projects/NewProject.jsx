import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../../services/projects";
import { generateProjectDescription } from "../../services/ai";
import { FiArrowLeft, FiPlus, FiAlertCircle } from "react-icons/fi";
import { HiSparkles as FiSparkles } from "react-icons/hi";

const NewProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    githubUrl: "",
    liveUrl: "",
    techStack: "",
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateAI = async () => {
    if (!formData.title.trim()) {
      setError("Please enter a Project Title first so the AI knows what you are building.");
      return;
    }
    setAiLoading(true);
    setError("");
    try {
      const res = await generateProjectDescription({
        title: formData.title.trim(),
        techStack: formData.techStack,
      });
      if (res?.description) {
        setFormData((prev) => ({ ...prev, description: res.description }));
      }
    } catch (err) {
      setError(err.message || "Failed to generate project description");
    } finally {
      setAiLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Please provide both a project title and description.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createProject({
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: formData.image.trim() || null,
        githubUrl: formData.githubUrl.trim() || null,
        liveUrl: formData.liveUrl.trim() || null,
        techStack: formData.techStack
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });

      navigate("/profile");
    } catch (err) {
      console.error("Error creating project:", err);
      setError(err.message || "Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-violet-600 transition"
        >
          <FiArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Showcase New Project</h1>
          <p className="text-xs text-slate-500 mb-6">
            Share your apps, open source libraries, or side projects with the developer community.
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3.5 mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <FiAlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Project Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. AI Code Assistant, DevConnect"
                required
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Description *
                </label>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={handleGenerateAI}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100/80 border border-violet-200 rounded-lg transition disabled:opacity-50"
                >
                  <FiSparkles size={13} />
                  {aiLoading ? "Generating with AI..." : "Generate with AI"}
                </button>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="What does your project do? What problem does it solve?"
                required
                className="w-full text-sm border border-slate-200 rounded-xl p-4 outline-none resize-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/username/project"
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Live Demo URL
                </label>
                <input
                  type="url"
                  name="liveUrl"
                  value={formData.liveUrl}
                  onChange={handleChange}
                  placeholder="https://my-app.vercel.app"
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Tech Stack (comma separated)
              </label>
              <input
                type="text"
                name="techStack"
                value={formData.techStack}
                onChange={handleChange}
                placeholder="React, Node.js, Prisma, PostgreSQL, Tailwind"
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Cover Image URL (optional)
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
              />
            </div>

            {formData.image && (
              <div className="rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-50">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-full object-cover max-h-48"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-md shadow-violet-200 flex items-center gap-2 transition"
              >
                <FiPlus size={16} />
                {loading ? "Publishing..." : "Add Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewProject;