const prisma = require("../config/database");
const AppError = require("../utils/AppError");
const aiService = require("../services/aiService");

// Check AI status
module.exports.getStatus = async (req, res) => {
  const status = aiService.getAIProviderInfo();

  return res.status(200).json({
    success: true,
    ...status,
  });
};

// A. AI Profile Reviewer
module.exports.reviewProfile = async (req, res) => {
  const userId = req.user.id;
  const { targetRole } = req.body;

  // Get the user's profile from the database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      bio: true,
      skills: true,
      college: true,
      designation: true,
      github: true,
      linkedin: true,
      _count: {
        select: {
          projects: true,
          posts: true,
          followers: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError("User profile not found", 404);
  }

  try {
    const review = await aiService.reviewProfile({
      username: user.username,
      bio: user.bio,
      skills: user.skills || [],
      college: user.college,
      designation: user.designation,
      github: user.github,
      linkedin: user.linkedin,
      targetRole: targetRole || user.designation,
    });

    return res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    throw new AppError(error.message || "AI request failed", 502);
  }
};

// B. AI Resume Analyzer
module.exports.analyzeResume = async (req, res) => {
  const { resumeText, targetRole } = req.body;

  if (!resumeText || !resumeText.trim()) {
    throw new AppError("Please provide your resume content or paste the text", 400);
  }

  if (resumeText.trim().length > 15000) {
    throw new AppError("Resume text exceeds 15,000 characters limit. Please shorten or provide core sections.", 400);
  }

  try {
    const analysis = await aiService.analyzeResume({
      resumeText: resumeText.trim(),
      targetRole: targetRole?.trim() || "Full Stack Developer",
    });

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    throw new AppError(error.message || "AI request failed", 502);
  }
};

// C. AI Post Generator
module.exports.generatePost = async (req, res) => {
  const { topic, project, experience, concept, tone } = req.body;

  if (!topic && !project && !experience && !concept) {
    throw new AppError("Please provide at least a topic, project, concept, or learning experience", 400);
  }

  try {
    const result = await aiService.generatePostDraft({
      topic: topic?.trim(),
      project: project?.trim(),
      experience: experience?.trim(),
      concept: concept?.trim(),
      tone: tone || "Professional",
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    throw new AppError(error.message || "AI request failed", 502);
  }
};

// D. AI Post Improver
module.exports.improvePost = async (req, res) => {
  const { draft, goal, tone } = req.body;

  if (!draft || !draft.trim()) {
    throw new AppError("Draft text is required to suggest improvements", 400);
  }

  try {
    const result = await aiService.improvePostDraft({
      draft: draft.trim(),
      goal: goal || "clarity",
      tone: tone || "Professional",
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    throw new AppError(error.message || "AI request failed", 502);
  }
};

// E. AI Coding Assistant
module.exports.codeAssistant = async (req, res) => {
  const { prompt, code, language, mode } = req.body;

  if (!prompt || !prompt.trim()) {
    throw new AppError("Please provide a question or code request", 400);
  }

  if (prompt.trim().length > 4000) {
    throw new AppError("Prompt exceeds maximum length (4,000 characters)", 400);
  }

  try {
    const result = await aiService.runCodingAssistant({
      prompt: prompt.trim(),
      code: code?.trim() || "",
      language: language || "JavaScript",
      mode: mode || "explain",
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    throw new AppError(error.message || "AI request failed", 502);
  }
};

// F. AI Learning Roadmap Generator
module.exports.learningRoadmap = async (req, res) => {
  const { targetRole, currentSkills, experienceLevel, studyTime } = req.body;

  if (!targetRole || !targetRole.trim()) {
    throw new AppError("Target role is required to generate a learning roadmap", 400);
  }

  // Skills can come as an array or as a comma separated string
  let skillsList = [];
  if (Array.isArray(currentSkills)) {
    skillsList = currentSkills;
  } else if (currentSkills) {
    skillsList = currentSkills.split(",").map((skill) => skill.trim());
  }

  try {
    const roadmap = await aiService.generateLearningRoadmap({
      targetRole: targetRole.trim(),
      currentSkills: skillsList,
      experienceLevel: experienceLevel || "Beginner",
      studyTime: studyTime || "10 hours/week",
    });

    return res.status(200).json({
      success: true,
      roadmap,
    });
  } catch (error) {
    throw new AppError(error.message || "AI request failed", 502);
  }
};

// G. AI Project Description Generator
module.exports.generateProjectDescription = async (req, res) => {
  const { title, techStack, highlights } = req.body;

  if (!title || !title.trim()) {
    throw new AppError("Project title is required", 400);
  }

  // Tech stack can come as an array or as a comma separated string
  let techList = [];
  if (Array.isArray(techStack)) {
    techList = techStack;
  } else if (typeof techStack === "string") {
    techList = techStack.split(",").map((tech) => tech.trim()).filter(Boolean);
  }

  try {
    const result = await aiService.generateProjectSummary({
      title: title.trim(),
      techStack: techList,
      highlights: highlights?.trim() || "",
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    throw new AppError(error.message || "AI request failed", 502);
  }
};