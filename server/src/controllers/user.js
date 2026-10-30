const prisma = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// Cookie settings for the login token
const cookieSettings = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

const sevenDays = 7 * 24 * 60 * 60 * 1000;

// Remove the password before sending a user to the frontend
function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

// Create a login token and save it in a cookie
function setLoginCookie(res, user) {
  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, { ...cookieSettings, maxAge: sevenDays });
}

// Small user info shown inside lists (followers, following, post authors)
const smallUserFields = {
  id: true,
  username: true,
  avatar: true,
  designation: true,
};

// Counts shown on a profile
const profileCounts = {
  select: {
    followers: true,
    following: true,
    posts: true,
    projects: true,
  },
};

// Profile fields shared by "my profile" and "public profile".
// viewerId is used to check which posts the viewer has liked.
function profileSelect(viewerId) {
  return {
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
      orderBy: { createdAt: "desc" },
    },
    posts: {
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: smallUserFields },
        likes: { where: { userId: viewerId } },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    },
    followers: {
      include: {
        follower: { select: smallUserFields },
      },
    },
    following: {
      include: {
        following: { select: smallUserFields },
      },
    },
    _count: profileCounts,
  };
}

// Register a new user
module.exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide username, email, and password",
    });
  }

  // Check that the username is not taken
  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUsername) {
    return res.status(400).json({
      success: false,
      message: "Username is already taken",
    });
  }

  // Check that the email is not registered
  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    return res.status(400).json({
      success: false,
      message: "Email is already registered",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username.trim())}&background=7c3aed&color=fff&size=150`,
    },
  });

  setLoginCookie(res, newUser);

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: sanitizeUser(newUser),
  });
};

// Login with username or email
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

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  setLoginCookie(res, user);

  return res.status(200).json({
    success: true,
    message: "Logged in successfully",
    user: sanitizeUser(user),
  });
};

// Logout (remove the cookie)
module.exports.logoutUser = async (req, res) => {
  res.clearCookie("token", cookieSettings);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// Get the logged in user's basic info (/getMe)
module.exports.getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
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

// Get the logged in user's full profile (this one includes the email)
module.exports.getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      ...profileSelect(req.user.id),
      email: true,
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

// Get anyone's public profile by username (no email)
module.exports.getPublicProfile = async (req, res) => {
  const currentUserId = req.user?.id || 0;

  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
    select: profileSelect(currentUserId),
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

// Update the logged in user's profile
module.exports.updateProfile = async (req, res) => {
  const { username, bio, avatar, github, linkedin, skills, college, designation } = req.body;

  // If the username is changing, make sure nobody else has it
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

  // Only update the fields that were sent
  const dataToUpdate = {};

  if (username) {
    dataToUpdate.username = username.trim();
  }

  if (bio !== undefined) {
    dataToUpdate.bio = bio?.trim();
  }

  if (avatar !== undefined) {
    dataToUpdate.avatar = avatar?.trim();
  }

  if (github !== undefined) {
    dataToUpdate.github = github?.trim();
  }

  if (linkedin !== undefined) {
    dataToUpdate.linkedin = linkedin?.trim();
  }

  if (Array.isArray(skills)) {
    dataToUpdate.skills = skills;
  }

  if (college !== undefined) {
    dataToUpdate.college = college?.trim();
  }

  if (designation !== undefined) {
    dataToUpdate.designation = designation?.trim();
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: dataToUpdate,
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

// Get 6 newest developers to suggest (not including yourself)
module.exports.getSuggestedUsers = async (req, res) => {
  const currentUserId = req.user?.id || 0;

  const users = await prisma.user.findMany({
    where: {
      id: { not: currentUserId },
    },
    select: {
      id: true,
      username: true,
      avatar: true,
      bio: true,
      designation: true,
      skills: true,
      _count: {
        select: { followers: true, projects: true },
      },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({
    success: true,
    users,
  });
};