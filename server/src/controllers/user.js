const prisma = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

// ===============================
// REGISTER USER
// ===============================
module.exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide username, email, and password",
    });
  }

  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUsername) {
    return res.status(400).json({
      success: false,
      message: "Username is already taken",
    });
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    return res.status(400).json({
      success: false,
      message: "Email is already registered",
    });
  }

  const hash = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hash,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username.trim())}&background=7c3aed&color=fff&size=150`,
    },
  });

  const token = jwt.sign(
    { id: newUser.id, username: newUser.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: sanitizeUser(newUser),
  });
};

// ===============================
// LOGIN USER
// ===============================
module.exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide username/email and password",
    });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: username.trim() },
        { email: username.trim().toLowerCase() },
      ],
    },
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const isPasswordVerified = await bcrypt.compare(password, user.password);

  if (!isPasswordVerified) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "Logged in successfully",
    user: sanitizeUser(user),
  });
};

// ===============================
// LOGOUT USER
// ===============================
module.exports.logoutUser = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// ===============================
// GET CURRENT USER (/getMe)
// ===============================
module.exports.getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      avatar: true,
      github: true,
      linkedin: true,
      skills: true,
      college: true,
      designation: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
          projects: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    user,
  });
};

// ===============================
// GET PROFILE (MY FULL PROFILE)
// ===============================
module.exports.getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      avatar: true,
      github: true,
      linkedin: true,
      skills: true,
      college: true,
      designation: true,
      role: true,
      createdAt: true,
      projects: {
        orderBy: {
          createdAt: "desc",
        },
      },
      posts: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
              designation: true,
            },
          },
          likes: {
            where: {
              userId: req.user.id,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      },
      followers: {
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              avatar: true,
              designation: true,
            },
          },
        },
      },
      following: {
        include: {
          following: {
            select: {
              id: true,
              username: true,
              avatar: true,
              designation: true,
            },
          },
        },
      },
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
          projects: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    user,
  });
};

// ===============================
// GET PUBLIC PROFILE
// ===============================
module.exports.getPublicProfile = async (req, res) => {
  const currentUserId = req.user?.id || 0;

  const user = await prisma.user.findUnique({
    where: {
      username: req.params.username,
    },
    select: {
      id: true,
      username: true,
      bio: true,
      avatar: true,
      github: true,
      linkedin: true,
      skills: true,
      college: true,
      designation: true,
      role: true,
      createdAt: true,
      projects: {
        orderBy: {
          createdAt: "desc",
        },
      },
      posts: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
              designation: true,
            },
          },
          likes: {
            where: {
              userId: currentUserId,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      },
      followers: {
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              avatar: true,
              designation: true,
            },
          },
        },
      },
      following: {
        include: {
          following: {
            select: {
              id: true,
              username: true,
              avatar: true,
              designation: true,
            },
          },
        },
      },
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
          projects: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    user,
  });
};

// ===============================
// UPDATE PROFILE
// ===============================
module.exports.updateProfile = async (req, res) => {
  const {
    username,
    bio,
    avatar,
    github,
    linkedin,
    skills,
    college,
    designation,
  } = req.body;

  // Check username uniqueness if changed
  if (username && username.trim() !== req.user.username) {
    const existing = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (existing && existing.id !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Username is already taken",
      });
    }
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      ...(username ? { username: username.trim() } : {}),
      ...(bio !== undefined ? { bio: bio?.trim() } : {}),
      ...(avatar !== undefined ? { avatar: avatar?.trim() } : {}),
      ...(github !== undefined ? { github: github?.trim() } : {}),
      ...(linkedin !== undefined ? { linkedin: linkedin?.trim() } : {}),
      ...(Array.isArray(skills) ? { skills } : {}),
      ...(college !== undefined ? { college: college?.trim() } : {}),
      ...(designation !== undefined ? { designation: designation?.trim() } : {}),
    },
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      avatar: true,
      github: true,
      linkedin: true,
      skills: true,
      college: true,
      designation: true,
      role: true,
      createdAt: true,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: updatedUser,
  });
};

// ===============================
// GET SUGGESTED DEVELOPERS
// ===============================
module.exports.getSuggestedUsers = async (req, res) => {
  const currentUserId = req.user?.id || 0;

  const users = await prisma.user.findMany({
    where: {
      id: {
        not: currentUserId,
      },
    },
    select: {
      id: true,
      username: true,
      avatar: true,
      bio: true,
      designation: true,
      skills: true,
      _count: {
        select: {
          followers: true,
          projects: true,
        },
      },
    },
    take: 6,
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({
    success: true,
    users,
  });
};
