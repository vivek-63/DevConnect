const express = require("express");
const { isAuthmiddleware } = require("../middleware/auth");
const router = express.Router();
const messageController = require("../controllers/message");
const { messageLimiter } = require("../middleware/RateLimit");
const wrapAsync = require("../utils/wrapAsync");
const validate = require("../middleware/validate");
const { createMessageSchema } = require("../validators/messageValidator");

router.post("/message", isAuthmiddleware,messageLimiter,validate(createMessageSchema), wrapAsync(messageController.createMessage));
router.get("/conversation/:conversationId/messages", isAuthmiddleware, wrapAsync(messageController.getMessage));
router.patch("/conversation/:conversationId/read", isAuthmiddleware, wrapAsync(messageController.markMessagesAsRead));

module.exports = router;