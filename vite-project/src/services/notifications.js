import { api } from "./auth";

export const getNotifications = async () => {
  try {
    const res = await api.get("/notifications");
    return res.data;
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return { notifications: [], unreadCount: 0 };
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const res = await api.patch("/notifications/read");
    return res.data;
  } catch (err) {
    console.error("Error marking all read:", err);
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  } catch (err) {
    console.error("Error marking notification read:", err);
  }
};

export const deleteNotification = async (id) => {
  try {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error deleting notification:", err);
  }
};
