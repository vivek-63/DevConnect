const prisma = require("../config/database");
const users = require("../socket/onlineUser");
const { getIO } = require("../socket/socketInstance");

const sendMessage = async ({ conversationId, senderId, content , conversation}) => {
  try {
    const newMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
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
    });
    await prisma.conversation.update({
    where: {
        id: conversationId
    },
    data: {
        updatedAt: new Date()
    }
});
    const receiverId =
      conversation.user1Id === senderId
        ? conversation.user2Id
        : conversation.user1Id;
    const receiverSocket = users[receiverId] || users[Number(receiverId)] || users[String(receiverId)];

    if (receiverSocket) {
      const io = getIO();

      io.to(receiverSocket).emit("newMessage",newMessage);
    }

    return newMessage;
  } catch (error) {
    console.error( error);
  }
};

module.exports = sendMessage;
