const express = require("express");
const { isAuthmiddleware } = require("../middleware/auth");
const router = express.Router();
const notificationController = require("../controllers/notifications");
const wrapAsync = require("../utils/wrapAsync");

router.get("/notifications", isAuthmiddleware, wrapAsync(notificationController.getNotifications));
router.patch("/notifications/read", isAuthmiddleware, wrapAsync(notificationController.markAllAsRead));
router.patch("/notifications/:id/read", isAuthmiddleware, wrapAsync(notificationController.markAsRead));
router.delete("/notifications/:id", isAuthmiddleware, wrapAsync(notificationController.deleteNotification));

module.exports = router;
