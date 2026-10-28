import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  getAIStatus,
  reviewProfile,
  analyzeResume,
  generatePostDraft,
  improvePostDraft,
  askCodeAssistant,
  generateRoadmap,
} from "../../services/ai";
import {
  FiCpu,
  FiUserCheck,
  FiFileText,
  FiEdit3,
  FiCode,
  FiMap,
  FiCopy,
  FiCheck,
  FiArrowRight,
  FiAlertCircle,
  FiInfo,
  FiRefreshCw,
  FiSend,
  FiExternalLink,
} from "react-icons/fi";
import { HiSparkles as FiSparkles } from "react-icons/hi";

const AITools = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab management
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Global AI Provider status
  const [aiStatus, setAiStatus] = useState({ isConfigured: false, provider: "None" });
  const [copiedKey, setCopiedKey] = useState("");

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab]);

  const fetchStatus = async () => {
    const status = await getAIStatus();
    setAiStatus(status);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  // =========================================================================
  // STATE: 1. PROFILE REVIEWER
  // =========================================================================
  const [profileTargetRole, setProfileTargetRole] = useState(user?.designation || "Full Stack Developer");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileReview, setProfileReview] = useState(null);
  const [profileError, setProfileError] = useState("");

  const handleReviewProfile = async () => {
    setProfileLoading(true);
    setProfileError("");
    try {
      const data = await reviewProfile(profileTargetRole);
      setProfileReview(data.review);
    } catch (err) {
      setProfileError(err.message || "Failed to analyze profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  // =========================================================================
  // STATE: 2. RESUME ANALYZER
  // =========================================================================
  const [resumeText, setResumeText] = useState("");
  const [resumeRole, setResumeRole] = useState("Full Stack Developer");
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [resumeError, setResumeError] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setResumeError("File size exceeds 2MB limit. Please upload a plain text or markdown file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setResumeText(content);
        setResumeError("");
      }
    };
    reader.onerror = () => {
      setResumeError("Could not read file. Please paste your resume text manually.");
    };
    reader.readAsText(file);
  };

  const handleAnalyzeResume = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      setResumeError("Please provide your resume text or upload a .txt/.md file.");
      return;
    }

    setResumeLoading(true);
    setResumeError("");
    try {
      const data = await analyzeResume({ resumeText, targetRole: resumeRole });
      setResumeAnalysis(data.analysis);
    } catch (err) {
      setResumeError(err.message || "Failed to analyze resume.");
    } finally {
      setResumeLoading(false);
    }
  };

  // =========================================================================
  // STATE: 3. POST GENERATOR & IMPROVER
  // =========================================================================
  const [postMode, setPostMode] = useState("generate"); // "generate" | "improve"

  // Generator inputs
  const [postTopic, setPostTopic] = useState("");
  const [postProject, setPostProject] = useState("");
  const [postExperience, setPostExperience] = useState("");
  const [postConcept, setPostConcept] = useState("");
  const [postTone, setPostTone] = useState("Professional");

  // Improver inputs
  const [postDraft, setPostDraft] = useState("");
  const [improveGoal, setImproveGoal] = useState("clarity");

  const [postLoading, setPostLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState("");
  const [postImprovements, setPostImprovements] = useState([]);
  const [postError, setPostError] = useState("");

  const handleGeneratePost = async (e) => {
    e.preventDefault();
    setPostLoading(true);
    setPostError("");
    try {
      const data = await generatePostDraft({
        topic: postTopic,
        project: postProject,
        experience: postExperience,
        concept: postConcept,
        tone: postTone,
      });
      setGeneratedPost(data.post || "");
      setPostImprovements([]);
    } catch (err) {
      setPostError(err.message || "Failed to generate post draft.");
    } finally {
      setPostLoading(false);
    }
  };

  const handleImprovePost = async (e) => {
    e.preventDefault();
    if (!postDraft.trim()) {
      setPostError("Please paste or write a draft to improve.");
      return;
    }

    setPostLoading(true);
    setPostError("");
    try {
      const data = await improvePostDraft({
        draft: postDraft,
        goal: improveGoal,
        tone: postTone,
      });
      setGeneratedPost(data.improvedDraft || "");
      setPostImprovements(data.changesMade || []);
    } catch (err) {
      setPostError(err.message || "Failed to improve post draft.");
    } finally {
      setPostLoading(false);
    }
  };

  const handlePublishRedirect = () => {
    sessionStorage.setItem("ai_post_draft", generatedPost);
    navigate("/posts/new");
  };

  // =========================================================================
  // STATE: 4. CODING ASSISTANT
  // =========================================================================
  const [codePrompt, setCodePrompt] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("JavaScript");
  const [codeMode, setCodeMode] = useState("explain");
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeResponse, setCodeResponse] = useState("");
  const [codeError, setCodeError] = useState("");

  const handleAskCodeAssistant = async (e) => {
    e.preventDefault();
    if (!codePrompt.trim()) {
      setCodeError("Please ask a programming question or specify what you need help with.");
      return;
    }

    setCodeLoading(true);
    setCodeError("");
    try {
      const data = await askCodeAssistant({
        prompt: codePrompt,
        code: codeSnippet,
        language: codeLanguage,
        mode: codeMode,
      });
      setCodeResponse(data.response || "");
    } catch (err) {
      setCodeError(err.message || "Failed to get coding assistant response.");
    } finally {
      setCodeLoading(false);
    }
  };

  // =========================================================================
  // STATE: 5. LEARNING ROADMAP
  // =========================================================================
  const [roadmapRole, setRoadmapRole] = useState("Full Stack Developer");
  const [roadmapSkills, setRoadmapSkills] = useState(user?.skills?.join(", ") || "JavaScript, React, Node.js");
  const [roadmapLevel, setRoadmapLevel] = useState("Intermediate");
  const [roadmapTime, setRoadmapTime] = useState("10 hours/week");
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState(null);
  const [roadmapError, setRoadmapError] = useState("");

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    setRoadmapLoading(true);
    setRoadmapError("");
    try {
      const data = await generateRoadmap({
        targetRole: roadmapRole,
        currentSkills: roadmapSkills,
        experienceLevel: roadmapLevel,
        studyTime: roadmapTime,
      });
      setRoadmapData(data.roadmap);
    } catch (err) {
      setRoadmapError(err.message || "Failed to generate roadmap.");
    } finally {
      setRoadmapLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header & Status Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold mb-3">
              <FiSparkles /> AI Engineering Studio
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              DevConnect AI Tools
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Smart developer tools for profile reviews, resume analysis, technical post drafting, code mentoring, and career roadmaps.
            </p>
          </div>

          {/* AI Connection Status Pill */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col gap-1 min-w-[260px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Engine Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  aiStatus.isConfigured
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${aiStatus.isConfigured ? "bg-green-500 animate-pulse" : "bg-amber-500"}`} />
                {aiStatus.isConfigured ? `${aiStatus.provider} Live` : "Offline Assistant"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {aiStatus.isConfigured
                ? `Connected to ${aiStatus.model || aiStatus.provider}. Safe token limits applied.`
                : "Add GEMINI_API_KEY to server/.env for live LLM responses. Full heuristic analysis active."}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          {[
            { id: "profile", label: "Profile Reviewer", icon: FiUserCheck },
            { id: "resume", label: "Resume Analyzer", icon: FiFileText },
            { id: "post", label: "Post Creator & Improver", icon: FiEdit3 },
            { id: "code", label: "Coding Assistant", icon: FiCode },
            { id: "roadmap", label: "Learning Roadmap", icon: FiMap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================================================================= */}
        {/* TAB 1: PROFILE REVIEWER                                            */}
        {/* ================================================================= */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Card */}
            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FiUserCheck className="text-violet-600" /> Analyze Profile
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                The AI inspects your current bio, skills array, completeness, and social links to provide actionable recommendations.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Target Role / Designation
                </label>
                <input
                  type="text"
                  value={profileTargetRole}
                  onChange={(e) => setProfileTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {profileError && (
                <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
                  <FiAlertCircle size={15} className="flex-shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <button
                onClick={handleReviewProfile}
                disabled={profileLoading}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-violet-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {profileLoading ? (
                  <>
                    <FiRefreshCw className="animate-spin" /> Evaluating...
                  </>
                ) : (
                  <>
                    <FiSparkles /> Review My Profile
                  </>
                )}
              </button>

              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 flex items-center gap-1.5">
                <FiInfo /> Only public profile text is processed; never passwords.
              </div>
            </div>

            {/* Results Card */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              {!profileReview && !profileLoading ? (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <FiUserCheck size={44} className="mx-auto opacity-30 text-violet-600" />
                  <h3 className="font-semibold text-slate-700">Ready to audit your profile</h3>
                  <p className="text-xs max-w-sm mx-auto">
                    Click "Review My Profile" to generate tailored strengths, weak spots, and an improved bio draft.
                  </p>
                </div>
              ) : profileLoading ? (
                <div className="space-y-4 animate-pulse py-8">
                  <div className="h-6 bg-slate-200 rounded w-1/3" />
                  <div className="h-20 bg-slate-100 rounded-2xl" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-20 bg-slate-100 rounded-2xl" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Score & Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Profile Audit Results
                      </h3>
                      <p className="text-xs text-slate-400">
                        Evaluated by: {profileReview.provider}
                      </p>
                    </div>
                    {profileReview.profileScore && (
                      <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 px-4 py-2 rounded-2xl">
                        <span className="text-xs font-semibold text-violet-700">Completeness Score:</span>
                        <span className="text-lg font-extrabold text-violet-900">
                          {profileReview.profileScore}/100
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Strengths */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-green-700 mb-2">
                      ✅ Profile Strengths
                    </h4>
                    <ul className="space-y-1.5 text-sm text-slate-700">
                      {profileReview.strengths?.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-500 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses / Gaps */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
                      ⚠️ Missing or Weak Areas
                    </h4>
                    <ul className="space-y-1.5 text-sm text-slate-700">
                      {profileReview.weaknesses?.map((w, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Specific Actionable Suggestions */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      💡 Actionable Recommendations
                    </h4>
                    <ul className="space-y-1.5 text-sm text-slate-700">
                      {profileReview.specificSuggestions?.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-violet-500 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggested Bio Draft */}
                  {profileReview.improvedBio && (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          ✨ Suggested Bio Draft
                        </span>
                        <button
                          onClick={() => copyToClipboard(profileReview.improvedBio, "bio")}
                          className="text-xs font-semibold text-violet-600 hover:text-violet-700 inline-flex items-center gap-1 transition"
                        >
                          {copiedKey === "bio" ? (
                            <>
                              <FiCheck /> Copied!
                            </>
                          ) : (
                            <>
                              <FiCopy /> Copy Draft
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-slate-800 leading-relaxed italic">
                        "{profileReview.improvedBio}"
                      </p>
                      <div className="pt-2">
                        <Link
                          to="/profile/edit"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:underline"
                        >
                          Go to Edit Profile to apply this draft →
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Recommended Skills */}
                  {profileReview.recommendedSkills?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                        🏷️ Recommended Skills to Learn / Add
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profileReview.recommendedSkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-violet-50 text-violet-700 border border-violet-100 rounded-lg text-xs font-medium"
                          >
                            + {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: RESUME ANALYZER                                             */}
        {/* ================================================================= */}
        {activeTab === "resume" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FiFileText className="text-violet-600" /> Resume Content
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Paste your resume text or upload a plain text file (.txt, .md). No binaries are executed.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Target Job Role
                </label>
                <select
                  value={resumeRole}
                  onChange={(e) => setResumeRole(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-violet-500 bg-white"
                >
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="DevOps / Cloud Engineer">DevOps / Cloud Engineer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Paste Resume Text *
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={8}
                  placeholder="Paste your education, skills, projects, and work experience here..."
                  className="w-full text-xs font-mono border border-slate-200 rounded-xl p-3 outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Or Upload Text File (.txt, .md)
                </label>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 cursor-pointer"
                />
              </div>

              {resumeError && (
                <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
                  <FiAlertCircle size={15} className="flex-shrink-0" />
                  <span>{resumeError}</span>
                </div>
              )}

              <button
                onClick={handleAnalyzeResume}
                disabled={resumeLoading || !resumeText.trim()}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-violet-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {resumeLoading ? (
                  <>
                    <FiRefreshCw className="animate-spin" /> Analyzing Resume...
                  </>
                ) : (
                  <>
                    <FiSparkles /> Analyze My Resume
                  </>
                )}
              </button>
            </div>

            {/* Analysis Output */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              {!resumeAnalysis && !resumeLoading ? (
                <div className="text-center py-20 text-slate-400 space-y-2">
                  <FiFileText size={44} className="mx-auto opacity-30 text-violet-600" />
                  <h3 className="font-semibold text-slate-700">Resume Analyzer Ready</h3>
                  <p className="text-xs max-w-sm mx-auto">
                    Provide your resume content to receive ATS observations, project bullet improvements, and matched job roles.
                  </p>
                </div>
              ) : resumeLoading ? (
                <div className="space-y-4 animate-pulse py-8">
                  <div className="h-6 bg-slate-200 rounded w-1/3" />
                  <div className="h-16 bg-slate-100 rounded-2xl" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-28 bg-slate-100 rounded-2xl" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="pb-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">
                      Resume Evaluation Report
                    </h3>
                    <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                      {resumeAnalysis.summary}
                    </p>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                        Strengths
                      </h4>
                      <ul className="space-y-1.5 text-xs text-emerald-950">
                        {resumeAnalysis.strengths?.map((s, i) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
                        Areas to Improve
                      </h4>
                      <ul className="space-y-1.5 text-xs text-amber-950">
                        {resumeAnalysis.weaknesses?.map((w, i) => (
                          <li key={i}>• {w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Project Descriptions & STAR Method */}
                  {resumeAnalysis.projectSuggestions?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        📌 Project Description Improvements (STAR Method)
                      </h4>
                      <div className="space-y-2">
                        {resumeAnalysis.projectSuggestions.map((ps, i) => (
                          <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700">
                            {ps}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ATS Readability Observations */}
                  {resumeAnalysis.atsObservations?.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        🤖 ATS Readability Observations
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {resumeAnalysis.atsObservations.map((obs, i) => (
                          <li key={i}>• {obs}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Matched Roles */}
                  {resumeAnalysis.suggestedRoles?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        🎯 Suggested Roles Matching Your Resume
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {resumeAnalysis.suggestedRoles.map((role) => (
                          <span
                            key={role}
                            className="px-3 py-1 bg-violet-50 text-violet-700 border border-violet-100 rounded-lg text-xs font-semibold"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: POST CREATOR & IMPROVER                                     */}
        {/* ================================================================= */}
        {activeTab === "post" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setPostMode("generate")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    postMode === "generate" ? "bg-white text-violet-700 shadow-sm" : "text-slate-600"
                  }`}
                >
                  Generate New
                </button>
                <button
                  type="button"
                  onClick={() => setPostMode("improve")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    postMode === "improve" ? "bg-white text-violet-700 shadow-sm" : "text-slate-600"
                  }`}
                >
                  Improve Draft
                </button>
              </div>

              {postMode === "generate" ? (
                <form onSubmit={handleGeneratePost} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Topic or Core Idea *
                    </label>
                    <input
                      type="text"
                      value={postTopic}
                      onChange={(e) => setPostTopic(e.target.value)}
                      placeholder="e.g. Scaling PostgreSQL connections, building with React 19"
                      required
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Project or Achievement
                    </label>
                    <input
                      type="text"
                      value={postProject}
                      onChange={(e) => setPostProject(e.target.value)}
                      placeholder="e.g. Shipped DevConnect real-time notifications"
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Tone
                    </label>
                    <select
                      value={postTone}
                      onChange={(e) => setPostTone(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-violet-500 bg-white"
                    >
                      <option value="Professional">Professional</option>
                      <option value="Technical">Technical Deep Dive</option>
                      <option value="Learning journey">Learning Journey</option>
                      <option value="Project showcase">Project Showcase</option>
                      <option value="Casual">Casual & Conversational</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={postLoading || !postTopic.trim()}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {postLoading ? <FiRefreshCw className="animate-spin" /> : <FiSparkles />} Generate Draft
                  </button>
                </form>
              ) : (
                <form onSubmit={handleImprovePost} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Paste Your Draft *
                    </label>
                    <textarea
                      value={postDraft}
                      onChange={(e) => setPostDraft(e.target.value)}
                      rows={6}
                      placeholder="Paste your rough post text here..."
                      required
                      className="w-full text-xs border border-slate-200 rounded-xl p-3 outline-none focus:border-violet-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Improvement Goal
                    </label>
                    <select
                      value={improveGoal}
                      onChange={(e) => setImproveGoal(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-violet-500 bg-white"
                    >
                      <option value="clarity">Grammar & Clear Explanations</option>
                      <option value="professional">More Professional Language</option>
                      <option value="formatting">Better Formatting & Spacing</option>
                      <option value="shorter">Shorter & Punchier</option>
                      <option value="longer">Expand with Technical Context</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={postLoading || !postDraft.trim()}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {postLoading ? <FiRefreshCw className="animate-spin" /> : <FiSparkles />} Improve Draft
                  </button>
                </form>
              )}

              {postError && (
                <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
                  <FiAlertCircle size={15} className="flex-shrink-0" />
                  <span>{postError}</span>
                </div>
              )}
            </div>

            {/* Post Output */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FiEdit3 className="text-violet-600" /> Post Preview
                  </h3>
                  {generatedPost && (
                    <button
                      onClick={() => copyToClipboard(generatedPost, "post")}
                      className="text-xs font-semibold text-violet-600 hover:text-violet-700 inline-flex items-center gap-1 transition"
                    >
                      {copiedKey === "post" ? <><FiCheck /> Copied</> : <><FiCopy /> Copy Text</>}
                    </button>
                  )}
                </div>

                {!generatedPost && !postLoading ? (
                  <div className="text-center py-20 text-slate-400 space-y-2">
                    <FiEdit3 size={40} className="mx-auto opacity-30 text-violet-600" />
                    <p className="text-sm font-medium text-slate-600">No draft generated yet</p>
                    <p className="text-xs">Fill in your topic or paste your draft on the left to begin.</p>
                  </div>
                ) : postLoading ? (
                  <div className="space-y-3 py-10 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-24 bg-slate-100 rounded-2xl" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                        {generatedPost}
                      </p>
                    </div>

                    {postImprovements.length > 0 && (
                      <div className="p-4 bg-violet-50/60 rounded-2xl border border-violet-100">
                        <span className="text-xs font-bold text-violet-800 block mb-1">
                          Applied Improvements:
                        </span>
                        <ul className="text-xs text-violet-900 space-y-1">
                          {postImprovements.map((imp, i) => (
                            <li key={i}>• {imp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action: Use in DevConnect post creation */}
              {generatedPost && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    The AI never posts automatically. Review and edit freely.
                  </span>
                  <button
                    onClick={handlePublishRedirect}
                    className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition"
                  >
                    Open in DevConnect Post Creator <FiArrowRight />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: CODING ASSISTANT                                           */}
        {/* ================================================================= */}
        {activeTab === "code" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FiCode className="text-violet-600" /> Programming Mentor
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ask coding questions, debug errors, review code for readability, or compute Big-O complexity.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Language
                </label>
                <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-violet-500 bg-white"
                >
                  <option value="JavaScript">JavaScript (ES6+)</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="Python">Python</option>
                  <option value="SQL">PostgreSQL / SQL</option>
                  <option value="Go">Go</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Assistance Mode
                </label>
                <select
                  value={codeMode}
                  onChange={(e) => setCodeMode(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-violet-500 bg-white"
                >
                  <option value="explain">Explain Concept / Code</option>
                  <option value="debug">Debug / Suggest Error Causes</option>
                  <option value="complexity">Explain Time & Space Complexity (Big-O)</option>
                  <option value="review">Review for Readability & Clean Code</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Question or Goal *
                </label>
                <textarea
                  value={codePrompt}
                  onChange={(e) => setCodePrompt(e.target.value)}
                  rows={3}
                  placeholder="e.g. Why is this async loop failing? or How do transactions work in Prisma?"
                  required
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Code Snippet (Optional)
                </label>
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  rows={5}
                  placeholder="// Paste your function or error snippet here..."
                  className="w-full text-xs font-mono border border-slate-200 rounded-xl p-3 outline-none focus:border-violet-500 resize-none"
                />
              </div>

              {codeError && (
                <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
                  <FiAlertCircle size={15} className="flex-shrink-0" />
                  <span>{codeError}</span>
                </div>
              )}

              <button
                onClick={handleAskCodeAssistant}
                disabled={codeLoading || !codePrompt.trim()}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {codeLoading ? <FiRefreshCw className="animate-spin" /> : <FiSend />} Ask Assistant
              </button>
            </div>

            {/* Assistant Response */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Explanation & Code Guidance
                </h3>
                {codeResponse && (
                  <button
                    onClick={() => copyToClipboard(codeResponse, "code")}
                    className="text-xs font-semibold text-violet-600 hover:text-violet-700 inline-flex items-center gap-1 transition"
                  >
                    {copiedKey === "code" ? <><FiCheck /> Copied</> : <><FiCopy /> Copy Output</>}
                  </button>
                )}
              </div>

              {!codeResponse && !codeLoading ? (
                <div className="text-center py-24 text-slate-400 space-y-2">
                  <FiCode size={44} className="mx-auto opacity-30 text-violet-600" />
                  <p className="text-sm font-medium text-slate-700">Coding Assistant Ready</p>
                  <p className="text-xs max-w-sm mx-auto">
                    Submit your code question or snippet to receive debugging insights, clean code suggestions, and Big-O explanations.
                  </p>
                </div>
              ) : codeLoading ? (
                <div className="space-y-4 py-8 animate-pulse">
                  <div className="h-5 bg-slate-200 rounded w-1/4" />
                  <div className="h-28 bg-slate-100 rounded-2xl" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {codeResponse}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: LEARNING ROADMAP                                           */}
        {/* ================================================================= */}
        {activeTab === "roadmap" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FiMap className="text-violet-600" /> Career Roadmap
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Specify your desired engineering role and current baseline to build a milestone-driven study and project plan.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Target Role *
                </label>
                <input
                  type="text"
                  value={roadmapRole}
                  onChange={(e) => setRoadmapRole(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  required
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Current Skills
                </label>
                <input
                  type="text"
                  value={roadmapSkills}
                  onChange={(e) => setRoadmapSkills(e.target.value)}
                  placeholder="e.g. React, JavaScript, Node.js"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Level
                  </label>
                  <select
                    value={roadmapLevel}
                    onChange={(e) => setRoadmapLevel(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:border-violet-500 bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Weekly Time
                  </label>
                  <select
                    value={roadmapTime}
                    onChange={(e) => setRoadmapTime(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:border-violet-500 bg-white"
                  >
                    <option value="5 hours/week">5 hrs/week</option>
                    <option value="10 hours/week">10 hrs/week</option>
                    <option value="20 hours/week">20 hrs/week</option>
                  </select>
                </div>
              </div>

              {roadmapError && (
                <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
                  <FiAlertCircle size={15} className="flex-shrink-0" />
                  <span>{roadmapError}</span>
                </div>
              )}

              <button
                onClick={handleGenerateRoadmap}
                disabled={roadmapLoading || !roadmapRole.trim()}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {roadmapLoading ? <FiRefreshCw className="animate-spin" /> : <FiSparkles />} Generate Roadmap
              </button>
            </div>

            {/* Roadmap Output */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              {!roadmapData && !roadmapLoading ? (
                <div className="text-center py-20 text-slate-400 space-y-2">
                  <FiMap size={44} className="mx-auto opacity-30 text-violet-600" />
                  <p className="text-sm font-medium text-slate-700">Roadmap Generator Ready</p>
                  <p className="text-xs max-w-sm mx-auto">
                    Specify your target role and study capacity to receive a structured milestone plan with concrete projects.
                  </p>
                </div>
              ) : roadmapLoading ? (
                <div className="space-y-4 py-8 animate-pulse">
                  <div className="h-6 bg-slate-200 rounded w-1/3" />
                  <div className="h-28 bg-slate-100 rounded-2xl" />
                  <div className="h-28 bg-slate-100 rounded-2xl" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-slate-100">
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {roadmapData.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {roadmapData.overview}
                    </p>
                  </div>

                  {/* Milestones */}
                  <div className="space-y-4">
                    {roadmapData.milestones?.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900">
                            {idx + 1}. {m.title}
                          </span>
                          <span className="px-3 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold">
                            {m.duration}
                          </span>
                        </div>

                        {/* Topics */}
                        <div className="flex flex-wrap gap-1.5">
                          {m.topics?.map((t, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-600">
                              {t}
                            </span>
                          ))}
                        </div>

                        <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                          <strong className="text-violet-700">Project to build:</strong> {m.projectToBuild}
                        </div>

                        <div className="text-xs text-slate-500">
                          🎯 <strong>Outcome:</strong> {m.keyOutcome}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommended Resources */}
                  {roadmapData.recommendedResources?.length > 0 && (
                    <div className="p-4 bg-violet-50/60 rounded-2xl border border-violet-100">
                      <span className="text-xs font-bold text-violet-800 uppercase tracking-wider block mb-2">
                        Recommended Resources
                      </span>
                      <ul className="text-xs text-violet-950 space-y-1">
                        {roadmapData.recommendedResources.map((res, i) => (
                          <li key={i}>• {res}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITools;
