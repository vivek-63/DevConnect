import { useEffect, useState } from "react";
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
} from "react-icons/fi";

import { HiSparkles as FiSparkles } from "react-icons/hi";

// Shared error message helper
const getErrorMessage = (error, fallback) =>
  error?.message || fallback;

const AITools = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // --------------------------------------------------
  // TAB MANAGEMENT
  // --------------------------------------------------

  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "profile"
  );

  useEffect(() => {
    setSearchParams(
      (previousParams) => {
        const updatedParams = new URLSearchParams(previousParams);
        updatedParams.set("tab", activeTab);
        return updatedParams;
      },
      { replace: true }
    );
  }, [activeTab, setSearchParams]);

  // --------------------------------------------------
  // AI STATUS & CLIPBOARD
  // --------------------------------------------------

  const [aiStatus, setAiStatus] = useState({
    isConfigured: false,
    provider: "None",
  });

  const [copiedKey, setCopiedKey] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getAIStatus();
        setAiStatus(status);
      } catch (error) {
        console.error("Failed to fetch AI status:", error);
      }
    };

    fetchStatus();
  }, []);

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  // --------------------------------------------------
  // 1. PROFILE REVIEWER
  // --------------------------------------------------

  const [profileTargetRole, setProfileTargetRole] = useState(
    user?.designation || "Full Stack Developer"
  );

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileReview, setProfileReview] = useState(null);
  const [profileError, setProfileError] = useState("");

  const handleReviewProfile = async () => {
    setProfileLoading(true);
    setProfileError("");

    try {
      const data = await reviewProfile(profileTargetRole);
      setProfileReview(data.review);
    } catch (error) {
      setProfileError(
        getErrorMessage(error, "Failed to analyze profile.")
      );
    } finally {
      setProfileLoading(false);
    }
  };

  // --------------------------------------------------
  // 2. RESUME ANALYZER
  // --------------------------------------------------

  const [resumeText, setResumeText] = useState("");
  const [resumeRole, setResumeRole] = useState("Full Stack Developer");
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [resumeError, setResumeError] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setResumeError(
        "File size exceeds 2MB limit. Please upload a plain text or markdown file."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setResumeText(event.target.result);
        setResumeError("");
      }
    };

    reader.onerror = () => {
      setResumeError(
        "Could not read file. Please paste your resume text manually."
      );
    };

    reader.readAsText(file);
  };

  const handleAnalyzeResume = async (event) => {
    event.preventDefault();

    if (!resumeText.trim()) {
      setResumeError(
        "Please provide your resume text or upload a .txt/.md file."
      );
      return;
    }

    setResumeLoading(true);
    setResumeError("");

    try {
      const data = await analyzeResume({
        resumeText,
        targetRole: resumeRole,
      });

      setResumeAnalysis(data.analysis);
    } catch (error) {
      setResumeError(
        getErrorMessage(error, "Failed to analyze resume.")
      );
    } finally {
      setResumeLoading(false);
    }
  };

  // --------------------------------------------------
  // 3. POST GENERATOR & IMPROVER
  // --------------------------------------------------

  const [postMode, setPostMode] = useState("generate");

  const [postTopic, setPostTopic] = useState("");
  const [postProject, setPostProject] = useState("");
  const [postExperience, setPostExperience] = useState("");
  const [postConcept, setPostConcept] = useState("");
  const [postTone, setPostTone] = useState("Professional");

  const [postDraft, setPostDraft] = useState("");
  const [improveGoal, setImproveGoal] = useState("clarity");

  const [postLoading, setPostLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState("");
  const [postImprovements, setPostImprovements] = useState([]);
  const [postError, setPostError] = useState("");

  const handleGeneratePost = async (event) => {
    event.preventDefault();

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
    } catch (error) {
      setPostError(
        getErrorMessage(error, "Failed to generate post draft.")
      );
    } finally {
      setPostLoading(false);
    }
  };

  const handleImprovePost = async (event) => {
    event.preventDefault();

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
    } catch (error) {
      setPostError(
        getErrorMessage(error, "Failed to improve post draft.")
      );
    } finally {
      setPostLoading(false);
    }
  };

  const handlePublishRedirect = () => {
    sessionStorage.setItem("ai_post_draft", generatedPost);
    navigate("/posts/new");
  };

  // --------------------------------------------------
  // 4. CODING ASSISTANT
  // --------------------------------------------------

  const [codePrompt, setCodePrompt] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("JavaScript");
  const [codeMode, setCodeMode] = useState("explain");

  const [codeLoading, setCodeLoading] = useState(false);
  const [codeResponse, setCodeResponse] = useState("");
  const [codeError, setCodeError] = useState("");

  const handleAskCodeAssistant = async (event) => {
    event.preventDefault();

    if (!codePrompt.trim()) {
      setCodeError(
        "Please ask a programming question or specify what you need help with."
      );
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
    } catch (error) {
      setCodeError(
        getErrorMessage(error, "Failed to get coding assistant response.")
      );
    } finally {
      setCodeLoading(false);
    }
  };

  // --------------------------------------------------
  // 5. LEARNING ROADMAP
  // --------------------------------------------------

  const [roadmapRole, setRoadmapRole] = useState("Full Stack Developer");

  const [roadmapSkills, setRoadmapSkills] = useState(
    user?.skills?.join(", ") || "JavaScript, React, Node.js"
  );

  const [roadmapLevel, setRoadmapLevel] = useState("Intermediate");
  const [roadmapTime, setRoadmapTime] = useState("10 hours/week");

  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState(null);
  const [roadmapError, setRoadmapError] = useState("");

  const handleGenerateRoadmap = async (event) => {
    event.preventDefault();

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
    } catch (error) {
      setRoadmapError(
        getErrorMessage(error, "Failed to generate roadmap.")
      );
    } finally {
      setRoadmapLoading(false);
    }
  };

  // --------------------------------------------------
  // SHARED UI HELPERS
  // --------------------------------------------------

  const renderError = (message) => {
    if (!message) return null;

    return (
      <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
        <FiAlertCircle size={15} className="flex-shrink-0" />
        <span>{message}</span>
      </div>
    );
  };

  const renderLoading = (height = "h-20") => (
    <div className="space-y-4 animate-pulse py-8">
      <div className="h-6 bg-slate-200 rounded w-1/3" />
      <div className={`${height} bg-slate-100 rounded-2xl`} />
      <div className="h-4 bg-slate-200 rounded w-1/2" />
    </div>
  );

  const tabs = [
    { id: "profile", label: "Profile Reviewer", icon: FiUserCheck },
    { id: "resume", label: "Resume Analyzer", icon: FiFileText },
    { id: "post", label: "Post Creator & Improver", icon: FiEdit3 },
    { id: "code", label: "Coding Assistant", icon: FiCode },
    { id: "roadmap", label: "Learning Roadmap", icon: FiMap },
  ];

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold mb-3">
              <FiSparkles /> AI Engineering Studio
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              DevConnect AI Tools
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Smart developer tools for profile reviews, resume analysis,
              technical post drafting, code mentoring, and career roadmaps.
            </p>
          </div>

          {/* AI STATUS */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col gap-1 min-w-[260px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Engine Status
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${aiStatus.isConfigured
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-800"
                  }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${aiStatus.isConfigured
                      ? "bg-green-500 animate-pulse"
                      : "bg-amber-500"
                    }`}
                />

                {aiStatus.isConfigured
                  ? `${aiStatus.provider} Live`
                  : "Offline Assistant"}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-1">
              {aiStatus.isConfigured
                ? `Connected to ${aiStatus.model || aiStatus.provider}. Safe token limits applied.`
                : "Add GEMINI_API_KEY to server/.env for live LLM responses. Full heuristic analysis active."}
            </p>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition ${activeTab === id
                  ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* =====================================================
            1. PROFILE REVIEWER
        ===================================================== */}

        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FiUserCheck className="text-violet-600" />
                Analyze Profile
              </h2>

              <p className="text-xs text-slate-500 leading-relaxed">
                The AI inspects your current bio, skills array, completeness,
                and social links to provide actionable recommendations.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Target Role / Designation
                </label>

                <input
                  type="text"
                  value={profileTargetRole}
                  onChange={(event) => setProfileTargetRole(event.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {renderError(profileError)}

              <button
                type="button"
                onClick={handleReviewProfile}
                disabled={profileLoading}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-violet-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {profileLoading ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <FiSparkles />
                    Review My Profile
                  </>
                )}
              </button>

              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 flex items-center gap-1.5">
                <FiInfo />
                Only public profile text is processed; never passwords.
              </div>
            </div>

            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              {!profileReview && !profileLoading ? (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <FiUserCheck size={44} className="mx-auto opacity-30 text-violet-600" />
                  <h3 className="font-semibold text-slate-700">
                    Ready to audit your profile
                  </h3>
                  <p className="text-xs max-w-sm mx-auto">
                    Click "Review My Profile" to generate tailored strengths,
                    weak spots, and an improved bio draft.
                  </p>
                </div>
              ) : profileLoading ? (
                renderLoading()
              ) : (
                <div className="space-y-6">
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
                        <span className="text-xs font-semibold text-violet-700">
                          Completeness Score:
                        </span>
                        <span className="text-lg font-extrabold text-violet-900">
                          {profileReview.profileScore}/100
                        </span>
                      </div>
                    )}
                  </div>

                  {[
                    {
                      title: "Profile Strengths",
                      items: profileReview.strengths,
                      color: "text-green-700",
                      bullet: "text-green-500",
                    },
                    {
                      title: "Missing or Weak Areas",
                      items: profileReview.weaknesses,
                      color: "text-amber-700",
                      bullet: "text-amber-500",
                    },
                    {
                      title: "Actionable Recommendations",
                      items: profileReview.specificSuggestions,
                      color: "text-slate-500",
                      bullet: "text-violet-500",
                    },
                  ].map((section) => (
                    <div key={section.title}>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${section.color}`}>
                        {section.title}
                      </h4>

                      <ul className="space-y-1.5 text-sm text-slate-700">
                        {section.items?.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className={`font-bold ${section.bullet}`}>•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {profileReview.improvedBio && (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Suggested Bio Draft
                        </span>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(profileReview.improvedBio, "bio")}
                          className="text-xs font-semibold text-violet-600 hover:text-violet-700 inline-flex items-center gap-1"
                        >
                          {copiedKey === "bio" ? <FiCheck /> : <FiCopy />}
                          {copiedKey === "bio" ? "Copied!" : "Copy Draft"}
                        </button>
                      </div>

                      <p className="text-sm text-slate-800 leading-relaxed italic">
                        "{profileReview.improvedBio}"
                      </p>

                      <Link
                        to="/profile/edit"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:underline"
                      >
                        Go to Edit Profile to apply this draft →
                      </Link>
                    </div>
                  )}

                  {profileReview.recommendedSkills?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                        Recommended Skills to Learn / Add
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

        {/* =====================================================
            2. RESUME ANALYZER
        ===================================================== */}

        {activeTab === "resume" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FiFileText className="text-violet-600" />
                Resume Content
              </h2>

              <p className="text-xs text-slate-500 leading-relaxed">
                Paste your resume text or upload a plain text file (.txt, .md).
                No binaries are executed.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Target Job Role
                </label>

                <select
                  value={resumeRole}
                  onChange={(event) => setResumeRole(event.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-violet-500 bg-white"
                >
                  {[
                    "Full Stack Developer",
                    "Backend Developer",
                    "Frontend Developer",
                    "Software Engineer",
                    "DevOps / Cloud Engineer",
                  ].map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Paste Resume Text *
                </label>

                <textarea
                  value={resumeText}
                  onChange={(event) => setResumeText(event.target.value)}
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

              {renderError(resumeError)}

              <button
                type="button"
                onClick={handleAnalyzeResume}
                disabled={resumeLoading || !resumeText.trim()}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-violet-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {resumeLoading ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <FiSparkles />
                    Analyze My Resume
                  </>
                )}
              </button>
            </div>

            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              {!resumeAnalysis && !resumeLoading ? (
                <div className="text-center py-20 text-slate-400 space-y-2">
                  <FiFileText size={44} className="mx-auto opacity-30 text-violet-600" />
                  <h3 className="font-semibold text-slate-700">
                    Resume Analyzer Ready
                  </h3>
                  <p className="text-xs max-w-sm mx-auto">
                    Provide your resume content to receive ATS observations,
                    project bullet improvements, and matched job roles.
                  </p>
                </div>
              ) : resumeLoading ? (
                renderLoading("h-16")
              ) : (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">
                      Resume Evaluation Report
                    </h3>
                    <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                      {resumeAnalysis.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        title: "Strengths",
                        items: resumeAnalysis.strengths,
                        style: "bg-emerald-50/60 border-emerald-100 text-emerald-800",
                        textStyle: "text-emerald-950",
                      },
                      {
                        title: "Areas to Improve",
                        items: resumeAnalysis.weaknesses,
                        style: "bg-amber-50/60 border-amber-100 text-amber-800",
                        textStyle: "text-amber-950",
                      },
                    ].map((section) => (
                      <div
                        key={section.title}
                        className={`p-4 rounded-2xl border ${section.style}`}
                      >
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-2">
                          {section.title}
                        </h4>

                        <ul className={`space-y-1.5 text-xs ${section.textStyle}`}>
                          {section.items?.map((item, index) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {resumeAnalysis.projectSuggestions?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Project Description Improvements (STAR Method)
                      </h4>

                      <div className="space-y-2">
                        {resumeAnalysis.projectSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700"
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {resumeAnalysis.atsObservations?.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        ATS Readability Observations
                      </h4>

                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {resumeAnalysis.atsObservations.map((observation, index) => (
                          <li key={index}>• {observation}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {resumeAnalysis.suggestedRoles?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Suggested Roles Matching Your Resume
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

        {/* =====================================================
            3. POST CREATOR & IMPROVER
        ===================================================== */}

        {activeTab === "post" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">

              <div className="flex rounded-xl bg-slate-100 p-1">
                {[
                  { id: "generate", label: "Generate New" },
                  { id: "improve", label: "Improve Draft" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPostMode(mode.id)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${postMode === mode.id
                        ? "bg-white text-violet-700 shadow-sm"
                        : "text-slate-600"
                      }`}
                  >
                    {mode.label}
                  </button>
                ))}
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
                      onChange={(event) => setPostTopic(event.target.value)}
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
                      onChange={(event) => setPostProject(event.target.value)}
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
                      onChange={(event) => setPostTone(event.target.value)}
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
                    {postLoading ? (
                      <FiRefreshCw className="animate-spin" />
                    ) : (
                      <FiSparkles />
                    )}
                    Generate Draft
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
                      onChange={(event) => setPostDraft(event.target.value)}
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
                      onChange={(event) => setImproveGoal(event.target.value)}
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
                    {postLoading ? (
                      <FiRefreshCw className="animate-spin" />
                    ) : (
                      <FiSparkles />
                    )}
                    Improve Draft
                  </button>
                </form>
              )}

              {renderError(postError)}
            </div>

            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FiEdit3 className="text-violet-600" />
                    Post Preview
                  </h3>

                  {generatedPost && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(generatedPost, "post")}
                      className="text-xs font-semibold text-violet-600 hover:text-violet-700 inline-flex items-center gap-1"
                    >
                      {copiedKey === "post" ? <FiCheck /> : <FiCopy />}
                      {copiedKey === "post" ? "Copied" : "Copy Text"}
                    </button>
                  )}
                </div>

                {!generatedPost && !postLoading ? (
                  <div className="text-center py-20 text-slate-400 space-y-2">
                    <FiEdit3 size={40} className="mx-auto opacity-30 text-violet-600" />
                    <p className="text-sm font-medium text-slate-600">
                      No draft generated yet
                    </p>
                    <p className="text-xs">
                      Fill in your topic or paste your draft on the left to begin.
                    </p>
                  </div>
                ) : postLoading ? (
                  renderLoading("h-24")
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
                          {postImprovements.map((improvement, index) => (
                            <li key={index}>• {improvement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {generatedPost && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    The AI never posts automatically. Review and edit freely.
                  </span>

                  <button
                    type="button"
                    onClick={handlePublishRedirect}
                    className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition"
                  >
                    Open in DevConnect Post Creator
                    <FiArrowRight />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =====================================================
            4. CODING ASSISTANT
        ===================================================== */}

        {activeTab === "code" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FiCode className="text-violet-600" />
                Programming Mentor
              </h2>

              <p className="text-xs text-slate-500 leading-relaxed">
                Ask coding questions, debug errors, review code for readability,
                or compute Big-O complexity.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Language
                </label>

                <select
                  value={codeLanguage}
                  onChange={(event) => setCodeLanguage(event.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-violet-500 bg-white"
                >
                  {[
                    ["JavaScript", "JavaScript (ES6+)"],
                    ["TypeScript", "TypeScript"],
                    ["Python", "Python"],
                    ["SQL", "PostgreSQL / SQL"],
                    ["Go", "Go"],
                    ["Java", "Java"],
                    ["C++", "C++"],
                  ].map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Assistance Mode
                </label>

                <select
                  value={codeMode}
                  onChange={(event) => setCodeMode(event.target.value)}
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
                  onChange={(event) => setCodePrompt(event.target.value)}
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
                  onChange={(event) => setCodeSnippet(event.target.value)}
                  rows={5}
                  placeholder="// Paste your function or error snippet here..."
                  className="w-full text-xs font-mono border border-slate-200 rounded-xl p-3 outline-none focus:border-violet-500 resize-none"
                />
              </div>

              {renderError(codeError)}

              <button
                type="button"
                onClick={handleAskCodeAssistant}
                disabled={codeLoading || !codePrompt.trim()}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {codeLoading ? (
                  <FiRefreshCw className="animate-spin" />
                ) : (
                  <FiSend />
                )}
                Ask Assistant
              </button>
            </div>

            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Explanation & Code Guidance
                </h3>

                {codeResponse && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(codeResponse, "code")}
                    className="text-xs font-semibold text-violet-600 hover:text-violet-700 inline-flex items-center gap-1"
                  >
                    {copiedKey === "code" ? <FiCheck /> : <FiCopy />}
                    {copiedKey === "code" ? "Copied" : "Copy Output"}
                  </button>
                )}
              </div>

              {!codeResponse && !codeLoading ? (
                <div className="text-center py-24 text-slate-400 space-y-2">
                  <FiCode size={44} className="mx-auto opacity-30 text-violet-600" />
                  <p className="text-sm font-medium text-slate-700">
                    Coding Assistant Ready
                  </p>
                  <p className="text-xs max-w-sm mx-auto">
                    Submit your code question or snippet to receive debugging
                    insights, clean code suggestions, and Big-O explanations.
                  </p>
                </div>
              ) : codeLoading ? (
                renderLoading("h-28")
              ) : (
                <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {codeResponse}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =====================================================
            5. LEARNING ROADMAP
        ===================================================== */}

        {activeTab === "roadmap" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FiMap className="text-violet-600" />
                Career Roadmap
              </h2>

              <p className="text-xs text-slate-500 leading-relaxed">
                Specify your desired engineering role and current baseline
                to build a milestone-driven study and project plan.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Target Role *
                </label>

                <input
                  type="text"
                  value={roadmapRole}
                  onChange={(event) => setRoadmapRole(event.target.value)}
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
                  onChange={(event) => setRoadmapSkills(event.target.value)}
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
                    onChange={(event) => setRoadmapLevel(event.target.value)}
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
                    onChange={(event) => setRoadmapTime(event.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:border-violet-500 bg-white"
                  >
                    <option value="5 hours/week">5 hrs/week</option>
                    <option value="10 hours/week">10 hrs/week</option>
                    <option value="20 hours/week">20 hrs/week</option>
                  </select>
                </div>
              </div>

              {renderError(roadmapError)}

              <button
                type="button"
                onClick={handleGenerateRoadmap}
                disabled={roadmapLoading || !roadmapRole.trim()}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {roadmapLoading ? (
                  <FiRefreshCw className="animate-spin" />
                ) : (
                  <FiSparkles />
                )}
                Generate Roadmap
              </button>
            </div>

            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              {!roadmapData && !roadmapLoading ? (
                <div className="text-center py-20 text-slate-400 space-y-2">
                  <FiMap size={44} className="mx-auto opacity-30 text-violet-600" />
                  <p className="text-sm font-medium text-slate-700">
                    Roadmap Generator Ready
                  </p>
                  <p className="text-xs max-w-sm mx-auto">
                    Specify your target role and study capacity to receive
                    a structured milestone plan with concrete projects.
                  </p>
                </div>
              ) : roadmapLoading ? (
                renderLoading("h-28")
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

                  <div className="space-y-4">
                    {roadmapData.milestones?.map((milestone, index) => (
                      <div
                        key={index}
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900">
                            {index + 1}. {milestone.title}
                          </span>

                          <span className="px-3 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold">
                            {milestone.duration}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {milestone.topics?.map((topic, topicIndex) => (
                            <span
                              key={topicIndex}
                              className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-600"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>

                        <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                          <strong className="text-violet-700">
                            Project to build:
                          </strong>{" "}
                          {milestone.projectToBuild}
                        </div>

                        <div className="text-xs text-slate-500">
                          🎯 <strong>Outcome:</strong> {milestone.keyOutcome}
                        </div>
                      </div>
                    ))}
                  </div>

                  {roadmapData.recommendedResources?.length > 0 && (
                    <div className="p-4 bg-violet-50/60 rounded-2xl border border-violet-100">
                      <span className="text-xs font-bold text-violet-800 uppercase tracking-wider block mb-2">
                        Recommended Resources
                      </span>

                      <ul className="text-xs text-violet-950 space-y-1">
                        {roadmapData.recommendedResources.map((resource, index) => (
                          <li key={index}>• {resource}</li>
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