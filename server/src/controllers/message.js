const prisma = require("../config/database");
const sendMessage = require("../utils/Message");
const AppError = require("../utils/AppError");

// Find the conversation, but only if the user is part of it
async function findMyConversation(conversationId, userId) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
  });

  if (!conversation) {
    throw new AppError("You are not a participant in this conversation", 403);
  }

  return conversation;
}

// Send a new message
module.exports.createMessage = async (req, res) => {
  const { conversationId, content } = req.body;
  const senderId = req.user.id;

  const parsedConversationId = Number(conversationId);

  if (Number.isNaN(parsedConversationId)) {
    throw new AppError("Invalid conversation ID", 400);
  }

  if (!content || !content.trim()) {
    throw new AppError("Message content is required", 400);
  }

  const conversation = await findMyConversation(parsedConversationId, senderId);

  const newMessage = await sendMessage({
    conversationId: parsedConversationId,
    senderId,
    content: content.trim(),
    conversation,
  });

  res.status(201).json({
    success: true,
    message: newMessage,
  });
};

// Get all messages of a conversation
module.exports.getMessage = async (req, res) => {
  const conversationId = Number(req.params.conversationId);
  const userId = req.user.id;

  if (Number.isNaN(conversationId)) {
    throw new AppError("Invalid conversation ID", 400);
  }

  await findMyConversation(conversationId, userId);

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: { id: true, username: true, avatar: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  res.status(200).json({
    success: true,
    messages,
  });
};

// Mark the other person's messages as read
module.exports.markMessagesAsRead = async (req, res) => {
  const conversationId = Number(req.params.conversationId);
  const userId = req.user.id;

  if (Number.isNaN(conversationId)) {
    throw new AppError("Invalid conversation ID", 400);
  }

  await findMyConversation(conversationId, userId);

  const result = await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });

  res.status(200).json({
    success: true,
    message: "Messages marked as read",
    updatedCount: result.count,
  });
};