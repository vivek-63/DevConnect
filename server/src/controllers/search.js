const prisma = require("../config/database");

// Case-insensitive "contains" match used in many search conditions
function matchText(text) {
  return { contains: text, mode: "insensitive" };
}

// Search users, posts and projects with one keyword
const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;

    // No keyword means nothing to search
    if (!q || !q.trim()) {
      return res.status(200).json({
        users: [],
        posts: [],
        projects: [],
      });
    }

    const search = q.trim();

    // Users: match name, bio, designation, college or skill
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: matchText(search) },
          { bio: matchText(search) },
          { designation: matchText(search) },
          { college: matchText(search) },
          { skills: { has: search } },
        ],
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        designation: true,
        college: true,
        skills: true,
        _count: {
          select: { followers: true, following: true, projects: true },
        },
      },
      take: 15,
    });

    // Posts: match the post content
    const posts = await prisma.post.findMany({
      where: { content: matchText(search) },
      include: {
        author: {
          select: { id: true, username: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    // Projects: match title, description or tech stack
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { title: matchText(search) },
          { description: matchText(search) },
          { techStack: { has: search } },
        ],
      },
      include: {
        owner: {
          select: { id: true, username: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    return res.status(200).json({
      users,
      posts,
      projects,
    });
  } catch (error) {
    console.error("Global search error:", error);
    return res.status(500).json({
      message: "Search failed",
    });
  }
};

// Find developers using a keyword and optional filters
const discoverDevelopers = async (req, res) => {
  try {
    const { q, skill, college, designation } = req.query;
    const currentUserId = req.user?.id || 0;

    // Every filter that was given gets added here
    const filters = [];

    if (q && q.trim()) {
      const search = q.trim();
      filters.push({
        OR: [
          { username: matchText(search) },
          { bio: matchText(search) },
          { designation: matchText(search) },
          { college: matchText(search) },
          { skills: { has: search } },
        ],
      });
    }

    // Skills come as a comma separated string like "react,node"
    if (skill && skill.trim()) {
      const skillList = skill
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      filters.push({
        skills: { hasSome: skillList },
      });
    }

    if (college && college.trim()) {
      filters.push({ college: matchText(college.trim()) });
    }

    if (designation && designation.trim()) {
      filters.push({ designation: matchText(designation.trim()) });
    }

    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        AND: filters,
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        designation: true,
        college: true,
        skills: true,
        github: true,
        linkedin: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
            projects: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Discover developers error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not load developers",
    });
  }
};

module.exports = {
  globalSearch,
  discoverDevelopers,
};