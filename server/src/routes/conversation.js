
const express = require("express");
const { isAuthmiddleware } = require("../middleware/auth");
const router = express.Router();
const conversationController = require("../controllers/conversation");

router.post("/conversation", isAuthmiddleware, conversationController.createConversation);
router.get("/conversation", isAuthmiddleware, conversationController.getConversation);
router.get("/message/:conversationId", isAuthmiddleware, conversationController.getMessage);

module.exports = router;