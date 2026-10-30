const prisma = require("../config/database");
const sendNotification = require("../utils/Notification");
const AppError = require("../utils/AppError");

// Author fields we send with every post
const authorFields = {
  id: true,
  username: true,
  avatar: true,
  designation: true,
};

// Author fields we send with every comment
const commentAuthorFields = {
  id: true,
  username: true,
  avatar: true,
};

// The extra data we attach to a post: author, whether this user liked it, and counts
function postInclude(userId) {
  return {
    author: { select: authorFields },
    likes: { where: { userId } },
    _count: {
      select: { likes: true, comments: true },
    },
  };
}

// Create a new post
module.exports.createPost = async (req, res) => {
  const { content, image } = req.body;

  if (!content || !content.trim()) {
    throw new AppError("Post content cannot be empty", 400);
  }

  const post = await prisma.post.create({
    data: {
      content: content.trim(),
      image: image?.trim() || null,
      authorId: req.user.id,
    },
    include: postInclude(req.user.id),
  });

  return res.status(201).json({
    success: true,
    message: "Post created successfully",
    post,
  });
};

// Get the feed (latest posts first, with the 5 newest comments of each)
module.exports.getFeed = async (req, res) => {
  const userId = req.user?.id || 0;

  const posts = await prisma.post.findMany({
    include: {
      ...postInclude(userId),
      comments: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: commentAuthorFields },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json(
    posts.map((post) => ({
      ...post,
      isSaved: (post.savedBy || []).length > 0,
    }))
  );
};

// Get the logged in user's own posts
module.exports.getUserPost = async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { authorId: req.user.id },
    include: postInclude(req.user.id),
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json(posts);
};

// Get a single post with all its comments
module.exports.getPost = async (req, res) => {
  const postId = Number(req.params.id);

  if (Number.isNaN(postId)) {
    throw new AppError("Invalid post ID", 400);
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      ...postInclude(req.user?.id || 0),
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: commentAuthorFields },
        },
      },
    },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  return res.status(200).json(post);
};

// Update a post (only the owner can do this)
module.exports.updatePost = async (req, res) => {
  const postId = Number(req.params.id);

  if (Number.isNaN(postId)) {
    throw new AppError("Invalid post ID", 400);
  }

  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });

  if (!existingPost) {
    throw new AppError("Post not found", 404);
  }

  if (existingPost.authorId !== req.user.id) {
    throw new AppError("You are not authorized to update this post", 403);
  }

  const { content, image } = req.body;

  // Only update the fields that were sent
  const dataToUpdate = {};

  if (content !== undefined) {
    dataToUpdate.content = content.trim();
  }

  if (image !== undefined) {
    dataToUpdate.image = image?.trim() || null;
  }

  const post = await prisma.post.update({
    where: { id: postId },
    data: dataToUpdate,
    include: postInclude(req.user.id),
  });

  return res.status(200).json({
    success: true,
    message: "Post updated successfully",
    post,
  });
};

// Delete a post (only the owner can do this)
module.exports.deletePost = async (req, res) => {
  const postId = Number(req.params.id);

  if (Number.isNaN(postId)) {
    throw new AppError("Invalid post ID", 400);
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (post.authorId !== req.user.id) {
    throw new AppError("You are not authorized to delete this post", 403);
  }

  // Delete comments and likes first, then the post itself
  await prisma.$transaction([
    prisma.comment.deleteMany({ where: { postId } }),
    prisma.like.deleteMany({ where: { postId } }),
    prisma.post.delete({ where: { id: postId } }),
  ]);

  return res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
};

// Like a post
module.exports.likePost = async (req, res) => {
  const postId = Number(req.params.id);

  if (Number.isNaN(postId)) {
    throw new AppError("Invalid post ID", 400);
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  // Check if the user already liked this post
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: req.user.id,
        postId,
      },
    },
  });

  if (existingLike) {
    return res.status(200).json({
      success: true,
      message: "Post already liked",
      like: existingLike,
    });
  }

  const like = await prisma.like.create({
    data: {
      userId: req.user.id,
      postId,
    },
  });

  // Notify the post owner (but not if they liked their own post)
  if (post.authorId !== req.user.id) {
    await sendNotification({
      receiverId: post.authorId,
      senderId: req.user.id,
      type: "LIKE_POST",
      message: "liked your post",
    });
  }

  return res.status(201).json({
    success: true,
    message: "Post liked successfully",
    like,
  });
};

// Unlike a post
module.exports.unlikePost = async (req, res) => {
  const postId = Number(req.params.id);

  if (Number.isNaN(postId)) {
    throw new AppError("Invalid post ID", 400);
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: req.user.id,
        postId,
      },
    },
  });

  if (!existingLike) {
    return res.status(200).json({
      success: true,
      message: "Post was not liked",
    });
  }

  await prisma.like.delete({
    where: {
      userId_postId: {
        userId: req.user.id,
        postId,
      },
    },
  });

  return res.status(200).json({
    success: true,
    message: "Post unliked successfully",
  });
};

// Save a post
module.exports.savePost = async (req, res) => {
  const postId = Number(req.params.id);

  if (Number.isNaN(postId)) {
    throw new AppError("Invalid post ID", 400);
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  // upsert = create it, or do nothing if it already exists
  const saved = await prisma.savedPost.upsert({
    where: {
      userId_postId: {
        userId: req.user.id,
        postId,
      },
    },
    update: {},
    create: {
      userId: req.user.id,
      postId,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Post saved",
    saved,
  });
};

// Remove a post from saved
module.exports.unsavePost = async (req, res) => {
  const postId = Number(req.params.id);

  if (Number.isNaN(postId)) {
    throw new AppError("Invalid post ID", 400);
  }

  await prisma.savedPost.deleteMany({
    where: {
      userId: req.user.id,
      postId,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Post removed from saved",
  });
};

// Get all posts saved by the logged in user
module.exports.getSavedPosts = async (req, res) => {
  const saved = await prisma.savedPost.findMany({
    where: { userId: req.user.id },
    include: {
      post: {
        include: postInclude(req.user.id),
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({
    success: true,
    posts: saved.map((item) => ({
      ...item.post,
      isSaved: true,
    })),
  });
};