const prisma = require("../config/database");
const users = require("../socket/onlineUser");
const { getIO } = require("../socket/socketInstance");

const sendNotification = async ({
    receiverId,
    senderId,
    type,
    message
}) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                receiverId,
                senderId,
                type,
                message
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                }
            }
        });

        const receiverSocket = users[receiverId] || users[Number(receiverId)] || users[String(receiverId)];

        if (receiverSocket) {
            const io = getIO();

            io.to(receiverSocket).emit(
                "new_notification",
                notification
            );
        }

        return notification;

    } catch (error) {
        console.error("Notification Error:", error);
    }
};

module.exports = sendNotification;