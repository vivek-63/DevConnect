const prisma = require("../config/database");
const sendNotification = require("../utils/Notification");
const AppError = require("../utils/AppError");

// ===============================
// CREATE POST
// ===============================
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
  });

  return res.status(201).json({
    success: true,
    message: "Post created successfully",
    post,
  });
};

// ===============================
// GET FEED
// ===============================
module.exports.getFeed = async (req, res) => {
  const userId = req.user?.id || 0;

  const posts = await prisma.post.findMany({
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
          userId: userId,
        },
      },
      comments: {
        take: 5,
        orderBy: {
          createdAt: "desc",
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
      },
      
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json(
    posts.map((post) => ({
      ...post,
      isSaved: (post.savedBy || []).length > 0,
    }))
  );
};

// ===============================
// GET USER'S OWN POSTS
// ===============================
module.exports.getUserPost = async (req, res) => {
  const posts = await prisma.post.findMany({
    where: {
      authorId: req.user.id,
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
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json(posts);
};

// ===============================
// GET SINGLE POST
// ===============================
module.exports.getPost = async (req, res) => {
  const postId = Number(req.params.id);

  if (Number.isNaN(postId)) {
    throw new AppError("Invalid post ID", 400);
  }

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
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
          userId: req.user?.id || 0,
        },
      },
      comments: {
        orderBy: {
          createdAt: "desc",
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
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  return res.status(200).json(post);
};

// ===============================
// UPDATE POST
// ===============================
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

  const post = await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      ...(content !== undefined ? { content: content.trim() } : {}),
      ...(image !== undefined ? { image: image?.trim() || null } : {}),
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
  });

  return res.status(200).json({
    success: true,
    message: "Post updated successfully",
    post,
  });
};

// ===============================
// DELETE POST
// ===============================
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

  // Delete comments and likes first to avoid FK constraint violations
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

// ===============================
// LIKE POST
// ===============================
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

  // Real-time notification if not own post
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

// ===============================
// UNLIKE POST
// ===============================
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

const savedPostInclude = {
  author: {
    select: {
      id: true,
      username: true,
      avatar: true,
      designation: true,
    },
  },
  likes: true,
  _count: {
    select: {
      likes: true,
      comments: true,
    },
  },
};

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

module.exports.getSavedPosts = async (req, res) => {
  const saved = await prisma.savedPost.findMany({
    where: { userId: req.user.id },
    include: {
      post: {
        include: {
          ...savedPostInclude,
          likes: {
            where: { userId: req.user.id },
          },
        },
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