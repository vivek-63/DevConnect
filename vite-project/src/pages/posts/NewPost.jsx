import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../../services/post";
import { generatePostDraft, improvePostDraft } from "../../services/ai";
import { useAuth } from "../../hooks/useAuth";
import { FiImage, FiX, FiSend, FiArrowLeft, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { HiSparkles as FiSparkles } from "react-icons/hi";

const NewPost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // AI Assistant State
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiMode, setAiMode] = useState("draft"); // "draft" | "improve"
  const [aiTopic, setAiTopic] = useState("");
  const [aiTakeaway, setAiTakeaway] = useState("");
  const [aiTone, setAiTone] = useState("Professional");
  const [aiGoal, setAiGoal] = useState("clarity");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState("");

  useEffect(() => {
    const draft = sessionStorage.getItem("ai_post_draft");
    if (draft) {
      setContent(draft);
      sessionStorage.removeItem("ai_post_draft");
    }
  }, []);

  const handleAIDraft = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setError("");
    try {
      const res = await generatePostDraft({
        topic: aiTopic.trim(),
        experience: aiTakeaway.trim(),
        tone: aiTone,
      });
      setAiPreview(res.post || "");
    } catch (err) {
      setError(err.message || "Failed to generate post draft");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIImprove = async () => {
    if (!content.trim()) return;
    setAiLoading(true);
    setError("");
    try {
      const res = await improvePostDraft({
        draft: content.trim(),
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
      setContent(aiPreview);
      setShowAIPanel(false);
      setAiPreview("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please write some content for your post.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createPost({
        content: content.trim(),
        image: imageUrl.trim() || null,
      });
      navigate("/");
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-violet-600 transition"
        >
          <FiArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.username || "Dev"
                )}&background=7c3aed&color=fff`
              }
              alt={user?.username}
              className="w-11 h-11 rounded-full object-cover border border-slate-200"
            />
            <div>
              <h1 className="font-bold text-slate-900 text-lg">Create a Post</h1>
              <p className="text-xs text-slate-400">
                Posting as <span className="font-semibold text-slate-600">{user?.username}</span>
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
                <FiAlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* AI Assistant Quick Bar */}
            <div className="flex items-center justify-between bg-violet-50/70 border border-violet-100 rounded-2xl p-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-sm">
                  <FiSparkles size={15} />
                </div>
                <div>
                  <p className="text-xs font-bold text-violet-950">AI Post Assistant</p>
                  <p className="text-[11px] text-violet-600">Draft ideas or polish your current text with AI</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAIPanel((prev) => !prev);
                    setAiMode("draft");
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                    showAIPanel && aiMode === "draft"
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-white text-violet-700 hover:bg-violet-100/70 border border-violet-200"
                  }`}
                >
                  <FiSparkles size={13} />
                  Draft with AI
                </button>
                {content.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAIPanel(true);
                      setAiMode("improve");
                    }}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                      showAIPanel && aiMode === "improve"
                        ? "bg-violet-600 text-white shadow-sm"
                        : "bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200"
                    }`}
                  >
                    <FiRefreshCw size={13} />
                    Polish Draft
                  </button>
                )}
              </div>
            </div>

            {/* AI Interactive Panel */}
            {showAIPanel && (
              <div className="bg-slate-50 border border-violet-200 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-700 flex items-center gap-1.5">
                    <FiSparkles size={14} />
                    {aiMode === "draft" ? "Generate Technical Post Draft" : "Improve & Polish Post"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAIPanel(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                  >
                    <FiX size={16} />
                  </button>
                </div>

                {aiMode === "draft" ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Topic or Tech Concept *
                        </label>
                        <input
                          type="text"
                          value={aiTopic}
                          onChange={(e) => setAiTopic(e.target.value)}
                          placeholder="e.g. Docker, PostgreSQL indexing, Next.js"
                          className="w-full text-xs border border-slate-200 bg-white rounded-xl px-3 py-2 outline-none focus:border-violet-500"
                        />
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
                          <option value="Professional">Professional Engineering</option>
                          <option value="Technical">Deep Technical / Architecture</option>
                          <option value="Project showcase">Project Showcase</option>
                          <option value="Learning journey">Learning in Public</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Project / Key Takeaway (Optional)
                      </label>
                      <input
                        type="text"
                        value={aiTakeaway}
                        onChange={(e) => setAiTakeaway(e.target.value)}
                        placeholder="e.g. Cut bundle size by 40%, built a custom auth middleware"
                        className="w-full text-xs border border-slate-200 bg-white rounded-xl px-3 py-2 outline-none focus:border-violet-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        disabled={aiLoading || !aiTopic.trim()}
                        onClick={handleAIDraft}
                        className="text-xs font-semibold px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl disabled:opacity-50 flex items-center gap-1.5 transition"
                      >
                        {aiLoading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating with AI...
                          </>
                        ) : (
                          <>
                            <FiSparkles size={14} />
                            Generate Post
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Goal
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
                        disabled={aiLoading || !content.trim()}
                        onClick={handleAIImprove}
                        className="text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 flex items-center gap-1.5 transition"
                      >
                        {aiLoading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Polishing Draft...
                          </>
                        ) : (
                          <>
                            <FiRefreshCw size={13} />
                            Enhance Draft
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Generated Preview */}
                {aiPreview && (
                  <div className="mt-3 p-3 bg-white border border-violet-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-violet-700">AI Preview</span>
                      <button
                        type="button"
                        onClick={applyAIDraft}
                        className="text-xs font-semibold px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition"
                      >
                        Insert into Post
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
              <textarea
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full text-sm text-slate-800 placeholder-slate-400 p-4 border border-slate-200 rounded-2xl resize-none outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
                placeholder="What are you working on? Share code insights, architecture thoughts, or questions with the community..."
                required
              />
            </div>

            {/* Optional Image URL Input */}
            {showImageInput ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL (https://...)"
                    className="flex-1 text-sm border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowImageInput(false);
                      setImageUrl("");
                    }}
                    className="p-2.5 text-slate-400 hover:text-red-500 rounded-xl border border-slate-200 hover:border-red-200 transition"
                  >
                    <FiX size={18} />
                  </button>
                </div>
                {imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-60 bg-slate-50">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover max-h-60"
                      onError={() => setError("Could not load image from provided URL")}
                    />
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowImageInput(true)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-violet-600 p-2 rounded-xl hover:bg-slate-50 transition"
              >
                <FiImage size={16} /> Add Image URL
              </button>
            )}

            {/* Actions */}
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
                disabled={loading || !content.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-md shadow-violet-200 flex items-center gap-2 transition"
              >
                <FiSend size={15} />
                {loading ? "Publishing..." : "Publish Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPost;