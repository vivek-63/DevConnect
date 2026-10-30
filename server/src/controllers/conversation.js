const prisma = require("../config/database");

// The user fields we send to the frontend
const userFields = {
  id: true,
  username: true,
  avatar: true,
};

// Pick the other person in a conversation
function getOtherUser(conversation, loggedInUserId) {
  if (conversation.user1.id === loggedInUserId) {
    return conversation.user2;
  }
  return conversation.user1;
}

// Start a conversation with a user (or return the existing one)
module.exports.createConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (receiverId == senderId) {
      return res.status(400).json({
        message: "You cannot start a conversation with yourself.",
      });
    }

    // Check if these two users already have a conversation
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: senderId },
        ],
      },
      include: {
        user1: { select: userFields },
        user2: { select: userFields },
      },
    });

    if (existingConversation) {
      return res.json({
        conversationId: existingConversation.id,
        otherUser: getOtherUser(existingConversation, senderId),
      });
    }

    // No conversation yet, so create one (smaller id is always user1)
    const user1Id = Math.min(senderId, receiverId);
    const user2Id = Math.max(senderId, receiverId);

    const newConversation = await prisma.conversation.create({
      data: { user1Id, user2Id },
      include: {
        user1: { select: userFields },
        user2: { select: userFields },
      },
    });

    return res.status(201).json({
      conversationId: newConversation.id,
      otherUser: getOtherUser(newConversation, senderId),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// Get all conversations of the logged in user
module.exports.getConversation = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { select: userFields },
        user2: { select: userFields },

        // Only the latest message, to show as a preview
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            isRead: true,
          },
        },

        // Count of unread messages sent by the other person
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formattedConversations = conversations.map((conversation) => ({
      conversationId: conversation.id,
      otherUser: getOtherUser(conversation, userId),
      lastMessage: conversation.messages[0] || null,
      unreadCount: conversation._count.messages,
      updatedAt: conversation.updatedAt,
    }));

    res.json(formattedConversations);
  } catch (err) { }
};

// Get all messages of a conversation
module.exports.getMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        conversationId: Number(conversationId),
      },
      include: {
        sender: { select: userFields },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};