const prisma = require("../config/database");
const sendNotification = require("../utils/Notification");
const AppError = require("../utils/AppError");

// ===============================
// GET COMMENTS
// ===============================
module.exports.getComments = async (req, res) => {
  const postId = Number(req.params.id);

  if (Number.isNaN(postId)) {
    throw new AppError(
      "Invalid post ID",
      400
    );
  }

  const comments = await prisma.comment.findMany({
    where: {
      postId,
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
  });

  res.status(200).json({
    success: true,
    comments,
  });
};


// ===============================
// CREATE COMMENT
// ===============================
module.exports.createComment = async (req, res) => {
  const postId = Number(req.params.id);

  if (Number.isNaN(postId)) {
    throw new AppError(
      "Invalid post ID",
      400
    );
  }

  const content = req.body.content?.trim();

  if (!content) {
    throw new AppError(
      "Comment content is required",
      400
    );
  }

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },

    select: {
      id: true,
      authorId: true,
    },
  });

  if (!post) {
    throw new AppError(
      "Post not found",
      404
    );
  }

  const comment = await prisma.comment.create({
    data: {
      content,

      authorId: req.user.id,

      postId,
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
  });

  // Don't notify yourself
  if (post.authorId !== req.user.id) {
    await sendNotification({
      receiverId: post.authorId,
      senderId: req.user.id,
      type: "COMMENT_POST",
      message: "commented on your post",
    });
  }

  res.status(201).json({
    success: true,
    message: "Comment created successfully",
    comment,
  });
};


// ===============================
// DELETE COMMENT
// ===============================
module.exports.deleteComment = async (req, res) => {
  const commentId = Number(req.params.id);

  if (Number.isNaN(commentId)) {
    throw new AppError(
      "Invalid comment ID",
      400
    );
  }

  const comment =
    await prisma.comment.findUnique({
      where: {
        id: commentId,
      },

      select: {
        id: true,
        authorId: true,
      },
    });

  if (!comment) {
    throw new AppError(
      "Comment not found",
      404
    );
  }

  if (comment.authorId !== req.user.id) {
    throw new AppError(
      "You are not authorized to delete this comment",
      403
    );
  }

  await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
};