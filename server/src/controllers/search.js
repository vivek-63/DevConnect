const prisma = require("../config/database");

const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(200).json({
        users: [],
        posts: [],
        projects: [],
      });
    }

    const search = q.trim();

    // =========================
    // USERS
    // =========================
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            bio: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            designation: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            college: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            skills: {
              has: search,
            },
          },
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
          select: {
            followers: true,
            following: true,
            projects: true,
          },
        },
      },

      take: 15,
    });

    // =========================
    // POSTS
    // =========================
    const posts = await prisma.post.findMany({
      where: {
        content: {
          contains: search,
          mode: "insensitive",
        },
      },

      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 15,
    });

    // =========================
    // PROJECTS
    // =========================
    const projects =
      await prisma.project.findMany({
        where: {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              techStack: {
                has: search,
              },
            },
          ],
        },

        include: {
          owner: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 15,
      });

    return res.status(200).json({
      users,
      posts,
      projects,
    });
  } catch (error) {
    console.error(
      "Global search error:",
      error
    );

    return res.status(500).json({
      message: "Search failed",
    });
  }
};

const discoverDevelopers = async (req, res) => {
  try {
    const { q, skill, college, designation } = req.query;
    const currentUserId = req.user?.id || 0;

    const filters = [];

    if (q && q.trim()) {
      const search = q.trim();
      filters.push({
        OR: [
          { username: { contains: search, mode: "insensitive" } },
          { bio: { contains: search, mode: "insensitive" } },
          { designation: { contains: search, mode: "insensitive" } },
          { college: { contains: search, mode: "insensitive" } },
          { skills: { has: search } },
        ],
      });
    }

    if (skill && skill.trim()) {
      filters.push({
        skills: {
          hasSome: skill
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        },
      });
    }

    if (college && college.trim()) {
      filters.push({
        college: { contains: college.trim(), mode: "insensitive" },
      });
    }

    if (designation && designation.trim()) {
      filters.push({
        designation: { contains: designation.trim(), mode: "insensitive" },
      });
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