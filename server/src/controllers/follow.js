const prisma = require("../config/database");
const sendNotification = require("../utils/Notification");
const AppError = require("../utils/AppError");

// ===============================
// FOLLOW USER
// ===============================
module.exports.followUser = async (req, res) => {
  const targetUserId = Number(req.params.id);

  if (Number.isNaN(targetUserId)) {
    throw new AppError("Invalid user ID", 400);
  }

  if (targetUserId === req.user.id) {
    throw new AppError("You cannot follow yourself", 400);
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, username: true },
  });

  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: req.user.id,
        followingId: targetUserId,
      },
    },
  });

  if (existingFollow) {
    return res.status(200).json({
      success: true,
      message: "You already follow this user",
      follow: existingFollow,
    });
  }

  const follow = await prisma.follow.create({
    data: {
      followerId: req.user.id,
      followingId: targetUserId,
    },
  });

  await sendNotification({
    receiverId: targetUserId,
    senderId: req.user.id,
    type: "FOLLOW",
    message: "started following you",
  });

  return res.status(201).json({
    success: true,
    message: "User followed successfully",
    follow,
  });
};

// ===============================
// UNFOLLOW USER
// ===============================
module.exports.unfollowUser = async (req, res) => {
  const targetUserId = Number(req.params.id);

  if (Number.isNaN(targetUserId)) {
    throw new AppError("Invalid user ID", 400);
  }

  if (targetUserId === req.user.id) {
    throw new AppError("Invalid follow operation", 400);
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: req.user.id,
        followingId: targetUserId,
      },
    },
  });

  if (!existingFollow) {
    return res.status(200).json({
      success: true,
      message: "You are not following this user",
    });
  }

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId: req.user.id,
        followingId: targetUserId,
      },
    },
  });

  return res.status(200).json({
    success: true,
    message: "User unfollowed successfully",
  });
};

// ===============================
// CHECK FOLLOW STATUS
// ===============================
module.exports.checkFollowStatus = async (req, res) => {
  const targetUserId = Number(req.params.id);

  if (Number.isNaN(targetUserId)) {
    throw new AppError("Invalid user ID", 400);
  }

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: req.user.id,
        followingId: targetUserId,
      },
    },
  });

  return res.status(200).json({
    success: true,
    isFollowing: !!follow,
  });
};

// ===============================
// GET FOLLOWERS OF A USER
// ===============================
module.exports.getFollowers = async (req, res) => {
  const userId = Number(req.params.id || req.user.id);

  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          avatar: true,
          bio: true,
          designation: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({
    success: true,
    followers: followers.map((f) => f.follower),
  });
};

// ===============================
// GET FOLLOWING OF A USER
// ===============================
module.exports.getFollowing = async (req, res) => {
  const userId = Number(req.params.id || req.user.id);

  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          avatar: true,
          bio: true,
          designation: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({
    success: true,
    following: following.map((f) => f.following),
  });
};