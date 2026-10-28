import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProject, updateProject } from "../../services/projects";
import { generateProjectDescription } from "../../services/ai";
import { FiArrowLeft, FiSave, FiAlertCircle } from "react-icons/fi";
import { HiSparkles as FiSparkles } from "react-icons/hi";

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    githubUrl: "",
    liveUrl: "",
    techStack: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await getProject(id);
      const proj = data?.project || data;
      setFormData({
        title: proj.title || "",
        description: proj.description || "",
        image: proj.image || "",
        githubUrl: proj.githubUrl || "",
        liveUrl: proj.liveUrl || "",
        techStack: proj.techStack?.join(", ") || "",
      });
    } catch (err) {
      console.error("Error loading project:", err);
      setError("Failed to load project details.");
    } finally {
      setLoading(false);
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
      setError("Please provide both a title and description.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateProject(id, {
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

      navigate(`/projects/${id}`);
    } catch (err) {
      console.error("Error updating project:", err);
      setError("Failed to update project. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit Project</h1>

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
                  {aiLoading ? "Generating with AI..." : "Enhance with AI"}
                </button>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
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
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Cover Image URL
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
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
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-md shadow-violet-200 flex items-center gap-2 transition"
              >
                <FiSave size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProject;