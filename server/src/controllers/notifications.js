const prisma = require("../config/database");
const AppError = require("../utils/AppError");

// Get the latest 50 notifications and the unread count
module.exports.getNotifications = async (req, res) => {
  const userId = req.user.id;

  const notifications = await prisma.notification.findMany({
    where: { receiverId: userId },
    include: {
      sender: {
        select: { id: true, username: true, avatar: true, designation: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = await prisma.notification.count({
    where: { receiverId: userId, isRead: false },
  });

  return res.status(200).json({
    success: true,
    notifications,
    unreadCount,
  });
};

// Mark all notifications as read
module.exports.markAllAsRead = async (req, res) => {
  await prisma.notification.updateMany({
    where: { receiverId: req.user.id, isRead: false },
    data: { isRead: true },
  });

  return res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
};

// Mark one notification as read
module.exports.markAsRead = async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new AppError("Invalid notification ID", 400);
  }

  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  // Only the receiver can touch their own notification
  if (!notification || notification.receiverId !== req.user.id) {
    throw new AppError("Notification not found", 404);
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return res.status(200).json({
    success: true,
    notification: updated,
  });
};

// Delete one notification
module.exports.deleteNotification = async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new AppError("Invalid notification ID", 400);
  }

  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  // Only the receiver can touch their own notification
  if (!notification || notification.receiverId !== req.user.id) {
    throw new AppError("Notification not found", 404);
  }

  await prisma.notification.delete({
    where: { id },
  });

  return res.status(200).json({
    success: true,
    message: "Notification deleted",
  });
};