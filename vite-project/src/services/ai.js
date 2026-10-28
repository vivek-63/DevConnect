// vite-project/src/services/ai.js
import { api } from "./auth";

export const getAIStatus = async () => {
  try {
    const res = await api.get("/ai/status");
    return res.data;
  } catch (err) {
    console.error("AI Status error:", err);
    return { isConfigured: false, provider: "None" };
  }
};

export const reviewProfile = async (targetRole = "") => {
  try {
    const res = await api.post("/ai/profile-review", { targetRole });
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || "Failed to review profile";
    throw new Error(message);
  }
};

export const analyzeResume = async ({ resumeText, targetRole }) => {
  try {
    const res = await api.post("/ai/resume-analyzer", { resumeText, targetRole });
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || "Failed to analyze resume";
    throw new Error(message);
  }
};

export const generatePostDraft = async ({ topic, project, experience, concept, tone }) => {
  try {
    const res = await api.post("/ai/generate-post", { topic, project, experience, concept, tone });
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || "Failed to generate post";
    throw new Error(message);
  }
};

export const improvePostDraft = async ({ draft, goal, tone }) => {
  try {
    const res = await api.post("/ai/improve-post", { draft, goal, tone });
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || "Failed to improve post draft";
    throw new Error(message);
  }
};

export const askCodeAssistant = async ({ prompt, code, language, mode }) => {
  try {
    const res = await api.post("/ai/code-assistant", { prompt, code, language, mode });
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || "Failed to get coding assistant response";
    throw new Error(message);
  }
};

export const generateRoadmap = async ({ targetRole, currentSkills, experienceLevel, studyTime }) => {
  try {
    const res = await api.post("/ai/learning-roadmap", {
      targetRole,
      currentSkills,
      experienceLevel,
      studyTime,
    });
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || "Failed to generate learning roadmap";
    throw new Error(message);
  }
};

export const generateProjectDescription = async ({ title, techStack, highlights }) => {
  try {
    const res = await api.post("/ai/project-description", { title, techStack, highlights });
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || "Failed to generate project description";
    throw new Error(message);
  }
};

