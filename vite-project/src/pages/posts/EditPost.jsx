import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPost, updatePost } from "../../services/post";
import { improvePostDraft } from "../../services/ai";
import { FiArrowLeft, FiSave, FiAlertCircle, FiImage, FiRefreshCw, FiX } from "react-icons/fi";
import { HiSparkles as FiSparkles } from "react-icons/hi";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    content: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // AI Polish State
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiGoal, setAiGoal] = useState("clarity");
  const [aiTone, setAiTone] = useState("Professional");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState("");

  const handleAIImprove = async () => {
    if (!formData.content.trim()) return;
    setAiLoading(true);
    setError("");
    try {
      const res = await improvePostDraft({
        draft: formData.content.trim(),
        goal: aiGoal,
        tone: aiTone,
      });
      setAiPreview(res.improvedDraft || "");
    } catch (err) {
      setError(err.message || "Failed to polish draft");
    } finally {
      setAiLoading(false);
    }
  };

  const applyAIDraft = () => {
    if (aiPreview) {
      setFormData((prev) => ({ ...prev, content: aiPreview }));
      setShowAIPanel(false);
      setAiPreview("");
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const data = await getPost(id);
      setFormData({
        content: data.content || "",
        image: data.image || "",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load post.");
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
    if (!formData.content.trim()) {
      setError("Post content cannot be empty");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updatePost(id, {
        content: formData.content.trim(),
        image: formData.image?.trim() || null,
      });
      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError("Failed to update post. Please try again.");
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
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit Post</h1>

          {error && (
            <div className="flex items-center gap-2 p-3.5 mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <FiAlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* AI Polish Quick Bar */}
            <div className="flex items-center justify-between bg-violet-50/70 border border-violet-100 rounded-2xl p-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-sm">
                  <FiSparkles size={15} />
                </div>
                <div>
                  <p className="text-xs font-bold text-violet-950">AI Post Polisher</p>
                  <p className="text-[11px] text-violet-600">Enhance clarity, add discussion questions, or fix grammar</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAIPanel((prev) => !prev)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  showAIPanel
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-white text-violet-700 hover:bg-violet-100/70 border border-violet-200"
                }`}
              >
                <FiRefreshCw size={13} />
                Polish with AI
              </button>
            </div>

            {/* AI Polish Panel */}
            {showAIPanel && (
              <div className="bg-slate-50 border border-violet-200 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-700 flex items-center gap-1.5">
                    <FiSparkles size={14} />
                    Improve & Polish Post
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAIPanel(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                  >
                    <FiX size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Improvement Goal
                    </label>
                    <select
                      value={aiGoal}
                      onChange={(e) => setAiGoal(e.target.value)}
                      className="w-full text-xs border border-slate-200 bg-white rounded-xl px-3 py-2 outline-none focus:border-violet-500"
                    >
                      <option value="clarity">Grammar & Clean Readability</option>
                      <option value="engagement">Stronger Hook & Comment Question</option>
                      <option value="concise">Concise & Impactful (Trim Fluff)</option>
                      <option value="hashtags">Add High-Traffic Tech Hashtags</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Tone
                    </label>
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      className="w-full text-xs border border-slate-200 bg-white rounded-xl px-3 py-2 outline-none focus:border-violet-500"
                    >
                      <option value="Professional">Professional</option>
                      <option value="Technical">Technical</option>
                      <option value="Engaging">Engaging & Casual</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    disabled={aiLoading || !formData.content.trim()}
                    onClick={handleAIImprove}
                    className="text-xs font-semibold px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl disabled:opacity-50 flex items-center gap-1.5 transition"
                  >
                    {aiLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Polishing Draft...
                      </>
                    ) : (
                      <>
                        <FiRefreshCw size={13} />
                        Enhance Post Content
                      </>
                    )}
                  </button>
                </div>

                {/* Generated Preview */}
                {aiPreview && (
                  <div className="mt-3 p-3 bg-white border border-violet-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-violet-700">Polished Preview</span>
                      <button
                        type="button"
                        onClick={applyAIDraft}
                        className="text-xs font-semibold px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition"
                      >
                        Apply to Post
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {aiPreview}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Post Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                required
                className="w-full text-sm text-slate-800 placeholder-slate-400 p-4 border border-slate-200 rounded-2xl resize-none outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Image URL (optional)
              </label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
              />
            </div>

            {formData.image && (
              <div className="rounded-xl overflow-hidden border border-slate-200 max-h-72 bg-slate-50">
                <img
                  src={formData.image}
                  alt="Post preview"
                  className="w-full h-full object-cover max-h-72"
                  onError={() => setError("Image preview failed to load")}
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
                <FiSave size={15} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPost;