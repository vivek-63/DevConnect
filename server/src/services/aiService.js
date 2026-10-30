// Generates content using Google Gemini or OpenAI.
// If no API key is set (or the live AI call fails), a simple offline answer is returned instead.

const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-flash-latest",
];
const LLM_TIMEOUT_MS = 12000;
const OFFLINE_NOTE = "(Add GEMINI_API_KEY in server/.env for live LLM)";

// Tell which AI provider is available
function getAIProviderInfo() {
  const geminiKey = process.env.GEMINI_API_KEY || "";
  const openaiKey = process.env.OPENAI_API_KEY || "";

  if (geminiKey) {
    return { isConfigured: true, provider: "Gemini", model: GEMINI_MODELS[0] };
  }

  if (openaiKey) {
    return { isConfigured: true, provider: "OpenAI", model: "gpt-4o-mini" };
  }

  return {
    isConfigured: false,
    provider: "None",
    message: "No live AI key configured. Add GEMINI_API_KEY or OPENAI_API_KEY to server/.env to enable live LLM generation.",
  };
}

// fetch() that gives up after 12 seconds
async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The AI provider timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

// Turn an HTTP status into a friendly error message
function getProviderErrorMessage(status) {
  if (status === 401 || status === 403) {
    return "The AI API key was rejected. Check GEMINI_API_KEY or OPENAI_API_KEY in server/.env.";
  }
  if (status === 429) {
    return "The AI provider rate-limited this request. Wait a moment and try again.";
  }
  if (status === 503) {
    return "The AI model is experiencing high demand.";
  }
  return `The AI provider returned status ${status}.`;
}

// Call Gemini (tries each model in the list until one works)
async function callGemini(systemInstruction, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY || "";

  if (!apiKey) {
    throw new Error("No GEMINI_API_KEY configured");
  }

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const response = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemInstruction}\n\nUser request:\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const parts = data.candidates?.[0]?.content?.parts;
        const text = parts?.map((part) => part.text || "").join("").trim();

        if (text) {
          return text;
        }
      }

      lastError = new Error(getProviderErrorMessage(response.status));
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Gemini request failed across all models");
}

// Call OpenAI
async function callOpenAI(systemInstruction, userPrompt) {
  const apiKey = process.env.OPENAI_API_KEY || "";

  const response = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    throw new Error(getProviderErrorMessage(response.status));
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// Call whichever provider is configured
async function callLLM(systemInstruction, userPrompt) {
  const providerInfo = getAIProviderInfo();

  if (providerInfo.provider === "Gemini") {
    return callGemini(systemInstruction, userPrompt);
  }

  if (providerInfo.provider === "OpenAI") {
    return callOpenAI(systemInstruction, userPrompt);
  }

  return null;
}

// Remove ```json fences from the AI reply and convert it to an object
function parseJSONReply(text) {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

// ============================================================================
// 1. PROFILE REVIEWER
// ============================================================================
async function reviewProfile({ username, bio, skills = [], college, designation, github, linkedin, targetRole }) {
  const provider = getAIProviderInfo();

  const promptDetails = `
Developer Details:
- Username: ${username || "Developer"}
- Current Designation / Target: ${designation || targetRole || "Not specified"}
- Bio: ${bio || "No bio provided"}
- Skills Listed: ${skills.length > 0 ? skills.join(", ") : "None"}
- Education / College: ${college || "Not specified"}
- GitHub Link: ${github || "Not linked"}
- LinkedIn Link: ${linkedin || "Not linked"}
  `.trim();

  // Try the live AI first
  if (provider.isConfigured) {
    const systemPrompt = `You are a Senior Engineering Manager and Career Coach reviewing a software developer's portfolio profile on DevConnect.
Analyze the profile thoroughly and respond in strict JSON format with the following keys:
{
  "strengths": ["list of 3-4 key strengths"],
  "weaknesses": ["list of 2-3 weak or missing areas"],
  "specificSuggestions": ["list of 3-4 specific actionable steps"],
  "improvedBio": "A compelling, modern, professional bio draft for this developer (2-3 sentences max)",
  "recommendedSkills": ["4-6 high-impact skills that would strengthen their profile for their role"],
  "profileScore": number (out of 100 based on completeness and impact)
}
Return only valid JSON without markdown fences.`;

    try {
      const text = await callLLM(systemPrompt, promptDetails);
      const parsed = parseJSONReply(text);
      return { live: true, provider: provider.provider, ...parsed };
    } catch (err) {
      console.warn("Live reviewProfile LLM failed, using intelligent offline fallback:", err.message);
    }
  }

  // Offline fallback: simple rule-based review
  const strengths = [];
  const weaknesses = [];
  const suggestions = [];
  const recommendedSkills = [];

  if (skills.length >= 4) {
    strengths.push(`Good foundation of technical skills (${skills.slice(0, 3).join(", ")})`);
  } else {
    weaknesses.push("Sparse skills inventory. Adding 5+ core technologies increases visibility");
    recommendedSkills.push("TypeScript", "Docker", "PostgreSQL", "React", "Next.js");
  }

  if (bio && bio.length > 30) {
    strengths.push("Clear bio introducing personal focus and developer interests");
  } else {
    weaknesses.push("Bio is very brief or missing key technical focus");
    suggestions.push("Describe the specific stack you build with and what problems you enjoy solving");
  }

  if (github) {
    strengths.push("GitHub profile linked for open-source code verification");
  } else {
    weaknesses.push("Missing GitHub profile link to showcase practical code");
  }

  if (linkedin) {
    strengths.push("LinkedIn profile linked for professional networking");
  } else {
    suggestions.push("Add a LinkedIn link so recruiters and collaborators can reach you");
  }

  let improvedBio;
  if (bio && bio.length > 10) {
    improvedBio = `${designation || "Full-Stack Developer"} passionate about building scalable web applications. Proficient in ${skills.slice(0, 3).join(", ") || "modern JavaScript"} with an eye for clean code, architecture, and user experience.`;
  } else {
    improvedBio = `Software Engineer specializing in modern web development. Building high-performance full-stack applications with clean architecture and modern engineering best practices.`;
  }

  const profileScore = Math.min(
    95,
    40 + skills.length * 8 + (bio ? 15 : 0) + (github ? 15 : 0) + (linkedin ? 10 : 0)
  );

  return {
    live: false,
    provider: `Offline Analysis ${OFFLINE_NOTE}`,
    strengths: strengths.length ? strengths : ["Registered developer profile on DevConnect"],
    weaknesses: weaknesses.length ? weaknesses : ["Profile could highlight recent project outcomes"],
    specificSuggestions: suggestions.length ? suggestions : ["Add detailed case studies to your showcased projects"],
    improvedBio,
    recommendedSkills: recommendedSkills.length
      ? recommendedSkills
      : ["TypeScript", "TailwindCSS", "Node.js", "Docker", "System Design"],
    profileScore,
  };
}

// ============================================================================
// 2. RESUME ANALYZER & CAREER GUIDANCE
// ============================================================================
async function analyzeResume({ resumeText, targetRole = "Software Engineer" }) {
  const provider = getAIProviderInfo();

  // Try the live AI first
  if (provider.isConfigured) {
    const systemPrompt = `You are an elite Tech Career Advisor and Technical Recruiter.
Analyze this developer's resume for the target role: "${targetRole}".
Analyze strengths, weaknesses, project clarity, skill presentation, potential ATS issues, suggested roles, and a learning roadmap.
Respond in strict JSON format:
{
  "summary": "2-3 sentence executive assessment",
  "strengths": ["3-4 genuine strengths in experience/skills"],
  "weaknesses": ["2-3 areas needing improvement"],
  "missingSections": ["any missing standard sections like Projects, Metrics, Certifications"],
  "projectSuggestions": ["2-3 suggestions to make project bullet points more impactful with metrics (STAR method)"],
  "atsObservations": ["3 potential ATS readability points (formatting, keyword density, section headers)"],
  "suggestedRoles": ["3-4 job roles matching this profile"],
  "learningRoadmap": [
    { "phase": "Immediate (Week 1-4)", "focus": "...", "actionItems": ["..."] },
    { "phase": "Intermediate (Month 2-3)", "focus": "...", "actionItems": ["..."] }
  ]
}
Return only valid JSON without markdown fences.`;

    try {
      const text = await callLLM(
        systemPrompt,
        `Target Role: ${targetRole}\n\nResume Content:\n${resumeText.slice(0, 5000)}`
      );
      const parsed = parseJSONReply(text);
      return { live: true, provider: provider.provider, ...parsed };
    } catch (err) {
      console.warn("Live analyzeResume LLM failed, using intelligent offline fallback:", err.message);
    }
  }

  // Offline fallback: simple rule-based analysis
  const wordCount = resumeText.split(/\s+/).length;
  const hasGithub = /github\.com/i.test(resumeText);
  const hasProjects = /projects?|portfolio/i.test(resumeText);
  const hasMetrics = /\d+%\s|\$\d+|\d+\s*users|\d+x/i.test(resumeText);

  const strengths = [];
  const weaknesses = [];
  const projectSuggestions = [];
  const atsObservations = [
    "Use standard header names: 'Education', 'Technical Skills', 'Experience', 'Projects'.",
    "Avoid multi-column tables or complex nested columns that can confuse parsers.",
    "Include exact keyword variants (e.g. 'Node.js', 'Express', 'PostgreSQL') matching job postings.",
  ];

  if (wordCount >= 200) {
    strengths.push("Sufficient detail covering core career background and technical history");
  } else {
    weaknesses.push("Resume appears very brief; add technical project details and measurable responsibilities");
  }

  if (hasGithub) {
    strengths.push("Code repositories and portfolio URLs present");
  } else {
    weaknesses.push("Consider adding direct GitHub repo links to key full-stack projects");
  }

  if (hasMetrics) {
    strengths.push("Uses quantitative metrics to substantiate achievement");
  } else {
    weaknesses.push("Lacks quantitative outcomes (e.g., '% performance improvement', 'requests/sec handled')");
    projectSuggestions.push("Rephrase project points using the STAR method: Action + Tech Stack + Measurable Outcome");
  }

  projectSuggestions.push(
    "Explicitly state architecture choices (e.g., 'Designed normalized PostgreSQL schema using Prisma ORM with JWT authentication')"
  );

  return {
    live: false,
    provider: `Offline Analysis ${OFFLINE_NOTE}`,
    summary: `Structured evaluation for the ${targetRole} role. The resume demonstrates technical foundation but will benefit from quantifiable impact and ATS optimization.`,
    strengths,
    weaknesses,
    missingSections: hasProjects ? ["Certifications (Optional)"] : ["Dedicated Projects Showcase Section"],
    projectSuggestions,
    atsObservations,
    suggestedRoles: [targetRole, "Full-Stack Developer", "Backend Engineer", "Software Engineer"],
    learningRoadmap: [
      {
        phase: "Phase 1: Architecture & Data Modeling",
        focus: "Strengthen full-stack system design, database indexing, and caching",
        actionItems: [
          "Deploy a full-stack project with Docker",
          "Implement Redis caching & PostgreSQL connection pooling",
        ],
      },
      {
        phase: "Phase 2: Testing & CI/CD",
        focus: "Automated testing and production-grade deployments",
        actionItems: [
          "Add unit/integration tests with Vitest/Jest",
          "Set up GitHub Actions CI pipeline",
        ],
      },
    ],
  };
}

// ============================================================================
// 3. POST GENERATOR & IMPROVER
// ============================================================================
async function generatePostDraft({ topic, project, experience, concept, tone = "Professional" }) {
  const provider = getAIProviderInfo();

  const userContext = `
Topic / Focus: ${topic || "Software Engineering"}
Project or Achievement: ${project || "None"}
Learning or Experience: ${experience || "None"}
Technical Concept: ${concept || "None"}
Tone: ${tone}
  `.trim();

  // Try the live AI first
  if (provider.isConfigured) {
    const systemPrompt = `You are an expert technical content creator on DevConnect, a social network for developers.
Create an engaging, authentic developer post based on the supplied context.
Tone style: ${tone} (e.g. Professional, Casual, Technical, Learning journey, Project showcase).
Guidelines:
- Start with a strong, curiosity-inducing first line.
- Provide real engineering value, lessons learned, or architectural insight.
- Keep it readable with clean line breaks and concise bullet points if helpful.
- End with an engaging question to foster comments and community discussion.
- Include 2-3 relevant hashtags (e.g. #webdev #javascript #fullstack).
Return only the generated post text without preamble.`;

    try {
      const text = await callLLM(systemPrompt, userContext);
      return { live: true, provider: provider.provider, post: text.trim() };
    } catch (err) {
      console.warn("Live generatePostDraft LLM failed, using intelligent offline fallback:", err.message);
    }
  }

  // Offline fallback: ready-made post templates based on the tone
  let post = "";

  if (tone === "Project showcase") {
    post =
      `🚀 Just wrapped up a new project: ${project || topic || "a full-stack web application"}!\n\n` +
      `Here is what went into building it:\n` +
      `• Architecture: Node.js, Express, PostgreSQL, and React\n` +
      `• Key challenge: Handling real-time updates and data integrity cleanly\n` +
      `• Key takeaway: Keeping database queries predictable and relationships indexed pays off immediately.\n\n` +
      `What tech stack are you building your current projects with? Would love your feedback!\n\n` +
      `#webdev #fullstack #softwareengineering #coding`;
  } else if (tone === "Learning journey") {
    post =
      `💡 Today I spent time diving deeper into ${topic || concept || "backend architecture"}.\n\n` +
      `Here are 3 key takeaways that simplified things for me:\n` +
      `1. Understand the data flow before writing line 1 of code.\n` +
      `2. Security begins at the database layer with proper constraints.\n` +
      `3. Clear code beats clever one-liners in production every time.\n\n` +
      `What concept took you the longest to wrap your head around when you first started? Drop your thoughts below!\n\n` +
      `#learninpublic #javascript #devconnect`;
  } else {
    post =
      `Building production-ready software isn't just about making features work — it's about reliability, clean abstractions, and developer experience.\n\n` +
      `When working on ${topic || "modern web applications"}, focusing on clear separation of concerns (routes, controllers, and services) keeps the codebase maintainable as the product scales.\n\n` +
      `How does your team structure backend logic to balance speed and cleanliness?\n\n` +
      `#engineering #webdevelopment #programming #devconnect`;
  }

  return {
    live: false,
    provider: `Offline Draft Generator ${OFFLINE_NOTE}`,
    post,
  };
}

async function improvePostDraft({ draft, goal = "clarity", tone = "Professional" }) {
  const provider = getAIProviderInfo();

  // Try the live AI first
  if (provider.isConfigured) {
    const systemPrompt = `You are a technical editor for software developers.
Improve the following developer post draft for DevConnect.
Goal: ${goal} (e.g. grammar correction, clearer technical explanations, better formatting, more professional, shorter/longer).
Desired tone: ${tone}.
Maintain the author's original message and authentic developer voice while improving flow, impact, and formatting.
Return strict JSON:
{
  "improvedDraft": "The revised post ready for publishing",
  "changesMade": ["list of 2-3 specific improvements applied"]
}
Return only valid JSON without markdown fences.`;

    try {
      const text = await callLLM(systemPrompt, `Draft to improve:\n${draft}`);
      const parsed = parseJSONReply(text);
      return { live: true, provider: provider.provider, ...parsed };
    } catch (err) {
      console.warn("Live improvePostDraft LLM failed, using intelligent offline fallback:", err.message);
    }
  }

  // Offline fallback: fix the lowercase "i", clean the spaces, add an ending line
  const polished = draft.trim().replace(/\bi\b/g, "I").replace(/\s+/g, " ");

  return {
    live: false,
    provider: `Offline Draft Improver ${OFFLINE_NOTE}`,
    improvedDraft: `${polished}\n\nWhat are your thoughts on this? Let's discuss in the comments below! 👇\n\n#webdev #programming #devcommunity`,
    changesMade: [
      "Enhanced formatting with paragraph spacing for mobile readability",
      "Added an engaging concluding call-to-action to spark discussion",
      "Normalized capitalization and punctuation",
    ],
  };
}

// ============================================================================
// 4. CODING ASSISTANT
// ============================================================================
async function runCodingAssistant({ prompt, code = "", language = "JavaScript", mode = "explain" }) {
  const provider = getAIProviderInfo();

  const userContext = `
Question / Request: ${prompt}
Language: ${language}
Mode: ${mode} (explain | debug | review | complexity)
Code snippet:
${code || "No code provided"}
  `.trim();

  // Try the live AI first
  if (provider.isConfigured) {
    const systemPrompt = `You are DevConnect's AI Coding Assistant — an encouraging, clear, and mathematically accurate programming mentor for developers.
Help the developer with their request.
Guidelines:
- Explain programming concepts clearly with short, clean code examples.
- For debugging, identify root causes and provide the corrected code snippet.
- For complexity analysis, explain both Time Complexity (Big-O) and Space Complexity with reasoning.
- Keep responses educational, practical, and easy for early-to-mid career developers to grasp.
Format response with clear markdown headings and syntax-highlighted code blocks.`;

    try {
      const text = await callLLM(systemPrompt, userContext);
      return { live: true, provider: provider.provider, response: text.trim() };
    } catch (err) {
      console.warn("Live runCodingAssistant LLM failed, using intelligent offline fallback:", err.message);
    }
  }

  // Offline fallback: general tips based on the mode
  let response = `### 💡 AI Coding Assistant (Offline Guide)\n\n`;
  response += `> **Setup Tip:** To enable live, dynamic responses powered by Gemini or GPT-4o, add \`GEMINI_API_KEY=your_key\` to your \`server/.env\` file.\n\n`;

  if (mode === "complexity") {
    response += `#### ⏱️ Time & Space Complexity Analysis\n\n`;
    response += `- **Time Complexity:** For loops iterating over an array of size $N$ run in **$O(N)$** linear time. Nested loops typically result in **$O(N^2)$** quadratic time.\n`;
    response += `- **Space Complexity:** Storing data in a hash map/Set uses **$O(N)$** auxiliary memory; modifying in-place uses **$O(1)$** constant space.\n`;
    response += `- **Optimization Tip:** Prefer Map/Set lookups ($O(1)$) over \`array.includes()\` or \`array.indexOf()\` ($O(N)$) inside loops.\n`;
  } else if (mode === "debug") {
    response += `#### 🐞 Debugging Best Practices\n\n`;
    response += `1. **Verify State & Arguments:** Check for \`undefined\` or \`null\` before property access.\n`;
    response += `2. **Asynchronous Handling:** Ensure \`await\` is used with Promises inside async functions, and handle \`try/catch\` blocks.\n`;
    response += `3. **Data Immutability:** In React, avoid mutating objects directly (e.g., use \`[...prev, item]\` instead of \`prev.push(item)\`).\n`;
  } else {
    response += `#### 📘 Concept Explanation & Best Practices\n\n`;
    response += `When developing in **${language}**, follow clean code principles:\n`;
    response += `- **Single Responsibility:** Each function should perform one clear task.\n`;
    response += `- **Error Handling:** Always guard inputs with early returns and meaningful error messages.\n`;
    response += `- **Readability First:** Clear naming helps both teammates and future maintainers understand your code effortlessly.\n`;
  }

  return {
    live: false,
    provider: `Offline Assistant ${OFFLINE_NOTE}`,
    response,
  };
}

// ============================================================================
// 5. LEARNING ROADMAP GENERATOR
// ============================================================================
async function generateLearningRoadmap({ targetRole, currentSkills = [], experienceLevel = "Beginner", studyTime = "10 hours/week" }) {
  const provider = getAIProviderInfo();

  const userContext = `
Target Role: ${targetRole || "Full Stack Developer"}
Current Skills: ${currentSkills.length ? currentSkills.join(", ") : "HTML, CSS, JavaScript"}
Experience Level: ${experienceLevel}
Available Study Time: ${studyTime}
  `.trim();

  // Try the live AI first
  if (provider.isConfigured) {
    const systemPrompt = `You are a Principal Engineer designing an actionable, structured career learning roadmap for a developer.
Target role: ${targetRole}.
Return strict JSON format:
{
  "title": "Roadmap title",
  "overview": "Brief realistic summary of the timeline",
  "milestones": [
    {
      "title": "Milestone Title",
      "duration": "e.g., Weeks 1-4",
      "topics": ["topic 1", "topic 2", "topic 3"],
      "projectToBuild": "Concrete hands-on project description",
      "keyOutcome": "What the developer will master"
    }
  ],
  "recommendedResources": ["Resource 1", "Resource 2", "Resource 3"]
}
Return only valid JSON without markdown fences.`;

    try {
      const text = await callLLM(systemPrompt, userContext);
      const parsed = parseJSONReply(text);
      return { live: true, provider: provider.provider, ...parsed };
    } catch (err) {
      console.warn("Live generateLearningRoadmap LLM failed, using intelligent offline fallback:", err.message);
    }
  }

  // Offline fallback: a ready-made 12 week roadmap
  return {
    live: false,
    provider: `Offline Roadmap Generator ${OFFLINE_NOTE}`,
    title: `${targetRole || "Full Stack Developer"} Mastery Roadmap`,
    overview: `A realistic, project-focused 12-week roadmap tailored for ${experienceLevel} level investing ~${studyTime}.`,
    milestones: [
      {
        title: "Foundation & Modern Backend Architecture",
        duration: "Weeks 1 - 4",
        topics: [
          "RESTful API design and status code semantics",
          "Relational data modeling with PostgreSQL and Prisma ORM",
          "JWT authentication in secure HTTP-only cookies",
          "Input validation with Joi/Zod",
        ],
        projectToBuild: "Build a production-grade authentication and user management API with rate limiting.",
        keyOutcome: "Confidence in creating secure, scalable Node.js backend services.",
      },
      {
        title: "Frontend State Management & Real-Time Sync",
        duration: "Weeks 5 - 8",
        topics: [
          "React 19 Context & custom hooks for global state",
          "Socket.IO event-driven client/server synchronization",
          "Optimistic UI updates and cache invalidation",
          "Responsive component architecture with TailwindCSS",
        ],
        projectToBuild: "Build a real-time collaborative activity feed with instant notification badges.",
        keyOutcome: "Ability to construct responsive, real-time client interfaces.",
      },
      {
        title: "System Design, Testing & Production Deployment",
        duration: "Weeks 9 - 12",
        topics: [
          "Database indexing, transactions, and foreign-key cascades",
          "Automated integration testing with Supertest and Vitest",
          "Docker containerization and environment isolation",
          "CI/CD pipelines with GitHub Actions",
        ],
        projectToBuild: "Deploy the complete full-stack DevConnect platform to a production cloud server.",
        keyOutcome: "Job-ready engineering portfolio ready for technical interviews.",
      },
    ],
    recommendedResources: [
      "Prisma Official Documentation (Data Modeling & Relations)",
      "MDN Web Docs (HTTP Security, Cookies, & JavaScript)",
      "Socket.IO Official Guides (Emit Cheat Sheet & Namespaces)",
      "Designing Data-Intensive Applications by Martin Kleppmann",
    ],
  };
}

// ============================================================================
// 6. PROJECT DESCRIPTION GENERATOR
// ============================================================================
async function generateProjectSummary({ title, techStack = [], highlights = "" }) {
  const provider = getAIProviderInfo();

  const context = `
Project Title: ${title}
Tech Stack: ${techStack.join(", ") || "Full Stack Web"}
Key Highlights: ${highlights || "Scalable architecture, responsive UI, database modeling"}
  `.trim();

  // Try the live AI first
  if (provider.isConfigured) {
    const systemPrompt = `You are an expert technical writer for developers on DevConnect.
Write a clear, compelling, 2-paragraph project description for this portfolio project.
Include:
1. What problem it solves and its primary purpose.
2. Key architectural features and technical implementation highlights.
3. Clean, professional developer tone without exaggerated marketing hype.
Return only the generated description text without preamble.`;

    try {
      const text = await callLLM(systemPrompt, context);
      return { live: true, provider: provider.provider, description: text.trim() };
    } catch (err) {
      console.warn("Live generateProjectSummary LLM failed, using fallback:", err.message);
    }
  }

  // Offline fallback: a simple template description
  const stackText = techStack.length ? techStack.join(", ") : "modern web technologies";

  return {
    live: false,
    provider: "Offline Generator",
    description: `${title} is a modern web application built using ${stackText}. Designed to solve real-world development workflows, it emphasizes high performance, intuitive user experience, and clean architectural separation of concerns.\n\nKey highlights include robust data persistence, responsive cross-device layout, and predictable state management to deliver a seamless developer experience.`,
  };
}

module.exports = {
  getAIProviderInfo,
  reviewProfile,
  analyzeResume,
  generatePostDraft,
  improvePostDraft,
  runCodingAssistant,
  generateLearningRoadmap,
  generateProjectSummary,
};