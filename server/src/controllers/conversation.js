const prisma = require("../config/database");

module.exports.createConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;
    if (receiverId == senderId) {
      return res.status(400).json({
        message: "You cannot start a conversation with yourself.",
      });
    }
    function formatConversationResponse(conversation, loggedInUserId) {
      const otherUser =
        conversation.user1.id === loggedInUserId
          ? conversation.user2
          : conversation.user1;

      return {
        conversationId: conversation.id,
        otherUser,
      };
    }
    const conversationExist = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            user1Id: senderId,
            user2Id: receiverId,
          },
          {
            user1Id: receiverId,
            user2Id: senderId,
          },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
    if (conversationExist) {
      return res.json(formatConversationResponse(conversationExist, senderId));
    } else {
      const user1Id = Math.min(senderId, receiverId);
      const user2Id = Math.max(senderId, receiverId);
      const newConversation = await prisma.conversation.create({
        data: {
          user1Id,
          user2Id,
        },
        include: {
          user1: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          user2: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });
      return res
        .status(201)
        .json(formatConversationResponse(newConversation, senderId));
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports.getConversation = async (req, res) => {
  try {
   const conversations = await prisma.conversation.findMany({
  where: {
    OR: [
      {
        user1Id: req.user.id,
      },
      {
        user2Id: req.user.id,
      },
    ],
  },

  include: {
    user1: {
      select: {
        id: true,
        username: true,
        avatar: true,
      },
    },

    user2: {
      select: {
        id: true,
        username: true,
        avatar: true,
      },
    },

    messages: {
      orderBy: {
        createdAt: "desc",
      },
      take: 1,
      select: {
        id: true,
        content: true,
        senderId: true,
        createdAt: true,
        isRead: true,
      },
    },

    _count: {
      select: {
        messages: {
          where: {
            senderId: {
              not: req.user.id,
            },
            isRead: false,
          },
        },
      },
    },
  },

  orderBy: {
    updatedAt: "desc",
  },
});
    const getOtherUser = (conversation, loggedInUserId) => {
      return conversation.user1.id === loggedInUserId
        ? conversation.user2
        : conversation.user1;
    };
const formattedConversations = conversations.map((conversation) => ({
  conversationId: conversation.id,

  otherUser:
    conversation.user1.id === req.user.id
      ? conversation.user2
      : conversation.user1,

  lastMessage: conversation.messages[0] || null,

  unreadCount: conversation._count.messages,

  updatedAt: conversation.updatedAt,
}));

res.json(formattedConversations);
  } catch (err) {}
};


module.exports.getMessage = async(req, res) => {
  try{
    const {conversationId} = req.params;
   const messages = await prisma.message.findMany({
  where: {
    conversationId: Number(conversationId),
  },
  include: {
    sender: {
      select: {
        id: true,
        username: true,
        avatar: true,
      },
    },
  },
  orderBy: {
    createdAt: "asc",
  },
});
return res.json(messages);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}