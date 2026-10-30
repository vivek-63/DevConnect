const prisma = require("../config/database");
const sendNotification = require("../utils/Notification");
const AppError = require("../utils/AppError");

// The user fields we send for follower / following lists
const userFields = {
  id: true,
  username: true,
  avatar: true,
  bio: true,
  designation: true,
};

// Follow a user
module.exports.followUser = async (req, res) => {
  const myId = req.user.id;
  const targetUserId = Number(req.params.id);

  if (Number.isNaN(targetUserId)) {
    throw new AppError("Invalid user ID", 400);
  }

  if (targetUserId === myId) {
    throw new AppError("You cannot follow yourself", 400);
  }

  // Check that the user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, username: true },
  });

  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: myId,
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
      followerId: myId,
      followingId: targetUserId,
    },
  });

  // Let the other user know
  await sendNotification({
    receiverId: targetUserId,
    senderId: myId,
    type: "FOLLOW",
    message: "started following you",
  });

  return res.status(201).json({
    success: true,
    message: "User followed successfully",
    follow,
  });
};

// Unfollow a user
module.exports.unfollowUser = async (req, res) => {
  const myId = req.user.id;
  const targetUserId = Number(req.params.id);

  if (Number.isNaN(targetUserId)) {
    throw new AppError("Invalid user ID", 400);
  }

  if (targetUserId === myId) {
    throw new AppError("Invalid follow operation", 400);
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: myId,
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
        followerId: myId,
        followingId: targetUserId,
      },
    },
  });

  return res.status(200).json({
    success: true,
    message: "User unfollowed successfully",
  });
};

// Check if the logged in user follows a user
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

// Get the followers of a user (own followers if no id is given)
module.exports.getFollowers = async (req, res) => {
  const userId = Number(req.params.id || req.user.id);

  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: { select: userFields },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({
    success: true,
    followers: followers.map((item) => item.follower),
  });
};

// Get the list of people a user is following (own list if no id is given)
module.exports.getFollowing = async (req, res) => {
  const userId = Number(req.params.id || req.user.id);

  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: { select: userFields },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({
    success: true,
    following: following.map((item) => item.following),
  });
};